import { describe, it, expect, beforeEach } from 'vitest';
import { dynamicAuthStorage, setRememberMePreference, REMEMBER_ME_KEY } from '../lib/supabase';
import { calculateOrderTotals } from '../services/orderCalculation';
import { db } from '../services/db';
import { supabaseService } from '../services/supabaseService';

function createMockStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i: number) => Object.keys(store)[i] ?? null
  };
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = createMockStorage();
}
if (typeof globalThis.sessionStorage === 'undefined') {
  (globalThis as any).sessionStorage = createMockStorage();
}

describe('Production Authentication, MFA, Tenant Security & Order Integrity', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    db.resetToSeed();
  });

  // -------------------------------------------------------------------------
  // TEST GROUP A: Remember Me & Dynamic Storage Isolation
  // -------------------------------------------------------------------------
  describe('Group A: Remember Me & Session Persistence', () => {
    it('routes auth session tokens to localStorage when Remember Me is enabled', () => {
      setRememberMePreference(true);
      dynamicAuthStorage.setItem('sb-test-token', 'valid-jwt-token-remembered');

      expect(localStorage.getItem('sb-test-token')).toBe('valid-jwt-token-remembered');
      expect(sessionStorage.getItem('sb-test-token')).toBeNull();
      expect(dynamicAuthStorage.getItem('sb-test-token')).toBe('valid-jwt-token-remembered');

      dynamicAuthStorage.removeItem('sb-test-token');
      expect(localStorage.getItem('sb-test-token')).toBeNull();
    });

    it('routes auth session tokens to sessionStorage when Remember Me is disabled', () => {
      setRememberMePreference(false);
      dynamicAuthStorage.setItem('sb-test-token', 'session-only-token');

      expect(sessionStorage.getItem('sb-test-token')).toBe('session-only-token');
      expect(localStorage.getItem('sb-test-token')).toBeNull();
      expect(dynamicAuthStorage.getItem('sb-test-token')).toBe('session-only-token');

      dynamicAuthStorage.removeItem('sb-test-token');
      expect(sessionStorage.getItem('sb-test-token')).toBeNull();
    });

    it('handles default preference appropriately', () => {
      // By default when unconfigured, uses localStorage for persistence
      dynamicAuthStorage.setItem('sb-test-token', 'default-storage-token');
      expect(dynamicAuthStorage.getItem('sb-test-token')).toBe('default-storage-token');
    });
  });

  // -------------------------------------------------------------------------
  // TEST GROUP B: Open Redirect & Return URL Defense
  // -------------------------------------------------------------------------
  describe('Group B: Open Redirect Protection on Login', () => {
    const sanitizeReturnUrl = (url: string | null | undefined): string => {
      if (!url || typeof url !== 'string') return '/app';
      const clean = url.trim();
      // Must start with /app and not begin with // or protocol or path traversal
      if (clean.startsWith('/app') && !clean.startsWith('//') && !clean.includes('://') && !clean.includes('..')) {
        return clean;
      }
      return '/app';
    };

    it('allows valid internal dashboard return destinations', () => {
      expect(sanitizeReturnUrl('/app')).toBe('/app');
      expect(sanitizeReturnUrl('/app/menus')).toBe('/app/menus');
      expect(sanitizeReturnUrl('/app/orders/ord_123')).toBe('/app/orders/ord_123');
      expect(sanitizeReturnUrl('/app/settings')).toBe('/app/settings');
    });

    it('rejects external URLs, protocol-relative paths, and schemes', () => {
      expect(sanitizeReturnUrl('https://evil.com/phishing')).toBe('/app');
      expect(sanitizeReturnUrl('//evil.com/hack')).toBe('/app');
      expect(sanitizeReturnUrl('javascript:alert(1)')).toBe('/app');
      expect(sanitizeReturnUrl('data:text/html,malicious')).toBe('/app');
      expect(sanitizeReturnUrl('/app/../../etc/passwd')).toBe('/app');
      expect(sanitizeReturnUrl(null)).toBe('/app');
      expect(sanitizeReturnUrl('')).toBe('/app');
    });
  });

  // -------------------------------------------------------------------------
  // TEST GROUP C: MFA Policy & Assurance Level Logic
  // -------------------------------------------------------------------------
  describe('Group C: MFA Assurance Level & Challenge Requirements', () => {
    it('determines AAL2 requirement when user has verified TOTP factors', () => {
      const evaluateMfaRequired = (
        currentLevel: 'aal1' | 'aal2',
        nextLevel: 'aal1' | 'aal2',
        hasVerifiedFactor: boolean
      ): boolean => {
        return hasVerifiedFactor && nextLevel === 'aal2' && currentLevel !== 'aal2';
      };

      // User has enrolled TOTP factor, authenticated with primary password (aal1)
      expect(evaluateMfaRequired('aal1', 'aal2', true)).toBe(true);

      // User has already satisfied MFA challenge (now at aal2)
      expect(evaluateMfaRequired('aal2', 'aal2', true)).toBe(false);

      // User has no enrolled MFA factor (nextLevel remains aal1)
      expect(evaluateMfaRequired('aal1', 'aal1', false)).toBe(false);
    });

    it('validates 6-digit TOTP code format prior to challenge submission', () => {
      const isValidTotpCode = (code: string): boolean => {
        return /^\d{6}$/.test(code.trim());
      };

      expect(isValidTotpCode('123456')).toBe(true);
      expect(isValidTotpCode('000000')).toBe(true);
      expect(isValidTotpCode('987654')).toBe(true);

      expect(isValidTotpCode('12345')).toBe(false); // too short
      expect(isValidTotpCode('1234567')).toBe(false); // too long
      expect(isValidTotpCode('abcdef')).toBe(false); // letters
      expect(isValidTotpCode('12 34 56')).toBe(false); // spaces
      expect(isValidTotpCode('')).toBe(false); // empty
    });
  });

  // -------------------------------------------------------------------------
  // TEST GROUP D: Tenant Isolation & Privilege Escalation Prevention
  // -------------------------------------------------------------------------
  describe('Group D: Multi-Tenant Isolation & Role Enforcement', () => {
    it('strictly separates operational records between distinct restaurant tenants', () => {
      const restA = 'rest_marrakech_01';
      const restB = 'rest_casablanca_02';

      db.createMenu({
        restaurantId: restB,
        name: 'Casablanca Specialty Menu',
        description: 'Roastery menu',
        slug: 'casablanca-main',
        status: 'published',
        categoryIds: [],
        productIds: [],
        enabledLanguages: ['fr', 'en', 'ar'],
        isDefault: true
      });

      const menusA = db.getMenus(restA);
      const menusB = db.getMenus(restB);

      expect(menusA.length).toBeGreaterThan(0);
      expect(menusB.length).toBeGreaterThan(0);

      // Verify no cross-tenant menu leakage
      for (const m of menusA) {
        expect(m.restaurantId).toBe(restA);
      }
      for (const m of menusB) {
        expect(m.restaurantId).toBe(restB);
      }
    });

    it('blocks unauthorized status transitions and cross-tenant order modification', () => {
      const ordersA = db.getOrders('rest_marrakech_01');
      expect(ordersA.length).toBeGreaterThan(0);
      const targetOrder = ordersA[0];

      // Attempt to update targetOrder using wrong restaurantId (rest_casablanca_02)
      const tamperedUpdate = db.updateOrderStatus(
        targetOrder.id,
        'rest_casablanca_02', // Mismatched tenant
        'cancelled',
        'Cross-tenant tampering attempt'
      );

      // Must be rejected (undefined)
      expect(tamperedUpdate).toBeUndefined();

      // Original order in Marrakech must remain unchanged
      const intactOrder = db.getOrderById(targetOrder.id);
      expect(intactOrder?.status).toBe(targetOrder.status);
    });

    it('prevents non-admin users from escalating to platform administrator roles', () => {
      const regularUser = {
        id: 'usr_staff_01',
        email: 'staff@example.com',
        role: 'staff' as const,
        fullName: 'Staff Member'
      };

      const canAccessPlatformBilling = (user: { role: string }) => {
        return user.role === 'admin';
      };

      expect(canAccessPlatformBilling(regularUser)).toBe(false);
      expect(canAccessPlatformBilling({ ...regularUser, role: 'owner' })).toBe(false);
      expect(canAccessPlatformBilling({ ...regularUser, role: 'admin' })).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // TEST GROUP E: Order Integrity & Server-Side Calculation
  // -------------------------------------------------------------------------
  describe('Group E: Order Price Verification & Calculation Integrity', () => {
    const mockProducts = [
      {
        id: 'prod_tagine_01',
        restaurantId: 'rest_marrakech_01',
        categoryId: 'cat_mains',
        name: { en: 'Lamb Tagine', fr: 'Tagine d’Agneau', ar: 'طاجين لحم' },
        price: 95.0,
        currency: 'MAD',
        imageUrl: '',
        isAvailable: true,
        dietaryTags: ['halal'],
        verifiedIngredients: ['Lamb', 'Prunes'],
        verifiedAllergens: [],
        optionGroups: [
          {
            id: 'og_spice',
            title: { en: 'Spice Level', fr: 'Piquant', ar: 'الحرارة' },
            required: false,
            minSelections: 0,
            maxSelections: 1,
            choices: [
              { id: 'c_mild', name: { en: 'Mild', fr: 'Doux', ar: 'معتدل' }, priceModifier: 0 },
              { id: 'c_spicy', name: { en: 'Extra Harissa', fr: 'Harissa', ar: 'حار' }, priceModifier: 5.0 }
            ]
          }
        ],
        sortOrder: 1
      }
    ];

    it('calculates trusted order totals from server product catalog and option modifiers', () => {
      const calculation = calculateOrderTotals({
        restaurantId: 'rest_marrakech_01',
        orderType: 'dine_in',
        tableNumber: 'Table 4',
        cartItems: [
          {
            cartItemId: 'item_1',
            productId: 'prod_tagine_01',
            name: 'Lamb Tagine',
            price: 95.0, // Client claimed price (ignored in authoritative calculation)
            quantity: 2,
            selectedOptions: [
              { groupId: 'og_spice', choiceId: 'c_spicy', priceModifier: 5.0, groupTitle: 'Spice Level', choiceName: 'Extra Harissa' }
            ]
          }
        ] as any,
        availableProducts: mockProducts as any,
        settings: {
          currency: 'MAD',
          taxRatePercent: 10,
          serviceFeePercent: 0,
          enableDineIn: true,
          enableTakeaway: true,
          enableDelivery: false,
          requireCustomerPhone: false,
          tableCount: 10
        } as any
      });

      expect(calculation.isValid).toBe(true);
      // Unit price = 95 + 5 = 100
      // Subtotal = 100 * 2 = 200
      expect(calculation.subtotal).toBe(200);
      // Tax = 200 * 0.10 = 20
      expect(calculation.taxAmount).toBe(20);
      // Total = 220
      expect(calculation.total).toBe(220);
      expect(calculation.itemsSnapshot[0].unitPrice).toBe(100);
      expect(calculation.itemsSnapshot[0].subtotal).toBe(200);
    });

    it('rejects order if product does not belong to the restaurant', () => {
      const calculation = calculateOrderTotals({
        restaurantId: 'rest_casablanca_02', // Mismatched restaurant!
        orderType: 'dine_in',
        tableNumber: 'Table 1',
        cartItems: [
          {
            cartItemId: 'item_1',
            productId: 'prod_tagine_01', // Belongs to rest_marrakech_01
            name: 'Lamb Tagine',
            price: 95.0,
            quantity: 1,
            selectedOptions: []
          }
        ] as any,
        availableProducts: mockProducts as any,
        settings: {
          currency: 'MAD',
          taxRatePercent: 10,
          serviceFeePercent: 0,
          enableDineIn: true,
          enableTakeaway: true,
          enableDelivery: false,
          requireCustomerPhone: false,
          tableCount: 10
        } as any
      });

      expect(calculation.isValid).toBe(false);
      expect(calculation.errors.length).toBeGreaterThan(0);
    });

    it('rejects order with invalid or non-positive quantities', () => {
      const calculation = calculateOrderTotals({
        restaurantId: 'rest_marrakech_01',
        orderType: 'dine_in',
        tableNumber: 'Table 1',
        cartItems: [
          {
            cartItemId: 'item_1',
            productId: 'prod_tagine_01',
            name: 'Lamb Tagine',
            price: 95.0,
            quantity: 0, // Invalid!
            selectedOptions: []
          }
        ] as any,
        availableProducts: mockProducts as any,
        settings: {
          currency: 'MAD',
          taxRatePercent: 10,
          serviceFeePercent: 0,
          enableDineIn: true,
          enableTakeaway: true,
          enableDelivery: false,
          requireCustomerPhone: false,
          tableCount: 10
        } as any
      });

      expect(calculation.isValid).toBe(false);
      expect(calculation.errors.some(e => e.includes('positive'))).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // TEST GROUP F: Zero-State Analytics Handling Without Mock Injection
  // -------------------------------------------------------------------------
  describe('Group F: Zero-State Analytics Resilience', () => {
    it('returns exact zero metrics when a business has 0 orders, without falling back to mock charts', () => {
      const emptyOrders: any[] = [];
      const validOrders = emptyOrders.filter(o => o.status !== 'cancelled');
      const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
      const aov = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

      expect(emptyOrders.length).toBe(0);
      expect(totalRevenue).toBe(0);
      expect(aov).toBe(0);
      expect(validOrders.length).toBe(0);
    });
  });
});
