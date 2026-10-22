import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught component error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/app/overview';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-ivory dark:bg-[#0C1814] text-ink-main dark:text-[#F0F4F2]">
          <div className="max-w-lg w-full bg-white dark:bg-[#101E1A] border border-border-subtle dark:border-[#233831] rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold font-display text-forest dark:text-[#F0F4F2]">
                Une erreur inattendue est survenue
              </h2>
              <p className="text-xs sm:text-sm text-ink-secondary dark:text-[#97A7A0]">
                Le composant n'a pas pu être affiché correctement. Vos données sont préservées.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-neutral-50 dark:bg-[#152520] p-3 rounded-xl border border-neutral-200 dark:border-[#233831] text-[11px] font-mono text-ink-secondary dark:text-[#97A7A0] max-h-28 overflow-auto">
                <span className="font-bold text-red-500">Erreur : </span>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-forest dark:bg-gold text-white dark:text-forest-dark hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Rafraîchir la page
              </button>

              <button
                onClick={this.handleGoHome}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border-subtle dark:border-[#233831] hover:bg-neutral-50 dark:hover:bg-[#152520] text-ink-main dark:text-[#F0F4F2] transition-colors flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                Tableau de bord
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
