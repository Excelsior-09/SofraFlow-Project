import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, X, ArrowRight, Sparkles } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const MarketingNav: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();

  const isEn = language === 'en';

  const navLinks = [
    { label: isEn ? 'Features' : 'Fonctionnalités', href: '/#features' },
    { label: isEn ? 'Our Story' : 'Notre Histoire', href: '/#story' },
    { label: isEn ? 'Solutions' : 'Solutions', href: '/solutions' },
    { label: isEn ? 'Interactive Demo' : 'Menu Démo', href: '/#demo', isDemoBadge: true },
    { label: isEn ? 'Pricing' : 'Tarifs', href: '/pricing' },
    { label: isEn ? 'FAQ' : 'FAQ', href: '/#faq' },
    { label: isEn ? 'Contact' : 'Contact', href: '/contact' }
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const hashId = href.substring(2);
      if (location.pathname === '/') {
        e.preventDefault();
        const target = document.getElementById(hashId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `#${hashId}`);
        }
      }
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path: string) => {
    if (path.startsWith('/#')) return false;
    if (path === '/solutions') return location.pathname.startsWith('/solutions');
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-ivory/90 dark:bg-dark-page/90 backdrop-blur-md border-b border-border-subtle dark:border-dark-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Logo showTagline={false} size="md" />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={`text-sm font-semibold transition-all relative py-1 ${
                isActive(link.href)
                  ? 'text-brand-orange dark:text-orange-400 font-bold'
                  : 'text-ink-secondary dark:text-dark-secondary hover:text-brand-navy dark:hover:text-dark-text'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {link.label}
                {link.isDemoBadge && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/80 text-brand-orange dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                    {isEn ? 'LIVE' : 'DÉMO'}
                  </span>
                )}
              </span>
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange rounded-full" />
              )}
            </a>
          ))}
        </nav>

        {/* Controls: Theme, Language, Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <ThemeSwitcher compact={true} />
          <LanguageSelector variant="compact" />

          {isAuthenticated ? (
            <Link to="/app/overview">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {isEn ? 'Dashboard' : 'Tableau de bord'}
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="font-bold text-brand-navy dark:text-dark-text hover:text-brand-orange">
                  {isEn ? 'Sign In' : 'Connexion'}
                </Button>
              </Link>
              <Link to="/signup">
                <button className="px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 transform active:scale-95">
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>{isEn ? 'Start Free' : 'Commencer Gratuitement'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle with quick controls */}
        <div className="flex lg:hidden items-center gap-1.5">
          <ThemeSwitcher compact={true} />
          <LanguageSelector variant="compact" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-ink-main dark:text-dark-text hover:bg-white dark:hover:bg-dark-card border border-border-subtle dark:border-dark-border"
            aria-label="Basculer le menu de navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                  isActive(link.href)
                    ? 'bg-orange-50 dark:bg-orange-950/40 text-brand-orange dark:text-orange-400'
                    : 'text-ink-secondary dark:text-dark-secondary hover:bg-ivory dark:hover:bg-dark-surface'
                }`}
              >
                <span>{link.label}</span>
                {link.isDemoBadge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/80 text-brand-orange dark:text-orange-400">
                    {isEn ? 'LIVE' : 'DÉMO'}
                  </span>
                )}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-border-subtle dark:border-dark-border flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Link to="/app/overview" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full">
                  {isEn ? 'Dashboard' : 'Tableau de bord'}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-3 rounded-xl bg-brand-orange hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>{isEn ? 'Start Free' : 'Commencer Gratuitement'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    {isEn ? 'Sign In' : 'Connexion'}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
