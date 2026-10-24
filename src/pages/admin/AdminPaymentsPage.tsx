import React, { useState, useEffect } from 'react';
import {
  BadgeCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  FileText,
  Eye,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useLanguage } from '../../context/LanguageContext';
import { adminService } from '../../services/adminService';
import { SubscriptionPaymentRequest } from '../../types';

export const AdminPaymentsPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [requests, setRequests] = useState<SubscriptionPaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected request for bank reconciliation
  const [activeRequest, setActiveRequest] = useState<SubscriptionPaymentRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Rejection modal
  const [rejectingRequest, setRejectingRequest] = useState<SubscriptionPaymentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Copied state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllPaymentRequests();
      setRequests(data);
    } catch (err) {
      console.error('[AdminPaymentsPage] Error loading payment requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConfirmApproval = async () => {
    if (!activeRequest) return;
    setIsApproving(true);
    try {
      const res = await adminService.approvePayment(activeRequest.id, reviewNotes.trim() || undefined);
      if (res.success) {
        setActiveRequest(null);
        setReviewNotes('');
        await loadRequests();
      } else {
        alert(res.error || (isEn ? 'Approval failed' : 'Échec de la validation'));
      }
    } catch (err: any) {
      alert(err.message || (isEn ? 'Approval failed' : 'Erreur'));
    } finally {
      setIsApproving(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (!rejectingRequest) return;
    if (!rejectionReason.trim()) {
      alert(isEn ? 'Please provide a clear rejection reason.' : 'Veuillez renseigner un motif de refus.');
      return;
    }

    setIsRejecting(true);
    try {
      const res = await adminService.rejectPayment(rejectingRequest.id, rejectionReason.trim());
      if (res.success) {
        setRejectingRequest(null);
        setRejectionReason('');
        await loadRequests();
      } else {
        alert(res.error || (isEn ? 'Rejection failed' : 'Échec du refus'));
      }
    } catch (err: any) {
      alert(err.message || (isEn ? 'Rejection failed' : 'Erreur'));
    } finally {
      setIsRejecting(false);
    }
  };

  const filtered = requests.filter(r => {
    const matchesSearch =
      (r.restaurantName && r.restaurantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.userName && r.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.transactionReference && r.transactionReference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.payerName && r.payerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(r => r.status === 'pending' || r.status === 'under_review').length;

  return (
    <AdminLayout
      title={isEn ? 'Bank Transfer Reconciliation Queue' : 'Rapprochement des Virements Bancaires'}
      subtitle={
        isEn
          ? 'Verify customer bank transfer claims against verified bank statement evidence before activating entitlements.'
          : 'Contrôlez les références et preuves de virement bancaire avant d’activer les formules d’abonnement.'
      }
      actions={
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge variant="warning" size="md" className="font-mono font-bold">
              {pendingCount} {isEn ? 'Awaiting Verification' : 'En Attente'}
            </Badge>
          )}

          <button
            onClick={loadRequests}
            disabled={isLoading}
            className="p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-brand-orange transition-colors"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      }
    >
      {/* Search and Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder={isEn ? 'Search by reference, restaurant, payer...' : 'Recherche par réf, restaurant, émetteur...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              <option value="all">{isEn ? 'All Statuses' : 'Tous les Statuts'}</option>
              <option value="pending">{isEn ? 'Pending' : 'En attente'}</option>
              <option value="under_review">{isEn ? 'Under Review' : 'En cours de revue'}</option>
              <option value="approved">{isEn ? 'Approved' : 'Validé'}</option>
              <option value="rejected">{isEn ? 'Rejected' : 'Refusé'}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Requests Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-card-hover)] text-[var(--text-secondary)] uppercase text-[10px] tracking-wider border-b border-[var(--border-subtle)]">
              <tr>
                <th className="py-3 px-4">{isEn ? 'Restaurant / Client' : 'Établissement / Client'}</th>
                <th className="py-3 px-4">{isEn ? 'Plan & Period' : 'Formule & Période'}</th>
                <th className="py-3 px-4">{isEn ? 'Amount' : 'Montant'}</th>
                <th className="py-3 px-4">{isEn ? 'Method' : 'Banque / Canal'}</th>
                <th className="py-3 px-4">{isEn ? 'Reference' : 'Référence Virement'}</th>
                <th className="py-3 px-4">{isEn ? 'Status' : 'Statut'}</th>
                <th className="py-3 px-4 text-right">{isEn ? 'Reconciliation' : 'Rapprochement'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-secondary)]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-orange" />
                    <span>{isEn ? 'Loading payment verification queue...' : 'Chargement de la file des virements...'}</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-secondary)]">
                    <BadgeCheck className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-600" />
                    <span>{isEn ? 'No bank transfer submissions in queue.' : 'Aucun virement en attente dans la file.'}</span>
                  </td>
                </tr>
              ) : (
                filtered.map(req => {
                  const isActionable = req.status === 'pending' || req.status === 'under_review';

                  return (
                    <tr key={req.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[var(--text-primary)]">
                          {req.restaurantName || 'Restaurant'}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          {req.userName || req.payerName || 'Client'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="neutral" size="sm" className="uppercase font-mono">
                          {req.plan}
                        </Badge>
                        <div className="text-[10px] text-[var(--text-secondary)] capitalize mt-0.5">
                          {req.billingPeriod === 'annual' ? (isEn ? 'Annual' : 'Annuel') : (isEn ? 'Monthly' : 'Mensuel')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-sm text-[var(--text-primary)]">
                        {req.amount} {req.currency}
                      </td>

                      <td className="py-3.5 px-4 font-medium uppercase text-[11px]">
                        {req.paymentMethod.replace(/_/g, ' ')}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[var(--text-primary)] select-all">
                            {req.transactionReference || '—'}
                          </span>
                          {req.transactionReference && (
                            <button
                              onClick={() => handleCopy(req.transactionReference, req.id)}
                              className="text-[var(--text-secondary)] hover:text-brand-orange"
                              title="Copier la référence"
                            >
                              {copiedKey === req.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            req.status === 'approved'
                              ? 'success'
                              : req.status === 'rejected'
                              ? 'error'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {req.status === 'approved'
                            ? (isEn ? 'Verified & Active' : 'Validé & Actif')
                            : req.status === 'rejected'
                            ? (isEn ? 'Rejected' : 'Refusé')
                            : (isEn ? 'To Verify' : 'À Vérifier')}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isActionable ? (
                          <button
                            onClick={() => setActiveRequest(req)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-orange text-white font-bold text-xs hover:bg-orange-700 shadow-sm transition-all"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{isEn ? 'Reconcile' : 'Rapprocher'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveRequest(req)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          >
                            <Eye className="w-3 h-3" />
                            <span>{isEn ? 'Details' : 'Détails'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reconciliation Modal */}
      {activeRequest && (
        <Modal
          isOpen={true}
          onClose={() => setActiveRequest(null)}
          title={isEn ? 'Bank Transfer Reconciliation' : 'Rapprochement du Virement Bancaire'}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {isEn
                  ? 'Confirm that funds have been credited to your CIH or Attijariwafa bank account before approving. Approval immediately grants subscription access.'
                  : 'Vérifiez impérativement le relevé bancaire de l’entreprise avant de valider. L’approbation active immédiatement les droits de la formule.'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Établissement :</span>
                <span className="font-bold text-[var(--text-primary)]">{activeRequest.restaurantName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Client / Émetteur :</span>
                <span>{activeRequest.payerName || activeRequest.userName || 'Client'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Téléphone de contact :</span>
                <span className="font-mono">{activeRequest.payerPhone || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Formule demandée :</span>
                <Badge variant="neutral" className="uppercase font-mono">{activeRequest.plan}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Montant attendu :</span>
                <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {activeRequest.amount} {activeRequest.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Banque / Moyen :</span>
                <span className="uppercase font-medium">{activeRequest.paymentMethod.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-secondary)]">Référence Virement :</span>
                <span className="font-mono font-bold select-all bg-[var(--bg-card)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                  {activeRequest.transactionReference}
                </span>
              </div>
              {activeRequest.receiptUrl && (
                <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between items-center">
                  <span className="font-bold text-[var(--text-secondary)]">Preuve téléchargée :</span>
                  <a
                    href={activeRequest.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-brand-orange font-bold hover:underline"
                  >
                    <span>{isEn ? 'View Receipt Image' : 'Voir le reçu / reçu bancaire'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {activeRequest.status === 'under_review' || activeRequest.status === 'pending' ? (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                    {isEn ? 'Verification Notes (Internal Audit) :' : 'Notes de contrôle (Audit interne) :'}
                  </label>
                  <input
                    type="text"
                    placeholder={isEn ? 'e.g. Verified on CIH Mobile Banking statement' : 'ex: Reçu sur relevé CIH du 24/10'}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => {
                      setRejectingRequest(activeRequest);
                      setActiveRequest(null);
                    }}
                    className="px-3 py-2 rounded-xl border border-rose-500/20 text-rose-600 hover:bg-rose-500/10 font-bold text-xs transition-colors"
                  >
                    {isEn ? 'Reject Transfer' : 'Refuser le Virement'}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveRequest(null)}
                      disabled={isApproving}
                      className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs"
                    >
                      {isEn ? 'Cancel' : 'Annuler'}
                    </button>

                    <button
                      onClick={handleConfirmApproval}
                      disabled={isApproving}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
                    >
                      {isApproving ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{isEn ? 'Validating...' : 'Validation...'}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isEn ? 'Confirm Approval & Activate' : 'Confirmer le Virement & Activer'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveRequest(null)}
                  className="px-4 py-2 rounded-xl bg-forest dark:bg-gold text-white dark:text-forest-dark font-bold text-xs"
                >
                  {isEn ? 'Close' : 'Fermer'}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Rejection Modal */}
      {rejectingRequest && (
        <Modal
          isOpen={true}
          onClose={() => setRejectingRequest(null)}
          title={isEn ? 'Reject Bank Transfer Submission' : 'Refuser la Demande de Virement'}
        >
          <div className="space-y-4 text-xs">
            <p className="text-[var(--text-secondary)]">
              {isEn
                ? `Please enter a specific reason for refusing the transfer of ${rejectingRequest.amount} MAD for "${rejectingRequest.restaurantName}". The customer will be informed.`
                : `Veuillez spécifier un motif de refus précis pour le virement de ${rejectingRequest.amount} MAD (${rejectingRequest.restaurantName}). Le client en sera informé.`}
            </p>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                {isEn ? 'Rejection Reason (Required) :' : 'Motif de Refus (Requis) :'}
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={isEn ? 'e.g. Reference not found on bank statement, wrong amount...' : 'ex: Référence introuvable sur le relevé bancaire, montant erroné...'}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
                required
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setRejectingRequest(null)}
                disabled={isRejecting}
                className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]"
              >
                {isEn ? 'Cancel' : 'Annuler'}
              </button>

              <button
                onClick={handleConfirmRejection}
                disabled={isRejecting || !rejectionReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {isRejecting ? (
                  isEn ? 'Rejecting...' : 'Refus en cours...'
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>{isEn ? 'Confirm Rejection' : 'Confirmer le Refus'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};
