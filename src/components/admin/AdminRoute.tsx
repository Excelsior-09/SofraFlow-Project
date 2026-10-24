import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Lock
} from 'lucide-react';

export const AdminRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    user,
    mfaRequired,
    mfaAssuranceLevel,
    mfaFactors,
    verifyMfaChallenge,
    logout
  } = useAuth();
  const location = useLocation();

  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);

  // MFA Challenge State for Super Admin Gateway
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [isSubmittingMfa, setIsSubmittingMfa] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyAdminStatus() {
      if (!isAuthenticated || isAuthLoading) {
        if (isMounted) setIsVerifyingAdmin(false);
        return;
      }

      try {
        const isAdmin = await adminService.checkIsSuperAdmin();
        if (isMounted) {
          setIsSuperAdmin(isAdmin);
        }
      } catch (err) {
        console.error('[AdminRoute] Failed to verify super admin status:', err);
        if (isMounted) setIsSuperAdmin(false);
      } finally {
        if (isMounted) setIsVerifyingAdmin(false);
      }
    }

    verifyAdminStatus();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAuthLoading, user?.id]);

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.trim().length !== 6) {
      setMfaError('Veuillez saisir le code de sécurité à 6 chiffres.');
      return;
    }

    setIsSubmittingMfa(true);
    setMfaError(null);
    try {
      await verifyMfaChallenge(mfaCode.trim());
    } catch (err: any) {
      setMfaError(err.message || 'Code de sécurité incorrect ou expiré.');
    } finally {
      setIsSubmittingMfa(false);
    }
  };

  // 1. Initial Authentication Loading State
  if (isAuthLoading || isVerifyingAdmin) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-orange border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-[var(--text-secondary)] font-mono">
            Vérification des privilèges Super Admin...
          </span>
        </div>
      </div>
    );
  }

  // 2. Redirect to Dedicated Admin Login Entry Point if unauthenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 3. Mandatory 2FA/MFA Challenge Gateway for Super Admin
  // If MFA is required or assurance level is not yet upgraded to AAL2
  const hasEnrolledMfa = mfaFactors && mfaFactors.length > 0;
  const needsMfaElevation = mfaRequired || (hasEnrolledMfa && mfaAssuranceLevel !== 'aal2');

  if (needsMfaElevation) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-[var(--text-primary)] font-display">
              Super Admin — 2FA Obligatoire
            </h2>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              L'accès à la console d'administration requiert une authentification à deux facteurs active (AAL2). Saisissez votre code TOTP à 6 chiffres.
            </p>
          </div>

          {mfaError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium text-left">
              {mfaError}
            </div>
          )}

          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-secondary)]">
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
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-center tracking-widest text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingMfa || mfaCode.trim().length !== 6}
              className="w-full py-3 rounded-xl bg-brand-orange hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmittingMfa ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Vérification...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Déverrouiller la console</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => logout()}
              className="text-xs text-[var(--text-secondary)] hover:text-rose-600 flex items-center justify-center gap-1.5 mx-auto transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Annuler et se déconnecter</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Access Denied / 403 Forbidden if not verified Super Admin
  if (isSuperAdmin === false) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--bg-card)] border border-rose-500/20 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-[var(--text-primary)] font-display">
              Accès Réservé au Super Admin
            </h1>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Votre compte ({user?.email}) n'est pas autorisé à accéder à la console d'administration de la plateforme SOFRAFLOW. Cette zone est strictement réservée au propriétaire du SaaS.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/app/overview"
              className="w-full py-3 px-4 rounded-xl bg-forest dark:bg-gold text-white dark:text-forest-dark font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retourner à mon Espace Restaurant</span>
            </Link>

            <button
              onClick={() => logout()}
              className="text-xs text-[var(--text-secondary)] hover:text-rose-600 py-2 transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Authorized Super Admin
  return children ? <>{children}</> : <Outlet />;
};
