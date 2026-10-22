import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, LogIn, AlertCircle } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, refreshState } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showTimeoutFallback, setShowTimeoutFallback] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

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

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
