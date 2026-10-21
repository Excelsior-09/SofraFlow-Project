import { describe, it, expect } from 'vitest';
import { calculateOrderTotals, generatePublicOrderReference } from '../services/orderCalculation';
import { CartItem, Product, RestaurantSettings } from '../types';

describe('Order Calculation & Validation Engine', () => {
  const dummySettings: RestaurantSettings = {
    id: 'set_1',
    restaurantId: 'rest_1',
    currency: 'MAD',
    taxRatePercent: 10,
    serviceFeePercent: 0,
    enableDineIn: true,
    enableTakeaway: true,
    enableDelivery: false,
    requireCustomerPhone: false,
    tableCount: 20,
    openingHours: {}
  };

  const sampleProducts: Product[] = [
    {
      id: 'prod_tagine_1',
      restaurantId: 'rest_1',
      categoryId: 'cat_1',
      name: { en: 'Lamb Tagine', fr: 'Tagine d’Agneau', ar: 'طاجين لحم' },
      description: { en: 'Delicious tagine', fr: 'Bon tagine', ar: 'طاجين لذيذ' },
      price: 130,
      currency: 'MAD',
      imageUrl: 'https://example.com/tagine.jpg',
      isAvailable: true,
      dietaryTags: ['halal'],
      verifiedIngredients: ['Lamb', 'Prunes'],
      verifiedAllergens: [],
      optionGroups: [
        {
          id: 'opt_side',
          title: { en: 'Side', fr: 'Accompagnement', ar: 'المرافقة' },
          required: true,
          minSelections: 1,
          maxSelections: 1,
          choices: [
            { id: 'ch_bread', name: { en: 'Bread', fr: 'Pain', ar: 'خبز' }, priceModifier: 0 },
            { id: 'ch_couscous', name: { en: 'Saffron Couscous', fr: 'Semoule', ar: 'كسكس' }, priceModifier: 15 }
          ]
        }
      ],
      sortOrder: 1,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01'
    },
    {
      id: 'prod_tea_1',
      restaurantId: 'rest_1',
      categoryId: 'cat_2',
      name: { en: 'Mint Tea', fr: 'Thé à la menthe', ar: 'أتاي' },
      description: { en: 'Fresh mint', fr: 'Menthe', ar: 'نعناع' },
      price: 25,
      currency: 'MAD',
      imageUrl: 'https://example.com/tea.jpg',
      isAvailable: true,
      dietaryTags: ['halal', 'vegetarian'],
      verifiedIngredients: ['Tea', 'Mint'],
      verifiedAllergens: [],
      optionGroups: [],
      sortOrder: 2,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01'
    },
    {
      id: 'prod_sold_out',
      restaurantId: 'rest_1',
      categoryId: 'cat_1',
      name: { en: 'Pastilla', fr: 'Pastilla', ar: 'بسطيلة' },
      description: { en: 'Sold out item', fr: 'Vendu', ar: 'غير متوفر' },
      price: 90,
      currency: 'MAD',
      imageUrl: 'https://example.com/pastilla.jpg',
      isAvailable: false, // 86 / Sold out!
      dietaryTags: ['halal'],
      verifiedIngredients: [],
      verifiedAllergens: [],
      optionGroups: [],
      sortOrder: 3,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01'
    }
  ];

  it('rejects order with empty cart', () => {
    const result = calculateOrderTotals({
      restaurantId: 'rest_1',
      orderType: 'dine_in',
      tableNumber: '4',
      cartItems: [],
      availableProducts: sampleProducts,
      settings: dummySettings
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('The cart is empty. Please add items before submitting.');
  });

  it('rejects dine-in order without table number', () => {
    const cartItems: CartItem[] = [
      {
        cartItemId: 'item_1',
        productId: 'prod_tea_1',
        name: 'Mint Tea',
        price: 25,
        quantity: 2,
        selectedOptions: []
      }
    ];

    const result = calculateOrderTotals({
      restaurantId: 'rest_1',
      orderType: 'dine_in',
      tableNumber: '', // missing!
      cartItems,
      availableProducts: sampleProducts,
      settings: dummySettings
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('A table number is required for dine-in orders.');
  });

  it('rejects order containing sold out / unavailable items', () => {
    const cartItems: CartItem[] = [
      {
        cartItemId: 'item_sold',
        productId: 'prod_sold_out',
        name: 'Pastilla',
        price: 90,
        quantity: 1,
        selectedOptions: []
      }
    ];

    const result = calculateOrderTotals({
      restaurantId: 'rest_1',
      orderType: 'takeaway',
      cartItems,
      availableProducts: sampleProducts,
      settings: dummySettings
    });

    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('currently sold out');
  });

  it('calculates prices, modifiers, and taxes server-authoritatively', () => {
    const cartItems: CartItem[] = [
      {
        cartItemId: 'item_tagine_with_couscous',
        productId: 'prod_tagine_1',
        name: 'Lamb Tagine',
        price: 9999, // Tampered client price — must be ignored!
        quantity: 2,
        selectedOptions: [
          {
            groupId: 'opt_side',
            groupTitle: 'Side',
            choiceId: 'ch_couscous',
            choiceName: 'Saffron Couscous',
            priceModifier: 15 // +15 MAD
          }
        ]
      },
      {
        cartItemId: 'item_tea',
        productId: 'prod_tea_1',
        name: 'Mint Tea',
        price: 1, // Tampered client price — must be ignored!
        quantity: 2,
        selectedOptions: []
      }
    ];

    const result = calculateOrderTotals({
      restaurantId: 'rest_1',
      orderType: 'dine_in',
      tableNumber: '7',
      cartItems,
      availableProducts: sampleProducts,
      settings: dummySettings
    });

    expect(result.isValid).toBe(true);
    // Unit prices:
    // Tagine: 130 + 15 = 145. 2x = 290 MAD.
    // Tea: 25. 2x = 50 MAD.
    // Subtotal = 290 + 50 = 340 MAD.
    expect(result.subtotal).toBe(340);
    // Tax (10%): 34 MAD.
    expect(result.taxAmount).toBe(34);
    // Total: 340 + 34 = 374 MAD.
    expect(result.total).toBe(374);
    expect(result.currency).toBe('MAD');
    expect(result.itemsSnapshot.length).toBe(2);
  });

  it('generates standard public order reference (SF-XXXX)', () => {
    const ref = generatePublicOrderReference();
    expect(ref).toMatch(/^SF-\d{4}$/);
  });
});
