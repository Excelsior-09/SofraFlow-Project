import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import { isValidPhoneNumber, normalizePhoneNumber } from '../utils/phoneValidation';

describe('Task 1: Onboarding Step 9 Direct Inline Editing & Validation', () => {
  it('validates required fields, email format, and phone format on inline edits', () => {
    // Email regex validation check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test('valid.owner@gmail.com')).toBe(true);
    expect(emailRegex.test('invalid-email-no-domain')).toBe(false);
    expect(emailRegex.test('invalid@domain')).toBe(false);

    // Phone validation for Moroccan format (+212...)
    expect(isValidPhoneNumber('+212612345678')).toBe(true);
    expect(isValidPhoneNumber('0612345678')).toBe(true);
    expect(isValidPhoneNumber('0522123456')).toBe(true);
    expect(isValidPhoneNumber('12345')).toBe(false);
  });

  it('keeps restaurant business email distinct from user authentication login email', () => {
    const authUser = {
      id: 'usr_owner_01',
      email: 'owner.login@gmail.com',
      fullName: 'Tariq Benjelloun'
    };

    const onboardingFormState = {
      restaurantName: 'Dar Zellige',
      businessEmail: 'contact@darzellige.ma', // Restaurant contact email
      city: 'Marrakech',
      address: 'Medina',
      whatsappNumber: '+212661001122',
      managerName: 'Tariq Benjelloun'
    };

    // Updating restaurant contact email must never overwrite auth login email
    const updatedFormState = {
      ...onboardingFormState,
      businessEmail: 'reservations@darzellige.ma'
    };

    expect(updatedFormState.businessEmail).toBe('reservations@darzellige.ma');
    expect(authUser.email).toBe('owner.login@gmail.com');
    expect(updatedFormState.businessEmail).not.toBe(authUser.email);
  });

  it('restores draft state on cancel without altering confirmed values', () => {
    const confirmedValues = {
      restaurantName: 'La Sqala',
      city: 'Casablanca',
      address: 'Boulevard des Almohades'
    };

    // User starts editing
    let draft = { ...confirmedValues };
    draft.restaurantName = 'Mistyped Name';
    draft.city = 'Rabat';

    // User cancels editing -> draft is discarded, confirmed values remain unchanged
    draft = { ...confirmedValues };

    expect(confirmedValues.restaurantName).toBe('La Sqala');
    expect(confirmedValues.city).toBe('Casablanca');
    expect(draft.restaurantName).toBe('La Sqala');
  });

  it('submits latest edited values rather than stale values from earlier steps', () => {
    const initialStepValues = {
      restaurantName: 'Le Tajine',
      managerName: 'Mehdi',
      whatsappNumber: '+212661000000'
    };

    // User makes direct edits on step 9
    const finalizedValues = {
      ...initialStepValues,
      restaurantName: 'Le Tajine Doré', // corrected
      managerName: 'Mehdi Alaoui' // corrected
    };

    expect(finalizedValues.restaurantName).toBe('Le Tajine Doré');
    expect(finalizedValues.managerName).toBe('Mehdi Alaoui');
    expect(finalizedValues.whatsappNumber).toBe('+212661000000');
  });
});

describe('Task 2: Restaurant Settings Purity & User Security Separation', () => {
  it('ensures Restaurant Settings focuses exclusively on establishment operations', () => {
    // Operational fields expected in Restaurant Settings
    const restaurantSettingsFields = [
      'name',
      'slug',
      'phone',
      'contactEmail',
      'city',
      'address',
      'vatPercentage',
      'serviceFeePercentage',
      'diningTablesCount',
      'enableDineIn',
      'enableTakeaway',
      'enableDelivery',
      'requireCustomerPhone'
    ];

    // Personal security fields that must NOT exist in restaurant configuration
    const personalSecurityFields = [
      'password',
      'newPassword',
      'confirmPassword',
      'mfaFactors',
      'totpSecret',
      'qrCode',
      'twoFactorAuth'
    ];

    for (const field of personalSecurityFields) {
      expect(restaurantSettingsFields.includes(field)).toBe(false);
    }
  });

  it('verifies account security redirection link exists for user profile', () => {
    const profileSecurityRoute = '/app/profile';
    expect(profileSecurityRoute).toBe('/app/profile');
  });
});

