import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Coffee,
  Sandwich,
  Cake,
  GlassWater,
  Hotel,
  Scissors,
  ArrowRight,
  Sparkles,
  Check,
  Star,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  QrCode
} from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { SEO } from '../../components/common/SEO';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { analytics } from '../../services/analytics';

export const SolutionsIndexPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  useEffect(() => {
    analytics.trackPageView('solutions_overview', 'solutions');
    window.scrollTo(0, 0);
  }, []);

  const industries = [
    {
      slug: 'restaurants',
      name: isEn ? 'Restaurants & Riads' : 'Restaurants & Riads',
      tag: isEn ? 'Gastronomy & Local Cuisine' : 'Gastronomie & Terroir',
      desc: isEn
        ? 'Showcase your tajines, grills, and traditional delicacies with high-resolution photography. Direct kitchen ticket dispatch.'
        : 'Présentez vos tajines, grillades et spécialités avec de belles photos. Réception directe des bons en cuisine.',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=700&auto=format&fit=crop&q=80',
      bullets: isEn
        ? ['Permanent table QR stands', 'Wine & drink pairing notes', 'Cooking doneness options', 'WhatsApp kitchen dispatch']
        : ['Chevalets QR permanents par table', 'Suggestions d’accords & boissons', 'Options de cuisson de viande', 'Bons envoyés en cuisine via WhatsApp'],
      btnColor: 'bg-forest hover:bg-forest-dark'
    },
    {
      slug: 'cafes',
      name: isEn ? 'Cafes & Coffee Shops' : 'Cafés & Coffee Shops',
      tag: isEn ? 'Terrace & Counter' : 'Terrasse & Comptoir',
      desc: isEn
        ? 'Hot drinks, specialty coffee, fresh juices, and beldi breakfast combos ordered without long waiter waiting times.'
        : 'Boissons chaudes, specialty coffee, jus frais et formules petit-déjeuner beldi commandés sans attente.',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=700&auto=format&fit=crop&q=80',
      bullets: isEn
        ? ['Rapid terrace ordering', 'Tea sweetness adjustments', 'Breakfast beldi combos', 'Reduced waiter back-and-forth']
        : ['Prise de commande rapide en terrasse', 'Dosage de sucre pour le thé', 'Formules petit-déjeuner beldi', 'Réduction des allers-retours serveurs'],
      btnColor: 'bg-[#8B5A2B] hover:bg-[#6F441E]'
    },
    {
      slug: 'boulangeries-patisseries',
      name: isEn ? 'Bakeries & Pastries' : 'Boulangeries & Pâtisseries',
      tag: isEn ? 'Artisanal Creations' : 'Créations Artisanales',
      desc: isEn
        ? 'Sourdough breads, birthday cakes, and gazelle horns presented with rates per kg and per slice.'
        : 'Pains au levain, gâteaux d’anniversaire et pâtisseries fines présentés avec tarifs au kilo et par parts.',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=700&auto=format&fit=crop&q=80',
      bullets: isEn
        ? ['Price per kg & per individual slice', 'Custom cake pre-ordering', 'Allergen & nut disclosures', 'Click & Collect takeaway']
        : ['Tarification au kilo et à la pièce', 'Précommandes de gâteaux personnalisés', 'Mentions allergènes & fruits à coque', 'Click & Collect à emporter'],
      btnColor: 'bg-[#B8860B] hover:bg-[#996515]'
    },
    {
      slug: 'snacks-fast-food',
      name: isEn ? 'Fast-Food & Street Food' : 'Snacks & Fast-Food',
      tag: isEn ? 'Fast Service' : 'Service Rapide',
      desc: isEn
        ? 'Gourmet burgers, French tacos, and meal deals with custom sauce choices to eliminate counter waiting lines.'
        : 'Burgers, tacos et formules complètes avec choix des sauces et suppléments pour éliminer les files d’attente.',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80',
      bullets: isEn
        ? ['Sauce & extra topping selectors', 'Queue elimination at the counter', 'Drink & fries meal upgrade', 'Direct cashier ticket printing']
        : ['Choix multiple de sauces & garnitures', 'Élimination des files au comptoir', 'Formules avec boissons & frites', 'Impression directe des bons en cuisine'],
      btnColor: 'bg-[#C0392B] hover:bg-[#A93226]'
    },
    {
      slug: 'bars-a-jus-glaciers',
      name: isEn ? 'Juice Bars & Gelato' : 'Bars à Jus & Glaciers',
      tag: isEn ? 'Freshness & Sweets' : 'Fraîcheur & Douceurs',
      desc: isEn
        ? 'Vitamin-packed smoothies, gelato cups, and crepes with instant 1-click toggling of daily available flavors.'
        : 'Smoothies vitaminés, coupes de glaces et crêpes avec mise à jour immédiate des parfums disponibles du jour.',
      image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=700&auto=format&fit=crop&q=80',
      bullets: isEn
        ? ['1-click daily flavor toggle', 'Cup sizes & topping choices', 'Fresh local seasonal fruit highlights', 'Instant mobile ordering']
        : ['Activation en 1 clic des parfums du jour', 'Tailles de pots & suppléments coulis', 'Mise en avant des fruits de saison', 'Commande instantanée sur smartphone'],
      btnColor: 'bg-[#16A085] hover:bg-[#117A65]'
    },
    {
      slug: 'hotels-tourisme',
      name: isEn ? 'Hotels & Tourism' : 'Hôtels & Établissements Touristiques',
      tag: isEn ? 'Room Service & Pool' : 'Room Service & Piscine',
      desc: isEn
        ? 'Trilingual menus (FR / EN / AR) for guests ordering in their room, poolside sunbeds, or the hotel rooftop lounge.'
        : 'Cartes trilingues (FR / EN / AR) pour les résidents en chambre, sur transat ou au lounge de l’hôtel.',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&auto=format&fit=crop&q=80',
      bullets: isEn
        ? ['Dedicated room number QR stands', 'Poolside & sunbed ordering', 'Trilingual: French, English, Arabic', 'Direct hotel staff WhatsApp dispatch']
        : ['Chevalets avec numéro de chambre', 'Commandes transats autour de la piscine', 'Trilingue complet (FR / EN / AR)', 'Acheminement direct au room service'],
      btnColor: 'bg-[#2C3E50] hover:bg-[#1A252F]'
    },
    {
      slug: 'menus-de-services',
      name: isEn ? 'Spas & Service Salons' : 'Salons & Catalogues de Services',
      tag: isEn ? 'Beauty & Wellness' : 'Beauté & Bien-être',
      desc: isEn
        ? 'Spas, barbershops, and hairdressers: display service packages and pricing via sleek QR codes at mirrors.'
        : 'Spas, barbiers et salons de coiffure : affichez vos tarifs et forfaits de soins en QR code au miroir.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=700&auto=format&fit=crop&q=80',
      bullets: isEn
        ? ['Mirror QR stands for clients', 'Package & ritual pricing in MAD', 'Duration & service descriptions', 'WhatsApp booking inquiry']
        : ['Stickers QR élégants au miroir', 'Tarifs clairs des soins et forfaits en MAD', 'Durée et descriptif des rituels', 'Réservation directe via WhatsApp'],
      btnColor: 'bg-[#5B2C6F] hover:bg-[#4A235A]'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-ink-main selection:bg-[#e35d25] selection:text-white">
      <SEO
        title={isEn ? "Industry Solutions: Digital Menus & QR Ordering in Morocco | SOFRAFLOW" : "Solutions de Menus Digitaux & Catalogues QR par Secteur au Maroc | SOFRAFLOW"}
        description={isEn ? "Explore tailored digital menus and QR solutions designed for restaurants, cafes, bakeries, snacks, ice cream parlors, hotels, and spas in Morocco." : "Découvrez nos solutions de cartes digitales et menus QR code adaptés aux restaurants, cafés, snacks, boulangeries, glaciers, hôtels et salons au Maroc."}
        canonical="/solutions"
      />

      <MarketingNav />

      {/* =========================================================
          1. HERO HEADER
      ========================================================= */}
      <section className="relative pt-16 pb-16 overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EF] to-[#FAF8F5] border-b border-gray-200/70 text-center">
        <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 rounded-full bg-[#e35d25]/10 blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e35d25]/10 border border-[#e35d25]/20 text-[#e35d25] text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-[#e35d25]" />
            <span>{isEn ? 'Tailored Hospitality Solutions' : 'Secteurs & Métiers au Maroc'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-forest font-display tracking-tight leading-[1.15]">
            {isEn ? (
              <>Solutions built for your <span className="text-[#e35d25]">exact business model</span></>
            ) : (
              <>Une solution pensée pour votre <span className="text-[#e35d25]">secteur d'activité</span></>
            )}
          </h1>

          <p className="text-base sm:text-lg text-ink-secondary max-w-2xl mx-auto leading-relaxed">
            {isEn
              ? 'Whether you serve terrace coffees, gourmet Moroccan dinners, artisan pastries, or wellness spa treatments, SOFRAFLOW fits right in.'
              : 'Que vous serviez un café en terrasse, un repas gastronomique, des pâtisseries fines ou des prestations de bien-être, SOFRAFLOW simplifie la présentation de votre offre sur mobile.'}
          </p>
        </div>
      </section>

      {/* =========================================================
          2. INDUSTRY SHOWCASE CARDS (7 Photographic Cards)
      ========================================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((ind) => (
              <div
                key={ind.slug}
                className="bg-[#FAF8F5] rounded-3xl border border-gray-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Photo header */}
                  <div className="relative h-52 overflow-hidden bg-gray-100">
                    <img
                      src={ind.image}
                      alt={ind.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-forest shadow-sm">
                      {ind.tag}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-forest font-display">{ind.name}</h3>
                    <p className="text-xs text-ink-secondary leading-relaxed">
                      {ind.desc}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-gray-200/60">
                      {ind.bullets.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2 text-xs font-semibold text-ink-main">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer button */}
                <div className="p-6 pt-0">
                  <Link to={`/solutions/${ind.slug}`}>
                    <button
                      className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 ${ind.btnColor}`}
                    >
                      <span>{isEn ? 'Discover Detailed Solution' : 'Découvrir la solution complète'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          3. SOCIAL PROOF QUOTES FROM MOROCCAN CITIES
      ========================================================= */}
      <section className="py-20 bg-[#FAF8F5] border-y border-gray-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-[#e35d25] uppercase tracking-wider">
              {isEn ? 'Frontline Feedback' : 'Retours d’Expérience au Maroc'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-forest font-display">
              {isEn ? 'What Moroccan establishment owners say' : 'Ce que disent nos partenaires restaurateurs'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed italic">
                {isEn
                  ? '"Our terrace in Marrakech has 35 tables. Waiters were overwhelmed on weekends. With Sofraflow, orders arrive directly on WhatsApp in the kitchen. Average turnover increased by 15%."'
                  : '"Notre terrasse à Marrakech compte 35 tables. Les serveurs étaient débordés le weekend. Avec Sofraflow, les commandes arrivent directement sur WhatsApp en cuisine. Le CA a augmenté de 15%."'}
              </p>
              <div className="pt-2 border-t border-gray-100">
                <span className="font-bold text-xs text-forest block">Mehdi B.</span>
                <span className="text-[10px] text-gray-500">Gérant de Riad &amp; Restaurant • Marrakech</span>
              </div>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed italic">
                {isEn
                  ? '"We used to reprint paper menus every month because of price updates and wear. Now we update prices in 10 seconds. The Arabic typography is gorgeous."'
                  : '"On réimprimait des menus papier chaque mois à cause des changements de prix et de l\'usure. Maintenant, on met à jour les tarifs en 10 secondes. L\'arabe est magnifique."'}
              </p>
              <div className="pt-2 border-t border-gray-100">
                <span className="font-bold text-xs text-forest block">Sofia L.</span>
                <span className="text-[10px] text-gray-500">Coffee Shop Artisan • Casablanca Maarif</span>
              </div>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed italic">
                {isEn
                  ? '"During peak lunch hours, waiting lines used to discourage office workers. Customers now scan the counter QR, customize sauces, and orders print right at the grill station."'
                  : '"Pendant le coup de feu de midi, la file décourageait les clients. Désormais ils scannent le QR au comptoir, choisissent leurs sauces et le bon sort immédiatement au grill."'}
              </p>
              <div className="pt-2 border-t border-gray-100">
                <span className="font-bold text-xs text-forest block">Karim T.</span>
                <span className="text-[10px] text-gray-500">Snack &amp; Burger Gourmet • Rabat Agdal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. FINAL CTA BANNER
      ========================================================= */}
      <section className="py-20 bg-[#0B132B] text-white text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#e35d25]/15 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black font-display leading-tight text-white">
            {isEn ? 'Deploy the ideal digital menu for your venue' : 'Déployez la solution idéale pour votre établissement'}
          </h2>
          <p className="text-white/80 text-base max-w-xl mx-auto leading-relaxed">
            {isEn
              ? 'Our team in Morocco will assist you with menu configuration and WhatsApp setup. Live in under an hour.'
              : 'Notre équipe au Maroc vous accompagne pour configurer votre carte et connecter WhatsApp. En ligne en moins d’une heure.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <button className="px-8 py-4 rounded-xl bg-[#e35d25] hover:bg-[#cf4f1a] text-white font-extrabold text-base shadow-lg shadow-[#e35d25]/30 transition-all flex items-center gap-2">
                <span>{isEn ? 'Start 14-Day Free Trial' : 'Créer mon menu digital maintenant'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/contact">
              <button className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-base transition-colors">
                {isEn ? 'Contact our Local Team' : 'Prendre rendez-vous avec un conseiller'}
              </button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};
