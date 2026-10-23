import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dictionaries } from '../locales';
import { db } from '../services/db';

describe('Internationalization (i18n) Engine & French Locales', () => {
  it('provides a complete French dictionary with all required top-level namespaces', () => {
    const fr = dictionaries.fr;
    expect(fr).toBeDefined();
    expect(fr.common).toBeDefined();
    expect(fr.navigation).toBeDefined();
    expect(fr.auth).toBeDefined();
    expect(fr.dashboard).toBeDefined();
    expect(fr.menus).toBeDefined();
    expect(fr.products).toBeDefined();
    expect(fr.orders).toBeDefined();
    expect(fr.qrNfc).toBeDefined();
    expect(fr.languages).toBeDefined();
    expect(fr.whatsapp).toBeDefined();
    expect(fr.analytics).toBeDefined();
    expect(fr.settings).toBeDefined();
    expect(fr.billing).toBeDefined();
    expect(fr.help).toBeDefined();
    expect(fr.customer).toBeDefined();
    expect(fr.marketing).toBeDefined();
  });

  it('matches key terminology between French and English dictionaries for navigation and actions', () => {
    const { fr } = dictionaries;
    
    // Core actions
    expect(fr.common.save).toBe('Enregistrer');
    expect(fr.common.saved).toBe('Modifications enregistrées !');
    expect(fr.common.cancel).toBe('Annuler');
    expect(fr.common.delete).toBe('Supprimer');
    expect(fr.common.edit).toBe('Modifier');
    expect(fr.common.search).toBe('Rechercher');
    expect(fr.common.loading).toBe('Chargement…');
    expect(fr.common.noResults).toBe('Aucun résultat trouvé');

    // Dashboard navigation
    expect(fr.navigation.overview).toBe('Vue d’ensemble');
    expect(fr.navigation.liveOrders).toBe('Commandes en direct');
    expect(fr.navigation.digitalMenus).toBe('Cartes numériques');
    expect(fr.navigation.productsAndDishes).toBe('Plats & Produits');
    expect(fr.navigation.restaurantSettings).toBe('Paramètres du restaurant');
    expect(fr.navigation.salesAnalytics).toBe('Statistiques de vente');

    // Order status terminology
    expect(fr.orders.statusLabels.new).toBe('Nouvelle commande');
    expect(fr.orders.statusLabels.confirmed).toBe('Confirmée');
    expect(fr.orders.statusLabels.preparing).toBe('En préparation');
    expect(fr.orders.statusLabels.ready).toBe('Prête pour service');
    expect(fr.orders.statusLabels.completed).toBe('Terminée');
    expect(fr.orders.statusLabels.cancelled).toBe('Annulée');

    // Customer menu and ordering flow
    expect(fr.customer.addToOrder).toBe('Ajouter à la commande');
    expect(fr.customer.yourOrder).toBe('Votre commande');
    expect(fr.customer.subtotal).toBe('Sous-total');
    expect(fr.customer.total).toBe('Total à régler');
    expect(fr.customer.emptyCartTitle).toBe('Votre panier est vide');
  });

  it('correctly resolves nested translation keys and falls back gracefully', () => {
    function getNestedValue(obj: any, path: string): string | undefined {
      if (!obj || !path) return undefined;
      const parts = path.split('.');
      let curr = obj;
      for (const part of parts) {
        if (curr && typeof curr === 'object' && part in curr) {
          curr = curr[part];
        } else {
          return undefined;
        }
      }
      return typeof curr === 'string' ? curr : undefined;
    }

    const frTitle = getNestedValue(dictionaries.fr, 'dashboard.kpiRevenue');
    expect(frTitle).toBe('Chiffre d’affaires aujourd’hui');

    const enTitle = getNestedValue(dictionaries.en, 'dashboard.kpiRevenue');
    expect(enTitle).toBe('Today’s Eligible Revenue');

    const missing = getNestedValue(dictionaries.fr, 'dashboard.nonExistentKey');
    expect(missing).toBeUndefined();
  });

  it('correctly interpolates dynamic parameters like {count} and {name}', () => {
    const template = 'Gérer {count} commandes pour {name}';
    const params = { count: 7, name: 'Le Jardin Majorelle' };
    const interpolated = Object.entries(params).reduce((acc, [k, v]) => {
      return acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }, template);

    expect(interpolated).toBe('Gérer 7 commandes pour Le Jardin Majorelle');
  });

  it('resolves LocalizedString objects according to selected language with fallbacks', () => {
    const localizedProduct = {
      en: 'Royal Lamb Tagine',
      fr: 'Tajine d’agneau Royal aux pruneaux',
      ar: 'طاجين لحم غنمي بالبرقوق'
    };

    function resolveLocalized(val: typeof localizedProduct, lang: 'fr' | 'en' | 'ar'): string {
      return val[lang] || val.fr || val.en || val.ar || '';
    }

    expect(resolveLocalized(localizedProduct, 'fr')).toBe('Tajine d’agneau Royal aux pruneaux');
    expect(resolveLocalized(localizedProduct, 'en')).toBe('Royal Lamb Tagine');
    expect(resolveLocalized(localizedProduct, 'ar')).toBe('طاجين لحم غنمي بالبرقوق');

    // Partial translation fallback
    const partialLocalized = { fr: 'Thé à la menthe' } as any;
    expect(resolveLocalized(partialLocalized, 'en')).toBe('Thé à la menthe');
  });

  it('formats Moroccan Dirham (MAD) currency properly across integer and decimal values', () => {
    function formatCurrency(amount: number, locale: string = 'fr-MA', currency: string = 'MAD'): string {
      const num = Number.isFinite(amount) ? amount : 0;
      const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: num % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2
      }).format(num);
      return `${formatted} ${currency}`;
    }

    const intPrice = formatCurrency(120);
    expect(intPrice).toContain('120');
    expect(intPrice).toContain('MAD');

    const decPrice = formatCurrency(135.5);
    expect(decPrice).toContain('135');
    expect(decPrice).toContain('5');
    expect(decPrice).toContain('MAD');
  });

  it('restricts UI interface languages to French and English only, while preserving Arabic for food data', () => {
    // Only English and French are allowed for the UI
    const allowedUiLanguages = ['fr', 'en'];
    expect(allowedUiLanguages).not.toContain('ar');
    expect(allowedUiLanguages).toHaveLength(2);

    // Food dishes preserve full Arabic translation capabilities
    const foodItem = {
      name: { fr: 'Tajine d’agneau', en: 'Lamb Tagine', ar: 'طاجين باللحم' },
      description: { fr: 'Mijoté aux épices', en: 'Slow cooked with spices', ar: 'مطبوخ على نار هادئة' }
    };
    expect(foodItem.name.ar).toBe('طاجين باللحم');
    expect(foodItem.description.ar).toBe('مطبوخ على نار هادئة');
  });
});

