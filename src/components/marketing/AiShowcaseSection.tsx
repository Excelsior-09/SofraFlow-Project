import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  TrendingUp,
  Coins,
  SearchCheck,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AI_CUSTOMER_PROMPTS, AI_FINANCIAL_PROMPTS, DEMO_ANALYTICS_DATA } from '../../data/demoData';

export const AiShowcaseSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<'customer' | 'finance' | 'analyzer'>('customer');
  const [selectedPromptIdx, setSelectedPromptIdx] = useState<number>(0);
  const [selectedFinIdx, setSelectedFinIdx] = useState<number>(0);

  const activeCustomerPrompt = AI_CUSTOMER_PROMPTS[selectedPromptIdx];
  const activeFinPrompt = AI_FINANCIAL_PROMPTS[selectedFinIdx];

  return (
    <section className="py-24 bg-[var(--bg-card)] border-y border-[var(--border-subtle)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEn ? 'AI-Driven Hospitality' : 'L’Intelligence Artificielle en Restauration'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-display tracking-tight">
            {isEn
              ? 'Meet Zina: AI for Your Diners, Intelligence for Your Business'
              : 'Découvrez Zina : L’IA pour vos clients, la clarté pour votre gestion'}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {isEn
              ? 'SofraFlow uses conversational AI to guide diners through your menu while helping managers interpret ticket sizes, pairings, and gross margins.'
              : 'SofraFlow utilise l’IA conversationnelle pour guider vos convives tout en aidant les gérants à analyser le panier moyen et les marges.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex p-1.5 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-subtle)] mt-8">
            <button
              onClick={() => setActiveTab('customer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'customer'
                  ? 'bg-brand-orange text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isEn ? '1. AI Customer Concierge' : '1. Concierge Client IA'}</span>
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'finance'
                  ? 'bg-brand-orange text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>{isEn ? '2. AI Financial Advisor' : '2. Conseiller Financier IA'}</span>
            </button>
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'analyzer'
                  ? 'bg-brand-orange text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <SearchCheck className="w-4 h-4" />
              <span>{isEn ? '3. Menu Analyzer' : '3. Analyseur de Carte'}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: AI Customer Concierge */}
        {activeTab === 'customer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Prompt Selector */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-display">
                {isEn ? 'Common Diner Inquiries' : 'Questions Fréquentes des Clients'}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                {isEn
                  ? 'Click a sample question to see how Zina guides guests using actual restaurant prices in MAD.'
                  : 'Cliquez sur une question pour voir comment Zina guide les clients avec les prix réels en MAD.'}
              </p>

              <div className="space-y-2 pt-2">
                {AI_CUSTOMER_PROMPTS.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedPromptIdx(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                      selectedPromptIdx === idx
                        ? 'bg-[var(--bg-page)] border-brand-orange text-brand-orange font-bold shadow-sm'
                        : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-brand-orange/40'
                    }`}
                  >
                    <span>{item.prompt[language]}</span>
                    <ArrowRight className={`w-3.5 h-3.5 shrink-0 ml-2 ${selectedPromptIdx === idx ? 'text-brand-orange' : 'text-transparent'}`} />
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Zero Hallucinations' : 'Zéro Hallucination'}</span>
                </p>
                <p className="mt-1 text-[11px] leading-relaxed">
                  {isEn
                    ? 'Zina is grounded directly on your restaurant’s menu database, allergen flags, and live prices in MAD.'
                    : 'Zina s’appuie exclusivement sur la base de données de votre carte, vos allergènes et vos prix en MAD.'}
                </p>
              </div>
            </div>

            {/* Right: Simulated Chat Bubble */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl bg-[var(--bg-page)] border border-[var(--border-subtle)] p-6 shadow-xl space-y-4">
                
                {/* Chat Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-orange to-brand-gold flex items-center justify-center text-white text-xs font-bold shadow">
                      Z
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">Zina by SofraFlow</p>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {isEn ? 'AI Dining Concierge • Café Atlas' : 'Concierge IA de Table • Café Atlas'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                    {isEn ? 'Simulated Demo' : 'Démo Simulée'}
                  </span>
                </div>

                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] p-3.5 rounded-2xl rounded-tr-none bg-brand-navy text-white text-xs sm:text-sm font-medium shadow-sm">
                    {activeCustomerPrompt.prompt[language]}
                  </div>
                </div>

                {/* Zina Response */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange text-xs font-bold shrink-0 mt-1">
                    Z
                  </div>
                  <div className="max-w-[85%] p-4 rounded-2xl rounded-tl-none bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm space-y-3">
                    <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                      {activeCustomerPrompt.response[language]}
                    </p>
                    <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {isEn ? 'Budget verification: Grounded in MAD' : 'Validation budget : Vérifié en MAD'}
                      </span>
                      <a
                        href="#demo-section"
                        className="text-[11px] font-bold text-brand-orange hover:text-brand-orange-hover"
                      >
                        {isEn ? 'Test inside full menu →' : 'Tester sur le menu →'}
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* Tab 2: AI Financial Advisor */}
        {activeTab === 'finance' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Financial Prompt Selector */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-display">
                {isEn ? 'Strategic Inquiries for Restaurant Owners' : 'Questions Stratégiques pour Gérants'}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                {isEn
                  ? 'Zina helps owners understand average order value, margin levers, and menu profitability without accountant jargon.'
                  : 'Zina aide les restaurateurs à comprendre leur panier moyen, leurs leviers de marge et leur rentabilité sans jargon.'}
              </p>

              <div className="space-y-2 pt-2">
                {AI_FINANCIAL_PROMPTS.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedFinIdx(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                      selectedFinIdx === idx
                        ? 'bg-[var(--bg-page)] border-brand-orange text-brand-orange font-bold shadow-sm'
                        : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-brand-orange/40'
                    }`}
                  >
                    <span>{item.question[language]}</span>
                    <ArrowRight className={`w-3.5 h-3.5 shrink-0 ml-2 ${selectedFinIdx === idx ? 'text-brand-orange' : 'text-transparent'}`} />
                  </button>
                ))}
              </div>

              {/* Responsible Financial Principle Alert */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Responsible Financial Principle' : 'Principe de Gestion Responsable'}</span>
                </p>
                <p className="text-[11px] leading-relaxed">
                  {isEn
                    ? 'Revenue is not profit. Actual margins require precise food cost and overhead data. Zina provides strategic frameworks, not accounting guarantees.'
                    : 'Le chiffre d’affaires n’est pas le profit. Zina apporte des pistes d’optimisation stratégiques et ne remplace pas un expert-comptable.'}
                </p>
              </div>
            </div>

            {/* Right: Financial Insight Preview */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl bg-[var(--bg-page)] border border-[var(--border-subtle)] p-6 shadow-xl space-y-5">
                
                {/* Metric Summary Ribbon */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{isEn ? 'Weekly Revenue' : 'Chiffre d’Affaires'}</p>
                    <p className="text-base font-extrabold text-[var(--text-primary)] mt-0.5">46,250 MAD</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{isEn ? 'Average Basket' : 'Panier Moyen'}</p>
                    <p className="text-base font-extrabold text-brand-orange mt-0.5">120.4 MAD</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{isEn ? 'Upsell Conv.' : 'Taux d’Upsell'}</p>
                    <p className="text-base font-extrabold text-emerald-600 mt-0.5">22.8%</p>
                  </div>
                </div>

                {/* Question Bubble */}
                <div className="p-3 rounded-xl bg-brand-navy/5 dark:bg-brand-navy/30 border border-brand-navy/10 text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                  <strong>{isEn ? 'Question:' : 'Question :'}</strong> {activeFinPrompt.question[language]}
                </div>

                {/* Insight & Recommendation Card */}
                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-brand-orange/30 shadow-sm space-y-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-orange/10 text-brand-orange">
                      {isEn ? 'AI Strategic Analysis' : 'Analyse Stratégique IA'}
                    </span>
                    <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed mt-2">
                      {activeFinPrompt.insight[language]}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-brand-orange/5 border border-brand-orange/20">
                    <p className="text-[11px] font-bold text-brand-orange">
                      🎯 {isEn ? 'Recommended Action' : 'Action Recommandée'} :
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {activeFinPrompt.actionableStep[language]}
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Menu Analyzer Matrix */}
        {activeTab === 'analyzer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-display">
                {isEn ? 'AI Menu Engineering & Velocity Matrix' : 'Matrice de Rentabilité & Vitesse des Plats'}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {isEn
                  ? 'SofraFlow categorizes your dishes based on order frequency and estimated contribution margin, showing you exactly where to optimize.'
                  : 'SofraFlow classe vos plats selon leur fréquence de commande et leur marge estimée pour vous orienter vers les meilleures actions.'}
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold">⭐ {isEn ? 'Stars (High Volume, High Margin)' : 'Étoiles (Fort Volume, Forte Marge)'}</span>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {isEn ? 'Promote prominently on menu home screen.' : 'À mettre en tête de carte et en avant sur les QR stands.'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300">
                  <span className="font-bold">🐴 {isEn ? 'Workhorses (High Volume, Moderate Margin)' : 'Piliers (Fort Volume, Marge Modérée)'}</span>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
                    {isEn ? 'Pair with high-margin beverages to lift total ticket.' : 'Associer à des boissons à forte marge pour booster le panier.'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
                  <span className="font-bold">💎 {isEn ? 'Hidden Gems (Low Volume, High Margin)' : 'Pépites (Faible Volume, Forte Marge)'}</span>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                    {isEn ? 'Improve photos and descriptions to drive discovery.' : 'Améliorer les visuels et descriptions pour stimuler l’essai.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Matrix Visual Table */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl bg-[var(--bg-page)] border border-[var(--border-subtle)] p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[var(--border-subtle)]">
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {isEn ? 'Sample Dish Performance Breakdown' : 'Analyse de Performance des Plats (Exemple)'}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">Café & Bistro Atlas</span>
                </div>

                <div className="divide-y divide-[var(--border-subtle)]">
                  {DEMO_ANALYTICS_DATA.topDishes.map((dish, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                          {isEn ? dish.nameEn : dish.name}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {dish.orders} {isEn ? 'orders this week' : 'commandes cette semaine'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-extrabold text-brand-orange">{dish.revenue}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-navy/10 dark:bg-brand-navy/40 text-[var(--text-secondary)] font-bold">
                          {idx === 0 ? '⭐ Star' : idx === 1 ? '🐴 Workhorse' : idx === 2 ? '💎 Hidden Gem' : '🥤 Beverage Anchor'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {isEn
                      ? 'Simulated demonstration based on consistent MAD sample dataset'
                      : 'Simulation basée sur un jeu de données cohérent en Dirhams marocains (MAD)'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
