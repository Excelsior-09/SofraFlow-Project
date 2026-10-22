import React, { useState, useEffect } from 'react';
import {
  Save,
  Settings,
  ShieldCheck,
  KeyRound,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Lock,
  LogOut,
  RefreshCw,
  Building,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { useAuth, MfaEnrollmentResult } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { Restaurant } from '../../types';
import { copyToClipboard } from '../../utils/clipboard';

export const SettingsPage: React.FC = () => {
  const {
    user,
    activeRestaurant,
    refreshState,
    mfaFactors,
    mfaAssuranceLevel,
    enrollMfa,
    verifyMfaEnrollment,
    unenrollMfa,
    loadMfaStatus,
    updatePassword,
    logout
  } = useAuth();
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<'operations' | 'security'>('operations');

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

  // Security Tab States
  const [isEnrollingMfa, setIsEnrollingMfa] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<MfaEnrollmentResult | null>(null);
  const [totpVerifyCode, setTotpVerifyCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState<string | null>(null);
  const [isVerifyingEnrollment, setIsVerifyingEnrollment] = useState(false);
  const [isUnenrolling, setIsUnenrolling] = useState(false);
  const [isCopiedSecret, setIsCopiedSecret] = useState(false);

  // Password Change States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  useEffect(() => {
    if (activeTab === 'security') {
      loadMfaStatus();
    }
  }, [activeTab, loadMfaStatus]);

  if (!restaurant || !activeRestaurant) {
    return (
      <DashboardLayout>
        <Card className="p-8 text-center space-y-4 max-w-xl mx-auto my-12 border-border-subtle dark:border-[#233831]">
          <div className="w-12 h-12 rounded-2xl bg-forest/10 dark:bg-gold/15 text-forest dark:text-gold flex items-center justify-center mx-auto">
            <Settings className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-forest dark:text-[#F0F4F2]">
            {isEn ? 'No active establishment' : 'Aucun établissement actif'}
          </h2>
          <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
            {isEn
              ? 'Please select or create your establishment to configure settings.'
              : 'Veuillez sélectionner ou créer votre établissement pour modifier ses paramètres.'}
          </p>
        </Card>
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

  const handleStartMfaEnrollment = async () => {
    setMfaError(null);
    setMfaSuccess(null);
    setIsEnrollingMfa(true);
    try {
      const data = await enrollMfa();
      setEnrollmentData(data);
    } catch (err: any) {
      setMfaError(err.message || 'Impossible d’initialiser l’enrôlement 2FA.');
      setIsEnrollingMfa(false);
    }
  };

  const handleConfirmMfaEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentData || totpVerifyCode.trim().length !== 6) {
      setMfaError('Veuillez saisir le code à 6 chiffres généré par votre application.');
      return;
    }

    setIsVerifyingEnrollment(true);
    setMfaError(null);
    try {
      await verifyMfaEnrollment(enrollmentData.id, totpVerifyCode.trim());
      setMfaSuccess('Authentification à deux facteurs (2FA) activée avec succès !');
      setIsEnrollingMfa(false);
      setEnrollmentData(null);
      setTotpVerifyCode('');
    } catch (err: any) {
      setMfaError(err.message || 'Code à 6 chiffres incorrect ou expiré. Veuillez vérifier votre saisie.');
    } finally {
      setIsVerifyingEnrollment(false);
    }
  };

  const handleUnenrollMfa = async (factorId: string) => {
    if (!confirm('Voulez-vous vraiment désactiver l’authentification à deux facteurs pour votre compte ?')) {
      return;
    }

    setIsUnenrolling(true);
    setMfaError(null);
    try {
      await unenrollMfa(factorId);
      setMfaSuccess('L’authentification à deux facteurs a été désactivée.');
    } catch (err: any) {
      setMfaError(err.message || 'Échec de la désactivation du 2FA.');
    } finally {
      setIsUnenrolling(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      const res = await updatePassword(newPassword);
      if (res.success) {
        setPasswordSuccess('Votre mot de passe a été mis à jour avec succès.');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.error || 'Échec de mise à jour du mot de passe.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Échec de mise à jour du mot de passe.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCopySecret = async (secret: string) => {
    const ok = await copyToClipboard(secret);
    if (ok) {
      setIsCopiedSecret(true);
      setTimeout(() => setIsCopiedSecret(false), 2500);
    }
  };

  const hasMfa = mfaFactors.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl pb-16">
        {/* Header & Tabs */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
            {t('settings.pageTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary dark:text-[#97A7A0] mt-1">
            {isEn
              ? 'Manage your establishment parameters, fulfillment preferences, and account security.'
              : 'Gérez les paramètres de votre établissement, modes de service et la sécurité de votre compte.'}
          </p>

          <div className="flex items-center gap-2 mt-5 border-b border-border-subtle dark:border-[#233831]">
            <button
              onClick={() => setActiveTab('operations')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'operations'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-ink-secondary dark:text-[#97A7A0] hover:text-forest dark:hover:text-[#F0F4F2]'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>{isEn ? 'Establishment & Operations' : 'Établissement & Opérations'}</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'security'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-ink-secondary dark:text-[#97A7A0] hover:text-forest dark:hover:text-[#F0F4F2]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isEn ? 'Security & 2FA' : 'Sécurité & Authentification'}</span>
              {hasMfa && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: OPERATIONS */}
        {activeTab === 'operations' && (
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
          </>
        )}

        {/* TAB 2: SECURITY & 2FA */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {mfaSuccess && <Alert type="success">{mfaSuccess}</Alert>}
            {mfaError && <Alert type="error">{mfaError}</Alert>}

            {/* 2FA / MFA Status Card */}
            <Card className="p-6 space-y-4 border border-border-subtle dark:border-[#233831]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    hasMfa ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-forest dark:text-[#F0F4F2] font-display">
                      {isEn ? 'Two-Factor Authentication (2FA)' : 'Authentification à deux facteurs (2FA)'}
                    </h3>
                    <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                      {hasMfa
                        ? (isEn ? 'Protected with an Authenticator Application (TOTP)' : 'Votre compte est sécurisé par une application d’authentification (TOTP).')
                        : (isEn ? 'Add an extra layer of protection using standard authenticator apps.' : 'Ajoutez une couche de sécurité supplémentaire avec Google Authenticator, Authy ou Microsoft Authenticator.')}
                    </p>
                  </div>
                </div>

                <div>
                  {hasMfa ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{isEn ? 'Active (AAL2)' : 'Actif (AAL2)'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{isEn ? 'Not Configured' : 'Non activé'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* MFA Active factors list */}
              {hasMfa && (
                <div className="pt-3 border-t border-border-subtle dark:border-[#233831] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-forest dark:text-[#F0F4F2]">
                    <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold">Application Authenticator (TOTP)</span>
                    <span className="text-[11px] text-ink-secondary dark:text-[#97A7A0]">
                      — Facteur vérifié
                    </span>
                  </div>

                  <button
                    onClick={() => handleUnenrollMfa(mfaFactors[0].id)}
                    disabled={isUnenrolling}
                    className="px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {isUnenrolling ? 'Désactivation...' : 'Désactiver le 2FA'}
                  </button>
                </div>
              )}

              {/* MFA Setup Flow */}
              {!hasMfa && !isEnrollingMfa && (
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleStartMfaEnrollment}
                    leftIcon={<ShieldCheck className="w-4 h-4" />}
                  >
                    {isEn ? 'Enable Two-Factor Authentication' : 'Activer l’authentification à deux facteurs'}
                  </Button>
                </div>
              )}

              {/* Active Enrollment Modal / Step */}
              {isEnrollingMfa && enrollmentData && (
                <div className="pt-4 border-t border-border-subtle dark:border-[#233831] space-y-4">
                  <div className="p-4 rounded-2xl bg-ivory dark:bg-[#0C1814] border border-border-subtle dark:border-[#233831] space-y-4">
                    <h4 className="font-bold text-xs sm:text-sm text-forest dark:text-[#F0F4F2]">
                      1. Scannez ce QR Code avec votre application d'authentification
                    </h4>
                    <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                      Ouvrez Google Authenticator, Microsoft Authenticator, Authy ou 1Password et scannez l'image ci-dessous :
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                      {enrollmentData.qrCode ? (
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-neutral-200 inline-block">
                          <img
                            src={enrollmentData.qrCode}
                            alt="MFA QR Code"
                            className="w-44 h-44 object-contain rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="w-44 h-44 rounded-2xl bg-neutral-100 flex items-center justify-center text-xs text-neutral-500">
                          <QrCode className="w-10 h-10" />
                        </div>
                      )}

                      <div className="space-y-2 flex-1 w-full">
                        <span className="text-[11px] font-bold text-ink-secondary dark:text-[#97A7A0] uppercase tracking-wider block">
                          Clé de configuration manuelle (si vous ne pouvez pas scanner) :
                        </span>
                        <div className="flex items-center gap-2">
                          <code className="px-3 py-2 rounded-xl bg-white dark:bg-[#101E1A] border border-border-subtle dark:border-[#233831] font-mono text-xs text-forest dark:text-gold font-bold select-all flex-1 break-all">
                            {enrollmentData.secret}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopySecret(enrollmentData.secret)}
                            className="p-2 rounded-xl border border-border-subtle dark:border-[#233831] hover:bg-white dark:hover:bg-[#101E1A] text-forest dark:text-gold transition-colors shrink-0"
                            title="Copier la clé secrète"
                          >
                            {isCopiedSecret ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleConfirmMfaEnrollment} className="space-y-3">
                    <h4 className="font-bold text-xs sm:text-sm text-forest dark:text-[#F0F4F2]">
                      2. Saisissez le code à 6 chiffres pour valider l'activation
                    </h4>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="relative flex-1 w-full">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-secondary dark:text-[#97A7A0]">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={totpVerifyCode}
                          onChange={(e) => setTotpVerifyCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-forest dark:text-[#F0F4F2] font-mono font-bold tracking-widest text-center text-base focus:ring-2 focus:ring-brand-orange"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isVerifyingEnrollment}
                        disabled={totpVerifyCode.trim().length !== 6}
                        className="w-full sm:w-auto font-bold"
                      >
                        Vérifier et activer
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="md"
                        onClick={() => {
                          setIsEnrollingMfa(false);
                          setEnrollmentData(null);
                        }}
                        className="w-full sm:w-auto"
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </Card>

            {/* Password Change Card */}
            <Card className="p-6 space-y-4 border border-border-subtle dark:border-[#233831]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest/10 dark:bg-gold/15 text-forest dark:text-gold flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-forest dark:text-[#F0F4F2] font-display">
                    {isEn ? 'Change Password' : 'Changer de mot de passe'}
                  </h3>
                  <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                    {isEn
                      ? 'Ensure your password has at least 6 characters.'
                      : 'Choisissez un mot de passe sécurisé comportant au moins 6 caractères.'}
                  </p>
                </div>
              </div>

              {passwordSuccess && <Alert type="success">{passwordSuccess}</Alert>}
              {passwordError && <Alert type="error">{passwordError}</Alert>}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                      {isEn ? 'New Password' : 'Nouveau mot de passe'} *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                      {isEn ? 'Confirm New Password' : 'Confirmer le nouveau mot de passe'} *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isChangingPassword}
                  >
                    {isEn ? 'Update Password' : 'Mettre à jour le mot de passe'}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Session & Account Overview Card */}
            <Card className="p-6 space-y-4 border border-border-subtle dark:border-[#233831]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest/10 dark:bg-gold/15 text-forest dark:text-gold flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-forest dark:text-[#F0F4F2] font-display">
                    {isEn ? 'Sessions & Logout' : 'Session et Déconnexion'}
                  </h3>
                  <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                    Connecté sous : <strong className="text-forest dark:text-gold">{user?.email}</strong> (Rôle: {user?.role})
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl border border-border-subtle dark:border-[#233831] text-ink-main dark:text-[#F0F4F2] hover:bg-neutral-50 dark:hover:bg-[#152520] transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Se déconnecter de cet appareil</span>
                </button>

                {isSupabaseConfigured && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('Voulez-vous déconnecter toutes les sessions actives sur tous vos appareils ?')) {
                        await supabase.auth.signOut({ scope: 'global' });
                        await logout();
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Déconnecter tous les appareils (Global Sign-out)</span>
                  </button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
