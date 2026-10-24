import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  BadgeCheck,
  Receipt,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Activity,
  FileText,
  Settings,
  Store,
  LogOut,
  Menu as MenuIcon,
  X,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import { LanguageSelector } from '../common/LanguageSelector';
import { adminService } from '../../services/adminService';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  actions
}) => {
  const { user, logout, mfaAssuranceLevel } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    async function loadPendingCount() {
      try {
        const payments = await adminService.getAllPaymentRequests();
        const pending = payments.filter(p => p.status === 'pending' || p.status === 'under_review').length;
        if (isMounted) setPendingPaymentsCount(pending);
      } catch {}
    }
    loadPendingCount();
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const navItems = [
    {
      to: '/admin/overview',
      icon: LayoutDashboard,
      label: isEn ? 'Executive Overview' : 'Vue d’Ensemble'
    },
    {
      to: '/admin/users',
      icon: Users,
      label: isEn ? 'User Accounts' : 'Utilisateurs'
    },
    {
      to: '/admin/restaurants',
      icon: Building2,
      label: isEn ? 'Establishments' : 'Établissements'
    },
    {
      to: '/admin/subscriptions',
      icon: CreditCard,
      label: isEn ? 'Subscriptions' : 'Abonnements'
    },
    {
      to: '/admin/payments',
      icon: BadgeCheck,
      label: isEn ? 'Bank Transfers' : 'Rapprochement Virements',
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined
    },
    {
      to: '/admin/finance',
      icon: Receipt,
      label: isEn ? 'Finance & Expenses' : 'Finances & Dépenses'
    },
    {
      to: '/admin/ai-operations',
      icon: Sparkles,
      label: isEn ? 'Zina AI Operations' : 'Opérations IA Zina'
    },
    {
      to: '/admin/analytics',
      icon: BarChart3,
      label: isEn ? 'Platform Analytics' : 'Analytique & Croissance'
    },
    {
      to: '/admin/security',
      icon: ShieldCheck,
      label: isEn ? 'Security Center' : 'Sécurité & Accès'
    },
    {
      to: '/admin/system-health',
      icon: Activity,
      label: isEn ? 'System Health' : 'Santé & Latence'
    },
    {
      to: '/admin/audit-logs',
      icon: FileText,
      label: isEn ? 'Audit Trail' : 'Journal d’Audit'
    },
    {
      to: '/admin/settings',
      icon: Settings,
      label: isEn ? 'Admin Settings' : 'Configuration Plateforme'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex font-sans transition-colors duration-200 relative overflow-x-hidden">
      {/* ATMOSPHERIC AMBIENT AURA GLOWS */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-gradient-to-br from-orange-500/8 via-amber-500/4 to-transparent rounded-full blur-3xl" />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-purple-500/8 via-indigo-500/4 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-[650px] h-[650px] bg-gradient-to-tr from-emerald-500/6 via-cyan-500/4 to-transparent rounded-full blur-3xl" />
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-card)]/80 dark:bg-[#0A101D]/80 backdrop-blur-xl shrink-0 z-20 shadow-[1px_0_30px_0_rgba(0,0,0,0.03)]">
        {/* Brand header */}
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <Link to="/admin/overview" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 p-[1px] shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full rounded-[15px] bg-[#0A101D] flex items-center justify-center text-white font-black text-xs font-display tracking-wider">
                SF
              </div>
            </div>
            <div>
              <span className="font-black text-sm text-[var(--text-primary)] tracking-tight font-display block">
                SOFRAFLOW
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 block">
                Super Admin
              </span>
            </div>
          </Link>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-xs">
            <Lock className="w-2.5 h-2.5" />
            AAL2
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          <div className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-secondary)] opacity-70">
            {isEn ? 'Platform Governance' : 'Gouvernance Plateforme'}
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent text-orange-600 dark:text-orange-400 border-l-2 border-orange-500 font-bold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]/70 hover:text-[var(--text-primary)] hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-xs ${
                      isActive
                        ? 'bg-orange-600 text-white shadow-orange-500/30'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[var(--border-subtle)] space-y-1.5 bg-[var(--bg-card)]/90 backdrop-blur-md">
          <Link
            to="/app/overview"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-orange-600 dark:hover:text-orange-400 transition-all border border-transparent hover:border-[var(--border-subtle)]"
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4" />
              <span>{isEn ? 'Restaurant Workspace' : 'Espace Restaurant'}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{isEn ? 'Sign Out' : 'Déconnexion'}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative z-10">
        {/* TOP BAR */}
        <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors"
              aria-label="Open navigation"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                  SOFRAFLOW CONTROL
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] opacity-60">•</span>
                <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)]">
                  v1.0.0
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-[var(--text-primary)] font-display tracking-tight truncate">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {actions}
            <div className="hidden sm:block h-5 w-px bg-[var(--border-subtle)]" />
            <ThemeSwitcher compact />
            <LanguageSelector variant="compact" />
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {subtitle && (
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] -mt-2">
              {subtitle}
            </p>
          )}
          {children}
        </main>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-72 max-w-xs bg-[var(--bg-card)] border-r border-[var(--border-subtle)] flex flex-col z-10 shadow-2xl">
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-xs font-display">
                  SF
                </div>
                <div>
                  <span className="font-bold text-xs block text-[var(--text-primary)] font-display">SOFRAFLOW</span>
                  <span className="text-[10px] font-extrabold text-orange-500 uppercase tracking-wider block">Super Admin</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                      isActive
                        ? 'bg-orange-600 text-white font-bold shadow-xs'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white text-orange-600">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-3 border-t border-[var(--border-subtle)] space-y-2">
              <Link
                to="/app/overview"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:text-orange-500 font-medium"
              >
                <Store className="w-4 h-4" />
                <span>{isEn ? 'Restaurant Workspace' : 'Espace Restaurant'}</span>
              </Link>
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>{isEn ? 'Sign Out' : 'Déconnexion'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
