import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db } from '../services/db';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // 1. Check logged in user preference
    try {
      const user = db.getCurrentUser();
      if (user?.preferredTheme && ['light', 'dark', 'system'].includes(user.preferredTheme)) {
        return user.preferredTheme;
      }
    } catch (e) {}

    // 2. Check localStorage
    try {
      const saved = localStorage.getItem('sofraflow_theme');
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved as Theme;
      }
    } catch (e) {}

    return 'system';
  });

  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (theme === 'system') return getSystemTheme();
    return theme;
  });

  // Listen to OS theme changes if theme is system
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (theme === 'system') {
        const matches = 'matches' in e ? e.matches : (e as any).matches;
        setResolvedTheme(matches ? 'dark' : 'light');
      }
    };

    if (theme === 'system') {
      setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme);
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange as EventListener);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleMediaChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange as EventListener);
      } else if ((mediaQuery as any).removeListener) {
        (mediaQuery as any).removeListener(handleMediaChange);
      }
    };
  }, [theme]);

  // Apply or remove .dark class based on resolvedTheme and route
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('sofraflow_theme', newTheme);
      db.updateUserPreferences({ preferredTheme: newTheme });
    } catch (e) {}

    if (newTheme === 'system') {
      setResolvedTheme(getSystemTheme());
    } else {
      setResolvedTheme(newTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
