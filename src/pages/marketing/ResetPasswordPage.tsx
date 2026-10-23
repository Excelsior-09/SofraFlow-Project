import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Check, X } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeSwitcher } from '../../components/common/ThemeSwitcher';
import { SEO } from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invalidSession, setInvalidSession] = useState(false);

  const { updatePassword } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const navigate = useNavigate();

  // Validate recovery session on mount
  useEffect(() => {
    async function checkRecoverySession() {
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        const hasRecoveryHash =
          window.location.hash.includes('type=recovery') ||
          window.location.hash.includes('access_token=') ||
          window.location.search.includes('code=');

        if (!session && !hasRecoveryHash) {
          setInvalidSession(true);
          setError(
            isEn
              ? 'Your password reset link is invalid or has expired. Please request a new recovery link.'
              : 'Votre lien de réinitialisation est invalide ou a expiré. Veuillez faire une nouvelle demande.'
          );
        }
      }
    }
    checkRecoverySession();
  }, [isEn]);

  // Live password requirements
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasMinLength) {
      setError(
        isEn
          ? 'Password must be at least 8 characters long.'
          : 'Le mot de passe doit comporter au moins 8 caractères.'
      );
      return;
    }

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setError(
        isEn
          ? 'Password does not meet the security requirements.'
          : 'Le mot de passe ne respecte pas les critères de sécurité requis.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        isEn
          ? 'Passwords do not match. Please re-enter.'
          : 'Les mots de passe ne correspondent pas.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await updatePassword(newPassword, confirmPassword);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        setError(res.error || (isEn ? 'Failed to update password.' : 'Échec de la mise à jour du mot de passe.'));
      }
    } catch (err: any) {
      setError(err.message || (isEn ? 'An unexpected error occurred.' : 'Une erreur inattendue est survenue.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden transition-colors duration-200">
      <SEO
        title={
          isEn
            ? 'Set New Password | SOFRAFLOW'
            : 'Nouveau Mot de Passe | SOFRAFLOW'
        }
        description={
          isEn
            ? 'Set a new secure password for your SofraFlow account.'
            : 'Définissez un nouveau mot de passe sécurisé pour votre compte SofraFlow.'
        }
        noindex={true}
      />

      {/* Top Bar with Logo, ThemeSwitcher & LanguageSelector */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <Link to="/">
          <Logo showTagline={false} size="sm" />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeSwitcher compact />
          <LanguageSelector variant="compact" />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mt-12 sm:mt-0">
        <h1 className="text-3xl font-black text-[var(--text-primary)] font-display tracking-tight">
          {isEn ? 'Create new password' : 'Créer un nouveau mot de passe'}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
          {isEn
            ? 'Enter your new secure password below to regain access to your workspace.'
            : 'Saisissez votre nouveau mot de passe pour sécuriser votre espace.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--bg-card)] py-8 px-6 sm:px-10 rounded-3xl border border-[var(--border-subtle)] shadow-xl space-y-6">
          
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {isEn ? 'Password updated successfully!' : 'Mot de passe mis à jour avec succès !'}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {isEn ? 'Redirecting to login...' : 'Redirection vers la page de connexion...'}
              </p>
            </div>
          ) : invalidSession ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm mb-1">
                    {isEn ? 'Recovery Link Invalid or Expired' : 'Lien de récupération invalide ou expiré'}
                  </p>
                  <p>
                    {isEn
                      ? 'This password reset link is invalid or has expired for your security. Please request a new link.'
                      : 'Ce lien de réinitialisation est invalide ou a expiré pour des raisons de sécurité. Veuillez demander un nouveau lien.'}
                  </p>
                </div>
              </div>
              <Link
                to="/forgot-password"
                className="w-full py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-orange/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{isEn ? 'Request New Reset Link' : 'Demander un nouveau lien'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    {isEn ? 'New Password' : 'Nouveau Mot de Passe'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all placeholder:text-[var(--text-muted)]"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    {isEn ? 'Confirm New Password' : 'Confirmer le Nouveau Mot de Passe'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all placeholder:text-[var(--text-muted)]"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements Checklist */}
                <div className="p-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[11px] space-y-1.5">
                  <p className="font-semibold text-[var(--text-primary)] mb-1">
                    {isEn ? 'Password requirements:' : 'Exigences du mot de passe :'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[var(--text-muted)]'}`}>
                      {hasMinLength ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                      <span>{isEn ? 'At least 8 characters' : 'Au moins 8 caractères'}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[var(--text-muted)]'}`}>
                      {hasUppercase ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                      <span>{isEn ? 'One uppercase letter' : 'Une lettre majuscule'}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[var(--text-muted)]'}`}>
                      {hasLowercase ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                      <span>{isEn ? 'One lowercase letter' : 'Une lettre minuscule'}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[var(--text-muted)]'}`}>
                      {hasNumber ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                      <span>{isEn ? 'One number' : 'Un chiffre'}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[var(--text-muted)]'}`}>
                      {hasSpecial ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                      <span>{isEn ? 'One special character' : 'Un caractère spécial'}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[var(--text-muted)]'}`}>
                      {passwordsMatch ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                      <span>{isEn ? 'Passwords match' : 'Mots de passe identiques'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-orange/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <span>{isEn ? 'Updating password...' : 'Mise à jour...'}</span>
                  ) : (
                    <>
                      <span>{isEn ? 'Save New Password' : 'Enregistrer le nouveau mot de passe'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="pt-2 text-center border-t border-[var(--border-subtle)]">
            <Link to="/login" className="text-xs font-bold text-brand-orange hover:underline">
              {isEn ? 'Back to sign in' : 'Retour à la connexion'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
