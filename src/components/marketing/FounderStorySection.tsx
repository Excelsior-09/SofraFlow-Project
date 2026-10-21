import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Quote, Utensils, TrendingUp, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const FounderStorySection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <section
      id="story"
      data-section="about"
      className="py-24 bg-gradient-to-b from-[var(--bg-page)] via-[var(--bg-card)] to-[var(--bg-page)] border-t border-[var(--border-subtle)] relative overflow-hidden scroll-mt-24"
    >
      {/* Anchor alias for #about */}
      <span id="about" className="absolute -top-24" />

      {/* Decorative ambient gradients */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-brand-orange/10 dark:bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-brand-navy/10 dark:bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header Tag */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-orange/10 dark:bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEn ? "Founder's Vision & Origin Story" : "La Vision du Fondateur & Notre Histoire"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)] font-display tracking-tight leading-tight">
            {isEn
              ? 'Built From a Simple Observation. Designed for Better Business.'
              : 'Né d’une observation simple. Conçu pour faire grandir les établissements.'}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {isEn
              ? 'How an everyday dining experience inspired a smarter, growth-focused technology for restaurants and cafés.'
              : 'Comment l’expérience vécue en salle a inspiré une technologie utile au service des restaurateurs.'}
          </p>
        </div>

        {/* Founder Portrait & Narrative Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Dedicated Founder Portrait Component (5 cols) */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md">
              
              {/* Outer decorative card frame with brand gradient border */}
              <div className="relative rounded-[2.5rem] p-2 bg-gradient-to-br from-brand-orange via-brand-gold to-brand-navy shadow-2xl overflow-hidden">
                <div className="relative rounded-[2.2rem] overflow-hidden bg-[var(--bg-card)]">
                  
                  {/* CEO Photo */}
                  <img
                    src="/ziraoui-anas.jpg"
                    alt="Ziraoui Anas, Founder and CEO of SofraFlow"
                    loading="lazy"
                    className="w-full h-[460px] sm:h-[500px] object-cover object-top transition-transform duration-700 hover:scale-105"
                  />

                  {/* Gradient Overlay for Text Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                  {/* Top Location / Status Pill */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Casablanca, Morocco</span>
                  </div>

                  {/* Bottom Founder Identity Card */}
                  <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/10 dark:bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black font-display tracking-tight text-white">
                        Ziraoui Anas
                      </h3>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-orange text-white">
                        Founder
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-brand-gold">
                      {isEn ? 'Founder & CEO of SofraFlow' : 'Fondateur & CEO de SofraFlow'}
                    </p>
                    <p className="text-[11px] text-white/80 leading-snug pt-0.5">
                      {isEn
                        ? 'Passionate about hospitality technology & business growth'
                        : 'Passionné par la tech au service de la restauration'}
                    </p>
                  </div>

                </div>
              </div>

              {/* Floating Decorative Quote Mark */}
              <div className="absolute -bottom-4 -right-4 w-14 h-14 rounded-2xl bg-brand-orange text-white flex items-center justify-center shadow-xl shadow-brand-orange/30">
                <Quote className="w-7 h-7" />
              </div>

            </div>
          </div>

          {/* Right Column: Authentic Storytelling (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* The Authentic Narrative in First Person */}
            <div className="space-y-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              
              <p className="font-bold text-base sm:text-lg text-[var(--text-primary)]">
                {isEn
                  ? '“My name is Ziraoui Anas, and I’m the founder of SofraFlow.”'
                  : '« Je m’appelle Ziraoui Anas, et je suis le fondateur de SofraFlow. »'}
              </p>

              <p>
                {isEn
                  ? 'The idea began with something I noticed while visiting restaurants and cafés. Behind every menu was a business working hard to serve its customers, yet I often saw opportunities that were easy to overlook.'
                  : 'L’idée est née d’une observation récurrente lors de mes visites dans des restaurants et cafés. Derrière chaque menu se trouvait un établissement travaillant dur pour servir ses clients, et pourtant je voyais souvent des opportunités faciles à manquer.'}
              </p>

              <p>
                {isEn
                  ? 'A customer might order a meal without knowing which drink would complement it. A café might have excellent products but no effective way to highlight its bestsellers. A restaurant might have opportunities to introduce special offers, recommend complementary items, or make its menu easier and more engaging to explore.'
                  : 'Un client commandait un plat sans savoir quelle boisson l’accompagnerait à merveille. Un café proposait d’excellents produits sans moyen de valoriser ses meilleures ventes. Un restaurant laissait passer l’occasion de proposer un dessert gourmand ou de rendre sa carte captivante.'}
              </p>

              <p>
                {isEn
                  ? 'I began to see that the challenge was not simply getting customers through the door. It was also helping businesses make more of the opportunities they already had.'
                  : 'J’ai compris que le véritable enjeu n’était pas seulement d’attirer des clients en salle, mais surtout d’aider chaque établissement à tirer le meilleur parti des commandes qu’il recevait déjà.'}
              </p>

              <p>
                {isEn
                  ? 'Many small and medium-sized businesses cannot afford complicated technology, expensive consultants, or sophisticated sales systems. They need practical tools that are easy to use, accessible, and designed around the way they actually operate.'
                  : 'La majorité des cafés et restaurants indépendants ne peuvent pas s’offrir des logiciels compliqués ou des consultants coûteux. Ils ont besoin d’outils simples, accessibles et conçus pour leur quotidien.'}
              </p>

              <p className="p-4 rounded-2xl bg-brand-orange/5 border border-brand-orange/20 text-[var(--text-primary)] font-medium">
                {isEn
                  ? 'SofraFlow was created with a simple idea in mind: a digital menu should be more than a list of products and prices. It should be an opportunity to improve how customers discover products, explore offers, place orders, and interact with a business.'
                  : 'SofraFlow a été créé avec une conviction simple : une carte digitale ne doit pas être une simple liste de plats et de tarifs. Elle doit être un formidable levier pour faire découvrir vos créations, suggérer les bons accords et fluidifier la commande.'}
              </p>

              <p>
                {isEn
                  ? 'Our vision is to help restaurants, cafés, bakeries, snack shops, and other menu-driven businesses make their offerings work harder for them. Through a more engaging digital experience and, where available, intelligent recommendations and business insights, we want to help owners discover new opportunities to serve their customers and grow their businesses.'
                  : 'Notre vision est d’accompagner les restaurateurs, cafés, boulangeries et snacks pour que leur carte devienne leur meilleur allié. À travers une expérience interactive et des suggestions pertinentes, nous voulons rapprocher la technologie utile de ceux qui en ont le plus besoin.'}
              </p>

            </div>

            {/* Three Key Principles Grid */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                  <Heart className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  {isEn ? 'Better Customer Experiences' : 'Expériences Client Enrichies'}
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                  {isEn ? 'Frictionless discovery and easy ordering for guests.' : 'Découverte intuitive et plaisir de commande sans barrière.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-2">
                  <Utensils className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  {isEn ? 'Smarter Menu Presentation' : 'Présentation Intelligente'}
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                  {isEn ? 'Instant updates in MAD and natural pairings.' : 'Mises à jour instantanées en MAD et accords naturels.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  {isEn ? 'More Opportunities for Growth' : 'Opportunités de Croissance'}
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                  {isEn ? 'Turning every order into an opportunity to grow.' : 'Transformer chaque commande en opportunité de développement.'}
                </p>
              </div>
            </div>

            {/* Closing Statement Block */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-navy to-[#183B6F] text-white space-y-2 shadow-lg">
              <p className="text-xs sm:text-sm font-bold text-white/95 italic leading-relaxed">
                {isEn
                  ? '“Built with businesses in mind. Designed around better customer experiences. Created to help every order become an opportunity.”'
                  : '« Conçu pour les professionnels. Pensé pour l’expérience client. Créé pour que chaque commande devienne une opportunité. »'}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-brand-gold">— Ziraoui Anas, CEO</span>
                <span className="text-[11px] text-white/70">SofraFlow Morocco</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-orange/20 transition-all"
              >
                <span>{isEn ? 'Explore Platform Features' : 'Découvrir nos Fonctionnalités'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] font-semibold text-xs sm:text-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-brand-orange" />
                <span>{isEn ? 'Start 14-Day Free Trial' : 'Essayer 14 Jours Gratuits'}</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
