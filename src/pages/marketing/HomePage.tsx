import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { SEO } from '../../components/common/SEO';
import { HeroSection } from '../../components/marketing/HeroSection';
import { TrustSection } from '../../components/marketing/TrustSection';
import { CapabilitiesSection } from '../../components/marketing/CapabilitiesSection';
import { AiShowcaseSection } from '../../components/marketing/AiShowcaseSection';
import { FounderStorySection } from '../../components/marketing/FounderStorySection';
import { IndustrySolutionsSection } from '../../components/marketing/IndustrySolutionsSection';
import { HowItWorksSection } from '../../components/marketing/HowItWorksSection';
import { PricingSection } from '../../components/marketing/PricingSection';
import { FaqSection } from '../../components/marketing/FaqSection';
import { FinalCtaSection } from '../../components/marketing/FinalCtaSection';
import { InteractiveCustomerMenuDemo } from '../../components/customer/InteractiveCustomerMenuDemo';
import { useLanguage } from '../../context/LanguageContext';
import { analytics } from '../../services/analytics';
import { Smartphone, Sparkles, Utensils } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const location = useLocation();

  useEffect(() => {
    analytics.trackPageView('homepage', 'marketing');
  }, []);

  // Handle native hash scrolling on direct load, refresh, or route transition
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash || location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    handleHashScroll();
    const timer = setTimeout(handleHashScroll, 120);
    window.addEventListener('hashchange', handleHashScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHashScroll);
    };
  }, [location]);

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200">
      <SEO
        title={
          isEn
            ? 'SOFRAFLOW — The Complete Restaurant Technology & Growth Platform | Morocco'
            : 'SOFRAFLOW — Plateforme Digitale de Croissance pour la Restauration au Maroc'
        }
        description={
          isEn
            ? 'Turn every menu into a better customer experience and every order into an opportunity to grow. QR menus, AI dining concierge (Zina), smart upselling, and sales analytics for Moroccan restaurants.'
            : 'Faites de chaque menu une expérience client remarquable et de chaque commande une opportunité de croissance. Menus QR, concierge IA Zina, suggestions intelligentes et analyses des ventes pour établissements au Maroc.'
        }
      />

      {/* Main Global Navigation */}
      <MarketingNav />

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Trust & Positioning (Paper vs SofraFlow) */}
      <TrustSection />

      {/* 3. The 9 Connected Product Capabilities */}
      <CapabilitiesSection />

      {/* 4. Live Interactive Customer Ordering & Menu Demo */}
      <section id="demo" data-section="demo-section" className="py-24 bg-[var(--bg-card)] border-y border-[var(--border-subtle)] relative scroll-mt-24">
        {/* Alias anchor for demo-section */}
        <span id="demo-section" className="absolute -top-24" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-semibold mb-3">
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isEn ? 'Interactive Customer Experience' : 'Expérience Client Interactive'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-display tracking-tight">
              {isEn ? 'Experience SofraFlow as a Diner' : 'Vivez l’Expérience SofraFlow Côté Client'}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              {isEn
                ? 'Test the live digital menu for Café & Bistro Atlas in Casablanca. Add dishes to your order, view calculated totals in MAD, trigger smart pairing suggestions, and chat with Zina.'
                : 'Testez la carte digitale du Café & Bistro Atlas à Casablanca. Ajoutez des plats, vérifiez votre panier en MAD, découvrez les accords recommandés et discutez avec Zina.'}
            </p>
          </div>

          {/* Embedded Customer Menu Demo */}
          <InteractiveCustomerMenuDemo />

        </div>
      </section>

      {/* 5. AI Concierge & Financial Insights Showcase */}
      <AiShowcaseSection />

      {/* 6. Our Story — The Founder Vision by Ziraoui Anas */}
      <FounderStorySection />

      {/* 7. Industry-Specific Solutions */}
      <IndustrySolutionsSection />

      {/* 7. How It Works (4 Steps) */}
      <HowItWorksSection />

      {/* 8. Pricing in Moroccan Dirhams (MAD) */}
      <PricingSection />

      {/* 9. Comprehensive FAQ Accordion */}
      <FaqSection />

      {/* 10. Final Conversion CTA Banner */}
      <FinalCtaSection />

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
};
