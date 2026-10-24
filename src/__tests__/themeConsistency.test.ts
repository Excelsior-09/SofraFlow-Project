import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Theme Consistency & Multi-Mode Adaptation', () => {
  const pagesDir = path.resolve(__dirname, '../pages/marketing');

  it('verifies ThemeContext supports light, dark, and system modes and handles matchMedia changes', () => {
    const themeContextPath = path.resolve(__dirname, '../context/ThemeContext.tsx');
    const content = fs.readFileSync(themeContextPath, 'utf-8');

    // Confirms types and states
    expect(content).toContain("export type Theme = 'light' | 'dark' | 'system'");
    expect(content).toContain("export type ResolvedTheme = 'light' | 'dark'");
    expect(content).toContain("window.matchMedia('(prefers-color-scheme: dark)')");
    // Confirms class toggling on document.documentElement
    expect(content).toContain("document.documentElement.classList.add('dark')");
    expect(content).toContain("document.documentElement.classList.remove('dark')");
    // Confirms listener registration for OS theme changes
    expect(content).toContain("mediaQuery.addEventListener('change'");
  });

  it('verifies App.tsx supports both /solutions and /solution aliases for index and industry detail routes', () => {
    const appPath = path.resolve(__dirname, '../App.tsx');
    const content = fs.readFileSync(appPath, 'utf-8');

    expect(content).toContain('path="/solutions"');
    expect(content).toContain('path="/solutions/:industrySlug"');
    expect(content).toContain('path="/solution"');
    expect(content).toContain('path="/solution/:industrySlug"');
  });

  describe('SolutionsIndexPage (/solution and /solutions)', () => {
    it('implements responsive dark mode tokens across all sections, hero, cards, and CTA', () => {
      const content = fs.readFileSync(path.join(pagesDir, 'SolutionsIndexPage.tsx'), 'utf-8');

      // Page background must use theme tokens and dark variant
      expect(content).toContain('dark:bg-dark-page');
      expect(content).toContain('bg-[var(--bg-page)]');

      // Hero text must adapt to dark mode
      expect(content).toContain('text-forest dark:text-white');
      expect(content).toContain('text-ink-secondary dark:text-dark-secondary');

      // Industry cards must use dark card background and borders
      expect(content).toContain('dark:bg-dark-card');
      expect(content).toContain('dark:border-dark-border');
      expect(content).toContain('text-forest dark:text-white');

      // Testimonial quote card adaptation
      expect(content).toContain('bg-white dark:bg-dark-card');
      expect(content).toContain('border border-gray-200 dark:border-dark-border');

      // Bottom CTA card must be styled
      expect(content).toContain('bg-[#0B132B] text-white text-center');
    });
  });

  describe('IndustrySolutionPage (/solutions/:industrySlug)', () => {
    it('implements theme tokens for hero, breadcrumbs, challenge cards, interactive phone preview, and pricing', () => {
      const content = fs.readFileSync(path.join(pagesDir, 'IndustrySolutionPage.tsx'), 'utf-8');

      // Main container
      expect(content).toContain('bg-[var(--bg-page)] dark:bg-dark-page');

      // Breadcrumbs
      expect(content).toContain('text-ink-secondary dark:text-dark-secondary');
      expect(content).toContain('text-forest dark:text-dark-text');

      // Hero title & subtitle
      expect(content).toContain('text-forest dark:text-white');
      expect(content).toContain('text-ink-secondary dark:text-dark-secondary');

      // Challenges and feature step cards
      expect(content).toContain('dark:bg-dark-card');
      expect(content).toContain('dark:border-dark-border');

      // Interactive preview phone
      expect(content).toContain('dark:border-dark-border');
      expect(content).toContain('dark:bg-dark-surface');

      // Pricing cards inside industry solution
      expect(content).toContain('dark:bg-dark-card');
      expect(content).toContain('text-forest dark:text-white');

      // FAQ accordion
      expect(content).toContain('dark:bg-dark-card');
      expect(content).toContain('text-forest dark:text-white');
    });
  });

  describe('ContactPage (/contact)', () => {
    it('implements theme tokens for hero, guarantees banner, contact form inputs, labels, and placeholders', () => {
      const content = fs.readFileSync(path.join(pagesDir, 'ContactPage.tsx'), 'utf-8');

      // Main background
      expect(content).toContain('bg-[var(--bg-page)] dark:bg-dark-page');

      // Headings
      expect(content).toContain('text-forest dark:text-white');
      expect(content).toContain('text-ink-secondary dark:text-dark-secondary');

      // Guarantees sidebar card
      expect(content).toContain('bg-[#FAF8F5] dark:bg-dark-card');
      expect(content).toContain('border-gray-200/90 dark:border-dark-border');

      // Form inputs and selects
      expect(content).toContain('dark:bg-dark-surface');
      expect(content).toContain('dark:border-dark-border');
      expect(content).toContain('dark:text-dark-text');
      expect(content).toContain('dark:placeholder:text-dark-muted');

      // Form container
      expect(content).toContain('bg-[#FAF8F5] dark:bg-dark-card');
    });
  });

  describe('PricingPage (/pricing)', () => {
    it('implements theme tokens for billing toggle, plan cards, commission calculator, and feature matrix', () => {
      const content = fs.readFileSync(path.join(pagesDir, 'PricingPage.tsx'), 'utf-8');

      // Main container
      expect(content).toContain('bg-[var(--bg-page)] dark:bg-dark-page');

      // Hero heading
      expect(content).toContain('text-forest dark:text-white');
      expect(content).toContain('text-ink-secondary dark:text-dark-secondary');

      // Billing cycle toggle
      expect(content).toContain('bg-gray-300 dark:bg-dark-surface');

      // Pricing plan cards
      expect(content).toContain('bg-[#FAF8F5] dark:bg-dark-card');
      expect(content).toContain('border-gray-200/90 dark:border-dark-border');

      // Moroccan payment banner
      expect(content).toContain('dark:bg-dark-card');

      // 0% Commission interactive calculator
      expect(content).toContain('dark:bg-dark-card');
      expect(content).toContain('dark:bg-dark-surface');
      expect(content).toContain('text-forest dark:text-white');

      // Feature comparison table
      expect(content).toContain('dark:bg-dark-surface/80');
      expect(content).toContain('dark:divide-dark-border');
      expect(content).toContain('text-forest dark:text-white');
      expect(content).toContain('text-ink-main dark:text-dark-text');
      expect(content).toContain('dark:bg-dark-surface/30');
    });
  });
});
