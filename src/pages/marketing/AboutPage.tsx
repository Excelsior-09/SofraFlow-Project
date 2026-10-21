import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, Compass, Users, Sparkles, ArrowRight, CheckCircle2, TrendingUp, Store } from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { FounderStorySection } from '../../components/marketing/FounderStorySection';
import { SEO } from '../../components/common/SEO';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useLanguage } from '../../context/LanguageContext';
import { analytics } from '../../services/analytics';

export const AboutPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  useEffect(() => {
    analytics.trackPageView('about', 'marketing');
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { value: '100%', label: isEn ? 'Focus on Independent Hospitality' : 'Dédié aux Établissements Indépendants' },
    { value: '0%', label: isEn ? 'Commission on Food Sales' : 'Commission Prélevée sur vos Ventes' },
    { value: '< 1s', label: isEn ? 'Average Digital Menu Load Time' : 'Temps de Chargement de la Carte' },
    { value: '7j/7', label: isEn ? 'Local Technical WhatsApp Support' : 'Support Technique WhatsApp au Maroc' }
  ];

  const pillars = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      title: isEn ? 'Rock-Solid Reliability' : 'Fiabilité Absolue sur le Terrain',
      desc: isEn
        ? 'Engineered to handle peak restaurant rushes without downtime or lag. Server-verified prices protect against stale caches.'
        : 'Conçu pour encaisser les coups de feu les plus intenses sans ralentissement. Les prix sont certifiés côté serveur pour éviter toute anomalie.'
    },
    {
      icon: <Compass className="w-6 h-6 text-[#e35d25]" />,
      title: isEn ? 'Zero Customer Friction' : 'Zéro Barrière pour vos Clients',
      desc: isEn
        ? 'No mandatory app downloads or forced signups. Diners scan with their native smartphone camera and order in seconds.'
        : 'Aucune application à télécharger ni mot de passe imposé. Les convives scannent avec leur appareil photo et commandent en quelques secondes.'
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-amber-500" />,
      title: isEn ? 'Fair & Transparent Economics' : 'Équité & Indépendance Totale',
      desc: isEn
        ? 'Restaurateurs keep 100% of their earnings. A simple, predictable flat subscription without predatory percentage fees.'
        : 'Les restaurateurs conservent 100% de leur chiffre d’affaires. Un abonnement mensuel fixe sans commissions cachées sur vos plats.'
    },
    {
      icon: <Store className="w-6 h-6 text-purple-600" />,
      title: isEn ? 'Proudly Rooted in Morocco' : 'Ancré dans l’Hospitalité Marocaine',
      desc: isEn
        ? 'Built specifically for the Moroccan dining culture: seamless mint tea options, trilingual Arabic RTL, and direct WhatsApp bon dispatch.'
        : 'Pensé pour les spécificités de la table marocaine : options de sucre pour le thé, arabe natif soigné et envoi direct des bons sur WhatsApp.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-ink-main selection:bg-[#e35d25] selection:text-white">
      <SEO
        title={isEn ? "About SOFRAFLOW | Empowering Hospitality in Morocco" : "À Propos de SOFRAFLOW | Notre Mission pour les Établissements au Maroc"}
        description={isEn ? "SOFRAFLOW combines Moroccan hospitality warmth with the speed of digital QR menus and Meta WhatsApp Cloud dispatch." : "SOFRAFLOW allie la convivialité de l’hospitalité marocaine à la puissance des menus digitaux QR et des notifications WhatsApp."}
        canonical="/about"
      />
      <MarketingNav />

      {/* =========================================================
          1. HERO HEADER
      ========================================================= */}
      <section className="relative pt-16 pb-16 overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EF] to-[#FAF8F5] border-b border-gray-200/70 text-center">
        <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 rounded-full bg-[#e35d25]/10 blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e35d25]/10 border border-[#e35d25]/20 text-[#e35d25] text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-[#e35d25]" />
            <span>{isEn ? 'Our Story & Mission' : 'Notre Histoire & Notre Mission'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-forest font-display tracking-tight leading-[1.15]">
            {isEn ? (
              <>Empowering Moroccan <span className="text-[#e35d25]">independent hospitality</span></>
            ) : (
              <>Du menu papier à l’élan <span className="text-[#e35d25]">de la restauration marocaine</span></>
            )}
          </h1>

          <p className="text-base sm:text-lg text-ink-secondary max-w-2xl mx-auto leading-relaxed">
            {isEn
              ? 'We empower restaurant, cafe, and hotel owners with frictionless digital menus and instant WhatsApp kitchen communication.'
              : 'Nous accompagnons les restaurateurs indépendants avec des cartes digitales sans friction et une communication directe en cuisine via WhatsApp.'}
          </p>
        </div>
      </section>

      {/* =========================================================
          2. IMPACT NUMBERS
      ========================================================= */}
      <section className="py-12 bg-white border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200/80">
                <span className="text-3xl sm:text-4xl font-black text-forest font-display block">
                  {s.value}
                </span>
                <span className="text-xs text-ink-secondary font-medium block mt-1">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          3. FOUNDER STORY & VISION
      ========================================================= */}
      <FounderStorySection />

      {/* =========================================================
          4. CORE PILLARS
      ========================================================= */}
      <section className="py-20 bg-[#FAF8F5] border-y border-gray-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-[#e35d25] uppercase tracking-wider">
              {isEn ? 'Core Values' : 'Nos Principes Fondateurs'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-forest font-display">
              {isEn ? 'What drives every line of code we write' : 'Ce qui guide chaque fonctionnalité que nous développons'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pil, idx) => (
              <div
                key={idx}
                className="bg-white p-7 rounded-3xl border border-gray-200/90 shadow-sm space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-gray-100 flex items-center justify-center">
                    {pil.icon}
                  </div>
                  <h3 className="font-bold text-base text-forest font-display">{pil.title}</h3>
                  <p className="text-xs text-ink-secondary leading-relaxed">{pil.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          5. FINAL CTA BANNER
      ========================================================= */}
      <section className="py-20 bg-[#0B132B] text-white text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#e35d25]/15 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black font-display leading-tight text-white">
            {isEn ? 'Join the leading digital dining platform in Morocco' : 'Rejoignez la nouvelle génération de restaurateurs au Maroc'}
          </h2>
          <p className="text-white/80 text-base max-w-xl mx-auto leading-relaxed">
            {isEn
              ? 'Start with 14 days of free trial. Our local team is ready to walk you through setup.'
              : 'Bénéficiez de 14 jours d’essai gratuit. Notre équipe locale est à votre disposition pour vous accompagner.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <button className="px-8 py-4 rounded-xl bg-[#e35d25] hover:bg-[#cf4f1a] text-white font-extrabold text-base shadow-lg shadow-[#e35d25]/30 transition-all flex items-center gap-2">
                <span>{isEn ? 'Start Free Trial Now' : 'Créer mon menu digital maintenant'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/m/le-jardin">
              <button className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-base transition-colors">
                {isEn ? 'View Live Customer Menu' : 'Découvrir la démo client'}
              </button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};
