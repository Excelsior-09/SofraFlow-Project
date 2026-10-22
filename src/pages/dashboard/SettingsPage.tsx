import React, { useState, useEffect } from 'react';
import { Save, Settings } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Restaurant } from '../../types';

export const SettingsPage: React.FC = () => {
  const { activeRestaurant, refreshState } = useAuth();
  const { t } = useLanguage();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(() =>
    activeRestaurant
      ? {
          ...activeRestaurant,
          settings: activeRestaurant.settings || {
            id: `settings_${activeRestaurant.id}`,
            restaurantId: activeRestaurant.id,
            currency: 'MAD',
            taxRatePercent: 10,
            serviceFeePercent: 0,
            enableDineIn: true,
            enableTakeaway: true,
            enableDelivery: false,
            requireCustomerPhone: false,
            tableCount: 12,
            openingHours: {}
          }
        }
      : null
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (activeRestaurant) {
      setRestaurant({
        ...activeRestaurant,
        settings: activeRestaurant.settings || {
          id: `settings_${activeRestaurant.id}`,
          restaurantId: activeRestaurant.id,
          currency: 'MAD',
          taxRatePercent: 10,
          serviceFeePercent: 0,
          enableDineIn: true,
          enableTakeaway: true,
          enableDelivery: false,
          requireCustomerPhone: false,
          tableCount: 12,
          openingHours: {}
        }
      });
    }
  }, [activeRestaurant]);

  if (!restaurant || !activeRestaurant) {
    return (
      <DashboardLayout>
        <Card className="p-8 text-center space-y-4 max-w-xl mx-auto my-12 border-border-subtle dark:border-[#233831]">
          <div className="w-12 h-12 rounded-2xl bg-forest/10 dark:bg-gold/15 text-forest dark:text-gold flex items-center justify-center mx-auto">
            <Settings className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-forest dark:text-[#F0F4F2]">
            Aucun établissement actif
          </h2>
          <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
            Veuillez sélectionner ou créer votre établissement pour modifier ses paramètres.
          </p>
        </Card>
      </DashboardLayout>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    db.updateRestaurant(restaurant);

    if (isSupabaseConfigured) {
      try {
        await supabaseService.updateRestaurant(restaurant.id, restaurant);
      } catch (err) {
        console.warn('[SettingsPage] Supabase updateRestaurant warning:', err);
      }
    }

    refreshState();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
            {t('settings.pageTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary dark:text-[#97A7A0] mt-1">
            {t('settings.pageSubtitle')}
          </p>
        </div>

        {saveSuccess && (
          <Alert type="success">
            {t('settings.savedNotice')}
          </Alert>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Identity Card */}
          <Card className="p-6 space-y-4 border border-border-subtle dark:border-[#233831]">
            <h3 className="font-bold text-sm text-forest dark:text-[#F0F4F2] uppercase tracking-wider font-display">
              {t('settings.generalInfoTitle')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                  {t('settings.restName')} *
                </label>
                <input
                  type="text"
                  required
                  value={restaurant.name}
                  onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                  {t('settings.slugLabel')}
                </label>
                <input
                  type="text"
                  value={restaurant.slug}
                  onChange={(e) => setRestaurant({ ...restaurant, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs font-mono focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                  {t('settings.city')} *
                </label>
                <input
                  type="text"
                  required
                  value={restaurant.city}
                  onChange={(e) => setRestaurant({ ...restaurant, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                  {t('settings.country')}
                </label>
                <input
                  type="text"
                  value={restaurant.country}
                  onChange={(e) => setRestaurant({ ...restaurant, country: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                  {t('settings.phone')}
                </label>
                <input
                  type="tel"
                  value={restaurant.phone}
                  onChange={(e) => setRestaurant({ ...restaurant, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                {t('settings.address')}
              </label>
              <input
                type="text"
                value={restaurant.address}
                onChange={(e) => setRestaurant({ ...restaurant, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                Description / Slogan
              </label>
              <textarea
                rows={2}
                value={restaurant.description}
                onChange={(e) => setRestaurant({ ...restaurant, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
              />
            </div>
          </Card>

          {/* Financial & Tax Settings */}
          <Card className="p-6 space-y-4 border border-border-subtle dark:border-[#233831]">
            <h3 className="font-bold text-sm text-forest dark:text-[#F0F4F2] uppercase tracking-wider font-display">
              {t('settings.financialTitle')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                  {t('settings.currency')}
                </label>
                <select
                  value={restaurant.settings.currency}
                  onChange={(e) => setRestaurant({
                    ...restaurant,
                    settings: { ...restaurant.settings, currency: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                >
                  <option value="MAD">MAD (Dirham Marocain)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                  {t('settings.taxRate')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={restaurant.settings.taxRatePercent}
                  onChange={(e) => setRestaurant({
                    ...restaurant,
                    settings: { ...restaurant.settings, taxRatePercent: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                  {t('settings.serviceFee')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={restaurant.settings.serviceFeePercent}
                  onChange={(e) => setRestaurant({
                    ...restaurant,
                    settings: { ...restaurant.settings, serviceFeePercent: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                  {t('settings.tablesCount')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={restaurant.settings.tableCount}
                  onChange={(e) => setRestaurant({
                    ...restaurant,
                    settings: { ...restaurant.settings, tableCount: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                />
              </div>
            </div>
          </Card>

          {/* Fulfillment Modes */}
          <Card className="p-6 space-y-4 border border-border-subtle dark:border-[#233831]">
            <h3 className="font-bold text-sm text-forest dark:text-[#F0F4F2] uppercase tracking-wider font-display">
              {t('settings.orderTypesTitle')}
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={restaurant.settings.enableDineIn}
                  onChange={(e) => setRestaurant({
                    ...restaurant,
                    settings: { ...restaurant.settings, enableDineIn: e.target.checked }
                  })}
                  className="rounded border-border-subtle text-forest dark:text-gold focus:ring-forest w-4 h-4"
                />
                <div>
                  <span className="font-bold text-forest dark:text-gold">{t('settings.dineIn')}</span>
                  <p className="text-ink-secondary dark:text-[#97A7A0]">Les clients commandent directement à table par QR code.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={restaurant.settings.enableTakeaway}
                  onChange={(e) => setRestaurant({
                    ...restaurant,
                    settings: { ...restaurant.settings, enableTakeaway: e.target.checked }
                  })}
                  className="rounded border-border-subtle text-forest dark:text-gold focus:ring-forest w-4 h-4"
                />
                <div>
                  <span className="font-bold text-forest dark:text-gold">{t('settings.takeaway')}</span>
                  <p className="text-ink-secondary dark:text-[#97A7A0]">Les clients commandent à emporter pour retrait au comptoir.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={restaurant.settings.requireCustomerPhone}
                  onChange={(e) => setRestaurant({
                    ...restaurant,
                    settings: { ...restaurant.settings, requireCustomerPhone: e.target.checked }
                  })}
                  className="rounded border-border-subtle text-forest dark:text-gold focus:ring-forest w-4 h-4"
                />
                <div>
                  <span className="font-bold text-forest dark:text-gold">{t('settings.requirePhone')}</span>
                  <p className="text-ink-secondary dark:text-[#97A7A0]">Exige un numéro de téléphone valide avant d'envoyer le panier en cuisine.</p>
                </div>
              </label>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button variant="primary" size="md" type="submit" leftIcon={<Save className="w-4 h-4" />}>
              {t('settings.saveBtn')}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
