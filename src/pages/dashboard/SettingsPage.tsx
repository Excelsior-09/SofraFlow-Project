import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Save,
  Settings,
  ShieldCheck,
  Building,
  User,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { NoActiveRestaurantCard } from '../../components/common/NoActiveRestaurantCard';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Restaurant } from '../../types';

export const SettingsPage: React.FC = () => {
  const {
    activeRestaurant,
    refreshState
  } = useAuth();
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  // Restaurant operational settings state
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
        <NoActiveRestaurantCard
          icon={<Settings className="w-8 h-8" />}
          title={isEn ? 'No active establishment' : 'Aucun établissement actif'}
          description={
            isEn
              ? 'Please select or create your establishment to configure operational settings.'
              : 'Veuillez sélectionner ou créer votre établissement pour modifier ses paramètres.'
          }
        />
        <div className="mt-4 flex justify-center">
          <Link
            to="/app/profile"
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-forest dark:bg-gold text-white dark:text-forest-dark hover:opacity-95 shadow-soft transition-all"
          >
            <User className="w-4 h-4" />
            <span>{isEn ? 'Manage User Profile & Password' : 'Gérer Mon Profil & Mot de Passe'}</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const handleSaveOperations = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      db.updateRestaurant(restaurant);

      if (isSupabaseConfigured) {
        await supabaseService.updateRestaurant(restaurant.id, restaurant);
      }

      refreshState();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('[SettingsPage] Error saving settings:', err);
      setSaveError(err?.message || (isEn ? 'Failed to save settings. Please try again.' : 'Échec de l’enregistrement des paramètres. Veuillez réessayer.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-subtle dark:border-[#233831]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display flex items-center gap-2.5">
              <Building className="w-7 h-7 text-forest dark:text-gold" />
              <span>{t('settings.pageTitle')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary dark:text-[#97A7A0] mt-1">
              {isEn
                ? 'Manage your establishment parameters, fulfillment preferences, VAT, service fees, and dining tables.'
                : 'Gérez les paramètres opérationnels, coordonnées, TVA, frais de service et modes de commande.'}
            </p>
          </div>

          <Link
            to="/app/profile"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border-subtle dark:border-[#233831] text-ink-secondary dark:text-[#97A7A0] hover:text-forest dark:hover:text-[#F0F4F2] text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-[#101E1A] transition-all self-start sm:self-auto"
          >
            <User className="w-4 h-4 text-forest dark:text-gold" />
            <span>{isEn ? 'User Profile & Password' : 'Profil & Sécurité'}</span>
          </Link>
        </div>
          <>
            {saveSuccess && (
              <Alert type="success">
                {t('settings.savedNotice')}
              </Alert>
            )}
            {saveError && (
              <Alert type="error">
                {saveError}
              </Alert>
            )}

            <form onSubmit={handleSaveOperations} className="space-y-6">
              {/* Identity Card */}
              <Card className="p-6 space-y-4 border border-border-subtle dark:border-[#233831]">
                <h3 className="font-bold text-sm text-forest dark:text-[#F0F4F2] uppercase tracking-wider font-display">
                  {t('settings.generalInfoTitle')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                      {t('settings.restaurantName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={restaurant.name}
                      onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                      {t('settings.phone')}
                    </label>
                    <input
                      type="text"
                      value={restaurant.phone}
                      onChange={(e) => setRestaurant({ ...restaurant, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                      {t('settings.city')}
                    </label>
                    <input
                      type="text"
                      value={restaurant.city}
                      onChange={(e) => setRestaurant({ ...restaurant, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                      {t('settings.address')}
                    </label>
                    <input
                      type="text"
                      value={restaurant.address}
                      onChange={(e) => setRestaurant({ ...restaurant, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                    {t('settings.description')}
                  </label>
                  <textarea
                    rows={2}
                    value={restaurant.description}
                    onChange={(e) => setRestaurant({ ...restaurant, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                  />
                </div>
              </Card>

              {/* Financial & Operational Parameters */}
              <Card className="p-6 space-y-4 border border-border-subtle dark:border-[#233831]">
                <h3 className="font-bold text-sm text-forest dark:text-[#F0F4F2] uppercase tracking-wider font-display">
                  {t('settings.operationsTitle')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                      {t('settings.taxRate')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
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
                <Button variant="primary" size="md" type="submit" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                  {t('settings.saveBtn')}
                </Button>
              </div>
            </form>

            {/* Account Security & Credentials Guidance Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14241F] border border-border-subtle dark:border-[#233831] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-forest/10 dark:bg-gold/15 text-forest dark:text-gold flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-forest dark:text-[#F0F4F2]">
                    {isEn ? 'Account Security & Two-Factor Authentication (2FA)' : 'Sécurité du Compte Personnel & Authentification à Deux Facteurs (2FA)'}
                  </h4>
                  <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0] mt-0.5">
                    {isEn
                      ? 'Password updates, authenticator apps (TOTP), and personal login credentials are now centralized under your User Profile.'
                      : 'La modification de votre mot de passe, l’activation du 2FA et vos identifiants personnels sont désormais gérés dans votre Profil Utilisateur.'}
                  </p>
                </div>
              </div>

              <Link
                to="/app/profile"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest dark:bg-gold text-white dark:text-forest-dark text-xs font-bold hover:opacity-90 transition-opacity shrink-0 shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>{isEn ? 'Go to Profile & Security' : 'Gérer Mon Profil & Sécurité'}</span>
              </Link>
            </div>
          </>
      </div>
    </DashboardLayout>
  );
};
