import React, { useState } from 'react';
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
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{isEn ? 'Settings updated' : 'Modifications enregistrées'}</span>
          </span>
        ) : undefined
      }
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Bank Transfer Instructions */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] font-display">
                {isEn ? 'Official Moroccan Bank Accounts (Payment Destinations)' : 'Comptes Bancaires Officiels de Virement (Maroc)'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isEn ? 'Displayed to customers on the billing page for manual subscription bank transfers.' : 'Affichés aux restaurateurs sur la page de facturation pour effectuer leur virement.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                CIH Bank RIB / Numéro de Compte
              </label>
              <input
                type="text"
                value={cihAccount}
                onChange={(e) => setCihAccount(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] font-mono font-bold text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                Attijariwafa Bank RIB / Numéro de Compte
              </label>
              <input
                type="text"
                value={attijariAccount}
                onChange={(e) => setAttijariAccount(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] font-mono font-bold text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>
          </div>
        </Card>

        {/* AI Quotas & Thresholds */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] font-display">
                {isEn ? 'Zina AI Consumption Quotas & Cost Controls' : 'Plafonds de Consommation & Alertes Coûts IA Zina'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isEn ? 'Configure maximum allowable Claude API spend per calendar month before alerting.' : 'Définition du seuil d’alerte de dépenses mensuelles pour l’API Claude.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                {isEn ? 'Monthly AI Budget Alert Threshold (MAD)' : 'Seuil d’Alerte Budget IA Mensuel (MAD)'}
              </label>
              <input
                type="number"
                value={aiMonthlyBudgetMad}
                onChange={(e) => setAiMonthlyBudgetMad(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] font-mono font-bold text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] space-y-1">
              <span className="font-bold text-[var(--text-primary)] block">Mesures Anti-Abus Actives :</span>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Limite de 50 items par carte, contrôle de taille de fichier 10 Mo max, et temporisation anti-boucle de réessai.
              </p>
            </div>
          </div>
        </Card>

        {/* Support & Platform Channels */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] font-display">
                {isEn ? 'Official Merchant Support Channels' : 'Canaux d’Assistance aux Restaurateurs'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isEn ? 'Used in customer communications and billing guidance.' : 'Coordonnées affichées aux restaurateurs pour le support.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                {isEn ? 'Support WhatsApp / Phone' : 'Numéro WhatsApp / Support'}
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                {isEn ? 'Support Contact Email' : 'Email de Support Officiel'}
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>
          </div>
        </Card>

        {/* Save Actions Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isEn ? 'Save Platform Settings' : 'Enregistrer la Configuration'}</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};
