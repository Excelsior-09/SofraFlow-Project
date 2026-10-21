import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  MessageSquare,
  LayoutDashboard,
  ArrowRight,
  Check,
  CheckCheck,
  Clock,
  UtensilsCrossed,
  Coffee,
  Sandwich,
  Cake,
  Scissors
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { analytics } from '../../services/analytics';

type IndustryMode = 'restaurant' | 'cafe' | 'snack' | 'bakery' | 'salon';

interface DemoIndustryData {
  id: IndustryMode;
  label: string;
  businessName: string;
  businessType: string;
  locationLabel: string;
  categoryName: string;
  items: Array<{
    name: string;
    description: string;
    price: string;
    tag?: string;
  }>;
  whatsappMessage: {
    sender: string;
    time: string;
    ref: string;
    target: string;
    itemsList: string[];
    total: string;
  };
}

const DEMO_INDUSTRIES: Record<IndustryMode, DemoIndustryData> = {
  restaurant: {
    id: 'restaurant',
    label: 'Restaurant',
    businessName: 'Le Jardin de Marrakech',
    businessType: 'Restaurant & Jardin Gourmand',
    locationLabel: 'Table 4 • Terrasse',
    categoryName: 'Spécialités de l’Atlas',
    items: [
      {
        name: "Tajine d'Agneau aux Pruneaux",
        description: 'Agneau mijoté aux épices douces, pruneaux caramélisés, sésame grillé.',
        price: '135.00 MAD',
        tag: 'Spécialité'
      },
      {
        name: 'Thé à la Menthe Marocain Traditionnel',
        description: 'Thé vert gunpowder, menthe fraîche et pignons de pin.',
        price: '28.00 MAD'
      }
    ],
    whatsappMessage: {
      sender: 'SOFRAFLOW • Bon Cuisine',
      time: '13:42',
      ref: 'CMD-8491',
      target: 'Table 4 (Terrasse)',
      itemsList: [
        '1x Tajine d’Agneau aux Pruneaux (135 MAD)',
        '1x Thé à la Menthe (28 MAD)'
      ],
      total: '163.00 MAD'
    }
  },

  cafe: {
    id: 'cafe',
    label: 'Café & Coffee Shop',
    businessName: 'Café Atlas Artisan',
    businessType: 'Coffee Shop & Brunch',
    locationLabel: 'Table 12 • Terrasse',
    categoryName: 'Cafés & Formules',
    items: [
      {
        name: 'Flat White Single Origin',
        description: 'Double espresso d’Éthiopie, micro-mousse de lait d’avoine.',
        price: '32.00 MAD',
        tag: 'Coup de Cœur'
      },
      {
        name: 'Formule Beldi Complète',
        description: 'Msemen, amlou artisanal, miel, 2 œufs au cumin et thé.',
        price: '48.00 MAD'
      }
    ],
    whatsappMessage: {
      sender: 'SOFRAFLOW • Barista Bar',
      time: '10:15',
      ref: 'CMD-3920',
      target: 'Table 12 (Terrasse)',
      itemsList: [
        '1x Flat White (Lait d’avoine) (32 MAD)',
        '1x Formule Beldi Complète (48 MAD)'
      ],
      total: '80.00 MAD'
    }
  },

  snack: {
    id: 'snack',
    label: 'Snack & Fast-Food',
    businessName: 'Snack Grill Casablanca',
    businessType: 'Street Food & Tacos',
    locationLabel: 'Comptoir • À Emporter',
    categoryName: 'Burgers & Tacos',
    items: [
      {
        name: 'Double Smash Burger Cheddar',
        description: '2 steaks écrasés à la plancha, double cheddar fondu, sauce maison.',
        price: '58.00 MAD',
        tag: 'Best-Seller'
      },
      {
        name: 'Tacos 2 Viandes (Poulet & Kefta)',
        description: 'Sauce fromagère maison, frites à l’intérieur, sauce algérienne.',
        price: '52.00 MAD'
      }
    ],
    whatsappMessage: {
      sender: 'SOFRAFLOW • Poste Grill',
      time: '19:24',
      ref: 'CMD-5512',
      target: 'Comptoir Emporter (Youssef B.)',
      itemsList: [
        '1x Double Smash Burger Cheddar (58 MAD)',
        '1x Tacos 2 Viandes [Algérienne] (52 MAD)'
      ],
      total: '110.00 MAD'
    }
  },

  bakery: {
    id: 'bakery',
    label: 'Boulangerie & Pâtisserie',
    businessName: 'Pâtisserie Étoile de Rabat',
    businessType: 'Boulangerie & Gâteaux Fins',
    locationLabel: 'Retrait Boutique',
    categoryName: 'Gâteaux & Douceurs',
    items: [
      {
        name: 'Boîte Cornes de Gazelle (1 kg)',
        description: 'Pur amandes d’Essaouira, eau de fleur d’oranger distillée.',
        price: '220.00 MAD',
        tag: 'Artisanal'
      },
      {
        name: 'Entremet Royal Chocolat (6-8 parts)',
        description: 'Mousse chocolat noir 70%, dacquoise noisette croustillante.',
        price: '185.00 MAD'
      }
    ],
    whatsappMessage: {
      sender: 'SOFRAFLOW • Laboratoire Pâtisserie',
      time: '16:05',
      ref: 'CMD-7719',
      target: 'Retrait Samedi 11h (Mme Alami)',
      itemsList: [
        '1x Boîte Cornes de Gazelle 1kg (220 MAD)',
        '1x Entremet Royal Chocolat 8p (185 MAD)'
      ],
      total: '405.00 MAD'
    }
  },

  salon: {
    id: 'salon',
    label: 'Salons & Services',
    businessName: 'L’Atelier Barbier & Soins',
    businessType: 'Barbershop & Spa Masculin',
    locationLabel: 'Fauteuil 3 • Soins',
    categoryName: 'Soins & Forfaits',
    items: [
      {
        name: 'Rituel Barbier Traditionnel Coupe-Chou',
        description: 'Serviette chaude, rasage à l’ancienne, soin après-rasage argan.',
        price: '80.00 MAD',
        tag: 'Signature'
      },
      {
        name: 'Forfait Coupe Dégradé & Barbe',
        description: 'Coupe stylisée, traçage contours et huile de barbe bio.',
        price: '110.00 MAD'
      }
    ],
    whatsappMessage: {
      sender: 'SOFRAFLOW • Accueil Salon',
      time: '15:10',
      ref: 'SRV-1044',
      target: 'Fauteuil 3 (Mehdi K.)',
      itemsList: [
        '1x Rituel Barbier Coupe-Chou (80 MAD)',
        '1x Forfait Coupe Dégradé & Barbe (110 MAD)'
      ],
      total: '190.00 MAD'
    }
  }
};

