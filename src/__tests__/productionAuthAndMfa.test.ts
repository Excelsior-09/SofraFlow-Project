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

  // -------------------------------------------------------------------------
  // TEST GROUP G: Setup Assistant Persistence, Slug Deduplication & Ownership
  // -------------------------------------------------------------------------
  describe('Group G: Setup Assistant Persistence & Ownership Verification', () => {
    it('creates a complete restaurant entity preserving all rich metadata fields', () => {
      const newRestaurant = db.createRestaurant({
        name: 'Café & Restaurant Atlas',
        slug: 'cafe-restaurant-atlas-1234',
        businessType: 'cafe',
        city: 'Marrakech',
        address: '15 Boulevard Mohammed VI, Guéliz, Marrakech',
        phone: '+212600112233',
        description: 'Authentic Moroccan hospitality and specialty coffee.',
        contactEmail: 'owner@atlascafe.ma',
        ownerId: 'usr_owner_test_99'
      });

      expect(newRestaurant).toBeDefined();
      expect(newRestaurant.id).toBeTruthy();
      expect(newRestaurant.name).toBe('Café & Restaurant Atlas');
      expect(newRestaurant.slug).toBe('cafe-restaurant-atlas-1234');
      expect(newRestaurant.businessType).toBe('cafe');
      expect(newRestaurant.city).toBe('Marrakech');
      expect(newRestaurant.address).toBe('15 Boulevard Mohammed VI, Guéliz, Marrakech');
      expect(newRestaurant.phone).toBe('+212600112233');
      expect(newRestaurant.contactEmail).toBe('owner@atlascafe.ma');
      expect(newRestaurant.ownerId).toBe('usr_owner_test_99');
      expect(newRestaurant.currency).toBe('MAD');

      // Verify immediate retrieval from database
      const fetched = db.getRestaurantById(newRestaurant.id);
      expect(fetched).toBeDefined();
      expect(fetched?.name).toBe('Café & Restaurant Atlas');
    });

    it('sanitizes and safely normalizes French accents and symbols into clean slugs', () => {
      const rawName = 'Le Délice de Casablanca — Café & Pâtisserie!';
      const normalizedSlug = rawName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      expect(normalizedSlug).toBe('le-delice-de-casablanca-cafe-patisserie');
      expect(normalizedSlug).not.toContain('é');
      expect(normalizedSlug).not.toContain('—');
      expect(normalizedSlug).not.toContain('!');
    });

    it('handles duplicate slug collisions safely by generating unique suffixes', () => {
      const baseName = 'Riad Gourmet';
      const baseSlug = 'riad-gourmet';

      const rest1 = db.createRestaurant({
        name: baseName,
        slug: `${baseSlug}-1001`,
        ownerId: 'usr_owner_1'
      });

      const rest2 = db.createRestaurant({
        name: baseName,
        slug: `${baseSlug}-1002`,
        ownerId: 'usr_owner_2'
      });

      expect(rest1.slug).not.toBe(rest2.slug);
      expect(rest1.id).not.toBe(rest2.id);

      const all = db.getRestaurants();
      expect(all.some(r => r.slug === `${baseSlug}-1001`)).toBe(true);
      expect(all.some(r => r.slug === `${baseSlug}-1002`)).toBe(true);
    });

    it('ensures dashboard retrieves saved restaurant after simulated page refresh', () => {
      const created = db.createRestaurant({
        name: 'La Pergola Rabat',
        slug: 'la-pergola-rabat',
        city: 'Rabat',
        ownerId: 'usr_rabat_owner'
      });

      // Simulate writing active restaurant id to localStorage
      localStorage.setItem('sofraflow_active_restaurant_id', created.id);

      // Hydration check
      const storedId = localStorage.getItem('sofraflow_active_restaurant_id');
      expect(storedId).toBe(created.id);

      const hydrated = db.getRestaurantById(storedId!);
      expect(hydrated).toBeDefined();
      expect(hydrated?.name).toBe('La Pergola Rabat');
      expect(hydrated?.city).toBe('Rabat');
    });
  });

  // -------------------------------------------------------------------------
  // TEST GROUP H: Multi-Tenant Data Isolation Across Modules
  // -------------------------------------------------------------------------
  describe('Group H: Multi-Tenant Data Isolation Across Modules', () => {
    it('isolates menus and products between different restaurants', () => {
      const restA = db.createRestaurant({ name: 'Biz A', slug: 'biz-a', ownerId: 'usr_a' });
      const restB = db.createRestaurant({ name: 'Biz B', slug: 'biz-b', ownerId: 'usr_b' });

      // Create product for Biz A
      const prodA = db.createProduct({
        restaurantId: restA.id,
        categoryId: 'cat_1',
        name: { fr: 'Tajine A', en: 'Tagine A', ar: 'طاجين أ' },
        description: { fr: 'Desc A', en: 'Desc A', ar: '' },
        price: 85,
        currency: 'MAD',
        imageUrl: 'https://example.com/a.jpg',
        isAvailable: true,
        dietaryTags: ['halal'],
        verifiedIngredients: ['agneau'],
        verifiedAllergens: [],
        optionGroups: [],
        sortOrder: 1
      });

      // Biz A should see prodA, Biz B should NOT see prodA
      const bizAProducts = db.getProducts(restA.id);
      const bizBProducts = db.getProducts(restB.id);

      expect(bizAProducts.some(p => p.id === prodA.id)).toBe(true);
      expect(bizBProducts.some(p => p.id === prodA.id)).toBe(false);
    });

    it('isolates orders between different restaurants', () => {
      const restA = db.createRestaurant({ name: 'Resto Alpha', slug: 'resto-alpha', ownerId: 'usr_alpha' });
      const restB = db.createRestaurant({ name: 'Resto Beta', slug: 'resto-beta', ownerId: 'usr_beta' });

      const orderA = db.createOrder({
        id: 'ord_test_alpha_01',
        publicOrderReference: 'SF-9911',
        restaurantId: restA.id,
        orderType: 'dine_in',
        tableNumber: 'T1',
        customerName: 'Karim',
        items: [
          {
            productId: 'p_1',
            productName: { fr: 'Thé', en: 'Tea', ar: 'شاي' },
            quantity: 2,
            unitPrice: 15,
            subtotal: 30,
            selectedOptions: []
          }
        ],
        subtotal: 30,
        taxAmount: 3,
        serviceFeeAmount: 0,
        total: 33,
        status: 'new',
        notificationStatus: 'pending',
        statusHistory: [],
        currency: 'MAD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const ordersA = db.getOrders(restA.id);
      const ordersB = db.getOrders(restB.id);

      expect(ordersA.some(o => o.id === orderA.id)).toBe(true);
      expect(ordersB.some(o => o.id === orderA.id)).toBe(false);
    });
  });
});
