import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { analytics } from '../services/analytics';
import { INDUSTRY_SOLUTIONS } from '../data/industrySolutions';
import { BLOG_ARTICLES } from '../data/blogArticles';
import fs from 'fs';
import path from 'path';

describe('SOFRAFLOW Analytics & Event Tracking', () => {
  beforeEach(() => {
    class CustomEventMock {
      type: string;
      detail: any;
      constructor(type: string, options?: any) {
        this.type = type;
        this.detail = options?.detail;
      }
    }

    const listeners: Record<string, Function[]> = {};
    (globalThis as any).CustomEvent = CustomEventMock;
    (globalThis as any).window = {
      location: { hostname: 'localhost', pathname: '/test' },
      addEventListener: (evt: string, fn: Function) => {
        if (!listeners[evt]) listeners[evt] = [];
        listeners[evt].push(fn);
      },
      removeEventListener: (evt: string, fn: Function) => {
        if (listeners[evt]) {
          listeners[evt] = listeners[evt].filter(l => l !== fn);
        }
      },
      dispatchEvent: (evt: any) => {
        const fns = listeners[evt.type] || [];
        fns.forEach(fn => fn(evt));
        return true;
      }
    };
  });

  afterEach(() => {
    delete (globalThis as any).window;
    delete (globalThis as any).CustomEvent;
  });

  it('dispatches custom DOM event with sanitized properties', () => {
    let capturedEvent: any = null;
    const listener = (e: any) => {
      capturedEvent = e.detail;
    };

    (globalThis as any).window.addEventListener('sofraflow:analytics', listener);

    analytics.track('signup_started', {
      source: 'hero_cta',
      businessType: 'cafe',
      password: 'superSecretPassword123!', // should be stripped!
      customerPhone: '+212661234567'       // should be stripped!
    });

    (globalThis as any).window.removeEventListener('sofraflow:analytics', listener);

    expect(capturedEvent).toBeDefined();
    expect(capturedEvent.event).toBe('signup_started');
    expect(capturedEvent.properties.source).toBe('hero_cta');
    expect(capturedEvent.properties.businessType).toBe('cafe');
    // Ensure sensitive data is not leaked
    expect(capturedEvent.properties.password).toBeUndefined();
    expect(capturedEvent.properties.customerPhone).toBeUndefined();
  });

  it('tracks page views accurately with category', () => {
    let capturedEvent: any = null;
    const listener = (e: any) => {
      capturedEvent = e.detail;
    };

    (globalThis as any).window.addEventListener('sofraflow:analytics', listener);
    analytics.trackPageView('restaurants_solution', 'solutions');
    (globalThis as any).window.removeEventListener('sofraflow:analytics', listener);

    expect(capturedEvent).toBeDefined();
    expect(capturedEvent.event).toBe('landing_page_view');
    expect(capturedEvent.properties.pageName).toBe('restaurants_solution');
    expect(capturedEvent.properties.category).toBe('solutions');
  });
});

describe('Industry Solutions Data Integrity', () => {
  const expectedSlugs = [
    'restaurants',
    'cafes',
    'snacks-fast-food',
    'boulangeries-patisseries',
    'bars-a-jus-glaciers',
    'hotels-tourisme',
    'menus-de-services'
  ];

  it('contains all 7 required commercial verticals', () => {
    expectedSlugs.forEach(slug => {
      const solution = INDUSTRY_SOLUTIONS[slug];
      expect(solution).toBeDefined();
      expect(solution.slug).toBe(slug);
      expect(solution.name).toBeTruthy();
      expect(solution.metaTitle).toBeTruthy();
      expect(solution.metaDescription).toBeTruthy();
      expect(solution.heroTitle).toBeTruthy();
      expect(solution.benefits.length).toBeGreaterThanOrEqual(3);
      expect(solution.sampleMenu.items.length).toBeGreaterThanOrEqual(2);
      expect(solution.faqs.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('each industry has unique titles and meta descriptions', () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    Object.values(INDUSTRY_SOLUTIONS).forEach(solution => {
      expect(titles.has(solution.metaTitle)).toBe(false);
      expect(descriptions.has(solution.metaDescription)).toBe(false);
      titles.add(solution.metaTitle);
      descriptions.add(solution.metaDescription);
    });
  });
});

describe('Blog & Editorial Content Engine', () => {
  it('contains comprehensive initial cluster articles with key takeaways', () => {
    const articles = Object.values(BLOG_ARTICLES);
    expect(articles.length).toBeGreaterThanOrEqual(4);

    articles.forEach(article => {
      expect(article.slug).toBeTruthy();
      expect(article.title).toBeTruthy();
      expect(article.seoTitle).toBeTruthy();
      expect(article.seoDescription).toBeTruthy();
      expect(article.author.name).toBeTruthy();
      expect(article.keyTakeaways.length).toBeGreaterThanOrEqual(2);
      expect(article.sections.length).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('Static SEO Files Validation (robots.txt & sitemap.xml)', () => {
  it('robots.txt exists and contains expected directives and sitemap declaration', () => {
    const robotsPath = path.resolve(process.cwd(), 'public/robots.txt');
    expect(fs.existsSync(robotsPath)).toBe(true);

    const content = fs.readFileSync(robotsPath, 'utf-8');
    expect(content.includes('User-agent: *')).toBe(true);
    expect(content.includes('Allow: /')).toBe(true);
    expect(content.includes('Disallow: /app/')).toBe(true);
    expect(content.includes('Disallow: /order/')).toBe(true);
    expect(content.includes('Sitemap: https://sofraflow.com/sitemap.xml')).toBe(true);
  });

  it('sitemap.xml exists and contains solutions and blog URLs', () => {
    const sitemapPath = path.resolve(process.cwd(), 'public/sitemap.xml');
    expect(fs.existsSync(sitemapPath)).toBe(true);

    const content = fs.readFileSync(sitemapPath, 'utf-8');
    expect(content.includes('<urlset')).toBe(true);
    expect(content.includes('https://sofraflow.com/')).toBe(true);
    expect(content.includes('https://sofraflow.com/solutions/restaurants')).toBe(true);
    expect(content.includes('https://sofraflow.com/solutions/cafes')).toBe(true);
    expect(content.includes('https://sofraflow.com/blog')).toBe(true);
    expect(content.includes('https://sofraflow.com/blog/creer-menu-digital-qr-code-maroc')).toBe(true);
  });
});
