import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageCode } from '../../types';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'segmented' | 'compact';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  className = ''
}) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages: Array<{ code: LanguageCode; label: string; short: string; flag: string }> = [
    { code: 'fr', label: 'Français', short: 'FR', flag: '🇲🇦' },
    { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧' }
  ];

  const current = languages.find(l => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center p-1 rounded-2xl bg-ivory dark:bg-[#152520] border border-border-subtle dark:border-[#233831] ${className}`}>
        {languages.map((l) => {
          const isActive = language === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-forest dark:bg-gold text-white dark:text-forest-dark shadow-soft'
                  : 'text-ink-secondary dark:text-[#97A7A0] hover:text-ink-main dark:hover:text-[#F0F4F2]'
              }`}
            >
              {l.short}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Sélectionner la langue / Select language"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#14241F] text-ink-main dark:text-[#F0F4F2] hover:bg-ivory dark:hover:bg-[#1B2F29] text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest"
      >
        <Globe className="w-3.5 h-3.5 text-forest dark:text-gold" />
        <span>{current.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-ink-secondary transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-2xl bg-white dark:bg-[#14241F] border border-border-subtle dark:border-[#233831] shadow-elevated p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          {languages.map((l) => {
            const isActive = language === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLanguage(l.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-forest/10 dark:bg-gold/15 text-forest dark:text-gold font-bold'
                    : 'text-ink-main dark:text-[#F0F4F2] hover:bg-ivory dark:hover:bg-[#1B2F29]'
                }`}
              >
                <span>{l.label}</span>
                {isActive && <Check className="w-3.5 h-3.5 text-forest dark:text-gold" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
