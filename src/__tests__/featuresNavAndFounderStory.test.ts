import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Features Navigation & Founder Story Integration Tests', () => {
  const rootDir = path.resolve(__dirname, '..');

  it('CapabilitiesSection has id="features" with scroll-mt-24 for sticky header offset', () => {
    const filePath = path.join(rootDir, 'components', 'marketing', 'CapabilitiesSection.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for id="features"
    expect(content).toContain('id="features"');
    // Check for scroll-margin-top to prevent sticky header covering section header
    expect(content).toContain('scroll-mt-24');
    // Check for backwards compatibility alias #capabilities
    expect(content).toContain('id="capabilities"');
  });

  it('MarketingNav contains #features and #story navigation links', () => {
    const filePath = path.join(rootDir, 'components', 'marketing', 'MarketingNav.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check that nav links include Features and Our Story
    expect(content).toContain("href: '/#features'");
    expect(content).toContain("href: '/#story'");
    // Check that smooth hash scroll handler handleNavClick is present
    expect(content).toContain('handleNavClick');
  });

  it('HomePage contains FounderStorySection and handles hash scrolling on mount and navigation', () => {
    const filePath = path.join(rootDir, 'pages', 'marketing', 'HomePage.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check that FounderStorySection is imported and rendered
    expect(content).toContain('FounderStorySection');
    expect(content).toContain('<FounderStorySection />');
    // Check hash listener and scroll handling
    expect(content).toContain('location.hash');
    expect(content).toContain('scrollIntoView');
  });

  it('CEO Photo asset exists in public and assets directories with non-zero size', () => {
    const publicPhotoPath = path.join(rootDir, '..', 'public', 'ziraoui-anas.jpg');
    const assetsPhotoPath = path.join(rootDir, 'assets', 'ziraoui-anas.jpg');
    
    expect(fs.existsSync(publicPhotoPath)).toBe(true);
    expect(fs.existsSync(assetsPhotoPath)).toBe(true);

    const publicStats = fs.statSync(publicPhotoPath);
    const assetsStats = fs.statSync(assetsPhotoPath);

    expect(publicStats.size).toBeGreaterThan(50000); // uploaded photo is ~150KB
    expect(assetsStats.size).toBeGreaterThan(50000);
  });

  it('FounderStorySection has authentic narrative, CEO identification, principles and portrait', () => {
    const filePath = path.join(rootDir, 'components', 'marketing', 'FounderStorySection.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Founder identification
    expect(content).toContain('Ziraoui Anas');
    expect(content).toContain('Founder & CEO');
    expect(content).toContain('SofraFlow');

    // Dedicated portrait component with alt text
    expect(content).toContain('alt="Ziraoui Anas, Founder and CEO of SofraFlow"');
    expect(content).toContain('src="/ziraoui-anas.jpg"');
    expect(content).toContain('object-cover');
    expect(content).toContain('object-top');

    // Key story elements
    expect(content).toContain('Built From a Simple Observation. Designed for Better Business.');
    expect(content).toContain('Built with businesses in mind. Designed around better customer experiences.');
    expect(content).toContain('id="story"');
    expect(content).toContain('id="about"');

    // 3 Principles
    expect(content).toContain('Better Customer Experiences');
    expect(content).toContain('Smarter Menu Presentation');
    expect(content).toContain('More Opportunities for Growth');

    // CTAs
    expect(content).toContain('href="#features"');
    expect(content).toContain('/signup');
  });

  it('Sticky headers clearance (scroll-mt-24) applied to all landing page anchor targets', () => {
    const sectionsToCheck = [
      { file: 'components/marketing/CapabilitiesSection.tsx', anchor: 'features' },
      { file: 'components/marketing/HowItWorksSection.tsx', anchor: 'how-it-works' },
      { file: 'components/marketing/PricingSection.tsx', anchor: 'pricing' },
      { file: 'components/marketing/FaqSection.tsx', anchor: 'faq' },
      { file: 'components/marketing/IndustrySolutionsSection.tsx', anchor: 'solutions' },
      { file: 'components/marketing/FounderStorySection.tsx', anchor: 'story' },
    ];

    for (const sec of sectionsToCheck) {
      const filePath = path.join(rootDir, sec.file);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain(`id="${sec.anchor}"`);
      expect(content).toContain('scroll-mt-24');
    }
  });
});
