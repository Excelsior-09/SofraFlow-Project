import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Search,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { adminService } from '../../services/adminService';
import { AdminRestaurantRecord } from '../../types';

export const AdminSubscriptionsPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [restaurants, setRestaurants] = useState<AdminRestaurantRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllRestaurants();
      setRestaurants(data);
    } catch (err) {
      console.error('[AdminSubscriptionsPage] Error loading subscriptions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = restaurants.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.ownerName && r.ownerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPlan = planFilter === 'all' || r.subscriptionPlan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const planStats = {
    starter: restaurants.filter(r => r.subscriptionPlan === 'starter').length,
    growth: restaurants.filter(r => r.subscriptionPlan === 'growth').length,
    pro: restaurants.filter(r => r.subscriptionPlan === 'pro').length,
    enterprise: restaurants.filter(r => r.subscriptionPlan === 'enterprise').length
  };

  return (
    <AdminLayout
      title={isEn ? 'Subscription & Entitlements Governance' : 'Gestion des Abonnements & Formules'}
      subtitle={
        isEn
          ? 'Track all restaurant subscription tiers, entitlement limits, and plan statuses.'
          : 'Suivi des formules d’abonnement actives, droits associés et états de renouvellement.'
      }
      actions={
        <Link
          to="/admin/payments"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs transition-all shadow-md shadow-orange-500/20 active:scale-[0.98]"
        >
          <span>{isEn ? 'Payment Queue' : 'File des Virements'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      {/* Plan Distribution Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Starter */}
        <div className="group relative rounded-2xl p-4 transition-all duration-300 bg-[var(--bg-card)] border border-blue-500/20 dark:border-blue-500/30 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 font-display">Starter</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">199 MAD/m</span>
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)] font-display tracking-tight mt-2.5">
            {planStats.starter}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1 font-medium">
            {isEn ? 'Basic digital QR menu' : 'Menu digital QR basique'}
          </div>
        </div>

        {/* Growth */}
        <div className="group relative rounded-2xl p-4 transition-all duration-300 bg-[var(--bg-card)] border border-emerald-500/20 dark:border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-display">Growth</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">399 MAD/m</span>
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)] font-display tracking-tight mt-2.5">
            {planStats.growth}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1 font-medium">
            {isEn ? 'WhatsApp dispatch & branding' : 'Intégration WhatsApp & marque'}
          </div>
        </div>

        {/* Pro VIP */}
        <div className="group relative rounded-2xl p-4 transition-all duration-300 bg-[var(--bg-card)] border border-amber-500/30 dark:border-amber-500/40 hover:border-amber-500/60 shadow-sm hover:shadow-lg hover:shadow-amber-500/10">
          <div className="flex justify-between items-center">
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 font-display">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Pro VIP
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">799 MAD/m</span>
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)] font-display tracking-tight mt-2.5">
            {planStats.pro}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1 font-medium">
            {isEn ? 'Unlimited AI Zina & analytics' : 'IA Zina illimitée & analyses'}
          </div>
        </div>

        {/* Enterprise */}
        <div className="group relative rounded-2xl p-4 transition-all duration-300 bg-[var(--bg-card)] border border-purple-500/20 dark:border-purple-500/30 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 font-display">Enterprise</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">Sur devis</span>
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)] font-display tracking-tight mt-2.5">
            {planStats.enterprise}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1 font-medium">
            {isEn ? 'Multi-chain custom' : 'Réseaux & multi-établissements'}
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="rounded-2xl p-4 bg-[var(--bg-card)] border border-slate-200/80 dark:border-white/[0.08]">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder={isEn ? 'Search by restaurant or owner...' : 'Recherche par restaurant ou gérant...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[var(--bg-page)] border border-slate-200 dark:border-white/[0.08] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-[var(--bg-page)] border border-slate-200 dark:border-white/[0.08] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all font-medium"
            >
              <option value="all">{isEn ? 'All Plans' : 'Toutes les Formules'}</option>
              <option value="starter">Starter (199 MAD)</option>
              <option value="growth">Growth (399 MAD)</option>
              <option value="pro">Pro VIP (799 MAD)</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/[0.02] text-[var(--text-secondary)] uppercase text-[10px] tracking-wider font-semibold border-b border-slate-200/80 dark:border-white/[0.06]">
              <tr>
                <th className="py-3 px-4">{isEn ? 'Restaurant' : 'Établissement'}</th>
                <th className="py-3 px-4">{isEn ? 'Owner' : 'Propriétaire'}</th>
                <th className="py-3 px-4">{isEn ? 'Active Plan' : 'Formule Active'}</th>
                <th className="py-3 px-4">{isEn ? 'Subscription Status' : 'Statut Abonnement'}</th>
                <th className="py-3 px-4">{isEn ? 'Created At' : 'Date d’Adhésion'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--text-secondary)]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    <span className="font-medium">{isEn ? 'Loading subscriptions...' : 'Chargement des abonnements...'}</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--text-secondary)]">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30 text-[var(--text-secondary)]" />
                    <span className="font-medium">{isEn ? 'No subscriptions found.' : 'Aucun abonnement trouvé.'}</span>
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[var(--text-primary)] font-display">{r.name}</div>
                      <div className="text-[11px] text-[var(--text-secondary)] font-mono">/{r.slug}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[var(--text-primary)]">{r.ownerName || '—'}</div>
                      <div className="text-[11px] text-[var(--text-secondary)] font-mono">{r.ownerPhone || '—'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
                        {r.subscriptionPlan}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={r.subscriptionStatus === 'active' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {r.subscriptionStatus}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-[var(--text-secondary)] font-mono">
                      {new Date(r.createdAt).toLocaleDateString(isEn ? 'en-US' : 'fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
