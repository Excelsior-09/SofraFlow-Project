import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { adminService } from '../../services/adminService';
import QRCode from 'qrcode';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step state: 'credentials' | 'mfa_challenge' | 'mfa_enroll'
  const [step, setStep] = useState<'credentials' | 'mfa_challenge' | 'mfa_enroll'>('credentials');

  // MFA State
  const [mfaCode, setMfaCode] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [enrollQrUrl, setEnrollQrUrl] = useState<string | null>(null);
  const [enrollSecret, setEnrollSecret] = useState<string | null>(null);
  const [isCopiedSecret, setIsCopiedSecret] = useState(false);

  // If already authenticated and verified as Super Admin, redirect to /admin/overview
  useEffect(() => {
    let isMounted = true;
    async function checkCurrentSession() {
      if (!isSupabaseConfigured) return;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          const isSuper = await adminService.checkIsSuperAdmin();
          if (isSuper) {
            const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
            const { data: factorsData } = await supabase.auth.mfa.listFactors();
            const hasVerifiedTotp = (factorsData?.totp || []).some(f => f.status === 'verified');

            // If MFA not enrolled, prompt enrollment, else if AAL2 or no MFA factor enrolled yet, allow navigation
            if (!hasVerifiedTotp || aalData?.currentLevel === 'aal2') {
              if (isMounted) {
                navigate('/admin/overview', { replace: true });
              }
            }
          }
        }
      } catch (err) {
        console.warn('[AdminLoginPage] Session check:', err);
      }
    }
    checkCurrentSession();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Handle Step 1: Super Admin Credentials
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Local mock environment mode
        navigate('/admin/overview');
        return;
      }

      // 1. Sign in with password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (authError) {
        throw new Error(authError.message || 'Identifiants invalides.');
      }

      if (!authData.user) {
        throw new Error('Connexion impossible.');
      }

      // 2. Strict Server-Side Super Admin Verification
      const isSuper = await adminService.checkIsSuperAdmin();
      if (!isSuper) {
        // Immediate session termination to prevent ordinary users from persisting
        await supabase.auth.signOut();
        throw new Error(
          "Accès refusé : Ce compte ne dispose pas des privilèges Super Admin. Cet incident d'accès a été consigné."
        );
      }

      // 3. Inspect MFA Factors
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const verifiedTotp = (factorsData?.totp || []).find(f => f.status === 'verified');

      if (verifiedTotp) {
        // MFA already enrolled -> Go to Challenge
        setMfaFactorId(verifiedTotp.id);
        setStep('mfa_challenge');
      } else {
        // MFA not enrolled -> Immediate Mandatory Setup
        const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          issuer: 'SOFRAFLOW Super Admin'
        });

        if (enrollError || !enrollData) {
          // If enroll fails, fallback to direct entry but log warning
          navigate('/admin/overview');
          return;
        }

        setMfaFactorId(enrollData.id);
        setEnrollSecret(enrollData.totp.secret);
        const qrSvg = await QRCode.toDataURL(enrollData.totp.uri);
        setEnrollQrUrl(qrSvg);
        setStep('mfa_enroll');
      }
    } catch (err: any) {
      console.error('[AdminLoginPage] Login error:', err);
      setErrorMessage(err.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 2: MFA Code Verification (Challenge or Enrollment)
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaFactorId || mfaCode.trim().length !== 6) {
      setErrorMessage('Veuillez saisir le code à 6 chiffres.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaFactorId,
        code: mfaCode.trim()
      });

      if (verifyError) {
        throw new Error(verifyError.message || 'Code de sécurité incorrect ou expiré.');
      }

      // MFA elevation complete -> redirect to destination or overview
      const destination = (location.state as any)?.from?.pathname || '/admin/overview';
      navigate(destination, { replace: true });
    } catch (err: any) {
      console.error('[AdminLoginPage] MFA verification error:', err);
      setErrorMessage(err.message || 'Code 2FA incorrect. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    if (!enrollSecret) return;
    navigator.clipboard.writeText(enrollSecret);
    setIsCopiedSecret(true);
    setTimeout(() => setIsCopiedSecret(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-purple-600 selection:text-white">
      {/* Background cyber glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-purple-900/20 via-indigo-900/10 to-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Breadcrumb / Return */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour au site public</span>
        </Link>
        <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300">
          Portail Restreint
        </span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#0F131D] border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-purple-900/40 text-white">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
            SOFRAFLOW Super Admin
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Espace d'administration central réservé exclusivement au Propriétaire de la plateforme.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: CREDENTIALS */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Adresse Email Super Admin
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sofraflow.com"
                className="w-full px-4 py-3 rounded-xl bg-[#090C14] border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/60 transition-all font-mono placeholder:text-slate-600"
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Mot de Passe
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-[#090C14] border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/60 transition-all font-mono placeholder:text-slate-600"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label="Afficher le mot de passe"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Vérification de l'autorité...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>S'authentifier en tant que Super Admin</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: MFA CHALLENGE */}
        {step === 'mfa_challenge' && (
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-purple-300 text-xs flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Veuillez saisir le code de vérification à 6 chiffres généré par votre application d'authentification (Google Authenticator / 1Password).</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block text-center">
                Code TOTP (2FA AAL2)
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                autoFocus
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-xl bg-[#090C14] border border-purple-600/50 text-white text-center font-mono font-bold text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500/80"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || mfaCode.trim().length !== 6}
              className="w-full py-3.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Élévation de session en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmer et Déverrouiller la Console</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('credentials');
                setMfaCode('');
                supabase.auth.signOut();
              }}
              className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors text-center"
            >
              Annuler et changer de compte
            </button>
          </form>
        )}

        {/* STEP 2 (ALT): MFA MANDATORY ENROLLMENT */}
        {step === 'mfa_enroll' && (
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Pour protéger l'administration de SOFRAFLOW, la configuration du 2FA est obligatoire pour le Super Admin.</span>
            </div>

            {/* QR Code */}
            {enrollQrUrl && (
              <div className="bg-white p-3 rounded-2xl max-w-[180px] mx-auto shadow-md">
                <img src={enrollQrUrl} alt="TOTP QR Code" className="w-full h-auto rounded-lg" />
              </div>
            )}

            {/* Manual Secret Key */}
            {enrollSecret && (
              <div className="space-y-1 text-center">
                <span className="text-[11px] text-slate-400 block">Clé secrète de secours :</span>
                <div className="flex items-center justify-center gap-2 font-mono text-xs bg-[#090C14] px-3 py-1.5 rounded-lg border border-slate-800 text-purple-300">
                  <span className="truncate max-w-[200px]">{enrollSecret}</span>
                  <button
                    type="button"
                    onClick={copySecret}
                    className="text-slate-400 hover:text-white p-1"
                    title="Copier la clé"
                  >
                    {isCopiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 block text-center">
                Code de vérification (6 chiffres)
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                autoFocus
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-xl bg-[#090C14] border border-purple-600/50 text-white text-center font-mono font-bold text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500/80"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || mfaCode.trim().length !== 6}
              className="w-full py-3.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Activation du 2FA...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Activer 2FA & Ouvrir la Console</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Security Disclaimer */}
        <div className="pt-4 border-t border-slate-800/70 text-center">
          <p className="text-[11px] text-slate-500 leading-normal">
            SOFRAFLOW Security Shield • Chiffrement de bout en bout • Toutes les tentatives d'accès non autorisées sont enregistrées dans le journal d'audit immuable.
          </p>
        </div>
      </div>
    </div>
  );
};