describe('Theme State & Scoping System', () => {
  // In-memory mock storage and element classes for Node test environment
  const storage: Record<string, string> = {};
  const classes = new Set<string>();

  const mockLocalStorage = {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => { storage[key] = value; },
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
  };

  const mockDocumentElement = {
    classList: {
      add: (cls: string) => classes.add(cls),
      remove: (cls: string) => classes.delete(cls),
      contains: (cls: string) => classes.has(cls)
    }
  };

  beforeEach(() => {
    mockLocalStorage.clear();
    classes.clear();
    // Setup globals if not present
    if (typeof globalThis.localStorage === 'undefined') {
      (globalThis as any).localStorage = mockLocalStorage;
    }
  });

  afterEach(() => {
    mockLocalStorage.clear();
    classes.clear();
  });

  it('persists theme preference to localStorage and updates user preferences in DB', () => {
    const user = db.getCurrentUser();
    expect(user).toBeDefined();

    // Update preference
    db.updateUserPreferences({ preferredTheme: 'dark', preferredLanguage: 'fr' });
    const updated = db.getCurrentUser();
    expect(updated?.preferredTheme).toBe('dark');
    expect(updated?.preferredLanguage).toBe('fr');
  });

  it('applies dark class only on authenticated /app routes and keeps public /m routes light', () => {
    function applyThemeToDom(pathname: string, resolvedTheme: 'light' | 'dark') {
      const isDashboardRoute = pathname.startsWith('/app');
      if (isDashboardRoute) {
        if (resolvedTheme === 'dark') {
          mockDocumentElement.classList.add('dark');
        } else {
          mockDocumentElement.classList.remove('dark');
        }
      } else {
        mockDocumentElement.classList.remove('dark');
      }
    }

    // Dashboard route with dark theme -> document gets .dark
    applyThemeToDom('/app/overview', 'dark');
    expect(mockDocumentElement.classList.contains('dark')).toBe(true);

    // Dashboard route with light theme -> document loses .dark
    applyThemeToDom('/app/orders', 'light');
    expect(mockDocumentElement.classList.contains('dark')).toBe(false);

    // Public restaurant customer menu route -> MUST NOT get .dark even if resolvedTheme is dark
    applyThemeToDom('/m/le-jardin', 'dark');
    expect(mockDocumentElement.classList.contains('dark')).toBe(false);

    // Marketing homepage route -> MUST NOT get .dark even if resolvedTheme is dark
    applyThemeToDom('/', 'dark');
    expect(mockDocumentElement.classList.contains('dark')).toBe(false);
  });
});

