import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const PricingSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const discountMultiplier = billingCycle === 'annual' ? 0.85 : 1;

  const plans = [
    {
      id: 'starter',
      name: isEn ? 'Starter' : 'Starter',
      badge: isEn ? 'Cafés & Small Snacks' : 'Cafés & Snacks',
      monthlyPrice: 190,
      description: isEn
        ? 'Ideal for neighborhood cafés, bakeries, and snack shops digitizing their printed cards.'
        : 'Idéal pour les cafés de quartier, boulangeries et snacks souhaitant numériser leur carte.',
      popular: false,
      features: [
        isEn ? '1 Location & up to 15 tables' : '1 Établissement & jusqu’à 15 tables',
        isEn ? 'Permanent table QR stands' : 'Supports QR de table permanents',
        isEn ? 'Bilingual menu (French & English)' : 'Menu bilingue (Français & Anglais)',
        isEn ? 'Instant price & dish stock updates' : 'Mise à jour instantanée des prix et stocks',
        isEn ? 'Basic order review on guest phones' : 'Consultation de commande sur mobile client',
        isEn ? 'Standard email & WhatsApp support' : 'Support standard par e-mail et WhatsApp'
      ],
      cta: isEn ? 'Start 14-day trial' : 'Essayer 14 jours gratuits'
    },
    {
      id: 'growth',
      name: isEn ? 'Growth' : 'Croissance',
      badge: isEn ? 'Most Popular for Restaurants' : 'Le Plus Choisi pour Restaurants',
      monthlyPrice: 390,
      description: isEn
        ? 'Full AI customer guide, smart upselling pairings, and performance analytics for ambitious restaurants.'
        : 'Guide client IA complet, suggestions d’upselling et analyses des ventes pour restaurants ambitieux.',
      popular: true,
      features: [
        isEn ? '1 Location & unlimited tables' : '1 Établissement & tables illimitées',
        isEn ? 'Zina AI Customer Concierge' : 'Concierge Client IA Zina',
        isEn ? 'Smart pairing recommendations' : 'Recommandations d’accompagnement intelligentes',
        isEn ? 'Popular order discovery badges' : 'Badges de popularité et preuve sociale',
        isEn ? 'Google review invitation flow' : 'Parcours d’invitation aux avis Google',
        isEn ? 'Sales & Average Order Value analytics' : 'Tableau de bord ventes & panier moyen en MAD',
        isEn ? 'AI Financial insights & menu matrix' : 'Conseils financiers IA & analyseur de carte',
        isEn ? 'Priority customer support' : 'Support prioritaire dédié'
      ],
      cta: isEn ? 'Start free 14-day trial' : 'Commencer l’essai gratuit'
    },
    {
      id: 'pro',
      name: isEn ? 'Multi-Location / Pro' : 'Multi-Établissements / Pro',
      badge: isEn ? 'Restaurant Chains & Riads' : 'Enseignes & Riads',
      monthlyPrice: 790,
      description: isEn
        ? 'Advanced multi-branch management, custom branding, and dedicated menu engineering consultation.'
        : 'Gestion multi-adresses, personnalisation visuelle avancée et accompagnement en menu engineering.',
      popular: false,
      features: [
        isEn ? 'Up to 3 locations included (+190 MAD / extra)' : 'Jusqu’à 3 adresses incluses (+190 MAD / extra)',
        isEn ? 'All Growth features across all branches' : 'Toutes les fonctionnalités Croissance pour chaque adresse',
        isEn ? 'Cross-branch sales analytics in MAD' : 'Analyses consolidées multi-sites en MAD',
        isEn ? 'Custom brand domains & colors' : 'Personnalisation de marque & domaine sur mesure',
        isEn ? 'Direct staff training session' : 'Session de formation dédiée pour vos équipes',
        isEn ? 'Dedicated account manager' : 'Gestionnaire de compte dédié'
      ],
      cta: isEn ? 'Start free trial' : 'Tester gratuitement'
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-[var(--bg-page)] relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-orange mb-2">
            {isEn ? 'Transparent & Flexible' : 'Transparent & Sans Surprise'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-display tracking-tight">
            {isEn ? 'Simple Pricing in Moroccan Dirhams (MAD)' : 'Des Tarifs Clairs en Dirhams Marocains (MAD)'}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {isEn
              ? 'Every plan includes a 14-day full free trial. No credit card required. Upgrade or cancel anytime.'
              : 'Tous les forfaits incluent 14 jours d’essai complet sans carte bancaire. Évoluez ou résiliez à tout moment.'}
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] mt-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-brand-orange text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {isEn ? 'Monthly' : 'Mensuel'}
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-brand-orange text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>{isEn ? 'Annual Billing' : 'Facturation Annuelle'}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold">
                -15%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((p) => {
            const calculatedPrice = Math.round(p.monthlyPrice * discountMultiplier);
            return (
              <div
                key={p.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 relative ${
                  p.popular
                    ? 'bg-[var(--bg-card)] border-2 border-brand-orange shadow-2xl scale-[1.02] z-10'
                    : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-md hover:border-brand-orange/40'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-orange to-brand-gold text-white text-[11px] font-black uppercase tracking-wider shadow">
                    {p.badge}
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    {!p.popular && (
                      <span className="text-[11px] font-bold text-brand-orange uppercase tracking-wider">
                        {p.badge}
                      </span>
                    )}
                    <h3 className="text-xl font-black text-[var(--text-primary)] font-display mt-1">
                      {p.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {/* Price Tag */}
                  <div className="py-4 border-y border-[var(--border-subtle)] my-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-[var(--text-primary)] font-display">
                        {calculatedPrice}
                      </span>
                      <span className="text-sm font-bold text-brand-orange">MAD</span>
                      <span className="text-xs text-[var(--text-muted)] font-normal ml-1">
                        / {isEn ? 'month' : 'mois'}
                      </span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                        {isEn ? 'Billed annually with 15% savings' : 'Facturé annuellement avec 15% d’économie'}
                      </p>
                    )}
                  </div>

                  {/* Feature List */}
                  <ul className="space-y-3 mb-8">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card CTA */}
                <div>
                  <Link
                    to="/signup"
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                      p.popular
                        ? 'bg-brand-orange hover:bg-brand-orange-hover text-white shadow-lg shadow-brand-orange/25'
                        : 'border border-[var(--border-subtle)] hover:border-brand-orange/40 bg-[var(--bg-page)] text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{p.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-center text-[10px] text-[var(--text-muted)] mt-2">
                    {isEn ? '14 days free • No credit card' : '14 jours gratuits • Sans carte bancaire'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise & Custom Inquiries */}
        <div className="mt-12 text-center text-xs text-[var(--text-secondary)]">
          {isEn
            ? 'Operating more than 5 branches or need POS integration? '
            : 'Vous gérez plus de 5 établissements ou souhaitez une intégration caisse ? '}
          <Link to="/contact" className="font-bold text-brand-orange hover:underline">
            {isEn ? 'Contact our team for custom enterprise onboarding' : 'Contactez notre équipe pour un déploiement sur mesure'}
          </Link>
        </div>

      </div>
    </section>
  );
};
