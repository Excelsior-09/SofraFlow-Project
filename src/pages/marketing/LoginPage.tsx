import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
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

  const { login } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
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
      await login(email, password);
      navigate('/app/overview');
    } catch (err: any) {
      setError(
        err.message ||
          (isEn
            ? 'Login failed. Please verify your credentials.'
            : 'Échec de connexion. Vérifiez vos identifiants.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setLoading(true);
    setEmail(demoEmail);
    setPassword('DemoPassword123!');
    try {
      await login(demoEmail, 'DemoPassword123!');
      navigate('/app/overview');
    } catch (e: any) {
      setError(e.message);
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
          {isEn ? 'Sign in to SOFRAFLOW' : 'Connexion à votre espace'}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
          {isEn
            ? 'Access your restaurant menus, table QR stands, and sales analytics.'
            : 'Accédez à vos cartes digitales, QR codes de table et analyses des ventes.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--bg-card)] py-8 px-6 sm:px-10 rounded-3xl border border-[var(--border-subtle)] shadow-xl space-y-6">
          
          {/* Quick Demo Access Bar */}
          <div className="p-3.5 rounded-2xl bg-brand-orange/5 border border-brand-orange/20 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-orange">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEn ? 'One-Click Demo Access' : 'Accès Démo en 1 Clic'}</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
              {isEn
                ? 'Test the merchant management workspace instantly without typing credentials:'
                : 'Testez l’espace gérant instantanément sans saisir de mot de passe :'}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('demo@sofraflow.ma')}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-[var(--bg-card)] border border-brand-orange/30 hover:border-brand-orange text-[11px] font-bold text-[var(--text-primary)] transition-all shadow-sm"
              >
                ☕ Café Atlas Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('bistro@sofraflow.ma')}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-[var(--bg-card)] border border-brand-orange/30 hover:border-brand-orange text-[11px] font-bold text-[var(--text-primary)] transition-all shadow-sm"
              >
                🍽️ Restaurant Demo
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

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
                  {isEn ? 'Remember my device' : 'Se souvenir de moi'}
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

          {/* Link to Signup */}
          <p className="text-center text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border-subtle)]">
            {isEn ? 'New to SofraFlow? ' : 'Nouveau sur SofraFlow ? '}
            <Link to="/signup" className="font-bold text-brand-orange hover:underline">
              {isEn ? 'Create your free account' : 'Créer un compte gratuit'}
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};
