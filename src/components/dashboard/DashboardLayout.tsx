import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  BookOpen,
  ShoppingBag,
  QrCode,
  Globe,
  MessageSquare,
  BarChart3,
  Settings,
  CreditCard,
  HelpCircle,
  ExternalLink,
  LogOut,
  Menu as MenuIcon,
  X,
  ChevronDown,
  Store,
  Bell
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import { LanguageSelector } from '../common/LanguageSelector';
import { db } from '../../services/db';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [restaurantDropdownOpen, setRestaurantDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, activeRestaurant, allRestaurants, switchRestaurant, logout, isDemoMode } = useAuth();
  const { t } = useLanguage();

  const newOrdersCount = activeRestaurant
    ? db.getOrders(activeRestaurant.id).filter(o => o.status === 'new').length
    : 0;

  const navigation = [
    { name: t('navigation.overview'), href: '/app/overview', icon: LayoutDashboard },
    { name: t('navigation.liveOrders'), href: '/app/orders', icon: ShoppingBag, badge: newOrdersCount > 0 ? newOrdersCount : undefined },
    { name: t('navigation.digitalMenus'), href: '/app/menus', icon: BookOpen },
    { name: t('navigation.productsAndDishes'), href: '/app/products', icon: UtensilsCrossed },
    { name: t('navigation.qrNfcStudio'), href: '/app/qr-nfc', icon: QrCode },
    { name: t('navigation.languages'), href: '/app/languages', icon: Globe },
    { name: t('navigation.whatsappApi'), href: '/app/whatsapp', icon: MessageSquare },
    { name: t('navigation.salesAnalytics'), href: '/app/analytics', icon: BarChart3 },
    { name: t('navigation.restaurantSettings'), href: '/app/settings', icon: Settings },
    { name: t('navigation.subscriptionBilling'), href: '/app/billing', icon: CreditCard },
    { name: t('navigation.setupGuideHelp'), href: '/app/help', icon: HelpCircle }
  ];

  const isActive = (path: string) => {
    if (path === '/app/menus' && location.pathname.startsWith('/app/menus')) return true;
    if (path === '/app/orders' && location.pathname.startsWith('/app/orders')) return true;
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const publicMenuUrl = activeRestaurant ? `/m/${activeRestaurant.slug}` : '/';

  return (
    <div className="min-h-screen bg-ivory dark:bg-[#0C1814] text-ink-main dark:text-[#F0F4F2] flex font-sans transition-colors duration-150">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-white dark:bg-[#101E1A] border-r border-border-subtle dark:border-[#233831] fixed inset-y-0 z-30 transition-colors">
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-border-subtle dark:border-[#233831]">
          <Logo showTagline={false} size="sm" linkTo="/app/overview" />
          {isDemoMode && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold/20 text-gold-hover dark:text-gold border border-gold/30">
              DEMO
            </span>
          )}
        </div>

        {/* Restaurant Tenant Switcher */}
        <div className="p-4 border-b border-border-subtle dark:border-[#233831] relative">
          <div className="text-[10px] font-bold text-ink-secondary dark:text-[#97A7A0] uppercase tracking-wider mb-1.5 px-2">
            {t('navigation.activeRestaurant')}
          </div>
          <button
            onClick={() => setRestaurantDropdownOpen(!restaurantDropdownOpen)}
            className="w-full p-2.5 rounded-2xl bg-ivory dark:bg-[#152520] hover:bg-ivory-dark dark:hover:bg-[#1B2F29] border border-border-subtle dark:border-[#233831] flex items-center justify-between transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-forest dark:bg-gold text-white dark:text-forest-dark flex items-center justify-center font-bold text-xs flex-shrink-0">
                {activeRestaurant?.name.charAt(0) || 'R'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-ink-main dark:text-[#F0F4F2] truncate">
                  {activeRestaurant?.name || 'My Restaurant'}
                </p>
                <p className="text-[10px] text-ink-secondary dark:text-[#97A7A0] truncate">
                  {activeRestaurant?.city}, {activeRestaurant?.country}
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-ink-secondary dark:text-[#97A7A0] flex-shrink-0 ml-1" />
          </button>

          {/* Restaurant dropdown list */}
          {restaurantDropdownOpen && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-[#14241F] rounded-2xl shadow-elevated border border-border-subtle dark:border-[#233831] p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[11px] font-semibold text-ink-secondary dark:text-[#97A7A0] px-3 py-1.5">
                {t('navigation.switchRestaurant')} :
              </div>
              {allRestaurants.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    switchRestaurant(r.id);
                    setRestaurantDropdownOpen(false);
                  }}
                  className={`w-full p-2 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                    r.id === activeRestaurant?.id
                      ? 'bg-forest/10 dark:bg-gold/15 text-forest dark:text-gold font-bold'
                      : 'text-ink-main dark:text-[#F0F4F2] hover:bg-ivory dark:hover:bg-[#1B2F29]'
                  }`}
                >
                  <span className="truncate">{r.name}</span>
                  {r.id === activeRestaurant?.id && <span className="text-forest dark:text-gold text-xs">✓</span>}
                </button>
              ))}
              <div className="pt-2 mt-2 border-t border-border-subtle dark:border-[#233831]">
                <Link
                  to="/signup"
                  onClick={() => setRestaurantDropdownOpen(false)}
                  className="w-full p-2 rounded-xl text-xs font-semibold text-forest dark:text-gold hover:bg-forest-light dark:hover:bg-[#1B2F29] flex items-center gap-2"
                >
                  <Store className="w-3.5 h-3.5" />
                  {t('navigation.registerRestaurant')}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  active
                    ? 'bg-forest text-white shadow-soft font-semibold dark:bg-[#1F3D33] dark:text-[#F0F4F2]'
                    : 'text-ink-secondary dark:text-[#97A7A0] hover:text-ink-main dark:hover:text-[#F0F4F2] hover:bg-ivory dark:hover:bg-[#152520]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-gold' : 'text-ink-secondary dark:text-[#97A7A0]'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      active ? 'bg-gold text-forest-dark' : 'bg-status-error text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border-subtle dark:border-[#233831] space-y-3">
          {/* Public customer menu preview link */}
          <Link
            to={publicMenuUrl}
            target="_blank"
            className="w-full p-2.5 rounded-xl bg-forest-light dark:bg-[#1C332B] hover:bg-forest/15 dark:hover:bg-[#254238] text-forest dark:text-[#E2EBE6] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <span>{t('navigation.viewPublicMenu')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* User profile & logout */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="overflow-hidden">
              <p className="font-semibold text-ink-main dark:text-[#F0F4F2] truncate">{user?.fullName || 'Manager'}</p>
              <p className="text-[10px] text-ink-secondary dark:text-[#97A7A0] truncate">{user?.email || 'owner@restaurant.ma'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-ink-secondary dark:text-[#97A7A0] hover:text-status-error hover:bg-status-error-bg dark:hover:bg-[#2E1414] transition-colors"
              title={t('navigation.signOut')}
              aria-label={t('navigation.signOut')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 h-16 bg-white/90 dark:bg-[#101E1A]/90 backdrop-blur-md border-b border-border-subtle dark:border-[#233831] px-4 sm:px-8 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-ink-main dark:text-[#F0F4F2] hover:bg-ivory dark:hover:bg-[#152520] border border-border-subtle dark:border-[#233831]"
              aria-label="Ouvrir le menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-forest dark:text-[#F0F4F2] font-display">
                {activeRestaurant?.name || t('common.dashboard')}
              </h2>
              {activeRestaurant?.whatsappConfig.enabled && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-status-success-bg dark:bg-[#102B20] text-status-success dark:text-[#4ADE80] border border-status-success/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success dark:bg-[#4ADE80]" />
                  {t('dashboard.whatsappLive')}
                </span>
              )}
            </div>
          </div>

          {/* Right Header Actions: Theme Switcher, Language Selector, Customer View, Notifications */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Switcher */}
            <ThemeSwitcher compact={true} />

            {/* Language Selector */}
            <LanguageSelector variant="dropdown" />

            {/* Customer Menu Link */}
            <Link
              to={publicMenuUrl}
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-border-subtle dark:border-[#233831] text-forest dark:text-gold hover:bg-ivory dark:hover:bg-[#152520] transition-colors"
            >
              <span>{t('navigation.customerView')}</span>
              <ExternalLink className="w-3.5 h-3.5 text-ink-secondary dark:text-[#97A7A0]" />
            </Link>

            {/* Orders bell notification */}
            <Link
              to="/app/orders"
              className="relative p-2 rounded-xl text-ink-secondary dark:text-[#97A7A0] hover:text-forest dark:hover:text-gold hover:bg-ivory dark:hover:bg-[#152520] transition-colors"
              aria-label="Voir les commandes en direct"
            >
              <Bell className="w-5 h-5" />
              {newOrdersCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-status-error ring-2 ring-white dark:ring-[#101E1A]" />
              )}
            </Link>
          </div>
        </header>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#101E1A] h-full flex flex-col shadow-elevated z-10 animate-in slide-in-from-left duration-200">
              <div className="h-16 px-5 flex items-center justify-between border-b border-border-subtle dark:border-[#233831]">
                <Logo size="sm" showTagline={false} />
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-ink-secondary dark:text-[#97A7A0] hover:bg-ivory dark:hover:bg-[#152520]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile theme and language row */}
              <div className="px-4 py-3 border-b border-border-subtle dark:border-[#233831] flex items-center justify-between">
                <ThemeSwitcher compact={true} />
                <LanguageSelector variant="segmented" />
              </div>

              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium ${
                        active
                          ? 'bg-forest dark:bg-[#1F3D33] text-white font-semibold'
                          : 'text-ink-secondary dark:text-[#97A7A0] hover:bg-ivory dark:hover:bg-[#152520]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-error text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border-subtle dark:border-[#233831] space-y-2">
                <Link
                  to={publicMenuUrl}
                  target="_blank"
                  className="w-full py-2.5 rounded-xl bg-forest dark:bg-gold text-white dark:text-forest-dark text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <span>{t('navigation.viewPublicMenu')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 text-xs font-semibold text-status-error flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> {t('navigation.signOut')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
