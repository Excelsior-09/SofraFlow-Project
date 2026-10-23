import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { supabase, isSupabaseConfigured, setRememberMePreference } from '../lib/supabase';
import { supabaseService, UserProfile } from '../services/supabaseService';
import { db } from '../services/db';
import { Restaurant, User } from '../types';

export interface MfaEnrollmentResult {
  id: string;
  qrCode: string;
  secret: string;
  uri: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  activeRestaurant: Restaurant | null;
  allRestaurants: Restaurant[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  mfaRequired: boolean;
  mfaFactorId: string | null;
  mfaFactors: any[];
  mfaAssuranceLevel: 'aal1' | 'aal2' | null;
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<{ success: boolean; mfaRequired: boolean }>;
  verifyMfaChallenge: (code: string) => Promise<boolean>;
  enrollMfa: () => Promise<MfaEnrollmentResult>;
  verifyMfaEnrollment: (factorId: string, code: string) => Promise<boolean>;
  unenrollMfa: (factorId: string) => Promise<boolean>;
  loadMfaStatus: () => Promise<void>;
  signup: (params: {
    restaurantName: string;
    slug: string;
    email: string;
    fullName: string;
    phone?: string;
    password?: string;
  }) => Promise<Restaurant | null>;
  registerWithEmail: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ user: any; needsEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (updates: {
    fullName: string;
    phone?: string;
    preferredLanguage?: 'en' | 'fr';
  }) => Promise<{ success: boolean; error?: string }>;
  changePasswordWithVerification: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  reloadProfile: () => Promise<UserProfile | null>;
  switchRestaurant: (restaurantId: string) => void;
  createBusiness: (params: {
    name: string;
    slug: string;
    businessType?: string;
    phone?: string;
    city?: string;
    address?: string;
    description?: string;
    contactEmail?: string;
  }) => Promise<Restaurant | null>;
  refreshState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_REST_KEY = 'sofraflow_active_restaurant_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(null);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // MFA State
  const [mfaRequired, setMfaRequired] = useState<boolean>(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaFactors, setMfaFactors] = useState<any[]>([]);
  const [mfaAssuranceLevel, setMfaAssuranceLevel] = useState<'aal1' | 'aal2' | null>(null);

  // Load real user data and restaurants from Supabase
  const loadUserData = useCallback(async (authUserId: string, authUserEmail: string, metaFullName?: string) => {
    try {
      // 1. Fetch or initialize profile
      let prof: UserProfile | null = null;
      try {
        prof = await supabaseService.getProfile(authUserId);
      } catch (profErr) {
        console.warn('[Auth] getProfile warning:', profErr);
      }

      if (!prof && metaFullName) {
        prof = {
          id: authUserId,
          fullName: metaFullName,
          role: 'owner',
          preferredLanguage: 'fr'
        };
      }
      setProfile(prof);

      // 2. Fetch restaurants owned by this user
      let ownedRestaurants: Restaurant[] = [];
      try {
        ownedRestaurants = await supabaseService.getRestaurantsForOwner(authUserId);
      } catch (restErr) {
        console.warn('[Auth] getRestaurantsForOwner warning:', restErr);
      }

      // If remote returned 0 or failed, fallback to local cache if present
      let availableRestaurants = ownedRestaurants;
      if (availableRestaurants.length === 0) {
        const localList = db.getRestaurants();
        if (localList.length > 0) {
          availableRestaurants = localList;
        }
      }

      setAllRestaurants(availableRestaurants);

      // 3. Determine active restaurant
      const storedActiveId = localStorage.getItem(ACTIVE_REST_KEY);
      const matched =
        availableRestaurants.find(r => r.id === storedActiveId) ||
        availableRestaurants[0] ||
        null;

      setActiveRestaurant(matched);
      if (matched) {
        localStorage.setItem(ACTIVE_REST_KEY, matched.id);
      } else {
        localStorage.removeItem(ACTIVE_REST_KEY);
      }

      // 4. Set unified user object
      setUser({
        id: authUserId,
        email: authUserEmail,
        fullName: prof?.fullName || metaFullName || authUserEmail.split('@')[0],
        phone: prof?.phone || '',
        avatarUrl: prof?.avatarUrl || '',
        restaurantId: matched?.id || '',
        role: prof?.role || 'owner',
        preferredLanguage: (prof?.preferredLanguage as any) || 'fr'
      });
      setIsDemoMode(false);
    } catch (err) {
      console.error('[Auth] Error loading user data from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check MFA status and factors for active session
  const loadMfaStatus = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data: factorsData, error: factorsErr } = await supabase.auth.mfa.listFactors();
      if (!factorsErr && factorsData) {
        const verified = (factorsData.totp || []).filter(f => f.status === 'verified');
        setMfaFactors(verified);
      }

      const { data: aalData, error: aalErr } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (!aalErr && aalData) {
        setMfaAssuranceLevel(aalData.currentLevel as 'aal1' | 'aal2');
        if (aalData.nextLevel === 'aal2' && aalData.currentLevel !== 'aal2') {
          setMfaRequired(true);
        } else {
          setMfaRequired(false);
        }
      }
    } catch (err) {
      console.warn('[Auth] MFA status check notice:', err);
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      if (!isSupabaseConfigured) {
        const mockUser = db.getCurrentUser();
        if (mockUser && mounted) {
          setUser(mockUser);
          const rests = db.getRestaurants();
          setAllRestaurants(rests);
          setActiveRestaurant(rests[0] || null);
          setIsDemoMode(true);
        }
        if (mounted) setIsLoading(false);
        return;
      }

      // Safety timeout: Guarantee that isLoading is never true for more than 3500ms
      const timeoutId = setTimeout(() => {
        if (mounted) {
          console.warn('[Auth] Session initialization reached safety timeout');
          setIsLoading(false);
        }
      }, 3500);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[Auth] Session retrieval error:', error.message);
        }

        if (session?.user && mounted) {
          // Check MFA assurance level
          const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          const needsMfa = Boolean(aalData && aalData.nextLevel === 'aal2' && aalData.currentLevel !== 'aal2');

          if (needsMfa) {
            setMfaRequired(true);
            const { data: factorsData } = await supabase.auth.mfa.listFactors();
            const totpFactor = (factorsData?.totp || []).find(f => f.status === 'verified');
            setMfaFactorId(totpFactor?.id || null);
            setMfaAssuranceLevel('aal1');
          } else {
            setMfaRequired(false);
            setMfaAssuranceLevel((aalData?.currentLevel as 'aal1' | 'aal2') || 'aal1');
          }

          // Set user object to unblock routing
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            restaurantId: '',
            role: 'owner'
          });
          setIsLoading(false);
          clearTimeout(timeoutId);

          // Asynchronously load profile and restaurants in the background if MFA is satisfied
          if (!needsMfa) {
            await loadUserData(
              session.user.id,
              session.user.email || '',
              session.user.user_metadata?.full_name
            );
            await loadMfaStatus();
          }
        } else if (mounted) {
          setUser(null);
          setProfile(null);
          setActiveRestaurant(null);
          setAllRestaurants([]);
          setMfaRequired(false);
          setMfaFactorId(null);
          setMfaFactors([]);
          setMfaAssuranceLevel(null);
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
      } catch (err) {
        console.error('[Auth] Initialization error:', err);
        if (mounted) setIsLoading(false);
        clearTimeout(timeoutId);
      }
    }

