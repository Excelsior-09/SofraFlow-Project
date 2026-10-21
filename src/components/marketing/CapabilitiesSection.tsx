import React, { useState } from 'react';
import {
  Menu,
  QrCode,
  Sparkles,
  TrendingUp,
  Flame,
  Star,
  BarChart3,
  Coins,
  SearchCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const CapabilitiesSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<number>(0);

  const capabilities = [
    {
      id: 'menu_creation',
      icon: <Menu className="w-5 h-5 text-brand-orange" />,
      title: isEn ? 'Digital Menu Creation & Management' : 'Création & Gestion de Menu Digital',
      shortDesc: isEn
        ? 'Build high-converting, photo-rich menus with instant category management and live MAD pricing.'
        : 'Concevez des cartes visuelles attractives avec gestion instantanée des catégories et prix en MAD.',
      example: isEn
        ? 'Café Atlas updates seasonal smoothies and hides sold-out pastries across all tables in 5 seconds.'
        : 'Le Café Atlas ajoute ses smoothies d’été et masque une pâtisserie épuisée sur toutes les tables en 5 secondes.',
      previewType: 'menu',
      badge: isEn ? 'Core Foundation' : 'Socle Essentiel'
    },
    {
      id: 'qr_ordering',
      icon: <QrCode className="w-5 h-5 text-brand-orange" />,
      title: isEn ? 'QR-Code Ordering & Table Routing' : 'Commandes par QR Code & Gestion des Tables',
      shortDesc: isEn
        ? 'Guests scan a table stand with their camera—no app download required. Browse, select, and review orders effortlessly.'
        : 'Les clients scannent le support sans installer d’application. Consultation fluide et validation de commande instantanée.',
      example: isEn
        ? 'Dine-in guests at Table 12 place their lunch order without waiting for a printed card or free waiter.'
        : 'Les clients de la Table 12 commandent leur déjeuner sans attendre le passage d’un serveur avec la carte papier.',
      previewType: 'qr',
      badge: isEn ? 'Frictionless' : 'Sans Application'
    },
    {
      id: 'ai_assistant',
      icon: <Sparkles className="w-5 h-5 text-brand-orange" />,
      title: isEn ? 'AI Customer Assistant (Zina)' : 'Assistant Client IA (Zina)',
      shortDesc: isEn
        ? 'A polite, knowledgeable digital concierge that understands French, English, and budget questions like "What can I get for under 80 MAD?".'
        : 'Un guide digital bilingue qui comprend les questions de budget, régimes ou préférences en français et anglais.',
      example: isEn
        ? 'Recommends a Smash Burger (78 MAD) when asked for satisfying meals under 80 MAD, explaining ingredients in detail.'
        : 'Propose un Smash Burger (78 MAD) à la demande d’un plat copieux sous 80 MAD en décrivant précisément les ingrédients.',
      previewType: 'ai_chat',
      badge: isEn ? 'AI Powered' : 'Propulsé par l’IA'
    },
    {
      id: 'smart_upselling',
      icon: <TrendingUp className="w-5 h-5 text-brand-orange" />,
      title: isEn ? 'Smart Upselling & Complementary Pairings' : 'Vente Additionnelle & Accompagnements',
      shortDesc: isEn
        ? 'Automatically suggests natural pairings—such as artisanal mint tea with pastries or seasoned fries with gourmet burgers.'
        : 'Propose automatiquement les accords parfaits—comme le thé à la menthe avec une corne de gazelle ou des frites maison.',
      example: isEn
        ? 'When a tagine is added to the cart, the system gently presents fresh Moroccan salads and refreshing drinks.'
        : 'Lorsqu’un tajine est ajouté au panier, l’application suggère élégamment un zaalouk ou une citronnade fraîche.',
      previewType: 'upsell',
      badge: isEn ? '+14% to 18% AOV' : '+14% à 18% Panier'
    },
    {
      id: 'popular_discovery',
      icon: <Flame className="w-5 h-5 text-brand-orange" />,
      title: isEn ? 'Social Proof & Popular Order Discovery' : 'Preuve Sociale & Plats Populaires',
      shortDesc: isEn
        ? 'Highlight bestselling dishes, chef specials, and verified favorites so new guests order with complete confidence.'
        : 'Mettez en avant vos meilleures ventes et coups de cœur du chef pour rassurer et guider les nouveaux clients.',
      example: isEn
        ? '“Ordered 142 times this week” badge builds trust and accelerates decision time on signature dishes.'
        : 'Le badge « Commandé 142 fois cette semaine » rassure immédiatement le client et accélère son choix.',
      previewType: 'popular',
      badge: isEn ? 'Social Proof' : 'Preuve Sociale'
    },
    {
      id: 'google_reviews',
      icon: <Star className="w-5 h-5 text-brand-orange" />,
      title: isEn ? 'Google Review Experience & Guest Feedback' : 'Avis Google & Retours Clients',
      shortDesc: isEn
        ? 'Invite delighted guests to share their authentic Google reviews right as they wrap up dining, without gating or fake ratings.'
        : 'Invitez vos clients ravis à laisser leur avis authentique sur Google à la fin du repas, en toute transparence.',
      example: isEn
        ? 'Generates a seamless one-click link to your verified Google Maps listing upon simulated order completion.'
        : 'Propose un lien direct vers votre fiche Google Maps certifiée dès la finalisation de l’expérience.',
      previewType: 'reviews',
      badge: isEn ? 'Reputation' : 'Réputation'
    },
    {
      id: 'sales_analytics',
      icon: <BarChart3 className="w-5 h-5 text-brand-orange" />,
      title: isEn ? 'Sales Analytics & Performance Intelligence' : 'Analyses des Ventes & Performance',
      shortDesc: isEn
        ? 'Track real-time revenue, total order volume, average basket size (AOV), and category breakdowns in Moroccan Dirhams (MAD).'
        : 'Suivez le chiffre d’affaires en MAD, le volume de commandes, le panier moyen et la répartition par catégorie.',
      example: isEn
        ? 'Identifies that beverages account for 28% of total weekly revenue with highest gross margin contribution.'
        : 'Révèle que les boissons représentent 28% des ventes hebdomadaires avec la plus forte contribution à la marge.',
      previewType: 'analytics',
      badge: isEn ? 'Data Driven' : 'Données Réelles'
    },
    {
      id: 'financial_assistant',
      icon: <Coins className="w-5 h-5 text-brand-orange" />,
      title: isEn ? 'AI Financial Assistant' : 'Assistant Financier IA',
      shortDesc: isEn
        ? 'Ask business questions in plain French or English: “Which items should I review to improve my gross margin?”.'
        : 'Posez vos questions de gestion en français : « Quels plats analyser pour optimiser ma marge brute ? ».',
      example: isEn
        ? 'Explains the difference between high-ticket meat dishes and high-percentage beverage margins with actionable advice.'
        : 'Explique la différence de contribution entre plats carnés et boissons de spécialité avec des conseils concrets.',
      previewType: 'finance_ai',
      badge: isEn ? 'Owner Tool' : 'Outil Gérant'
    },
    {
      id: 'menu_analyzer',
      icon: <SearchCheck className="w-5 h-5 text-brand-orange" />,
      title: isEn ? 'AI Menu & Sales Analyzer' : 'Analyseur IA de Menu & Carte',
      shortDesc: isEn
        ? 'Evaluate dish velocity and estimated profit quadrants (Star items, workhorses, and items needing better presentation).'
        : 'Analysez la rentabilité de vos plats (plats vedettes, piliers de volume et plats nécessitant de meilleures photos).',
      example: isEn
        ? 'Flags high-volume dishes that lack descriptions or photo assets to unlock higher conversion.'
        : 'Signale les plats populaires sans photo ou description détaillée pour débloquer plus de ventes.',
      previewType: 'matrix',
      badge: isEn ? 'Menu Engineering' : 'Menu Engineering'
    }
  ];

  const current = capabilities[activeTab];

  return (
    <section id="features" data-section="capabilities" className="py-24 bg-[var(--bg-page)] relative scroll-mt-24">
      {/* Anchor alias for backward compatibility */}
      <span id="capabilities" className="absolute -top-24" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-orange mb-2">
            {isEn ? 'One Connected Ecosystem' : 'Un Écosystème Connecté'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-display tracking-tight">
            {isEn ? '9 Capabilities to Power Your Restaurant Growth' : '9 Piliers pour Accélérer la Croissance de Votre Établissement'}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {isEn
              ? 'SofraFlow brings menu management, guest ordering, AI assistance, and business intelligence into one unified platform.'
              : 'SofraFlow unifie la gestion de carte, la commande client, l’assistance IA et le pilotage des ventes en un seul outil.'}
          </p>
        </div>

        {/* Interactive Capability Selector Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Column (Left 5 Cols) */}
          <div className="lg:col-span-5 space-y-2">
            {capabilities.map((cap, idx) => {
              const isSelected = activeTab === idx;
              return (
                <button
                  key={cap.id}
                  onClick={() => setActiveTab(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                    isSelected
                      ? 'bg-[var(--bg-card)] border-brand-orange shadow-md shadow-brand-orange/10'
                      : 'bg-transparent border-transparent hover:bg-[var(--bg-card)]/50 hover:border-[var(--border-subtle)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-brand-orange/10 text-brand-orange' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'
                      }`}
                    >
                      {cap.icon}
                    </div>
                    <div className="truncate">
                      <p
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {cap.title}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">{cap.badge}</p>
                    </div>
                  </div>
                  {isSelected && <ArrowRight className="w-4 h-4 text-brand-orange shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Deep-Dive Interactive Preview Card (Right 7 Cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 sm:p-8 shadow-xl relative overflow-hidden">
              
              {/* Header inside Preview */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                    {current.icon}
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange text-[10px] font-extrabold uppercase tracking-wide">
                      {current.badge}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] mt-1 font-display">
                      {current.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Description & Moroccan Example */}
              <div className="py-6 space-y-4">
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  {current.shortDesc}
                </p>

                <div className="p-4 rounded-2xl bg-brand-orange/5 border border-brand-orange/20 space-y-1.5">
                  <p className="text-xs font-bold text-brand-orange uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Moroccan Restaurant Scenario' : 'Cas Concret au Maroc'}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                    {current.example}
                  </p>
                </div>
              </div>

              {/* Dynamic Illustrative Mockup for the Active Capability */}
              <div className="pt-2">
                <div className="rounded-2xl bg-[var(--bg-page)] border border-[var(--border-subtle)] p-5">
                  
                  {current.previewType === 'menu' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-[var(--text-muted)]">
                        <span>{isEn ? 'Live Category Editor' : 'Éditeur de Catégorie en Direct'}</span>
                        <span className="text-emerald-500">● {isEn ? 'Instant Sync' : 'Synchronisation Immédiate'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)]">Tajine d’Agneau aux Pruneaux</p>
                          <p className="text-[11px] text-[var(--text-muted)]">95 MAD • Spécialité de l'Atlas</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                          {isEn ? 'Available' : 'En vente'}
                        </span>
                      </div>
                    </div>
                  )}

                  {current.previewType === 'qr' && (
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-white p-2 border border-gray-200 flex items-center justify-center shrink-0">
                        <QrCode className="w-14 h-14 text-brand-navy" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[var(--text-primary)]">Table 4 Stand • QR Permanent</p>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          {isEn
                            ? 'Scan once with iPhone or Android camera. Opens immediately in mobile browser with zero app installation.'
                            : 'Scannable avec tout smartphone. Ouvre instantanément la carte sans télécharger d’application.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {current.previewType === 'ai_chat' && (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-brand-navy/5 dark:bg-brand-navy/30 text-xs text-[var(--text-primary)]">
                        <strong>{isEn ? 'Guest:' : 'Client :'}</strong> {isEn ? '“What can I get for under 80 MAD?”' : '« Que puis-je commander pour moins de 80 MAD ? »'}
                      </div>
                      <div className="p-2.5 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-xs text-[var(--text-primary)]">
                        <strong>Zina:</strong> {isEn ? '“Our Atlas Gourmet Smash Burger (78 MAD) is our top pick under 80 MAD!”' : '« Notre Smash Burger Gourmet (78 MAD) est le favori incontournable sous 80 MAD ! »'}
                      </div>
                    </div>
                  )}

                  {current.previewType === 'upsell' && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-brand-orange/30">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🫖</span>
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)]">
                            {isEn ? 'Frequently Paired Together' : 'Souvent Commandé Ensemble'}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)]">Thé à la Menthe Fraîche (+22 MAD)</p>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg bg-brand-orange text-white text-xs font-bold">
                        + {isEn ? 'Add to order' : 'Ajouter'}
                      </button>
                    </div>
                  )}

                  {current.previewType === 'popular' && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)]">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">
                          {isEn ? 'Signature Atlas Tagine' : 'Tajine Signature de l’Atlas'}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {isEn ? '🔥 Ordered 98 times this week • 4.9 ★ Rating' : '🔥 Commandé 98 fois cette semaine • 4.9 ★'}
                        </p>
                      </div>
                    </div>
                  )}

                  {current.previewType === 'reviews' && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)]">
                      <div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span className="text-xs font-bold ml-1 text-[var(--text-primary)]">5.0 on Google</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] mt-1">
                          {isEn ? 'Polite post-dining review invitation directed to your verified Google link' : 'Invitation transparente vers votre page Google Maps officielle'}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 text-xs font-bold">
                        Google Maps
                      </span>
                    </div>
                  )}

                  {current.previewType === 'analytics' && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                        <p className="text-[10px] text-[var(--text-muted)]">{isEn ? 'Weekly Revenue' : 'Chiffre / Semaine'}</p>
                        <p className="text-xs font-bold text-brand-orange">46,250 MAD</p>
                      </div>
                      <div className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                        <p className="text-[10px] text-[var(--text-muted)]">{isEn ? 'Total Orders' : 'Commandes'}</p>
                        <p className="text-xs font-bold text-[var(--text-primary)]">384</p>
                      </div>
                      <div className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                        <p className="text-[10px] text-[var(--text-muted)]">{isEn ? 'Average Ticket' : 'Panier Moyen'}</p>
                        <p className="text-xs font-bold text-emerald-600">120.4 MAD</p>
                      </div>
                    </div>
                  )}

                  {current.previewType === 'finance_ai' && (
                    <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-brand-orange/20 space-y-1.5">
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        {isEn ? '💡 AI Financial Insight:' : '💡 Analyse Financière IA :'}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        {isEn
                          ? '“Specialty beverages carry lower ingredient costs relative to retail price in MAD, contributing higher gross margin percentages than meat items.”'
                          : '« Les boissons de spécialité présentent un ratio coût matière / prix très favorable, dégageant une marge brute proportionnellement plus élevée que les viandes. »'}
                      </p>
                    </div>
                  )}

                  {current.previewType === 'matrix' && (
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold">
                        ⭐ {isEn ? 'Star Dish: Smash Burger (High volume & margin)' : 'Plat Vedette : Smash Burger (Fort volume & marge)'}
                      </div>
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold">
                        💎 {isEn ? 'Hidden Gem: Avocado Toast (Needs photo spotlight)' : 'Pépite : Toast Avocat (À valoriser en photo)'}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <p className="text-[11px] text-[var(--text-muted)]">
                  {isEn ? 'Illustrative prototype preview' : 'Aperçu prototype illustratif'}
                </p>
                <a
                  href="#demo-section"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-brand-orange-hover"
                >
                  <span>{isEn ? 'Test customer experience' : 'Tester l’expérience client'}</span>
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