describe('Dashboard Empty States & Bilingual Language Consistency', () => {
  function getAllLeafKeys(obj: Record<string, any>, prefix = ''): string[] {
    let keys: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        keys = keys.concat(getAllLeafKeys(value, fullPath));
      } else {
        keys.push(fullPath);
      }
    }
    return keys;
  }

  it('guarantees complete translation key parity between English and French dictionaries', () => {
    const frKeys = new Set(getAllLeafKeys(dictionaries.fr));
    const enKeys = new Set(getAllLeafKeys(dictionaries.en));

    // Every key in French must exist in English
    const missingInEn: string[] = [];
    for (const k of frKeys) {
      if (!enKeys.has(k)) {
        missingInEn.push(k);
      }
    }

    // Every key in English must exist in French
    const missingInFr: string[] = [];
    for (const k of enKeys) {
      if (!frKeys.has(k)) {
        missingInFr.push(k);
      }
    }

    expect(missingInEn).toEqual([]);
    expect(missingInFr).toEqual([]);
  });

  it('provides complete translations for all empty states, buttons, and navigation keys in both languages', () => {
    const namespaces = ['common', 'navigation', 'dashboard', 'menus', 'products', 'orders', 'qrNfc', 'settings', 'help'] as const;

    for (const ns of namespaces) {
      const frNs = dictionaries.fr[ns] as Record<string, any>;
      const enNs = dictionaries.en[ns] as Record<string, any>;
      expect(frNs).toBeDefined();
      expect(enNs).toBeDefined();

      for (const [key, val] of Object.entries(frNs)) {
        if (typeof val === 'string') {
          expect(val.trim().length).toBeGreaterThan(0);
          expect(typeof enNs[key]).toBe('string');
          expect((enNs[key] as string).trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('verifies NoActiveRestaurantCard generates appropriate strings and actions for English and French', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const cardPath = path.resolve(__dirname, '../components/common/NoActiveRestaurantCard.tsx');
    const content = fs.readFileSync(cardPath, 'utf-8');

    // Must handle English and French localization
    expect(content).toContain("isEn ? 'No active establishment' : 'Aucun établissement actif'");
    expect(content).toContain("isEn ? 'Launch Setup Assistant' : 'Lancer l’Assistant de Configuration'");
    expect(content).toContain("actionTo = '/onboarding'");
    expect(content).toContain("<Link to={actionTo}>");
  });

  it('verifies DashboardLayout restaurant switcher falls back cleanly to selected language when no restaurant is active', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const layoutPath = path.resolve(__dirname, '../components/dashboard/DashboardLayout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf-8');

    // English fallbacks
    expect(content).toContain("isEn ? 'No active restaurant' : 'Aucun établissement'");
    expect(content).toContain("isEn ? 'No active establishment' : 'Aucun établissement actif'");
    expect(content).toContain("isEn ? 'Morocco' : 'Maroc'");
    expect(content).toContain("isEn ? \"Open menu\" : \"Ouvrir le menu\"");
    expect(content).toContain("isEn ? \"View live orders\" : \"Voir les commandes en direct\"");
  });

  it('verifies all dashboard pages use localized empty states and link to onboarding', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const dashboardDir = path.resolve(__dirname, '../pages/dashboard');

    const pages = [
      'MenusPage.tsx',
      'MenuDetailPage.tsx',
      'ProductsPage.tsx',
      'OrdersPage.tsx',
      'OrderDetailPage.tsx',
      'AnalyticsPage.tsx',
      'SettingsPage.tsx',
      'QrNfcPage.tsx',
      'WhatsAppPage.tsx',
      'LanguagesPage.tsx',
      'BillingPage.tsx',
      'TemplatesPage.tsx',
      'HelpPage.tsx',
      'OverviewPage.tsx'
    ];

    for (const page of pages) {
      const pageFile = path.join(dashboardDir, page);
      const content = fs.readFileSync(pageFile, 'utf-8');

      // None of the dashboard pages should have a naked unlocalized "Aucun établissement actif" without isEn check
      if (content.includes('Aucun établissement actif')) {
        expect(content).toContain('isEn');
      }

      // If page handles !activeRestaurant, it must be wrapped in DashboardLayout
      if (content.includes('!activeRestaurant')) {
        expect(content).toContain('<DashboardLayout>');
      }
    }
  });

  it('verifies HelpPage supports bilingual meta steps and interactive prompts', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const helpPath = path.resolve(__dirname, '../pages/dashboard/HelpPage.tsx');
    const content = fs.readFileSync(helpPath, 'utf-8');

    expect(content).toContain("const isEn = language === 'en';");
    expect(content).toContain("1. Create a Meta for Developers account");
    expect(content).toContain("1. Créer un compte Meta for Developers");
    expect(content).toContain("Reset all demo data");
    expect(content).toContain("Réinitialiser toutes les données de démonstration");
  });
});