    initSession();

    // Listen for auth state changes (sign in, sign out, token refresh)
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (session?.user) {
            setUser(prev => ({
              id: session.user.id,
              email: session.user.email || '',
              fullName: session.user.user_metadata?.full_name || prev?.fullName || session.user.email?.split('@')[0] || 'User',
              restaurantId: prev?.restaurantId || '',
              role: prev?.role || 'owner'
            }));
            setIsLoading(false);

            setTimeout(() => {
              if (mounted) {
                loadUserData(
                  session.user.id,
                  session.user.email || '',
                  session.user.user_metadata?.full_name
                ).catch(err => console.warn('[Auth] Background load error:', err));
                loadMfaStatus().catch(() => { });
              }
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setActiveRestaurant(null);
          setAllRestaurants([]);
          setMfaRequired(false);
          setMfaFactorId(null);
          setMfaFactors([]);
          setMfaAssuranceLevel(null);
          setIsLoading(false);
          localStorage.removeItem(ACTIVE_REST_KEY);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [loadUserData, loadMfaStatus]);

  // Real Supabase Login with Remember Me & MFA check
  const login = async (
    email: string,
    password?: string,
    rememberMe?: boolean
  ): Promise<{ success: boolean; mfaRequired: boolean }> => {
    // 1. Configure Remember Me storage preference
    setRememberMePreference(rememberMe ?? true);

    if (!isSupabaseConfigured) {
      // Local development test fallback
      const mockUser: User = {
        id: `usr_${Date.now()}`,
        email,
        fullName: email.split('@')[0],
        restaurantId: 'rest_marrakech_01',
        role: 'owner'
      };
      db.setCurrentUser(mockUser);
      setUser(mockUser);
      setAllRestaurants(db.getRestaurants());
      setActiveRestaurant(db.getRestaurants()[0] || null);
      setIsDemoMode(true);
      return { success: true, mfaRequired: false };
    }

    if (!password) {
      throw new Error('Password is required.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      console.error('[Auth] Login error:', error.message);
      throw error;
    }

    if (data.user) {
      // Check if user has enrolled second factor (MFA/2FA)
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData && aalData.nextLevel === 'aal2' && aalData.currentLevel !== 'aal2') {
        const { data: factorsData } = await supabase.auth.mfa.listFactors();
        const totpFactor = (factorsData?.totp || []).find(f => f.status === 'verified');

        setMfaRequired(true);
        setMfaFactorId(totpFactor?.id || null);
        setMfaAssuranceLevel('aal1');
        return { success: true, mfaRequired: true };
      }

      setMfaRequired(false);
      setMfaFactorId(null);
      setMfaAssuranceLevel('aal2');

      await loadUserData(
        data.user.id,
        data.user.email || '',
        data.user.user_metadata?.full_name
      );
      await loadMfaStatus();
      return { success: true, mfaRequired: false };
    }

    return { success: false, mfaRequired: false };
  };

  // Verify TOTP MFA Challenge during Sign-In
  const verifyMfaChallenge = async (code: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      setMfaRequired(false);
      return true;
    }

    let factorId = mfaFactorId;
    if (!factorId) {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactor = (factorsData?.totp || []).find(f => f.status === 'verified');
      factorId = totpFactor?.id || null;
    }

    if (!factorId) {
      throw new Error('No enrolled TOTP factor found for this account.');
    }

    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: code.trim()
    });

