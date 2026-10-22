import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { ZinaOnboardingPage } from './pages/onboarding/ZinaOnboardingPage';
import { SolutionsIndexPage } from './pages/marketing/SolutionsIndexPage';
import { IndustrySolutionPage } from './pages/marketing/IndustrySolutionPage';
import { BlogIndexPage } from './pages/marketing/BlogIndexPage';
import { BlogArticlePage } from './pages/marketing/BlogArticlePage';

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
import { BillingPage } from './pages/dashboard/BillingPage';
import { HelpPage } from './pages/dashboard/HelpPage';

// Customer Pages
import { PublicMenuPage } from './pages/customer/PublicMenuPage';
import { OrderConfirmationPage } from './pages/customer/OrderConfirmationPage';

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
                <Route path="/onboarding" element={<ZinaOnboardingPage />} />
                <Route path="/demo" element={<Navigate to="/#demo-section" replace />} />

                {/* Industry Solutions Landing Pages */}
                <Route path="/solutions" element={<SolutionsIndexPage />} />
                <Route path="/solutions/:industrySlug" element={<IndustrySolutionPage />} />

                {/* Content Marketing & Knowledge Base (Blog) */}
                <Route path="/blog" element={<BlogIndexPage />} />
                <Route path="/blog/:slug" element={<BlogArticlePage />} />

                {/* Restaurant Dashboard Routes */}
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
                <Route path="/app/billing" element={<BillingPage />} />
                <Route path="/app/help" element={<HelpPage />} />

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
