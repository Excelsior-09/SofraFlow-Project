import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, Theme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface ThemeSwitcherProps {
  compact?: boolean;
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ compact = false, className = '' }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { t } = useLanguage();

  const options: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
    { value: 'light', label: t('common.light'), icon: <Sun className="w-3.5 h-3.5" /> },
    { value: 'system', label: t('common.system'), icon: <Laptop className="w-3.5 h-3.5" /> },
    { value: 'dark', label: t('common.dark'), icon: <Moon className="w-3.5 h-3.5" /> }
  ];

  if (compact) {
    // Single toggle button that cycles or shows quick menu
    return (
      <div className={`flex items-center p-0.5 rounded-xl bg-ivory dark:bg-[#152520] border border-border-subtle dark:border-[#233831] ${className}`}>
        {options.map((opt) => {
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              title={`${t('common.theme')} : ${opt.label}`}
              aria-label={`${t('common.theme')} : ${opt.label}`}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-forest dark:bg-gold text-white dark:text-forest-dark shadow-soft'
                  : 'text-ink-secondary dark:text-[#97A7A0] hover:text-ink-main dark:hover:text-[#F0F4F2]'
              }`}
            >
              {opt.icon}
            </button>
          );
        })}
      </div>
    );
  }

  // Full segmented control with text labels
  return (
    <div
      role="radiogroup"
      aria-label={t('common.theme')}
      className={`inline-flex items-center p-1 rounded-2xl bg-ivory dark:bg-[#152520] border border-border-subtle dark:border-[#233831] ${className}`}
    >
      {options.map((opt) => {
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(opt.value)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isActive
                ? 'bg-forest dark:bg-gold text-white dark:text-forest-dark font-bold shadow-soft'
                : 'text-ink-secondary dark:text-[#97A7A0] hover:text-ink-main dark:hover:text-[#F0F4F2] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            {opt.icon}
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
