import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../services/db';

describe('Tenant Isolation and Database Persistence', () => {
  beforeEach(() => {
    db.resetToSeed();
  });

  it('strictly isolates products by restaurantId', () => {
    const marrakechProducts = db.getProducts('rest_marrakech_01');
    const casablancaProducts = db.getProducts('rest_casablanca_02');

    expect(marrakechProducts.length).toBeGreaterThan(0);
    // All products returned must belong strictly to Marrakech
    for (const p of marrakechProducts) {
      expect(p.restaurantId).toBe('rest_marrakech_01');
    }

    // Creating a product for Casablanca must not appear in Marrakech
    db.createProduct({
      restaurantId: 'rest_casablanca_02',
      categoryId: 'cat_test',
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

    const updatedMarrakech = db.getProducts('rest_marrakech_01');
    const updatedCasablanca = db.getProducts('rest_casablanca_02');

    expect(updatedMarrakech.some(p => p.name.en === 'Casablanca Specialty Espresso')).toBe(false);
    expect(updatedCasablanca.some(p => p.name.en === 'Casablanca Specialty Espresso')).toBe(true);
  });

  it('strictly isolates orders by restaurantId', () => {
    const marrakechOrders = db.getOrders('rest_marrakech_01');
    for (const o of marrakechOrders) {
      expect(o.restaurantId).toBe('rest_marrakech_01');
    }
  });

  it('correctly updates order status and preserves audit history', () => {
    const orders = db.getOrders('rest_marrakech_01');
    const orderToUpdate = orders[0];
    const initialHistoryLength = orderToUpdate.statusHistory.length;

    const updated = db.updateOrderStatus(
      orderToUpdate.id,
      'rest_marrakech_01',
      'completed',
      'Order settled at table'
    );

    expect(updated).toBeDefined();
    expect(updated?.status).toBe('completed');
    expect(updated?.statusHistory.length).toBe(initialHistoryLength + 1);
    expect(updated?.statusHistory[updated.statusHistory.length - 1].note).toBe('Order settled at table');
  });
});
