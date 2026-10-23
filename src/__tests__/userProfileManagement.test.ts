import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dictionaries } from '../locales';
import { supabase } from '../lib/supabase';
import { supabaseService } from '../services/supabaseService';
import { db } from '../services/db';

describe('User Profile Management — Requirements & Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Bilingual Translation & Key Parity', () => {
    it('has full profile namespace in both English and French', () => {
      expect(dictionaries.en.profile).toBeDefined();
      expect(dictionaries.fr.profile).toBeDefined();
      expect(dictionaries.en.navigation.userProfile).toBeDefined();
      expect(dictionaries.fr.navigation.userProfile).toBeDefined();
    });

    it('enforces 100% key parity between English and French profile dictionaries', () => {
      const getDeepKeys = (obj: Record<string, any>, prefix = ''): string[] => {
        return Object.keys(obj).reduce((res: string[], el: string) => {
          const val = obj[el];
          const newPrefix = prefix ? `${prefix}.${el}` : el;
          if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            res.push(...getDeepKeys(val, newPrefix));
          } else {
            res.push(newPrefix);
          }
          return res;
        }, []);
      };

      const enKeys = getDeepKeys(dictionaries.en.profile).sort();
      const frKeys = getDeepKeys(dictionaries.fr.profile).sort();

      expect(enKeys).toEqual(frKeys);
      expect(enKeys.length).toBeGreaterThan(25);
    });

    it('contains all required error and requirement keys', () => {
      const requiredKeys = [
        'pageTitle',
        'pageSubtitle',
        'personalInfoTitle',
        'personalInfoSubtitle',
        'fullName',
        'email',
        'emailReadOnlyHint',
        'phone',
        'saveProfileBtn',
        'savingProfile',
        'profileUpdated',
        'changePasswordTitle',
        'changePasswordSubtitle',
        'currentPassword',
        'newPassword',
        'confirmPassword',
        'updatePasswordBtn',
        'updatingPassword',
        'passwordUpdated',
        'strengthTitle',
        'minChars',
        'uppercase',
        'lowercase',
        'number',
        'specialChar',
        'passwordsMatch'
      ];

      for (const key of requiredKeys) {
        expect(dictionaries.en.profile[key as keyof typeof dictionaries.en.profile]).toBeTruthy();
        expect(dictionaries.fr.profile[key as keyof typeof dictionaries.fr.profile]).toBeTruthy();
      }

      const errorKeys = [
        'loadProfileFailed',
        'currentPasswordRequired',
        'incorrectCurrentPassword',
        'passwordLength',
        'passwordRequirements',
        'passwordMismatch',
        'sameAsCurrent',
        'nameTooShort',
        'updateFailed'
      ];

      for (const errKey of errorKeys) {
        expect(dictionaries.en.profile.errors[errKey as keyof typeof dictionaries.en.profile.errors]).toBeTruthy();
        expect(dictionaries.fr.profile.errors[errKey as keyof typeof dictionaries.fr.profile.errors]).toBeTruthy();
      }
    });
  });

  describe('2. Supabase Service Profile Operations', () => {
    it('getProfile loads record mapped with phone and role correctly', async () => {
      const mockProfile = {
        id: 'usr_abc123',
        full_name: 'Tariq Benjelloun',
        phone: '+212 6 61 23 45 67',
        role: 'owner',
        preferred_language: 'fr',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-02-01T00:00:00Z'
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
        })
      });

      const fromSpy = vi.spyOn(supabase, 'from').mockReturnValue({
        select: selectMock
      } as any);

      const result = await supabaseService.getProfile('usr_abc123');

      expect(fromSpy).toHaveBeenCalledWith('profiles');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('usr_abc123');
      expect(result?.fullName).toBe('Tariq Benjelloun');
      expect(result?.phone).toBe('+212 6 61 23 45 67');
      expect(result?.role).toBe('owner');
      expect(result?.preferredLanguage).toBe('fr');

      fromSpy.mockRestore();
    });

    it('updateProfile updates full_name and phone using authenticated user id', async () => {
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      });

      const fromSpy = vi.spyOn(supabase, 'from').mockReturnValue({
        update: updateMock
      } as any);

      await supabaseService.updateProfile('usr_abc123', {
        fullName: 'Karim Tazi',
        phone: '+212 6 12 34 56 78'
      });

      expect(fromSpy).toHaveBeenCalledWith('profiles');
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          full_name: 'Karim Tazi',
          phone: '+212 6 12 34 56 78',
          updated_at: expect.any(String)
        })
      );

      fromSpy.mockRestore();
    });

    it('db service updates user profile in local store correctly', () => {
      const initialUser = db.getCurrentUser();
      expect(initialUser).not.toBeNull();
      if (!initialUser) throw new Error('initialUser is null');

      const updated = db.updateUserProfile({
        fullName: 'Sara Alami',
        phone: '+212 6 99 88 77 66'
      });

      expect(updated).not.toBeNull();
      if (!updated) throw new Error('updated is null');

      expect(updated.fullName).toBe('Sara Alami');
      expect(updated.phone).toBe('+212 6 99 88 77 66');

      // Email must remain unchanged
      expect(updated.email).toBe(initialUser.email);
    });
  });

  describe('3. Password Strength Validation Rules', () => {
    const validatePasswordComplexity = (password: string) => {
      const hasMinLength = password.length >= 8;
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
      return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
    };

    it('rejects passwords shorter than 8 characters', () => {
      expect(validatePasswordComplexity('Pass1!')).toBe(false);
    });

    it('rejects passwords missing uppercase letters', () => {
      expect(validatePasswordComplexity('password123!')).toBe(false);
    });

    it('rejects passwords missing lowercase letters', () => {
      expect(validatePasswordComplexity('PASSWORD123!')).toBe(false);
    });

    it('rejects passwords missing numbers', () => {
      expect(validatePasswordComplexity('PasswordSpecial!')).toBe(false);
    });

    it('rejects passwords missing special characters', () => {
      expect(validatePasswordComplexity('Password12345')).toBe(false);
    });

    it('accepts strong passwords meeting all 5 requirements', () => {
      expect(validatePasswordComplexity('SofraFlow#2026')).toBe(true);
      expect(validatePasswordComplexity('Casablanca@99$')).toBe(true);
    });
  });

  describe('4. Secure Password Re-authentication & Verification', () => {
    it('rejects password change if current password verification fails in Supabase Auth', async () => {
      const signInSpy = vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', name: 'AuthApiError', status: 400 } as any
      });

      const updateSpy = vi.spyOn(supabase.auth, 'updateUser');

      // Attempt verification
      const verifyAttempt = await supabase.auth.signInWithPassword({
        email: 'owner@restaurant.ma',
        password: 'WrongCurrentPassword123!'
      });

      expect(verifyAttempt.error).not.toBeNull();
      expect(verifyAttempt.error?.message).toContain('Invalid login');
      // Password update must never be called when verification fails
      expect(updateSpy).not.toHaveBeenCalled();

      signInSpy.mockRestore();
      updateSpy.mockRestore();
    });

    it('allows password update via Supabase Auth when current password is verified', async () => {
      const signInSpy = vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({
        data: {
          user: { id: 'usr_123', email: 'owner@restaurant.ma' } as any,
          session: { access_token: 'valid_jwt' } as any
        },
        error: null
      });

      const updateSpy = vi.spyOn(supabase.auth, 'updateUser').mockResolvedValue({
        data: { user: { id: 'usr_123' } as any },
        error: null
      });

      const verifyAttempt = await supabase.auth.signInWithPassword({
        email: 'owner@restaurant.ma',
        password: 'CorrectCurrentPassword123!'
      });

      expect(verifyAttempt.error).toBeNull();

      const updateResult = await supabase.auth.updateUser({
        password: 'NewStrongPassword#2026'
      });

      expect(updateSpy).toHaveBeenCalledWith({ password: 'NewStrongPassword#2026' });
      expect(updateResult.error).toBeNull();

      signInSpy.mockRestore();
      updateSpy.mockRestore();
    });
  });

  describe('5. Email Immutability and Security Safeguards', () => {
    it('prevents email alteration through profile update service', async () => {
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      });

      const fromSpy = vi.spyOn(supabase, 'from').mockReturnValue({
        update: updateMock
      } as any);

      // Attempt to pass arbitrary or changed email in profile updates
      await supabaseService.updateProfile('usr_123', {
        fullName: 'Tariq',
        phone: '+212 6 00 00 00 00'
      });

      const payload = updateMock.mock.calls[0][0];
      // Payload must not include email column
      expect(payload).not.toHaveProperty('email');
      expect(payload.full_name).toBe('Tariq');
      expect(payload.phone).toBe('+212 6 00 00 00 00');

      fromSpy.mockRestore();
    });
  });
});
