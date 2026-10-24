import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Building2,
  User,
  ShieldCheck,
  Calendar,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useLanguage } from '../../context/LanguageContext';
import { adminService } from '../../services/adminService';
import { AdminAuditLogRecord } from '../../types';

export const AdminAuditLogsPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [logs, setLogs] = useState<AdminAuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AdminAuditLogRecord | null>(null);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAuditLogs(100);
      setLogs(data);
    } catch (err) {
      console.error('[AdminAuditLogsPage] Error loading audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(l => {
    return (
      l.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.entityId && l.entityId.includes(searchTerm))
    );
  });

  return (
    <AdminLayout
      title={isEn ? 'Platform Audit Trail & Security Ledger' : 'Journal d’Audit & Traçabilité Plateforme'}
      subtitle={
        isEn
          ? 'Immutable record of sensitive administrative actions, payment verifications, and tenant state changes.'
          : 'Enregistrement immuable des actions administratives, validations de virements et modifications d’état.'
      }
      actions={
        <button
          onClick={loadLogs}
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
              placeholder={isEn ? 'Filter by event, entity, or ID...' : 'Filtrer par événement, entité ou ID...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          <span className="text-xs font-mono text-[var(--text-secondary)]">
            {filtered.length} {isEn ? 'audit records' : 'entrées d’audit'}
          </span>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-card-hover)] text-[var(--text-secondary)] uppercase text-[10px] tracking-wider border-b border-[var(--border-subtle)]">
              <tr>
                <th className="py-3 px-4">{isEn ? 'Timestamp' : 'Horodatage'}</th>
                <th className="py-3 px-4">{isEn ? 'Event Type' : 'Type d’Événement'}</th>
                <th className="py-3 px-4">{isEn ? 'Target Entity' : 'Entité Ciblée'}</th>
                <th className="py-3 px-4">{isEn ? 'Actor' : 'Acteur'}</th>
                <th className="py-3 px-4 text-right">{isEn ? 'Metadata Snapshot' : 'Détails Snapshot'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--text-secondary)]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-orange" />
                    <span>{isEn ? 'Loading audit trail...' : 'Chargement du journal d’audit...'}</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--text-secondary)]">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-brand-orange" />
                    <span>{isEn ? 'No audit entries found.' : 'Aucun événement d’audit enregistré.'}</span>
                  </td>
                </tr>
              ) : (
                filtered.map(entry => (
                  <tr key={entry.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)]">
                      {new Date(entry.createdAt).toLocaleString(isEn ? 'en-US' : 'fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 font-mono text-[11px] font-bold shadow-xs">
                        {entry.eventType}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-secondary)] font-semibold">
                        {entry.entityType} ({entry.entityId ? entry.entityId.slice(0, 8) + '...' : '—'})
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)]">
                      {entry.actorUserId ? entry.actorUserId.slice(0, 8) + '...' : 'System / Admin'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(entry)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-secondary)] hover:text-white hover:bg-orange-600 hover:border-orange-600 transition-all shadow-xs active:scale-95"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{isEn ? 'View Payload' : 'Voir Payload'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Snapshot Modal */}
      {selectedLog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title={isEn ? 'Audit Event Snapshot' : 'Détails Snapshot d’Audit'}
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] space-y-1.5">
              <div>Event ID: {selectedLog.id}</div>
              <div>Event Type: {selectedLog.eventType}</div>
              <div>Target Entity: {selectedLog.entityType}</div>
              <div>Target ID: {selectedLog.entityId || 'None'}</div>
              <div>Timestamp: {selectedLog.createdAt}</div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-primary)] font-sans mb-1">
                JSON Payload Snapshot:
              </label>
              <pre className="p-3 rounded-xl bg-black/90 text-emerald-400 text-[11px] overflow-x-auto max-h-60 scrollbar-thin">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-forest dark:bg-gold text-white dark:text-forest-dark font-bold text-xs font-sans"
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
