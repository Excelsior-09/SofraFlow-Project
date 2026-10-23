/**
 * Phone Number Normalization, Validation, and Formatting Utilities
 * Specialized for Moroccan telecommunications and standard E.164 international numbers.
 */

/**
 * Normalizes phone numbers to standard E.164 format.
 * - Strips whitespace, dashes, dots, parentheses, and formatting artifacts.
 * - Converts Moroccan domestic prefixes (06..., 07..., 05...) to +212...
 * - Converts double-zero international prefixes (00212... -> +212...)
 * - Preserves international country codes (e.g., +33, +1, +44)
 */
export function normalizePhoneNumber(rawPhone?: string | null): string {
  if (!rawPhone) return '';

  let cleaned = rawPhone.trim().replace(/[\s\-_.\u00a0()]/g, '');

  if (!cleaned) return '';

  // Replace leading international '00' with '+'
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2);
  }

  // Handle Moroccan national formats (e.g. 0612345678, 0712345678, 0522123456)
  if (/^0[567]\d{8}$/.test(cleaned)) {
    return '+212' + cleaned.substring(1);
  }

  // Handle Moroccan format without leading zero or plus (e.g. 212612345678)
  if (/^212[567]\d{8}$/.test(cleaned)) {
    return '+' + cleaned;
  }

  // Handle 9-digit Moroccan mobile/landline without country code (e.g. 612345678)
  if (/^[567]\d{8}$/.test(cleaned)) {
    return '+212' + cleaned;
  }

  // If already starts with '+', keep standard E.164 format
  if (cleaned.startsWith('+')) {
    // Remove any accidental repeated '+'
    return '+' + cleaned.substring(1).replace(/\D/g, '');
  }

  // Default: if only digits and at least 8 digits, prepend '+'
  if (/^\d{8,15}$/.test(cleaned)) {
    return '+' + cleaned;
  }

  return cleaned;
}

/**
 * Checks if a phone number is valid according to E.164 and local Moroccan standards.
 */
export function isValidPhoneNumber(rawPhone?: string | null): boolean {
  if (!rawPhone || !rawPhone.trim()) return false;

  const normalized = normalizePhoneNumber(rawPhone);

  // General E.164 pattern: + followed by 8 to 15 digits
  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
    return false;
  }

  // Strict Moroccan validation: +212 followed by 5, 6, or 7 and exactly 8 more digits
  if (normalized.startsWith('+212')) {
    return /^\+212[567]\d{8}$/.test(normalized);
  }

  return true;
}

/**
 * Formats a normalized E.164 phone number into a readable display format.
 * E.g., +212612345678 -> +212 6 12 34 56 78
 */
export function formatPhoneNumberDisplay(rawPhone?: string | null): string {
  if (!rawPhone) return '';
  const normalized = normalizePhoneNumber(rawPhone);

  if (/^\+212[567]\d{8}$/.test(normalized)) {
    const prefix = normalized.substring(0, 4); // +212
    const operator = normalized.substring(4, 5); // 6
    const p1 = normalized.substring(5, 7);
    const p2 = normalized.substring(7, 9);
    const p3 = normalized.substring(9, 11);
    const p4 = normalized.substring(11, 13);
    return `${prefix} ${operator} ${p1} ${p2} ${p3} ${p4}`;
  }

  return normalized;
}

/**
 * Validates a user's full name.
 * - Between 2 and 100 characters.
 * - Allows Unicode letters (Latin, French accents, Arabic), spaces, hyphens, and apostrophes.
 * - Disallows script tags or pure digits/symbols.
 */
export function validateFullName(name?: string | null): { isValid: boolean; error?: string } {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Full name is required.' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Full name must contain at least 2 characters.' };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: 'Full name cannot exceed 100 characters.' };
  }

  // Must contain at least one letter (Latin, Arabic, etc.)
  if (!/\p{L}/u.test(trimmed)) {
    return { isValid: false, error: 'Full name must contain alphabetical characters.' };
  }

  // Allow Unicode letters (including Arabic and French accented letters), spaces, hyphens, and apostrophes
  const validNameRegex = /^[\p{L}\s'-]+$/u;
  if (!validNameRegex.test(trimmed)) {
    return { isValid: false, error: 'Full name contains invalid characters.' };
  }

  return { isValid: true };
}
