import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
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
  Check,
  LogOut
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { adminService } from '../../services/adminService';
import QRCode from 'qrcode';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication & Verification State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Session verification on mount (avoids flickering / redirect loops)
  const hasStorageToken =
    typeof window !== 'undefined' &&
    Object.keys(localStorage).some(k => k.startsWith('sb-') && k.endsWith('-auth-token'));

  const [isVerifyingSession, setIsVerifyingSession] = useState(hasStorageToken);
  const [isUnauthorizedSession, setIsUnauthorizedSession] = useState(false);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState('');

  // Step state: 'credentials' | 'mfa_challenge' | 'mfa_enroll'
  const [step, setStep] = useState<'credentials' | 'mfa_challenge' | 'mfa_enroll'>('credentials');

  // MFA State
  const [mfaCode, setMfaCode] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [enrollQrUrl, setEnrollQrUrl] = useState<string | null>(null);
  const [enrollSecret, setEnrollSecret] = useState<string | null>(null);
  const [isCopiedSecret, setIsCopiedSecret] = useState(false);

  // Check active session once on mount
  useEffect(() => {
    let isMounted = true;
    async function checkCurrentSession() {
      if (!isSupabaseConfigured || !hasStorageToken) {
        if (isMounted) setIsVerifyingSession(false);
        return;
      }
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const activeUser = sessionData?.session?.user;

        if (activeUser) {
          const isSuper = await adminService.checkIsSuperAdmin();
          if (isSuper) {
            const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
            const { data: factorsData } = await supabase.auth.mfa.listFactors();
            const hasVerifiedTotp = (factorsData?.totp || []).some(f => f.status === 'verified');

            // If MFA not enrolled or session already elevated to AAL2, navigate to dashboard immediately
            if (!hasVerifiedTotp || aalData?.currentLevel === 'aal2') {
              if (isMounted) {
                const destination = (location.state as any)?.from?.pathname || '/admin/overview';
                navigate(destination, { replace: true });
                return;
              }
            } else {
              // Elevated MFA challenge needed
              const verifiedTotp = (factorsData?.totp || []).find(f => f.status === 'verified');
              if (verifiedTotp && isMounted) {
                setMfaFactorId(verifiedTotp.id);
                setStep('mfa_challenge');
              }
            }
          } else {
            // An active session exists, but it belongs to a non-admin restaurant user
            if (isMounted) {
              setIsUnauthorizedSession(true);
              setUnauthorizedEmail(activeUser.email || '');
            }
            adminService.logSecurityEvent({
              eventType: 'admin_login_probe_denied',
              severity: 'medium',
              route: '/admin/login',
              outcome: 'denied',
              reason: 'Authenticated non-admin user accessed admin login portal',
              actorUserId: activeUser.id,
              actorEmail: activeUser.email
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('[AdminLoginPage] Session check exception:', err);
      } finally {
        if (isMounted) setIsVerifyingSession(false);
      }
    }

    checkCurrentSession();
    return () => {
      isMounted = false;
    };
  }, []); // Run ONCE on mount to prevent re-triggering loops

  // Handle Step 1: Super Admin Credentials
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Durable Rate Limit Check
      const rateLimitCheck = await adminService.checkRateLimit(cleanEmail);
      if (!rateLimitCheck.allowed) {
        const waitSec = rateLimitCheck.retryAfter || 60;
        await adminService.logSecurityEvent({
          eventType: 'admin_rate_limit_exceeded',
          severity: 'high',
          route: '/admin/login',
          outcome: 'rate_limited',
          reason: `Rate limit triggered for ${cleanEmail}`,
          actorEmail: cleanEmail
        });
        throw new Error(
          `Trop de tentatives de connexion échouées. Par mesure de sécurité, veuillez patienter ${waitSec} secondes avant de réessayer.`
        );
      }

      if (!isSupabaseConfigured) {
        // Local mock environment mode
        navigate('/admin/overview');
        return;
      }

      // 2. Sign in with password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (authError || !authData?.user) {
        await adminService.logSecurityEvent({
          eventType: 'admin_auth_failed',
          severity: 'high',
          route: '/admin/login',
          outcome: 'denied',
          reason: authError?.message || 'Invalid credentials attempted',
          actorEmail: cleanEmail
        });
        throw new Error('Identifiants d’administration incorrects ou compte non autorisé.');
      }

      // 3. Strict Server-Side Super Admin Verification
      const isSuper = await adminService.checkIsSuperAdmin();
      if (!isSuper) {
        await adminService.logSecurityEvent({
          eventType: 'admin_role_denied',
          severity: 'critical',
          route: '/admin/login',
          outcome: 'denied',
          reason: 'User authenticated successfully but lacks Super Admin authorization',
          actorUserId: authData.user.id,
          actorEmail: authData.user.email
        });
        // Immediate session termination to prevent ordinary users from persisting in admin space
        await supabase.auth.signOut();
        throw new Error(
          "Accès refusé : Ce compte ne dispose pas des privilèges Super Admin. Cet incident d'accès a été consigné."
        );
      }

      // Log successful Super Admin authentication
      await adminService.logSecurityEvent({
        eventType: 'admin_auth_success',
        severity: 'low',
        route: '/admin/login',
        outcome: 'allowed',
        reason: 'Super Admin credentials verified',
        actorUserId: authData.user.id,
        actorEmail: authData.user.email
      });

      // 4. Inspect MFA Factors
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const verifiedTotp = (factorsData?.totp || []).find(f => f.status === 'verified');

      if (verifiedTotp) {
        // MFA already enrolled -> Go to Challenge
        setMfaFactorId(verifiedTotp.id);
        setStep('mfa_challenge');
      } else {
        // MFA not enrolled -> Setup TOTP or allow direct entry for authorized owner
        try {
          const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
            issuer: 'SOFRAFLOW Super Admin'
          });

          if (!enrollError && enrollData) {
            setMfaFactorId(enrollData.id);
            setEnrollSecret(enrollData.totp.secret);
            const qrSvg = await QRCode.toDataURL(enrollData.totp.uri);
            setEnrollQrUrl(qrSvg);
            setStep('mfa_enroll');
            return;
          }
        } catch (mfaEnrollErr) {
          console.warn('[AdminLoginPage] MFA enroll notice:', mfaEnrollErr);
        }

        // If enrollment is skipped or unavailable, proceed directly to dashboard
        const destination = (location.state as any)?.from?.pathname || '/admin/overview';
        navigate(destination, { replace: true });
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
        await adminService.logSecurityEvent({
          eventType: 'admin_mfa_failed',
          severity: 'high',
          route: '/admin/login',
          outcome: 'denied',
          reason: verifyError.message || 'MFA challenge failed',
          actorEmail: email.trim()
        });
        throw new Error(verifyError.message || 'Code de sécurité incorrect ou expiré.');
      }

      await adminService.logSecurityEvent({
        eventType: 'admin_mfa_success',
        severity: 'low',
        route: '/admin/login',
        outcome: 'allowed',
        reason: 'Super Admin MFA challenge verified',
        actorEmail: email.trim()
      });

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

  const handleSignOutUnauthorized = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setIsUnauthorizedSession(false);
      setUnauthorizedEmail('');
      setErrorMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Initial Session Verification (Eliminates visual glitching / flicker)
  if (isVerifyingSession) {
    return (
      <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 p-[1.5px] shadow-lg shadow-orange-500/20">
            <div className="w-full h-full rounded-2xl bg-[#0D1424] flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-orange-400 animate-spin" />
            <span className="text-xs font-mono font-bold text-slate-400">
              Vérification des accès Super Admin...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Zero-Trust Access Denied Screen (If logged in as normal restaurant user)
  if (isUnauthorizedSession) {
    return (
      <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-rose-600/15 via-red-500/10 to-transparent rounded-full blur-[140px]" />
        </div>

        <div className="w-full max-w-md bg-[#0D1424]/90 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 backdrop-blur-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
              403 — Accès Réservé au Super Admin
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Le compte actuellement connecté (<span className="font-mono text-slate-200">{unauthorizedEmail}</span>) ne dispose pas des privilèges d'administration centrale de SOFRAFLOW.
            </p>
            <p className="text-[11px] text-slate-500">
              Cette zone est strictement réservée au Propriétaire de la plateforme. Toute tentative d'accès non autorisée fait l'objet d'un audit de sécurité.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to="/app/overview"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retourner à mon Espace Restaurant</span>
            </Link>

            <button
              onClick={handleSignOutUnauthorized}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-white/[0.08] hover:bg-white/[0.04] text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Se déconnecter pour changer de compte</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Normal Hardened Super Admin Login Form
  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-orange-600 selection:text-white">
      {/* Background ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-orange-600/15 via-amber-500/10 to-purple-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[350px] bg-gradient-to-tl from-amber-500/10 via-orange-600/10 to-transparent rounded-full blur-[130px]" />
      </div>

      {/* Top Breadcrumb / Return */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour au site public</span>
        </Link>
        <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold">
          Portail Restreint
        </span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#0D1424]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 backdrop-blur-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 p-[1.5px] mx-auto shadow-lg shadow-orange-500/20">
            <div className="w-full h-full rounded-2xl bg-[#0D1424] flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
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
            <span className="leading-relaxed">{errorMessage}</span>
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
                className="w-full px-4 py-3 rounded-xl bg-[#070B14] border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all font-mono placeholder:text-slate-600"
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
                  className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
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
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-[#070B14] border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all font-mono placeholder:text-slate-600"
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
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center gap-2.5 leading-relaxed">
              <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
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
                className="w-full px-4 py-3 rounded-xl bg-[#070B14] border border-amber-500/40 text-white text-center font-mono font-bold text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500/60 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || mfaCode.trim().length !== 6}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center gap-2.5 leading-relaxed">
              <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Pour protéger l'administration de SOFRAFLOW, la configuration du 2FA est recommandée pour le Super Admin.</span>
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
                <div className="flex items-center justify-center gap-2 font-mono text-xs bg-[#070B14] px-3 py-1.5 rounded-lg border border-white/[0.08] text-amber-300">
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

            <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
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
                className="w-full px-4 py-3 rounded-xl bg-[#070B14] border border-amber-500/40 text-white text-center font-mono font-bold text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500/60 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || mfaCode.trim().length !== 6}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
        <div className="pt-4 border-t border-white/[0.08] text-center">
          <p className="text-[11px] text-slate-500 leading-normal">
            SOFRAFLOW Security Shield • Chiffrement de bout en bout • Toutes les tentatives d'accès non autorisées sont enregistrées dans le journal d'audit immuable.
          </p>
        </div>
      </div>
    </div>
  );
};
