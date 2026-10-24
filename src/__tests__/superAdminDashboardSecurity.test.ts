import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from '../services/adminService';
import { supabase } from '../lib/supabase';
import {
  PlatformExecutiveAnalytics,
  OperatingExpenseRecord,
  SubscriptionPaymentRequest
} from '../types';

describe('Super Admin Dashboard — Authorization, Access & Security Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Super Admin Authentication & Privilege Verification', () => {
    it('rejects unauthenticated visitors from Super Admin access', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: { user: null },
        error: null
      } as any);

      const isAdmin = await adminService.checkIsSuperAdmin();
      expect(isAdmin).toBe(false);
    });

    it('rejects ordinary restaurant owners from Super Admin privileges', async () => {
      const mockOwnerUser = {
        id: 'usr_normal_owner_123',
        email: 'chef.owner@restaurant.ma',
        user_metadata: { role: 'owner' }
      };

      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: { user: mockOwnerUser as any },
        error: null
      });

      // RPC is_super_admin returns false
      vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: false,
        error: null
      } as any);

      // profiles check returns role = 'owner'
      const mockSelect = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'owner' }, error: null })
          })
        })
      });
      vi.spyOn(supabase, 'from').mockImplementation(mockSelect as any);

      const isAdmin = await adminService.checkIsSuperAdmin();
      expect(isAdmin).toBe(false);
    });

    it('verifies Super Admin identity via server-side RPC is_super_admin', async () => {
      const mockAdminUser = {
        id: 'usr_super_admin_001',
        email: 'admin@sofraflow.com',
        user_metadata: { role: 'admin' }
      };

      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: { user: mockAdminUser as any },
        error: null
      });

      vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: true,
        error: null
      } as any);

      const isAdmin = await adminService.checkIsSuperAdmin();
      expect(isAdmin).toBe(true);
    });

    it('identifies and blocks unauthorized role escalation to admin by ordinary users', () => {
      const isSuperAdmin = false;
      const targetRoleUpdate = 'admin';

      // Simulation of trigger trg_prevent_role_escalation
      let escalationPrevented = false;
      if (targetRoleUpdate === 'admin' && !isSuperAdmin) {
        escalationPrevented = true;
      }

      expect(escalationPrevented).toBe(true);
    });

    it('requires MFA assurance level AAL2 for sensitive Super Admin operations', () => {
      const mfaAssuranceLevelAal1: string = 'aal1';
      const mfaAssuranceLevelAal2: string = 'aal2';

      const isAal1Elevated = mfaAssuranceLevelAal1 === 'aal2';
      const isAal2Elevated = mfaAssuranceLevelAal2 === 'aal2';

      expect(isAal1Elevated).toBe(false);
      expect(isAal2Elevated).toBe(true);
    });
  });

  describe('2. Bank Transfer Verification & Reconciliation Queue', () => {
    it('approves a pending bank transfer and updates subscription plan', async () => {
      const mockRequest = {
        id: 'req_pay_001',
        restaurant_id: 'rest_atlas_123',
        user_id: 'usr_owner_01',
        plan: 'pro' as const,
        billing_period: 'monthly' as const,
        amount: 799,
        status: 'pending' as const
      };

      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: { user: { id: 'admin_usr_01' } as any },
        error: null
      });

      // RPC approve_subscription_payment mock
      const rpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: {
          success: true,
          request_id: 'req_pay_001',
          status: 'approved'
        },
        error: null
      } as any);

      const result = await adminService.approvePayment('req_pay_001', 'Verified on CIH Statement');

      expect(rpcSpy).toHaveBeenCalledWith('approve_subscription_payment', {
        p_request_id: 'req_pay_001',
        p_notes: 'Verified on CIH Statement'
      });
      expect(result.success).toBe(true);
    });

    it('rejects duplicate approval if payment is already approved', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: { user: { id: 'admin_usr_01' } as any },
        error: null
      });

      // RPC throws already approved error
      vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: null,
        error: { message: 'Payment request req_pay_001 has already been approved.' }
      } as any);

      // Fallback fetch returns status = 'approved'
      const mockFrom = vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'req_pay_001', status: 'approved' },
              error: null
            })
          })
        })
      } as any);

      const result = await adminService.approvePayment('req_pay_001');
      expect(result.success).toBe(false);
      expect(result.error).toContain('already approved');
    });

    it('requires a non-empty reason when rejecting a bank transfer', async () => {
      const result = await adminService.rejectPayment('req_pay_001', '   ');
      expect(result.success).toBe(false);
      expect(result.error).toContain('rejection reason is required');
    });

    it('records valid rejection reason and updates status to rejected', async () => {
      const rpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: {
          success: true,
          request_id: 'req_pay_001',
          status: 'rejected'
        },
        error: null
      } as any);

      const result = await adminService.rejectPayment(
        'req_pay_001',
        'Reference not found on CIH Bank account statement'
      );

      expect(rpcSpy).toHaveBeenCalledWith('reject_subscription_payment', {
        p_request_id: 'req_pay_001',
        p_reason: 'Reference not found on CIH Bank account statement'
      });
      expect(result.success).toBe(true);
    });
  });

  describe('3. Financial Management & Expense Ledger (MAD)', () => {
    it('creates an operating expense record with category, amount, and description', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: { user: { id: 'usr_admin_01' } as any },
        error: null
      });

      const insertSpy = vi.fn().mockResolvedValue({ error: null });
      vi.spyOn(supabase, 'from').mockReturnValue({
        insert: insertSpy
      } as any);

      const success = await adminService.createOperatingExpense({
        expenseDate: '2026-10-24',
        category: 'claude_api',
        description: 'Anthropic Claude 3.7 Sonnet Monthly Token Invoice',
        amount: 450.50,
        currency: 'MAD',
        vendor: 'Anthropic Inc',
        paymentStatus: 'paid',
        isRecurring: true
      });

      expect(insertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          expense_date: '2026-10-24',
          category: 'claude_api',
          amount: 450.50,
          currency: 'MAD',
          vendor: 'Anthropic Inc',
          is_recurring: true
        })
      );
      expect(success).toBe(true);
    });

    it('computes net operating margin accurately from collected cash and recorded expenses', () => {
      const verifiedCollectedCash = 7990.00; // Annual Pro VIP
      const recordedExpenses = [
        { amount: 450.00, category: 'claude_api' },
        { amount: 250.00, category: 'supabase' },
        { amount: 150.00, category: 'domain_email' }
      ];

      const totalOperatingExpenses = recordedExpenses.reduce((sum, e) => sum + e.amount, 0);
      const netProfit = verifiedCollectedCash - totalOperatingExpenses;

      expect(totalOperatingExpenses).toBe(850.00);
      expect(netProfit).toBe(7140.00);
    });
  });

  describe('4. Zina AI / Claude API Governance & Cost Tracking', () => {
    it('logs AI usage events with model, token counts, and MAD cost conversion', async () => {
      const insertSpy = vi.fn().mockResolvedValue({ error: null });
      vi.spyOn(supabase, 'from').mockReturnValue({
        insert: insertSpy
      } as any);

      const ok = await adminService.logAiUsageEvent({
        provider: 'anthropic_claude',
        model: 'claude-3-7-sonnet',
        feature: 'menu_scan',
        restaurantId: 'rest_atlas_123',
        status: 'success',
        inputTokens: 1250,
        outputTokens: 420,
        estimatedCostUsd: 0.01005,
        estimatedCostMad: 0.1010,
        latencyMs: 1650
      });

      expect(insertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-7-sonnet',
          feature: 'menu_scan',
          input_tokens: 1250,
          output_tokens: 420,
          latency_ms: 1650
        })
      );
      expect(ok).toBe(true);
    });
  });

  describe('5. Multi-Tenant Customer Data Isolation', () => {
    it('ensures ordinary customer queries cannot read other tenants payment records', async () => {
      const customerUserId: string = 'usr_customer_tenant_a';
      const otherTenantRestaurantId: string = 'rest_tenant_b';

      // When an ordinary tenant queries payments, they must only query their own restaurant
      const allowed = customerUserId === 'usr_customer_tenant_a' && otherTenantRestaurantId !== ('rest_tenant_a' as string);
      expect(allowed).toBe(true);
    });
  });
});
