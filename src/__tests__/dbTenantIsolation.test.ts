import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../services/db';

describe('Tenant Isolation and Database Persistence', () => {
  beforeEach(() => {
    db.resetToSeed();
    // Set up test fixtures for two isolated tenants
    db.createProduct({
      restaurantId: 'rest_tenant_A',
      categoryId: 'cat_test_A',
      name: { en: 'Moroccan Tagine', fr: 'Tajine Marocain', ar: 'طاجين مغربي' },
      description: { en: 'Slow cooked', fr: 'Cuit lentement', ar: 'مطهو ببطء' },
      price: 95,
      currency: 'MAD',
      imageUrl: 'https://example.com/tagine.jpg',
      isAvailable: true,
      dietaryTags: ['halal'],
      verifiedIngredients: ['Lamb', 'Prunes'],
      verifiedAllergens: [],
      optionGroups: [],
      sortOrder: 1
    });

    db.createOrder({
      id: 'ord_test_01',
      restaurantId: 'rest_tenant_A',
      orderType: 'dine_in',
      tableNumber: '4',
      items: [],
      subtotal: 95,
      taxAmount: 9.5,
      serviceFeeAmount: 0,
      total: 104.5,
      currency: 'MAD',
      status: 'new',
      notificationStatus: 'pending',
      statusHistory: [
        { status: 'new', timestamp: new Date().toISOString() }
      ],
      publicOrderReference: 'ORD-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  it('strictly isolates products by restaurantId', () => {
    const productsA = db.getProducts('rest_tenant_A');
    const productsB = db.getProducts('rest_tenant_B');

    expect(productsA.length).toBeGreaterThan(0);
    // All products returned must belong strictly to Tenant A
    for (const p of productsA) {
      expect(p.restaurantId).toBe('rest_tenant_A');
    }

    // Creating a product for Tenant B must not appear in Tenant A
    db.createProduct({
      restaurantId: 'rest_tenant_B',
      categoryId: 'cat_test_B',
      name: { en: 'Casablanca Specialty Espresso', fr: 'Café Espresso', ar: 'إسبريسو' },
      description: { en: 'Direct trade', fr: 'Direct trade', ar: 'تجارة مباشرة' },
      price: 28,
      currency: 'MAD',
      imageUrl: 'https://example.com/coffee.jpg',
      isAvailable: true,
      dietaryTags: ['vegetarian'],
      verifiedIngredients: ['Coffee Beans'],
      verifiedAllergens: [],
      optionGroups: [],
      sortOrder: 1
    });

    const updatedA = db.getProducts('rest_tenant_A');
    const updatedB = db.getProducts('rest_tenant_B');

    expect(updatedA.some(p => p.name.en === 'Casablanca Specialty Espresso')).toBe(false);
    expect(updatedB.some(p => p.name.en === 'Casablanca Specialty Espresso')).toBe(true);
  });

  it('strictly isolates orders by restaurantId', () => {
    const ordersA = db.getOrders('rest_tenant_A');
    expect(ordersA.length).toBeGreaterThan(0);
    for (const o of ordersA) {
      expect(o.restaurantId).toBe('rest_tenant_A');
    }
    const ordersB = db.getOrders('rest_tenant_B');
    expect(ordersB.length).toBe(0);
  });

  it('correctly updates order status and preserves audit history', () => {
    const orders = db.getOrders('rest_tenant_A');
    const orderToUpdate = orders[0];
    const initialHistoryLength = orderToUpdate.statusHistory.length;

    const updated = db.updateOrderStatus(
      orderToUpdate.id,
      'rest_tenant_A',
      'completed',
      'Order settled at table'
    );

    expect(updated).toBeDefined();
    expect(updated?.status).toBe('completed');
    expect(updated?.statusHistory.length).toBe(initialHistoryLength + 1);
    expect(updated?.statusHistory[updated.statusHistory.length - 1].note).toBe('Order settled at table');
  });
});
