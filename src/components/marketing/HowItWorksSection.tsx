import React from 'react';
import { UserPlus, Bot, Utensils, Rocket, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';

export const HowItWorksSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const steps = [
    {
      step: '01',
      icon: <UserPlus className="w-6 h-6 text-brand-orange" />,
      title: isEn ? 'Create Your Account' : 'Créez Votre Compte',
      desc: isEn
        ? 'Sign up in under 60 seconds with your name and business email. No credit card or commitment required.'
        : 'Inscrivez-vous en 60 secondes avec votre nom et e-mail professionnel. Sans carte bancaire ni engagement.',
      badge: isEn ? 'Step 1 • Free' : 'Étape 1 • Gratuit'
    },
    {
      step: '02',
      icon: <Bot className="w-6 h-6 text-brand-orange" />,
      title: isEn ? 'Meet Zina, Your AI Guide' : 'Rencontrez Zina, Votre Assistante IA',
      desc: isEn
        ? 'Engage in a friendly 2-minute conversation. Zina learns your establishment type, city, preferred language, and primary goals.'
        : 'Une conversation guidée de 2 minutes. Zina apprend votre type d’établissement, ville, langue et objectifs clés.',
      badge: isEn ? 'Step 2 • Guided' : 'Étape 2 • Guidé'
    },
    {
      step: '03',
      icon: <Utensils className="w-6 h-6 text-brand-orange" />,
      title: isEn ? 'Preview Your Digital Menu' : 'Prévisualisez Votre Carte',
      desc: isEn
        ? 'Add your signature dishes, customize prices in MAD, set up allergen tags, and test pairings instantly.'
        : 'Ajoutez vos plats phares, fixez vos prix en MAD, indiquez les allergènes et prévisualisez les suggestions d’accompagnement.',
      badge: isEn ? 'Step 3 • Live in MAD' : 'Étape 3 • En direct en MAD'
    },
    {
      step: '04',
      icon: <Rocket className="w-6 h-6 text-brand-orange" />,
      title: isEn ? 'Explore Growth Tools' : 'Découvrez Vos Outils de Croissance',
      desc: isEn
        ? 'Test table QR ordering, conversational dining guides, average order value insights, and Google review invitations.'
        : 'Expérimentez la commande par QR code, le concierge de table, l’analyse du panier moyen et la collecte d’avis Google.',
      badge: isEn ? 'Step 4 • Scaling' : 'Étape 4 • Évolution'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[var(--bg-card)] border-y border-[var(--border-subtle)] relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-orange mb-2">
            {isEn ? 'Effortless Onboarding' : 'Prise en Main Simple'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-display tracking-tight">
            {isEn ? 'From Paper to Smart Menus in 4 Clear Steps' : 'Passez de la Carte Papier au Menu Intelligent en 4 Étapes'}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {isEn
              ? 'No technical skills needed. Zina guides you through every step of tailoring SofraFlow to your Moroccan restaurant or café.'
              : 'Aucune compétence technique requise. Zina vous guide à chaque étape pour adapter SofraFlow à votre établissement.'}
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((st, idx) => (
            <div
              key={st.step}
              className="rounded-3xl p-6 bg-[var(--bg-page)] border border-[var(--border-subtle)] hover:border-brand-orange/40 transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {st.icon}
                  </div>
                  <span className="text-2xl font-black text-[var(--text-muted)] font-display opacity-50">
                    {st.step}
                  </span>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange px-2 py-0.5 rounded bg-brand-orange/10">
                  {st.badge}
                </span>

                <h3 className="text-base font-bold text-[var(--text-primary)] font-display mt-3">
                  {st.title}
                </h3>

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
                  {st.desc}
                </p>
              </div>

              <div className="pt-2">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Validated flow' : 'Étape validée'}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Onboarding Callout Banner */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-brand-navy to-[#183B6F] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold font-display">
              {isEn ? 'Experience Zina’s AI Onboarding Right Now' : 'Testez l’onboarding guidé avec Zina dès maintenant'}
            </h4>
            <p className="text-xs sm:text-sm text-white/80">
              {isEn
                ? 'Try the interactive 10-step setup conversation tailored for Moroccan hospitality.'
                : 'Découvrez la conversation interactive en 10 étapes conçue pour l’hospitalité marocaine.'}
            </p>
          </div>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs sm:text-sm font-bold shadow-lg transition-all shrink-0"
          >
            <span>{isEn ? 'Launch Zina Onboarding' : 'Lancer l’onboarding Zina'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
