import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

// Marketing Pages
import { HomePage } from './pages/marketing/HomePage';
import { FeaturesPage } from './pages/marketing/FeaturesPage';
import { PricingPage } from './pages/marketing/PricingPage';
import { AboutPage } from './pages/marketing/AboutPage';
import { ContactPage } from './pages/marketing/ContactPage';
import { LoginPage } from './pages/marketing/LoginPage';
import { SignupPage } from './pages/marketing/SignupPage';
import { ForgotPasswordPage } from './pages/marketing/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/marketing/ResetPasswordPage';
import { ZinaOnboardingPage } from './pages/onboarding/ZinaOnboardingPage';
import { SolutionsIndexPage } from './pages/marketing/SolutionsIndexPage';
import { IndustrySolutionPage } from './pages/marketing/IndustrySolutionPage';
import { BlogIndexPage } from './pages/marketing/BlogIndexPage';
import { BlogArticlePage } from './pages/marketing/BlogArticlePage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Dashboard Pages
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { MenusPage } from './pages/dashboard/MenusPage';
import { MenuDetailPage } from './pages/dashboard/MenuDetailPage';
import { TemplatesPage } from './pages/dashboard/TemplatesPage';
import { ProductsPage } from './pages/dashboard/ProductsPage';
import { OrdersPage } from './pages/dashboard/OrdersPage';
import { OrderDetailPage } from './pages/dashboard/OrderDetailPage';
import { QrNfcPage } from './pages/dashboard/QrNfcPage';
import { LanguagesPage } from './pages/dashboard/LanguagesPage';
import { WhatsAppPage } from './pages/dashboard/WhatsAppPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { BillingPage } from './pages/dashboard/BillingPage';
import { HelpPage } from './pages/dashboard/HelpPage';

// Customer Pages
import { PublicMenuPage } from './pages/customer/PublicMenuPage';
import { OrderConfirmationPage } from './pages/customer/OrderConfirmationPage';

// Super Admin Pages & Guard
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminRestaurantsPage } from './pages/admin/AdminRestaurantsPage';
import { AdminSubscriptionsPage } from './pages/admin/AdminSubscriptionsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminFinancePage } from './pages/admin/AdminFinancePage';
import { AdminAiOperationsPage } from './pages/admin/AdminAiOperationsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSecurityPage } from './pages/admin/AdminSecurityPage';
import { AdminSystemHealthPage } from './pages/admin/AdminSystemHealthPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

const SolutionSlugRedirect: React.FC = () => {
  const { industrySlug } = useParams<{ industrySlug?: string }>();
  return <Navigate to={industrySlug ? `/solutions/${industrySlug}` : '/solutions'} replace />;
};

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* Marketing Website Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/onboarding" element={<ZinaOnboardingPage />} />
                <Route path="/demo" element={<Navigate to="/#demo-section" replace />} />

                {/* Industry Solutions Landing Pages */}
                <Route path="/solutions" element={<SolutionsIndexPage />} />
                <Route path="/solutions/:industrySlug" element={<IndustrySolutionPage />} />
                <Route path="/solution" element={<Navigate to="/solutions" replace />} />
                <Route path="/solution/:industrySlug" element={<SolutionSlugRedirect />} />

                {/* Content Marketing & Knowledge Base (Blog) */}
                <Route path="/blog" element={<BlogIndexPage />} />
                <Route path="/blog/:slug" element={<BlogArticlePage />} />

                {/* Protected Restaurant Dashboard Routes */}
                <Route
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute />
                    </ErrorBoundary>
                  }
                >
                  <Route path="/app" element={<Navigate to="/app/overview" replace />} />
                  <Route path="/app/overview" element={<OverviewPage />} />
                  <Route path="/app/menus" element={<MenusPage />} />
                  <Route path="/app/menus/:menuId" element={<MenuDetailPage />} />
                  <Route path="/app/templates" element={<TemplatesPage />} />
                  <Route path="/app/products" element={<ProductsPage />} />
                  <Route path="/app/orders" element={<OrdersPage />} />
                  <Route path="/app/orders/:orderId" element={<OrderDetailPage />} />
                  <Route path="/app/qr-nfc" element={<QrNfcPage />} />
                  <Route path="/app/languages" element={<LanguagesPage />} />
                  <Route path="/app/whatsapp" element={<WhatsAppPage />} />
                  <Route path="/app/analytics" element={<AnalyticsPage />} />
                  <Route path="/app/settings" element={<SettingsPage />} />
                  <Route path="/app/profile" element={<ProfilePage />} />
                  <Route path="/app/billing" element={<BillingPage />} />
                  <Route path="/app/help" element={<HelpPage />} />
                </Route>

                {/* Dedicated Super Admin Direct Entry Point */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin-portal/login" element={<AdminLoginPage />} />

                {/* Protected Super Admin Platform Governance Routes */}
                <Route
                  element={
                    <ErrorBoundary>
                      <AdminRoute />
                    </ErrorBoundary>
                  }
                >
                  <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
                  <Route path="/admin/overview" element={<AdminOverviewPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/restaurants" element={<AdminRestaurantsPage />} />
                  <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
                  <Route path="/admin/payments" element={<AdminPaymentsPage />} />
                  <Route path="/admin/finance" element={<AdminFinancePage />} />
                  <Route path="/admin/ai-operations" element={<AdminAiOperationsPage />} />
                  <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                  <Route path="/admin/security" element={<AdminSecurityPage />} />
                  <Route path="/admin/system-health" element={<AdminSystemHealthPage />} />
                  <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
                  <Route path="/admin/settings" element={<AdminSettingsPage />} />
                </Route>

                {/* Customer-facing Digital Menu Routes */}
                <Route path="/m/:restaurantSlug" element={<PublicMenuPage />} />
                <Route path="/m/:restaurantSlug/:menuSlug" element={<PublicMenuPage />} />
                <Route path="/order/:publicOrderReference" element={<OrderConfirmationPage />} />

                {/* Catch-all 404 Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
