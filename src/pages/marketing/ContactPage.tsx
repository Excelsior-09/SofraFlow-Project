import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Clock, ShieldCheck, Sparkles, ArrowRight, Check } from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { SEO } from '../../components/common/SEO';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Alert } from '../../components/common/Alert';
import { useLanguage } from '../../context/LanguageContext';
import { analytics } from '../../services/analytics';

export const ContactPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    restaurant: '',
    type: 'restaurant',
    city: 'Casablanca',
    phone: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    analytics.trackPageView('contact', 'marketing');
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    analytics.track('contact_form_submitted', {
      city: formData.city,
      type: formData.type
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-ink-main selection:bg-[#e35d25] selection:text-white">
      <SEO
        title={isEn ? "Contact & WhatsApp Support in Morocco | SOFRAFLOW" : "Contact & Support WhatsApp au Maroc | SOFRAFLOW Menus Digitaux"}
        description={isEn ? "Have questions about creating your digital QR menu, WhatsApp API integration, or bespoke onboarding? Contact our dedicated team in Morocco." : "Une question sur la création de votre menu QR code, l’API WhatsApp ou un accompagnement personnalisé ? Contactez l'équipe SOFRAFLOW au Maroc."}
        canonical="/contact"
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
            <span>{isEn ? 'Morocco Local Support 7 Days a Week' : 'Support Local & Équipe Dédiée au Maroc'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-forest font-display tracking-tight leading-[1.15]">
            {isEn ? (
              <>We're here to help you <span className="text-[#e35d25]">modernize your service</span></>
            ) : (
              <>À votre écoute pour <span className="text-[#e35d25]">moderniser le service</span> de votre salle</>
            )}
          </h1>

          <p className="text-base text-ink-secondary max-w-xl mx-auto leading-relaxed">
            {isEn
              ? 'Have questions about WhatsApp Cloud API setup, menu import, or multi-venue management? Our Morocco-based technical team is available 7 days a week.'
              : 'Questions sur la configuration de l’API WhatsApp, l’importation de votre carte ou les franchises multi-adresses ? Notre équipe basée au Maroc est à votre disposition 7j/7.'}
          </p>
        </div>
      </section>

      {/* =========================================================
          2. CONTACT FORM & INFO SPLIT
      ========================================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Sidebar Info Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* WhatsApp Direct Card */}
              <div className="bg-[#0B132B] text-white rounded-3xl p-8 border border-gray-800 shadow-xl space-y-6 relative overflow-hidden">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-white">
                    {isEn ? 'Direct WhatsApp Hotline' : 'Assistance WhatsApp Directe'}
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {isEn
                      ? 'Our team answers immediately on WhatsApp for product demos, questions, and quick setup assistance.'
                      : 'Notre équipe vous répond immédiatement sur WhatsApp pour vos questions techniques, devis ou démonstration guidée.'}
                  </p>
                </div>

                <a
                  href="https://wa.me/212524381200?text=Bonjour,%20je%20souhaite%20des%20renseignements%20sur%20SOFRAFLOW"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isEn ? 'Chat with us on WhatsApp' : 'Ouvrir la discussion WhatsApp'}</span>
                </a>

                <div className="space-y-4 pt-4 border-t border-white/10 text-xs text-white/80">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#e35d25]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-bold text-white">+212 (0) 524 38 12 00</span>
                      <span className="text-[10px] text-white/50">{isEn ? 'Monday - Sunday, 9am - 8pm' : 'Du lundi au dimanche, 9h - 20h'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#e35d25]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-bold text-white">support@sofraflow.com</span>
                      <span className="text-[10px] text-white/50">{isEn ? 'Response within 2 hours' : 'Réponse sous 2 heures'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#e35d25]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-bold text-white">Casablanca &amp; Marrakech</span>
                      <span className="text-[10px] text-white/50">{isEn ? 'Kingdom of Morocco' : 'Royaume du Maroc'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-gray-200/90 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-forest font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>{isEn ? 'Guaranteed Peace of Mind' : 'Nos Engagements Qualité'}</span>
                </div>
                <ul className="space-y-2 text-xs text-ink-secondary">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isEn ? '100% data hosted securely' : 'Hébergement haute disponibilité sécurisé'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isEn ? '0% sales commissions forever' : '0% de commission sur vos ventes garanti'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isEn ? 'Official Meta WhatsApp Cloud API partner' : 'Intégration certifiée WhatsApp Cloud Meta'}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Contact Form (7 cols) */}
            <div className="lg:col-span-7 bg-[#FAF8F5] p-8 sm:p-10 rounded-3xl border border-gray-200/90 shadow-sm">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-2xl font-bold text-forest font-display">
                    {isEn ? 'Message received successfully!' : 'Message bien reçu !'}
                  </h3>
                  <p className="text-xs text-ink-secondary max-w-md mx-auto leading-relaxed">
                    {isEn
                      ? `Thank you ${formData.name}. Our consultant in ${formData.city} will reach out to you via WhatsApp at ${formData.phone || 'your phone number'} within 2 hours.`
                      : `Merci ${formData.name}. Notre conseiller à ${formData.city} vous contactera sur WhatsApp au ${formData.phone || 'votre numéro'} dans un délai de 2 heures.`}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-dark transition-colors"
                  >
                    {isEn ? 'Send another message' : 'Envoyer un autre message'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-gray-200/70 pb-4">
                    <h3 className="text-xl font-bold text-forest font-display">
                      {isEn ? 'Request a personalized demo or advice' : 'Demander une démonstration ou un conseil'}
                    </h3>
                    <p className="text-xs text-ink-secondary mt-1">
                      {isEn ? 'Fill out the form below and we will get back to you shortly.' : 'Renseignez les détails de votre établissement pour être contacté rapidement.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink-main mb-1.5">
                        {isEn ? 'Your Name *' : 'Votre Nom & Prénom *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={isEn ? 'Karim Bennani' : 'Karim Bennani'}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#e35d25]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-main mb-1.5">
                        {isEn ? 'Venue / Business Name *' : 'Nom de l’Établissement *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.restaurant}
                        onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                        placeholder={isEn ? 'Café Atlas / Riad Oasis' : 'Café Atlas / Riad Oasis'}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#e35d25]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink-main mb-1.5">
                        {isEn ? 'Business Type *' : 'Type d’Activité *'}
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#e35d25]"
                      >
                        <option value="restaurant">{isEn ? 'Restaurant & Riad' : 'Restaurant & Riad'}</option>
                        <option value="cafe">{isEn ? 'Café & Coffee Shop' : 'Café & Coffee Shop'}</option>
                        <option value="snack">{isEn ? 'Fast-Food & Snack' : 'Fast-Food & Snack'}</option>
                        <option value="bakery">{isEn ? 'Bakery & Pastry' : 'Boulangerie & Pâtisserie'}</option>
                        <option value="juice">{isEn ? 'Juice Bar & Gelato' : 'Bar à Jus & Glacier'}</option>
                        <option value="hotel">{isEn ? 'Hotel & Tourism' : 'Hôtel & Tourisme'}</option>
                        <option value="spa">{isEn ? 'Spa & Beauty Salon' : 'Salon & Spa'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-main mb-1.5">
                        {isEn ? 'City in Morocco *' : 'Ville au Maroc *'}
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#e35d25]"
                      >
                        <option value="Casablanca">Casablanca</option>
                        <option value="Marrakech">Marrakech</option>
                        <option value="Rabat">Rabat</option>
                        <option value="Tanger">Tanger</option>
                        <option value="Agadir">Agadir</option>
                        <option value="Fès">Fès</option>
                        <option value="Meknès">Meknès</option>
                        <option value="Oujda">Oujda</option>
                        <option value="Autre">{isEn ? 'Other city in Morocco' : 'Autre ville au Maroc'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink-main mb-1.5">
                        {isEn ? 'WhatsApp Phone *' : 'Téléphone WhatsApp *'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+212 6 XX XX XX XX"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#e35d25]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-main mb-1.5">
                        {isEn ? 'Email Address' : 'Adresse E-mail'}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@etablissement.ma"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#e35d25]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-main mb-1.5">
                      {isEn ? 'How can we help? (Optional)' : 'Votre demande ou vos questions (Optionnel)'}
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={isEn ? 'Tell us about your number of tables, menu items, or specific questions...' : 'Précisez votre nombre de tables, vos questions sur l’API WhatsApp ou l’impression thermique...'}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#e35d25]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[#e35d25] hover:bg-[#cf4f1a] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>{isEn ? 'Submit & Contact My Advisor' : 'Envoyer ma demande à un conseiller'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};
