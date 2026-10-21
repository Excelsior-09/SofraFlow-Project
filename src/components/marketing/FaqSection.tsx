import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const FaqSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  const faqs = [
    {
      q: isEn ? 'What is SofraFlow?' : 'Qu’est-ce que SofraFlow ?',
      a: isEn
        ? 'SofraFlow is a restaurant technology and growth platform designed specifically for Moroccan restaurants, cafés, snack bars, and bakeries. It combines digital QR menus, an AI dining concierge (Zina), smart upselling pairings, sales analytics in MAD, and post-visit review invitations into one cohesive tool.'
        : 'SofraFlow est une plateforme de technologie et de croissance pour la restauration au Maroc (restaurants, cafés, snacks, boulangeries). Elle réunit cartes QR interactives, concierge IA de table (Zina), suggestions d’accompagnement, analyses des ventes en MAD et collecte d’avis Google.'
    },
    {
      q: isEn ? 'Which food businesses can use SofraFlow?' : 'Quels types d’établissements peuvent utiliser SofraFlow ?',
      a: isEn
        ? 'Any business that serves food or drinks through a menu! This includes traditional Moroccan restaurants, contemporary bistros, specialty coffee shops, fast-food burger & taco spots, pastry shops, juice bars, and riad rooftop lounges.'
        : 'Tout établissement proposant une offre de restauration : restaurants traditionnels marocains, bistrots modernes, coffee shops, snacks et fast-foods, pâtisseries fines, bars à jus et rooftops de riads.'
    },
    {
      q: isEn ? 'How does QR-code ordering work for customers?' : 'Comment fonctionne la commande par QR code pour les clients ?',
      a: isEn
        ? 'Guests simply scan the permanent QR code on their table using their iPhone or Android camera. The menu opens immediately in their web browser—without needing to download any app or register. They can browse categories, customize dishes, and review their order subtotal in MAD.'
        : 'Le client scanne le QR code placé sur la table avec l’appareil photo de son smartphone (iOS ou Android). La carte s’ouvre directement dans le navigateur sans rien télécharger ni créer de compte. Il consulte la carte, personnalise ses plats et vérifie son panier en MAD.'
    },
    {
      q: isEn ? 'Can I update prices and dishes in real time?' : 'Puis-je modifier mes prix et plats en temps réel ?',
      a: isEn
        ? 'Yes, absolutely. You can change prices, adjust descriptions, upload new photos, or temporarily toggle off a sold-out dish directly from your smartphone or tablet in seconds. The change reflects immediately on every table stand without reprinting.'
        : 'Absolument. Vous pouvez modifier un tarif en MAD, changer une photo, ajouter une suggestion du jour ou désactiver un plat épuisé depuis votre smartphone en quelques secondes. La modification est instantanée sur toutes les tables sans aucune réimpression.'
    },
    {
      q: isEn ? 'How does the AI assistant (Zina) help customers?' : 'Comment l’assistante IA (Zina) aide-t-elle les clients ?',
      a: isEn
        ? 'Zina is an intelligent, polite digital concierge accessible directly on the digital menu. Guests can ask questions like “What can I get for under 80 MAD?” or “What pairs best with this burger?”. Zina answers based strictly on your restaurant’s verified menu, dishes, and MAD prices in French or English.'
        : 'Zina est un concierge digital accessible d’un clic sur la carte. Les convives peuvent lui poser des questions de budget (« Que puis-je prendre pour moins de 80 MAD ? ») ou d’accord (« Que boire avec ce burger ? »). Zina répond précisément à partir de votre carte en français ou en anglais.'
    },
    {
      q: isEn ? 'How do recommendations and upselling work without annoying guests?' : 'Comment fonctionnent les suggestions d’upselling sans importuner les clients ?',
      a: isEn
        ? 'Rather than intrusive pop-ups, SofraFlow integrates tasteful, complementary pairings directly into the ordering flow (e.g. suggesting artisanal mint tea with pastries, or seasoned fries with a burger). Recommendations are optional and feel like thoughtful hospitality.'
        : 'Plutôt que des fenêtres intrusives, SofraFlow intègre des suggestions d’accompagnements logiques et bienveillantes (ex. un thé à la menthe avec une corne de gazelle, des frites maison avec un burger). Ces options sont discrètes et valorisent l’expérience.'
    },
    {
      q: isEn ? 'Can I see my restaurant’s sales performance in Moroccan Dirhams?' : 'Puis-je suivre les performances de mon établissement en Dirhams marocains ?',
      a: isEn
        ? 'Yes. SofraFlow provides an analytics preview showing weekly revenue, total order volume, average order value (AOV), best-selling dishes, and category breakdowns, all tracked in MAD.'
        : 'Oui. SofraFlow offre une vue d’ensemble de vos ventes : chiffre d’affaires, volume de commandes, panier moyen (AOV), plats vedettes et répartition par catégorie, le tout calculé en MAD.'
    },
    {
      q: isEn ? 'How does the Google review experience work?' : 'Comment fonctionne l’invitation aux avis Google ?',
      a: isEn
        ? 'When a diner finishes their visit, SofraFlow offers a polite feedback invitation that links directly to your official Google Maps business page. SofraFlow does not manipulate reviews or gate dissatisfied guests, ensuring honest, authentic social proof.'
        : 'Une fois le repas terminé, SofraFlow propose une invitation courtoise redirigeant vers votre fiche Google Maps certifiée. SofraFlow n’effectue aucun filtrage artificiel et garantit des retours authentiques.'
    },
    {
      q: isEn ? 'Is a free trial available?' : 'Un essai gratuit est-il disponible ?',
      a: isEn
        ? 'Yes! You can explore all of SofraFlow’s features free for 14 days. No credit card is required to sign up, and you can test the onboarding experience with Zina immediately.'
        : 'Oui ! Vous bénéficiez de 14 jours d’essai complet sur toutes les fonctionnalités, sans aucune carte bancaire requise. Vous pouvez lancer l’onboarding guidé avec Zina dès maintenant.'
    },
    {
      q: isEn ? 'Is the platform fully bilingual in French and English?' : 'La plateforme est-elle entièrement bilingue en français et anglais ?',
      a: isEn
        ? 'Yes. Both the merchant setup and the customer digital menu are natively available in professionally written French and English, with support for Moroccan Dirhams (MAD) throughout.'
        : 'Oui. L’espace de gestion gérant et la carte client mobile sont entièrement disponibles en français et en anglais avec une terminologie professionnelle adaptée au marché marocain.'
    },
    {
      q: isEn ? 'Do I need special hardware or expensive POS equipment?' : 'Ai-je besoin de matériel spécialisé ou d’une caisse coûteuse ?',
      a: isEn
        ? 'No special hardware is required. SofraFlow works on any web-enabled device—smartphones, iPads, tablets, laptops, or existing POS screens.'
        : 'Aucun matériel dédié n’est nécessaire. SofraFlow fonctionne dans tout navigateur web moderne : smartphone, iPad, tablette Android, PC ou écran de caisse existant.'
    },
    {
      q: isEn ? 'How do I get started with Zina onboarding?' : 'Comment démarrer avec l’onboarding guidé de Zina ?',
      a: isEn
        ? 'Simply click “Start free” or “Zina Onboarding”. In a quick, conversational flow, Zina will ask for your establishment name, sector, city, and goals to prepare your restaurant profile.'
        : 'Cliquez simplement sur « Commencer l’essai gratuit » ou « Onboarding Zina ». En quelques échanges interactifs, Zina recueille votre nom, secteur, ville et objectifs pour configurer votre profil.'
    }
  ];

  return (
    <section id="faq" className="py-24 bg-[var(--bg-card)] border-t border-[var(--border-subtle)] relative scroll-mt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-orange mb-2">
            {isEn ? 'Got Questions?' : 'Des Questions ?'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-display tracking-tight">
            {isEn ? 'Frequently Asked Questions' : 'Foire Aux Questions'}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)]">
            {isEn
              ? 'Everything you need to know about SofraFlow, QR ordering, and Zina AI.'
              : 'Tout ce que vous devez savoir sur SofraFlow, les cartes QR et l’assistante IA Zina.'}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((f, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[var(--bg-page)] border border-[var(--border-subtle)] overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-[var(--text-primary)] font-display">
                    {f.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-brand-orange shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)]/60">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
