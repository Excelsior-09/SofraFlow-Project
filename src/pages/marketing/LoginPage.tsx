import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, KeyRound, ArrowLeft } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { BackToHomeButton } from '../../components/common/BackToHomeButton';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeSwitcher } from '../../components/common/ThemeSwitcher';
import { SEO } from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2-Step MFA state on login page
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [mfaCode, setMfaCode] = useState('');

  const { login, verifyMfaChallenge, mfaRequired, logout } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const navigate = useNavigate();
  const location = useLocation();

  // If MFA is required in AuthContext (e.g. page refresh during challenge), enter MFA step
  useEffect(() => {
    if (mfaRequired) {
      setStep('mfa');
    }
  }, [mfaRequired]);

  const handleCancelMfa = async () => {
    try {
      await logout();
    } catch {}
    setStep('credentials');
    setMfaCode('');
    setError(null);
  };

  // Validate and sanitize return destination to prevent open redirects (OWASP A01 / A05)
  const rawFrom = (location.state as any)?.from?.pathname;
  const from = (typeof rawFrom === 'string' && rawFrom.startsWith('/app') && !rawFrom.includes('//'))
    ? rawFrom
    : '/app/overview';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(
        isEn
          ? 'Please enter your email and password.'
          : 'Veuillez renseigner votre adresse e-mail et votre mot de passe.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await login(email, password, rememberMe);
      if (result.mfaRequired) {
        setStep('mfa');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error('[LoginPage] Sign in failed:', err);
      let msg = err.message || '';
      if (msg.includes('Invalid login credentials')) {
        msg = isEn
          ? 'Invalid email or password. Please check your credentials.'
          : 'Adresse e-mail ou mot de passe incorrect.';
      } else if (msg.includes('Email not confirmed')) {
        msg = isEn
          ? 'Please verify your email address before signing in.'
          : 'Veuillez confirmer votre e-mail avant de vous connecter.';
      }
      setError(
        msg ||
          (isEn
            ? 'Login failed. Please verify your credentials.'
            : 'Échec de connexion. Vérifiez vos identifiants.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.trim().length !== 6) {
      setError(
        isEn
          ? 'Please enter a valid 6-digit authentication code.'
          : 'Veuillez saisir le code de sécurité à 6 chiffres.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await verifyMfaChallenge(mfaCode.trim());
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('[LoginPage] MFA challenge failed:', err);
      setError(
        err.message ||
          (isEn
            ? 'Invalid or expired authentication code. Please try again.'
            : 'Code d’authentification incorrect ou expiré.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden transition-colors duration-200">
      <SEO
        title={
          isEn
            ? 'Sign In | SOFRAFLOW Merchant Workspace'
            : 'Connexion Espace Gérant | SOFRAFLOW'
        }
        description={
          isEn
            ? 'Sign in to your SOFRAFLOW workspace to manage digital menus, orders, and AI assistants.'
            : 'Connectez-vous à votre espace SOFRAFLOW pour gérer vos cartes QR, commandes et assistants IA.'
        }
        noindex={true}
      />

      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 rounded-full bg-brand-navy/10 blur-3xl pointer-events-none" />

      {/* Top Bar with Back to Home, Logo, ThemeSwitcher & LanguageSelector */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 sm:gap-4">
          <BackToHomeButton compactOnMobile />
          <Logo showTagline={false} size="sm" linkTo="/" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeSwitcher compact />
          <LanguageSelector variant="compact" />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mt-12 sm:mt-0">
        <h1 className="text-3xl font-black text-[var(--text-primary)] font-display tracking-tight">
          {step === 'mfa'
            ? (isEn ? 'Two-Factor Verification' : 'Vérification en 2 étapes')
            : (isEn ? 'Sign in to SOFRAFLOW' : 'Connexion à votre espace')}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
          {step === 'mfa'
            ? (isEn
                ? 'Enter the 6-digit code from your authenticator app.'
                : 'Saisissez le code à 6 chiffres de votre application d’authentification.')
            : (isEn
                ? 'Access your restaurant menus, table QR stands, and sales analytics.'
                : 'Accédez à vos cartes digitales, QR codes de table et analyses des ventes.')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--bg-card)] py-8 px-6 sm:px-10 rounded-3xl border border-[var(--border-subtle)] shadow-xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {step === 'credentials' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  {isEn ? 'Business Email' : 'Adresse E-mail'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@votre-restaurant.ma"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all placeholder:text-[var(--text-muted)]"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[var(--text-primary)]">
                    {isEn ? 'Password' : 'Mot de Passe'}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-brand-orange hover:underline font-medium"
                  >
                    {isEn ? 'Forgot password?' : 'Mot de passe oublié ?'}
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all placeholder:text-[var(--text-muted)]"
                    required
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

              {/* Remember me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[var(--border-subtle)] text-brand-orange focus:ring-brand-orange"
                  />
                  <span className="text-xs text-[var(--text-secondary)]">
                    {isEn ? 'Remember me on this device' : 'Se souvenir de moi sur cet appareil'}
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-orange/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span>{isEn ? 'Authenticating...' : 'Connexion en cours...'}</span>
                ) : (
                  <>
                    <span>{isEn ? 'Sign In to Workspace' : 'Se Connecter'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* 2FA/MFA Step */
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1 text-center">
                  {isEn ? '6-digit Authenticator Code' : 'Code à 6 chiffres'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-center tracking-widest text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || mfaCode.trim().length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-orange/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>{isEn ? 'Verifying code...' : 'Vérification du code...'}</span>
                ) : (
                  <>
                    <span>{isEn ? 'Verify & Continue' : 'Valider et Continuer'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelMfa}
                className="w-full py-2 text-xs text-[var(--text-secondary)] hover:text-brand-orange flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isEn ? 'Back to password' : 'Retour au mot de passe'}</span>
              </button>
            </form>
          )}

          {/* Link to Signup */}
          <p className="text-center text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border-subtle)]">
            {isEn ? 'New to SofraFlow? ' : 'Nouveau sur SofraFlow ? '}
            <Link to="/signup" className="font-bold text-brand-orange hover:underline">
              {isEn ? 'Create your free account' : 'Créer un compte gratuit'}
            </Link>
          </p>

          {/* Secondary Back to Home Link */}
          <div className="pt-1 text-center">
            <BackToHomeButton variant="link" />
          </div>
        </div>
      </div>
    </div>
  );
};
