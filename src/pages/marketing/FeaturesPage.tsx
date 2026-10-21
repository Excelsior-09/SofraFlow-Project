import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  MessageSquare,
  QrCode,
  Globe,
  BarChart3,
  ShieldCheck,
  Sliders,
  Printer,
  Sparkles,
  ArrowRight,
  Check,
  CheckCircle2,
  Bell,
  Zap,
  TrendingUp,
  Store,
  Layers,
  ShoppingBag,
  Hotel,
  Share2,
  Clock,
  Eye,
  CheckCheck,
  LayoutDashboard
} from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { SEO } from '../../components/common/SEO';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { analytics } from '../../services/analytics';

export const FeaturesPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  useEffect(() => {
    analytics.trackPageView('features', 'marketing');
    window.scrollTo(0, 0);
  }, []);

  // 8 Pillars of the platform
  const primaryFeatures = [
    {
      id: 'qr',
      badge: isEn ? 'Table QR & NFC' : 'QR & NFC Permanent',
      badgeColor: 'gold',
      title: isEn ? 'Permanent Table QR Stands & Vector Exports' : 'QR Codes de Table Permanents & Exports Vectoriels',
      subtitle: isEn
        ? 'Update prices in MAD and hide sold-out items without ever paying for physical reprints.'
        : 'Mettez à jour vos tarifs en Dirhams et masquez les ruptures sans jamais repayer d\'impression papier.',
      desc: isEn
        ? 'Each QR code is permanently linked to your venue and specific table number (e.g. Table 4). Download print-ready high-resolution SVG and PDF files, or embed contactless NFC chips.'
        : 'Chaque QR code est relié de manière pérenne à votre établissement et au numéro de table exact (ex. Table 4). Téléchargez vos fichiers vectoriels haute définition SVG et PDF, ou activez les puces sans contact NFC.',
      bullets: isEn
        ? ['Permanent URLs that never expire', 'Table number pre-filled in guest carts', 'Print-ready SVG & PDF downloads', 'NFC tap-to-open compatible']
        : ['URLs permanentes sans date d\'expiration', 'Numéro de table pré-rempli au panier', 'Fichiers vectoriels SVG & PDF haute résolution', 'Compatible puces sans contact NFC'],
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=700&auto=format&fit=crop&q=80',
      icon: <QrCode className="w-6 h-6 text-[#e35d25]" />
    },
    {
      id: 'whatsapp',
      badge: isEn ? 'Meta Official API' : 'API Officielle Meta',
      badgeColor: 'success',
      title: isEn ? 'Instant WhatsApp Cloud Kitchen Dispatch' : 'Acheminement Instantané des Bons sur WhatsApp',
      subtitle: isEn
        ? 'Structured order tickets arrive straight on the chef or manager phone in under 2 seconds.'
        : 'Les bons de commande structurés arrivent directement sur le WhatsApp du chef ou du gérant en moins de 2 secondes.',
      desc: isEn
        ? 'Connect your WhatsApp Business number via Meta’s official Cloud API. As soon as a guest confirms their cart, an organized receipt with table number, customizations, and MAD total is dispatched.'
        : 'Connectez votre numéro WhatsApp Business via l’API officielle WhatsApp Cloud de Meta. Dès que le client confirme son panier, un ticket structuré avec numéro de table, suppléments et total en MAD est expédié.',
      bullets: isEn
        ? ['Meta WhatsApp Business Cloud API compliant', 'Multi-recipient routing (Bar + Kitchen)', 'Instant audio notification chime', 'Zero POS terminal hardware required']
        : ['Conforme à l\'API officielle Meta Cloud', 'Routage multi-destinataires (Bar + Cuisine)', 'Alerte sonore immédiate sur téléphone', 'Zéro matériel de caisse requis'],
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=700&auto=format&fit=crop&q=80',
      icon: <MessageSquare className="w-6 h-6 text-emerald-600" />
    },
    {
      id: 'languages',
      badge: isEn ? 'Multilingual' : 'Multilingue & RTL',
      badgeColor: 'neutral',
      title: isEn ? 'Native Trilingual with Right-to-Left Arabic' : 'Trilingue Natif avec Arabe de Droite à Gauche (RTL)',
      subtitle: isEn
        ? 'Flawless Arabic typography alongside French and English for locals and tourists alike.'
        : 'Une typographie arabe soignée aux côtés du français et de l\'anglais pour les habitués et les touristes.',
      desc: isEn
        ? 'Morocco welcomes guests from all over the world. Sofraflow lets diners switch between French, Arabic, and English instantly without losing their cart contents or table selection.'
        : 'Le Maroc accueille des clients du monde entier. SOFRAFLOW permet de basculer instantanément entre Français, Arabe et Anglais sans jamais perdre la sélection du panier ni la table.',
      bullets: isEn
        ? ['Native Right-to-Left (RTL) Arabic layout', 'Cart persists across language changes', 'Category and modifier translations', 'Moroccan Dirham (MAD) localization']
        : ['Affichage de droite à gauche (RTL) soigné', 'Persistance du panier lors du changement de langue', 'Traduction des catégories et suppléments', 'Formatage monétaire en Dirhams (MAD)'],
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=700&auto=format&fit=crop&q=80',
      icon: <Globe className="w-6 h-6 text-blue-600" />
    },
    {
      id: 'kds',
      badge: isEn ? 'Kitchen Operations' : 'Suivi de Salle',
      badgeColor: 'gold',
      title: isEn ? 'Live Kitchen Display (KDS) & Floor Management' : 'Tableau de Bord Cuisine (KDS) & Gestion de Salle',
      subtitle: isEn
        ? 'Real-time order statuses with visual service timers on tablet, phone, or laptop.'
        : 'Statuts de préparation en temps réel avec chronomètres de service sur tablette, PC ou smartphone.',
      desc: isEn
        ? 'Eliminate paper ticket confusion during peak hours. Live Kanban columns allow floor staff and cooks to advance tickets from New → Preparing → Ready → Served with one tap.'
        : 'Éliminez les confusions de tickets papier pendant les heures de pointe. Les colonnes Kanban permettent aux serveurs et cuisiniers de faire évoluer les bons en un geste.',
      bullets: isEn
        ? ['Kanban statuses: New, Preparing, Ready, Served', 'Live elapsed preparation timers', 'Visual color-coded priority flags', 'Syncs across multiple screens simultaneously']
        : ['Statuts Kanban : Nouvelle, En cours, Prête, Servie', 'Chronomètres de préparation en direct', 'Codes couleurs pour les priorités de service', 'Synchronisation multi-écrans simultanée'],
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80',
      icon: <LayoutDashboard className="w-6 h-6 text-teal-600" />
    }
  ];

  // Secondary 12-feature grid
  const secondaryFeatures = [
    {
      icon: <Sliders className="w-5 h-5 text-purple-600" />,
      title: isEn ? 'Modifiers & Custom Sides' : 'Options & Cuissons Personnalisées',
      desc: isEn ? 'Handle meat doneness, sauces, mint tea sugar levels, and side upgrades with real-time price math.' : 'Gérez la cuisson des viandes, les sauces, le sucre du thé à la menthe et les suppléments avec recalcul immédiat.'
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      title: isEn ? '1-Click Out-of-Stock' : 'Gestion Immédiate des Ruptures',
      desc: isEn ? 'Ran out of fresh strawberries or tajine beef? Hide the item in two seconds without editing physical menus.' : 'Un ingrédient manque en plein coup de feu ? Désactivez le plat en deux secondes sans raturer vos cartes.'
    },
    {
      icon: <Printer className="w-5 h-5 text-cyan-600" />,
      title: isEn ? '80mm Thermal Receipt Printing' : 'Impression Tickets Thermiques 80mm',
      desc: isEn ? 'One-click receipt formatting compatible with standard ESC/POS cashier and kitchen thermal printers.' : 'Formatage en 1 clic compatible avec les imprimantes thermiques standard de cuisine et de caisse ESC/POS.'
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
      title: isEn ? 'Turnover & Average Ticket in MAD' : 'Chiffre d’Affaires & Panier Moyen en MAD',
      desc: isEn ? 'Detailed dashboards showing top-performing dishes, peak service hours, and exportable financial reports.' : 'Tableaux de bord détaillés avec plats vedettes, heures de forte affluence et exports comptables.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      title: isEn ? '0% Commission Guarantee' : 'Garantie Zéro Commission',
      desc: isEn ? 'Keep 100% of your earnings. Flat predictable subscription with zero percentage cut on order volume.' : 'Conservez 100% de votre chiffre d’affaires. Un abonnement fixe prévisible sans le moindre prélèvement sur vos ventes.'
    },
    {
      icon: <Layers className="w-5 h-5 text-[#e35d25]" />,
      title: isEn ? 'Scheduled & Timed Menus' : 'Menus Multiples Programmables',
      desc: isEn ? 'Easily create separate lunch, dinner, weekend brunch beldi, or happy hour menus.' : 'Basculez facilement entre formule du midi, carte du soir, brunch beldi du weekend ou offres happy hour.'
    },
    {
      icon: <Smartphone className="w-5 h-5 text-rose-500" />,
      title: isEn ? 'Zero App Installation' : 'Zéro Téléchargement d’Application',
      desc: isEn ? 'Customers scan with their phone camera and the menu opens in under a second on 4G, 5G, or WiFi.' : 'Les clients scannent avec leur appareil photo et la carte s’ouvre en moins d’une seconde sur 4G, 5G ou WiFi.'
    },
    {
      icon: <Bell className="w-5 h-5 text-amber-600" />,
      title: isEn ? 'Audio Chime Alerts' : 'Alertes Sonores en Salle & Cuisine',
      desc: isEn ? 'High-audibility notification chimes when a new table order lands so your brigade never misses a beat.' : 'Signaux sonores distinctifs dès la réception d’une commande pour ne jamais ralentir le rythme du service.'
    },
    {
      icon: <Eye className="w-5 h-5 text-teal-600" />,
      title: isEn ? 'Automatic Dark & Light Theme' : 'Mode Sombre & Clair Automatique',
      desc: isEn ? 'Adapts automatically to the diner smartphone system preference for maximum visual comfort.' : 'S’adapte automatiquement aux réglages du smartphone du client pour un confort de lecture optimal.'
    },
    {
      icon: <Store className="w-5 h-5 text-blue-600" />,
      title: isEn ? 'Multi-Venue Management' : 'Gestion Multi-Établissements',
      desc: isEn ? 'Manage multiple branches, restaurants, or franchises under one unified merchant dashboard.' : 'Pilotez plusieurs adresses, restaurants ou franchises depuis un tableau de bord gérant unique.'
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      title: isEn ? 'Dietary & Allergen Badges' : 'Filtres Régimes & Allergènes',
      desc: isEn ? 'Vegetarian, vegan, halal, gluten-free, and chef special tags to build trust with local and foreign guests.' : 'Badges végétarien, végan, halal, sans gluten et spécialité du chef pour rassurer vos convives.'
    },
    {
      icon: <Clock className="w-5 h-5 text-forest" />,
      title: isEn ? 'WhatsApp Support 7 Days a Week' : 'Assistance WhatsApp 7j/7 au Maroc',
      desc: isEn ? 'Technical experts based in Morocco ready to help you configure products and WhatsApp webhooks.' : 'Une équipe d’experts basée au Maroc prête à vous assister pour configurer vos cartes et vos alertes.'
    }
  ];

  // Ordering channels on dark navy
  const channels = [
    { icon: <QrCode className="w-6 h-6 text-[#e35d25]" />, title: isEn ? 'Dine-In Table QR' : 'À Table via QR', desc: isEn ? 'Permanent table stands' : 'Chevalet de table permanent' },
    { icon: <ShoppingBag className="w-6 h-6 text-amber-400" />, title: isEn ? 'Click & Collect' : 'À Emporter', desc: isEn ? 'Pre-order takeaway' : 'Retrait express sans attente' },
    { icon: <MessageSquare className="w-6 h-6 text-emerald-400" />, title: isEn ? 'WhatsApp Direct' : 'WhatsApp Direct', desc: isEn ? 'Order sent to phone' : 'Bon structuré au gérant' },
    { icon: <Hotel className="w-6 h-6 text-cyan-400" />, title: isEn ? 'Room Service' : 'Room Service', desc: isEn ? 'In-room QR cards' : 'En chambre & lounge riad' },
    { icon: <Share2 className="w-6 h-6 text-purple-400" />, title: isEn ? 'Social Media Link' : 'Réseaux Sociaux', desc: isEn ? 'Link in bio on IG/TikTok' : 'Lien bio Instagram & TikTok' },
    { icon: <Store className="w-6 h-6 text-rose-400" />, title: isEn ? 'Counter Express' : 'Comptoir Express', desc: isEn ? 'Fast drinks & pastries' : 'Scan rapide au bar' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-ink-main selection:bg-[#e35d25] selection:text-white">
      <SEO
        title={isEn ? "Features: Digital QR Menus, WhatsApp API & Kitchen KDS | SOFRAFLOW" : "Fonctionnalités : Menus QR, API WhatsApp & Écran Cuisine | SOFRAFLOW"}
        description={isEn ? "Explore all SOFRAFLOW features: instant mobile menus, WhatsApp Cloud dispatch, permanent table QR codes, multilingual FR/AR/EN, thermal printing, and MAD reports." : "Découvrez l'ensemble des fonctionnalités SOFRAFLOW : menus mobiles instantanés, alertes WhatsApp Cloud, QR codes permanents, trilingue FR/AR/EN, impression thermique et statistiques MAD."}
        canonical="/features"
      />

      <MarketingNav />

      {/* =========================================================
          1. HERO SECTION
      ========================================================= */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EF] to-[#FAF8F5] border-b border-gray-200/70">
        <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 rounded-full bg-[#e35d25]/10 blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e35d25]/10 border border-[#e35d25]/20 text-[#e35d25] text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-[#e35d25]" />
            <span>{isEn ? 'All-in-One Hospitality SaaS in Morocco' : 'Plateforme Complète pour la Restauration au Maroc'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-forest font-display tracking-tight leading-[1.15]">
            {isEn ? (
              <>Everything you need to <span className="text-[#e35d25]">digitize & accelerate</span> orders</>
            ) : (
              <>Tout ce dont vous avez besoin pour <span className="text-[#e35d25]">digitaliser et accélérer</span> vos commandes</>
            )}
          </h1>

          <p className="text-base sm:text-lg text-ink-secondary max-w-2xl mx-auto leading-relaxed">
            {isEn
              ? 'From table QR scanning to kitchen dispatch via Meta WhatsApp Cloud API, SOFRAFLOW removes friction and boosts your daily turnover.'
              : 'Du scan de table au bon de commande sur WhatsApp via l’API officielle Meta, SOFRAFLOW élimine les temps d’attente et optimise votre chiffre d’affaires.'}
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <button className="px-8 py-4 rounded-xl bg-[#e35d25] hover:bg-[#cf4f1a] text-white font-bold text-base shadow-lg shadow-[#e35d25]/25 transition-all flex items-center gap-2">
                <span>{isEn ? 'Start 14-Day Free Trial' : 'Démarrer l’essai gratuit de 14 jours'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/m/le-jardin">
              <button className="px-6 py-4 rounded-xl bg-white hover:bg-gray-50 text-forest font-bold text-base border border-gray-200 shadow-sm transition-all flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-forest" />
                <span>{isEn ? 'Test Live Customer Demo' : 'Voir la démo client en direct'}</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. DEEP-DIVE PRIMARY FEATURES (4 Visual Sections)
      ========================================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {primaryFeatures.map((feat, idx) => (
            <div
              key={feat.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Text column */}
              <div className={`lg:col-span-6 space-y-5 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold">
                  {feat.icon}
                  <span>{feat.badge}</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-forest font-display leading-tight">
                  {feat.title}
                </h2>

                <p className="text-base text-ink-secondary leading-relaxed font-medium">
                  {feat.subtitle}
                </p>

                <p className="text-sm text-ink-secondary leading-relaxed">
                  {feat.desc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {feat.bullets.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2 text-xs font-semibold text-ink-main">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual photo/mockup column */}
              <div className={`lg:col-span-6 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="relative rounded-3xl overflow-hidden border border-gray-200/90 shadow-2xl bg-[#FAF8F5] p-3 group">
                  <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-gray-100">
                    <img
                      src={feat.image}
                      alt={feat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 block mb-1">
                        SOFRAFLOW System
                      </span>
                      <h4 className="font-bold text-base">{feat.title}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          3. SECONDARY 12-FEATURE GRID ("Built for Speed & Reliability")
      ========================================================= */}
      <section className="py-20 bg-[#FAF8F5] border-y border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-[#e35d25] uppercase tracking-wider">
              {isEn ? 'Complete Toolkit' : 'Boîte à Outils Complète'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-forest font-display">
              {isEn ? 'Engineered for speed, durability, and daily service' : 'Conçu pour la rapidité, la robustesse et le terrain'}
            </h2>
            <p className="text-sm text-ink-secondary leading-relaxed">
              {isEn
                ? 'Every detail has been tested in Moroccan restaurants, cafes, and street food venues.'
                : 'Chaque détail a été éprouvé auprès de restaurants, cafés et snacks au Maroc.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {secondaryFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FAF8F5] border border-gray-100 flex items-center justify-center">
                    {feat.icon}
                  </div>
                  <h3 className="font-bold text-base text-forest font-display">{feat.title}</h3>
                  <p className="text-xs text-ink-secondary leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          4. DARK NAVY ORDERING CHANNELS BANNER
      ========================================================= */}
      <section className="py-20 bg-[#0B132B] text-white relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-[#e35d25]/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-[#e35d25] uppercase tracking-wider">
              {isEn ? 'Omnichannel' : 'Points de Contact Multiples'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              {isEn ? 'Accept orders from every single touchpoint' : 'Acceptez les commandes d’où que viennent vos convives'}
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              {isEn
                ? 'A single central system handles dine-in table QR scans, phone takeaway orders, and room service.'
                : 'Un système unique centralisé pour vos commandes à table, vos retraits express et le room service.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {channels.map((ch, idx) => (
              <div
                key={idx}
                className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center transition-all flex flex-col items-center justify-between space-y-3 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {ch.icon}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{ch.title}</h4>
                  <p className="text-[10px] text-white/60 leading-tight mt-1">{ch.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          5. FINAL HIGH-IMPACT CTA BANNER
      ========================================================= */}
      <section className="py-20 bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#e35d25] via-[#ea580c] to-[#f97316] text-white rounded-[32px] p-8 sm:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
                {isEn ? 'Instant Setup' : 'Déploiement Express'}
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
                {isEn ? 'Ready to try all these features for your business?' : 'Prêt à tester ces fonctionnalités pour votre établissement ?'}
              </h3>
              <p className="text-white/90 text-sm leading-relaxed">
                {isEn
                  ? 'Join 200+ venues in Morocco. Create your digital catalog today with 14 days free trial.'
                  : 'Rejoignez plus de 200 établissements au Maroc. Créez votre carte aujourd’hui avec 14 jours d’essai gratuit.'}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
                <Link to="/signup">
                  <button className="px-8 py-4 rounded-xl bg-white text-[#e35d25] font-extrabold text-sm shadow-md hover:bg-gray-100 transition-all flex items-center gap-2">
                    <span>{isEn ? 'Start Free Trial Now' : 'Créer mon menu digital maintenant'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/pricing">
                  <button className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors">
                    {isEn ? 'View Pricing in MAD' : 'Voir les tarifs en MAD'}
                  </button>
                </Link>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center flex-shrink-0">
              <span className="text-4xl font-black block font-display">0%</span>
              <span className="text-xs uppercase font-bold tracking-wider text-white/90 block mt-1">
                {isEn ? 'Commission on Sales' : 'Commission sur les Ventes'}
              </span>
              <span className="text-[11px] text-white/70 block mt-2">
                {isEn ? 'Keep 100% of your earnings' : 'Conservez 100% de vos gains'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};
