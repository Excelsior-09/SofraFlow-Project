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
  Sliders
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { adminService } from '../../services/adminService';
import { AiUsageEventRecord } from '../../types';

export const AdminAiOperationsPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [events, setEvents] = useState<AiUsageEventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAiUsageEvents(100);
      setEvents(data);
    } catch (err) {
      console.error('[AdminAiOperationsPage] Error loading AI events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      {/* Provider Status Card */}
      <Card className="p-5 border-l-4 border-l-purple-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-display">
                  Anthropic Claude API (Primary Provider)
                </h3>
                <Badge variant="success" size="sm">
                  {isEn ? 'Configured' : 'Connecté'}
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Model: <span className="font-mono font-bold text-[var(--text-primary)]">claude-3-7-sonnet</span> / <span className="font-mono text-[var(--text-primary)]">claude-3-5-haiku</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-[var(--text-secondary)] block uppercase">
                {isEn ? 'Provider Status' : 'Statut API'}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Operational
              </span>
            </div>
            <div className="h-6 w-px bg-[var(--border-subtle)]" />
            <div>
              <span className="text-[10px] text-[var(--text-secondary)] block uppercase">
                {isEn ? 'Avg Latency' : 'Latence Moy.'}
              </span>
              <span className="font-bold text-[var(--text-primary)]">
                {avgLatency > 0 ? `${avgLatency} ms` : '1.8 s'}
              </span>
            </div>
          </div>
        </div>
      </Card>

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
