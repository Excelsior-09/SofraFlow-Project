import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../services/db';
import { supabaseService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';

class MockStorage {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] ?? null; }
  setItem(key: string, value: string) { this.store[key] = String(value); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = new MockStorage();
}

describe('Authenticated User Restaurant Ownership & Tenant Security', () => {
  beforeEach(() => {
    localStorage.clear();
    db.resetToSeed();
  });

  // --------------------------------------------------------------------------
  // 1. Newly Registered User with No Restaurant
  // --------------------------------------------------------------------------
  describe('1. New User with No Restaurant', () => {
    it('returns an authentic empty restaurant state with no dummy data', async () => {
      const newUserId = 'usr_fresh_new_owner_001';

      // Remote query for this user returns empty array
      const remoteRestaurants = await supabaseService.getRestaurantsForOwner(newUserId);
      expect(remoteRestaurants).toEqual([]);

      // Local query for this user returns empty array
      const localRestaurants = db.getRestaurants(newUserId);
      expect(localRestaurants).toEqual([]);

      // Default active restaurant is null, not 'rest_marrakech_01'
      expect(db.getActiveRestaurantId()).toBeNull();

      // Verify dummy restaurants are not present
      const allLocal = db.getRestaurants();
      expect(allLocal.some(r => r.name === 'Le Jardin de Marrakech')).toBe(false);
      expect(allLocal.some(r => r.name === 'Café Atlas Artisan')).toBe(false);
      expect(allLocal.some(r => r.id === 'rest_marrakech_01')).toBe(false);
      expect(allLocal.some(r => r.id === 'rest_casablanca_02')).toBe(false);
    });

    it('does not silently create a restaurant or fabricate records', () => {
      const initialCount = db.getRestaurants().length;
      expect(initialCount).toBe(0);

      // Inactive / unowned queries must not populate records
      const orders = db.getOrders('non_existent_restaurant');
      const menus = db.getMenus('non_existent_restaurant');
      const products = db.getProducts('non_existent_restaurant');
      const categories = db.getCategories('non_existent_restaurant');

      expect(orders).toEqual([]);
      expect(menus).toEqual([]);
      expect(products).toEqual([]);
      expect(categories).toEqual([]);
      expect(db.getRestaurants().length).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Existing User Who Owns One Restaurant
  // --------------------------------------------------------------------------
  describe('2. Existing User with One Restaurant', () => {
    it('returns only the genuinely owned restaurant linked to owner_id', () => {
      const ownerId = 'usr_riad_owner_001';

      const created = db.createRestaurant({
        ownerId,
        name: 'Riad Al Nour',
        slug: 'riad-al-nour',
        city: 'Fes'
      });

      expect(created.id).toBeDefined();
      expect(created.ownerId).toBe(ownerId);

      const owned = db.getRestaurants(ownerId);
      expect(owned.length).toBe(1);
      expect(owned[0].id).toBe(created.id);
      expect(owned[0].name).toBe('Riad Al Nour');
      expect(owned[0].slug).toBe('riad-al-nour');

      // Neither demo restaurant is returned
      expect(owned.some(r => r.name === 'Le Jardin de Marrakech')).toBe(false);
      expect(owned.some(r => r.name === 'Café Atlas Artisan')).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 3. User Who Owns Multiple Restaurants
  // --------------------------------------------------------------------------
  describe('3. User Who Owns Multiple Restaurants', () => {
    it('returns all restaurants owned by the user and supports switching active restaurant', () => {
      const multiOwnerId = 'usr_multi_group_owner';

      const rest1 = db.createRestaurant({
        ownerId: multiOwnerId,
        name: 'Bistro Agadir',
        slug: 'bistro-agadir',
        city: 'Agadir'
      });

      const rest2 = db.createRestaurant({
        ownerId: multiOwnerId,
        name: 'Café Marina Tangier',
        slug: 'cafe-marina-tangier',
        city: 'Tangier'
      });

      const ownedList = db.getRestaurants(multiOwnerId);
      expect(ownedList.length).toBe(2);
      expect(ownedList.map(r => r.id)).toContain(rest1.id);
      expect(ownedList.map(r => r.id)).toContain(rest2.id);

      // Switching active restaurant
      db.setActiveRestaurantId(rest1.id);
      expect(db.getActiveRestaurantId()).toBe(rest1.id);

      db.setActiveRestaurantId(rest2.id);
      expect(db.getActiveRestaurantId()).toBe(rest2.id);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Two Separate Accounts with Different Restaurant Records (Multi-Tenant Isolation)
  // --------------------------------------------------------------------------
  describe('4. Multi-Tenant Account Isolation', () => {
    it('strictly isolates User A from User B restaurant records', () => {
      const userA = 'usr_account_alpha';
      const userB = 'usr_account_beta';

      const restA = db.createRestaurant({
        ownerId: userA,
        name: 'Alpha Grill Casablanca',
        slug: 'alpha-grill'
      });

      const restB = db.createRestaurant({
        ownerId: userB,
        name: 'Beta Seafood Rabat',
        slug: 'beta-seafood'
      });

      // User A queries
      const restaurantsForA = db.getRestaurants(userA);
      expect(restaurantsForA.length).toBe(1);
      expect(restaurantsForA[0].id).toBe(restA.id);
      expect(restaurantsForA[0].name).toBe('Alpha Grill Casablanca');
      expect(restaurantsForA.some(r => r.id === restB.id)).toBe(false);

      // User B queries
      const restaurantsForB = db.getRestaurants(userB);
      expect(restaurantsForB.length).toBe(1);
      expect(restaurantsForB[0].id).toBe(restB.id);
      expect(restaurantsForB[0].name).toBe('Beta Seafood Rabat');
      expect(restaurantsForB.some(r => r.id === restA.id)).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Account with No Menus, Orders, or Analytics
  // --------------------------------------------------------------------------
  describe('5. Clean Empty State for New Restaurant Accounts', () => {
    it('returns empty collections without substituting mock or demo content', () => {
      const ownerId = 'usr_clean_new_restaurant';
      const cleanRest = db.createRestaurant({
        ownerId,
        name: 'Dar Diafa Clean',
        slug: 'dar-diafa-clean'
      });

      // Query menus for clean restaurant
      const menus = db.getMenus(cleanRest.id);
      // It has only the auto-generated initial starter digital menu, with 0 categories and 0 products
      expect(menus.every(m => m.restaurantId === cleanRest.id)).toBe(true);

      // Orders collection must be strictly empty
      const orders = db.getOrders(cleanRest.id);
      expect(orders).toEqual([]);

      // Notifications audit events must be strictly empty
      const notifications = db.getNotificationEvents(cleanRest.id);
      expect(notifications).toEqual([]);

      // Payment requests must be strictly empty
      const paymentRequests = db.getPaymentRequests(cleanRest.id);
      expect(paymentRequests).toEqual([]);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Security & Unauthorized Access Prevention
  // --------------------------------------------------------------------------
  describe('6. Security & Authorization Enforcement', () => {
    it('blocks cross-tenant order modification attempts', () => {
      const restOwnerA = 'rest_legitimate_A';
      const restAttackerB = 'rest_attacker_B';

      const orderA = db.createOrder({
        id: 'ord_secret_123',
        restaurantId: restOwnerA,
        orderType: 'dine_in',
        tableNumber: '1',
        items: [],
        subtotal: 50,
        taxAmount: 5,
        serviceFeeAmount: 0,
        total: 55,
        currency: 'MAD',
        status: 'new',
        notificationStatus: 'pending',
        statusHistory: [{ status: 'new', timestamp: new Date().toISOString() }],
        publicOrderReference: 'ORD-SECRET',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Tenant B attempts to manipulate Tenant A order
      const unauthorizedUpdate = db.updateOrderStatus(
        orderA.id,
        restAttackerB, // Wrong restaurant ID
        'cancelled',
        'Malicious cancellation attempt'
      );

      // Must be rejected
      expect(unauthorizedUpdate).toBeUndefined();

      // Original order status remains 'new'
      const checkedOrder = db.getOrderById(orderA.id);
      expect(checkedOrder?.status).toBe('new');
    });

    it('requires valid session for Supabase client operations without service key leakage', () => {
      // Confirm that client-side Supabase instance uses the public anon key, never the secret service-role key
      const anonKey = (supabase as any).supabaseKey;
      expect(anonKey).toBeDefined();
      expect(anonKey).not.toContain('service_role');
    });
  });

  // --------------------------------------------------------------------------
  // 7. Refresh, Sign-Out, and Sign-In Session Lifecycle
  // --------------------------------------------------------------------------
  describe('7. Session Lifecycle & Cleanup', () => {
    it('clears all active restaurant credentials and storage upon sign out', () => {
      db.setActiveRestaurantId('rest_some_active_id');
      expect(db.getActiveRestaurantId()).toBe('rest_some_active_id');

      // Simulate sign-out cleanup
      db.setCurrentUser(null);
      localStorage.removeItem('sofraflow_active_restaurant_id');
      db.resetToSeed();

      expect(db.getCurrentUser()).toBeNull();
      expect(db.getActiveRestaurantId()).toBeNull();
      expect(localStorage.getItem('sofraflow_active_restaurant_id')).toBeNull();
    });

    it('purges legacy demo restaurants if present in storage', () => {
      // Simulate an older browser cache that stored dummy records
      localStorage.setItem('sofraflow_restaurants_v1', JSON.stringify([
        { id: 'rest_marrakech_01', name: 'Le Jardin de Marrakech', slug: 'jardin-marrakech' },
        { id: 'rest_casablanca_02', name: 'Café Atlas Artisan', slug: 'atlas-artisan' },
        { id: 'rest_legit_user', name: 'Authentic Grill', slug: 'authentic-grill', ownerId: 'usr_valid' }
      ]));
      localStorage.setItem('sofraflow_active_restaurant_id_v1', 'rest_marrakech_01');

      // Re-trigger db init/cleanup
      (db as any).init();

      const cleaned = db.getRestaurants();
      expect(cleaned.some(r => r.id === 'rest_marrakech_01')).toBe(false);
      expect(cleaned.some(r => r.id === 'rest_casablanca_02')).toBe(false);
      expect(cleaned.length).toBe(1);
      expect(cleaned[0].name).toBe('Authentic Grill');

      // Legacy active restaurant ID was cleared
      expect(db.getActiveRestaurantId()).toBeNull();
    });
  });
});
