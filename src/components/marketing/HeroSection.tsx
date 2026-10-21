import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, QrCode, TrendingUp, Star, ShieldCheck, CheckCircle2, Utensils } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const HeroSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-[var(--bg-page)] via-[var(--bg-card)] to-[var(--bg-page)]">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-orange/10 dark:bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-brand-navy/10 dark:bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-orange/10 dark:bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isEn ? 'The Modern Restaurant Growth Platform' : 'La Plateforme de Croissance pour la Restauration'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--text-primary)] font-display tracking-tight leading-[1.12]">
              {isEn ? (
                <>
                  Smarter menus.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-brand-gold to-brand-orange">
                    Better orders.
                  </span>{' '}
                  More restaurant growth.
                </>
              ) : (
                <>
                  Des menus plus intelligents.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-brand-gold to-brand-orange">
                    De meilleures commandes.
                  </span>{' '}
                  Plus de croissance.
                </>
              )}
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {isEn
                ? 'Turn every menu into a better customer experience and every order into an opportunity to grow. Designed for Moroccan restaurants, cafés, snack bars, and bakeries moving beyond traditional paper menus.'
                : 'Faites de chaque menu une expérience client remarquable et de chaque commande une opportunité de croissance. Conçu pour les restaurants, cafés, snacks et boulangeries du Maroc prêts à dépasser la carte papier.'}
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{isEn ? 'Start free trial' : 'Commencer l’essai gratuit'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#demo-section"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] font-semibold text-sm transition-all duration-200"
              >
                <Utensils className="w-4 h-4 text-brand-orange" />
                <span>{isEn ? 'Explore interactive demo' : 'Explorer la démo interactive'}</span>
              </a>
            </div>

            {/* Key Micro-Pillars */}
            <div className="pt-6 border-t border-[var(--border-subtle)] grid grid-cols-3 gap-3 text-left">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xs text-[var(--text-secondary)] font-medium">
                  {isEn ? '14-day free trial' : '14 jours d’essai'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xs text-[var(--text-secondary)] font-medium">
                  {isEn ? 'No credit card' : 'Sans carte bancaire'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xs text-[var(--text-secondary)] font-medium">
                  {isEn ? 'Live in 15 minutes' : 'En ligne en 15 min'}
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Product Demonstration Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-[360px] sm:max-w-[400px]">
              
              {/* Floating Top Badge: QR Table Tag */}
              <div className="absolute -top-4 -left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl animate-bounce-subtle">
                <div className="w-7 h-7 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    {isEn ? 'Table QR Code' : 'QR Code de Table'}
                  </p>
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    {isEn ? 'Table 4 • Dine-In' : 'Table 4 • Sur Place'}
                  </p>
                </div>
              </div>

              {/* Central Phone Mockup */}
              <div className="relative rounded-[2.5rem] border-[6px] border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl p-4 overflow-hidden">
                {/* Phone Speaker Notch */}
                <div className="w-24 h-4 bg-[var(--border-subtle)] rounded-full mx-auto mb-3" />

                {/* Header inside Phone */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                  <div>
                    <h3 className="text-xs font-black text-[var(--text-primary)]">Café & Bistro Atlas</h3>
                    <p className="text-[10px] text-[var(--text-muted)]">Casablanca • Menu Digital</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                    {isEn ? 'Open Now' : 'Ouvert'}
                  </span>
                </div>

                {/* Hero Dish inside Phone */}
                <div className="mt-3 relative rounded-2xl overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80"
                    alt="Atlas Gourmet Smash Burger"
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-brand-orange text-white text-[10px] font-bold shadow">
                    {isEn ? 'Best Seller' : 'Plus Populaire'}
                  </div>
                  <div className="p-3 bg-[var(--bg-card)]">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">
                        {isEn ? 'Atlas Gourmet Smash Burger' : 'Smash Burger Gourmet de l’Atlas'}
                      </h4>
                      <span className="text-xs font-extrabold text-brand-orange">78 MAD</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                      {isEn ? 'Double beef patty, smoked gouda, harissa mayo' : 'Double steak haché, gouda fumé, mayo harissa'}
                    </p>
                  </div>
                </div>

                {/* AI Recommendation Pill */}
                <div className="mt-3 p-2.5 rounded-xl bg-brand-orange/5 border border-brand-orange/20 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-brand-orange shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-brand-orange">
                      {isEn ? 'Smart Pairing Recommendation' : 'Suggestion d’Accompagnement'}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] leading-tight">
                      {isEn
                        ? 'Pairs perfectly with Fresh Mint Lemonade (+28 MAD)'
                        : 'Idéal avec notre Citronnade Fraîche à la Menthe (+28 MAD)'}
                    </p>
                  </div>
                </div>

                {/* Second Dish Thumbnail */}
                <div className="mt-2.5 flex items-center gap-2.5 p-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)]">
                  <img
                    src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=120&auto=format&fit=crop&q=80"
                    alt="Moroccan Mint Tea"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-[var(--text-primary)] truncate">
                      {isEn ? 'Moroccan Mint Tea' : 'Thé à la Menthe Fraîche'}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">22 MAD</p>
                  </div>
                  <button className="px-2.5 py-1 rounded-lg bg-brand-orange text-white text-[10px] font-bold">
                    + {isEn ? 'Add' : 'Ajouter'}
                  </button>
                </div>
              </div>

              {/* Floating Bottom Card: Zina AI Assistant */}
              <div className="absolute -bottom-5 -right-4 z-20 max-w-[220px] p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-orange to-brand-gold flex items-center justify-center text-white shrink-0 text-xs font-bold shadow">
                  Z
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-[var(--text-primary)]">Zina</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-brand-orange/10 text-brand-orange font-bold">AI</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-snug mt-0.5">
                    {isEn ? '“Can I help you choose under 80 MAD?”' : '« Puis-je vous aider pour moins de 80 MAD ? »'}
                  </p>
                </div>
              </div>

              {/* Floating Left Card: Sales Analytics Metric */}
              <div className="hidden sm:flex absolute top-1/2 -left-8 -translate-y-1/2 z-20 items-center gap-2.5 p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-lg">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] text-[var(--text-muted)] font-medium">
                    {isEn ? 'Average Ticket (AOV)' : 'Panier Moyen'}
                  </p>
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    +18.4% MAD
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
