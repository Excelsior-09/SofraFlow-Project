import React from 'react';
import { XCircle, CheckCircle2, RefreshCw, MessageSquare, TrendingUp, Star, Sliders, Smartphone } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const TrustSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const comparisons = [
    {
      problem: isEn
        ? 'Paper menus cost thousands of dirhams to reprint every time prices change or seasonal items are introduced.'
        : 'Les menus papier coûtent des milliers de dirhams à réimprimer à chaque ajustement de prix ou plat de saison.',
      solution: isEn
        ? 'Permanent table QR stands. Update prices, descriptions, and 86 sold-out dishes in 10 seconds from any smartphone.'
        : 'Supports QR permanents. Modifiez vos prix, photos et masquez un plat épuisé en 10 secondes depuis votre téléphone.',
      icon: <RefreshCw className="w-5 h-5 text-brand-orange" />
    },
    {
      problem: isEn
        ? 'Diners experience decision fatigue, repeatedly ordering the same safe dish or asking busy waitstaff endless questions.'
        : 'Les clients hésitent devant la carte, redemandent toujours le même plat basique ou monopolisent les serveurs débordés.',
      solution: isEn
        ? 'Interactive AI Customer Guide (Zina) recommends dishes tailored to their budget, taste, or dietary preferences in French & English.'
        : 'L’assistant IA client (Zina) suggère des plats selon leur budget (<80 MAD), leurs goûts ou régimes alimentaires en français et anglais.',
      icon: <MessageSquare className="w-5 h-5 text-brand-orange" />
    },
    {
      problem: isEn
        ? 'Waiters rarely have time or incentive to suggest complementary drinks, sides, or desserts during peak rush hours.'
        : 'Les serveurs manquent de temps pour proposer systématiquement une boisson, un accompagnement ou un dessert en plein coup de feu.',
      solution: isEn
        ? 'Intelligent upselling and pairings suggest complementary items naturally without high-pressure popups.'
        : 'Suggestions intelligentes d’accompagnement qui proposent naturellement la boisson ou le dessert idéal sans forcer.',
      icon: <TrendingUp className="w-5 h-5 text-brand-orange" />
    },
    {
      problem: isEn
        ? 'Owners fly blind with no visibility into which dishes are viewed, which categories lag, or true average order value.'
        : 'Les gérants naviguent à vue, sans visibilité sur les plats les plus consultés, les marges réelles ou le panier moyen.',
      solution: isEn
        ? 'Real-time sales intelligence & AI financial assistant that analyzes ticket size, trends, and category performance in MAD.'
        : 'Analyses des ventes en temps réel et assistant financier IA pour comprendre vos ventes, marges estimées et tendances en MAD.',
      icon: <Sliders className="w-5 h-5 text-brand-orange" />
    },
    {
      problem: isEn
        ? 'Satisfied customers leave without leaving feedback, while negative impressions simmer unnoticed.'
        : 'Les clients satisfaits partent sans laisser d’avis, tandis que les insatisfactions passent inaperçues.',
      solution: isEn
        ? 'Seamless post-dining review experience encouraging honest Google ratings and direct private feedback.'
        : 'Expérience d’invitation d’avis transparente incitant aux avis Google authentiques et au feedback direct.',
      icon: <Star className="w-5 h-5 text-brand-orange" />
    },
    {
      problem: isEn
        ? 'Complicated legacy POS hardware requires expensive proprietary terminals, long contracts, and IT maintenance.'
        : 'Les systèmes de caisse traditionnels exigent des terminaux propriétaires onéreux et des contrats rigides.',
      solution: isEn
        ? '100% web-based. Zero specialized hardware required. Runs effortlessly on phones, tablets, or existing screens.'
        : '100% web. Zéro équipement spécial requis. Fonctionne instantanément sur smartphones, tablettes ou PC existants.',
      icon: <Smartphone className="w-5 h-5 text-brand-orange" />
    }
  ];

  return (
    <section className="py-20 bg-[var(--bg-card)] border-y border-[var(--border-subtle)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-orange mb-2">
            {isEn ? 'The Modern Hospitality Shift' : 'L’Évolution de la Restauration'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
            {isEn
              ? 'Why Moroccan food businesses are moving beyond paper menus'
              : 'Pourquoi les établissements marocains abandonnent le menu papier'}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {isEn
              ? 'Paper menus are static, costly to maintain, and miss dozens of sales opportunities daily. SofraFlow replaces friction with an interactive, data-driven guest journey.'
              : 'La carte papier est statique, coûteuse à entretenir et laisse échapper des dizaines d’opportunités chaque jour. SofraFlow transforme chaque table en un parcours fluide et interactif.'}
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comparisons.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl p-6 bg-[var(--bg-page)] border border-[var(--border-subtle)] hover:border-brand-orange/40 transition-all duration-200 flex flex-col justify-between space-y-5"
            >
              {/* Problem Block */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wide">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{isEn ? 'Traditional Challenge' : 'Défi Traditionnel'}</span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {item.problem}
                </p>
              </div>

              {/* Divider with Icon */}
              <div className="relative flex items-center justify-center my-1">
                <div className="w-full border-t border-[var(--border-subtle)]" />
                <div className="absolute px-2 bg-[var(--bg-page)]">
                  <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
              </div>

              {/* Solution Block */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{isEn ? 'The SofraFlow Advantage' : 'L’Avantage SofraFlow'}</span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-primary)] font-medium leading-relaxed">
                  {item.solution}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Product Principle Disclaimer */}
        <div className="mt-12 p-4 rounded-xl bg-brand-navy/5 dark:bg-brand-navy/30 border border-brand-navy/15 dark:border-brand-navy/40 text-center max-w-2xl mx-auto">
          <p className="text-xs text-[var(--text-secondary)]">
            <span className="font-bold text-[var(--text-primary)]">
              {isEn ? 'Product Principle:' : 'Principe Produit :'}
            </span>{' '}
            {isEn
              ? 'All metrics and calculations shown across demonstrations reflect realistic Moroccan dirham pricing models, designed to support independent cafés, ambitious bistros, and expanding chains.'
              : 'Toutes les métriques et simulations présentées reflètent des modèles réalistes en Dirhams marocains (MAD), conçus pour accompagner cafés indépendants, bistros et enseignes en expansion.'}
          </p>
        </div>

      </div>
    </section>
  );
};
