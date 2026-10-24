import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Cpu,
  Zap,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Coins,
  RefreshCw,
  Server,
  Layers,
  ShieldCheck,
  Building2,
  Sliders,
  KeyRound,
  ShieldAlert,
  Check,
  Lock,
  ExternalLink
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { adminService } from '../../services/adminService';
import { AiUsageEventRecord, ClaudeApiConfigRecord } from '../../types';

export const AdminAiOperationsPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [events, setEvents] = useState<AiUsageEventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Claude API Configuration & Vault State
  const [claudeConfig, setClaudeConfig] = useState<ClaudeApiConfigRecord | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-3-7-sonnet');
  const [monthlyBudgetUsd, setMonthlyBudgetUsd] = useState(100);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isTestingHealth, setIsTestingHealth] = useState(false);
  const [configFeedback, setConfigFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsData, configData] = await Promise.all([
        adminService.getAiUsageEvents(100),
        adminService.getClaudeConfig()
      ]);
      setEvents(eventsData);
      setClaudeConfig(configData);
      if (configData) {
        setSelectedModel(configData.modelName);
        setMonthlyBudgetUsd(configData.monthlyBudgetUsd);
      }
    } catch (err) {
      console.error('[AdminAiOperationsPage] Error loading AI events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiKey.trim()) return;

    setIsSavingKey(true);
    setConfigFeedback(null);
    try {
      const res = await adminService.saveClaudeApiKey(
        newApiKey,
        selectedModel,
        Number(monthlyBudgetUsd)
      );

      if (!res.success) {
        setConfigFeedback({ type: 'error', message: res.error || 'Erreur lors de l’enregistrement de la clé.' });
      } else {
        setConfigFeedback({ type: 'success', message: res.message || 'Clé Claude API enregistrée et chiffrée avec succès.' });
        if (res.config) setClaudeConfig(res.config);
        setNewApiKey('');
        setShowConfigModal(false);
      }
    } catch (err: any) {
      setConfigFeedback({ type: 'error', message: err.message || 'Erreur de connexion au coffre-fort.' });
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingHealth(true);
    setConfigFeedback(null);
    try {
      const res = await adminService.testClaudeConnection();
      if (res.success) {
        setConfigFeedback({
          type: 'success',
          message: isEn
            ? `Health check successful! Roundtrip latency: ${res.latencyMs || 140}ms.`
            : `Test de connectivité réussi ! Latence aller-retour : ${res.latencyMs || 140}ms.`
        });
        const updatedConfig = await adminService.getClaudeConfig();
        setClaudeConfig(updatedConfig);
      } else {
        setConfigFeedback({
          type: 'error',
          message: res.error || (isEn ? 'Health check failed.' : 'Échec du test de connectivité.')
        });
      }
    } catch (err: any) {
      setConfigFeedback({ type: 'error', message: err.message || 'Erreur lors du test de connectivité.' });
    } finally {
      setIsTestingHealth(false);
    }
  };

  const totalInputTokens = events.reduce((sum, e) => sum + e.inputTokens, 0);
  const totalOutputTokens = events.reduce((sum, e) => sum + e.outputTokens, 0);
  const totalCostUsd = events.reduce((sum, e) => sum + e.estimatedCostUsd, 0);
  const totalCostMad = events.reduce((sum, e) => sum + e.estimatedCostMad, 0);
  const avgLatency =
    events.length > 0
      ? Math.round(events.reduce((sum, e) => sum + e.latencyMs, 0) / events.length)
      : 0;

  const successfulCount = events.filter(e => e.status === 'success').length;
  const errorCount = events.filter(e => e.status !== 'success').length;

  return (
    <AdminLayout
      title={isEn ? 'Zina AI Operations & Claude API Governance' : 'Opérations IA Zina & Gouvernance Claude'}
      subtitle={
        isEn
          ? 'Monitor Anthropic Claude API usage, token consumption, latency, and estimated costs for Zina AI menu generation.'
          : 'Contrôle de la consommation de jetons, latence et coûts estimés de l’API Anthropic Claude pour Zina AI.'
      }
      actions={
        <button
          onClick={loadData}
          disabled={isLoading}
          className="p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-brand-orange transition-colors"
          title="Actualiser"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      }
    >
      {/* Feedback Alert */}
      {configFeedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            configFeedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {configFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{configFeedback.message}</span>
          </div>
          <button
            onClick={() => setConfigFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* DEDICATED CLAUDE API CONFIGURATION & VAULT SECTION */}
      <Card className="p-6 border-l-4 border-l-purple-600 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-purple-950/10 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-[var(--text-primary)] font-display">
                  {isEn ? 'Claude API Credential Vault & Governance' : 'Gouvernance & Configuration Sécurisée de la Clé Claude API'}
                </h2>
                <Badge
                  variant={claudeConfig?.isConfigured ? 'success' : 'error'}
                  size="sm"
                >
                  {claudeConfig?.isConfigured
                    ? isEn ? 'Configured & Active' : 'Configurée & Chiffrée'
                    : isEn ? 'Key Missing' : 'Clé Manquante'}
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {isEn
                  ? 'Server-side encrypted credential. Enables Zina AI menu scanning, translation, and automated dish generation.'
                  : 'Identifiant chiffré côté serveur. Alimente Zina AI pour le scan de cartes, la génération de plats et les suggestions.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleTestConnection}
              disabled={isTestingHealth || !claudeConfig?.isConfigured}
              className="px-3.5 py-2 rounded-xl border border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10 text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingHealth ? 'animate-spin' : ''}`} />
              <span>{isTestingHealth ? (isEn ? 'Testing...' : 'Test en cours...') : (isEn ? 'Test Connection' : 'Tester la Connectivité')}</span>
            </button>

            <button
              onClick={() => setShowConfigModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isEn ? 'Configure / Rotate Key' : 'Configurer / Remplacer la Clé'}</span>
            </button>
          </div>
        </div>

        {/* Configuration Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Masked Fingerprint */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">
              {isEn ? 'Active Key Fingerprint' : 'Empreinte de la Clé'}
            </span>
            <div className="font-mono font-bold text-xs text-purple-700 dark:text-purple-300 truncate">
              {claudeConfig?.keyFingerprint || (isEn ? 'Not configured' : 'Non configurée')}
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] block">
              {isEn ? 'Raw key is strictly secret' : 'La clé brute reste confidentielle'}
            </span>
          </div>

          {/* Model Selection */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">
              {isEn ? 'Active Model' : 'Modèle Claude Actif'}
            </span>
            <div className="font-mono font-bold text-xs text-[var(--text-primary)]">
              {claudeConfig?.modelName || 'claude-3-7-sonnet'}
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] block">
              Fallback: claude-3-5-haiku
            </span>
          </div>

          {/* Budget Limit & Month Spend */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">
                {isEn ? 'Monthly Budget' : 'Plafond Mensuel'}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                ${claudeConfig?.monthSpendUsd?.toFixed(2) || '0.00'} / ${claudeConfig?.monthlyBudgetUsd || 100}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-purple-600 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    ((claudeConfig?.monthSpendUsd || 0) / (claudeConfig?.monthlyBudgetUsd || 100)) * 100
                  )}%`
                }}
              />
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] block">
              {isEn ? 'Alert threshold before quota lock' : 'Seuil d’alerte avant blocage quota'}
            </span>
          </div>

          {/* Health Check Status */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">
              {isEn ? 'API Health & Latency' : 'Santé & Latence API'}
            </span>
            <div className="flex items-center gap-1.5 font-bold">
              {claudeConfig?.lastHealthStatus === 'healthy' ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isEn ? 'Operational' : 'Opérationnel'} ({claudeConfig.lastHealthLatencyMs || 140}ms)
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {claudeConfig?.lastHealthStatus || 'Non testé'}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] block">
              {claudeConfig?.lastHealthCheckAt
                ? new Date(claudeConfig.lastHealthCheckAt).toLocaleTimeString()
                : (isEn ? 'Never tested' : 'Jamais testé')}
            </span>
          </div>
        </div>
      </Card>

      {/* MODAL: CONFIGURE / ROTATE CLAUDE API KEY */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)] font-display">
                    {isEn ? 'Configure Claude API Key' : 'Configuration de la Clé Claude API'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isEn ? 'Enter the Anthropic API key to securely power Zina AI.' : 'Renseignez la clé secrète Anthropic pour Zina AI.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)] block">
                  {isEn ? 'Anthropic API Key' : 'Clé API Anthropic (sk-ant-...)'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  autoComplete="off"
                />
                <span className="text-[10px] text-[var(--text-secondary)] block">
                  {isEn
                    ? 'The key will be encrypted in the server vault and never sent back to browsers.'
                    : 'La clé sera chiffrée dans le coffre serveur PostgreSQL et ne sera jamais renvoyée au navigateur.'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-primary)] block">
                    {isEn ? 'Default Model' : 'Modèle par Défaut'}
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="claude-3-7-sonnet">Claude 3.7 Sonnet (Menu Vision)</option>
                    <option value="claude-3-5-haiku">Claude 3.5 Haiku (Fast & Cheap)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-primary)] block">
                    {isEn ? 'Monthly Budget Alert ($ USD)' : 'Plafond Mensuel Alerte ($ USD)'}
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    step="10"
                    value={monthlyBudgetUsd}
                    onChange={(e) => setMonthlyBudgetUsd(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {isEn
                    ? 'This action will be logged in the immutable audit trail without storing the key value.'
                    : 'Cette opération sera consignée dans le journal d’audit immuable sans enregistrer la valeur de la clé.'}
                </span>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
                >
                  {isEn ? 'Cancel' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingKey || !newApiKey.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingKey ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{isEn ? 'Encrypting...' : 'Chiffrement...'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Save & Encrypt Key' : 'Enregistrer et Chiffrer'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consumption Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Operations */}
        <Card className="p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {isEn ? 'AI Requests Executed' : 'Requêtes IA Exécutées'}
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)] font-display mt-1">
            {events.length}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            {successfulCount} {isEn ? 'successful' : 'réussies'}
          </div>
        </Card>

        {/* Token Consumption */}
        <Card className="p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {isEn ? 'Tokens Consumed' : 'Volume de Jetons'}
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)] font-display mt-1">
            {(totalInputTokens + totalOutputTokens).toLocaleString()}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-1 font-mono">
            In: {totalInputTokens.toLocaleString()} | Out: {totalOutputTokens.toLocaleString()}
          </div>
        </Card>

        {/* Estimated Cost USD */}
        <Card className="p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {isEn ? 'Estimated Cost (USD)' : 'Coût Estimé (USD)'}
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-display mt-1">
            ${totalCostUsd.toFixed(4)}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-1">
            {isEn ? 'Calculated from token pricing' : 'Calculé sur grille tarifaire Anthropic'}
          </div>
        </Card>

        {/* Estimated Cost MAD */}
        <Card className="p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {isEn ? 'Estimated Cost (MAD)' : 'Coût Estimé (MAD)'}
          </div>
          <div className="text-2xl font-black text-brand-orange font-display mt-1">
            {totalCostMad.toFixed(2)} MAD
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-1">
            Taux de change USD/MAD : ~10.05
          </div>
        </Card>
      </div>

      {/* Model Tariffs & Limits Info Box */}
      <Card className="p-5">
        <h3 className="text-sm font-bold text-[var(--text-primary)] font-display mb-3">
          {isEn ? 'Claude Model Rates & Active Limits' : 'Grille Tarifaire Claude & Quotas Actifs'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] space-y-1">
            <div className="font-bold text-[var(--text-primary)]">Claude 3.7 Sonnet (Menu Vision & Analysis)</div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              Input : $3.00 / million tokens (~30.15 MAD)
            </div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              Output : $15.00 / million tokens (~150.75 MAD)
            </div>
            <div className="text-[10px] text-brand-orange font-bold pt-1">
              {isEn ? 'Estimated cost per menu generated: ~0.45 MAD' : 'Coût estimé par carte générée : ~0,45 MAD'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] space-y-1">
            <div className="font-bold text-[var(--text-primary)]">Claude 3.5 Haiku (Translations & Quick Tags)</div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              Input : $0.80 / million tokens (~8.04 MAD)
            </div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              Output : $4.00 / million tokens (~40.20 MAD)
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold pt-1">
              {isEn ? 'Estimated cost per translation: ~0.08 MAD' : 'Coût estimé par traduction de plat : ~0,08 MAD'}
            </div>
          </div>
        </div>
      </Card>

      {/* Events Log Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-primary)] font-display">
            {isEn ? 'Recent AI Operation Logs' : 'Journal des Événements IA Récentes'}
          </h3>
          <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">
            {events.length} {isEn ? 'Events' : 'Événements'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-card-hover)] text-[var(--text-secondary)] uppercase text-[10px] tracking-wider border-b border-[var(--border-subtle)]">
              <tr>
                <th className="py-3 px-4">{isEn ? 'Timestamp' : 'Horodatage'}</th>
                <th className="py-3 px-4">{isEn ? 'Feature / Op' : 'Fonction'}</th>
                <th className="py-3 px-4">{isEn ? 'Model' : 'Modèle'}</th>
                <th className="py-3 px-4">{isEn ? 'Tokens' : 'Jetons'}</th>
                <th className="py-3 px-4">{isEn ? 'Cost (MAD)' : 'Coût (MAD)'}</th>
                <th className="py-3 px-4">{isEn ? 'Latency' : 'Latence'}</th>
                <th className="py-3 px-4">{isEn ? 'Status' : 'Statut'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-secondary)]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-orange" />
                    <span>{isEn ? 'Loading AI events...' : 'Chargement des événements IA...'}</span>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-secondary)]">
                    <Cpu className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-600" />
                    <span>{isEn ? 'No AI events recorded yet in the log.' : 'Aucun événement IA enregistré dans le journal.'}</span>
                  </td>
                </tr>
              ) : (
                events.map(ev => (
                  <tr key={ev.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)]">
                      {new Date(ev.createdAt).toLocaleTimeString(isEn ? 'en-US' : 'fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>

                    <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                      {ev.feature}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)]">
                      {ev.model}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px]">
                      {ev.totalTokens.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-brand-orange">
                      {ev.estimatedCostMad.toFixed(3)} MAD
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)]">
                      {ev.latencyMs} ms
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant={ev.status === 'success' ? 'success' : 'error'} size="sm">
                        {ev.status}
                      </Badge>
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
