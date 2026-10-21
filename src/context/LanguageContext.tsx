import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { LanguageCode, LocalizedString } from '../types';
import { dictionaries } from '../locales';
import { db } from '../services/db';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  dir: 'ltr' | 'rtl';
  t: (keyOrLocalized?: LocalizedString | string, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: string | Date) => string;
  formatNumber: (value: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to resolve nested key e.g. "common.save" or "dashboard.greeting"
function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr && typeof curr === 'object' && part in curr) {
      curr = curr[part];
    } else {
      return undefined;
    }
  }
  return typeof curr === 'string' ? curr : undefined;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    // 1. Check current logged-in user preference from DB (only fr and en)
    try {
      const user = db.getCurrentUser();
      if (user?.preferredLanguage && ['fr', 'en'].includes(user.preferredLanguage)) {
        return user.preferredLanguage as LanguageCode;
      }
    } catch (e) {
      // safe fallback
    }

    // 2. Check saved localStorage (only fr and en)
    try {
      const saved = localStorage.getItem('sofraflow_lang');
      if (saved && ['fr', 'en'].includes(saved)) {
        return saved as LanguageCode;
      }
    } catch (e) {
      // safe fallback
    }

    // 3. Default to French for Moroccan SaaS
    return 'fr';
  });

  const dir: 'ltr' = 'ltr';

  useEffect(() => {
    try {
      localStorage.setItem('sofraflow_lang', language);
    } catch (e) {}

    if (typeof document !== 'undefined') {
      document.documentElement.dir = dir;
      document.documentElement.lang = language;
    }
  }, [language, dir]);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('sofraflow_lang', lang);
      db.updateUserPreferences({ preferredLanguage: lang });
    } catch (e) {}
  }, []);

  const t = useCallback(
    (keyOrLocalized?: LocalizedString | string, params?: Record<string, string | number>): string => {
      if (!keyOrLocalized) return '';

      // 1. If it's a LocalizedString object from DB (e.g. product name or category description)
      if (typeof keyOrLocalized === 'object') {
        const localized = keyOrLocalized as LocalizedString;
        return localized[language] || localized.fr || localized.en || localized.ar || '';
      }

      // 2. If it's a translation key string (e.g. "common.save", "dashboard.kpiRevenue")
      const strKey = keyOrLocalized as string;
      const dict = (dictionaries as any)[language] || dictionaries.fr;
      let template = getNestedValue(dict, strKey);

      // Fallback to English, then French
      if (!template && language !== 'en') {
        template = getNestedValue(dictionaries.en, strKey);
      }
      if (!template && language !== 'fr') {
        template = getNestedValue(dictionaries.fr, strKey);
      }

      // If not found in dictionaries, return the string itself
      if (!template) {
        return strKey;
      }

      // 3. Interpolate dynamic params: {name}, {count}, etc.
      if (params) {
        return Object.entries(params).reduce((acc, [k, v]) => {
          return acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }, template);
      }

      return template;
    },
    [language]
  );

  const formatCurrency = useCallback(
    (amount: number, currency: string = 'MAD'): string => {
      const num = Number.isFinite(amount) ? amount : 0;
      const locale = language === 'fr' ? 'fr-MA' : 'en-US';
      try {
        const formatted = new Intl.NumberFormat(locale, {
          minimumFractionDigits: num % 1 === 0 ? 0 : 2,
          maximumFractionDigits: 2
        }).format(num);

        return `${formatted} ${currency}`;
      } catch (e) {
        return `${num.toFixed(2)} ${currency}`;
      }
    },
    [language]
  );

  const formatDate = useCallback(
    (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
      try {
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return '';
        const locale = language === 'fr' ? 'fr-MA' : 'en-US';
        const defaultOptions: Intl.DateTimeFormatOptions = options || {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        };
        return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
      } catch (e) {
        return String(date);
      }
    },
    [language]
  );

  const formatTime = useCallback(
    (date: string | Date): string => {
      try {
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return '';
        const locale = language === 'fr' ? 'fr-MA' : 'en-US';
        return new Intl.DateTimeFormat(locale, {
          hour: '2-digit',
          minute: '2-digit'
        }).format(d);
      } catch (e) {
        return '';
      }
    },
    [language]
  );

  const formatNumber = useCallback(
    (value: number): string => {
      const locale = language === 'fr' ? 'fr-MA' : 'en-US';
      try {
        return new Intl.NumberFormat(locale).format(value);
      } catch (e) {
        return String(value);
      }
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        dir,
        t,
        formatCurrency,
        formatDate,
        formatTime,
        formatNumber
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
