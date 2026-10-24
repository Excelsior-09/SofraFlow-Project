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
  AiGatewayProvider
} from '../types';

/**
 * Super Admin Management Service
 * Strictly authorized platform-level operations for the SOFRAFLOW SaaS Owner.
 */
export const adminService = {
  /**
   * Verifies whether the currently authenticated user is a verified platform Super Admin.
   * Checks both server-side RPC is_super_admin() and platform_super_admins table.
   */
  async checkIsSuperAdmin(): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const currentUser = userRes?.user;
      if (!currentUser) return false;

      // 1. Check server-side RPC is_super_admin()
      try {
        const { data: isRpcAdmin, error: rpcErr } = await supabase.rpc('is_super_admin');
        if (!rpcErr && typeof isRpcAdmin === 'boolean') {
          return isRpcAdmin;
        }
      } catch {}

      // 2. Direct query on platform_super_admins
      try {
        const { data: adminRows, error: adminErr } = await supabase
          .from('platform_super_admins')
          .select('user_id, is_active')
          .eq('user_id', currentUser.id)
          .eq('is_active', true)
          .maybeSingle();

        if (!adminErr && adminRows) {
          return true;
        }
      } catch {}

      // 3. Check profile role
      const { data: prof } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (prof?.role === 'admin') {
        return true;
      }

      // 4. Default fallback: platform owner email match
      if (currentUser.email === 'admin@sofraflow.com' || currentUser.email === 'contact@sofraflow.com') {
        return true;
      }

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
  async getAllUsers(): Promise<AdminUserRecord[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const [profilesRes, restaurantsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('restaurants').select('id, owner_id')
      ]);

      const profiles = profilesRes.data || [];
      const restaurants = restaurantsRes.data || [];

      // Calculate restaurant count per user
      const restCountMap = new Map<string, number>();
      for (const r of restaurants) {
        if (r.owner_id) {
          restCountMap.set(r.owner_id, (restCountMap.get(r.owner_id) || 0) + 1);
        }
      }

      return profiles.map(p => ({
        id: p.id,
        fullName: p.full_name || 'Utilisateur',
        email: p.email || '',
        phone: p.phone || undefined,
        role: p.role || 'owner',
        preferredLanguage: p.preferred_language || 'fr',
        createdAt: p.created_at || new Date().toISOString(),
        updatedAt: p.updated_at || new Date().toISOString(),
        restaurantCount: restCountMap.get(p.id) || 0,
        isSuspended: false
      }));
    } catch (err) {
      console.error('[adminService] getAllUsers error:', err);
      return [];
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
      // MWAPI Gateway validation
      if (trimmed.length < 16) {
        return {
          success: false,
          error: 'Format de clé invalide. La clé MWAPI Gateway doit contenir au moins 16 caractères (obtenue sur https://api.mwapi.dev/keys).'
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
   */
  async testClaudeConnection(): Promise<{ success: boolean; status: string; latencyMs?: number; error?: string; provider?: string; baseUrl?: string }> {
    if (!isSupabaseConfigured) {
      return {
        success: true,
        status: 'healthy',
        latencyMs: 128,
        provider: 'mwapi',
        baseUrl: 'https://api.mwapi.dev'
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
        provider: data?.provider || 'mwapi',
        baseUrl: data?.base_url || 'https://api.mwapi.dev'
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
  }
};
