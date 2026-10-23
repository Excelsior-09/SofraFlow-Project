/**
 * Official SOFRAFLOW Public Contact Configuration
 * Centralized single source of truth for public-facing contact information.
 */
export const OFFICIAL_CONTACT = {
  email: 'support@sofraflow.org',
  mailto: 'mailto:support@sofraflow.org',
  phone: '+212613905979',
  phoneTel: 'tel:+212613905979',
  phoneDisplay: '+212 6 13 90 59 79',
  whatsappNumber: '212613905979',
  whatsappUrl: 'https://wa.me/212613905979?text=Bonjour,%20je%20souhaite%20des%20renseignements%20sur%20SOFRAFLOW',
  cities: 'Casablanca & Marrakech',
  country: {
    en: 'Kingdom of Morocco',
    fr: 'Royaume du Maroc',
    ar: 'المملكة المغربية'
  },
  hours: {
    en: 'Monday - Sunday, 9am - 8pm',
    fr: 'Du lundi au dimanche, 9h - 20h',
    ar: 'من الإثنين إلى الأحد، 9:00 - 20:00'
  },
  responseNotice: {
    en: 'Response within 2 hours',
    fr: 'Réponse sous 2 heures',
    ar: 'الرد خلال ساعتين'
  }
} as const;

export type OfficialContactInfo = typeof OFFICIAL_CONTACT;