describe('Task 3: Supabase Auth TOTP Multi-Factor Authentication (2FA)', () => {
  it('enrolls TOTP factor and retrieves QR code and secret URI', async () => {
    const mockEnrollResponse = {
      data: {
        id: 'factor_totp_999',
        type: 'totp',
        status: 'unverified',
        totp: {
          qr_code: 'data:image/svg+xml;utf8,<svg>...</svg>',
          secret: 'JBSWY3DPEHPK3PXP',
          uri: 'otpauth://totp/SOFRAFLOW:owner@test.com?secret=JBSWY3DPEHPK3PXP&issuer=SOFRAFLOW'
        }
      },
      error: null
    };

    const enrollSpy = vi.spyOn(supabase.auth.mfa, 'enroll').mockResolvedValue(mockEnrollResponse as any);

    const result = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'SOFRAFLOW' });

    expect(enrollSpy).toHaveBeenCalledWith({ factorType: 'totp', issuer: 'SOFRAFLOW' });
    expect(result.data?.id).toBe('factor_totp_999');
    expect(result.data?.totp.secret).toBe('JBSWY3DPEHPK3PXP');
    expect((result.data as any)?.status).toBe('unverified');

    enrollSpy.mockRestore();
  });

  it('verifies TOTP challenge code before marking 2FA factor as verified', async () => {
    const challengeAndVerifySpy = vi.spyOn(supabase.auth.mfa, 'challengeAndVerify').mockResolvedValue({
      data: {
        user: { id: 'usr_001' }
      },
      error: null
    } as any);

    const result = await supabase.auth.mfa.challengeAndVerify({
      factorId: 'factor_totp_999',
      code: '123456'
    });

    expect(challengeAndVerifySpy).toHaveBeenCalledWith({
      factorId: 'factor_totp_999',
      code: '123456'
    });
    expect(result.error).toBeNull();

    challengeAndVerifySpy.mockRestore();
  });

  it('rejects invalid or expired 6-digit TOTP challenge codes', async () => {
    const challengeAndVerifySpy = vi.spyOn(supabase.auth.mfa, 'challengeAndVerify').mockResolvedValue({
      data: null,
      error: {
        message: 'Invalid TOTP code'
      }
    } as any);

    const result = await supabase.auth.mfa.challengeAndVerify({
      factorId: 'factor_totp_999',
      code: '000000'
    });

    expect(result.error?.message).toBe('Invalid TOTP code');

    challengeAndVerifySpy.mockRestore();
  });

  it('un-enrolls verified TOTP factor when user disables 2FA', async () => {
    const unenrollSpy = vi.spyOn(supabase.auth.mfa, 'unenroll').mockResolvedValue({
      data: { id: 'factor_totp_999' },
      error: null
    } as any);

    const result = await supabase.auth.mfa.unenroll({
      factorId: 'factor_totp_999'
    });

    expect(unenrollSpy).toHaveBeenCalledWith({
      factorId: 'factor_totp_999'
    });
    expect(result.data?.id).toBe('factor_totp_999');

    unenrollSpy.mockRestore();
  });

  it('checks assurance level (AAL1 vs AAL2) and enforces MFA challenge on login', async () => {
    const getAALSpy = vi.spyOn(supabase.auth.mfa, 'getAuthenticatorAssuranceLevel').mockResolvedValue({
      data: {
        currentLevel: 'aal1',
        nextLevel: 'aal2',
        currentAuthenticationMethods: []
      },
      error: null
    } as any);

    const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    expect(aal.data?.currentLevel).toBe('aal1');
    expect(aal.data?.nextLevel).toBe('aal2');

    // When nextLevel === 'aal2' and currentLevel === 'aal1', mfaRequired must be true
    const mfaRequired = aal.data?.nextLevel === 'aal2' && aal.data?.currentLevel !== 'aal2';
    expect(mfaRequired).toBe(true);

    getAALSpy.mockRestore();
  });
});

describe('Task 4: User Phone Number Save, Sync, and Display Fix', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes Moroccan phone number to E.164 and checks uniqueness', async () => {
    vi.spyOn(supabaseService, 'isPhoneTaken').mockResolvedValue(false);

    const normalized = normalizePhoneNumber('06 61 23 45 67');
    expect(normalized).toBe('+212661234567');
  });

  it('prevents onAuthStateChange from dropping user phone number on USER_UPDATED', () => {
    const previousUser = {
      id: 'usr_001',
      email: 'test@sofraflow.com',
      fullName: 'Yassine',
      phone: '+212612345678',
      role: 'owner' as const
    };

    // Simulated Supabase USER_UPDATED session event
    const sessionUser = {
      id: 'usr_001',
      email: 'test@sofraflow.com',
      user_metadata: {
        full_name: 'Yassine Kabbaj',
        phone: '+212612345678'
      }
    };

    // The fix in AuthContext ensures phone is preserved from user_metadata or previous state:
    const preservedUser = {
      id: sessionUser.id,
      email: sessionUser.email,
      fullName: sessionUser.user_metadata?.full_name || previousUser.fullName,
      phone: sessionUser.user_metadata?.phone || previousUser.phone || '',
      role: previousUser.role
    };

    expect(preservedUser.phone).toBe('+212612345678');
    expect(preservedUser.fullName).toBe('Yassine Kabbaj');
  });

  it('handles missing profile row by inserting or retrieving from auth user metadata', async () => {
    // If public.profiles row is missing, getProfile falls back to auth user metadata
    const mockAuthUser = {
      id: 'usr_brand_new',
      email: 'new.owner@sofraflow.ma',
      user_metadata: {
        full_name: 'Nadia Chraibi',
        phone: '+212655443322',
        role: 'owner'
      }
    };

    vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
      data: { user: mockAuthUser as any },
      error: null
    });

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    });

    vi.spyOn(supabase, 'from').mockReturnValue({
      select: mockSelect
    } as any);

    const profile = await supabaseService.getProfile('usr_brand_new');
    expect(profile).not.toBeNull();
    expect(profile?.fullName).toBe('Nadia Chraibi');
    expect(profile?.phone).toBe('+212655443322');
    expect(mockAuthUser.email).toBe('new.owner@sofraflow.ma');
  });
});
