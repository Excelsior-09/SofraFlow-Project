import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  Zap,
  QrCode,
  MessageSquare,
  Globe,
  Sparkles,
  Smartphone,
  Clock,
  ShieldCheck,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Store
} from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { SEO } from '../../components/common/SEO';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { INDUSTRY_SOLUTIONS, IndustryBenefit, IndustrySolution } from '../../data/industrySolutions';
import { useLanguage } from '../../context/LanguageContext';
import { analytics } from '../../services/analytics';

export const IndustrySolutionPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const { industrySlug } = useParams<{ industrySlug: string }>();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const solution: IndustrySolution | undefined = industrySlug ? INDUSTRY_SOLUTIONS[industrySlug] : undefined;

  useEffect(() => {
    if (solution) {
      analytics.track('industry_page_view', {
        industry: solution.slug,
        name: solution.name
      });
      window.scrollTo(0, 0);
    }
  }, [solution]);

  if (!solution) {
    return <Navigate to="/solutions" replace />;
  }

  const renderIcon = (iconName: IndustryBenefit['iconName']) => {
    const props = { className: 'w-6 h-6' };
    switch (iconName) {
      case 'Zap': return <Zap {...props} />;
      case 'QrCode': return <QrCode {...props} />;
      case 'MessageSquare': return <MessageSquare {...props} />;
      case 'Globe': return <Globe {...props} />;
      case 'Sparkles': return <Sparkles {...props} />;
      case 'Smartphone': return <Smartphone {...props} />;
      case 'Clock': return <Clock {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  const filteredItems = activeCategory === 'all'
    ? solution.sampleMenu.items
    : solution.sampleMenu.items.filter(item => item.category === activeCategory);

  // Generate Breadcrumb and FAQ JSON-LD schemas
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Accueil',
          'item': 'https://sofraflow.com/'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Solutions',
          'item': 'https://sofraflow.com/solutions'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': solution.name,
          'item': `https://sofraflow.com/solutions/${solution.slug}`
        }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': `SOFRAFLOW pour ${solution.name}`,
      'operatingSystem': 'All (Web, iOS, Android)',
      'applicationCategory': 'BusinessApplication',
      'offers': {
        '@type': 'Offer',
        'price': '290',
        'priceCurrency': 'MAD'
      },
      'description': solution.metaDescription
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': solution.faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.a
        }
      }))
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-page)] dark:bg-dark-page text-ink-main dark:text-dark-text flex flex-col font-sans transition-colors duration-200">
      <SEO
        title={solution.metaTitle}
        description={solution.metaDescription}
        canonical={`/solutions/${solution.slug}`}
        structuredData={structuredData}
      />

      <MarketingNav />

      {/* Breadcrumb Bar */}
      <div className="bg-white/80 dark:bg-dark-card/90 backdrop-blur-sm border-b border-border-subtle dark:border-dark-border py-2.5 px-4 sm:px-6 lg:px-8 text-xs text-ink-secondary dark:text-dark-secondary transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link to="/" className="hover:text-forest dark:hover:text-orange-400 transition-colors">Accueil</Link>
          <ChevronRight className="w-3.5 h-3.5 text-ink-secondary/50" />
          <Link to="/solutions" className="hover:text-forest dark:hover:text-orange-400 transition-colors">Solutions</Link>
          <ChevronRight className="w-3.5 h-3.5 text-ink-secondary/50" />
          <span className="text-forest dark:text-dark-text font-semibold">{solution.name}</span>
        </div>
      </div>

      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden bg-gradient-to-b from-white to-ivory dark:from-dark-page dark:to-dark-card/60 border-b border-transparent dark:border-dark-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest/10 dark:bg-emerald-950/60 border border-forest/20 dark:border-emerald-800/60 text-forest dark:text-emerald-300 text-xs font-semibold">
              <Store className="w-4 h-4 text-gold" />
              <span>{solution.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-forest dark:text-white tracking-tight font-display leading-[1.15]">
              {solution.heroTitle}
            </h1>

            <p className="text-base sm:text-lg text-ink-secondary dark:text-dark-secondary leading-relaxed">
              {solution.heroSubtitle}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto">
                <button
                  onClick={() => analytics.track('cta_clicked', { source: `hero_${solution.slug}`, target: '/signup' })}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#e35d25] hover:bg-[#cf4f1a] text-white font-bold text-base shadow-lg shadow-[#e35d25]/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>{isEn ? 'Start 14-Day Free Trial' : 'Créer mon menu digital'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/m/le-jardin" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-border text-forest dark:text-dark-text font-bold text-base border border-gray-200 dark:border-dark-border shadow-sm transition-all flex items-center justify-center gap-2">
                  <Smartphone className="w-5 h-5 text-forest dark:text-orange-400" />
                  <span>{isEn ? 'View Live Demo' : 'Voir une démonstration'}</span>
                </button>
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-ink-secondary dark:text-dark-secondary">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {isEn ? 'Zero specialized equipment' : 'Sans équipement spécifique'}
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {isEn ? 'Prices in Dirhams (MAD)' : 'Tarifs en Dirhams (MAD)'}
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {isEn ? '0% sales commissions' : '0% de commission sur vos ventes'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Challenge vs SOFRAFLOW Solution Context */}
      <section className="py-16 bg-white dark:bg-dark-page border-y border-border-subtle dark:border-dark-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* The Challenge */}
            <div className="p-8 rounded-3xl bg-ivory dark:bg-dark-card border border-border-subtle dark:border-dark-border flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Le Défi au Quotidien</span>
                <h3 className="text-xl font-bold text-forest dark:text-white font-display">
                  La gestion traditionnelle des cartes et des prix
                </h3>
                <p className="text-sm text-ink-secondary dark:text-dark-secondary leading-relaxed">
                  {solution.primaryPainPoint}
                </p>
                <p className="text-xs text-ink-secondary dark:text-dark-secondary pt-2">
                  Destiné à : <strong className="text-ink-main dark:text-dark-text">{solution.targetAudience}</strong>
                </p>
              </div>
            </div>

            {/* The SOFRAFLOW Solution */}
            <div className="p-8 rounded-3xl bg-forest dark:bg-dark-surface text-white border border-transparent dark:border-emerald-800/50 shadow-elevated flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-gold/10 blur-2xl pointer-events-none" />
              <div className="space-y-3 relative z-10">
                <span className="text-xs font-bold text-gold uppercase tracking-wider">La Réponse SOFRAFLOW</span>
                <h3 className="text-xl font-bold text-white font-display">
                  Un menu permanent, toujours disponible sur mobile
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  {solution.solutionOverview}
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs text-gold">
                  <Check className="w-4 h-4" /> Mises à jour instantanées sans réimpression
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Industry Benefits */}
      <section className="py-20 bg-ivory dark:bg-dark-card/40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-gold uppercase tracking-wider">Avantages Clés</span>
            <h2 className="text-3xl font-extrabold text-forest dark:text-white font-display mt-2">
              Conçu pour répondre aux réalités des {solution.shortTitle.toLowerCase()} au Maroc
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {solution.benefits.map((benefit, idx) => (
              <Card key={idx} hoverEffect className="space-y-4 bg-white dark:bg-dark-card dark:border-dark-border">
                <div className="w-12 h-12 rounded-2xl bg-forest/10 dark:bg-emerald-950/60 flex items-center justify-center text-forest dark:text-emerald-400">
                  {renderIcon(benefit.iconName)}
                </div>
                <h3 className="text-base font-bold text-forest dark:text-white font-display">{benefit.title}</h3>
                <p className="text-xs text-ink-secondary dark:text-dark-secondary leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Live Sample Menu Demonstration */}
      <section className="py-20 bg-white dark:bg-dark-page border-t border-border-subtle dark:border-dark-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left text column */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold text-gold uppercase tracking-wider">Aperçu Réel</span>
              <h2 className="text-3xl font-extrabold text-forest dark:text-white font-display leading-tight">
                Voici à quoi ressemble votre carte sur le smartphone de votre client
              </h2>
              <p className="text-sm text-ink-secondary dark:text-dark-secondary leading-relaxed">
                Sans application à télécharger. Vos clients scannent le QR code placé sur place et accèdent immédiatement à votre sélection de produits avec prix en MAD, options et descriptions soignées.
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-ink-main dark:text-dark-text">
                  <Check className="w-4 h-4 text-status-success" /> Affichage fluide en Français, Arabe et Anglais
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-main dark:text-dark-text">
                  <Check className="w-4 h-4 text-status-success" /> Adapté aux petits écrans et connexions 4G
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-main dark:text-dark-text">
                  <Check className="w-4 h-4 text-status-success" /> Notification directe pour préparer ou confirmer
                </div>
              </div>

              <div className="pt-4">
                <Link to="/signup">
                  <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Créer ma carte maintenant
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right mobile simulation card */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-md bg-ivory dark:bg-dark-card rounded-3xl border-4 border-forest dark:border-dark-border shadow-2xl overflow-hidden">
                {/* Header bar */}
                <div className="bg-forest dark:bg-dark-surface text-white px-5 py-3.5 flex items-center justify-between text-xs border-b border-transparent dark:border-dark-border">
                  <div>
                    <h4 className="font-bold">{solution.sampleMenu.businessName}</h4>
                    <p className="text-[10px] text-white/70">{solution.sampleMenu.businessType}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                    {solution.sampleMenu.tableOrLocation}
                  </span>
                </div>

                {/* Categories Tab Bar */}
                <div className="bg-white dark:bg-dark-surface px-4 py-2.5 border-b border-border-subtle dark:border-dark-border flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeCategory === 'all'
                        ? 'bg-forest text-white'
                        : 'bg-ivory dark:bg-dark-card text-ink-secondary dark:text-dark-secondary hover:text-forest dark:hover:text-dark-text'
                    }`}
                  >
                    Tout ({solution.sampleMenu.items.length})
                  </button>
                  {solution.sampleMenu.categories.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        activeCategory === cat
                          ? 'bg-forest text-white'
                          : 'bg-ivory dark:bg-dark-card text-ink-secondary dark:text-dark-secondary hover:text-forest dark:hover:text-dark-text'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Items List */}
                <div className="p-4 space-y-3 bg-ivory/50 dark:bg-dark-card">
                  {filteredItems.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white dark:bg-dark-surface border border-border-subtle dark:border-dark-border shadow-xs space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-forest dark:text-white">{item.name}</span>
                            {item.tag && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-gold/20 text-gold-hover font-semibold">
                                {item.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-ink-secondary dark:text-dark-secondary leading-snug">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-extrabold text-forest dark:text-gold">{item.price}</span>
                        <span className="px-2.5 py-1 rounded-lg bg-forest/10 dark:bg-forest/30 text-forest dark:text-emerald-300 text-[11px] font-bold">
                          + Sélectionner
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer simulation */}
                <div className="bg-white dark:bg-dark-surface p-3 border-t border-border-subtle dark:border-dark-border text-center text-[11px] text-ink-secondary dark:text-dark-secondary">
                  Propulsé par SOFRAFLOW Maroc • Accès sans téléchargement
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works (Workflow) */}
      <section className="py-20 bg-ivory dark:bg-dark-card/40 border-t border-border-subtle dark:border-dark-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-gold uppercase tracking-wider">Mise en Place Rapide</span>
            <h2 className="text-3xl font-extrabold text-forest dark:text-white font-display mt-2">
              Comment ça fonctionne en 4 étapes simples
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {solution.workflowSteps.map((step, idx) => (
              <div key={idx} className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-border-subtle dark:border-dark-border shadow-soft dark:shadow-none relative flex flex-col justify-between">
                <div>
                  <span className="text-3xl font-black text-forest/20 dark:text-white/20 font-display block mb-2">{step.step}</span>
                  <h4 className="font-bold text-base text-forest dark:text-white mb-2">{step.title}</h4>
                  <p className="text-xs text-ink-secondary dark:text-dark-secondary leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Pricing Overview */}
      <section className="py-20 bg-white dark:bg-dark-page border-t border-border-subtle dark:border-dark-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-gold uppercase tracking-wider">Tarification Transparente</span>
            <h2 className="text-3xl font-extrabold text-forest dark:text-white font-display mt-2">
              Une formule adaptée à votre taille d'établissement
            </h2>
            <p className="text-sm text-ink-secondary dark:text-dark-secondary mt-2">
              Zéro commission prélevée sur vos ventes. Tarifs clairs en Dirhams marocains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-ivory dark:bg-dark-card rounded-3xl p-7 border border-border-subtle dark:border-dark-border shadow-soft dark:shadow-none flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xl text-forest dark:text-white font-display">Starter</h4>
                <div className="my-4">
                  <span className="text-3xl font-extrabold text-forest dark:text-white font-display">290</span>
                  <span className="text-ink-secondary dark:text-dark-secondary text-sm font-medium"> MAD / mois</span>
                </div>
                <p className="text-xs text-ink-secondary dark:text-dark-secondary mb-6">Idéal pour démarrer la digitalisation de votre établissement.</p>
                <ul className="space-y-2.5 text-xs text-ink-main dark:text-dark-text mb-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> 1 Menu digital actif</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> Jusqu'à 40 produits au catalogue</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> Générateur de QR codes permanents</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> Français & Anglais</li>
                </ul>
              </div>
              <Link to="/signup">
                <Button variant="outline" className="w-full bg-white dark:bg-dark-surface dark:text-dark-text dark:border-dark-border dark:hover:bg-dark-border">
                  Démarrer l'essai
                </Button>
              </Link>
            </div>

            {/* Growth */}
            <div className="bg-forest dark:bg-dark-card text-white rounded-3xl p-7 border-2 border-gold shadow-elevated flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gold text-forest-dark text-[10px] font-extrabold uppercase">
                Recommandé
              </div>
              <div>
                <h4 className="font-bold text-xl text-white font-display mt-1">Growth</h4>
                <div className="my-4">
                  <span className="text-3xl font-extrabold text-white font-display">590</span>
                  <span className="text-white/70 text-sm font-medium"> MAD / mois</span>
                </div>
                <p className="text-xs text-white/80 mb-6">Pour les établissements à forte affluence avec envoi WhatsApp.</p>
                <ul className="space-y-2.5 text-xs text-white/90 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-gold" /> Menus & produits illimités</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-gold" /> Notifications WhatsApp directes</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-gold" /> Trilingue : Français, Arabe & Anglais</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-gold" /> QR codes par table ou espace</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-gold" /> Support WhatsApp 7j/7</li>
                </ul>
              </div>
              <Link to="/signup">
                <Button variant="gold" className="w-full font-bold">
                  Choisir Growth
                </Button>
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-ivory dark:bg-dark-card rounded-3xl p-7 border border-border-subtle dark:border-dark-border shadow-soft dark:shadow-none flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xl text-forest dark:text-white font-display">Pro</h4>
                <div className="my-4">
                  <span className="text-3xl font-extrabold text-forest dark:text-white font-display">990</span>
                  <span className="text-ink-secondary dark:text-dark-secondary text-sm font-medium"> MAD / mois</span>
                </div>
                <p className="text-xs text-ink-secondary dark:text-dark-secondary mb-6">Pour les grands établissements multi-espaces et resorts.</p>
                <ul className="space-y-2.5 text-xs text-ink-main dark:text-dark-text mb-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> Tout le plan Growth</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> Multi-destinataires WhatsApp</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> Impression tickets thermiques</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> Gestionnaire de compte dédié</li>
                </ul>
              </div>
              <Link to="/signup">
                <Button variant="outline" className="w-full bg-white dark:bg-dark-surface dark:text-dark-text dark:border-dark-border dark:hover:bg-dark-border">
                  Choisir Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Industry FAQ */}
      <section className="py-20 bg-ivory dark:bg-dark-card/40 border-t border-border-subtle dark:border-dark-border transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-gold uppercase tracking-wider">Questions Fréquentes</span>
            <h2 className="text-3xl font-extrabold text-forest dark:text-white font-display mt-2">
              Tout savoir sur SOFRAFLOW pour les {solution.shortTitle.toLowerCase()}
            </h2>
          </div>

          <div className="space-y-4">
            {solution.faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-border-subtle dark:border-dark-border rounded-2xl p-5 bg-white dark:bg-dark-card transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between text-left text-base font-bold text-forest dark:text-white focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-ink-secondary dark:text-dark-secondary transition-transform duration-200 ${
                      openFaq === index ? 'transform rotate-180 text-forest dark:text-orange-400' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <p className="mt-3 text-sm text-ink-secondary dark:text-dark-secondary leading-relaxed border-t border-border-subtle dark:border-dark-border pt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Related Industries Navigation */}
      <section className="py-14 bg-white dark:bg-dark-page border-t border-border-subtle dark:border-dark-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-gold uppercase tracking-wider">Explorer d'autres secteurs</span>
              <h3 className="text-xl font-bold text-forest dark:text-white font-display">SOFRAFLOW pour d’autres activités</h3>
            </div>
            <Link to="/solutions" className="text-xs font-bold text-forest dark:text-orange-400 hover:text-forest-dark dark:hover:text-orange-300 flex items-center gap-1">
              Voir tous les secteurs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {solution.relatedSlugs.map(rSlug => {
              const rel = INDUSTRY_SOLUTIONS[rSlug];
              if (!rel) return null;
              return (
                <Link
                  key={rSlug}
                  to={`/solutions/${rel.slug}`}
                  className="p-5 rounded-2xl bg-ivory dark:bg-dark-card border border-border-subtle dark:border-dark-border hover:border-forest/40 dark:hover:border-gold/40 hover:shadow-soft dark:hover:shadow-none transition-all group"
                >
                  <span className="text-[10px] font-bold text-gold uppercase">{rel.badge}</span>
                  <h4 className="font-bold text-sm text-forest dark:text-white mt-1 group-hover:text-forest-dark dark:group-hover:text-orange-300 flex items-center justify-between">
                    {rel.name}
                    <ArrowRight className="w-4 h-4 text-ink-secondary dark:text-dark-secondary group-hover:translate-x-1 transition-transform" />
                  </h4>
                  <p className="text-xs text-ink-secondary dark:text-dark-secondary mt-1 line-clamp-2">{rel.heroSubtitle}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Final CTA Section */}
      <section className="py-20 bg-[#0B132B] text-white text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#e35d25]/15 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black font-display leading-tight text-white">
            {isEn ? 'Ready to modernize your guest menu and ordering?' : 'Prêt à moderniser votre offre et vos commandes ?'}
          </h2>
          <p className="text-white/80 text-base max-w-xl mx-auto leading-relaxed">
            {isEn
              ? 'Join hospitality venues across Morocco. Create your first digital menu today in 15 minutes.'
              : 'Rejoignez les professionnels qui font confiance à SOFRAFLOW au Maroc. Créez votre premier menu digital en quelques minutes.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <button className="px-8 py-4 rounded-xl bg-[#e35d25] hover:bg-[#cf4f1a] text-white font-extrabold text-base shadow-lg shadow-[#e35d25]/30 transition-all flex items-center gap-2">
                <span>{isEn ? 'Create Digital Menu Now' : 'Créer mon menu digital maintenant'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/contact">
              <button className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-base transition-colors">
                {isEn ? 'Speak with our Team' : 'Parler à un conseiller'}
              </button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};