    if (error) {
      console.error('[Auth] MFA challenge verification failed:', error.message);
      throw error;
    }

    setMfaRequired(false);
    setMfaAssuranceLevel('aal2');

    const currentUser = (await supabase.auth.getUser()).data.user;
    if (currentUser) {
      await loadUserData(
        currentUser.id,
        currentUser.email || '',
        currentUser.user_metadata?.full_name
      );
      await loadMfaStatus();
    }
    return true;
  };

  // Enroll new TOTP Factor
  const enrollMfa = async (): Promise<MfaEnrollmentResult> => {
    if (!isSupabaseConfigured) {
      return {
        id: 'mock_factor_id',
        qrCode: '',
        secret: 'MOCKSECRETJBSWY3DPEHPK3PXP',
        uri: 'otpauth://totp/SOFRAFLOW:demo@sofraflow.com?secret=MOCKSECRETJBSWY3DPEHPK3PXP&issuer=SOFRAFLOW'
      };
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'SOFRAFLOW'
    });

    if (error) {
      console.error('[Auth] MFA enroll error:', error.message);
      throw error;
    }

    let qrCodeDataUrl = data.totp.qr_code || '';
    if (data.totp.uri) {
      try {
        qrCodeDataUrl = await QRCode.toDataURL(data.totp.uri, {
          width: 250,
          margin: 2,
          color: {
            dark: '#153E35',
            light: '#FFFFFF'
          }
        });
      } catch (qrErr) {
        console.warn('[Auth] QR code toDataURL generation notice:', qrErr);
      }
    }

    return {
      id: data.id,
      qrCode: qrCodeDataUrl,
      secret: data.totp.secret,
      uri: data.totp.uri
    };
  };

  // Verify and activate newly enrolled factor
  const verifyMfaEnrollment = async (factorId: string, code: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      setMfaFactors([{ id: factorId, factor_type: 'totp', status: 'verified', friendly_name: 'Authenticator App' }]);
      return true;
    }

    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: code.trim()
    });

    if (error) {
      console.error('[Auth] Verify MFA enrollment error:', error.message);
      throw error;
    }

    await loadMfaStatus();
    return true;
  };

  // Unenroll TOTP Factor
  const unenrollMfa = async (factorId: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      setMfaFactors([]);
      return true;
    }

    const { error } = await supabase.auth.mfa.unenroll({
      factorId
    });

    if (error) {
      console.error('[Auth] MFA unenroll error:', error.message);
      throw error;
    }

    await loadMfaStatus();
    return true;
  };

  // Real Supabase Sign-Up with Email & Password
  const registerWithEmail = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ user: any; needsEmailConfirmation: boolean }> => {
    if (!isSupabaseConfigured) {
      const mockUser: User = {
        id: `usr_${Date.now()}`,
        email,
        fullName,
        restaurantId: '',
        role: 'owner'
      };
      setUser(mockUser);
      return { user: mockUser, needsEmailConfirmation: false };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim()
        },
        emailRedirectTo: `${window.location.origin}/app/overview`
      }
    });

    if (error) {
      console.error('[Auth] Registration error:', error.message);
      throw error;
    }

    const needsEmailConfirmation = !data.session && Boolean(data.user);

    if (data.user && data.session) {
      await loadUserData(data.user.id, data.user.email || '', fullName);
    }

    return {
      user: data.user,
      needsEmailConfirmation
    };
  };

  // Full signup workflow with business creation
  const signup = async (params: {
    restaurantName: string;
    slug: string;
    email: string;
    fullName: string;
    phone?: string;
    password?: string;
  }): Promise<Restaurant | null> => {
    if (!isSupabaseConfigured) {
      const newRest = db.createRestaurant({
        name: params.restaurantName,
        slug: params.slug,
        phone: params.phone || '+212600000000',
        description: `Welcome to ${params.restaurantName}.`
      });
      const mockUser: User = {
        id: `usr_${Date.now()}`,
        email: params.email,
        fullName: params.fullName,
        restaurantId: newRest.id,
        role: 'owner'
      };
      db.setCurrentUser(mockUser);
      setUser(mockUser);
      setAllRestaurants([newRest]);
      setActiveRestaurant(newRest);
      return newRest;
    }

    let currentAuthUser = (await supabase.auth.getUser()).data.user;

    if (!currentAuthUser && params.password) {
      const { user: newUser } = await registerWithEmail(
        params.email,
        params.password,
        params.fullName
      );
      currentAuthUser = newUser;
    }

    if (!currentAuthUser) {
      throw new Error('User authentication required before creating business.');
    }

    const created = await supabaseService.createRestaurant(currentAuthUser.id, {
      name: params.restaurantName,
      slug: params.slug,
      phone: params.phone,
      city: 'Casablanca'
    });

    if (created) {
      await loadUserData(currentAuthUser.id, currentAuthUser.email || '', params.fullName);
    }

    return created;
  };

  // Create additional business with full attributes and resilient fallback
  const createBusiness = async (params: {
    name: string;
    slug: string;
    businessType?: string;
    phone?: string;
    city?: string;
    address?: string;
    description?: string;
    contactEmail?: string;
  }): Promise<Restaurant | null> => {
    if (!user) throw new Error('Authentication required.');

    let created: Restaurant | null = null;
    let remoteError: string | null = null;

    if (isSupabaseConfigured) {
      try {
        created = await supabaseService.createRestaurant(user.id, params);
      } catch (err: any) {
        remoteError = err?.message || 'Database error';
        console.warn('[AuthContext] Supabase createRestaurant note:', remoteError);
      }
    }

    if (created) {
      try {
        const freshList = await supabaseService.getRestaurantsForOwner(user.id);
        const finalList = freshList.length > 0 ? freshList : [created];
        setAllRestaurants(finalList);
      } catch {
        setAllRestaurants([created]);
      }
      setActiveRestaurant(created);
      localStorage.setItem(ACTIVE_REST_KEY, created.id);
      setUser(prev => (prev ? { ...prev, restaurantId: created!.id } : null));

      // Mirror to local storage for offline resilience
      try {
        db.createRestaurant(created);
      } catch { }

      return created;
    }

    // Fallback: If remote creation threw or is not configured (e.g. table not yet in schema cache)
    const localCreated = db.createRestaurant({
      name: params.name,
      slug: params.slug,
      businessType: (params.businessType as any) || 'restaurant',
      phone: params.phone || '+212600000000',
      city: params.city || 'Casablanca',
      address: params.address || 'Morocco',
      description: params.description || `Welcome to ${params.name}.`
    });

    const updatedList = db.getRestaurants();
    setAllRestaurants(updatedList);
    setActiveRestaurant(localCreated);
    localStorage.setItem(ACTIVE_REST_KEY, localCreated.id);
    setUser(prev => (prev ? { ...prev, restaurantId: localCreated.id } : null));

    if (remoteError) {
      console.warn(`[AuthContext] Saved restaurant locally (${localCreated.id}). Remote message: ${remoteError}`);
    }

    return localCreated;
  };

  // Real Supabase Logout
  const logout = async (): Promise<void> => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('[Auth] Logout error:', err);
    } finally {
      db.setCurrentUser(null);
      setUser(null);
      setProfile(null);
      setActiveRestaurant(null);
      setAllRestaurants([]);
      setMfaRequired(false);
      setMfaFactorId(null);
      setMfaFactors([]);
      setMfaAssuranceLevel(null);
      localStorage.removeItem(ACTIVE_REST_KEY);
    }
  };

  // Switch Active Business
  const switchRestaurant = (restaurantId: string) => {
    const matched = allRestaurants.find(r => r.id === restaurantId);
    if (matched) {
      setActiveRestaurant(matched);
      localStorage.setItem(ACTIVE_REST_KEY, matched.id);
      if (user) {
        setUser({ ...user, restaurantId: matched.id });
      }
    }
  };

  // Password Recovery via Email
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return { success: true };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Recovery request failed.' };
    }
  };

  // Update Password
  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return { success: true };
    }
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Password update failed.' };
    }
  };

  // Update User Profile (Full Name and Phone)
  const updateUserProfile = async (updates: {
    fullName: string;
    phone?: string;
    preferredLanguage?: 'en' | 'fr';
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const trimmedName = updates.fullName?.trim() || '';
      if (!trimmedName || trimmedName.length < 2) {
        return {
          success: false,
          error: 'Le nom complet doit comporter au moins 2 caractères.'
        };
      }

      if (isSupabaseConfigured) {
        // ALWAYS use the authenticated user ID directly from Supabase Auth
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr || !authData?.user) {
          return {
            success: false,
            error: 'Session expirée. Veuillez vous reconnecter.'
          };
        }

        const verifiedUserId = authData.user.id;
        const cleanPhone = updates.phone?.trim() || '';

        // 1. Update public.profiles table
        await supabaseService.updateProfile(verifiedUserId, {
          fullName: trimmedName,
          phone: cleanPhone,
          preferredLanguage: updates.preferredLanguage
        });

        // 2. Synchronize Supabase Auth user metadata
        await supabase.auth.updateUser({
          data: {
            full_name: trimmedName,
            name: trimmedName,
            phone: cleanPhone
          }
        });

        // 3. Refresh in-memory state
        const freshProfile = await supabaseService.getProfile(verifiedUserId);
        if (freshProfile) {
          setProfile(freshProfile);
        }

        setUser(prev =>
          prev
            ? {
              ...prev,
              fullName: trimmedName,
              phone: cleanPhone,
              preferredLanguage: (updates.preferredLanguage as any) || prev.preferredLanguage
            }
            : null
        );
      } else {
        // Mock / Offline mode
        const updated = db.updateUserProfile({
          fullName: trimmedName,
          phone: updates.phone?.trim(),
          preferredLanguage: updates.preferredLanguage
        });
        if (updated) {
          setUser(updated);
          setProfile({
            id: updated.id,
            fullName: updated.fullName,
            phone: updated.phone,
            role: updated.role,
            preferredLanguage: updated.preferredLanguage || 'fr'
          });
        }
      }

      return { success: true };
    } catch (err: any) {
      console.error('[AuthContext] updateUserProfile error:', err);
      return {
        success: false,
        error: err?.message || 'Échec de la mise à jour du profil.'
      };
    }
  };

  // Change Password with Secure Supabase Auth Current Password Verification
  const changePasswordWithVerification = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!currentPassword) {
        return {
          success: false,
          error: 'Veuillez saisir votre mot de passe actuel.'
        };
      }

      if (!newPassword || newPassword.length < 8) {
        return {
          success: false,
          error: 'Le nouveau mot de passe doit comporter au moins 8 caractères.'
        };
      }

      const hasUpper = /[A-Z]/.test(newPassword);
      const hasLower = /[a-z]/.test(newPassword);
      const hasNum = /[0-9]/.test(newPassword);
      const hasSym = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

      if (!hasUpper || !hasLower || !hasNum || !hasSym) {
        return {
          success: false,
          error:
            'Le nouveau mot de passe doit comporter au moins une majuscule, une minuscule, un chiffre et un caractère spécial.'
        };
      }

      if (currentPassword === newPassword) {
        return {
          success: false,
          error: 'Le nouveau mot de passe ne peut pas être identique à votre mot de passe actuel.'
        };
      }

      if (isSupabaseConfigured) {
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr || !authData?.user || !authData.user.email) {
          return {
            success: false,
            error: 'Session expirée. Veuillez vous reconnecter.'
          };
        }

        // STEP 1: Verify current password securely through Supabase Auth
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: authData.user.email,
          password: currentPassword
        });

        if (signInErr) {
          return {
            success: false,
            error: 'Le mot de passe actuel est incorrect. Veuillez vérifier votre saisie.'
          };
        }

        // STEP 2: Update password using authenticated session
        const { error: updateErr } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (updateErr) {
          return {
            success: false,
            error: updateErr.message
          };
        }
      }

      return { success: true };
    } catch (err: any) {
      console.error('[AuthContext] changePasswordWithVerification error:', err);
      return {
        success: false,
        error: err?.message || 'Échec de la mise à jour du mot de passe.'
      };
    }
  };

  // Reload profile on demand
  const reloadProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user) return null;
    if (isSupabaseConfigured) {
      const fresh = await supabaseService.getProfile(user.id);
      if (fresh) {
        setProfile(fresh);
        setUser(prev =>
          prev
            ? {
              ...prev,
              fullName: fresh.fullName || prev.fullName,
              phone: fresh.phone || prev.phone,
              role: fresh.role || prev.role,
              preferredLanguage: (fresh.preferredLanguage as any) || prev.preferredLanguage
            }
            : null
        );
      }
      return fresh;
    } else {
      const local = db.getCurrentUser();
      if (local) {
        const prof: UserProfile = {
          id: local.id,
          fullName: local.fullName,
          phone: local.phone,
          role: local.role,
          preferredLanguage: local.preferredLanguage || 'fr'
        };
        setProfile(prof);
        setUser(local);
        return prof;
      }
      return null;
    }
  }, [user]);

  // Force Refresh
  const refreshState = async () => {
    if (!isSupabaseConfigured) {
      const currentUser = db.getCurrentUser();
      setUser(currentUser);
      const rests = db.getRestaurants();
      setAllRestaurants(rests);
      setActiveRestaurant(rests[0] || null);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await loadUserData(
        session.user.id,
        session.user.email || '',
        session.user.user_metadata?.full_name
      );
      await loadMfaStatus();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        activeRestaurant,
        allRestaurants,
        isAuthenticated: !!user && !mfaRequired,
        isLoading,
        isDemoMode,
        mfaRequired,
        mfaFactorId,
        mfaFactors,
        mfaAssuranceLevel,
        login,
        verifyMfaChallenge,
        enrollMfa,
        verifyMfaEnrollment,
        unenrollMfa,
        loadMfaStatus,
        signup,
        registerWithEmail,
        logout,
        resetPassword,
        updatePassword,
        updateUserProfile,
        changePasswordWithVerification,
        reloadProfile,
        switchRestaurant,
        createBusiness,
        refreshState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
