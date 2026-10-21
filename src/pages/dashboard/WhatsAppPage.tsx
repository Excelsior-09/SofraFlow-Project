import React, { useEffect, useState } from 'react';
import { Send, Save } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, WhatsAppStatusBadge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';
import { testWhatsAppConnection } from '../../services/whatsappService';
import { NotificationEvent, WhatsAppConfig } from '../../types';

export const WhatsAppPage: React.FC = () => {
  const { activeRestaurant } = useAuth();
  const { t, formatTime } = useLanguage();
  const [config, setConfig] = useState<WhatsAppConfig | null>(() =>
    activeRestaurant ? activeRestaurant.whatsappConfig : null
  );
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadEvents = () => {
    if (activeRestaurant) {
      setEvents(db.getNotificationEvents(activeRestaurant.id));
    }
  };

  useEffect(() => {
    if (activeRestaurant) {
      setConfig(activeRestaurant.whatsappConfig);
      loadEvents();
    }
    const unsub = db.subscribe(loadEvents);
    return () => unsub();
  }, [activeRestaurant]);

  if (!activeRestaurant || !config) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRestaurant = {
      ...activeRestaurant,
      whatsappConfig: config
    };
    db.updateRestaurant(updatedRestaurant);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testWhatsAppConnection(config, activeRestaurant.name);
      setTestResult(result);
      loadEvents();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || t('whatsapp.testFailed')
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
                {t('whatsapp.pageTitle')}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] border border-[#25D366]/30">
                Meta Cloud API
              </span>
            </div>
            <p className="text-xs sm:text-sm text-ink-secondary dark:text-[#97A7A0] mt-1">
              {t('whatsapp.pageSubtitle')}
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            isLoading={isTesting}
            leftIcon={<Send className="w-4 h-4" />}
            onClick={handleRunTest}
          >
            {t('whatsapp.sendTestBtn')}
          </Button>
        </div>

        {/* Test Result Notice */}
        {testResult && (
          <Alert type={testResult.success ? 'success' : 'error'}>
            <div className="text-xs">
              <strong>{testResult.success ? t('whatsapp.testSuccess') : t('whatsapp.testFailed')}</strong> {testResult.message}
            </div>
          </Alert>
        )}

        {/* Settings Form Card */}
        <Card className="p-6 border border-border-subtle dark:border-[#233831]">
          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle dark:border-[#233831]">
              <div>
                <h3 className="font-bold text-base text-forest dark:text-[#F0F4F2] font-display">
                  {t('whatsapp.settingsTitle')}
                </h3>
                <p className="text-xs text-ink-secondary dark:text-[#97A7A0] mt-0.5">
                  Numéro où le chef de cuisine reçoit les bons de commande en direct.
                </p>
              </div>

              {/* Enable/Disable Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <span className="text-ink-secondary dark:text-[#97A7A0]">Notifications :</span>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="rounded border-border-subtle text-forest dark:text-gold focus:ring-forest w-4 h-4"
                />
                <span className={config.enabled ? 'text-status-success dark:text-[#4ADE80]' : 'text-ink-secondary dark:text-[#97A7A0]'}>
                  {config.enabled ? t('common.active') : t('common.inactive')}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                  {t('whatsapp.destPhone')} *
                </label>
                <input
                  type="tel"
                  required
                  value={config.destinationPhoneNumber}
                  onChange={(e) => setConfig({ ...config, destinationPhoneNumber: e.target.value })}
                  placeholder="+212661234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold font-mono"
                />
                <span className="text-[10px] text-ink-secondary dark:text-[#97A7A0] mt-1 block">
                  {t('whatsapp.destPhoneHelp')}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                  {t('whatsapp.destName')}
                </label>
                <input
                  type="text"
                  value={config.destinationName}
                  onChange={(e) => setConfig({ ...config, destinationName: e.target.value })}
                  placeholder={t('whatsapp.destNamePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                />
              </div>
            </div>

            {/* Meta Cloud API Production Credentials */}
            <div className="pt-4 border-t border-border-subtle dark:border-[#233831] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-forest dark:text-[#F0F4F2]">{t('whatsapp.credentialsTitle')}</h4>
                  <p className="text-xs text-ink-secondary dark:text-[#97A7A0] mt-0.5">
                    Laissez vide pour utiliser le simulateur Sandbox sécurisé de SOFRAFLOW.
                  </p>
                </div>
                <Badge variant={config.phoneNumberId ? 'success' : 'neutral'}>
                  {config.phoneNumberId ? 'Meta Cloud API Connecté' : t('whatsapp.sandboxMode')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                    {t('whatsapp.phoneId')}
                  </label>
                  <input
                    type="text"
                    value={config.phoneNumberId}
                    onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
                    placeholder="ex. 10482910492810"
                    className="w-full px-3.5 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs font-mono focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                    {t('whatsapp.wabaId')}
                  </label>
                  <input
                    type="text"
                    value={config.wabaId}
                    onChange={(e) => setConfig({ ...config, wabaId: e.target.value })}
                    placeholder="ex. 981273918237"
                    className="w-full px-3.5 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs font-mono focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                  {t('whatsapp.systemToken')}
                </label>
                <input
                  type="password"
                  value={config.systemAccessToken}
                  onChange={(e) => setConfig({ ...config, systemAccessToken: e.target.value })}
                  placeholder="EAAG... (Stocké de manière sécurisée)"
                  className="w-full px-3.5 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs font-mono focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                />
              </div>
            </div>

            {/* Template Info */}
            <div className="p-4 bg-ivory dark:bg-[#152520] rounded-2xl border border-border-subtle dark:border-[#233831] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-forest dark:text-gold">
                  {t('whatsapp.templateName')} : {config.templateName}
                </span>
                <p className="text-ink-secondary dark:text-[#97A7A0]">
                  Modèle transactionnel Meta avec détails des plats, référence commande et bouton d'accès au dashboard.
                </p>
              </div>
              <Badge variant="success">Validé Meta</Badge>
            </div>

            <div className="flex justify-end pt-2 border-t border-border-subtle dark:border-[#233831]">
              <Button
                variant="primary"
                size="sm"
                type="submit"
                leftIcon={<Save className="w-4 h-4" />}
              >
                {saveSuccess ? 'Configuration enregistrée !' : t('common.saveChanges')}
              </Button>
            </div>
          </form>
        </Card>

        {/* Delivery Audit Log Table */}
        <Card className="p-6 space-y-4 border border-border-subtle dark:border-[#233831]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-forest dark:text-[#F0F4F2] font-display">
                {t('whatsapp.dispatchLogsTitle')}
              </h3>
              <p className="text-xs text-ink-secondary dark:text-[#97A7A0] mt-0.5">
                Inspectez chaque notification transmise, statut de livraison et horodatage.
              </p>
            </div>
            <span className="text-xs text-ink-secondary dark:text-[#97A7A0] font-mono">{events.length} événements</span>
          </div>

          {events.length === 0 ? (
            <p className="text-xs text-ink-secondary dark:text-[#97A7A0] py-8 text-center">
              {t('whatsapp.noLogsFound')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle dark:border-[#233831] text-ink-secondary dark:text-[#97A7A0] uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 font-bold">{t('whatsapp.logTime')}</th>
                    <th className="py-2.5 font-bold">{t('whatsapp.logRecipient')}</th>
                    <th className="py-2.5 font-bold">{t('whatsapp.logStatus')}</th>
                    <th className="py-2.5 font-bold">{t('whatsapp.apiProvider')}</th>
                    <th className="py-2.5 font-bold">ID Message</th>
                    <th className="py-2.5 font-bold">Résultat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle dark:divide-[#233831]">
                  {events.slice(0, 8).map((evt) => (
                    <tr key={evt.id} className="hover:bg-ivory/50 dark:hover:bg-[#152520]/50 text-ink-main dark:text-[#F0F4F2]">
                      <td className="py-2.5 text-ink-secondary dark:text-[#97A7A0]">
                        {formatTime(evt.createdAt)}
                      </td>
                      <td className="py-2.5 font-mono">{evt.destinationPhoneNumber}</td>
                      <td className="py-2.5">
                        <WhatsAppStatusBadge status={evt.status} />
                      </td>
                      <td className="py-2.5 text-ink-secondary dark:text-[#97A7A0]">{evt.provider}</td>
                      <td className="py-2.5 font-mono text-[11px] text-ink-secondary dark:text-[#97A7A0] truncate max-w-[150px]">
                        {evt.providerMessageId || 'N/A'}
                      </td>
                      <td className="py-2.5 text-ink-secondary dark:text-[#97A7A0]">
                        {evt.errorMessage ? (
                          <span className="text-status-error">{evt.errorMessage}</span>
                        ) : (
                          <span className="text-status-success dark:text-[#4ADE80]">Transmis avec succès</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};
