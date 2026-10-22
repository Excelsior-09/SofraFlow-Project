import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { MENU_TEMPLATES, getTemplateById } from '../data/menuTemplatesData';

describe('SofraFlow 10 Menu Templates Integration Test Suite', () => {
  const rootDir = path.resolve(__dirname, '..');

  const EXPECTED_TEMPLATE_IDS = [
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

  it('All 10 required template IDs are present in the template registry', () => {
    const presentIds = MENU_TEMPLATES.map(t => t.id);
    expect(presentIds.length).toBe(10);
    EXPECTED_TEMPLATE_IDS.forEach(expectedId => {
      expect(presentIds).toContain(expectedId);
    });
  });

  it('Each template has distinct identity, palette, hospitality use-case, and badges', () => {
    const primaryColors = new Set<string>();
    const accentColors = new Set<string>();

    MENU_TEMPLATES.forEach(tpl => {
      expect(tpl.id).toBeDefined();
      expect(tpl.name.en).toBeTruthy();
      expect(tpl.name.fr).toBeTruthy();
      expect(tpl.tagline.en).toBeTruthy();
      expect(tpl.tagline.fr).toBeTruthy();
      expect(tpl.description.en).toBeTruthy();
      expect(tpl.description.fr).toBeTruthy();
      expect(tpl.intendedFor.en).toBeTruthy();
      expect(tpl.intendedFor.fr).toBeTruthy();
      expect(tpl.badge.en).toBeTruthy();
      expect(tpl.badge.fr).toBeTruthy();
      expect(tpl.previewHeroImage).toMatch(/^https?:\/\//);

      // Validate Hex colors
      expect(tpl.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(tpl.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);

      primaryColors.add(tpl.primaryColor);
      accentColors.add(tpl.accentColor);

      // Validate categories and sample dishes
      expect(tpl.categories.length).toBeGreaterThanOrEqual(1);
      tpl.categories.forEach(cat => {
        expect(cat.name.en).toBeTruthy();
        expect(cat.name.fr).toBeTruthy();
        expect(cat.items.length).toBeGreaterThanOrEqual(1);

        cat.items.forEach(item => {
          expect(item.name.en).toBeTruthy();
          expect(item.name.fr).toBeTruthy();
          expect(typeof item.price).toBe('number');
          expect(item.price).toBeGreaterThan(0);

          if (item.dietary) {
            expect(['halal', 'vegetarian', 'chef_special', 'spicy']).toContain(item.dietary);
          }
        });
      });
    });

    // Ensure distinct visual palettes
    expect(primaryColors.size).toBeGreaterThanOrEqual(8);
    expect(accentColors.size).toBeGreaterThanOrEqual(8);
  });

  it('Arabic translations are genuine Arabic scripts with RTL support capability', () => {
    const arabicRegex = /[\u0600-\u06FF]/;
    let foundArabicCategories = 0;
    let foundArabicDishes = 0;

    MENU_TEMPLATES.forEach(tpl => {
      tpl.categories.forEach(cat => {
        if (cat.name.ar) {
          expect(cat.name.ar).toMatch(arabicRegex);
          foundArabicCategories++;
        }
        cat.items.forEach(item => {
          if (item.name.ar) {
            expect(item.name.ar).toMatch(arabicRegex);
            foundArabicDishes++;
          }
        });
      });
    });

    expect(foundArabicCategories).toBeGreaterThanOrEqual(10);
    expect(foundArabicDishes).toBeGreaterThanOrEqual(10);
  });

  it('Legacy alias helper getTemplateById supports previous IDs and maps them correctly', () => {
    expect(getTemplateById('template_modern_fine_dining')?.id).toBe('template_modern_fine_dining');
    expect(getTemplateById('template_modern_restaurant')?.id).toBe('template_modern_fine_dining');
    expect(getTemplateById('template_cafe_coffee')?.id).toBe('template_specialty_coffee');
    expect(getTemplateById('template_fast_food_snack')?.id).toBe('template_burger_fast_food');
    expect(getTemplateById('template_moroccan_heritage')?.id).toBe('template_moroccan_heritage');
    expect(getTemplateById('template_unknown_nonexistent')).toBeUndefined();
  });

  it('All 10 standalone HTML and CSS files exist in public/templates with template-shared.css and template-interactions.js', () => {
    const templatesDir = path.join(rootDir, '..', 'public', 'templates');
    expect(fs.existsSync(templatesDir)).toBe(true);

    expect(fs.existsSync(path.join(templatesDir, 'template-shared.css'))).toBe(true);
    expect(fs.existsSync(path.join(templatesDir, 'template-interactions.js'))).toBe(true);

    EXPECTED_TEMPLATE_IDS.forEach(id => {
      const htmlFile = path.join(templatesDir, `${id}.html`);
      const cssFile = path.join(templatesDir, `${id}.css`);

      expect(fs.existsSync(htmlFile)).toBe(true);
      expect(fs.existsSync(cssFile)).toBe(true);

      const htmlContent = fs.readFileSync(htmlFile, 'utf-8');
      expect(htmlContent).toContain('data-sofraflow-menu');
      expect(htmlContent).toContain(`data-template-id="${id}"`);
      expect(htmlContent).toContain('template-shared.css');
      expect(htmlContent).toContain('template-interactions.js');

      const cssContent = fs.readFileSync(cssFile, 'utf-8');
      expect(cssContent).toContain('--primary:');
      expect(cssContent).toContain('--accent:');
      expect(cssContent).toContain('.menu-hero');
    });
  });

  it('ZinaMenuCreatorModal contains Start with a Template with 10 templates, and sidebar remains clean', () => {
    const modalPath = path.join(rootDir, 'components', 'dashboard', 'ZinaMenuCreatorModal.tsx');
    const modalContent = fs.readFileSync(modalPath, 'utf-8');
    expect(modalContent).toContain('Start with a Template');
    expect(modalContent).toContain('10 Professional Templates');
    expect(modalContent).toContain('SofraFlowTemplateRenderer');

    const layoutPath = path.join(rootDir, 'components', 'dashboard', 'DashboardLayout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    expect(layoutContent).not.toContain('/app/templates');
  });

  it('SofraFlowTemplateRenderer component exists with search, cart, and event hooks', () => {
    const rendererPath = path.join(rootDir, 'components', 'customer', 'SofraFlowTemplateRenderer.tsx');
    expect(fs.existsSync(rendererPath)).toBe(true);

    const rendererContent = fs.readFileSync(rendererPath, 'utf-8');
    expect(rendererContent).toContain('data-sofraflow-menu');
    expect(rendererContent).toContain('sofraflow:checkout');
    expect(rendererContent).toContain('onCheckout');
    expect(rendererContent).toContain('onDishAdd');
    expect(rendererContent).toContain('onTemplateSelect');
    expect(rendererContent).toContain('data-sf-search');
    expect(rendererContent).toContain('data-sf-add');
    expect(rendererContent).toContain('data-sf-checkout');
  });
});
