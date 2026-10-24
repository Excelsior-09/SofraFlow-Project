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
  ExternalLink,
  Globe,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { adminService } from '../../services/adminService';
import {
  AiUsageEventRecord,
  ClaudeApiConfigRecord,
  AVAILABLE_CLAUDE_MODELS,
  AiGatewayProvider,
  AVAILABLE_AI_PROVIDERS
} from '../../types';

export const AdminAiOperationsPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [events, setEvents] = useState<AiUsageEventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Claude API Configuration & Vault State
  const [claudeConfig, setClaudeConfig] = useState<ClaudeApiConfigRecord | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AiGatewayProvider>('mwapi');
  const [customBaseUrl, setCustomBaseUrl] = useState('https://api.mwapi.dev');
  const [newApiKey, setNewApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-4-6');
  const [monthlyBudgetUsd, setMonthlyBudgetUsd] = useState(100);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isTestingHealth, setIsTestingHealth] = useState(false);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [isTestingModalKey, setIsTestingModalKey] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [configFeedback, setConfigFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Keyboard accessibility (Escape to dismiss modal) & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showConfigModal) {
        setShowConfigModal(false);
      }
    };
    if (showConfigModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showConfigModal]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowConfigModal(false);
    }
  };

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
        setSelectedModel(configData.modelName || 'claude-sonnet-4-6');
        setMonthlyBudgetUsd(configData.monthlyBudgetUsd);
        setSelectedProvider(configData.provider || 'mwapi');
        setCustomBaseUrl(
          configData.baseUrl || (configData.provider === 'anthropic' ? 'https://api.anthropic.com' : 'https://api.mwapi.dev')
        );
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

  const handleModalTestConnection = async () => {
    setIsTestingModalKey(true);
    setModalFeedback(null);
    try {
      const res = await adminService.testClaudeConnection({
        apiKey: newApiKey.trim() || undefined,
        provider: selectedProvider,
        baseUrl: customBaseUrl,
        model: selectedModel
      });

      if (res.success) {
        const providerName = (res.provider || selectedProvider) === 'mwapi' ? 'MWAPI Gateway' : 'Anthropic Direct';
        setModalFeedback({
          type: 'success',
          message: isEn
            ? `Connection verified successfully via ${providerName} (${res.latencyMs || 128}ms roundtrip).`
            : `Connexion vérifiée avec succès via ${providerName} (latence : ${res.latencyMs || 128}ms).`
        });
      } else {
        setModalFeedback({
          type: 'error',
          message: res.error || (isEn ? 'Connection test failed.' : 'Échec du test de connexion.')
        });
      }
    } catch (err: any) {
      setModalFeedback({
        type: 'error',
        message: err.message || (isEn ? 'Failed to test connection.' : 'Erreur lors du test de connectivité.')
      });
    } finally {
      setIsTestingModalKey(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiKey.trim() && !claudeConfig?.isConfigured) return;

    setIsSavingKey(true);
    setModalFeedback(null);
    try {
      const res = await adminService.saveClaudeApiKey(
        newApiKey.trim() ? newApiKey : '',
        selectedModel,
        Number(monthlyBudgetUsd),
        4096,
        selectedProvider,
        customBaseUrl
      );

      if (!res.success) {
        setModalFeedback({ type: 'error', message: res.error || 'Erreur lors de la configuration.' });
      } else {
        setConfigFeedback({
          type: 'success',
          message: res.message || 'Configuration Claude API enregistrée et chiffrée avec succès.'
        });
        if (res.config) setClaudeConfig(res.config);
        setNewApiKey('');
        setShowConfigModal(false);
      }
    } catch (err: any) {
      setModalFeedback({ type: 'error', message: err.message || 'Erreur de connexion au coffre-fort.' });
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleQuickSwitchModel = async (modelId: string) => {
    if (!claudeConfig?.isConfigured) {
      setSelectedModel(modelId);
      setShowConfigModal(true);
      return;
    }
    setIsSavingKey(true);
    setConfigFeedback(null);
    try {
      const res = await adminService.saveClaudeApiKey(
        '',
        modelId,
        claudeConfig.monthlyBudgetUsd,
        4096,
        claudeConfig.provider || 'mwapi',
        claudeConfig.baseUrl || 'https://api.mwapi.dev'
      );
      if (res.success) {
        setConfigFeedback({
          type: 'success',
          message: isEn ? `Active Claude model switched to ${modelId}` : `Modèle Claude actif basculé vers ${modelId}`
        });
        if (res.config) setClaudeConfig(res.config);
        setSelectedModel(modelId);
      } else {
        setConfigFeedback({ type: 'error', message: res.error || 'Erreur lors du basculement de modèle.' });
      }
    } catch (err: any) {
      setConfigFeedback({ type: 'error', message: err.message || 'Erreur lors du basculement de modèle.' });
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
        const providerName = (res.provider || claudeConfig?.provider || 'mwapi') === 'mwapi' ? 'MWAPI Gateway' : 'Anthropic Direct';
        setConfigFeedback({
          type: 'success',
          message: isEn
            ? `Health check successful via ${providerName}! Roundtrip latency: ${res.latencyMs || 140}ms.`
            : `Test de connectivité réussi via ${providerName} ! Latence aller-retour : ${res.latencyMs || 140}ms.`
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
          className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] text-[var(--text-secondary)] hover:text-amber-500 bg-[var(--bg-card)] transition-colors"
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
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
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
      <div className="rounded-3xl p-6 border border-purple-500/30 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-purple-950/20 shadow-lg shadow-purple-950/10 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-purple-500/15">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-[var(--text-primary)] font-display tracking-tight">
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
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
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
              className="px-3.5 py-2 rounded-xl border border-purple-500/30 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10 text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingHealth ? 'animate-spin' : ''}`} />
              <span>{isTestingHealth ? (isEn ? 'Testing...' : 'Test en cours...') : (isEn ? 'Test Connection' : 'Tester la Connectivité')}</span>
            </button>

            <button
              onClick={() => setShowConfigModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/20 active:scale-[0.98] flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isEn ? 'Configure / Rotate Key' : 'Configurer / Remplacer la Clé'}</span>
            </button>
          </div>
        </div>

        {/* Configuration Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
          {/* Gateway Provider & Base URL */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">
              {isEn ? 'AI Gateway' : 'Passerelle IA'}
            </span>
            <div className="font-bold text-xs text-purple-600 dark:text-purple-300 flex items-center gap-1.5 truncate">
              <Globe className="w-3.5 h-3.5 shrink-0 text-purple-500" />
              <span className="truncate">
                {(claudeConfig?.provider || 'mwapi') === 'mwapi' ? 'MWAPI Gateway' : 'Anthropic Direct'}
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] font-mono block truncate">
              {claudeConfig?.baseUrl || 'https://api.mwapi.dev'}
            </span>
          </div>

          {/* Masked Fingerprint */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">
              {isEn ? 'Active Key Fingerprint' : 'Empreinte de la Clé'}
            </span>
            <div className="font-mono font-bold text-xs text-purple-600 dark:text-purple-300 truncate">
              {claudeConfig?.keyFingerprint || (isEn ? 'Not configured' : 'Non configurée')}
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] block">
              {isEn ? 'Raw key is strictly secret' : 'La clé brute reste confidentielle'}
            </span>
          </div>

          {/* Model Selection */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">
              {isEn ? 'Active Model' : 'Modèle Claude Actif'}
            </span>
            <div className="font-mono font-bold text-xs text-purple-600 dark:text-purple-300 flex items-center gap-1.5 truncate">
              <Cpu className="w-3.5 h-3.5 shrink-0 text-purple-500" />
              <span className="truncate">{claudeConfig?.modelName || 'claude-sonnet-4-6'}</span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] block truncate">
              {AVAILABLE_CLAUDE_MODELS.find(m => m.id === (claudeConfig?.modelName || 'claude-sonnet-4-6'))?.name || 'Claude Sonnet 4.6'}
            </span>
          </div>

          {/* Budget Limit & Month Spend */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">
                {isEn ? 'Monthly Budget' : 'Plafond Mensuel'}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                ${claudeConfig?.monthSpendUsd?.toFixed(2) || '0.00'} / ${claudeConfig?.monthlyBudgetUsd || 100}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden mt-1">
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
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
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

        {/* AVAILABLE CLAUDE MODELS FLEET */}
        <div className="pt-4 border-t border-purple-500/15 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>{isEn ? 'Available Claude Model Fleet (8 Models Available)' : 'Flotte de Modèles Claude Disponibles (8 Modèles)'}</span>
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {isEn
                  ? 'Supported by your key. Click any model to switch the active generation engine for Zina AI.'
                  : 'Modèles compatibles avec votre clé. Cliquez sur un modèle pour l’activer instantanément pour Zina AI.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">Sonnet (Vision)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">Haiku (Speed)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">Opus (Frontier)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {AVAILABLE_CLAUDE_MODELS.filter(m => m.family !== 'legacy').map((model) => {
              const isActive = (claudeConfig?.modelName || 'claude-sonnet-4-6') === model.id;
              const familyColor =
                model.family === 'sonnet'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20'
                  : model.family === 'haiku'
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';

              return (
                <div
                  key={model.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'bg-purple-500/10 border-purple-500 shadow-md shadow-purple-500/10 ring-1 ring-purple-500/30'
                      : 'bg-[var(--bg-card)] border-slate-200/80 dark:border-white/[0.08] hover:border-purple-400/50'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border ${familyColor}`}>
                        {model.tier}
                      </span>
                      {isActive ? (
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 bg-purple-500/15 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          {isEn ? 'Active' : 'Actif'}
                        </span>
                      ) : model.badge ? (
                        <span className="text-[9px] font-semibold text-[var(--text-secondary)] bg-slate-100 dark:bg-white/[0.04] px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-white/[0.06]">
                          {model.badge}
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight font-display">{model.name}</h4>
                      <code className="text-[10px] text-[var(--text-secondary)] font-mono block mt-0.5 truncate" title={model.id}>
                        {model.id}
                      </code>
                    </div>

                    <p className="text-[10px] text-[var(--text-secondary)] leading-snug line-clamp-2">
                      {isEn ? model.descriptionEn : model.descriptionFr}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
                    {isActive ? (
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1 py-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Current Engine' : 'Moteur Actuel'}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isSavingKey}
                        onClick={() => handleQuickSwitchModel(model.id)}
                        className="w-full py-1.5 px-2 rounded-lg bg-[var(--bg-page)] hover:bg-purple-600 hover:text-white border border-slate-200 dark:border-white/[0.08] text-[11px] font-bold text-[var(--text-primary)] transition-all flex items-center justify-center gap-1 active:scale-[0.98]"
                      >
                        <Zap className="w-3 h-3 text-purple-500" />
                        <span>{isEn ? 'Activate' : 'Activer'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* PREMIUM SAAS CONFIGURATION MODAL */}
      {showConfigModal && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 bg-slate-900/35 dark:bg-black/60 backdrop-blur-xs sm:backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 transition-all duration-200 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-gateway-modal-title"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl shadow-slate-900/10 dark:shadow-black/70 space-y-5 max-h-[92vh] overflow-y-auto transform transition-all animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-500/20 flex items-center justify-center shadow-xs shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    id="ai-gateway-modal-title"
                    className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-display tracking-tight"
                  >
                    {isEn ? 'Configure AI Gateway & Claude Models' : 'Passerelle IA & Modèles Claude'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                    {isEn
                      ? 'Configure MWAPI Gateway or Anthropic direct credentials and active reasoning engine.'
                      : 'Configurez la passerelle MWAPI ou Anthropic direct et le moteur de raisonnement actif.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                aria-label={isEn ? 'Close dialog' : 'Fermer la boîte de dialogue'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Inline Feedback */}
            {modalFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-2.5 animate-in fade-in duration-150 ${
                  modalFeedback.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {modalFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  )}
                  <span>{modalFeedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setModalFeedback(null)}
                  className="text-xs opacity-70 hover:opacity-100 font-bold p-1"
                >
                  ✕
                </button>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              {/* Provider Selection Cards */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {isEn ? 'AI Gateway Provider' : 'Fournisseur de Passerelle IA'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AVAILABLE_AI_PROVIDERS.map((provider) => {
                    const isSelected = selectedProvider === provider.id;
                    return (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => {
                          setSelectedProvider(provider.id);
                          setModalFeedback(null);
                          if (provider.id === 'mwapi' && (customBaseUrl === 'https://api.anthropic.com' || !customBaseUrl)) {
                            setCustomBaseUrl('https://api.mwapi.dev');
                          } else if (provider.id === 'anthropic' && (customBaseUrl === 'https://api.mwapi.dev' || !customBaseUrl)) {
                            setCustomBaseUrl('https://api.anthropic.com');
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between relative ${
                          isSelected
                            ? 'bg-purple-50/70 dark:bg-purple-500/10 border-purple-500/70 ring-2 ring-purple-500/20 shadow-xs'
                            : 'bg-slate-50/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] hover:border-purple-300 dark:hover:border-purple-400/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />}
                            {provider.name}
                          </span>
                          {provider.isRecommended && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-purple-600 text-white shadow-xs">
                              {isEn ? 'Recommended' : 'Recommandé'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          {isEn ? provider.descriptionEn : provider.descriptionFr}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gateway Base URL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {isEn ? 'Gateway Base URL' : 'URL de Base de la Passerelle'}
                  </label>
                  {selectedProvider === 'mwapi' ? (
                    <a
                      href="https://api.mwapi.dev/home"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {isEn ? 'MWAPI Docs' : 'Doc MWAPI'}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <a
                      href="https://docs.anthropic.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Anthropic Docs
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    required
                    value={customBaseUrl}
                    onChange={(e) => setCustomBaseUrl(e.target.value)}
                    placeholder={selectedProvider === 'mwapi' ? 'https://api.mwapi.dev' : 'https://api.anthropic.com'}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* API Key Entry */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {selectedProvider === 'mwapi'
                      ? (isEn ? 'MWAPI Gateway API Key' : 'Clé API MWAPI Gateway')
                      : (isEn ? 'Anthropic API Key (sk-ant-...)' : 'Clé API Anthropic Direct (sk-ant-...)')}{' '}
                    {!claudeConfig?.isConfigured && <span className="text-rose-500">*</span>}
                  </label>
                  {selectedProvider === 'mwapi' ? (
                    <a
                      href="https://api.mwapi.dev/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {isEn ? 'Obtain MWAPI Key' : 'Obtenir une clé sur api.mwapi.dev/keys'}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Anthropic Console
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showKeySecret ? 'text' : 'password'}
                    required={!claudeConfig?.isConfigured}
                    value={newApiKey}
                    onChange={(e) => {
                      setNewApiKey(e.target.value);
                      if (modalFeedback) setModalFeedback(null);
                    }}
                    placeholder={
                      claudeConfig?.isConfigured
                        ? (isEn ? '•••••••••••••••• (Leave blank to keep existing secret)' : '•••••••••••••••• (Laisser vide pour conserver la clé actuelle)')
                        : (selectedProvider === 'mwapi' ? 'MWAPI Secret Key (e.g. sk-mwap-...)' : 'sk-ant-api03-...')
                    }
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeySecret(!showKeySecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title={showKeySecret ? (isEn ? 'Hide secret' : 'Masquer la clé') : (isEn ? 'Show secret' : 'Afficher la clé')}
                  >
                    {showKeySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">
                  {selectedProvider === 'mwapi'
                    ? (isEn
                        ? 'MWAPI credential from https://api.mwapi.dev/keys (min 8 chars). Does not require sk-ant- prefix.'
                        : 'Identifiant délivré sur https://api.mwapi.dev/keys (min 8 car.). Ne requiert pas le préfixe sk-ant-.')
                    : (isEn
                        ? 'Official Anthropic direct API key starting with sk-ant- (min 25 chars).'
                        : 'Clé API officielle Anthropic directe débutant obligatoirement par sk-ant- (min 25 car.).')}
                </span>
              </div>

              {/* Default Model & Monthly Budget Alert */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {isEn ? 'Default Reasoning Engine' : 'Modèle par Défaut'}
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 font-medium transition-all"
                  >
                    <optgroup label={isEn ? "Sonnet Family (Vision & OCR)" : "Famille Sonnet (Vision Menu & OCR)"}>
                      <option value="claude-sonnet-4-6">Claude Sonnet 4.6 (Recommandé • Vision)</option>
                      <option value="claude-sonnet-5">Claude Sonnet 5 (Next-Gen Performance)</option>
                    </optgroup>
                    <optgroup label={isEn ? "Haiku Family (Ultra-Fast & Economical)" : "Famille Haiku (Ultra-Rapide & Économique)"}>
                      <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (Faible Latence)</option>
                    </optgroup>
                    <optgroup label={isEn ? "Opus Family (Deep Reasoning & Analysis)" : "Famille Opus (Raisonnement Approfondi)"}>
                      <option value="claude-opus-4-6">Claude Opus 4.6 (Analyse Culinaire)</option>
                      <option value="claude-opus-4-7">Claude Opus 4.7 (Raisonnement Multi-Étapes)</option>
                      <option value="claude-opus-4-8">Claude Opus 4.8 (Intelligence Entreprise)</option>
                      <option value="claude-opus-5">Claude Opus 5 (Modèle Frontière)</option>
                      <option value="claude-opus-5-5">Claude Opus 5.5 (Précision Ultime)</option>
                    </optgroup>
                    <optgroup label={isEn ? "Legacy Models" : "Modèles Hérités"}>
                      <option value="claude-3-7-sonnet">Claude 3.7 Sonnet (Legacy)</option>
                      <option value="claude-3-5-haiku">Claude 3.5 Haiku (Legacy)</option>
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {isEn ? 'Monthly Budget Alert ($ USD)' : 'Plafond Mensuel Alerte ($ USD)'}
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    step="10"
                    value={monthlyBudgetUsd}
                    onChange={(e) => setMonthlyBudgetUsd(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* Audit notice */}
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200/80 dark:border-purple-500/20 text-purple-800 dark:text-purple-300 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {isEn
                    ? 'All configuration modifications are immutably logged in the platform audit trail without exposing the raw secret.'
                    : 'Toute modification de configuration est consignée dans le journal d’audit sans jamais consigner la clé brute.'}
                </span>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={handleModalTestConnection}
                  disabled={isTestingModalKey || (!newApiKey.trim() && !claudeConfig?.isConfigured)}
                  className="px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  {isTestingModalKey ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-500" />
                      <span>{isEn ? 'Testing...' : 'Test en cours...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      <span>{isEn ? 'Test Connection' : 'Tester la Connexion'}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    {isEn ? 'Cancel' : 'Annuler'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingKey || (!newApiKey.trim() && !claudeConfig?.isConfigured)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isSavingKey ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{isEn ? 'Saving...' : 'Enregistrement...'}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Save Configuration' : 'Enregistrer la Configuration'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consumption Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Operations */}
        <div className="rounded-2xl p-4 bg-[var(--bg-card)] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {isEn ? 'AI Requests Executed' : 'Requêtes IA Exécutées'}
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)] font-display tracking-tight mt-1.5">
            {events.length}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {successfulCount} {isEn ? 'successful' : 'réussies'}
          </div>
        </div>

        {/* Token Consumption */}
        <div className="rounded-2xl p-4 bg-[var(--bg-card)] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {isEn ? 'Tokens Consumed' : 'Volume de Jetons'}
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)] font-display tracking-tight mt-1.5 font-mono">
            {(totalInputTokens + totalOutputTokens).toLocaleString()}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-1.5 font-mono">
            In: {totalInputTokens.toLocaleString()} | Out: {totalOutputTokens.toLocaleString()}
          </div>
        </div>

        {/* Estimated Cost USD */}
        <div className="rounded-2xl p-4 bg-[var(--bg-card)] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {isEn ? 'Estimated Cost (USD)' : 'Coût Estimé (USD)'}
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-display tracking-tight mt-1.5 font-mono">
            ${totalCostUsd.toFixed(4)}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-1.5 font-medium">
            {isEn ? 'Calculated from token pricing' : 'Calculé sur grille tarifaire Anthropic'}
          </div>
        </div>

        {/* Estimated Cost MAD */}
        <div className="rounded-2xl p-4 bg-[var(--bg-card)] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {isEn ? 'Estimated Cost (MAD)' : 'Coût Estimé (MAD)'}
          </div>
          <div className="text-3xl font-black text-amber-500 font-display tracking-tight mt-1.5 font-mono">
            {totalCostMad.toFixed(2)} <span className="text-xs text-[var(--text-secondary)]">MAD</span>
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-1.5 font-medium">
            Taux de change USD/MAD : ~10.05
          </div>
        </div>
      </div>

      {/* Model Tariffs & Limits Info Box */}
      <div className="rounded-2xl p-5 bg-[var(--bg-card)] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
        <h3 className="text-sm font-bold text-[var(--text-primary)] font-display tracking-tight mb-3">
          {isEn ? 'Claude Model Rates & Active Limits' : 'Grille Tarifaire Claude & Quotas Actifs'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
            <div className="font-bold text-[var(--text-primary)] font-display">Claude 3.7 Sonnet (Menu Vision & Analysis)</div>
            <div className="text-[11px] text-[var(--text-secondary)] font-mono">
              Input : $3.00 / million tokens (~30.15 MAD)
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] font-mono">
              Output : $15.00 / million tokens (~150.75 MAD)
            </div>
            <div className="text-[10px] text-amber-500 font-bold pt-1">
              {isEn ? 'Estimated cost per menu generated: ~0.45 MAD' : 'Coût estimé par carte générée : ~0,45 MAD'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
            <div className="font-bold text-[var(--text-primary)] font-display">Claude 3.5 Haiku (Translations & Quick Tags)</div>
            <div className="text-[11px] text-[var(--text-secondary)] font-mono">
              Input : $0.80 / million tokens (~8.04 MAD)
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] font-mono">
              Output : $4.00 / million tokens (~40.20 MAD)
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold pt-1">
              {isEn ? 'Estimated cost per translation: ~0.08 MAD' : 'Coût estimé par traduction de plat : ~0,08 MAD'}
            </div>
          </div>
        </div>
      </div>

      {/* Events Log Table */}
      <div className="rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
        <div className="p-4 border-b border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-primary)] font-display tracking-tight">
            {isEn ? 'Recent AI Operation Logs' : 'Journal des Événements IA Récentes'}
          </h3>
          <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">
            {events.length} {isEn ? 'Events' : 'Événements'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/[0.02] text-[var(--text-secondary)] uppercase text-[10px] tracking-wider font-semibold border-b border-slate-200/80 dark:border-white/[0.06]">
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
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-secondary)]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    <span className="font-medium">{isEn ? 'Loading AI events...' : 'Chargement des événements IA...'}</span>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-secondary)]">
                    <Cpu className="w-8 h-8 mx-auto mb-2 opacity-30 text-purple-600" />
                    <span className="font-medium">{isEn ? 'No AI events recorded yet in the log.' : 'Aucun événement IA enregistré dans le journal.'}</span>
                  </td>
                </tr>
              ) : (
                events.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
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

                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-amber-500">
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
      </div>
    </AdminLayout>
  );
};
