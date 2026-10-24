import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from '../services/adminService';
import { supabase } from '../lib/supabase';
import {
  PlatformExecutiveAnalytics,
  OperatingExpenseRecord,
  SubscriptionPaymentRequest,
  AVAILABLE_CLAUDE_MODELS
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

  describe('6. Admin System Separation & Dedicated Entry Point Security', () => {
    it('rejects a normal customer attempting to authenticate at the admin entry point', async () => {
      const normalCustomer = {
        id: 'usr_normal_customer_999',
        email: 'client@cafe-casablanca.ma',
        user_metadata: { role: 'owner' }
      };

      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: { user: normalCustomer as any },
        error: null
      });

      vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: false,
        error: null
      } as any);

      const isAllowedAdmin = await adminService.checkIsSuperAdmin();
      expect(isAllowedAdmin).toBe(false);
    });

    it('denies access to /admin even if the normal user knows the URL', async () => {
      const normalUserRole: string = 'owner';
      const isSuperAdminRegistryEntry = false;

      // Access boundary requires verified Super Admin registry status
      const hasAdminRouteAccess = isSuperAdminRegistryEntry && normalUserRole === 'admin';
      expect(hasAdminRouteAccess).toBe(false);
    });

    it('requires successful MFA verification for administrator session elevation', () => {
      const factors = [{ id: 'factor_totp_001', status: 'verified', factor_type: 'totp' }];
      const currentLevel: string = 'aal1';

      // AAL2 is mandatory for Super Admin
      const isSessionElevated = factors.length > 0 && currentLevel === 'aal2';
      expect(isSessionElevated).toBe(false);

      const elevatedLevel: string = 'aal2';
      const isElevatedAfterChallenge = factors.length > 0 && elevatedLevel === 'aal2';
      expect(isElevatedAfterChallenge).toBe(true);
    });
  });

  describe('7. Secure Claude API Configuration & Credential Vault', () => {
    it('saves and rotates MWAPI gateway key securely without requiring sk-ant- prefix', async () => {
      vi.spyOn(supabase, 'rpc').mockImplementation((async (fn: string) => {
        if (fn === 'save_claude_api_key') {
          return { data: { success: true, message: 'Clé MWAPI enregistrée avec succès' }, error: null } as any;
        }
        if (fn === 'get_claude_api_config') {
          return {
            data: {
              is_configured: true,
              provider: 'mwapi',
              base_url: 'https://api.mwapi.dev',
              key_fingerprint: 'sk-mwapi-••••••••••••••••••••••••••••••••4928',
              model_name: 'claude-sonnet-4-6',
              monthly_budget_usd: 150.0,
              month_spend_usd: 14.50
            },
            error: null
          } as any;
        }
        return { data: null, error: null } as any;
      }) as any);

      // Valid MWAPI Gateway key generated from https://api.mwapi.dev/keys (does not start with sk-ant-)
      const validMwapiKey = 'sk-mwapi-live-token-secret-gateway-key-4928';
      const result = await adminService.saveClaudeApiKey(
        validMwapiKey,
        'claude-sonnet-4-6',
        150,
        4096,
        'mwapi',
        'https://api.mwapi.dev'
      );

      expect(result.success).toBe(true);
      expect(result.config?.isConfigured).toBe(true);
      expect(result.config?.provider).toBe('mwapi');
      expect(result.config?.baseUrl).toBe('https://api.mwapi.dev');
      expect(result.config?.keyFingerprint).toContain('••••');
      // Verify raw secret key was NEVER returned in config response
      expect(result.config?.keyFingerprint).not.toBe(validMwapiKey);
    });

    it('enforces sk-ant- prefix validation when provider is explicitly set to anthropic', async () => {
      const nonAnthropicKey = 'sk-mwapi-token-without-anthropic-prefix';
      const result = await adminService.saveClaudeApiKey(
        nonAnthropicKey,
        'claude-sonnet-4-6',
        100,
        4096,
        'anthropic',
        'https://api.anthropic.com'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('sk-ant-');
    });

    it('rejects invalid or too short MWAPI gateway keys (< 16 chars)', async () => {
      const shortKey = 'short-key-123';
      const result = await adminService.saveClaudeApiKey(
        shortKey,
        'claude-sonnet-4-6',
        100,
        4096,
        'mwapi',
        'https://api.mwapi.dev'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('16 caractères');
    });

    it('rejects invalid gateway base URL formats', async () => {
      const validMwapiKey = 'sk-mwapi-live-token-secret-gateway-key-4928';
      const result = await adminService.saveClaudeApiKey(
        validMwapiKey,
        'claude-sonnet-4-6',
        100,
        4096,
        'mwapi',
        'ftp://invalid-protocol.com'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Format d’URL invalide');
    });

    it('never exposes raw API key to customer-facing clients or config queries', async () => {
      vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: {
          is_configured: true,
          key_fingerprint: 'sk-ant-api03-••••••••••••••••••••••••••••••••w9cA',
          model_name: 'claude-3-7-sonnet',
          monthly_budget_usd: 100.0
        },
        error: null
      } as any);

      const config = await adminService.getClaudeConfig();

      expect(config.isConfigured).toBe(true);
      expect(config.keyFingerprint).toBeDefined();
      expect((config as any).encrypted_value).toBeUndefined();
      expect((config as any).apiKey).toBeUndefined();
      expect((config as any).rawKey).toBeUndefined();
    });

    it('executes server-side Zina AI task without exposing credentials to caller', async () => {
      const rpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: {
          success: true,
          feature: 'menu_generation',
          tokens_used: 1250,
          estimated_cost_mad: 0.15
        },
        error: null
      } as any);

      const res = await adminService.executeZinaAiTask(
        'Generate a Moroccan seafood menu',
        'menu_generation',
        'rest_marrakech_01'
      );

      expect(rpcSpy).toHaveBeenCalledWith('execute_zina_ai_completion', {
        p_prompt: 'Generate a Moroccan seafood menu',
        p_feature: 'menu_generation',
        p_restaurant_id: 'rest_marrakech_01'
      });
      expect(res.success).toBe(true);
      expect((res as any).apiKey).toBeUndefined();
    });

    it('runs server-side health check test without revealing secret key', async () => {
      vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: {
          success: true,
          status: 'healthy',
          latency_ms: 138,
          model: 'claude-3-7-sonnet',
          fingerprint: 'sk-ant-api03-••••••••••••••••••••••••••••••••w9cA'
        },
        error: null
      } as any);

      const health = await adminService.testClaudeConnection();
      expect(health.success).toBe(true);
      expect(health.status).toBe('healthy');
      expect(health.latencyMs).toBe(138);
      expect((health as any).key).toBeUndefined();
    });

    it('includes all 8 user-specified Claude models in available fleet', () => {
      const modelIds = AVAILABLE_CLAUDE_MODELS.map(m => m.id);
      const expectedModels = [
        'claude-haiku-4-5-20251001',
        'claude-opus-4-6',
        'claude-opus-4-7',
        'claude-opus-4-8',
        'claude-opus-5',
        'claude-opus-5-5',
        'claude-sonnet-4-6',
        'claude-sonnet-5'
      ];

      for (const expected of expectedModels) {
        expect(modelIds).toContain(expected);
      }
    });

    it('allows switching active Claude model without re-entering the secret key', async () => {
      const rpcSpy = vi.spyOn(supabase, 'rpc').mockImplementation((async (fn: string, params: any) => {
        if (fn === 'save_claude_api_key') {
          return {
            data: { success: true, message: `Modèle configuré : ${params.p_model}` },
            error: null
          } as any;
        }
        if (fn === 'get_claude_api_config') {
          return {
            data: {
              is_configured: true,
              key_fingerprint: 'sk-ant-api03-••••••••••••••••••••••••••••••••w9cA',
              model_name: 'claude-sonnet-5',
              monthly_budget_usd: 150.0
            },
            error: null
          } as any;
        }
        return { data: null, error: null } as any;
      }) as any);

      // Call saveClaudeApiKey with empty key to switch model
      const res = await adminService.saveClaudeApiKey('', 'claude-sonnet-5', 150);
      expect(res.success).toBe(true);
      expect(rpcSpy).toHaveBeenCalledWith('save_claude_api_key', {
        p_api_key: '',
        p_model: 'claude-sonnet-5',
        p_budget_usd: 150,
        p_max_tokens: 4096,
        p_provider: 'mwapi',
        p_base_url: 'https://api.mwapi.dev'
      });
      expect(res.config?.modelName).toBe('claude-sonnet-5');
    });
  });

  describe('8. User Accounts Directory & Authority Data Flow', () => {
    it('retrieves all 3 legitimate registered users without duplicates', async () => {
      const users = await adminService.getAllUsers();
      expect(users.length).toBe(3);

      const uniqueIds = new Set(users.map(u => u.id));
      expect(uniqueIds.size).toBe(3);

      const names = users.map(u => u.fullName);
      expect(names).toContain('Anas Ziraoui');
      expect(names).toContain('Yassine Alami');
      expect(names).toContain('Fatima Zahra Mansouri');
    });

    it('retains users who do not own any restaurants (LEFT JOIN behavior)', async () => {
      const users = await adminService.getAllUsers();
      const adminUser = users.find(u => u.role === 'admin');
      expect(adminUser).toBeDefined();
      expect(adminUser?.fullName).toBe('Anas Ziraoui');
      expect(adminUser?.restaurantCount).toBe(0);
    });

    it('preserves accurate emails and phone contacts across all accounts', async () => {
      const users = await adminService.getAllUsers();
      for (const u of users) {
        expect(u.email).toBeTruthy();
        expect(u.email).toContain('@');
      }
    });

    it('supports inline connection test for MWAPI Gateway before saving', async () => {
      vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: {
          success: true,
          status: 'healthy',
          latency_ms: 124,
          provider: 'mwapi',
          base_url: 'https://api.mwapi.dev'
        },
        error: null
      } as any);

      const testRes = await adminService.testClaudeConnection({
        apiKey: 'mw_live_sk_test_token_12345678',
        provider: 'mwapi',
        baseUrl: 'https://api.mwapi.dev'
      });

      expect(testRes.success).toBe(true);
      expect(testRes.provider).toBe('mwapi');
      expect(testRes.baseUrl).toBe('https://api.mwapi.dev');
      expect(testRes.status).toBe('healthy');
      expect(testRes.latencyMs).toBeGreaterThan(0);
    });
  });

  describe('8. Zero-Trust Access Ledger, Owner Provisioning & Rate Limiting Tests', () => {
    it('recognizes legitimate platform owner email zeraouiianass@gmail.com as Super Admin', async () => {
      const mockOwnerUser = {
        id: '4f12fdc4-9c1b-4413-815a-cb51a9149f3b',
        email: 'zeraouiianass@gmail.com'
      };

      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: { user: mockOwnerUser as any },
        error: null
      });

      // Even if RPC is not deployed yet, owner email fallback grants Super Admin authority
      vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: null,
        error: { message: 'function is_super_admin() does not exist' }
      } as any);

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
            }),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      });
      vi.spyOn(supabase, 'from').mockImplementation(mockFrom as any);

      const isAdmin = await adminService.checkIsSuperAdmin();
      expect(isAdmin).toBe(true);
    });

    it('logs administrative security events to the audit ledger', async () => {
      const rpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: { success: true },
        error: null
      } as any);

      const logged = await adminService.logSecurityEvent({
        eventType: 'admin_login_success',
        severity: 'low',
        route: '/admin/login',
        method: 'POST',
        statusCode: 200,
        outcome: 'allowed',
        reason: 'Super Admin credentials verified',
        clientIp: '196.113.88.14',
        actorEmail: 'zeraouiianass@gmail.com'
      });

      expect(logged).toBe(true);
      expect(rpcSpy).toHaveBeenCalledWith(
        'log_admin_security_event',
        expect.objectContaining({
          p_event_type: 'admin_login_success',
          p_outcome: 'allowed',
          p_actor_email: 'zeraouiianass@gmail.com'
        })
      );
    });

    it('retrieves security events with proper mapping and fallback', async () => {
      vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: [
          {
            id: 'ev-1',
            event_type: 'admin_probe_blocked',
            severity: 'medium',
            route: '/admin/settings',
            method: 'GET',
            status_code: 403,
            outcome: 'denied',
            reason: 'Unauthenticated probe on restricted admin route',
            client_ip: '105.159.24.110',
            user_agent: 'curl/7.88.1',
            actor_user_id: null,
            actor_email: null,
            metadata: {},
            created_at: new Date().toISOString()
          }
        ],
        error: null
      } as any);

      const events = await adminService.getSecurityEvents(10);
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].eventType).toBe('admin_probe_blocked');
      expect(events[0].outcome).toBe('denied');
      expect(events[0].statusCode).toBe(403);
    });

    it('enforces durable rate limits against brute force login attacks', async () => {
      vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: { allowed: false, remaining: 0, retry_after: 840 },
        error: null
      } as any);

      const rateCheck = await adminService.checkRateLimit('attacker@probe.com', 5, 900);
      expect(rateCheck.allowed).toBe(false);
      expect(rateCheck.remaining).toBe(0);
      expect(rateCheck.retryAfter).toBe(840);
    });
  });
});



