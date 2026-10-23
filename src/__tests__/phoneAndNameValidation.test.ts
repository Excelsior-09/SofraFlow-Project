import { describe, it, expect } from 'vitest';
import {
  normalizePhoneNumber,
  isValidPhoneNumber,
  formatPhoneNumberDisplay,
  validateFullName
} from '../utils/phoneValidation';

describe('Phone Number Normalization & Validation', () => {
  it('normalizes Moroccan local mobile formats (06 and 07) to E.164 +212', () => {
    expect(normalizePhoneNumber('06 12 34 56 78')).toBe('+212612345678');
    expect(normalizePhoneNumber('06-12-34-56-78')).toBe('+212612345678');
    expect(normalizePhoneNumber('06.12.34.56.78')).toBe('+212612345678');
    expect(normalizePhoneNumber('0612345678')).toBe('+212612345678');
    expect(normalizePhoneNumber('07 00 11 22 33')).toBe('+212700112233');
    expect(normalizePhoneNumber('0700112233')).toBe('+212700112233');
  });

  it('normalizes Moroccan local landline formats (05) to E.164 +212', () => {
    expect(normalizePhoneNumber('05 22 33 44 55')).toBe('+212522334455');
    expect(normalizePhoneNumber('0522334455')).toBe('+212522334455');
  });

  it('normalizes international prefixes for Morocco (+212, 00212, 212)', () => {
    expect(normalizePhoneNumber('+212 6 12 34 56 78')).toBe('+212612345678');
    expect(normalizePhoneNumber('00212 6 12 34 56 78')).toBe('+212612345678');
    expect(normalizePhoneNumber('212612345678')).toBe('+212612345678');
    expect(normalizePhoneNumber('+212612345678')).toBe('+212612345678');
  });

  it('normalizes foreign international numbers preserving E.164 format', () => {
    expect(normalizePhoneNumber('+33 6 12 34 56 78')).toBe('+33612345678');
    expect(normalizePhoneNumber('0033 6 12 34 56 78')).toBe('+33612345678');
    expect(normalizePhoneNumber('+1 (415) 555-2671')).toBe('+14155552671');
    expect(normalizePhoneNumber('+44 7911 123456')).toBe('+447911123456');
  });

  it('validates correct Moroccan phone numbers', () => {
    expect(isValidPhoneNumber('06 12 34 56 78')).toBe(true);
    expect(isValidPhoneNumber('07 00 11 22 33')).toBe(true);
    expect(isValidPhoneNumber('05 22 33 44 55')).toBe(true);
    expect(isValidPhoneNumber('+212 6 12 34 56 78')).toBe(true);
  });

  it('validates correct international numbers', () => {
    expect(isValidPhoneNumber('+33 6 12 34 56 78')).toBe(true);
    expect(isValidPhoneNumber('+1 415 555 2671')).toBe(true);
  });

  it('rejects invalid or corrupted phone numbers', () => {
    expect(isValidPhoneNumber('')).toBe(false);
    expect(isValidPhoneNumber(null)).toBe(false);
    expect(isValidPhoneNumber('   ')).toBe(false);
    expect(isValidPhoneNumber('12345')).toBe(false); // too short
    expect(isValidPhoneNumber('061234567890123456789')).toBe(false); // too long
    expect(isValidPhoneNumber('abcdefghijk')).toBe(false); // letters
    expect(isValidPhoneNumber('06 12 34')).toBe(false); // incomplete
    expect(isValidPhoneNumber('09 12 34 56 78')).toBe(false); // invalid Moroccan prefix (09 doesn't exist)
  });

  it('formats Moroccan E.164 phone numbers for display', () => {
    expect(formatPhoneNumberDisplay('+212612345678')).toBe('+212 6 12 34 56 78');
    expect(formatPhoneNumberDisplay('0612345678')).toBe('+212 6 12 34 56 78');
  });
});

describe('Full Name Validation', () => {
  it('accepts valid Moroccan and international names', () => {
    expect(validateFullName('Tariq Benjelloun').isValid).toBe(true);
    expect(validateFullName('Karim Al-Mansouri').isValid).toBe(true);
    expect(validateFullName("Jean-Luc D'Arras").isValid).toBe(true);
    expect(validateFullName('فاطمة الزهراء').isValid).toBe(true);
    expect(validateFullName('Éléonore François').isValid).toBe(true);
  });

  it('rejects names that are too short or empty', () => {
    expect(validateFullName('').isValid).toBe(false);
    expect(validateFullName(' ').isValid).toBe(false);
    expect(validateFullName('A').isValid).toBe(false);
  });

  it('rejects names with numbers or script tags', () => {
    expect(validateFullName('Tariq123').isValid).toBe(false);
    expect(validateFullName('<script>alert(1)</script>').isValid).toBe(false);
    expect(validateFullName('123456').isValid).toBe(false);
    expect(validateFullName('@@@$$$').isValid).toBe(false);
  });

  it('rejects names exceeding 100 characters', () => {
    const longName = 'A'.repeat(101);
    expect(validateFullName(longName).isValid).toBe(false);
  });
});
