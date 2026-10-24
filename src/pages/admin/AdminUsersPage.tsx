import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Building2,
  Calendar,
  Phone,
  Mail,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Eye,
  Ban,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useLanguage } from '../../context/LanguageContext';
import { adminService } from '../../services/adminService';
import { AdminUserRecord } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('[AdminUsersPage] Error loading users:', err);
      setErrorMessage(
        err.message ||
          (isEn
            ? 'Failed to fetch platform accounts. Please check Super Admin privileges and database connectivity.'
            : 'Impossible de récupérer la liste des utilisateurs. Vérifiez les privilèges Super Admin et la connectivité.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phone && u.phone.toLowerCase().includes(term)) ||
      u.role.toLowerCase().includes(term);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <AdminLayout
      title={isEn ? 'User Accounts Directory' : 'Répertoire des Utilisateurs'}
      subtitle={
        isEn
          ? 'Manage all platform accounts, account owner profiles, and associated establishments.'
          : 'Gestion des comptes, profils des gérants et établissements rattachés.'
      }
      actions={
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-[var(--text-secondary)]">
            {isEn ? `${users.length} Registered Accounts` : `${users.length} Comptes Enregistrés`}
          </span>
          <button
            onClick={loadUsers}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] text-[var(--text-secondary)] hover:text-amber-500 bg-[var(--bg-card)] transition-colors"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      }
    >
      {/* Error Alert with Retry */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={loadUsers}
            className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition-colors shrink-0"
          >
            {isEn ? 'Retry' : 'Réessayer'}
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="rounded-2xl p-4 bg-[var(--bg-card)] border border-slate-200/80 dark:border-white/[0.08]">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder={isEn ? 'Search by name, email, phone...' : 'Rechercher par nom, email, tél...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[var(--bg-page)] border border-slate-200 dark:border-white/[0.08] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">
              {isEn
                ? `Showing ${filteredUsers.length} of ${users.length}`
                : `Affichage de ${filteredUsers.length} sur ${users.length}`}
            </span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-[var(--bg-page)] border border-slate-200 dark:border-white/[0.08] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all font-medium"
            >
              <option value="all">{isEn ? 'All Roles' : 'Tous les Rôles'}</option>
              <option value="owner">{isEn ? 'Owner' : 'Propriétaire'}</option>
              <option value="manager">{isEn ? 'Manager' : 'Gérant'}</option>
              <option value="staff">{isEn ? 'Staff' : 'Équipe'}</option>
              <option value="admin">{isEn ? 'Admin' : 'Administrateur'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/[0.02] text-[var(--text-secondary)] uppercase text-[10px] tracking-wider font-semibold border-b border-slate-200/80 dark:border-white/[0.06]">
              <tr>
                <th className="py-3 px-4">{isEn ? 'User / Name' : 'Utilisateur / Nom'}</th>
                <th className="py-3 px-4">{isEn ? 'Contact Phone' : 'Téléphone'}</th>
                <th className="py-3 px-4">{isEn ? 'Role' : 'Rôle'}</th>
                <th className="py-3 px-4">{isEn ? 'Restaurants' : 'Établissements'}</th>
                <th className="py-3 px-4">{isEn ? 'Created At' : 'Inscrit le'}</th>
                <th className="py-3 px-4 text-right">{isEn ? 'Actions' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--text-secondary)]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    <span className="font-medium">{isEn ? 'Loading users...' : 'Chargement des utilisateurs...'}</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--text-secondary)]">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-[var(--text-secondary)]" />
                    <span className="font-medium">{isEn ? 'No users found matching your filters.' : 'Aucun utilisateur trouvé.'}</span>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(userItem => (
                  <tr key={userItem.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[var(--text-primary)] font-display">{userItem.fullName}</div>
                      <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-[var(--text-secondary)]" />
                        <span>{userItem.email || '—'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {userItem.phone ? (
                        <span className="flex items-center gap-1.5 text-[var(--text-primary)] font-medium">
                          <Phone className="w-3 h-3 text-emerald-500" />
                          <span>{userItem.phone}</span>
                        </span>
                      ) : (
                        <span className="text-[var(--text-secondary)] italic">
                          {isEn ? 'Not set' : 'Non renseigné'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={userItem.role === 'admin' ? 'warning' : 'neutral'}
                        size="sm"
                      >
                        {userItem.role}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-page)] border border-slate-200 dark:border-white/[0.08] font-bold text-xs">
                        <Building2 className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-mono">{userItem.restaurantCount}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-[var(--text-secondary)] font-mono">
                      {new Date(userItem.createdAt).toLocaleDateString(isEn ? 'en-US' : 'fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedUser(userItem)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-amber-500/40 bg-[var(--bg-card)] transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{isEn ? 'Details' : 'Détails'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          title={isEn ? 'User Account Details' : 'Fiche Utilisateur'}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[var(--bg-page)] border border-slate-200 dark:border-white/[0.08] space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">ID Utilisateur :</span>
                <span className="font-mono text-[10px] select-all px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-slate-200 dark:border-white/[0.08] text-[var(--text-primary)]">{selectedUser.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Nom Complet :</span>
                <span className="font-bold text-[var(--text-primary)] font-display">{selectedUser.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Email :</span>
                <span className="text-[var(--text-primary)]">{selectedUser.email || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Téléphone :</span>
                <span className="font-mono text-[var(--text-primary)]">{selectedUser.phone || 'Non renseigné'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Rôle Plateforme :</span>
                <Badge variant={selectedUser.role === 'admin' ? 'warning' : 'neutral'}>
                  {selectedUser.role}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Langue Préférée :</span>
                <span className="uppercase font-mono text-[var(--text-primary)]">{selectedUser.preferredLanguage}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Établissements :</span>
                <span className="font-bold text-[var(--text-primary)]">{selectedUser.restaurantCount} rattaché(s)</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
              >
                {isEn ? 'Close' : 'Fermer'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};
