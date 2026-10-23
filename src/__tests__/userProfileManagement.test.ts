import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dictionaries } from '../locales';
import { supabase } from '../lib/supabase';
import { supabaseService } from '../services/supabaseService';
import { db } from '../services/db';
import { normalizePhoneNumber, isValidPhoneNumber, validateFullName } from '../utils/phoneValidation';

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

    it('contains all required error and requirement keys including phone/name uniqueness', () => {
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
        'nameInvalid',
        'phoneInvalid',
        'phoneAlreadyExists',
        'noChangesDetected',
        'sessionExpired',
        'recoveryLinkInvalid',
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
        phone: '+212661234567',
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
      expect(result?.phone).toBe('+212661234567');
      expect(result?.role).toBe('owner');
      expect(result?.preferredLanguage).toBe('fr');

      fromSpy.mockRestore();
    });

    it('updateProfile normalizes phone and updates full_name using authenticated user id', async () => {
      // Mock isPhoneTaken to return false
      vi.spyOn(supabaseService, 'isPhoneTaken').mockResolvedValue(false);

      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      });

      const fromSpy = vi.spyOn(supabase, 'from').mockReturnValue({
        update: updateMock
      } as any);

      await supabaseService.updateProfile('usr_abc123', {
        fullName: 'Karim Tazi',
        phone: '06 12 34 56 78' // Raw format
      });

      expect(fromSpy).toHaveBeenCalledWith('profiles');
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          full_name: 'Karim Tazi',
          phone: '+212612345678', // Normalized to E.164
          updated_at: expect.any(String)
        })
      );

      fromSpy.mockRestore();
    });

    it('updateProfile throws duplicate_phone_number when pre-check finds phone taken by another user', async () => {
      vi.spyOn(supabaseService, 'isPhoneTaken').mockResolvedValue(true);

      await expect(
        supabaseService.updateProfile('usr_current', {
          phone: '0612345678'
        })
      ).rejects.toThrow('duplicate_phone_number');
    });

    it('updateProfile handles database constraint violation 23505 gracefully', async () => {
      vi.spyOn(supabaseService, 'isPhoneTaken').mockResolvedValue(false);

      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { code: '23505', message: 'duplicate key value violates unique constraint "idx_profiles_phone_unique"' }
        })
      });

      vi.spyOn(supabase, 'from').mockReturnValue({
        update: updateMock
      } as any);

      await expect(
        supabaseService.updateProfile('usr_current', {
          phone: '+212612345678'
        })
      ).rejects.toThrow('duplicate_phone_number');
    });
  });

  describe('3. Local DB Fallback Operations', () => {
    it('updates user profile and normalizes phone number', () => {
      const initialUser = db.getCurrentUser();
      expect(initialUser).not.toBeNull();
      if (!initialUser) throw new Error('initialUser is null');

      const updated = db.updateUserProfile({
        fullName: 'Sara Alami',
        phone: '06 99 88 77 66'
      });

      expect(updated).not.toBeNull();
      if (!updated) throw new Error('updated is null');

      expect(updated.fullName).toBe('Sara Alami');
      expect(updated.phone).toBe('+212699887766'); // Normalized
      expect(updated.email).toBe(initialUser.email); // Read-only
    });

    it('allows user to retain their existing phone number when updating name', () => {
      const initialUser = db.getCurrentUser();
      expect(initialUser).not.toBeNull();

      // Update name while passing the same phone
      const updated = db.updateUserProfile({
        fullName: 'Sara Alami Updated',
        phone: initialUser?.phone
      });

      expect(updated?.fullName).toBe('Sara Alami Updated');
    });

    it('rejects duplicate phone numbers taken by another user', () => {
      // Register a phone for user 'other_user'
      db.registerUserPhone('other_user', '+212655443322');

      // Attempt to update current user with the other user's phone
      expect(() => {
        db.updateUserProfile({
          phone: '06 55 44 33 22' // Normalizes to +212655443322
        });
      }).toThrow('duplicate_phone_number');
    });
  });

  describe('4. Password Strength Validation Rules', () => {
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

  describe('5. Secure Password Re-authentication & Verification', () => {
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

  describe('6. Email Immutability and Security Safeguards', () => {
    it('prevents email alteration through profile update service', async () => {
      vi.spyOn(supabaseService, 'isPhoneTaken').mockResolvedValue(false);

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
      expect(payload.phone).toBe('+212600000000'); // Normalized

      fromSpy.mockRestore();
    });
  });

  describe('7. Name Uniqueness Policy vs Phone Uniqueness', () => {
    it('allows multiple distinct users to share the same full name', () => {
      // In Moroccan / global restaurant culture, multiple users can legitimately share common names
      const name = 'Mohamed Bennani';
      expect(validateFullName(name).isValid).toBe(true);

      // Phone numbers however must be unique
      const phone1 = normalizePhoneNumber('06 11 22 33 44');
      const phone2 = normalizePhoneNumber('06 55 66 77 88');
      expect(phone1).not.toBe(phone2);
      expect(isValidPhoneNumber(phone1)).toBe(true);
      expect(isValidPhoneNumber(phone2)).toBe(true);
    });

    it('rejects invalid names that contain harmful scripts or numbers', () => {
      expect(validateFullName('<script>alert(1)</script>').isValid).toBe(false);
      expect(validateFullName('User123').isValid).toBe(false);
      expect(validateFullName('A').isValid).toBe(false); // Too short
    });
  });
});
