import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Layers,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { adminService } from '../../services/adminService';
import { PlatformExecutiveAnalytics } from '../../types';

export const AdminAnalyticsPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [analytics, setAnalytics] = useState<PlatformExecutiveAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getPlatformAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('[AdminAnalyticsPage] Error loading analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalUsers = analytics?.totalUsers || 1;
  const totalRestaurants = analytics?.totalRestaurants || 1;
  const publishedMenus = analytics?.publishedMenusCount || 0;
  const activeSubs = analytics?.activeSubscriptionsCount || 0;

  // Real funnel steps
  const funnelData = [
    { step: isEn ? 'Signups' : 'Inscriptions', count: totalUsers, rate: '100%' },
    { step: isEn ? 'Establishment Created' : 'Établissement Créé', count: totalRestaurants, rate: `${Math.round((totalRestaurants / totalUsers) * 100)}%` },
    { step: isEn ? 'Menu Published' : 'Carte Publiée', count: publishedMenus, rate: `${Math.round((publishedMenus / totalRestaurants) * 100)}%` },
    { step: isEn ? 'Paid Subscription' : 'Abonnement Payé', count: activeSubs, rate: `${Math.round((activeSubs / totalRestaurants) * 100)}%` }
  ];

  return (
    <AdminLayout
      title={isEn ? 'Platform Conversion & Product Analytics' : 'Analytique Produit & Entonnoir de Conversion'}
      subtitle={
        isEn
          ? 'Track real user onboarding completion, restaurant activation rates, and feature adoption.'
          : 'Mesure de la complétion du parcours d’onboarding, taux d’activation des établissements et adoption produit.'
      }
      actions={
        <button
          onClick={loadData}
          disabled={isLoading}
          className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] text-[var(--text-secondary)] hover:text-amber-500 bg-[var(--bg-card)] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      }
    >
      {/* Funnel Overview */}
      <div className="rounded-2xl p-5 bg-[var(--bg-card)] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
        <h3 className="text-sm font-bold text-[var(--text-primary)] font-display tracking-tight mb-4">
          {isEn ? 'SaaS Merchant Onboarding & Activation Funnel' : 'Entonnoir d’Activation des Commerçants (Données Réelles)'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {funnelData.map((f, i) => (
            <div key={i} className="group p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] hover:border-amber-500/30 transition-all">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                {f.step}
              </span>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-2xl font-black text-[var(--text-primary)] font-display tracking-tight">
                  {f.count}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {f.rate}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-white/[0.08] h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: f.rate }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Adoption Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5 space-y-3 bg-[var(--bg-card)] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <h3 className="text-sm font-bold text-[var(--text-primary)] font-display tracking-tight">
            {isEn ? 'Establishment Activation Rate' : 'Taux d’Activation des Établissements'}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {isEn
              ? 'Percentage of created restaurants that have completed menu setup and published their QR code.'
              : 'Pourcentage de restaurants ayant finalisé leur carte digitale et publié leur QR code.'}
          </p>

          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display tracking-tight">
                {Math.round((publishedMenus / Math.max(1, totalRestaurants)) * 100)}%
              </div>
              <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                {publishedMenus} / {totalRestaurants} {isEn ? 'establishments live' : 'établissements en ligne'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5 space-y-3 bg-[var(--bg-card)] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <h3 className="text-sm font-bold text-[var(--text-primary)] font-display tracking-tight">
            {isEn ? 'AI Menu Generation Adoption' : 'Adoption du Générateur IA Zina'}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {isEn
              ? 'Utilization of Zina AI menu creation and smart OCR extraction features.'
              : 'Utilisation de l’assistant IA Zina pour la numérisation des cartes physiques.'}
          </p>

          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-display tracking-tight">
                {analytics?.totalAiRequests || 0}
              </div>
              <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                {isEn ? 'AI operations recorded to date' : 'opérations IA exécutées à date'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
