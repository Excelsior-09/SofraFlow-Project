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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-orange text-white font-bold text-xs hover:bg-orange-700 transition-colors shadow-sm"
        >
          <span>{isEn ? 'Payment Queue' : 'File des Virements'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      {/* Plan Distribution Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Starter</span>
            <span className="text-[10px] font-mono text-blue-600 font-bold">199 MAD/m</span>
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)] font-display mt-2">
            {planStats.starter}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            {isEn ? 'Basic digital QR menu' : 'Menu digital QR basique'}
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Growth</span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold">399 MAD/m</span>
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)] font-display mt-2">
            {planStats.growth}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            {isEn ? 'WhatsApp dispatch & branding' : 'Intégration WhatsApp & marque'}
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-brand-orange">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Pro VIP</span>
            <span className="text-[10px] font-mono text-brand-orange font-bold">799 MAD/m</span>
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)] font-display mt-2">
            {planStats.pro}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            {isEn ? 'Unlimited AI Zina & analytics' : 'IA Zina illimitée & analyses'}
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Enterprise</span>
            <span className="text-[10px] font-mono text-purple-600 font-bold">Sur devis</span>
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)] font-display mt-2">
            {planStats.enterprise}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            {isEn ? 'Multi-chain custom' : 'Réseaux & multi-établissements'}
          </div>
        </Card>
      </div>

      {/* Filter and Table */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder={isEn ? 'Search by restaurant or owner...' : 'Recherche par restaurant ou gérant...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              <option value="all">{isEn ? 'All Plans' : 'Toutes les Formules'}</option>
              <option value="starter">Starter (199 MAD)</option>
              <option value="growth">Growth (399 MAD)</option>
              <option value="pro">Pro VIP (799 MAD)</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-card-hover)] text-[var(--text-secondary)] uppercase text-[10px] tracking-wider border-b border-[var(--border-subtle)]">
              <tr>
                <th className="py-3 px-4">{isEn ? 'Restaurant' : 'Établissement'}</th>
                <th className="py-3 px-4">{isEn ? 'Owner' : 'Propriétaire'}</th>
                <th className="py-3 px-4">{isEn ? 'Active Plan' : 'Formule Active'}</th>
                <th className="py-3 px-4">{isEn ? 'Subscription Status' : 'Statut Abonnement'}</th>
                <th className="py-3 px-4">{isEn ? 'Created At' : 'Date d’Adhésion'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--text-secondary)]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-orange" />
                    <span>{isEn ? 'Loading subscriptions...' : 'Chargement des abonnements...'}</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--text-secondary)]">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <span>{isEn ? 'No subscriptions found.' : 'Aucun abonnement trouvé.'}</span>
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[var(--text-primary)]">{r.name}</div>
                      <div className="text-[11px] text-[var(--text-secondary)] font-mono">/{r.slug}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[var(--text-primary)]">{r.ownerName || '—'}</div>
                      <div className="text-[11px] text-[var(--text-secondary)] font-mono">{r.ownerPhone || '—'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="neutral" size="sm" className="uppercase font-mono">
                        {r.subscriptionPlan}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={r.subscriptionStatus === 'active' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {r.subscriptionStatus}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-[var(--text-secondary)]">
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
      </Card>
    </AdminLayout>
  );
};
