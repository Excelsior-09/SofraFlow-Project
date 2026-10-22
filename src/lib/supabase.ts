import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[SofraFlow Configuration Error] Missing Supabase environment variables!\n' +
      'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) ' +
      'are properly defined in your .env file.'
  );
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const REMEMBER_ME_KEY = 'sofraflow_remember_me_opt';

const getStorage = (type: 'local' | 'session') => {
  if (typeof window !== 'undefined') {
    return type === 'local' ? window.localStorage : window.sessionStorage;
  }
  if (typeof globalThis !== 'undefined') {
    return type === 'local' ? (globalThis as any).localStorage : (globalThis as any).sessionStorage;
  }
  return null;
};

export const isRememberMeEnabled = (): boolean => {
  const local = getStorage('local');
  if (!local) return true;
  const val = local.getItem(REMEMBER_ME_KEY);
  // Default to true for persistent convenience unless explicitly set to false
  return val === null ? true : val === 'true';
};

export const setRememberMePreference = (remember: boolean) => {
  const local = getStorage('local');
  if (local) {
    local.setItem(REMEMBER_ME_KEY, remember ? 'true' : 'false');
  }
};

/**
 * Storage adapter conforming to Supabase Supported Storage Interface.
 * Routes session tokens to localStorage when Remember Me is enabled,
 * and sessionStorage when Remember Me is disabled.
 */
export const dynamicAuthStorage = {
  getItem: (key: string): string | null => {
    const local = getStorage('local');
    const session = getStorage('session');
    if (!local || !session) return null;
    return isRememberMeEnabled() ? local.getItem(key) : session.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    const local = getStorage('local');
    const session = getStorage('session');
    if (!local || !session) return;
    if (isRememberMeEnabled()) {
      local.setItem(key, value);
      session.removeItem(key);
    } else {
      session.setItem(key, value);
      local.removeItem(key);
    }
  },
  removeItem: (key: string): void => {
    const local = getStorage('local');
    const session = getStorage('session');
    local?.removeItem(key);
    session?.removeItem(key);
  }
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: dynamicAuthStorage
    }
  }
);

