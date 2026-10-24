import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  CreditCard,
  Building2,
  ShieldCheck,
  Cpu,
  Mail,
  Phone,
  CheckCircle2,
  Save,
  AlertCircle,
  Lock,
  ExternalLink
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';

export const AdminSettingsPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Platform bank configuration
  const [cihAccount, setCihAccount] = useState('230 780 45210987654321 00 12');
  const [attijariAccount, setAttijariAccount] = useState('007 780 00012345678901 00 45');
  const [supportPhone, setSupportPhone] = useState('+212 6 61 23 45 67');
  const [supportEmail, setSupportEmail] = useState('contact@sofraflow.com');
  const [aiMonthlyBudgetMad, setAiMonthlyBudgetMad] = useState('500');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AdminLayout
      title={isEn ? 'Platform Settings & Infrastructure Config' : 'Configuration Plateforme & Intégrations'}
      subtitle={
        isEn
          ? 'Manage Moroccan bank account payment instructions, AI budget alert limits, and platform support channels.'
          : 'Gestion des coordonnées bancaires de virement, seuils d’alerte IA et canaux de support de la plateforme.'
      }
      actions={
        savedSuccess ? (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
            <span>{isEn ? 'Settings updated' : 'Modifications enregistrées'}</span>
          </span>
        ) : undefined
      }
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Bank Transfer Instructions */}
        <div className="rounded-2xl p-6 space-y-4 bg-[var(--bg-card)] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] font-display tracking-tight">
                {isEn ? 'Official Moroccan Bank Accounts (Payment Destinations)' : 'Comptes Bancaires Officiels de Virement (Maroc)'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isEn ? 'Displayed to customers on the billing page for manual subscription bank transfers.' : 'Affichés aux restaurateurs sur la page de facturation pour effectuer leur virement.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1.5">
                CIH Bank RIB / Numéro de Compte
              </label>
              <input
                type="text"
                value={cihAccount}
                onChange={(e) => setCihAccount(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-slate-200 dark:border-white/[0.08] font-mono font-bold text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1.5">
                Attijariwafa Bank RIB / Numéro de Compte
              </label>
              <input
                type="text"
                value={attijariAccount}
                onChange={(e) => setAttijariAccount(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-slate-200 dark:border-white/[0.08] font-mono font-bold text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* AI Quotas & Thresholds */}
        <div className="rounded-2xl p-6 space-y-4 bg-[var(--bg-card)] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-display tracking-tight">
                  {isEn ? 'Zina AI Consumption Quotas & Cost Controls' : 'Plafonds de Consommation & Alertes Coûts IA Zina'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isEn ? 'Configure Claude API key, model fleet (Sonnet 4.6/5, Haiku 4.5, Opus 4.6-5.5), and monthly budget.' : 'Configuration de la clé Claude API, de la flotte de modèles (Sonnet 4.6/5, Haiku 4.5, Opus 4.6-5.5) et du budget mensuel.'}
                </p>
              </div>
            </div>

            <Link
              to="/admin/ai-operations"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/20 shrink-0 self-start sm:self-auto active:scale-[0.98]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isEn ? "Open Claude Vault →" : "Ouvrir Coffre Claude →"}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1.5">
                {isEn ? 'Monthly AI Budget Alert Threshold (MAD)' : 'Seuil d’Alerte Budget IA Mensuel (MAD)'}
              </label>
              <input
                type="number"
                value={aiMonthlyBudgetMad}
                onChange={(e) => setAiMonthlyBudgetMad(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-slate-200 dark:border-white/[0.08] font-mono font-bold text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
              <span className="font-bold text-[var(--text-primary)] block">Mesures Anti-Abus Actives :</span>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Limite de 50 items par carte, contrôle de taille de fichier 10 Mo max, et temporisation anti-boucle de réessai.
              </p>
            </div>
          </div>
        </div>

        {/* Support & Platform Channels */}
        <div className="rounded-2xl p-6 space-y-4 bg-[var(--bg-card)] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] font-display tracking-tight">
                {isEn ? 'Official Merchant Support Channels' : 'Canaux d’Assistance aux Restaurateurs'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isEn ? 'Used in customer communications and billing guidance.' : 'Coordonnées affichées aux restaurateurs pour le support.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1.5">
                {isEn ? 'Support WhatsApp / Phone' : 'Numéro WhatsApp / Support'}
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-slate-200 dark:border-white/[0.08] font-mono text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1.5">
                {isEn ? 'Support Contact Email' : 'Email de Support Officiel'}
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-slate-200 dark:border-white/[0.08] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Save Actions Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isEn ? 'Save Platform Settings' : 'Enregistrer la Configuration'}</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};
