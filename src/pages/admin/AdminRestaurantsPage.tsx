import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  MapPin,
  UtensilsCrossed,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Phone,
  Power,
  PowerOff,
  ExternalLink
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useLanguage } from '../../context/LanguageContext';
import { adminService } from '../../services/adminService';
import { AdminRestaurantRecord } from '../../types';

export const AdminRestaurantsPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [restaurants, setRestaurants] = useState<AdminRestaurantRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRest, setSelectedRest] = useState<AdminRestaurantRecord | null>(null);

  // Status toggle modal state
  const [togglingRest, setTogglingRest] = useState<AdminRestaurantRecord | null>(null);
  const [toggleReason, setToggleReason] = useState('');
  const [isSubmittingToggle, setIsSubmittingToggle] = useState(false);

  const loadRestaurants = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllRestaurants();
      setRestaurants(data);
    } catch (err) {
      console.error('[AdminRestaurantsPage] Error loading restaurants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const handleToggleStatus = async () => {
    if (!togglingRest) return;
    const newStatus = togglingRest.status === 'active' ? 'suspended' : 'active';

    setIsSubmittingToggle(true);
    try {
      const ok = await adminService.toggleRestaurantStatus(
        togglingRest.id,
        newStatus,
        toggleReason.trim() || undefined
      );

      if (ok) {
        setTogglingRest(null);
        setToggleReason('');
        await loadRestaurants();
      } else {
        alert(isEn ? 'Failed to update restaurant status' : 'Échec de la modification du statut');
      }
    } catch (err: any) {
      alert(err.message || (isEn ? 'Action failed' : 'Erreur'));
    } finally {
      setIsSubmittingToggle(false);
    }
  };

  const filtered = restaurants.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout
      title={isEn ? 'Establishment Directory' : 'Répertoire des Établissements'}
      subtitle={
        isEn
          ? 'Monitor and manage all restaurant accounts, menu publication status, and operational health.'
          : 'Suivi des restaurants, états de publication des cartes et gestion opérationnelle des comptes.'
      }
      actions={
        <button
          onClick={loadRestaurants}
          disabled={isLoading}
          className="p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-brand-orange transition-colors"
          title="Actualiser"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      }
    >
      {/* Search and Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder={isEn ? 'Search by name, slug, city...' : 'Rechercher par nom, slug, ville...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              <option value="all">{isEn ? 'All Statuses' : 'Tous les Statuts'}</option>
              <option value="active">{isEn ? 'Active' : 'Actif'}</option>
              <option value="suspended">{isEn ? 'Suspended' : 'Suspendu'}</option>
              <option value="inactive">{isEn ? 'Inactive' : 'Inactif'}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Restaurants Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-card-hover)] text-[var(--text-secondary)] uppercase text-[10px] tracking-wider border-b border-[var(--border-subtle)]">
              <tr>
                <th className="py-3 px-4">{isEn ? 'Restaurant / Slug' : 'Établissement / Slug'}</th>
                <th className="py-3 px-4">{isEn ? 'City' : 'Ville'}</th>
                <th className="py-3 px-4">{isEn ? 'Owner' : 'Propriétaire'}</th>
                <th className="py-3 px-4">{isEn ? 'Plan' : 'Formule'}</th>
                <th className="py-3 px-4">{isEn ? 'Published Menus' : 'Menus en Ligne'}</th>
                <th className="py-3 px-4">{isEn ? 'Status' : 'Statut'}</th>
                <th className="py-3 px-4 text-right">{isEn ? 'Actions' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-secondary)]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-orange" />
                    <span>{isEn ? 'Loading restaurants...' : 'Chargement des établissements...'}</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-secondary)]">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <span>{isEn ? 'No establishments found.' : 'Aucun établissement trouvé.'}</span>
                  </td>
                </tr>
              ) : (
                filtered.map(rest => (
                  <tr key={rest.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[var(--text-primary)]">{rest.name}</div>
                      <div className="text-[11px] font-mono text-[var(--text-secondary)] mt-0.5">
                        /{rest.slug}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-primary)]">
                        <MapPin className="w-3 h-3 text-brand-orange" />
                        <span>{rest.city}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[var(--text-primary)]">{rest.ownerName || '—'}</div>
                      <div className="text-[11px] text-[var(--text-secondary)] font-mono">{rest.ownerPhone || '—'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="neutral" size="sm" className="uppercase font-mono">
                        {rest.subscriptionPlan}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-[11px]">
                      {rest.publishedMenuCount > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {rest.publishedMenuCount} {isEn ? 'live' : 'actif(s)'}
                        </span>
                      ) : (
                        <span className="text-[var(--text-secondary)] font-normal">
                          {isEn ? 'Draft only' : 'Brouillon'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          rest.status === 'active'
                            ? 'success'
                            : rest.status === 'suspended'
                            ? 'error'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {rest.status === 'active'
                          ? (isEn ? 'Active' : 'Actif')
                          : rest.status === 'suspended'
                          ? (isEn ? 'Suspended' : 'Suspendu')
                          : (isEn ? 'Inactive' : 'Inactif')}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRest(rest)}
                          className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-brand-orange hover:border-brand-orange transition-colors"
                          title="Voir la fiche"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setTogglingRest(rest)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            rest.status === 'active'
                              ? 'border-rose-500/20 text-rose-600 hover:bg-rose-500/10'
                              : 'border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10'
                          }`}
                          title={rest.status === 'active' ? 'Suspendre' : 'Réactiver'}
                        >
                          {rest.status === 'active' ? (
                            <PowerOff className="w-3.5 h-3.5" />
                          ) : (
                            <Power className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Details Modal */}
      {selectedRest && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRest(null)}
          title={isEn ? 'Establishment Details' : 'Fiche Établissement'}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Nom :</span>
                <span className="font-bold text-[var(--text-primary)]">{selectedRest.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Slug :</span>
                <span className="font-mono">{selectedRest.slug}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Secteur :</span>
                <span className="capitalize">{selectedRest.businessType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Ville :</span>
                <span>{selectedRest.city}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Adresse :</span>
                <span>{selectedRest.address || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Propriétaire :</span>
                <span>{selectedRest.ownerName || selectedRest.ownerId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Formule d’Abonnement :</span>
                <Badge variant="neutral" className="uppercase font-mono">
                  {selectedRest.subscriptionPlan}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Total Cartes :</span>
                <span className="font-bold">{selectedRest.menuCount} (dont {selectedRest.publishedMenuCount} en ligne)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Commandes Reçues :</span>
                <span className="font-bold">{selectedRest.orderCount}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <a
                href={`/m/${selectedRest.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-orange font-bold hover:underline"
              >
                <span>{isEn ? 'Open Public QR Menu' : 'Ouvrir la Carte Publique'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setSelectedRest(null)}
                className="px-4 py-2 rounded-xl bg-forest dark:bg-gold text-white dark:text-forest-dark font-bold text-xs"
              >
                {isEn ? 'Close' : 'Fermer'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Suspend / Reactivate Confirmation Modal */}
      {togglingRest && (
        <Modal
          isOpen={true}
          onClose={() => setTogglingRest(null)}
          title={
            togglingRest.status === 'active'
              ? (isEn ? 'Suspend Establishment' : 'Suspendre l’Établissement')
              : (isEn ? 'Reactivate Establishment' : 'Réactiver l’Établissement')
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-[var(--text-secondary)]">
              {togglingRest.status === 'active'
                ? isEn
                  ? `Are you sure you want to suspend "${togglingRest.name}"? The public digital menu will become unavailable.`
                  : `Êtes-vous sûr de vouloir suspendre "${togglingRest.name}" ? La carte digitale publique ne sera plus accessible aux clients.`
                : isEn
                  ? `Reactivate "${togglingRest.name}"? The menu will immediately be restored online.`
                  : `Réactiver "${togglingRest.name}" ? La carte en ligne redeviendra immédiatement accessible.`}
            </p>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                {isEn ? 'Reason for status change :' : 'Motif du changement de statut :'}
              </label>
              <textarea
                value={toggleReason}
                onChange={(e) => setToggleReason(e.target.value)}
                placeholder={isEn ? 'e.g. Non-payment, customer request, verification...' : 'ex: Défaut de virement, demande gérant...'}
                rows={2}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setTogglingRest(null)}
                disabled={isSubmittingToggle}
                className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs"
              >
                {isEn ? 'Cancel' : 'Annuler'}
              </button>

              <button
                onClick={handleToggleStatus}
                disabled={isSubmittingToggle}
                className={`px-4 py-2 rounded-xl font-bold text-xs text-white ${
                  togglingRest.status === 'active'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isSubmittingToggle ? (
                  isEn ? 'Processing...' : 'Traitement...'
                ) : togglingRest.status === 'active' ? (
                  isEn ? 'Confirm Suspension' : 'Confirmer la Suspension'
                ) : (
                  isEn ? 'Confirm Reactivation' : 'Confirmer la Réactivation'
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};