export const InteractiveDemoPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'menu' | 'whatsapp' | 'dashboard'>('menu');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryMode>('restaurant');

  const industryData = DEMO_INDUSTRIES[selectedIndustry];

  const handleIndustryChange = (ind: IndustryMode) => {
    setSelectedIndustry(ind);
    analytics.track('demo_industry_switched', { industry: ind });
  };

  return (
    <div className="relative rounded-3xl bg-forest p-6 sm:p-10 text-white shadow-elevated border border-forest-dark overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-forest-light/5 blur-3xl pointer-events-none" />

      {/* Header and Switcher */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <span className="text-gold text-xs font-bold uppercase tracking-wider">Simulation du Système en Direct</span>
          <h3 className="text-2xl sm:text-3xl font-bold font-display mt-1">Découvrez la boucle complète SOFRAFLOW</h3>
          <p className="text-white/70 text-xs sm:text-sm mt-1 max-w-xl">
            Du scan mobile par le client jusqu'au message WhatsApp instantané et au tableau de bord.
          </p>
        </div>

        {/* Tab Controls: Workflow Steps */}
        <div className="flex items-center gap-1.5 p-1 bg-forest-dark/80 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'menu' ? 'bg-gold text-forest-dark shadow-sm' : 'text-white/70 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            1. Menu Client
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'whatsapp' ? 'bg-gold text-forest-dark shadow-sm' : 'text-white/70 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            2. Alerte WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'dashboard' ? 'bg-gold text-forest-dark shadow-sm' : 'text-white/70 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            3. Tableau de Bord
          </button>
        </div>
      </div>

      {/* Industry Selector Pills Bar */}
      <div className="relative z-10 py-4 flex flex-wrap items-center gap-2 border-b border-white/10">
        <span className="text-xs text-white/60 font-semibold mr-1">Activité simulée :</span>
        {(Object.keys(DEMO_INDUSTRIES) as IndustryMode[]).map((indKey) => {
          const isSelected = selectedIndustry === indKey;
          return (
            <button
              key={indKey}
              onClick={() => handleIndustryChange(indKey)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-white text-forest shadow-sm scale-105'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {DEMO_INDUSTRIES[indKey].label}
            </button>
          );
        })}
      </div>

      {/* Interactive Display Area */}
      <div className="relative z-10 pt-8 min-h-[420px] flex items-center justify-center">
        {/* Step 1: Customer Mobile Menu */}
        {activeTab === 'menu' && (
          <div className="w-full max-w-md mx-auto bg-ivory rounded-3xl text-ink-main shadow-2xl border-4 border-forest-dark overflow-hidden animate-in fade-in duration-200">
            {/* Phone Top Notch */}
            <div className="bg-forest px-5 py-3 text-white flex items-center justify-between text-xs">
              <span className="font-semibold">{industryData.businessName}</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px]">{industryData.locationLabel}</span>
            </div>

            {/* Menu Header Card */}
            <div className="p-4 bg-white border-b border-border-subtle flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-forest">{industryData.categoryName}</h4>
                <p className="text-xs text-ink-secondary">{industryData.businessType}</p>
              </div>
              <div className="flex gap-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-forest text-white">FR</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-forest-light text-forest">EN</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-forest-light text-forest">عربي</span>
              </div>
            </div>

            {/* Product items in preview */}
            <div className="p-4 space-y-3">
              {industryData.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-border-subtle shadow-xs">
                  <div className="space-y-1 max-w-[240px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-forest">{item.name}</span>
                      {item.tag && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-gold/20 text-gold-hover font-semibold">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-ink-secondary leading-snug">{item.description}</p>
                    <span className="text-xs font-extrabold text-forest">{item.price}</span>
                  </div>
                  <span className="px-3 py-1.5 bg-forest text-white text-xs font-semibold rounded-xl whitespace-nowrap">
                    + Ajouter
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Checkout trigger */}
            <div className="p-3 bg-white border-t border-border-subtle flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-ink-secondary block">Sélection client</span>
                <span className="font-bold text-forest">{industryData.whatsappMessage.total}</span>
              </div>
              <button
                onClick={() => setActiveTab('whatsapp')}
                className="px-4 py-2 bg-gold text-forest-dark font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-gold/90 shadow-sm transition-all"
              >
                Valider &amp; Commander <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Instant WhatsApp Notification */}
        {activeTab === 'whatsapp' && (
          <div className="w-full max-w-md mx-auto bg-[#0b141a] rounded-3xl text-[#e9edef] shadow-2xl border-4 border-forest-dark overflow-hidden animate-in fade-in duration-200 font-sans">
            {/* WhatsApp App Bar */}
            <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3 border-b border-[#2a3942]">
              <div className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold text-sm">
                SF
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-xs text-[#e9edef]">SOFRAFLOW Notifications</h5>
                  <span className="text-[10px] text-[#8696a0]">{industryData.whatsappMessage.time}</span>
                </div>
                <p className="text-[10px] text-[#00a884] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] inline-block animate-pulse" />
                  API Meta Cloud Officielle
                </p>
              </div>
            </div>

            {/* Message Bubble Body */}
            <div className="p-4 space-y-3 bg-[#0c1317] min-h-[300px]">
              <div className="bg-[#005c4b] p-3.5 rounded-2xl rounded-tl-sm text-xs space-y-2 max-w-[90%] shadow-md ml-auto">
                <div className="flex items-center justify-between border-b border-[#ffffff15] pb-1.5">
                  <span className="font-bold text-gold text-[11px]">NOUVELLE COMMANDE REÇUE</span>
                  <span className="text-[10px] text-white/70">{industryData.whatsappMessage.ref}</span>
                </div>

                <div className="text-[11px] space-y-1">
                  <p><strong>Établissement :</strong> {industryData.businessName}</p>
                  <p><strong>Emplacement :</strong> {industryData.whatsappMessage.target}</p>
                  <p><strong>Heure :</strong> {industryData.whatsappMessage.time}</p>
                </div>

                <div className="bg-[#00000025] p-2 rounded-xl text-[11px] space-y-1">
                  {industryData.whatsappMessage.itemsList.map((line, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>• {line}</span>
                    </div>
                  ))}
                  <div className="border-t border-[#ffffff20] pt-1 flex justify-between font-bold text-white">
                    <span>Total à encaisser :</span>
                    <span className="text-gold">{industryData.whatsappMessage.total}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 text-[10px] text-white/60 pt-0.5">
                  <span>{industryData.whatsappMessage.time}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                </div>
              </div>
            </div>

            {/* Bottom transition */}
            <div className="p-3 bg-[#202c33] border-t border-[#2a3942] flex justify-between items-center text-xs">
              <span className="text-[11px] text-[#8696a0]">Statut : Transmis en direct</span>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-3 py-1.5 bg-[#00a884] text-white font-bold text-xs rounded-xl flex items-center gap-1 hover:bg-[#00a884]/90"
              >
                Voir au tableau de bord <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Manager Dashboard Simulation */}
        {activeTab === 'dashboard' && (
          <div className="w-full max-w-lg mx-auto bg-white rounded-3xl text-ink-main shadow-2xl border-4 border-forest-dark overflow-hidden animate-in fade-in duration-200">
            {/* Top Bar */}
            <div className="bg-forest px-5 py-3 text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-gold" />
                <span className="font-bold">Tableau de Bord SOFRAFLOW</span>
              </div>
              <Badge variant="gold">Service En Direct</Badge>
            </div>

            {/* Metric counters */}
            <div className="p-4 grid grid-cols-3 gap-2 bg-ivory border-b border-border-subtle">
              <div className="bg-white p-2.5 rounded-xl border border-border-subtle text-center">
                <span className="text-[10px] text-ink-secondary block">Commandes du Jour</span>
                <span className="font-extrabold text-sm text-forest">24</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-border-subtle text-center">
                <span className="text-[10px] text-ink-secondary block">Chiffre d’Affaires</span>
                <span className="font-extrabold text-sm text-forest">3 840 MAD</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-border-subtle text-center">
                <span className="text-[10px] text-ink-secondary block">Délai Moyen</span>
                <span className="font-extrabold text-sm text-status-success">11 min</span>
              </div>
            </div>

            {/* Order status row */}
            <div className="p-4 space-y-3">
              <div className="p-3 bg-white rounded-2xl border border-forest/30 shadow-xs flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-forest">{industryData.whatsappMessage.ref}</span>
                    <Badge variant="gold">En Préparation</Badge>
                  </div>
                  <p className="text-[11px] text-ink-secondary">
                    {industryData.whatsappMessage.target} • {industryData.whatsappMessage.total}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-ink-secondary flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gold" /> Il y a 2 min
                  </span>
                  <span className="px-2.5 py-1 bg-status-success text-white text-[10px] font-bold rounded-lg">
                    Prêt
                  </span>
                </div>
              </div>

              <div className="p-3 bg-ivory/60 rounded-2xl border border-border-subtle opacity-75 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-ink-secondary">CMD-8490</span>
                    <Badge variant="success">Servie</Badge>
                  </div>
                  <p className="text-[11px] text-ink-secondary">Table 2 • 95.00 MAD</p>
                </div>
                <span className="text-[10px] text-ink-secondary">Clôturée à 13:30</span>
              </div>
            </div>

            {/* Bottom link */}
            <div className="p-3 bg-ivory border-t border-border-subtle text-center">
              <Link to="/signup" className="text-xs font-bold text-forest hover:text-forest-dark flex items-center justify-center gap-1">
                Tester la création de compte gérant <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer navigation */}
      <div className="relative z-10 pt-8 mt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
        <div>
          Activité sélectionnée : <strong className="text-gold">{industryData.businessName}</strong> ({industryData.label})
        </div>
        <div className="flex items-center gap-4">
          <Link to="/m/le-jardin" className="hover:text-white underline">
            Ouvrir la démo plein écran
          </Link>
          <Link to="/signup">
            <Button size="sm" variant="gold" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Créer mon menu gratuitement
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
