import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, LogIn, AlertCircle, ShieldCheck, KeyRound, LogOut } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, mfaRequired, verifyMfaChallenge, logout, refreshState } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showTimeoutFallback, setShowTimeoutFallback] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // MFA Challenge State
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => {
        setShowTimeoutFallback(true);
      }, 4000);
    } else {
      setShowTimeoutFallback(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refreshState();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleForceLogin = () => {
    navigate('/login', { replace: true, state: { from: location } });
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.trim().length !== 6) {
      setMfaError('Veuillez saisir un code de sécurité à 6 chiffres valide.');
      return;
    }

    setIsVerifyingMfa(true);
    setMfaError(null);
    try {
      await verifyMfaChallenge(mfaCode.trim());
    } catch (err: any) {
      console.error('[ProtectedRoute] MFA verification error:', err);
      setMfaError(err.message || 'Code de sécurité incorrect ou expiré. Veuillez réessayer.');
    } finally {
      setIsVerifyingMfa(false);
    }
  };

  // Loading state
  if (isLoading) {
    if (showTimeoutFallback) {
      return (
        <div className="min-h-screen bg-ivory dark:bg-[#0C1814] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#101E1A] border border-border-subtle dark:border-[#233831] rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-forest dark:text-[#F0F4F2] font-display">
                Vérification de session prolongée
              </h3>
              <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                La connexion à votre session prend plus de temps que prévu. Vous pouvez réessayer ou vous reconnecter.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-forest dark:bg-gold text-white dark:text-forest-dark hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Vérification...' : 'Réessayer'}
              </button>

              <button
                onClick={handleForceLogin}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl border border-border-subtle dark:border-[#233831] hover:bg-neutral-50 dark:hover:bg-[#152520] text-ink-main dark:text-[#F0F4F2] transition-colors flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Se reconnecter
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-ivory dark:bg-[#0C1814] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-orange border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-ink-secondary dark:text-[#97A7A0]">
            Vérification de la session...
          </span>
        </div>
      </div>
    );
  }

  // Mandatory 2FA/MFA Challenge Gateway
  if (mfaRequired) {
    return (
      <div className="min-h-screen bg-ivory dark:bg-[#0C1814] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#101E1A] border border-border-subtle dark:border-[#233831] rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-forest dark:text-[#F0F4F2] font-display">
              Vérification en 2 étapes requise
            </h2>
            <p className="text-xs text-ink-secondary dark:text-[#97A7A0] max-w-sm mx-auto">
              Ce compte est protégé par l'authentification à deux facteurs. Saisissez le code à 6 chiffres généré par votre application d'authentification.
            </p>
          </div>

          {mfaError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium text-left">
              {mfaError}
            </div>
          )}

          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-secondary dark:text-[#97A7A0]">
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
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-ivory dark:bg-[#0C1814] border border-border-subtle dark:border-[#233831] text-forest dark:text-[#F0F4F2] text-center tracking-widest text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={isVerifyingMfa || mfaCode.trim().length !== 6}
              className="w-full py-3 rounded-xl bg-brand-orange hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifyingMfa ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Vérification en cours...</span>
                </>
              ) : (
                <span>Valider le code de sécurité</span>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-border-subtle dark:border-[#233831]">
            <button
              onClick={() => logout()}
              className="text-xs text-ink-secondary dark:text-[#97A7A0] hover:text-rose-600 flex items-center justify-center gap-1.5 mx-auto transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Annuler et se déconnecter</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
