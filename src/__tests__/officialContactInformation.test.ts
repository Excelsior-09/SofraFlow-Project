import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { OFFICIAL_CONTACT } from '../data/contactConfig';
import { isValidPhoneNumber, formatPhoneNumberDisplay } from '../utils/phoneValidation';

describe('Official Contact Information — Integration & Verification Tests', () => {
  const rootDir = path.resolve(__dirname, '..');

  describe('1. Centralized Contact Configuration', () => {
    it('defines the official email as support@sofraflow.org with valid mailto: link', () => {
      expect(OFFICIAL_CONTACT.email).toBe('support@sofraflow.org');
      expect(OFFICIAL_CONTACT.mailto).toBe('mailto:support@sofraflow.org');
    });

    it('defines the official phone as +212613905979 with valid tel: link and standardized display format', () => {
      expect(OFFICIAL_CONTACT.phone).toBe('+212613905979');
      expect(OFFICIAL_CONTACT.phoneTel).toBe('tel:+212613905979');
      expect(OFFICIAL_CONTACT.phoneDisplay).toBe('+212 6 13 90 59 79');
      expect(formatPhoneNumberDisplay(OFFICIAL_CONTACT.phone)).toBe('+212 6 13 90 59 79');
    });

    it('validates the official phone against strict Moroccan telecom standards', () => {
      expect(isValidPhoneNumber(OFFICIAL_CONTACT.phone)).toBe(true);
      expect(OFFICIAL_CONTACT.phone.startsWith('+2126')).toBe(true);
    });

    it('configures the official WhatsApp hotline using +212613905979', () => {
      expect(OFFICIAL_CONTACT.whatsappNumber).toBe('212613905979');
      expect(OFFICIAL_CONTACT.whatsappUrl).toContain('wa.me/212613905979');
    });
  });

  describe('2. ContactPage Public Interface', () => {
    const contactPath = path.join(rootDir, 'pages', 'marketing', 'ContactPage.tsx');
    const content = fs.readFileSync(contactPath, 'utf-8');

    it('contains clickable mailto: link pointing to support@sofraflow.org', () => {
      expect(content).toContain('href={OFFICIAL_CONTACT.mailto}');
      expect(content).toContain('{OFFICIAL_CONTACT.email}');
    });

    it('contains clickable tel: link pointing to +212613905979', () => {
      expect(content).toContain('href={OFFICIAL_CONTACT.phoneTel}');
      expect(content).toContain('{OFFICIAL_CONTACT.phoneDisplay}');
    });

    it('contains official WhatsApp link pointing to 212613905979', () => {
      expect(content).toContain('href={OFFICIAL_CONTACT.whatsappUrl}');
    });

    it('purges all legacy and outdated contact phone numbers and emails', () => {
      // Must not contain old placeholder numbers or old .com support domain
      expect(content).not.toContain('support@sofraflow.com');
      expect(content).not.toContain('+212 (0) 524 38 12 00');
      expect(content).not.toContain('212524381200');
    });
  });

  describe('3. Shared MarketingFooter Interface', () => {
    const footerPath = path.join(rootDir, 'components', 'marketing', 'MarketingFooter.tsx');
    const content = fs.readFileSync(footerPath, 'utf-8');

    it('includes clickable mailto: link for support@sofraflow.org in shared footer', () => {
      expect(content).toContain('href={OFFICIAL_CONTACT.mailto}');
      expect(content).toContain('{OFFICIAL_CONTACT.email}');
    });

    it('includes clickable tel: link for +212613905979 in shared footer', () => {
      expect(content).toContain('href={OFFICIAL_CONTACT.phoneTel}');
      expect(content).toContain('{OFFICIAL_CONTACT.phoneDisplay}');
    });

    it('provides accessible aria-labels for phone and email links in footer', () => {
      expect(content).toContain('aria-label=');
      expect(content).toContain('Email ${OFFICIAL_CONTACT.email}');
      expect(content).toContain('Call ${OFFICIAL_CONTACT.phoneDisplay}');
    });
  });

  describe('4. Theme and Styling Consistency', () => {
    const contactPath = path.join(rootDir, 'pages', 'marketing', 'ContactPage.tsx');
    const contactContent = fs.readFileSync(contactPath, 'utf-8');

    it('ensures contact cards maintain high contrast and hover states for dark/light themes', () => {
      expect(contactContent).toContain('hover:text-white');
      expect(contactContent).toContain('transition-colors');
    });
  });
});
