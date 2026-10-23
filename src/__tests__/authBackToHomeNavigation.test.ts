import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { dictionaries } from '../locales';

describe('Auth Pages — Back to Home Navigation Tests', () => {
  const rootDir = path.resolve(__dirname, '..');

  describe('1. Multilingual Translation Parity', () => {
    it('defines backToHome and home keys across all supported locales', () => {
      // English
      expect(dictionaries.en.auth.backToHome).toBe('Back to home');
      expect(dictionaries.en.common.backToHome).toBe('Back to home');
      expect(dictionaries.en.common.home).toBe('Home');

      // French
      expect(dictionaries.fr.auth.backToHome).toBe('Retour à l’accueil');
      expect(dictionaries.fr.common.backToHome).toBe('Retour à l’accueil');
      expect(dictionaries.fr.common.home).toBe('Accueil');

      // Arabic
      expect(dictionaries.ar.common.backToHome).toBe('العودة للرئيسية');
      expect(dictionaries.ar.common.home).toBe('الرئيسية');
    });
  });

  describe('2. BackToHomeButton Component Architecture & Accessibility', () => {
    const componentPath = path.join(rootDir, 'components', 'common', 'BackToHomeButton.tsx');
    const content = fs.readFileSync(componentPath, 'utf-8');

    it('navigates strictly to the public root homepage ("/")', () => {
      // Must link to "/" and never to /dashboard or another auth page
      expect(content).toContain('to="/"');
    });

    it('uses a directional ArrowLeft icon for immediate cognitive recognition', () => {
      expect(content).toContain('ArrowLeft');
      expect(content).toContain('<ArrowLeft');
    });

    it('implements visible focus ring and keyboard accessibility attributes', () => {
      expect(content).toContain('focus-visible:ring-2');
      expect(content).toContain('focus-visible:ring-brand-orange');
      expect(content).toContain('aria-label=');
    });

    it('uses CSS design tokens for light, dark, and system theme compatibility', () => {
      expect(content).toContain('var(--bg-card)');
      expect(content).toContain('var(--text-secondary)');
      expect(content).toContain('var(--border-subtle)');
      expect(content).toContain('hover:text-brand-orange');
    });

    it('supports responsive compact mode for mobile screens', () => {
      expect(content).toContain('compactOnMobile');
      expect(content).toContain('hidden sm:inline');
      expect(content).toContain('sm:hidden');
    });
  });

  describe('3. LoginPage Navigation Integration', () => {
    const loginPath = path.join(rootDir, 'pages', 'marketing', 'LoginPage.tsx');
    const content = fs.readFileSync(loginPath, 'utf-8');

    it('imports BackToHomeButton in LoginPage', () => {
      expect(content).toContain("import { BackToHomeButton } from '../../components/common/BackToHomeButton'");
    });

    it('positions BackToHomeButton prominently in the top bar alongside Logo and switchers', () => {
      expect(content).toContain('<BackToHomeButton compactOnMobile />');
      expect(content).toContain('top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6');
    });

    it('provides secondary Back to Home link in the card footer for seamless user exit', () => {
      expect(content).toContain('<BackToHomeButton variant="link" />');
    });

    it('eliminates nested <a> tags around Logo to prevent hydration warnings', () => {
      // Logo should use linkTo="/" directly rather than wrapping in <Link>
      expect(content).not.toContain('<Link to="/"><Logo');
      expect(content).toContain('<Logo showTagline={false} size="sm" linkTo="/" />');
    });

    it('does not interfere with login form inputs or submit action', () => {
      expect(content).toContain('type="submit"');
      expect(content).toContain('onSubmit={handleSubmit}');
      // Button is rendered outside the form as an anchor link, not a form submit button
      expect(content).toContain('<BackToHomeButton');
    });
  });

  describe('4. SignupPage Navigation Integration', () => {
    const signupPath = path.join(rootDir, 'pages', 'marketing', 'SignupPage.tsx');
    const content = fs.readFileSync(signupPath, 'utf-8');

    it('imports BackToHomeButton in SignupPage', () => {
      expect(content).toContain("import { BackToHomeButton } from '../../components/common/BackToHomeButton'");
    });

    it('positions BackToHomeButton prominently in the top bar of SignupPage', () => {
      expect(content).toContain('<BackToHomeButton compactOnMobile />');
      expect(content).toContain('top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6');
    });

    it('provides secondary Back to Home link at the bottom of the registration card', () => {
      expect(content).toContain('<BackToHomeButton variant="link" />');
    });

    it('provides Back to Home link on email confirmation screen', () => {
      expect(content).toContain('emailSentNotice');
      expect(content).toContain('<BackToHomeButton variant="link" />');
    });

    it('does not interfere with registration form inputs or validation', () => {
      expect(content).toContain('onSubmit={handleSubmit}');
      expect(content).toContain('registerWithEmail');
    });
  });
});
