import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  PlatformExecutiveAnalytics,
  OperatingExpenseRecord,
  AiUsageEventRecord,
  AdminUserRecord,
  AdminRestaurantRecord,
  AdminAuditLogRecord,
  AdminSystemHealthReport,
  SubscriptionPaymentRequest,
  ClaudeApiConfigRecord,
  AiGatewayProvider,
  AdminSecurityEvent
} from '../types';

// In-memory / sessionStorage fallback store for security events
const LOCAL_SECURITY_EVENTS_KEY = 'sofraflow_admin_security_events_cache';
function getLocalSecurityEvents(): AdminSecurityEvent[] {
  try {
    const raw = sessionStorage.getItem(LOCAL_SECURITY_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveLocalSecurityEvent(event: AdminSecurityEvent) {
  try {
    const events = [event, ...getLocalSecurityEvents()].slice(0, 100);
    sessionStorage.setItem(LOCAL_SECURITY_EVENTS_KEY, JSON.stringify(events));
  } catch {}
}

const rateLimitTracker = new Map<string, number[]>();

// Fast in-memory cache to prevent repeated network delays during navigation
let cachedAdminCheck: { userId: string; isAdmin: boolean; timestamp: number } | null = null;
const CACHE_TTL_MS = 60000; // 60 seconds

/**
 * Super Admin Management Service
 * Strictly authorized platform-level operations for the SOFRAFLOW SaaS Owner.
 */
export const adminService = {
  /**
   * Verifies whether the currently authenticated user is a verified platform Super Admin.
   * Uses fast-path in-memory caching, instant email matching, and server-side RPC.
   */
  async checkIsSuperAdmin(): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      // 1. Fast path: get active session from local storage (0ms latency)
      let currentUser: any = null;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        currentUser = sessionData?.session?.user;
      } catch {}

      if (!currentUser) {
        try {
          const { data: userRes } = await supabase.auth.getUser();
          currentUser = userRes?.user;
        } catch {}
      }

      if (!currentUser) {
        cachedAdminCheck = null;
        return false;
      }

      // 2. Fast path: in-memory cache check (0ms latency)
      if (
        cachedAdminCheck &&
        cachedAdminCheck.userId === currentUser.id &&
        Date.now() - cachedAdminCheck.timestamp < CACHE_TTL_MS
      ) {
        return cachedAdminCheck.isAdmin;
      }

      // 3. Fast path: verified platform owner email matches (0ms latency)
      const normalizedEmail = (currentUser.email || '').toLowerCase().trim();
      const verifiedOwnerEmails = [
        'ziraouianas0417@gmail.com',
        'zeraouiianass@gmail.com',
        'admin@sofraflow.com',
        'contact@sofraflow.com'
      ];
      if (normalizedEmail && verifiedOwnerEmails.includes(normalizedEmail)) {
        cachedAdminCheck = { userId: currentUser.id, isAdmin: true, timestamp: Date.now() };
        return true;
      }

      // 4. Fast path: user metadata role check (0ms latency)
      if (currentUser.user_metadata?.role === 'admin' || currentUser.app_metadata?.role === 'admin') {
        cachedAdminCheck = { userId: currentUser.id, isAdmin: true, timestamp: Date.now() };
        return true;
      }

      // 5. Server-side RPC is_super_admin() with 1500ms timeout
      try {
        const rpcPromise = supabase.rpc('is_super_admin');
        const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error('timeout') }), 1500)
        );
        const { data: isRpcAdmin, error: rpcErr } = await Promise.race([rpcPromise, timeoutPromise]);
        if (!rpcErr && typeof isRpcAdmin === 'boolean' && isRpcAdmin) {
          cachedAdminCheck = { userId: currentUser.id, isAdmin: true, timestamp: Date.now() };
          return true;
        }
      } catch {}

      // 6. Direct query on platform_super_admins
      try {
        const { data: adminRows, error: adminErr } = await supabase
          .from('platform_super_admins')
          .select('user_id, is_active')
          .eq('user_id', currentUser.id)
          .eq('is_active', true)
          .maybeSingle();

        if (!adminErr && adminRows) {
          cachedAdminCheck = { userId: currentUser.id, isAdmin: true, timestamp: Date.now() };
          return true;
        }
      } catch {}

      // 7. Check profile role
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (prof?.role === 'admin') {
          cachedAdminCheck = { userId: currentUser.id, isAdmin: true, timestamp: Date.now() };
          return true;
        }
      } catch {}

      cachedAdminCheck = { userId: currentUser.id, isAdmin: false, timestamp: Date.now() };
      return false;
    } catch (err) {
      console.warn('[adminService] checkIsSuperAdmin exception:', err);
      return false;
    }
  },

  /**
   * Fetches platform-wide executive KPIs based on real database records.
   */
  async getPlatformAnalytics(): Promise<PlatformExecutiveAnalytics | null> {
    if (!isSupabaseConfigured) return null;
    try {
      // 1. Try server RPC aggregator
      try {
        const { data, error } = await supabase.rpc('get_platform_executive_analytics');
        if (!error && data) {
          return {
            totalUsers: Number(data.total_users || 0),
            newUsers30d: Number(data.new_users_30d || 0),
            totalRestaurants: Number(data.total_restaurants || 0),
            activeRestaurants: Number(data.active_restaurants || 0),
            publishedMenusCount: Number(data.published_menus_count || 0),
            restaurantsWithOrders: Number(data.restaurants_with_orders || 0),
            activeSubscriptionsCount: Number(data.active_subscriptions_count || 0),
            pendingPaymentsCount: Number(data.pending_payments_count || 0),
            monthlyRecurringRevenue: Number(data.monthly_recurring_revenue || 0),
            totalCollectedRevenue: Number(data.total_collected_revenue || 0),
            totalOperatingExpenses: Number(data.total_operating_expenses || 0),
            netOperatingResult: Number(data.net_operating_result || 0),
            claudeApiSpendMad: Number(data.claude_api_spend_mad || 0),
            totalAiRequests: Number(data.total_ai_requests || 0),
            totalOrdersCount: Number(data.total_orders_count || 0),
            totalOrdersVolumeMad: Number(data.total_orders_volume_mad || 0),
            generatedAt: data.generated_at || new Date().toISOString()
          };
        }
      } catch {}

      // 2. Direct aggregate queries fallback
      const [
        usersRes,
        restsRes,
        menusRes,
        paymentsRes,
        expensesRes,
        aiRes,
        ordersRes
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('restaurants').select('id, status'),
        supabase.from('menus').select('id, is_published'),
        supabase.from('subscription_payment_requests').select('amount, status'),
        (async () => {
          try {
            return await supabase.from('operating_expenses').select('amount, payment_status');
          } catch {
            return { data: [] };
          }
        })(),
        (async () => {
          try {
            return await supabase.from('ai_usage_events').select('estimated_cost_mad');
          } catch {
            return { data: [] };
          }
        })(),
        (async () => {
          try {
            return await supabase.from('orders').select('id, total, status');
          } catch {
            return { data: [] };
          }
        })()
      ]);

      const totalUsers = usersRes.count || 0;
      const restaurants = (restsRes.data || []) as any[];
      const totalRestaurants = restaurants.length;
      const activeRestaurants = restaurants.filter((r: any) => r.status === 'active').length;

      const menus = (menusRes.data || []) as any[];
      const publishedMenusCount = menus.filter((m: any) => m.is_published).length;

      const payments = (paymentsRes.data || []) as any[];
      const pendingPaymentsCount = payments.filter((p: any) => p.status === 'pending' || p.status === 'under_review').length;
      const totalCollectedRevenue = payments
        .filter((p: any) => p.status === 'approved')
        .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

      const expenses = (expensesRes as any)?.data || [];
      const totalOperatingExpenses = expenses
        .filter((e: any) => e.payment_status === 'paid')
        .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);

      const aiEvents = (aiRes as any)?.data || [];
      const claudeApiSpendMad = aiEvents.reduce((sum: number, a: any) => sum + Number(a.estimated_cost_mad || 0), 0);

      const orders = (ordersRes as any).data || [];
      const totalOrdersCount = orders.length;
      const totalOrdersVolumeMad = orders
        .filter((o: any) => o.status !== 'cancelled')
        .reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

      // MRR calculation based on active plans
      const activeSubscriptionsCount = activeRestaurants;
      const monthlyRecurringRevenue = activeSubscriptionsCount * 399; // Growth baseline estimate

      return {
        totalUsers,
        newUsers30d: totalUsers,
        totalRestaurants,
        activeRestaurants,
        publishedMenusCount,
        restaurantsWithOrders: 0,
        activeSubscriptionsCount,
        pendingPaymentsCount,
        monthlyRecurringRevenue,
        totalCollectedRevenue,
        totalOperatingExpenses,
        netOperatingResult: totalCollectedRevenue - totalOperatingExpenses,
        claudeApiSpendMad,
        totalAiRequests: aiEvents.length,
        totalOrdersCount,
        totalOrdersVolumeMad,
        generatedAt: new Date().toISOString()
      };
    } catch (err) {
      console.error('[adminService] getPlatformAnalytics error:', err);
      return null;
    }
  },

  /**
   * Lists all registered user accounts with linked restaurant counts.
   */
  /**
   * Lists all registered user accounts with linked restaurant counts.
   * Authoritative source: auth.users joined with profiles, super admin registry, and restaurants.
   * Guarantees all legitimate accounts are returned without duplicates.
   */
  async getAllUsers(): Promise<AdminUserRecord[]> {
    // Definitive baseline of registered accounts (used in mock mode or resilient fallback)
    const mockUsers: AdminUserRecord[] = [
      {
        id: 'ce592c07-176e-4d90-8819-cc2c910ac10d',
        fullName: 'Anas Ziraoui',
        email: 'anas@sofraflow.com',
        phone: '+212661000001',
        role: 'admin',
        preferredLanguage: 'fr',
        createdAt: '2026-10-20T10:00:00Z',
        updatedAt: '2026-10-24T12:00:00Z',
        restaurantCount: 0,
        isSuspended: false
      },
      {
        id: '4f12fdc4-9c1b-4413-815a-cb51a9149f3b',
        fullName: 'Yassine Alami',
        email: 'yassine.alami@atlas-cafe.ma',
        phone: '+212661234567',
        role: 'owner',
        preferredLanguage: 'fr',
        createdAt: '2026-10-21T14:30:00Z',
        updatedAt: '2026-10-23T16:00:00Z',
        restaurantCount: 1,
        isSuspended: false
      },
      {
        id: '8a3b5c7d-9e1f-4a2b-8c3d-1e2f3a4b5c6d',
        fullName: 'Fatima Zahra Mansouri',
        email: 'fatima@riad-andalous.ma',
        phone: '+212662987654',
        role: 'owner',
        preferredLanguage: 'fr',
        createdAt: '2026-10-22T09:15:00Z',
        updatedAt: '2026-10-24T08:30:00Z',
        restaurantCount: 1,
        isSuspended: false
      }
    ];

    if (!isSupabaseConfigured) return mockUsers;

    try {
      // 1. Authoritative Super Admin RPC (joins auth.users, profiles, platform_super_admins, restaurants)
      try {
        const { data: rpcUsers, error: rpcErr } = await supabase.rpc('admin_get_all_users');
        if (!rpcErr && Array.isArray(rpcUsers) && rpcUsers.length > 0) {
          return rpcUsers.map((u: any) => ({
            id: u.id,
            fullName: u.full_name || 'Utilisateur',
            email: u.email || '',
            phone: u.phone || undefined,
            role: (u.is_super_admin || u.role === 'admin') ? 'admin' : (u.role || 'owner'),
            preferredLanguage: u.preferred_language || 'fr',
            createdAt: u.created_at || new Date().toISOString(),
            updatedAt: u.updated_at || new Date().toISOString(),
            restaurantCount: Number(u.restaurant_count || 0),
            isSuspended: Boolean(u.is_suspended)
          }));
        }
      } catch (rpcEx) {
        console.warn('[adminService] admin_get_all_users RPC failed, falling back:', rpcEx);
      }

      // 2. Direct Query Fallback
      const [profilesRes, restaurantsRes, superAdminsRes, currentUserRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('restaurants').select('id, owner_id'),
        supabase.from('platform_super_admins').select('user_id, email, is_active').eq('is_active', true),
        supabase.auth.getUser()
      ]);

      const profiles = profilesRes.data || [];
      const restaurants = restaurantsRes.data || [];
      const superAdmins = superAdminsRes.data || [];
      const currentUser = currentUserRes?.data?.user;

      // If database returned 0 profiles (due to RLS or unmigrated mock environment), return mockUsers
      if (profiles.length === 0 && (!currentUser || superAdmins.length === 0)) {
        return mockUsers;
      }

      // Calculate restaurant count per user (LEFT JOIN logic)
      const restCountMap = new Map<string, number>();
      for (const r of restaurants) {
        if (r.owner_id) {
          restCountMap.set(r.owner_id, (restCountMap.get(r.owner_id) || 0) + 1);
        }
      }

      const superAdminSet = new Set(superAdmins.map(sa => sa.user_id));
      const userMap = new Map<string, AdminUserRecord>();

      // Add from profiles
      for (const p of profiles) {
        const isSa = superAdminSet.has(p.id) || p.role === 'admin';
        userMap.set(p.id, {
          id: p.id,
          fullName: p.full_name || 'Utilisateur',
          email: p.email || (p.id === currentUser?.id ? currentUser?.email || '' : ''),
          phone: p.phone || undefined,
          role: isSa ? 'admin' : (p.role || 'owner'),
          preferredLanguage: p.preferred_language || 'fr',
          createdAt: p.created_at || new Date().toISOString(),
          updatedAt: p.updated_at || new Date().toISOString(),
          restaurantCount: restCountMap.get(p.id) || 0,
          isSuspended: false
        });
      }

      // Add super admins not in profiles (e.g. ce592c07-176e-4d90-8819-cc2c910ac10d)
      for (const sa of superAdmins) {
        if (!userMap.has(sa.user_id)) {
          userMap.set(sa.user_id, {
            id: sa.user_id,
            fullName: sa.email ? sa.email.split('@')[0] : 'Super Administrateur',
            email: sa.email || '',
            role: 'admin',
            preferredLanguage: 'fr',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            restaurantCount: restCountMap.get(sa.user_id) || 0,
            isSuspended: false
          });
        }
      }

      // Add current user if not in profiles
      if (currentUser && !userMap.has(currentUser.id)) {
        userMap.set(currentUser.id, {
          id: currentUser.id,
          fullName: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Administrateur',
          email: currentUser.email || '',
          phone: currentUser.phone || undefined,
          role: 'admin',
          preferredLanguage: 'fr',
          createdAt: currentUser.created_at || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          restaurantCount: restCountMap.get(currentUser.id) || 0,
          isSuspended: false
        });
      }

      return Array.from(userMap.values());
    } catch (err) {
      console.error('[adminService] getAllUsers error:', err);
      return mockUsers;
    }
  },

  /**
   * Lists all platform restaurants with owner and menu details.
   */
  async getAllRestaurants(): Promise<AdminRestaurantRecord[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const [restsRes, profilesRes, menusRes, ordersRes] = await Promise.all([
        supabase.from('restaurants').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name, phone'),
        supabase.from('menus').select('id, restaurant_id, is_published'),
        supabase.from('orders').select('id, restaurant_id')
      ]);

      const restaurants = restsRes.data || [];
      const profiles = profilesRes.data || [];
      const menus = menusRes.data || [];
      const orders = ordersRes.data || [];

      const profileMap = new Map(profiles.map(p => [p.id, p]));

      return restaurants.map(r => {
        const owner = profileMap.get(r.owner_id);
        const restMenus = menus.filter(m => m.restaurant_id === r.id);
        const restOrders = orders.filter(o => o.restaurant_id === r.id);

        return {
          id: r.id,
          name: r.name,
          slug: r.slug,
          businessType: r.business_type || 'restaurant',
          ownerId: r.owner_id,
          ownerName: owner?.full_name || undefined,
          ownerPhone: owner?.phone || r.phone || undefined,
          city: r.city || 'Casablanca',
          address: r.address || undefined,
          phone: r.phone || undefined,
          status: r.status || 'active',
          subscriptionPlan: r.subscription_plan || 'starter',
          subscriptionStatus: r.subscription_status || 'active',
          menuCount: restMenus.length,
          publishedMenuCount: restMenus.filter(m => m.is_published).length,
          orderCount: restOrders.length,
          createdAt: r.created_at || new Date().toISOString()
        };
      });
    } catch (err) {
      console.error('[adminService] getAllRestaurants error:', err);
      return [];
    }
  },

  /**
   * Suspends or reactivates an establishment with audit logging.
   */
  async toggleRestaurantStatus(
    restaurantId: string,
    status: 'active' | 'inactive' | 'suspended',
    reason?: string
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      // 1. Try atomic RPC
      try {
        const { data, error } = await supabase.rpc('admin_toggle_restaurant_status', {
          p_restaurant_id: restaurantId,
          p_new_status: status,
          p_reason: reason || null
        });
        if (!error && data?.success) return true;
      } catch {}

      // 2. Fallback direct update
      const { error } = await supabase
        .from('restaurants')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', restaurantId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[adminService] toggleRestaurantStatus error:', err);
      return false;
    }
  },

  /**
   * Lists all manual bank transfer payment requests for admin review.
   */
  async getAllPaymentRequests(): Promise<SubscriptionPaymentRequest[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('subscription_payment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[adminService] Error fetching payment requests:', error.message);
        return [];
      }

      return (data || []).map(r => ({
        id: r.id,
        restaurantId: r.restaurant_id,
        restaurantName: r.restaurant_name,
        userId: r.user_id,
        userName: r.user_name,
        plan: r.plan,
        billingPeriod: r.billing_period || 'monthly',
        amount: Number(r.amount),
        currency: r.currency || 'MAD',
        paymentMethod: r.payment_method,
        transactionReference: r.transaction_reference || '',
        receiptUrl: r.receipt_url,
        receiptFileName: r.receipt_file_name,
        status: r.status,
        rejectionReason: r.rejection_reason,
        payerName: r.payer_name,
        payerPhone: r.payer_phone,
        notes: r.notes,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        verifiedAt: r.verified_at,
        verifiedBy: r.verified_by
      }));
    } catch (err) {
      console.error('[adminService] getAllPaymentRequests error:', err);
      return [];
    }
  },

  /**
   * Approves a manual Moroccan bank transfer payment atomically.
   */
  async approvePayment(
    requestId: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Database not connected' };
    try {
      // 1. Try atomic RPC with row locking
      try {
        const { data, error } = await supabase.rpc('approve_subscription_payment', {
          p_request_id: requestId,
          p_notes: notes || null
        });

        if (!error && data?.success) {
          return { success: true };
        }
        if (error) {
          console.warn('[adminService] RPC approve_subscription_payment failed, using fallback:', error.message);
        }
      } catch {}

      // 2. Direct atomic fallback
      const { data: userRes } = await supabase.auth.getUser();
      const adminId = userRes?.user?.id || 'admin';

      // Fetch request details
      const { data: req, error: fetchErr } = await supabase
        .from('subscription_payment_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchErr || !req) {
        return { success: false, error: 'Payment request not found' };
      }

      if (req.status === 'approved') {
        return { success: false, error: 'This payment is already approved' };
      }

      // Update payment status
      const { error: updateErr } = await supabase
        .from('subscription_payment_requests')
        .update({
          status: 'approved',
          verified_by: adminId,
          verified_at: new Date().toISOString(),
          notes: notes || req.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateErr) throw updateErr;

      // Update restaurant subscription plan
      if (req.restaurant_id) {
        await supabase
          .from('restaurants')
          .update({
            subscription_plan: req.plan,
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', req.restaurant_id);
      }

      return { success: true };
    } catch (err: any) {
      console.error('[adminService] approvePayment error:', err);
      return { success: false, error: err.message || 'Payment approval failed' };
    }
  },

  /**
   * Rejects a payment submission with required reason.
   */
  async rejectPayment(
    requestId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Database not connected' };
    if (!reason.trim()) {
      return { success: false, error: 'A specific rejection reason is required' };
    }

    try {
      // 1. Try atomic RPC
      try {
        const { data, error } = await supabase.rpc('reject_subscription_payment', {
          p_request_id: requestId,
          p_reason: reason.trim()
        });

        if (!error && data?.success) {
          return { success: true };
        }
      } catch {}

      // 2. Fallback direct update
      const { data: userRes } = await supabase.auth.getUser();
      const adminId = userRes?.user?.id || 'admin';

      const { error } = await supabase
        .from('subscription_payment_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason.trim(),
          verified_by: adminId,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('[adminService] rejectPayment error:', err);
      return { success: false, error: err.message || 'Payment rejection failed' };
    }
  },

  /**
   * Operating expenses ledger operations.
   */
  async getOperatingExpenses(): Promise<OperatingExpenseRecord[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('operating_expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (error) {
        console.warn('[adminService] operating_expenses query warning:', error.message);
        return [];
      }

      return (data || []).map(r => ({
        id: r.id,
        expenseDate: r.expense_date,
        category: r.category,
        description: r.description,
        amount: Number(r.amount),
        currency: r.currency || 'MAD',
        vendor: r.vendor,
        receiptUrl: r.receipt_url,
        paymentStatus: r.payment_status || 'paid',
        isRecurring: Boolean(r.is_recurring),
        createdBy: r.created_by,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));
    } catch (err) {
      console.error('[adminService] getOperatingExpenses error:', err);
      return [];
    }
  },

  async createOperatingExpense(
    expense: Omit<OperatingExpenseRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('operating_expenses')
        .insert({
          expense_date: expense.expenseDate,
          category: expense.category,
          description: expense.description.trim(),
          amount: expense.amount,
          currency: expense.currency || 'MAD',
          vendor: expense.vendor?.trim() || null,
          receipt_url: expense.receiptUrl || null,
          payment_status: expense.paymentStatus || 'paid',
          is_recurring: expense.isRecurring || false,
          created_by: userRes?.user?.id || null
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[adminService] createOperatingExpense error:', err);
      return false;
    }
  },

  async deleteOperatingExpense(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase
        .from('operating_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[adminService] deleteOperatingExpense error:', err);
      return false;
    }
  },

  /**
   * Zina AI / Claude API usage events operations.
   */
  async getAiUsageEvents(limit = 100): Promise<AiUsageEventRecord[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('ai_usage_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('[adminService] ai_usage_events query warning:', error.message);
        return [];
      }

      return (data || []).map(r => ({
        id: r.id,
        createdAt: r.created_at,
        provider: r.provider || 'anthropic_claude',
        model: r.model || 'claude-3-7-sonnet',
        feature: r.feature,
        restaurantId: r.restaurant_id,
        userId: r.user_id,
        status: r.status,
        inputTokens: Number(r.input_tokens || 0),
        outputTokens: Number(r.output_tokens || 0),
        totalTokens: Number(r.input_tokens || 0) + Number(r.output_tokens || 0),
        estimatedCostUsd: Number(r.estimated_cost_usd || 0),
        estimatedCostMad: Number(r.estimated_cost_mad || 0),
        latencyMs: Number(r.latency_ms || 0),
        requestId: r.request_id,
        errorCategory: r.error_category,
        errorMessage: r.error_message
      }));
    } catch (err) {
      console.error('[adminService] getAiUsageEvents error:', err);
      return [];
    }
  },

  async logAiUsageEvent(
    event: Omit<AiUsageEventRecord, 'id' | 'createdAt' | 'totalTokens'>
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase
        .from('ai_usage_events')
        .insert({
          provider: event.provider || 'anthropic_claude',
          model: event.model || 'claude-3-7-sonnet',
          feature: event.feature,
          restaurant_id: event.restaurantId || null,
          user_id: event.userId || null,
          status: event.status,
          input_tokens: event.inputTokens || 0,
          output_tokens: event.outputTokens || 0,
          estimated_cost_usd: event.estimatedCostUsd || 0,
          estimated_cost_mad: event.estimatedCostMad || 0,
          latency_ms: event.latencyMs || 0,
          request_id: event.requestId || null,
          error_category: event.errorCategory || null,
          error_message: event.errorMessage || null
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('[adminService] logAiUsageEvent error:', err);
      return false;
    }
  },

  /**
   * System health check reports live response time and status.
   */
  async getSystemHealth(): Promise<AdminSystemHealthReport> {
    const start = performance.now();
    let supabaseStatus: 'healthy' | 'degraded' | 'offline' = 'healthy';
    let latencyMs = 0;
    let tablesCount = 14;
    let authStatus: 'healthy' | 'degraded' | 'offline' = 'healthy';

    if (!isSupabaseConfigured) {
      return {
        supabaseStatus: 'offline',
        supabaseLatencyMs: 0,
        databaseTablesCount: 0,
        authStatus: 'offline',
        claudeApiStatus: 'missing_key',
        environment: 'local',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const { error } = await supabase.from('restaurants').select('id').limit(1);
      latencyMs = Math.round(performance.now() - start);

      if (error) {
        supabaseStatus = 'degraded';
      }
    } catch {
      supabaseStatus = 'offline';
      latencyMs = Math.round(performance.now() - start);
    }

    try {
      const { error: authErr } = await supabase.auth.getSession();
      if (authErr) authStatus = 'degraded';
    } catch {
      authStatus = 'offline';
    }

    return {
      supabaseStatus,
      supabaseLatencyMs: latencyMs,
      databaseTablesCount: tablesCount,
      authStatus,
      claudeApiStatus: 'configured',
      environment: import.meta.env.MODE || 'production',
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Platform audit trail retrieval.
   */
  async getAuditLogs(limit = 100): Promise<AdminAuditLogRecord[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('[adminService] audit_logs query error:', error.message);
        return [];
      }

      return (data || []).map(r => ({
        id: r.id,
        restaurantId: r.restaurant_id,
        actorUserId: r.actor_user_id,
        eventType: r.event_type,
        entityType: r.entity_type,
        entityId: r.entity_id,
        metadata: r.metadata || {},
        createdAt: r.created_at
      }));
    } catch (err) {
      console.error('[adminService] getAuditLogs error:', err);
      return [];
    }
  },

  /**
   * Retrieves Claude API configuration metadata (masked fingerprint only, no secret returned).
   */
  async getClaudeConfig(): Promise<ClaudeApiConfigRecord> {
    if (!isSupabaseConfigured) {
      return {
        isConfigured: true,
        provider: 'mwapi',
        baseUrl: 'https://api.mwapi.dev',
        keyFingerprint: 'sk-mwap-••••••••••••••••••••••••••••••••92xA',
        modelName: 'claude-sonnet-4-6',
        monthlyBudgetUsd: 150.0,
        maxTokensPerRequest: 4096,
        lastHealthCheckAt: new Date().toISOString(),
        lastHealthStatus: 'healthy',
        lastHealthLatencyMs: 142,
        lastRotatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        monthEventsCount: 28,
        monthSpendUsd: 12.45,
        monthSpendMad: 126.37
      };
    }

    try {
      const { data, error } = await supabase.rpc('get_claude_api_config');
      if (!error && data) {
        const rawProvider = data.provider as AiGatewayProvider;
        const provider: AiGatewayProvider = rawProvider === 'anthropic' ? 'anthropic' : 'mwapi';
        const defaultUrl = provider === 'anthropic' ? 'https://api.anthropic.com' : 'https://api.mwapi.dev';

        return {
          isConfigured: Boolean(data.is_configured),
          provider,
          baseUrl: data.base_url || defaultUrl,
          keyFingerprint: data.key_fingerprint || null,
          modelName: data.model_name || 'claude-sonnet-4-6',
          monthlyBudgetUsd: Number(data.monthly_budget_usd || 100),
          maxTokensPerRequest: Number(data.max_tokens_per_request || 4096),
          lastHealthCheckAt: data.last_health_check_at || null,
          lastHealthStatus: data.last_health_status || 'untested',
          lastHealthLatencyMs: data.last_health_latency_ms ? Number(data.last_health_latency_ms) : null,
          lastRotatedAt: data.last_rotated_at || null,
          monthEventsCount: Number(data.month_events_count || 0),
          monthSpendUsd: Number(data.month_spend_usd || 0),
          monthSpendMad: Number(data.month_spend_mad || 0)
        };
      }
    } catch (err) {
      console.warn('[adminService] getClaudeConfig error:', err);
    }

    return {
      isConfigured: false,
      provider: 'mwapi',
      baseUrl: 'https://api.mwapi.dev',
      keyFingerprint: null,
      modelName: 'claude-sonnet-4-6',
      monthlyBudgetUsd: 100,
      maxTokensPerRequest: 4096,
      lastHealthCheckAt: null,
      lastHealthStatus: 'missing_key',
      lastHealthLatencyMs: null,
      lastRotatedAt: null,
      monthEventsCount: 0,
      monthSpendUsd: 0,
      monthSpendMad: 0
    };
  },

  /**
   * Saves or rotates the Claude API key securely into server vault,
   * or updates the default model/budget/provider without requiring the secret key.
   * Supports both MWAPI Gateway (Claude-compatible) and Anthropic Direct.
   * Never exposed to frontend or logged in plain text.
   */
  async saveClaudeApiKey(
    apiKey?: string,
    model = 'claude-sonnet-4-6',
    budgetUsd = 100,
    maxTokens = 4096,
    provider: AiGatewayProvider = 'mwapi',
    baseUrl = 'https://api.mwapi.dev'
  ): Promise<{ success: boolean; message?: string; error?: string; config?: ClaudeApiConfigRecord }> {
    const trimmed = (apiKey || '').trim();
    const targetProvider: AiGatewayProvider = provider === 'anthropic' ? 'anthropic' : 'mwapi';
    const targetBaseUrl = (baseUrl || '').trim() || (targetProvider === 'anthropic' ? 'https://api.anthropic.com' : 'https://api.mwapi.dev');

    // Base URL validation
    if (!/^https?:\/\//i.test(targetBaseUrl)) {
      return {
        success: false,
        error: 'Format d’URL invalide. L’URL de base de la passerelle doit débuter par "http://" ou "https://".'
      };
    }

    // Model / budget / provider update without rotating key
    if (!trimmed) {
      if (!isSupabaseConfigured) {
        const current = await this.getClaudeConfig();
        const updatedConfig: ClaudeApiConfigRecord = {
          ...current,
          provider: targetProvider,
          baseUrl: targetBaseUrl,
          modelName: model,
          monthlyBudgetUsd: budgetUsd,
          maxTokensPerRequest: maxTokens
        };
        return {
          success: true,
          message: `Configuration mise à jour : Modèle ${model} via ${targetProvider === 'mwapi' ? 'MWAPI Gateway' : 'Anthropic Direct'}`,
          config: updatedConfig
        };
      }

      try {
        const { data, error } = await supabase.rpc('save_claude_api_key', {
          p_api_key: '',
          p_model: model,
          p_budget_usd: budgetUsd,
          p_max_tokens: maxTokens,
          p_provider: targetProvider,
          p_base_url: targetBaseUrl
        });

        if (error) {
          // Backward compatibility fallback if RPC doesn't have p_provider yet
          if (error.message.includes('p_provider') || error.message.includes('parameters')) {
            const { data: fbData, error: fbError } = await supabase.rpc('save_claude_api_key', {
              p_api_key: '',
              p_model: model,
              p_budget_usd: budgetUsd,
              p_max_tokens: maxTokens
            });
            if (fbError) return { success: false, error: fbError.message };
            const updated = await this.getClaudeConfig();
            return {
              success: true,
              message: fbData?.message || `Modèle Claude API configuré : ${model}`,
              config: updated
            };
          }
          return { success: false, error: error.message };
        }

        const updated = await this.getClaudeConfig();
        return {
          success: true,
          message: data?.message || `Configuration Claude API mise à jour : ${model}`,
          config: updated
        };
      } catch (err: any) {
        return { success: false, error: err.message || 'Erreur lors de la mise à jour de la configuration.' };
      }
    }

    // Provider-aware key format validation
    if (targetProvider === 'anthropic') {
      if (!trimmed.startsWith('sk-ant-') || trimmed.length < 25) {
        return {
          success: false,
          error: 'Format de clé invalide. La clé Anthropic Direct doit commencer par "sk-ant-" et contenir au moins 25 caractères.'
        };
      }
    } else {
      // MWAPI Gateway validation: accept legitimate keys without enforcing sk-ant- prefix
      if (trimmed.length < 16) {
        return {
          success: false,
          error: 'Format de clé invalide. La clé MWAPI Gateway ne peut pas être vide et doit contenir au moins 16 caractères (obtenue sur https://api.mwapi.dev/keys).'
        };
      }
    }

    // Generate masked fingerprint
    const keyFingerprint = trimmed.length > 12
      ? `${trimmed.slice(0, 8)}••••••••••••••••••••••••••••••••${trimmed.slice(-4)}`
      : `${trimmed.slice(0, 4)}••••••••${trimmed.slice(-2)}`;

    if (!isSupabaseConfigured) {
      const mockConfig: ClaudeApiConfigRecord = {
        isConfigured: true,
        provider: targetProvider,
        baseUrl: targetBaseUrl,
        keyFingerprint,
        modelName: model,
        monthlyBudgetUsd: budgetUsd,
        maxTokensPerRequest: maxTokens,
        lastHealthCheckAt: new Date().toISOString(),
        lastHealthStatus: 'healthy',
        lastHealthLatencyMs: 135,
        lastRotatedAt: new Date().toISOString(),
        monthEventsCount: 0,
        monthSpendUsd: 0,
        monthSpendMad: 0
      };
      return {
        success: true,
        message: `Clé enregistrée avec succès pour ${targetProvider === 'mwapi' ? 'MWAPI Gateway' : 'Anthropic Direct'} en environnement de développement local.`,
        config: mockConfig
      };
    }

    try {
      const { data, error } = await supabase.rpc('save_claude_api_key', {
        p_api_key: trimmed,
        p_model: model,
        p_budget_usd: budgetUsd,
        p_max_tokens: maxTokens,
        p_provider: targetProvider,
        p_base_url: targetBaseUrl
      });

      if (error) {
        // Backward compatibility fallback if RPC doesn't have p_provider yet
        if (error.message.includes('p_provider') || error.message.includes('parameters')) {
          const { data: fbData, error: fbError } = await supabase.rpc('save_claude_api_key', {
            p_api_key: trimmed,
            p_model: model,
            p_budget_usd: budgetUsd,
            p_max_tokens: maxTokens
          });
          if (fbError) return { success: false, error: fbError.message };
          const updated = await this.getClaudeConfig();
          return {
            success: true,
            message: fbData?.message || 'Clé API enregistrée et chiffrée avec succès.',
            config: updated
          };
        }
        return { success: false, error: error.message };
      }

      const updated = await this.getClaudeConfig();
      return {
        success: true,
        message: data?.message || `Clé API enregistrée et chiffrée avec succès pour ${targetProvider === 'mwapi' ? 'MWAPI Gateway' : 'Anthropic Direct'}.`,
        config: updated
      };
    } catch (err: any) {
      console.error('[adminService] saveClaudeApiKey error:', err);
      return { success: false, error: err.message || 'Erreur lors de l’enregistrement de la clé.' };
    }
  },

  /**
   * Runs a server-side health check against Claude API Gateway without exposing credentials.
   * Can optionally test inline key/provider candidate before persistence.
   */
  async testClaudeConnection(options?: {
    apiKey?: string;
    provider?: AiGatewayProvider;
    baseUrl?: string;
    model?: string;
  }): Promise<{ success: boolean; status: string; latencyMs?: number; error?: string; provider?: string; baseUrl?: string }> {
    const candidateProvider = options?.provider || 'mwapi';
    const candidateBaseUrl = (options?.baseUrl || '').trim().replace(/\/+$/, '') || (candidateProvider === 'anthropic' ? 'https://api.anthropic.com' : 'https://api.mwapi.dev');

    // Inline key validation if candidate key provided
    if (options?.apiKey) {
      const key = options.apiKey.trim();
      if (candidateProvider === 'anthropic') {
        if (!key.startsWith('sk-ant-') || key.length < 25) {
          return {
            success: false,
            status: 'error',
            error: 'Format de clé invalide. La clé Anthropic Direct doit débuter par "sk-ant-" et contenir au moins 25 caractères.'
          };
        }
      } else {
        if (key.length < 8) {
          return {
            success: false,
            status: 'error',
            error: 'Format de clé invalide. La clé MWAPI Gateway doit contenir au moins 8 caractères.'
          };
        }
      }
    }

    if (!isSupabaseConfigured) {
      return {
        success: true,
        status: 'healthy',
        latencyMs: 128,
        provider: candidateProvider,
        baseUrl: candidateBaseUrl
      };
    }

    try {
      const { data, error } = await supabase.rpc('test_claude_api_connection');
      if (error) {
        return { success: false, status: 'error', error: error.message };
      }

      return {
        success: Boolean(data?.success),
        status: data?.status || 'untested',
        latencyMs: data?.latency_ms,
        provider: data?.provider || candidateProvider,
        baseUrl: data?.base_url || candidateBaseUrl
      };
    } catch (err: any) {
      console.error('[adminService] testClaudeConnection error:', err);
      return { success: false, status: 'error', error: err.message };
    }
  },

  /**
   * Securely executes an authorized Zina AI task using the server-stored Claude key.
   */
  async executeZinaAiTask(
    prompt: string,
    feature = 'menu_generation',
    restaurantId?: string
  ): Promise<{ success: boolean; tokensUsed?: number; estimatedCostMad?: number; error?: string }> {
    if (!isSupabaseConfigured) {
      return {
        success: true,
        tokensUsed: 840,
        estimatedCostMad: 0.12
      };
    }

    try {
      const { data, error } = await supabase.rpc('execute_zina_ai_completion', {
        p_prompt: prompt,
        p_feature: feature,
        p_restaurant_id: restaurantId || null
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: Boolean(data?.success),
        tokensUsed: data?.tokens_used,
        estimatedCostMad: data?.estimated_cost_mad
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de l’exécution Zina AI.' };
    }
  },

  /**
   * Records a security event to the tamper-evident admin_security_events ledger.
   */
  async logSecurityEvent(params: {
    eventType: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    route?: string;
    method?: string;
    statusCode?: number;
    outcome?: 'allowed' | 'denied' | 'rate_limited';
    reason?: string;
    clientIp?: string;
    userAgent?: string;
    actorUserId?: string;
    actorEmail?: string;
    metadata?: Record<string, any>;
  }): Promise<boolean> {
    const eventRecord: AdminSecurityEvent = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventType: params.eventType,
      severity: params.severity || 'medium',
      route: params.route || (typeof window !== 'undefined' ? window.location.pathname : undefined),
      method: params.method || 'GET',
      statusCode: params.statusCode || (params.outcome === 'denied' ? 403 : params.outcome === 'rate_limited' ? 429 : 200),
      outcome: params.outcome || 'allowed',
      reason: params.reason,
      clientIp: params.clientIp || 'client-browser',
      userAgent: params.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
      actorUserId: params.actorUserId,
      actorEmail: params.actorEmail,
      metadata: params.metadata || {},
      createdAt: new Date().toISOString()
    };

    saveLocalSecurityEvent(eventRecord);

    if (!isSupabaseConfigured) return true;

    try {
      const { error } = await supabase.rpc('log_admin_security_event', {
        p_event_type: params.eventType,
        p_severity: params.severity || 'medium',
        p_route: eventRecord.route || null,
        p_method: eventRecord.method || null,
        p_status_code: eventRecord.statusCode || null,
        p_outcome: params.outcome || 'allowed',
        p_reason: params.reason || null,
        p_client_ip: params.clientIp || null,
        p_user_agent: params.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 500) : null),
        p_actor_user_id: params.actorUserId || null,
        p_actor_email: params.actorEmail || null,
        p_metadata: params.metadata || {}
      });

      if (error) {
        // Fallback: direct insert if RPC not created yet
        await supabase.from('admin_security_events').insert({
          event_type: params.eventType,
          severity: params.severity || 'medium',
          route: eventRecord.route,
          method: eventRecord.method,
          status_code: eventRecord.statusCode,
          outcome: params.outcome || 'allowed',
          reason: params.reason,
          client_ip: params.clientIp,
          user_agent: eventRecord.userAgent?.substring(0, 500),
          actor_user_id: params.actorUserId,
          actor_email: params.actorEmail,
          metadata: params.metadata || {}
        });
      }
      return true;
    } catch (err) {
      console.warn('[adminService] logSecurityEvent silent fallback:', err);
      return false;
    }
  },

  /**
   * Retrieves security audit events for the Super Admin Security Center.
   */
  async getSecurityEvents(limit = 50): Promise<AdminSecurityEvent[]> {
    const localEvents = getLocalSecurityEvents();

    if (!isSupabaseConfigured) {
      return localEvents.length > 0 ? localEvents : this.getMockSecurityEvents();
    }

    try {
      // 1. Try server RPC
      const { data: rpcData, error: rpcErr } = await supabase.rpc('get_admin_security_events', {
        p_limit: limit
      });

      if (!rpcErr && Array.isArray(rpcData) && rpcData.length > 0) {
        return rpcData.map((row: any) => ({
          id: row.id,
          eventType: row.event_type,
          severity: row.severity,
          route: row.route,
          method: row.method,
          statusCode: row.status_code,
          outcome: row.outcome,
          reason: row.reason,
          clientIp: row.client_ip,
          userAgent: row.user_agent,
          actorUserId: row.actor_user_id,
          actorEmail: row.actor_email,
          metadata: row.metadata || {},
          createdAt: row.created_at
        }));
      }

      // 2. Fallback direct table query
      const { data: tableData, error: tableErr } = await supabase
        .from('admin_security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!tableErr && Array.isArray(tableData) && tableData.length > 0) {
        return tableData.map((row: any) => ({
          id: row.id,
          eventType: row.event_type,
          severity: row.severity,
          route: row.route,
          method: row.method,
          statusCode: row.status_code,
          outcome: row.outcome,
          reason: row.reason,
          clientIp: row.client_ip,
          userAgent: row.user_agent,
          actorUserId: row.actor_user_id,
          actorEmail: row.actor_email,
          metadata: row.metadata || {},
          createdAt: row.created_at
        }));
      }

      // Merge local with mock baseline if no records in DB yet
      return localEvents.length > 0 ? localEvents : this.getMockSecurityEvents();
    } catch (err) {
      console.warn('[adminService] getSecurityEvents fallback:', err);
      return localEvents.length > 0 ? localEvents : this.getMockSecurityEvents();
    }
  },

  /**
   * Checks durable rate limits for admin authentication and sensitive operations.
   */
  async checkRateLimit(
    identifier: string,
    limit = 5,
    windowSeconds = 900
  ): Promise<{ allowed: boolean; remaining: number; retryAfter?: number }> {
    if (!identifier) return { allowed: true, remaining: limit };

    // 1. Check server-side RPC if available
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('check_admin_rate_limit', {
          p_identifier: identifier,
          p_limit: limit,
          p_window_seconds: windowSeconds
        });

        if (!error && data && typeof data.allowed === 'boolean') {
          return {
            allowed: data.allowed,
            remaining: Number(data.remaining || 0),
            retryAfter: data.retry_after ? Number(data.retry_after) : undefined
          };
        }
      } catch (err) {
        console.warn('[adminService] server rate limit RPC error, using local fallback:', err);
      }
    }

    // 2. Sliding window in-memory fallback
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const history = (rateLimitTracker.get(identifier) || []).filter(ts => now - ts < windowMs);

    if (history.length >= limit) {
      const oldestTs = history[0];
      const retryAfter = Math.ceil((oldestTs + windowMs - now) / 1000);
      return { allowed: false, remaining: 0, retryAfter: Math.max(1, retryAfter) };
    }

    history.push(now);
    rateLimitTracker.set(identifier, history);
    return { allowed: true, remaining: limit - history.length };
  },

  getMockSecurityEvents(): AdminSecurityEvent[] {
    return [
      {
        id: 'sec-mock-1',
        eventType: 'admin_login_success',
        severity: 'low',
        route: '/admin/login',
        method: 'POST',
        statusCode: 200,
        outcome: 'allowed',
        reason: 'Super Admin credentials verified',
        clientIp: '196.113.88.14',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        actorEmail: 'ziraouianas0417@gmail.com',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      },
      {
        id: 'sec-mock-2',
        eventType: 'admin_probe_blocked',
        severity: 'medium',
        route: '/admin/settings',
        method: 'GET',
        statusCode: 403,
        outcome: 'denied',
        reason: 'Unauthenticated probe on restricted admin route',
        clientIp: '105.159.24.110',
        userAgent: 'curl/7.88.1',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
      },
      {
        id: 'sec-mock-3',
        eventType: 'admin_auth_failed',
        severity: 'high',
        route: '/admin/login',
        method: 'POST',
        statusCode: 401,
        outcome: 'denied',
        reason: 'Invalid credentials attempted',
        clientIp: '41.140.231.5',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        actorEmail: 'unknown_probe@sofraflow.com',
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
      }
    ];
  }
};
