/**
 * SOFRAFLOW Analytics & Event Measurement Service
 * 
 * Provides privacy-preserving client-side event tracking for key marketing
 * and conversion funnel actions without collecting sensitive customer data.
 * Dispatches DOM events for plug-and-play integration with Google Analytics 4,
 * Plausible, Meta Pixel, or internal logging.
 */

export type AnalyticsEventName =
  | 'landing_page_view'
  | 'industry_page_view'
  | 'pricing_view'
  | 'demo_opened'
  | 'demo_industry_switched'
  | 'signup_started'
  | 'signup_completed'
  | 'contact_form_submitted'
  | 'blog_list_view'
  | 'blog_article_view'
  | 'cta_clicked'
  | 'menu_preview_clicked';

export interface AnalyticsEventData {
  event: AnalyticsEventName;
  timestamp: string;
  properties?: Record<string, string | number | boolean | undefined>;
}

class AnalyticsService {
  private isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  /**
   * Tracks a custom business event.
   * Strips any accidentally passed sensitive keys (password, token, card, phone).
   */
  public track(event: AnalyticsEventName, properties: Record<string, any> = {}): void {
    if (typeof window === 'undefined') return;

    // Sanitize properties to prevent sensitive leakage
    const sanitizedProps: Record<string, any> = {};
    for (const [key, value] of Object.entries(properties)) {
      const lower = key.toLowerCase();
      if (
        lower.includes('password') ||
        lower.includes('token') ||
        lower.includes('secret') ||
        lower.includes('card') ||
        lower.includes('cvv') ||
        lower.includes('phone') ||
        lower.includes('email')
      ) {
        continue; // skip sensitive values
      }
      if (value !== undefined && value !== null) {
        sanitizedProps[key] = value;
      }
    }

    const payload: AnalyticsEventData = {
      event,
      timestamp: new Date().toISOString(),
      properties: sanitizedProps
    };

    // Log in local dev mode for easy developer debugging
    if (this.isDevelopment) {
      console.log(`[SOFRAFLOW Analytics] ${event}:`, sanitizedProps);
    }

    // Dispatch DOM event for GA4 / GTM / Plausible listeners
    window.dispatchEvent(new CustomEvent('sofraflow:analytics', { detail: payload }));

    // Support window.dataLayer if Google Tag Manager is installed
    if ((window as any).dataLayer && Array.isArray((window as any).dataLayer)) {
      (window as any).dataLayer.push({
        event,
        ...sanitizedProps
      });
    }
  }

  public trackPageView(pageName: string, category: 'marketing' | 'solutions' | 'blog' | 'dashboard' | 'customer'): void {
    this.track('landing_page_view', {
      pageName,
      category,
      path: typeof window !== 'undefined' ? window.location.pathname : ''
    });
  }
}

export const analytics = new AnalyticsService();
