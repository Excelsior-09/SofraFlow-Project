import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  Building2,
  BadgeCheck,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Coins,
  AlertCircle,
  FileText
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useLanguage } from '../../context/LanguageContext';
import { adminService } from '../../services/adminService';
import {
  OperatingExpenseRecord,
  OperatingExpenseCategory,
  PlatformExecutiveAnalytics
} from '../../types';

export const AdminFinancePage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [expenses, setExpenses] = useState<OperatingExpenseRecord[]>([]);
  const [analytics, setAnalytics] = useState<PlatformExecutiveAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add expense modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<OperatingExpenseCategory>('claude_api');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [exp, an] = await Promise.all([
        adminService.getOperatingExpenses(),
        adminService.getPlatformAnalytics()
      ]);
      setExpenses(exp);
      setAnalytics(an);
    } catch (err) {
      console.error('[AdminFinancePage] Error loading financial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert(isEn ? 'Please enter a valid description and positive amount.' : 'Veuillez saisir une description et un montant positif.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await adminService.createOperatingExpense({
        expenseDate,
        category,
        description: description.trim(),
        amount: numAmount,
        currency: 'MAD',
        vendor: vendor.trim() || undefined,
        paymentStatus: 'paid',
        isRecurring
      });

      if (ok) {
        setShowAddModal(false);
        setDescription('');
        setAmount('');
        setVendor('');
        await loadData();
      } else {
        alert(isEn ? 'Failed to record expense' : 'Échec de l’enregistrement de la dépense');
      }
    } catch (err: any) {
      alert(err.message || 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm(isEn ? 'Delete this expense entry?' : 'Supprimer cette ligne de dépense ?')) return;
    try {
      await adminService.deleteOperatingExpense(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error');
    }
  };

  const formatMAD = (val: number) => {
    return new Intl.NumberFormat(isEn ? 'en-US' : 'fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(val);
  };

  const totalCollectedRevenue = analytics?.totalCollectedRevenue || 0;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalCollectedRevenue - totalExpenses;

  const categoryLabels: Record<OperatingExpenseCategory, string> = {
    claude_api: isEn ? 'Anthropic Claude API' : 'API Anthropic Claude',
    supabase: 'Supabase Cloud / Database',
    hosting: isEn ? 'Vercel / Web Hosting' : 'Hébergement Web & CDN',
    domain_email: isEn ? 'Domain & Google Workspace' : 'Nom de Domaine & Emails',
    software: isEn ? 'SaaS Tools & Software' : 'Logiciels & Outils SaaS',
    advertising: isEn ? 'Marketing & Ads' : 'Publicité & Marketing',
    contractor: isEn ? 'Freelancers & Contractors' : 'Développeurs & Prestataires',
    payment_fees: isEn ? 'Banking & Transfer Fees' : 'Frais Bancaires & Tenue de Compte',
    office_legal: isEn ? 'Accounting & Legal' : 'Expertise Comptable & Juridique',
    other: isEn ? 'Other Expense' : 'Autres Dépenses'
  };

  return (
    <AdminLayout
      title={isEn ? 'Financial Management & Expense Ledger' : 'Gestion Financière & Grand Livre des Dépenses'}
      subtitle={
        isEn
          ? 'Track verified subscription cash inflows against recorded operating costs to measure net operating margin in Moroccan Dirhams (MAD).'
          : 'Rapprochement des encaissements réels et suivi des charges d’exploitation pour calculer la marge nette en Dirhams (MAD).'
      }
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-orange text-white font-bold text-xs hover:bg-orange-700 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isEn ? 'Record Expense' : 'Enregistrer une Dépense'}</span>
          </button>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-brand-orange transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      }
    >
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Collected */}
        <Card className="p-5">
          <div className="flex justify-between items-center text-[var(--text-secondary)]">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isEn ? 'Verified Cash Inflows' : 'Encaissements Vérifiés'}
            </span>
            <BadgeCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display">
            {formatMAD(totalCollectedRevenue)}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            {isEn ? 'Approved bank transfers to date' : 'Virements bancaires validés à ce jour'}
          </div>
        </Card>

        {/* Operating Expenses */}
        <Card className="p-5">
          <div className="flex justify-between items-center text-[var(--text-secondary)]">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isEn ? 'Operating Costs' : 'Charges d’Exploitation'}
            </span>
            <Receipt className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400 font-display">
            {formatMAD(totalExpenses)}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            {expenses.length} {isEn ? 'recorded ledger items' : 'dépenses enregistrées'}
          </div>
        </Card>

        {/* Net Operating Result */}
        <Card className="p-5">
          <div className="flex justify-between items-center text-[var(--text-secondary)]">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isEn ? 'Net Operating Margin' : 'Résultat d’Exploitation Net'}
            </span>
            <Coins className="w-4 h-4 text-brand-orange" />
          </div>
          <div
            className={`mt-2 text-2xl font-black font-display ${
              netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatMAD(netProfit)}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            {isEn ? 'Inflows minus documented costs' : 'Recettes encaissées moins charges'}
          </div>
        </Card>
      </div>

      {/* Expense Ledger Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-primary)] font-display">
            {isEn ? 'Operating Expense Ledger (Audit Trail)' : 'Grand Livre des Dépenses Réelles'}
          </h3>
          <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">
            {expenses.length} {isEn ? 'Entries' : 'Lignes'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-card-hover)] text-[var(--text-secondary)] uppercase text-[10px] tracking-wider border-b border-[var(--border-subtle)]">
              <tr>
                <th className="py-3 px-4">{isEn ? 'Date' : 'Date'}</th>
                <th className="py-3 px-4">{isEn ? 'Category' : 'Catégorie'}</th>
                <th className="py-3 px-4">{isEn ? 'Description' : 'Description'}</th>
                <th className="py-3 px-4">{isEn ? 'Vendor / Payee' : 'Fournisseur / Bénéficiaire'}</th>
                <th className="py-3 px-4">{isEn ? 'Amount' : 'Montant'}</th>
                <th className="py-3 px-4 text-right">{isEn ? 'Actions' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--text-secondary)]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-orange" />
                    <span>{isEn ? 'Loading ledger...' : 'Chargement du grand livre...'}</span>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--text-secondary)]">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-brand-orange" />
                    <span>{isEn ? 'No expenses recorded yet. Click "Record Expense" to add your first bill.' : 'Aucune dépense enregistrée. Cliquez sur "Enregistrer une Dépense" pour saisir une facture.'}</span>
                  </td>
                </tr>
              ) : (
                expenses.map(item => (
                  <tr key={item.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)]">
                      {item.expenseDate}
                    </td>

                    <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                      <span className="px-2 py-0.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-subtle)] font-mono text-[10px]">
                        {categoryLabels[item.category] || item.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[var(--text-primary)] font-medium">
                      {item.description}
                    </td>

                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {item.vendor || '—'}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                      -{formatMAD(item.amount)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteExpense(item.id)}
                        className="p-1 rounded-lg text-rose-600 hover:bg-rose-500/10 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Expense Modal */}
      {showAddModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          title={isEn ? 'Record Operating Expense' : 'Enregistrer une Dépense d’Exploitation'}
        >
          <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                  {isEn ? 'Expense Date' : 'Date de la dépense'}
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                  {isEn ? 'Amount (MAD)' : 'Montant en MAD'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                {isEn ? 'Expense Category' : 'Catégorie de coût'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
              >
                {Object.entries(categoryLabels).map(([catKey, catLabel]) => (
                  <option key={catKey} value={catKey}>
                    {catLabel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                {isEn ? 'Description' : 'Description de la facture ou prestation'}
              </label>
              <input
                type="text"
                placeholder={isEn ? 'e.g. Anthropic Claude API usage invoice - October' : 'ex: Facture consommation API Claude - Octobre'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                {isEn ? 'Vendor / Payee' : 'Fournisseur / Prestataire'}
              </label>
              <input
                type="text"
                placeholder={isEn ? 'e.g. Anthropic Inc, Supabase Inc, Inwi...' : 'ex: Anthropic, Supabase, OVH, Comptable...'}
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isRecurringCheck"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded border-[var(--border-subtle)] text-brand-orange focus:ring-brand-orange"
              />
              <label htmlFor="isRecurringCheck" className="text-xs text-[var(--text-secondary)]">
                {isEn ? 'Recurring monthly subscription' : 'Charge récurrente mensuelle'}
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs"
              >
                {isEn ? 'Cancel' : 'Annuler'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-brand-orange hover:bg-orange-700 text-white font-bold text-xs shadow-md"
              >
                {isSubmitting ? (isEn ? 'Saving...' : 'Enregistrement...') : (isEn ? 'Save Expense' : 'Valider la Dépense')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
};
