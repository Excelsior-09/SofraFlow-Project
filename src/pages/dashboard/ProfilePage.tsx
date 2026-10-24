import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Check,
  X,
  Calendar,
  BadgeCheck,
  QrCode,
  Smartphone,
  Copy
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { useAuth, MfaEnrollmentResult } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { validateFullName, isValidPhoneNumber } from '../../utils/phoneValidation';
import { copyToClipboard } from '../../utils/clipboard';

export const ProfilePage: React.FC = () => {
  const {
    user,
    updateUserProfile,
    changePasswordWithVerification,
    reloadProfile,
    isLoading: authLoading,
    mfaFactors,
    mfaAssuranceLevel,
    enrollMfa,
    verifyMfaEnrollment,
    unenrollMfa,
    loadMfaStatus
  } = useAuth();
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  // Personal Info Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Two-Factor Authentication (2FA / TOTP) State
  const [isEnrollingMfa, setIsEnrollingMfa] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<MfaEnrollmentResult | null>(null);
  const [totpVerifyCode, setTotpVerifyCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState<string | null>(null);
  const [isVerifyingEnrollment, setIsVerifyingEnrollment] = useState(false);
  const [isUnenrolling, setIsUnenrolling] = useState(false);
  const [isCopiedSecret, setIsCopiedSecret] = useState(false);

  // Profile refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync state whenever user changes in AuthContext
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhoneNumber(user.phone || '');
    }
  }, [user]);

  // Load MFA status on mount
  useEffect(() => {
    loadMfaStatus();
  }, [loadMfaStatus]);

  // Live password validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Password strength score (0 to 5)
  const strengthScore = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial
  ].filter(Boolean).length;

  const getStrengthMeta = () => {
    if (newPassword.length === 0) return { label: '', color: 'bg-border-subtle dark:bg-[#233831]', width: 'w-0' };
    if (strengthScore <= 2) return { label: isEn ? 'Weak' : 'Faible', color: 'bg-status-error', width: 'w-1/4' };
    if (strengthScore === 3) return { label: isEn ? 'Moderate' : 'Moyen', color: 'bg-amber-500', width: 'w-2/4' };
    if (strengthScore === 4) return { label: isEn ? 'Good' : 'Bon', color: 'bg-emerald-500', width: 'w-3/4' };
    return { label: isEn ? 'Strong' : 'Robuste', color: 'bg-emerald-600', width: 'w-full' };
  };

  const strengthMeta = getStrengthMeta();

  // MFA Handlers
  const handleStartMfaEnrollment = async () => {
    setMfaError(null);
    setMfaSuccess(null);
    setIsEnrollingMfa(true);
    try {
      const res = await enrollMfa();
      setEnrollmentData(res);
      setTotpVerifyCode('');
    } catch (err: any) {
      console.error('[ProfilePage] MFA enrollment failed:', err);
      setMfaError(err.message || 'Impossible d’initier la configuration 2FA.');
      setIsEnrollingMfa(false);
    }
  };

  const handleConfirmMfaEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentData || totpVerifyCode.trim().length !== 6) return;

    setIsVerifyingEnrollment(true);
    setMfaError(null);
    try {
      await verifyMfaEnrollment(enrollmentData.id, totpVerifyCode.trim());
      setMfaSuccess(isEn ? 'Two-factor authentication (2FA) successfully activated!' : 'Authentification à deux facteurs (2FA) activée avec succès !');
      setIsEnrollingMfa(false);
      setEnrollmentData(null);
      setTotpVerifyCode('');
    } catch (err: any) {
      setMfaError(err.message || (isEn ? 'Invalid or expired 6-digit code. Please verify and try again.' : 'Code à 6 chiffres incorrect ou expiré. Veuillez vérifier votre saisie.'));
    } finally {
      setIsVerifyingEnrollment(false);
    }
  };

  const handleUnenrollMfa = async (factorId: string) => {
    if (!confirm(isEn ? 'Are you sure you want to disable two-factor authentication for your account?' : 'Voulez-vous vraiment désactiver l’authentification à deux facteurs pour votre compte ?')) {
      return;
    }

    setIsUnenrolling(true);
    setMfaError(null);
    try {
      await unenrollMfa(factorId);
      setMfaSuccess(isEn ? 'Two-factor authentication has been disabled.' : 'L’authentification à deux facteurs a été désactivée.');
    } catch (err: any) {
      setMfaError(err.message || (isEn ? 'Failed to disable 2FA.' : 'Échec de la désactivation du 2FA.'));
    } finally {
      setIsUnenrolling(false);
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

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    const nameVal = validateFullName(fullName);
    if (!nameVal.isValid) {
      setProfileError(t('profile.errors.nameInvalid'));
      return;
    }

    if (phoneNumber && phoneNumber.trim() && !isValidPhoneNumber(phoneNumber)) {
      setProfileError(t('profile.errors.phoneInvalid'));
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await updateUserProfile({
        fullName: fullName.trim(),
        phone: phoneNumber.trim() || undefined
      });

      if (!res.success) {
        setProfileError(res.error || t('profile.errors.updateFailed'));
        return;
      }

      if (res.noChanges) {
        setProfileSuccess(t('profile.errors.noChangesDetected'));
      } else {
        setProfileSuccess(t('profile.profileUpdated'));
      }
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      console.error('[ProfilePage] Error updating profile:', err);
      setProfileError(err?.message || t('profile.errors.updateFailed'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Update with Verification
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError(t('profile.errors.currentPasswordRequired'));
      return;
    }

    if (!hasMinLength) {
      setPasswordError(t('profile.errors.passwordLength'));
      return;
    }

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setPasswordError(t('profile.errors.passwordRequirements'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('profile.errors.passwordMismatch'));
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError(t('profile.errors.sameAsCurrent'));
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await changePasswordWithVerification(currentPassword, newPassword);
      if (!res.success) {
        const msg = res.error || '';
        if (
          msg.includes('incorrect') ||
          msg.includes('credentials') ||
          msg.includes('invalid') ||
          msg.includes('Invalid login')
        ) {
          setPasswordError(t('profile.errors.incorrectCurrentPassword'));
        } else {
          setPasswordError(msg || t('profile.errors.updateFailed'));
        }
        return;
      }

      setPasswordSuccess(t('profile.passwordUpdated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err: any) {
      console.error('[ProfilePage] Error changing password:', err);
      setPasswordError(err?.message || t('profile.errors.updateFailed'));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle Manual Reload
  const handleReload = async () => {
    setIsRefreshing(true);
    setProfileError(null);
    try {
      await reloadProfile();
    } catch (err: any) {
      setProfileError(t('profile.errors.loadProfileFailed'));
    } finally {
      setIsRefreshing(false);
    }
  };

  const userInitials = (user?.fullName || user?.email || 'U')
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border-subtle dark:border-[#233831]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main dark:text-[#F0F4F2] font-display flex items-center gap-2.5">
              <UserIcon className="w-7 h-7 text-forest dark:text-gold" />
              <span>{t('profile.pageTitle')}</span>
            </h1>
            <p className="text-sm text-ink-secondary dark:text-[#97A7A0] mt-1">
              {t('profile.pageSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReload}
              disabled={isRefreshing || authLoading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            >
              {isEn ? 'Refresh' : 'Actualiser'}
            </Button>
          </div>
        </div>

        {/* Global Loading Spinner if initial load */}
        {authLoading && (
          <div className="p-8 text-center bg-white dark:bg-[#14241F] rounded-2xl border border-border-subtle dark:border-[#233831]">
            <RefreshCw className="w-8 h-8 mx-auto text-forest dark:text-gold animate-spin mb-3" />
            <p className="text-sm text-ink-secondary dark:text-[#97A7A0]">
              {isEn ? 'Loading your profile...' : 'Chargement de votre profil...'}
            </p>
          </div>
        )}

        {/* Main Grid: Left Column (Identity & Security Meta), Right Column (Forms) */}
        {!authLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: 4 Cols */}
            <div className="lg:col-span-4 space-y-6">
              {/* Profile Card */}
              <Card className="text-center p-6 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-forest via-gold to-forest dark:from-gold dark:via-emerald-400 dark:to-gold" />
                
                {/* Avatar Badge */}
                <div className="relative mx-auto w-24 h-24 rounded-full p-1 bg-gradient-to-br from-forest to-gold dark:from-gold dark:to-emerald-500 shadow-md flex items-center justify-center mb-4">
                  <div className="w-full h-full rounded-full bg-white dark:bg-[#101E1A] flex items-center justify-center text-forest dark:text-gold font-display font-black text-2xl tracking-wider">
                    {userInitials}
                  </div>
                  <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-status-success text-white ring-4 ring-white dark:ring-[#14241F]" title="Compte Actif">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                </div>

                <h2 className="text-lg font-bold text-ink-main dark:text-[#F0F4F2] truncate">
                  {user?.fullName || (isEn ? 'Authenticated User' : 'Utilisateur Authentifié')}
                </h2>
                <p className="text-xs text-ink-secondary dark:text-[#97A7A0] mt-0.5 truncate">
                  {user?.email}
                </p>

                <div className="mt-4 pt-4 border-t border-border-subtle dark:border-[#233831] space-y-2.5 text-left text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-secondary dark:text-[#97A7A0] flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-forest dark:text-gold" />
                      {t('profile.role')}
                    </span>
                    <span className="font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full bg-forest/10 dark:bg-gold/15 text-forest dark:text-gold">
                      {user?.role || 'owner'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-ink-secondary dark:text-[#97A7A0] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-forest dark:text-gold" />
                      {t('profile.phone')}
                    </span>
                    <span className="font-medium text-ink-main dark:text-[#F0F4F2]">
                      {user?.phone || (isEn ? 'Not provided' : 'Non renseigné')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-ink-secondary dark:text-[#97A7A0] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-forest dark:text-gold" />
                      {isEn ? 'Two-Factor (2FA)' : 'Sécurité 2FA'}
                    </span>
                    <span className={`font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full ${
                      hasMfa
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    }`}>
                      {hasMfa ? (isEn ? 'Active' : 'Actif') : (isEn ? 'Not Set' : 'Non activé')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-ink-secondary dark:text-[#97A7A0] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-forest dark:text-gold" />
                      {t('profile.memberSince')}
                    </span>
                    <span className="font-medium text-ink-main dark:text-[#F0F4F2]">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', { month: 'short', year: 'numeric' }) : '2026'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: 8 Cols (Personal Information & Password Verification) */}
            <div className="lg:col-span-8 space-y-6">
              {/* SECTION 1: Personal Information */}
              <Card className="p-6">
                <div className="pb-4 mb-5 border-b border-border-subtle dark:border-[#233831]">
                  <h3 className="text-base font-bold text-ink-main dark:text-[#F0F4F2] flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-forest dark:text-gold" />
                    <span>{t('profile.personalInfoTitle')}</span>
                  </h3>
                  <p className="text-xs text-ink-secondary dark:text-[#97A7A0] mt-0.5">
                    {t('profile.personalInfoSubtitle')}
                  </p>
                </div>

                {profileSuccess && (
                  <Alert type="success" className="mb-4">
                    {profileSuccess}
                  </Alert>
                )}

                {profileError && (
                  <Alert type="error" className="mb-4">
                    {profileError}
                  </Alert>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="profile-full-name" className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1.5">
                      {t('profile.fullName')} <span className="text-status-error">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-secondary dark:text-[#97A7A0]">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        id="profile-full-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('profile.fullNamePlaceholder')}
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-ivory dark:bg-[#101E1A] border border-border-subtle dark:border-[#233831] text-xs text-ink-main dark:text-[#F0F4F2] focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="profile-phone" className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1.5">
                      {t('profile.phone')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-secondary dark:text-[#97A7A0]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="profile-phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={t('profile.phonePlaceholder')}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-ivory dark:bg-[#101E1A] border border-border-subtle dark:border-[#233831] text-xs text-ink-main dark:text-[#F0F4F2] focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                      />
                    </div>
                  </div>

                  {/* Email (Strictly Read-Only) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="profile-email-readonly" className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2]">
                        {t('profile.email')}
                      </label>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink-secondary dark:text-[#97A7A0] bg-ivory-dark dark:bg-[#1B2F29] px-2 py-0.5 rounded-md">
                        <Lock className="w-2.5 h-2.5" />
                        {isEn ? 'Read-only' : 'Lecture seule'}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-secondary dark:text-[#97A7A0]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="profile-email-readonly"
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        disabled
                        aria-readonly="true"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-ivory-dark/70 dark:bg-[#0B1512] border border-border-subtle dark:border-[#233831] text-xs text-ink-secondary dark:text-[#97A7A0] cursor-not-allowed select-none font-medium opacity-80"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-ink-secondary dark:text-[#97A7A0]">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0] mt-1.5 flex items-center gap-1">
                      <Lock className="w-3 h-3 flex-shrink-0 text-gold" />
                      <span>{t('profile.emailReadOnlyHint')}</span>
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSavingProfile}
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      {isSavingProfile ? t('profile.savingProfile') : t('profile.saveProfileBtn')}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* SECTION 2: Change Password with Secure Verification */}
              <Card className="p-6">
                <div className="pb-4 mb-5 border-b border-border-subtle dark:border-[#233831]">
                  <h3 className="text-base font-bold text-ink-main dark:text-[#F0F4F2] flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-forest dark:text-gold" />
                    <span>{t('profile.changePasswordTitle')}</span>
                  </h3>
                  <p className="text-xs text-ink-secondary dark:text-[#97A7A0] mt-0.5">
                    {t('profile.changePasswordSubtitle')}
                  </p>
                </div>

                {passwordSuccess && (
                  <Alert type="success" className="mb-4">
                    {passwordSuccess}
                  </Alert>
                )}

                {passwordError && (
                  <Alert type="error" className="mb-4">
                    {passwordError}
                  </Alert>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label htmlFor="current-password" className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1.5">
                      {t('profile.currentPassword')} <span className="text-status-error">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-secondary dark:text-[#97A7A0]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={t('profile.currentPasswordPlaceholder')}
                        required
                        autoComplete="current-password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-ivory dark:bg-[#101E1A] border border-border-subtle dark:border-[#233831] text-xs text-ink-main dark:text-[#F0F4F2] focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-secondary dark:text-[#97A7A0] hover:text-ink-main dark:hover:text-[#F0F4F2]"
                        title={showCurrentPassword ? (isEn ? "Hide password" : "Masquer") : (isEn ? "Show password" : "Afficher")}
                        aria-label={showCurrentPassword ? (isEn ? "Hide password" : "Masquer") : (isEn ? "Show password" : "Afficher")}
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="new-password" className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1.5">
                      {t('profile.newPassword')} <span className="text-status-error">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-secondary dark:text-[#97A7A0]">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t('profile.newPasswordPlaceholder')}
                        required
                        autoComplete="new-password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-ivory dark:bg-[#101E1A] border border-border-subtle dark:border-[#233831] text-xs text-ink-main dark:text-[#F0F4F2] focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-secondary dark:text-[#97A7A0] hover:text-ink-main dark:hover:text-[#F0F4F2]"
                        title={showNewPassword ? (isEn ? "Hide password" : "Masquer") : (isEn ? "Show password" : "Afficher")}
                        aria-label={showNewPassword ? (isEn ? "Hide password" : "Masquer") : (isEn ? "Show password" : "Afficher")}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Meter Bar */}
                    {newPassword.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-ink-secondary dark:text-[#97A7A0]">
                          <span>{isEn ? 'Password Strength:' : 'Niveau de sécurité :'}</span>
                          <span className="font-bold">{strengthMeta.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-ivory-dark dark:bg-[#1B2F29] rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 ${strengthMeta.width} ${strengthMeta.color}`} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label htmlFor="confirm-password" className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1.5">
                      {t('profile.confirmPassword')} <span className="text-status-error">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-secondary dark:text-[#97A7A0]">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('profile.confirmPasswordPlaceholder')}
                        required
                        autoComplete="new-password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-ivory dark:bg-[#101E1A] border border-border-subtle dark:border-[#233831] text-xs text-ink-main dark:text-[#F0F4F2] focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-secondary dark:text-[#97A7A0] hover:text-ink-main dark:hover:text-[#F0F4F2]"
                        title={showConfirmPassword ? (isEn ? "Hide password" : "Masquer") : (isEn ? "Show password" : "Afficher")}
                        aria-label={showConfirmPassword ? (isEn ? "Hide password" : "Masquer") : (isEn ? "Show password" : "Afficher")}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Interactive Checklist Requirements */}
                  <div className="p-3.5 rounded-xl bg-ivory dark:bg-[#101E1A] border border-border-subtle dark:border-[#233831] text-[11px] space-y-1.5">
                    <p className="font-semibold text-ink-main dark:text-[#F0F4F2] mb-2">
                      {t('profile.strengthTitle')}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-status-success dark:text-[#4ADE80] font-medium' : 'text-ink-secondary dark:text-[#97A7A0]'}`}>
                        {hasMinLength ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <X className="w-3.5 h-3.5 flex-shrink-0" />}
                        <span>{t('profile.minChars')}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-status-success dark:text-[#4ADE80] font-medium' : 'text-ink-secondary dark:text-[#97A7A0]'}`}>
                        {hasUppercase ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <X className="w-3.5 h-3.5 flex-shrink-0" />}
                        <span>{t('profile.uppercase')}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-status-success dark:text-[#4ADE80] font-medium' : 'text-ink-secondary dark:text-[#97A7A0]'}`}>
                        {hasLowercase ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <X className="w-3.5 h-3.5 flex-shrink-0" />}
                        <span>{t('profile.lowercase')}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-status-success dark:text-[#4ADE80] font-medium' : 'text-ink-secondary dark:text-[#97A7A0]'}`}>
                        {hasNumber ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <X className="w-3.5 h-3.5 flex-shrink-0" />}
                        <span>{t('profile.number')}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-status-success dark:text-[#4ADE80] font-medium' : 'text-ink-secondary dark:text-[#97A7A0]'}`}>
                        {hasSpecial ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <X className="w-3.5 h-3.5 flex-shrink-0" />}
                        <span>{t('profile.specialChar')}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-status-success dark:text-[#4ADE80] font-medium' : 'text-ink-secondary dark:text-[#97A7A0]'}`}>
                        {passwordsMatch ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <X className="w-3.5 h-3.5 flex-shrink-0" />}
                        <span>{t('profile.passwordsMatch')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isUpdatingPassword}
                      disabled={!currentPassword || !hasMinLength || !passwordsMatch}
                      leftIcon={<KeyRound className="w-4 h-4" />}
                    >
                      {isUpdatingPassword ? t('profile.updatingPassword') : t('profile.updatePasswordBtn')}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* SECTION 3: Two-Factor Authentication (2FA / TOTP) */}
              <Card className="p-6 space-y-4 border border-border-subtle dark:border-[#233831]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle dark:border-[#233831]">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      hasMfa
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-forest dark:text-[#F0F4F2] font-display flex items-center gap-2">
                        <span>{isEn ? 'Two-Factor Authentication (2FA)' : 'Authentification à Deux Facteurs (2FA)'}</span>
                      </h3>
                      <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                        {isEn
                          ? 'Protect your personal login account with standard time-based one-time password (TOTP) apps.'
                          : 'Protégez votre compte personnel avec une application d’authentification standard (TOTP).'}
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

                {mfaSuccess && (
                  <Alert type="success" className="mb-2">
                    {mfaSuccess}
                  </Alert>
                )}

                {mfaError && (
                  <Alert type="error" className="mb-2">
                    {mfaError}
                  </Alert>
                )}

                {/* Explanation text */}
                <p className="text-xs text-ink-secondary dark:text-[#97A7A0] leading-relaxed">
                  {isEn
                    ? 'When 2FA is active, signing in requires your password and a 6-digit verification code generated by Google Authenticator, Microsoft Authenticator, Authy, or 1Password.'
                    : 'Lorsque le 2FA est activé, toute nouvelle connexion nécessitera votre mot de passe et un code de sécurité à 6 chiffres généré par Google Authenticator, Microsoft Authenticator, Authy ou 1Password.'}
                </p>

                {/* MFA Active factors list */}
                {hasMfa && (
                  <div className="pt-3 border-t border-border-subtle dark:border-[#233831] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-xs text-forest dark:text-[#F0F4F2]">
                      <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold">Application Authenticator (TOTP)</span>
                      <span className="text-[11px] text-ink-secondary dark:text-[#97A7A0]">
                        — {isEn ? 'Verified Factor' : 'Facteur vérifié'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUnenrollMfa(mfaFactors[0].id)}
                      disabled={isUnenrolling}
                      className="px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {isUnenrolling ? (isEn ? 'Disabling...' : 'Désactivation...') : (isEn ? 'Disable 2FA' : 'Désactiver le 2FA')}
                    </button>
                  </div>
                )}

                {/* MFA Setup Initiation Button */}
                {!hasMfa && !isEnrollingMfa && (
                  <div className="pt-2 flex justify-end">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleStartMfaEnrollment}
                      leftIcon={<ShieldCheck className="w-4 h-4" />}
                    >
                      {isEn ? 'Enable Two-Factor Authentication' : 'Activer l’authentification à deux facteurs'}
                    </Button>
                  </div>
                )}

                {/* Active Enrollment Modal / Inline Box */}
                {isEnrollingMfa && enrollmentData && (
                  <div className="pt-4 border-t border-border-subtle dark:border-[#233831] space-y-4">
                    <div className="p-4 rounded-2xl bg-ivory dark:bg-[#0C1814] border border-border-subtle dark:border-[#233831] space-y-4">
                      <h4 className="font-bold text-xs sm:text-sm text-forest dark:text-[#F0F4F2]">
                        {isEn
                          ? '1. Scan this QR code with your authenticator app'
                          : '1. Scannez ce QR Code avec votre application d’authentification'}
                      </h4>
                      <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                        {isEn
                          ? 'Open Google Authenticator, Microsoft Authenticator, Authy, or 1Password and scan the image below:'
                          : 'Ouvrez Google Authenticator, Microsoft Authenticator, Authy ou 1Password et scannez l’image ci-dessous :'}
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
                            {isEn
                              ? 'Manual Configuration Key (if unable to scan):'
                              : 'Clé de configuration manuelle (si vous ne pouvez pas scanner) :'}
                          </span>
                          <div className="flex items-center gap-2">
                            <code className="px-3 py-2 rounded-xl bg-white dark:bg-[#101E1A] border border-border-subtle dark:border-[#233831] font-mono text-xs text-forest dark:text-gold font-bold select-all flex-1 break-all">
                              {enrollmentData.secret}
                            </code>
                            <button
                              type="button"
                              onClick={() => handleCopySecret(enrollmentData.secret)}
                              className="p-2 rounded-xl border border-border-subtle dark:border-[#233831] hover:bg-white dark:hover:bg-[#101E1A] text-forest dark:text-gold transition-colors shrink-0"
                              title={isEn ? "Copy secret key" : "Copier la clé secrète"}
                            >
                              {isCopiedSecret ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleConfirmMfaEnrollment} className="space-y-3">
                      <h4 className="font-bold text-xs sm:text-sm text-forest dark:text-[#F0F4F2]">
                        {isEn
                          ? '2. Enter the 6-digit code to complete activation'
                          : '2. Saisissez le code à 6 chiffres pour valider l’activation'}
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
                            autoFocus
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
                          {isEn ? 'Verify & Activate' : 'Vérifier et activer'}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="md"
                          onClick={() => {
                            setIsEnrollingMfa(false);
                            setEnrollmentData(null);
                            setTotpVerifyCode('');
                            setMfaError(null);
                          }}
                          className="w-full sm:w-auto"
                        >
                          {isEn ? 'Cancel' : 'Annuler'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
