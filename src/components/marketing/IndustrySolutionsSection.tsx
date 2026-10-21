import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Coffee,
  Sandwich,
  Cake,
  GlassWater,
  Hotel,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const IndustrySolutionsSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [activeSector, setActiveSector] = useState<string>('restaurant');

  const industries = [
    {
      id: 'restaurant',
      icon: <UtensilsCrossed className="w-5 h-5 text-brand-orange" />,
      name: isEn ? 'Restaurants & Bistros' : 'Restaurants & Bistros',
      tagline: isEn ? 'Dine-in table service & signature cuisine' : 'Service à table & cuisine signature',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=700&auto=format&fit=crop&q=80',
      painPoint: isEn
        ? 'Seasonal menus with frequent price changes in meat or seafood require costly reprinting.'
        : 'Les menus de saison avec variations de prix (viandes, poissons) nécessitent des réimpressions fréquentes.',
      sofraFlowBenefit: isEn
        ? 'Digital wine & dish lists with dynamic recommendations, daily specials, and live stock toggles.'
        : 'Carte interactive avec suggestions du chef, accords mets-boissons et gestion des disponibilités en direct.',
      highlights: [
        isEn ? 'Automatic pairings (salads, sides, drinks)' : 'Accords automatiques (salades, entrées, boissons)',
        isEn ? 'Multi-language (FR, EN, AR) for tourists & locals' : 'Multilingue (FR, EN, AR) pour touristes et locaux',
        isEn ? 'Table QR code routing directly to waiter or kitchen' : 'Routage par table vers le service ou la cuisine'
      ]
    },
    {
      id: 'cafe',
      icon: <Coffee className="w-5 h-5 text-brand-orange" />,
      name: isEn ? 'Cafés & Coffee Shops' : 'Cafés & Coffee Shops',
      tagline: isEn ? 'High table turnover & specialty brews' : 'Forte rotation & cafés de spécialité',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=700&auto=format&fit=crop&q=80',
      painPoint: isEn
        ? 'Guests occupy tables for hours ordering only a single espresso or tea.'
        : 'Les clients occupent les tables de longues heures en ne commandant qu’un seul café ou thé.',
      sofraFlowBenefit: isEn
        ? 'Continuous table ordering invites guests to easily add artisan pastries, brunch toast, or fresh juices.'
        : 'Le menu permanent sur la table incite à commander une pâtisserie, un brunch ou un jus frais en un clic.',
      highlights: [
        isEn ? 'Pastry & beverage combo promotions' : 'Formules café + viennoiserie automatisées',
        isEn ? 'Milk & syrup customization options' : 'Options de personnalisation (laits végétaux, sirops)',
        isEn ? 'Speedy re-ordering without chasing staff' : 'Réassort rapide sans héler le serveur'
      ]
    },
    {
      id: 'snack',
      icon: <Sandwich className="w-5 h-5 text-brand-orange" />,
      name: isEn ? 'Fast Food & Snack Bars' : 'Fast Food & Snacks',
      tagline: isEn ? 'Rapid service, tacos, burgers & grills' : 'Service rapide, tacos, burgers & grillades',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80',
      painPoint: isEn
        ? 'Long order queues during lunch rush lead to walkouts and order errors.'
        : 'Files d’attente aux heures de pointe provoquant des départs et des erreurs de prise de commande.',
      sofraFlowBenefit: isEn
        ? 'Direct counter or table QR ordering lets customers customize sauces and extras smoothly.'
        : 'Commande QR au comptoir ou en terrasse permettant de choisir sauces et suppléments sans erreur.',
      highlights: [
        isEn ? 'Add extras (+5 MAD cheese, +10 MAD double patty)' : 'Suppléments clairs (+5 MAD fromage, +10 MAD double steak)',
        isEn ? 'Dramatically reduced queue friction' : 'Fluidification radicale des files d’attente',
        isEn ? 'Visual dish photos reduce order hesitation' : 'Photos gourmandes qui suppriment l’hésitation'
      ]
    },
    {
      id: 'bakery',
      icon: <Cake className="w-5 h-5 text-brand-orange" />,
      name: isEn ? 'Bakeries & Pâtisseries' : 'Boulangeries & Pâtisseries',
      tagline: isEn ? 'Cakes, Viennoiseries & catering orders' : 'Gâteaux, viennoiseries & commandes traiteur',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=700&auto=format&fit=crop&q=80',
      painPoint: isEn
        ? 'Catering platters and delicate specialty cakes require customized sizes and flavors.'
        : 'Les plateaux traiteur et pièces montées nécessitent des précisions de taille et de parfums.',
      sofraFlowBenefit: isEn
        ? 'Elegant digital catalog showing box sizes, allergen warnings, and pre-order dates.'
        : 'Catalogue digital élégant détaillant conditionnements, allergènes et réservations à l’avance.',
      highlights: [
        isEn ? 'Clear allergen declarations (nuts, gluten, dairy)' : 'Déclaration claire des allergènes (fruits à coque, gluten)',
        isEn ? 'High-resolution cake photography' : 'Photographies soignées des créations sucrées',
        isEn ? 'Box curation & party platter ordering' : 'Composition de boîtes personnalisées'
      ]
    },
    {
      id: 'juice',
      icon: <GlassWater className="w-5 h-5 text-brand-orange" />,
      name: isEn ? 'Juice & Gelato Bars' : 'Bars à Jus & Glaciers',
      tagline: isEn ? 'Fresh fruit smoothies & artisanal gelato' : 'Smoothies vitaminés & glaces artisanales',
      image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=700&auto=format&fit=crop&q=80',
      painPoint: isEn
        ? 'Seasonal fruit availability changes weekly, making printed posters outdated.'
        : 'Disponibilité des fruits de saison variable d’une semaine à l’autre, rendant les affiches obsolètes.',
      sofraFlowBenefit: isEn
        ? 'Toggle seasonal flavors (mango, avocado, pomegranate) in 5 seconds with zero waste.'
        : 'Activez les fruits du jour (avocat, grenade, mangue) en 5 secondes sans réimprimer.',
      highlights: [
        isEn ? 'Boosters & topping additions (spirulina, ginger)' : 'Suppléments bien-être (gingembre, graines de chia)',
        isEn ? 'Size selections (Small, Medium, Large in MAD)' : 'Choix de formats (Petit, Moyen, Grand en MAD)',
        isEn ? 'Vibrant visual appeal on mobile' : 'Présentation visuelle éclatante sur mobile'
      ]
    },
    {
      id: 'riad',
      icon: <Hotel className="w-5 h-5 text-brand-orange" />,
      name: isEn ? 'Riads & Boutique Hotels' : 'Riads & Hôtels Boutiques',
      tagline: isEn ? 'Rooftop lounges, courtyards & room service' : 'Rooftops, patios & room service',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&auto=format&fit=crop&q=80',
      painPoint: isEn
        ? 'Guests lounging on rooftop terraces or in rooms find it difficult to order drinks or snacks.'
        : 'Les hôtes installés sur les toits ou en chambre ont du mal à commander sans descendre à la réception.',
      sofraFlowBenefit: isEn
        ? 'Room & rooftop table QR stands allow instant ordering of mint tea, mocktails, and Moroccan mezze.'
        : 'Supports QR en chambre et sur les transats permettant de commander thé, boissons fraîches et mezze.',
      highlights: [
        isEn ? 'Room & terrace specific table tagging' : 'Numérotation par chambre ou salon terrasse',
        isEn ? 'Premium luxury hospitality feel' : 'Esthétique haut de gamme adaptée aux riads',
        isEn ? 'Multilingual for international travelers' : 'Idéal pour la clientèle internationale'
      ]
    }
  ];

  const current = industries.find((i) => i.id === activeSector) || industries[0];

  return (
    <section id="solutions" className="py-24 bg-[var(--bg-page)] relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-orange mb-2">
            {isEn ? 'Tailored to Every Concept' : 'Adapté à Chaque Concept'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-display tracking-tight">
            {isEn ? 'Built for Morocco’s Food-Service Leaders' : 'Conçu pour les Professionnels de la Restauration au Maroc'}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {isEn
              ? 'Whether running a busy Casablanca coffee bar, a Marrakech riad terrace, or a neighborhood grill, SofraFlow flexes to your operational workflow.'
              : 'Du café animé de Casablanca au riad de Marrakech jusqu’au snack de quartier, SofraFlow s’adapte à votre mode de service.'}
          </p>
        </div>

        {/* Sector Tabs Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {industries.map((ind) => {
            const isSelected = ind.id === activeSector;
            return (
              <button
                key={ind.id}
                onClick={() => setActiveSector(ind.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isSelected
                    ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20'
                    : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-brand-orange/30'
                }`}
              >
                {ind.icon}
                <span>{ind.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Industry Showcase Card */}
        <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Image Column (Left 5 Cols) */}
            <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full">
              <img
                src={current.image}
                alt={current.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent lg:hidden" />
              <div className="absolute bottom-4 left-4 right-4 lg:hidden text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-orange bg-white/90 px-2 py-0.5 rounded">
                  {current.name}
                </span>
                <p className="text-sm font-semibold mt-1">{current.tagline}</p>
              </div>
            </div>

            {/* Details Column (Right 7 Cols) */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                <div className="hidden lg:block">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-brand-orange">
                    {current.name}
                  </span>
                  <h3 className="text-2xl font-black text-[var(--text-primary)] font-display mt-1">
                    {current.tagline}
                  </h3>
                </div>

                {/* Challenge vs Solution */}
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs sm:text-sm">
                    <p className="font-bold text-rose-600 dark:text-rose-400">
                      {isEn ? 'Operational Friction:' : 'Friction Opérationnelle :'}
                    </p>
                    <p className="text-[var(--text-secondary)] mt-0.5">{current.painPoint}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm">
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">
                      {isEn ? 'The SofraFlow Solution:' : 'La Solution SofraFlow :'}
                    </p>
                    <p className="text-[var(--text-primary)] font-medium mt-0.5">{current.sofraFlowBenefit}</p>
                  </div>
                </div>

                {/* Key Benefits List */}
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {isEn ? 'Key Advantages' : 'Points Forts'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {current.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom CTA to start trial */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <p className="text-xs text-[var(--text-muted)]">
                  {isEn ? 'Setup takes 15 minutes' : 'Mise en place en 15 minutes'}
                </p>
                <a
                  href="/signup"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold transition-all shadow"
                >
                  <span>{isEn ? 'Start free for this business' : 'Essayer gratuitement'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
