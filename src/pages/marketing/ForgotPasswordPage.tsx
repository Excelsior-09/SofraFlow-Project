import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeSwitcher } from '../../components/common/ThemeSwitcher';
import { SEO } from '../../components/common/SEO';
import { useLanguage } from '../../context/LanguageContext';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { language } = useLanguage();
  const isEn = language === 'en';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(
        isEn ? 'Please enter your business email.' : 'Veuillez saisir votre adresse e-mail professionnelle.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    // Front-end simulation:
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden transition-colors duration-200">
      <SEO
        title={
          isEn
            ? 'Reset Password | SOFRAFLOW'
            : 'Réinitialisation du Mot de Passe | SOFRAFLOW'
        }
        description={
          isEn
            ? 'Reset your password to access your SofraFlow account.'
            : 'Réinitialisez votre mot de passe pour accéder à votre compte SofraFlow.'
        }
        noindex={true}
      />

      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 rounded-full bg-brand-navy/10 blur-3xl pointer-events-none" />

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
          {isEn ? 'Reset your password' : 'Réinitialiser votre mot de passe'}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
          {isEn
            ? 'Enter your registered business email and we’ll send you recovery instructions.'
            : 'Saisissez votre e-mail professionnel pour recevoir les instructions de récupération.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--bg-card)] py-8 px-6 sm:px-10 rounded-3xl border border-[var(--border-subtle)] shadow-xl space-y-6">
          
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {isEn ? 'Recovery link sent!' : 'Lien de réinitialisation envoyé !'}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {isEn
                  ? `If an account exists for ${email}, a password reset link has been dispatched.`
                  : `Si un compte correspond à ${email}, un lien de réinitialisation vient de vous être envoyé.`}
              </p>
              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-brand-orange hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Back to Sign In' : 'Retour à la connexion'}</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                  {error}
                </div>
              )}

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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-orange/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span>{isEn ? 'Sending instructions...' : 'Envoi en cours...'}</span>
                ) : (
                  <>
                    <span>{isEn ? 'Send Reset Link' : 'Envoyer le lien'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-[var(--border-subtle)] text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-brand-orange"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Back to login' : 'Retour à la page de connexion'}</span>
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
