import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { supabaseService } from '../services/supabaseService';
import { db } from '../services/db';

describe('Dashboard Recovery & Error Boundary System Tests', () => {
  const rootDir = path.resolve(__dirname, '..');

  it('ErrorBoundary component exists, is exported, and renders friendly recovery UI with reload action', () => {
    const errorBoundaryPath = path.join(rootDir, 'components', 'common', 'ErrorBoundary.tsx');
    expect(fs.existsSync(errorBoundaryPath)).toBe(true);
    const content = fs.readFileSync(errorBoundaryPath, 'utf-8');

    expect(content).toContain('class ErrorBoundary extends Component');
    expect(content).toContain('Une erreur inattendue est survenue');
    expect(content).toContain('Rafraîchir la page');
    expect(content).toContain('Tableau de bord');
    expect(content).toContain('window.location.reload()');
  });

  it('App.tsx and DashboardLayout.tsx wrap dashboard routes in ErrorBoundary', () => {
    const appPath = path.join(rootDir, 'App.tsx');
    const appContent = fs.readFileSync(appPath, 'utf-8');
    expect(appContent).toContain('import { ErrorBoundary } from');
    expect(appContent).toContain('<ErrorBoundary>');
    expect(appContent).toContain('<ProtectedRoute />');

    const layoutPath = path.join(rootDir, 'components', 'dashboard', 'DashboardLayout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    expect(layoutContent).toContain('import { ErrorBoundary } from');
    expect(layoutContent).toContain('<ErrorBoundary>');
    expect(layoutContent).toContain('{children}');
  });

  it('AuthContext has deadlock prevention (decoupled loadUserData) and 3500ms safety timeout', () => {
    const authPath = path.join(rootDir, 'context', 'AuthContext.tsx');
    const authContent = fs.readFileSync(authPath, 'utf-8');

    // Deadlock prevention: setTimeout decoupling in onAuthStateChange
    expect(authContent).toContain('setTimeout(() => {');
    expect(authContent).toContain('loadUserData');
    // Safety timeout to ensure session check never hangs indefinitely
    expect(authContent).toContain('Session initialization reached safety timeout');
    expect(authContent).toContain('3500');
  });

  it('ProtectedRoute has timeout fallback to prevent permanent spinning on reload', () => {
    const protectedRoutePath = path.join(rootDir, 'components', 'auth', 'ProtectedRoute.tsx');
    const routeContent = fs.readFileSync(protectedRoutePath, 'utf-8');

    expect(routeContent).toContain('Vérification de session prolongée');
    expect(routeContent).toContain('showTimeoutFallback');
    expect(routeContent).toContain('Réessayer');
    expect(routeContent).toContain('Se reconnecter');
  });

  it('No dashboard page contains bare "if (!activeRestaurant) return null;" that turns screen blank', () => {
    const dashboardPages = [
      'LanguagesPage.tsx',
      'AnalyticsPage.tsx',
      'BillingPage.tsx',
      'ProductsPage.tsx',
      'OrdersPage.tsx',
      'QrNfcPage.tsx',
      'SettingsPage.tsx',
      'TemplatesPage.tsx',
      'WhatsAppPage.tsx'
    ];

    for (const pageName of dashboardPages) {
      const pagePath = path.join(rootDir, 'pages', 'dashboard', pageName);
      const pageContent = fs.readFileSync(pagePath, 'utf-8');

      // None should return null when activeRestaurant is missing
      expect(pageContent).not.toContain('if (!activeRestaurant) return null;');
      expect(pageContent).not.toContain('if (!activeRestaurant || !config) return null;');
      expect(pageContent).not.toContain('if (!restaurant || !activeRestaurant) return null;');
      // Every page should wrap the empty state in DashboardLayout
      expect(pageContent).toContain('Aucun établissement actif');
      expect(pageContent).toContain('<DashboardLayout>');
    }
  });

  it('MenuDetailPage and OrderDetailPage render friendly empty states rather than blank pages', () => {
    const menuDetailPath = path.join(rootDir, 'pages', 'dashboard', 'MenuDetailPage.tsx');
    const menuContent = fs.readFileSync(menuDetailPath, 'utf-8');
    expect(menuContent).not.toContain('if (!menu || !activeRestaurant) return null;');
    expect(menuContent).toContain('Menu introuvable');
    expect(menuContent).toContain('<DashboardLayout>');

    const orderDetailPath = path.join(rootDir, 'pages', 'dashboard', 'OrderDetailPage.tsx');
    const orderContent = fs.readFileSync(orderDetailPath, 'utf-8');
    expect(orderContent).not.toContain('if (!order || !activeRestaurant) return null;');
    expect(orderContent).toContain('Commande introuvable');
    expect(orderContent).toContain('<DashboardLayout>');
  });

  it('supabaseService.mapRestaurantRow provides complete default settings and whatsappConfig for empty database rows', () => {
    const rawRow = {
      id: 'rest_test_empty',
      name: 'Café Test',
      slug: 'cafe-test',
      phone: '+212612345678',
      settings: null,
      whatsapp_config: null
    };

    const mapped = supabaseService.mapRestaurantRow(rawRow);

    expect(mapped.id).toBe('rest_test_empty');
    expect(mapped.settings).toBeDefined();
    expect(mapped.settings.currency).toBe('MAD');
    expect(mapped.settings.taxRatePercent).toBe(10);
    expect(mapped.whatsappConfig).toBeDefined();
    expect(mapped.whatsappConfig.enabled).toBe(true);
    expect(mapped.whatsappConfig.destinationPhoneNumber).toBe('+212612345678');
    expect(mapped.whatsappConfig.templateName).toBe('sofraflow_order_notification_v1');
  });

  it('supabaseService.mapRestaurantRow handles partial settings without throwing undefined errors', () => {
    const rawRow = {
      id: 'rest_partial',
      name: 'Snack Atlas',
      slug: 'snack-atlas',
      phone: '+212522000000',
      settings: {
        currency: 'USD'
      },
      whatsapp_config: {
        enabled: false
      }
    };

    const mapped = supabaseService.mapRestaurantRow(rawRow);

    expect(mapped.settings.currency).toBe('USD');
    expect(mapped.settings.taxRatePercent).toBe(10);
    expect(mapped.settings.tableCount).toBe(12);
    expect(mapped.whatsappConfig.enabled).toBe(false);
    expect(mapped.whatsappConfig.templateName).toBe('sofraflow_order_notification_v1');
  });

  it('Local db initializes cleanly and supports creating new tenant restaurants', () => {
    // Initial state has no unowned dummy records
    expect(db.getRestaurants().length).toBe(0);

    const created = db.createRestaurant({
      ownerId: 'usr_owner_test',
      name: 'Dar Essalam',
      slug: 'dar-essalam'
    });
    expect(created.id).toBeDefined();
    expect(created.settings).toBeDefined();
    expect(created.settings.currency).toBe('MAD');
    expect(created.whatsappConfig).toBeDefined();
    expect(created.whatsappConfig.enabled).toBe(true);

    const owned = db.getRestaurants('usr_owner_test');
    expect(owned.length).toBe(1);
    expect(owned[0].name).toBe('Dar Essalam');
  });
});
