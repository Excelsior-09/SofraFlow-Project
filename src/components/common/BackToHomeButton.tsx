import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface BackToHomeButtonProps {
  className?: string;
  variant?: 'button' | 'ghost' | 'link';
  compactOnMobile?: boolean;
}

export const BackToHomeButton: React.FC<BackToHomeButtonProps> = ({
  className = '',
  variant = 'button',
  compactOnMobile = false,
}) => {
  const { t } = useLanguage();
  const label = t('auth.backToHome') || t('common.backToHome') || 'Back to home';
  const shortLabel = t('common.home') || 'Home';

  if (variant === 'link') {
    return (
      <Link
        to="/"
        id="back-to-home-link"
        data-testid="back-to-home-link"
        className={`group inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-brand-orange transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 rounded-lg py-1 px-1.5 ${className}`}
        aria-label={label}
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-1" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <Link
      to="/"
      id="back-to-home-btn"
      data-testid="back-to-home-btn"
      className={`group inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-brand-orange bg-[var(--bg-card)]/90 hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-brand-orange/40 shadow-xs hover:shadow-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 select-none ${className}`}
      aria-label={label}
    >
      <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-1 shrink-0" />
      <span className={compactOnMobile ? 'hidden sm:inline' : 'inline'}>{label}</span>
      {compactOnMobile && (
        <span className="sm:hidden">{shortLabel}</span>
      )}
    </Link>
  );
};
