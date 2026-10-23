import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { ShieldCheck, Globe, ArrowRight, Heart, Sparkles, Mail, Phone } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import { OFFICIAL_CONTACT } from '../../data/contactConfig';

export const MarketingFooter: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <footer className="bg-[#0B132B] dark:bg-[#070D1A] text-white/80 border-t border-white/10 pt-16 pb-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <Logo variant="light" showTagline={true} size="md" />
            <p className="text-sm text-white/70 max-w-sm leading-relaxed">
              {isEn
                ? 'The leading restaurant growth, digital menu, and AI-assisted ordering platform designed for Moroccan hospitality.'
                : 'La plateforme de croissance restaurant, menu digital QR et assistance culinaire par IA conçue pour les professionnels au Maroc.'}
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs text-white/60">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                {isEn ? 'Official WhatsApp Kitchen Dispatch Architecture' : 'Transmission Directe des Commandes WhatsApp'}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-orange-400" />
                {isEn ? 'Bilingual English & French with Arabic Food Support' : 'Bilingue Français & Anglais avec Cartes Arabes'}
              </span>
            </div>
          </div>

          {/* Solutions Column (3 cols) */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {isEn ? 'Industry Solutions' : 'Solutions par Métier'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/solutions/restaurants" className="hover:text-orange-400 transition-colors">
                  {isEn ? 'Restaurants & Riads' : 'Restaurants & Riads'}
                </Link>
              </li>
              <li>
                <Link to="/solutions/cafes" className="hover:text-orange-400 transition-colors">
                  {isEn ? 'Cafes & Coffee Shops' : 'Cafés & Coffee Shops'}
                </Link>
              </li>
              <li>
                <Link to="/solutions/snacks-fast-food" className="hover:text-orange-400 transition-colors">
                  {isEn ? 'Fast-Food & Snack Shops' : 'Snacks & Fast-Food'}
                </Link>
              </li>
              <li>
                <Link to="/solutions/boulangeries-patisseries" className="hover:text-orange-400 transition-colors">
                  {isEn ? 'Bakeries & Pastry Shops' : 'Boulangeries & Pâtisseries'}
                </Link>
              </li>
              <li>
                <Link to="/solutions/bars-a-jus-glaciers" className="hover:text-orange-400 transition-colors">
                  {isEn ? 'Juice Bars & Gelato' : 'Bars à Jus & Glaciers'}
                </Link>
              </li>
              <li>
                <Link to="/solutions/hotels-tourisme" className="hover:text-orange-400 transition-colors">
                  {isEn ? 'Hotels & Tourism' : 'Hôtels & Tourisme'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Product & Demo (3 cols) */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {isEn ? 'Platform & Demo' : 'Plateforme & Démo'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="/#demo" className="hover:text-orange-400 transition-colors font-semibold flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isEn ? 'Live Interactive Menu Demo' : 'Démo Menu Interactif'}
                </a>
              </li>
              <li>
                <a href="/#features" className="hover:text-orange-400 transition-colors">
                  {isEn ? 'All 9 Platform Features' : 'Les 9 Modules de la Plateforme'}
                </a>
              </li>
              <li>
                <a href="/#pricing" className="hover:text-orange-400 transition-colors">
                  {isEn ? 'Pricing in Moroccan Dirhams (MAD)' : 'Tarifs en Dirhams Marocains (MAD)'}
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-orange-400 transition-colors">
                  {isEn ? 'Frequently Asked Questions' : 'Questions Fréquentes (FAQ)'}
                </a>
              </li>
              <li>
                <Link to="/contact" className="hover:text-orange-400 transition-colors font-medium">
                  {isEn ? 'Morocco Support & Contact' : 'Support & Contact au Maroc'}
                </Link>
              </li>
              <li>
                <a
                  href={OFFICIAL_CONTACT.mailto}
                  className="hover:text-orange-400 transition-colors flex items-center gap-2 text-xs text-white/70"
                  aria-label={isEn ? `Email ${OFFICIAL_CONTACT.email}` : `Envoyer un email à ${OFFICIAL_CONTACT.email}`}
                >
                  <Mail className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>{OFFICIAL_CONTACT.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={OFFICIAL_CONTACT.phoneTel}
                  className="hover:text-orange-400 transition-colors flex items-center gap-2 text-xs text-white/70"
                  aria-label={isEn ? `Call ${OFFICIAL_CONTACT.phoneDisplay}` : `Appeler ${OFFICIAL_CONTACT.phoneDisplay}`}
                >
                  <Phone className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>{OFFICIAL_CONTACT.phoneDisplay}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Account / Onboarding (2 cols) */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {isEn ? 'Get Started' : 'Démarrer'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/onboarding" className="hover:text-orange-400 transition-colors font-bold text-orange-400 flex items-center gap-1">
                  <span>{isEn ? 'Zina Onboarding' : 'Assistant Zina'}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-orange-400 transition-colors font-bold text-white">
                  {isEn ? 'Create Account' : 'Créer un Compte'}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-orange-400 transition-colors">
                  {isEn ? 'Merchant Sign In' : 'Connexion Gérant'}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-orange-400 transition-colors text-white/70">
                  {isEn ? 'About Sofraflow' : 'À Propos'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Controls */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-white/60 gap-4">
          <p>© {new Date().getFullYear()} SOFRAFLOW Technologies. {isEn ? 'All rights reserved.' : 'Tous droits réservés.'} {isEn ? 'Crafted with' : 'Fait avec'} <Heart className="w-3.5 h-3.5 inline text-rose-500 fill-rose-500 mx-0.5" /> {isEn ? 'for Moroccan Hospitality.' : 'pour l’hospitalité marocaine.'}</p>
          
          <div className="flex items-center gap-4">
            <ThemeSwitcher compact={true} />
            <LanguageSelector variant="compact" />
            <span className="hidden sm:inline text-white/30">|</span>
            <span className="hidden sm:inline font-mono text-white/80">MAD (Dirhams)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
