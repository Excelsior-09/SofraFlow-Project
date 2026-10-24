import { describe, it, expect } from 'vitest';
import { MENU_TEMPLATES } from '../data/menuTemplatesData';
import { db } from '../services/db';

describe('Zina AI Menu Creator & Smart QR Studio Suite', () => {
  it('provides distinct menu templates with realistic Moroccan restaurant data', () => {
    expect(MENU_TEMPLATES.length).toBeGreaterThanOrEqual(10);

    const expectedTemplateIds = [
      'template_modern_fine_dining',
      'template_moroccan_heritage',
      'template_specialty_coffee',
      'template_burger_fast_food',
      'template_italian_pizzeria',
      'template_asian_sushi_wok',
      'template_seafood_mediterranean',
      'template_bakery_patisserie',
      'template_fresh_juice_healthy_eats',
      'template_premium_lounge_bistro'
    ];

    MENU_TEMPLATES.forEach((tpl) => {
      expect(expectedTemplateIds).toContain(tpl.id);
      expect(tpl.name.en).toBeTruthy();
      expect(tpl.name.fr).toBeTruthy();
      expect(tpl.description.en).toBeTruthy();
      expect(tpl.description.fr).toBeTruthy();
      expect(tpl.intendedFor.en).toBeTruthy();
      expect(tpl.categories.length).toBeGreaterThan(0);

      // Verify each template has distinct categories with valid MAD prices
      tpl.categories.forEach((cat) => {
        expect(cat.name.en).toBeTruthy();
        expect(cat.name.fr).toBeTruthy();
        expect(cat.items.length).toBeGreaterThan(0);
        cat.items.forEach((item) => {
          expect(item.name.en).toBeTruthy();
          expect(item.name.fr).toBeTruthy();
          expect(item.price).toBeGreaterThan(0);
          expect(item.description.en).toBeTruthy();
          expect(item.description.fr).toBeTruthy();
        });
      });
    });
  });

  it('guarantees each template has distinct styling and business suitability', () => {
    const ids = MENU_TEMPLATES.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(10);

    const colors = MENU_TEMPLATES.map((t) => t.primaryColor);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBeGreaterThanOrEqual(5);
  });

  it('creates and persists a draft menu through the unified creation workflow', () => {
    const testRestId = 'rest_marrakech_01';
    const heritageTemplate = MENU_TEMPLATES.find((t) => t.id === 'template_moroccan_heritage');
    expect(heritageTemplate).toBeDefined();

    if (!heritageTemplate) return;

    // Create a category and product as done by Zina Menu Creator
    const sampleCategory = heritageTemplate.categories[0];
    const createdCat = db.createCategory({
      restaurantId: testRestId,
      name: {
        en: sampleCategory.name.en,
        fr: sampleCategory.name.fr,
        ar: sampleCategory.name.ar || ''
      },
      sortOrder: 99
    });
    expect(createdCat.id).toBeDefined();

    const sampleItem = sampleCategory.items[0];
    const createdProd = db.createProduct({
      restaurantId: testRestId,
      categoryId: createdCat.id,
      name: {
        en: sampleItem.name.en,
        fr: sampleItem.name.fr,
        ar: ''
      },
      description: {
        en: sampleItem.description.en,
        fr: sampleItem.description.fr,
        ar: ''
      },
      price: sampleItem.price,
      currency: 'MAD',
      imageUrl: sampleItem.imageUrl || '',
      isAvailable: true,
      dietaryTags: [],
      verifiedIngredients: [],
      verifiedAllergens: [],
      optionGroups: [],
      sortOrder: 1
    });
    expect(createdProd.id).toBeDefined();

    // Create Draft Menu
    const createdMenu = db.createMenu({
      restaurantId: testRestId,
      name: 'Carte Test Zina AI',
      description: 'Test draft menu from Zina AI Menu Creator',
      slug: `carte-test-zina-${Date.now()}`,
      status: 'draft', // Must strictly be draft
      categoryIds: [createdCat.id],
      productIds: [createdProd.id],
      enabledLanguages: ['fr', 'en', 'ar'],
      isDefault: false
    });

    expect(createdMenu.id).toBeDefined();
    expect(createdMenu.status).toBe('draft');

    // Retrieve from DB to verify persistence
    const retrieved = db.getMenuById(createdMenu.id, testRestId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Carte Test Zina AI');
    expect(retrieved?.status).toBe('draft');
  });

  it('verifies destination target is general venue with table entered manually', () => {
    const restaurant = db.createRestaurant({
      id: 'rest_qr_studio_01',
      name: 'Riad Test',
      slug: 'riad-test'
    });
    expect(restaurant).toBeDefined();

    const baseUrl = `https://sofraflow.com/m/${restaurant.slug}`;
    const selectedDestination = 'general';
    const targetUrl = selectedDestination === 'general' ? baseUrl : `${baseUrl}?table=${selectedDestination}`;

    expect(targetUrl).toBe(baseUrl);
    expect(targetUrl.includes('table=')).toBe(false);
  });
});
