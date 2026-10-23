import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { BackToHomeButton } from '../../components/common/BackToHomeButton';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeSwitcher } from '../../components/common/ThemeSwitcher';
import { SEO } from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { analytics } from '../../services/analytics';

export const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSentNotice, setEmailSentNotice] = useState<string | null>(null);

  const { registerWithEmail } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const navigate = useNavigate();

  useEffect(() => {
    analytics.trackPageView('signup', 'marketing');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password) {
      setError(
        isEn
          ? 'Please fill in all required fields.'
          : 'Veuillez remplir tous les champs obligatoires.'
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError(
        isEn
          ? 'Please enter a valid email address.'
          : 'Veuillez renseigner une adresse e-mail valide.'
      );
      return;
    }

    if (password.length < 6) {
      setError(
        isEn
          ? 'Password must be at least 6 characters long.'
          : 'Le mot de passe doit comporter au moins 6 caractères.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        isEn
          ? 'Passwords do not match. Please re-enter.'
          : 'Les mots de passe ne correspondent pas.'
      );
      return;
    }

    if (!acceptTerms) {
      setError(
        isEn
          ? 'Please accept the terms of service to proceed.'
          : 'Veuillez accepter les conditions d’utilisation pour continuer.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await registerWithEmail(email, password, fullName);

      if (result.needsEmailConfirmation) {
        setEmailSentNotice(email.trim());
      } else {
        // Session created immediately -> navigate to Zina onboarding
        try {
          sessionStorage.setItem('sofraflow_temp_user', JSON.stringify({ fullName, email }));
        } catch {
          // ignore
        }
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error('[SignupPage] Registration error:', err);
      let msg = err.message || '';
      if (msg.includes('User already registered') || msg.includes('already exists')) {
        msg = isEn
          ? 'An account with this email already exists. Please sign in instead.'
          : 'Un compte avec cette adresse e-mail existe déjà. Veuillez vous connecter.';
      } else if (msg.includes('Password should be')) {
        msg = isEn
          ? 'Password is too weak. Please include at least 6 characters.'
          : 'Mot de passe trop court ou trop simple. Choisissez au moins 6 caractères.';
      }
      setError(
        msg ||
          (isEn
            ? 'Registration failed. Please check your details and try again.'
            : 'Échec de l’inscription. Veuillez vérifier vos informations.')
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
            ? 'Create Account | 14-Day Free Trial | SOFRAFLOW'
            : 'Créer un Compte | Essai Gratuit 14 Jours | SOFRAFLOW'
        }
        description={
          isEn
            ? 'Join SofraFlow to upgrade your restaurant with smart digital menus and AI assistance.'
            : 'Rejoignez SofraFlow pour moderniser votre restaurant avec des menus intelligents et l’IA.'
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isEn ? '14-Day Free Trial' : '14 Jours d’Essai Gratuit'}</span>
        </div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] font-display tracking-tight">
          {isEn ? 'Create your SofraFlow account' : 'Créer votre compte SofraFlow'}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
          {isEn
            ? 'Get started in 60 seconds. Real cloud persistence & digital menu generation.'
            : 'Démarrez en 60 secondes. Données réelles dans le cloud et menus numériques.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--bg-card)] py-8 px-6 sm:px-10 rounded-3xl border border-[var(--border-subtle)] shadow-xl space-y-6">
          
          {emailSentNotice ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] font-display">
                {isEn ? 'Check your email inbox' : 'Vérifiez votre boîte e-mail'}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {isEn
                  ? `We have dispatched a verification email to ${emailSentNotice}. Please click the confirmation link to activate your account.`
                  : `Nous avons envoyé un lien de confirmation à ${emailSentNotice}. Veuillez cliquer sur ce lien pour activer votre compte.`}
              </p>
              <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs sm:text-sm shadow-md transition-all text-center"
                >
                  {isEn ? 'Return to Sign In' : 'Aller à la page de connexion'}
                </Link>
                <div className="pt-1 text-center">
                  <BackToHomeButton variant="link" />
                </div>
              </div>
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
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    {isEn ? 'Your Full Name' : 'Nom et Prénom'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isEn ? 'e.g. Youssef Bennani' : 'ex. Youssef Bennani'}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all placeholder:text-[var(--text-muted)]"
                      required
                    />
                  </div>
                </div>

                {/* Business Email */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    {isEn ? 'Business Email' : 'Adresse E-mail Professionnelle'}
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
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    {isEn ? 'Password' : 'Mot de Passe'}
                  </label>
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    {isEn ? 'Confirm Password' : 'Confirmer le Mot de Passe'}
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
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    {isEn ? 'Minimum 6 characters' : 'Au moins 6 caractères'}
                  </p>
                </div>

                {/* Terms checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 rounded border-[var(--border-subtle)] text-brand-orange focus:ring-brand-orange"
                  />
                  <label htmlFor="terms" className="text-[11px] text-[var(--text-secondary)] leading-tight">
                    {isEn ? (
                      <>
                        I agree to SofraFlow’s{' '}
                        <span className="text-brand-orange underline">Terms of Service</span> and{' '}
                        <span className="text-brand-orange underline">Privacy Policy</span>.
                      </>
                    ) : (
                      <>
                        J’accepte les{' '}
                        <span className="text-brand-orange underline">Conditions d’utilisation</span> et la{' '}
                        <span className="text-brand-orange underline">Politique de confidentialité</span>.
                      </>
                    )}
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-orange/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <span>{isEn ? 'Creating account...' : 'Création de votre compte...'}</span>
                  ) : (
                    <>
                      <span>{isEn ? 'Create Account & Continue' : 'Créer mon compte'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Social Proof Checklist */}
              <div className="pt-4 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-2 text-[11px] text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isEn ? 'Real Supabase Auth' : 'Authentification Sécurisée'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isEn ? '14-day free trial' : '14 jours d’essai'}</span>
                </span>
              </div>

              {/* Link to Login */}
              <p className="text-center text-xs text-[var(--text-secondary)]">
                {isEn ? 'Already have an account? ' : 'Vous possédez déjà un compte ? '}
                <Link to="/login" className="font-bold text-brand-orange hover:underline">
                  {isEn ? 'Sign in here' : 'Connectez-vous ici'}
                </Link>
              </p>

              {/* Secondary Back to Home Link */}
              <div className="pt-1 text-center">
                <BackToHomeButton variant="link" />
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
