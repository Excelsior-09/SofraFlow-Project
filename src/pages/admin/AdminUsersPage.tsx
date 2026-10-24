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
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('[AdminUsersPage] Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));
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
        <button
          onClick={loadUsers}
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
              placeholder={isEn ? 'Search by name, email, phone...' : 'Rechercher par nom, email, tél...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              <option value="all">{isEn ? 'All Roles' : 'Tous les Rôles'}</option>
              <option value="owner">{isEn ? 'Owner' : 'Propriétaire'}</option>
              <option value="manager">{isEn ? 'Manager' : 'Gérant'}</option>
              <option value="staff">{isEn ? 'Staff' : 'Équipe'}</option>
              <option value="admin">{isEn ? 'Admin' : 'Administrateur'}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-card-hover)] text-[var(--text-secondary)] uppercase text-[10px] tracking-wider border-b border-[var(--border-subtle)]">
              <tr>
                <th className="py-3 px-4">{isEn ? 'User / Name' : 'Utilisateur / Nom'}</th>
                <th className="py-3 px-4">{isEn ? 'Contact Phone' : 'Téléphone'}</th>
                <th className="py-3 px-4">{isEn ? 'Role' : 'Rôle'}</th>
                <th className="py-3 px-4">{isEn ? 'Restaurants' : 'Établissements'}</th>
                <th className="py-3 px-4">{isEn ? 'Created At' : 'Inscrit le'}</th>
                <th className="py-3 px-4 text-right">{isEn ? 'Actions' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--text-secondary)]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-orange" />
                    <span>{isEn ? 'Loading users...' : 'Chargement des utilisateurs...'}</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--text-secondary)]">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <span>{isEn ? 'No users found matching your filters.' : 'Aucun utilisateur trouvé.'}</span>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(userItem => (
                  <tr key={userItem.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[var(--text-primary)]">{userItem.fullName}</div>
                      <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>{userItem.email || '—'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {userItem.phone ? (
                        <span className="flex items-center gap-1 text-[var(--text-primary)]">
                          <Phone className="w-3 h-3 text-emerald-600" />
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
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-subtle)] font-bold">
                        <Building2 className="w-3 h-3 text-brand-orange" />
                        <span>{userItem.restaurantCount}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-[var(--text-secondary)]">
                      {new Date(userItem.createdAt).toLocaleDateString(isEn ? 'en-US' : 'fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedUser(userItem)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-primary)] hover:border-brand-orange hover:text-brand-orange transition-colors"
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
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          title={isEn ? 'User Account Details' : 'Fiche Utilisateur'}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">ID Utilisateur :</span>
                <span className="font-mono text-[11px] select-all">{selectedUser.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Nom Complet :</span>
                <span className="font-bold text-[var(--text-primary)]">{selectedUser.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Email :</span>
                <span>{selectedUser.email || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Téléphone :</span>
                <span className="font-mono">{selectedUser.phone || 'Non renseigné'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Rôle Plateforme :</span>
                <Badge variant={selectedUser.role === 'admin' ? 'warning' : 'neutral'}>
                  {selectedUser.role}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Langue Préférée :</span>
                <span className="uppercase font-mono">{selectedUser.preferredLanguage}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Établissements :</span>
                <span className="font-bold">{selectedUser.restaurantCount} rattaché(s)</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-forest dark:bg-gold text-white dark:text-forest-dark font-bold text-xs"
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
