import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const FinalCtaSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-page)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="relative rounded-3xl bg-gradient-to-br from-brand-navy via-[#163666] to-[#0D2244] text-white p-8 sm:p-14 lg:p-16 shadow-2xl border border-white/10 overflow-hidden">
          {/* Ambient decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-gold/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              <span>{isEn ? 'Launch Your Smart Menu in 15 Minutes' : 'Lancez Votre Carte Intelligente en 15 Minutes'}</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight leading-tight">
              {isEn
                ? 'Ready to turn every order into an opportunity to grow?'
                : 'Prêt à transformer chaque commande en opportunité de croissance ?'}
            </h2>

            {/* Supporting Subhead */}
            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl mx-auto">
              {isEn
                ? 'Join forward-thinking Moroccan restaurants, cafés, and food-service leaders upgrading to SofraFlow. Start your 14-day free trial today.'
                : 'Rejoignez les restaurateurs et gérants de cafés au Maroc qui modernisent leur expérience avec SofraFlow. Démarrez votre essai gratuit de 14 jours.'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-black text-sm shadow-xl shadow-brand-orange/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{isEn ? 'Start 14-Day Free Trial' : 'Commencer l’Essai Gratuit 14 Jours'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/onboarding"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-brand-gold" />
                <span>{isEn ? 'Meet Zina (Interactive Onboarding)' : 'Rencontrer Zina (Onboarding)'}</span>
              </Link>
            </div>

            {/* Micro Pillars */}
            <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                <span>{isEn ? 'No credit card required' : 'Sans carte bancaire requise'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                <span>{isEn ? 'Full feature access' : 'Accès complet à toutes les options'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                <span>{isEn ? 'Friendly WhatsApp & email support' : 'Support WhatsApp & e-mail réactif'}</span>
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
