import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  X,
  HelpCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Calculator,
  TrendingUp,
  DollarSign,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { SEO } from '../../components/common/SEO';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { analytics } from '../../services/analytics';

export const PricingPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [monthlyVolume, setMonthlyVolume] = useState<number>(35000); // 35,000 MAD
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    analytics.trackPageView('pricing', 'marketing');
    window.scrollTo(0, 0);
  }, []);

  const discount = billingCycle === 'annual' ? 0.85 : 1;

  // Third-party delivery app commission comparison (typically 18% in Morocco)
  const deliveryAppCommission = Math.round(monthlyVolume * 0.18);
  const sofraflowCost = Math.round(590 * discount);
  const monthlySavings = deliveryAppCommission - sofraflowCost;

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      badge: isEn ? 'Cafes & Snacks' : 'Cafés & Snacks',
      price: Math.round(290 * discount),
      unit: isEn ? 'MAD / mo' : 'MAD / mois',
      description: isEn
        ? 'Ideal for independent coffee shops, neighborhood snacks, and small menus.'
        : 'Idéal pour les cafés indépendants, snacks de quartier et petites cartes.',
      features: isEn
        ? [
            '1 active digital menu',
            'Up to 40 catalog dishes',
            'Permanent table QR code stands',
            'Bilingual: French & English',
            'Manager live order tracking',
            '0% commission on orders',
            'Email & WhatsApp setup help'
          ]
        : [
            '1 Menu digital actif',
            'Jusqu’à 40 plats au catalogue',
            'Générateur de QR codes de table',
            'Bilingue : Français & Anglais',
            'Tableau de bord de suivi',
            'Zéro commission sur les commandes',
            'Assistance d\'installation'
          ],
      popular: false,
      cta: isEn ? 'Start 14-Day Free Trial' : 'Démarrer l’essai gratuit'
    },
    {
      id: 'growth',
      name: 'Growth',
      badge: isEn ? 'Restaurants & Riads' : 'Restaurants & Riads',
      price: Math.round(590 * discount),
      unit: isEn ? 'MAD / mo' : 'MAD / mois',
      description: isEn
        ? 'The top choice for dine-in restaurants, terraces, riads, and busy dining rooms.'
        : 'Le choix privilégié pour les restaurants avec service à table, terrasses et riads.',
      features: isEn
        ? [
            'Unlimited digital menus',
            'Unlimited dishes & categories',
            'Instant WhatsApp kitchen dispatch (Meta API)',
            'Native Trilingual: French, Arabic RTL & English',
            'Dedicated table QR codes (up to 50 tables)',
            'Dietary tags & allergen filters',
            'Modifiers & custom meat doneness',
            'Sales reports in Dirhams (MAD)',
            '0% commission on orders',
            'Priority WhatsApp support 7 days a week'
          ]
        : [
            'Menus digitaux illimités',
            'Plats & catégories illimités',
            'Bons de commande WhatsApp (API officielle)',
            'Trilingue natif : Français, Arabe RTL & Anglais',
            'QR codes dédiés par table (jusqu’à 50 tables)',
            'Étiquettes diététiques & allergènes',
            'Modificateurs & cuissons de viande',
            'Statistiques de vente & export en MAD',
            'Zéro commission sur les commandes',
            'Support WhatsApp prioritaire 7j/7'
          ],
      popular: true,
      cta: isEn ? 'Choose Growth Plan' : 'Choisir la formule Growth'
    },
    {
      id: 'pro',
      name: 'Pro',
      badge: isEn ? 'Large Venues & Groups' : 'Grands Établissements',
      price: Math.round(990 * discount),
      unit: isEn ? 'MAD / mo' : 'MAD / mois',
      description: isEn
        ? 'Designed for multi-station venues, rooftops, luxury resorts, and high-volume dining.'
        : 'Conçu pour les grands restaurants, rooftops, resorts et établissements multi-espaces.',
      features: isEn
        ? [
            'Everything included in Growth',
            'Multi-destination WhatsApp (Bar + Kitchen)',
            '80mm ESC/POS thermal ticket printing',
            'Unlimited tables & sub-rooms (Patio, Terrace, Rooftop)',
            'Team roles & granular permission access',
            'Custom brand styling & vector printing assets',
            'Dedicated Moroccan onboarding account manager'
          ]
        : [
            'Tout ce qui est inclus dans Growth',
            'Multi-destinataires WhatsApp (Bar + Cuisine)',
            'Impression de tickets thermiques 80mm ESC/POS',
            'Tables & espaces illimités (Patio, Terrasse, Rooftop)',
            'Gestion des rôles & accès équipe',
            'Personnalisation graphique avancée',
            'Accompagnateur d’intégration dédié au Maroc'
          ],
      popular: false,
      cta: isEn ? 'Choose Pro Plan' : 'Choisir la formule Pro'
    }
  ];

  // Full matrix comparison
  const matrixCategories = [
    {
      category: isEn ? 'Catalog & Menus' : 'Catalogue & Menus',
      rows: [
        { name: isEn ? 'Active digital menus' : 'Menus digitaux actifs', starter: '1', growth: isEn ? 'Unlimited' : 'Illimités', pro: isEn ? 'Unlimited' : 'Illimités' },
        { name: isEn ? 'Number of catalog items' : 'Nombre de plats au catalogue', starter: '40', growth: isEn ? 'Unlimited' : 'Illimités', pro: isEn ? 'Unlimited' : 'Illimités' },
        { name: isEn ? 'High-definition food photography' : 'Photos de plats haute définition', starter: true, growth: true, pro: true },
        { name: isEn ? '1-click out-of-stock toggle' : 'Gestion des ruptures en 1 clic', starter: true, growth: true, pro: true },
        { name: isEn ? 'Modifiers & cooking styles' : 'Options de cuisson & suppléments', starter: false, growth: true, pro: true }
      ]
    },
    {
      category: isEn ? 'Ordering & Kitchen Flow' : 'Commandes & Expédition Cuisine',
      rows: [
        { name: isEn ? 'Permanent table QR stands' : 'QR codes de table permanents', starter: true, growth: true, pro: true },
        { name: isEn ? 'Table-level auto routing' : 'Routage automatique par table', starter: false, growth: true, pro: true },
        { name: isEn ? 'WhatsApp Cloud order dispatch' : 'Bons de commande WhatsApp Cloud', starter: false, growth: true, pro: true },
        { name: isEn ? 'Multi-destination WhatsApp (Bar + Kitchen)' : 'Multi-destinataires (Bar + Cuisine)', starter: false, growth: false, pro: true },
        { name: isEn ? '80mm thermal ticket printing' : 'Impression tickets thermiques 80mm', starter: false, growth: false, pro: true },
        { name: isEn ? 'Live Kitchen Display (KDS Kanban)' : 'Écran cuisine KDS en direct', starter: true, growth: true, pro: true }
      ]
    },
    {
      category: isEn ? 'Languages & Localization' : 'Langues & Localisation',
      rows: [
        { name: isEn ? 'French & English' : 'Français & Anglais', starter: true, growth: true, pro: true },
        { name: isEn ? 'Native Arabic with Right-to-Left (RTL)' : 'Arabe natif de droite à gauche (RTL)', starter: false, growth: true, pro: true },
        { name: isEn ? 'Moroccan Dirham (MAD) calculations' : 'Calculs certifiés en Dirhams (MAD)', starter: true, growth: true, pro: true }
      ]
    },
    {
      category: isEn ? 'Support & Guarantees' : 'Support & Garanties',
      rows: [
        { name: isEn ? '0% Sales Commission' : 'Zéro commission sur les ventes', starter: true, growth: true, pro: true },
        { name: isEn ? 'Dedicated onboarding manager' : 'Accompagnateur d\'intégration dédié', starter: false, growth: false, pro: true },
        { name: isEn ? 'Priority WhatsApp assistance' : 'Support WhatsApp prioritaire 7j/7', starter: false, growth: true, pro: true }
      ]
    }
  ];

  const pricingFaqs = isEn
    ? [
        {
          q: 'Are there really zero commissions taken on my restaurant sales?',
          a: 'Absolutely 0%. Unlike traditional delivery aggregator apps that take between 15% and 25% of your food revenue, SOFRAFLOW charges only a fixed monthly subscription in Moroccan Dirhams. All sales stay 100% in your pocket.'
        },
        {
          q: 'How does the 14-day free trial work?',
          a: 'You can sign up in 60 seconds without entering any credit card. You get full access to build your menu, test table QR codes, and connect WhatsApp. You can upgrade or cancel anytime.'
        },
        {
          q: 'How do I pay for my subscription in Morocco?',
          a: 'We accept Moroccan bank cards (CMI), wire transfers (CIH, Attijariwafa Bank, BCP, Société Générale, etc.), or corporate invoices with complete ICE and tax registration for your accounting.'
        },
        {
          q: 'What if I need to change my plan later?',
          a: 'You can upgrade or downgrade between Starter, Growth, and Pro at any time right from your merchant billing dashboard. Changes take effect immediately.'
        },
        {
          q: 'Do I need to buy expensive touchscreen POS terminals?',
          a: 'No! SOFRAFLOW runs on any smartphone, iPad, Android tablet, or existing laptop. Your kitchen brigade can receive order slips on WhatsApp or view the live KDS Kanban on any browser.'
        }
      ]
    : [
        {
          q: 'Y a-t-il réellement zéro commission prélevée sur mes commandes ?',
          a: 'Absolument 0%. Contrairement aux applications de livraison qui prélèvent entre 15% et 25% de votre chiffre d’affaires, SOFRAFLOW fonctionne sur un abonnement fixe et prévisible en Dirhams marocains. Vous conservez 100% de votre marge.'
        },
        {
          q: 'Comment fonctionne l’essai gratuit de 14 jours ?',
          a: 'Vous créez votre compte en 60 secondes sans renseigner aucune carte bancaire. Vous accédez à toutes les fonctionnalités pour importer votre carte, générer vos QR codes et tester l’envoi WhatsApp.'
        },
        {
          q: 'Quels sont les modes de paiement acceptés au Maroc ?',
          a: 'Nous acceptons les cartes bancaires marocaines (CMI), les virements bancaires (CIH, Attijariwafa Bank, BCP, Société Générale, BMCE...) ainsi que la facturation professionnelle avec ICE et mentions fiscales légales pour votre comptabilité.'
        },
        {
          q: 'Puis-je changer de formule en cours d’année ?',
          a: 'Oui. Vous pouvez passer d’une formule Starter à Growth ou Pro à tout moment depuis votre espace gérant. La mise à jour est immédiate.'
        },
        {
          q: 'Dois-je acheter des caisses tactiles coûteuses ?',
          a: 'Aucun matériel dédié n’est requis ! SOFRAFLOW fonctionne sur smartphone, tablette Android, iPad ou ordinateur. Vos équipes peuvent simplement recevoir les bons sur WhatsApp ou afficher le tableau cuisine sur un écran existant.'
        }
      ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-ink-main selection:bg-[#e35d25] selection:text-white">
      <SEO
        title={isEn ? "Pricing in Moroccan Dirhams (MAD) & 0% Commission | SOFRAFLOW" : "Tarifs Menus Digitaux & QR Code en Dirhams (MAD) | SOFRAFLOW"}
        description={isEn ? "Transparent flat subscriptions with zero sales commissions for restaurants, cafes, and hospitality in Morocco. Starter (290 MAD), Growth (590 MAD), Pro (990 MAD)." : "Abonnements transparents sans commission pour restaurants, cafés et commerces au Maroc. Formules Starter (290 MAD), Growth (590 MAD) et Pro (990 MAD)."}
        canonical="/pricing"
      />

      <MarketingNav />

      {/* =========================================================
          1. HERO & BILLING TOGGLE
      ========================================================= */}
      <section className="relative pt-16 pb-16 overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EF] to-[#FAF8F5] border-b border-gray-200/70 text-center">
        <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 rounded-full bg-[#e35d25]/10 blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e35d25]/10 border border-[#e35d25]/20 text-[#e35d25] text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-[#e35d25]" />
            <span>{isEn ? '0% Commission • Flat Pricing in MAD' : '0% Commission • Tarifs Fixes en Dirhams (MAD)'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-forest font-display tracking-tight leading-[1.15]">
            {isEn ? (
              <>Simple, transparent pricing <span className="text-[#e35d25]">adapted to Morocco</span></>
            ) : (
              <>Des abonnements clairs et transparents <span className="text-[#e35d25]">adaptés au Maroc</span></>
            )}
          </h1>

          <p className="text-base text-ink-secondary max-w-xl mx-auto leading-relaxed">
            {isEn
              ? 'No hidden setup fees. No sales commissions. Keep 100% of your earnings with predictable monthly pricing.'
              : 'Aucun frais de dossier caché. Aucune commission sur vos ventes. Tous les tarifs sont adaptés aux professionnels de la restauration.'}
          </p>

          {/* Billing Switcher */}
          <div className="pt-6 flex items-center justify-center gap-3 text-xs font-semibold">
            <span className={billingCycle === 'monthly' ? 'text-forest font-bold' : 'text-gray-500'}>
              {isEn ? 'Monthly billing' : 'Facturation mensuelle'}
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                billingCycle === 'annual' ? 'bg-[#e35d25]' : 'bg-gray-300'
              }`}
              aria-label={isEn ? "Switch to annual billing" : "Basculer vers la facturation annuelle"}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={billingCycle === 'annual' ? 'text-forest font-bold' : 'text-gray-500'}>
              {isEn ? 'Annual commitment' : 'Facturation annuelle'}{' '}
              <span className="text-[#e35d25] font-extrabold">(-15%)</span>
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. PRICING CARDS (Starter, Growth, Pro)
      ========================================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  p.popular
                    ? 'bg-forest text-white border-2 border-gold shadow-2xl md:-translate-y-3'
                    : 'bg-[#FAF8F5] border border-gray-200/90 shadow-sm hover:shadow-lg'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#e35d25] text-white text-[11px] font-extrabold tracking-wide uppercase shadow-md">
                    {isEn ? 'Most Popular' : 'Le Plus Choisi au Maroc'}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className={`font-bold text-2xl font-display ${p.popular ? 'text-white' : 'text-forest'}`}>
                      {p.name}
                    </h3>
                    <Badge variant={p.popular ? 'gold' : 'neutral'}>{p.badge}</Badge>
                  </div>

                  <div className="mb-4">
                    <span className={`text-4xl sm:text-5xl font-black font-display ${p.popular ? 'text-white' : 'text-forest'}`}>
                      {p.price}
                    </span>
                    <span className={`text-sm font-medium ${p.popular ? 'text-white/70' : 'text-gray-500'}`}>
                      {' '}{p.unit}
                    </span>
                  </div>

                  <p className={`text-xs mb-8 leading-relaxed ${p.popular ? 'text-white/80' : 'text-ink-secondary'}`}>
                    {p.description}
                  </p>

                  <ul className="space-y-3 text-xs mb-8">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${p.popular ? 'text-gold' : 'text-emerald-600'}`} />
                        <span className={p.popular ? 'text-white/95' : 'text-ink-main'}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to="/signup">
                  <button
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                      p.popular
                        ? 'bg-[#e35d25] hover:bg-[#cf4f1a] text-white'
                        : 'bg-white hover:bg-gray-100 text-forest border border-gray-200'
                    }`}
                  >
                    <span>{p.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            ))}
          </div>

          {/* Modes de paiement disponibles au Maroc */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#FAF8F5] border border-gray-200/90 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2.5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-forest" />
                <span>Modes de paiement disponibles au Maroc</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-ink-main max-w-2xl leading-relaxed">
                {isEn
                  ? "Pay for your subscription via domestic Moroccan bank transfer or local money transfer services, tailored to your restaurant accounting needs."
                  : "Payez votre abonnement par virement bancaire ou via les services de transfert d'argent disponibles au Maroc, selon les modalités proposées."}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                <span className="inline-flex items-center px-3 py-1 rounded-xl bg-white border border-gray-200 text-xs font-bold text-forest shadow-xs">
                  Virement bancaire
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-xl bg-white border border-gray-200 text-xs font-bold text-[#E0311D] shadow-xs">
                  CIH Bank
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-xl bg-white border border-gray-200 text-xs font-bold text-[#D38800] shadow-xs">
                  Attijariwafa bank
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-xl bg-white border border-gray-200 text-xs font-bold text-[#EA580C] shadow-xs">
                  Cash Plus
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-xl bg-white border border-gray-200 text-xs font-bold text-neutral-900 shadow-xs">
                  Western Union
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-xl bg-white border border-gray-200 text-xs font-bold text-[#E0311D] shadow-xs">
                  MoneyGram
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-xl bg-white border border-gray-200 text-xs font-bold text-[#F15A24] shadow-xs">
                  Ria
                </span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Link to="/login?redirect=/app/billing">
                <button className="px-6 py-3.5 rounded-xl font-bold text-sm bg-forest hover:bg-forest-dark text-white shadow-md flex items-center gap-2 transition-all">
                  <span>Choisir mon abonnement</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. INTERACTIVE 0% COMMISSION SAVINGS CALCULATOR
      ========================================================= */}
      <section className="py-20 bg-[#FAF8F5] border-y border-gray-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xl space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#e35d25] uppercase tracking-wider">
                {isEn ? '0% Commission Impact' : 'Calculateur d’Économie Réelle'}
              </span>
              <h2 className="text-3xl font-extrabold text-forest font-display">
                {isEn ? 'How much do you save compared to delivery apps?' : 'Combien économisez-vous par rapport aux commissions classiques ?'}
              </h2>
              <p className="text-xs text-ink-secondary max-w-lg mx-auto">
                {isEn
                  ? 'Delivery apps take between 15% and 22% on every single order. See what happens when you switch to direct QR & WhatsApp ordering.'
                  : 'Les applications intermédiaires prélèvent en moyenne 18% sur chaque commande. Calculez votre gain net avec SOFRAFLOW.'}
              </p>
            </div>

            {/* Interactive Slider */}
            <div className="space-y-3 bg-[#FAF8F5] p-6 rounded-2xl border border-gray-200">
              <div className="flex justify-between items-center text-sm font-bold text-forest">
                <span>{isEn ? 'Your Monthly Order Turnover:' : 'Votre volume de commandes mensuel :'}</span>
                <span className="text-xl text-[#e35d25] font-black">{monthlyVolume.toLocaleString()} MAD</span>
              </div>
              <input
                type="range"
                min="10000"
                max="150000"
                step="5000"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#e35d25]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>10 000 MAD</span>
                <span>75 000 MAD</span>
                <span>150 000 MAD</span>
              </div>
            </div>

            {/* Comparison Results */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                <span className="text-[10px] uppercase font-bold text-red-700 block">
                  {isEn ? 'Third-Party Fees (18%)' : 'Commissions Applis (18%)'}
                </span>
                <span className="text-2xl font-black text-red-600 block mt-1">
                  -{deliveryAppCommission.toLocaleString()} MAD
                </span>
                <span className="text-[10px] text-red-500 block mt-0.5">{isEn ? 'Lost every month' : 'Perdus chaque mois'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-forest/5 border border-forest/10">
                <span className="text-[10px] uppercase font-bold text-forest block">
                  {isEn ? 'SOFRAFLOW Growth' : 'Abonnement SOFRAFLOW'}
                </span>
                <span className="text-2xl font-black text-forest block mt-1">
                  {sofraflowCost} MAD
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">{isEn ? 'Flat predictable cost' : 'Coût fixe prévisible'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                  {isEn ? 'Net Monthly Savings' : 'Votre Économie Nette'}
                </span>
                <span className="text-2xl font-black text-emerald-600 block mt-1">
                  +{monthlySavings.toLocaleString()} MAD
                </span>
                <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                  {isEn ? 'In your bank account' : 'Dans votre trésorerie'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. FULL FEATURE COMPARISON MATRIX TABLE
      ========================================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-[#e35d25] uppercase tracking-wider">
              {isEn ? 'Full Comparison' : 'Matrice Comparative Complète'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-forest font-display">
              {isEn ? 'Compare every feature in detail' : 'Comparez le détail de chaque formule'}
            </h2>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#FAF8F5]">
                    <th className="py-4 px-6 font-bold text-forest w-1/2">
                      {isEn ? 'Features' : 'Fonctionnalités'}
                    </th>
                    <th className="py-4 px-4 font-bold text-forest text-center w-1/6">Starter</th>
                    <th className="py-4 px-4 font-extrabold text-white bg-forest text-center w-1/6">Growth</th>
                    <th className="py-4 px-4 font-bold text-forest text-center w-1/6">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {matrixCategories.map((cat, cIdx) => (
                    <React.Fragment key={cIdx}>
                      <tr className="bg-gray-100/70">
                        <td colSpan={4} className="py-2.5 px-6 font-bold text-xs uppercase tracking-wider text-forest">
                          {cat.category}
                        </td>
                      </tr>
                      {cat.rows.map((r, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-[#FAF8F5]/50' : ''}>
                          <td className="py-3.5 px-6 font-medium text-ink-main">{r.name}</td>
                          <td className="py-3.5 px-4 text-center">
                            {typeof r.starter === 'boolean' ? (
                              r.starter ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />
                            ) : (
                              <span className="font-bold text-xs">{r.starter}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center bg-forest/5 font-semibold text-emerald-700">
                            {typeof r.growth === 'boolean' ? (
                              r.growth ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />
                            ) : (
                              <span className="font-bold text-xs">{r.growth}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {typeof r.pro === 'boolean' ? (
                              r.pro ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />
                            ) : (
                              <span className="font-bold text-xs">{r.pro}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          5. PRICING FAQ ACCORDION
      ========================================================= */}
      <section className="py-20 bg-[#FAF8F5] border-t border-gray-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-2">
            <span className="text-xs font-bold text-[#e35d25] uppercase tracking-wider">
              {isEn ? 'Questions on Billing?' : 'Facturation au Maroc'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-forest font-display">
              {isEn ? 'Frequently Asked Questions' : 'Questions Fréquentes sur les Tarifs'}
            </h2>
          </div>

          <div className="space-y-3.5">
            {pricingFaqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-2xl p-5 bg-white transition-all shadow-xs"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left text-sm sm:text-base font-bold text-forest focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                      openFaq === index ? 'transform rotate-180 text-forest' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <p className="mt-3 text-xs sm:text-sm text-ink-secondary leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          6. FINAL DARK CTA BANNER
      ========================================================= */}
      <section className="py-20 bg-[#0B132B] text-white text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#e35d25]/15 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black font-display leading-tight text-white">
            {isEn ? 'Start your 14-day free trial today' : 'Démarrez votre essai gratuit de 14 jours'}
          </h2>
          <p className="text-white/80 text-base max-w-xl mx-auto leading-relaxed">
            {isEn
              ? 'No credit card required. Test your digital menu, print sample QR codes, and see your first WhatsApp order.'
              : 'Sans carte bancaire requise. Configurez votre carte, testez vos QR codes et recevez votre première commande WhatsApp.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <button className="px-8 py-4 rounded-xl bg-[#e35d25] hover:bg-[#cf4f1a] text-white font-extrabold text-base shadow-lg shadow-[#e35d25]/30 transition-all flex items-center gap-2">
                <span>{isEn ? 'Create My Menu in 15 Minutes' : 'Créer mon menu en 15 minutes'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/contact">
              <button className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-base transition-colors">
                {isEn ? 'Speak with our Team' : 'Contacter l’équipe commerciale'}
              </button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};
