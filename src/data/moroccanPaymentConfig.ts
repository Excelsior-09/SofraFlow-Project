/**
 * Moroccan Payment Methods Configuration for SOFRAFLOW Subscriptions
 * Contains exact, verified bank transfer and money transfer identifiers.
 */

export interface BankTransferConfig {
  bankName: string;
  shortName: string;
  titulaire?: string;
  rib: string;
  iban?: string;
  accountNumber?: string;
  swiftCode: string;
  qrCodeUrl: string;
  qrCodeLabel: string;
  accentColor: string;
  fullDetailsFormatted: string;
}

export interface MoneyTransferConfig {
  serviceId: 'cash_plus' | 'western_union' | 'moneygram' | 'ria';
  serviceName: string;
  beneficiaryName: string;
  phone: string;
  fullDetailsFormatted: string;
  instructions: {
    fr: string;
    en: string;
  };
}

export const CIH_BANK_CONFIG: BankTransferConfig = {
  bankName: 'CIH Bank',
  shortName: 'CIH Bank',
  titulaire: 'ANAS ZIRAOUI',
  rib: '230 480 3943173211009100 66',
  iban: 'MA64 2304 8039 4317 3211 0091 0066',
  swiftCode: 'CIHMMAMC',
  qrCodeUrl: '/payments/qr-cih-bank.jpg',
  qrCodeLabel: 'Scanner le QR code CIH',
  accentColor: '#E0311D', // CIH red-orange
  fullDetailsFormatted: `Titulaire : ANAS ZIRAOUI\nRIB : 230 480 3943173211009100 66\nIBAN : MA64 2304 8039 4317 3211 0091 0066\nCode SWIFT : CIHMMAMC`
};

export const ATTIJARIWAFA_BANK_CONFIG: BankTransferConfig = {
  bankName: 'Attijariwafa bank',
  shortName: 'Attijariwafa bank',
  rib: '007 491 0006498300402519 30',
  accountNumber: '000649H300402519',
  swiftCode: 'BCMAMAMC',
  qrCodeUrl: '/payments/qr-attijariwafa-bank.jpg',
  qrCodeLabel: 'Scanner le QR code Attijariwafa bank',
  accentColor: '#D38800', // Attijariwafa gold/yellow
  fullDetailsFormatted: `RIB : 007 491 0006498300402519 30\nNuméro de compte : 000649H300402519\nCode SWIFT : BCMAMAMC`
};

export const CASH_PLUS_CONFIG: MoneyTransferConfig = {
  serviceId: 'cash_plus',
  serviceName: 'Cash Plus',
  beneficiaryName: 'Ziraoui Anas',
  phone: '+212613905979',
  fullDetailsFormatted: `Nom du bénéficiaire : Ziraoui Anas\nTéléphone : +212613905979`,
  instructions: {
    fr: "Rendez-vous dans l'agence Cash Plus la plus proche ou utilisez l'application mobile Cash Plus. Effectuez le transfert national au nom de Ziraoui Anas (+212613905979). Conservez précieusement le reçu avec le code de transfert et renseignez-le ci-dessous pour validation.",
    en: "Visit your nearest Cash Plus branch or use the Cash Plus mobile app. Send the domestic transfer to Ziraoui Anas (+212613905979). Keep the transfer receipt and code, then submit it below for validation."
  }
};

export const WESTERN_UNION_CONFIG: MoneyTransferConfig = {
  serviceId: 'western_union',
  serviceName: 'Western Union',
  beneficiaryName: 'Ziraoui Anas',
  phone: '+212613905979',
  fullDetailsFormatted: `Nom du bénéficiaire : Ziraoui Anas\nTéléphone : +212613905979`,
  instructions: {
    fr: "Effectuez votre transfert via une agence Western Union agréée ou en ligne. Indiquez Ziraoui Anas comme bénéficiaire. Après validation de l'envoi, saisissez le numéro de contrôle MTCN à 10 chiffres et joignez une photo ou capture du reçu.",
    en: "Complete your transfer via an authorized Western Union branch or online. Specify Ziraoui Anas as the beneficiary. After sending, enter your 10-digit MTCN tracking number and attach your receipt photo."
  }
};

export const MONEYGRAM_CONFIG: MoneyTransferConfig = {
  serviceId: 'moneygram',
  serviceName: 'MoneyGram',
  beneficiaryName: 'Ziraoui Anas',
  phone: '+212613905979',
  fullDetailsFormatted: `Nom du bénéficiaire : Ziraoui Anas\nTéléphone : +212613905979`,
  instructions: {
    fr: "Effectuez votre transfert via une agence MoneyGram (ou réseau partenaire au Maroc : Al Barid Bank, Chaabi Cash, etc.) ou en ligne. Indiquez Ziraoui Anas (+212613905979) comme bénéficiaire. Renseignez votre numéro de référence à 8 chiffres et joignez votre reçu.",
    en: "Complete your transfer via a MoneyGram agency (or Moroccan partner: Al Barid Bank, Chaabi Cash, etc.) or online. Specify Ziraoui Anas (+212613905979) as beneficiary. Provide your 8-digit reference number and attach your receipt."
  }
};

export const RIA_CONFIG: MoneyTransferConfig = {
  serviceId: 'ria',
  serviceName: 'Ria Money Transfer',
  beneficiaryName: 'Ziraoui Anas',
  phone: '+212613905979',
  fullDetailsFormatted: `Nom du bénéficiaire : Ziraoui Anas\nTéléphone : +212613905979`,
  instructions: {
    fr: "Effectuez votre transfert via une agence Ria ou réseau agréé au Maroc (ex : BMCE Bank of Africa, Dirham Express, Cash Plus partenaire) ou via l'application mobile Ria. Indiquez Ziraoui Anas (+212613905979) comme bénéficiaire et saisissez votre numéro d'ordre PIN.",
    en: "Complete your transfer at a Ria agency or Moroccan authorized network (e.g. BMCE Bank of Africa, Dirham Express, Cash Plus partner) or via the Ria mobile app. Enter Ziraoui Anas (+212613905979) as recipient and submit your PIN/order number."
  }
};

export const SUBSCRIPTION_PLAN_PRICING = {
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 290,
    annualPrice: Math.round(290 * 0.85 * 12), // 2958 MAD/an
    desc: 'Cafés indépendants, snacks et petits établissements',
    features: [
      '1 Établissement & 15 tables QR',
      'Menus digitaux bilingues',
      'Mise à jour instantanée des prix',
      'Sans commission sur vos ventes'
    ]
  },
  growth: {
    id: 'growth',
    name: 'Croissance',
    monthlyPrice: 590,
    annualPrice: Math.round(590 * 0.85 * 12), // 6018 MAD/an
    popular: true,
    desc: 'Restaurants avec service à table, bars et salons de thé',
    features: [
      'Tables et menus illimités',
      'Commandes WhatsApp directes en cuisine',
      'Zina AI Concierge & Recommandations',
      'Statistiques des ventes & panier moyen en MAD',
      'Support prioritaire 7j/7'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Multi-Établissements / Pro',
    monthlyPrice: 990,
    annualPrice: Math.round(990 * 0.85 * 12), // 10098 MAD/an
    desc: 'Chaînes, enseignes multi-sites, riads et groupes hôteliers',
    features: [
      'Multi-enseignes & accès collaborateurs',
      'Écrans KDS Cuisine & Impression thermique 80mm',
      'Multi-destinations WhatsApp (Bar + Cuisine)',
      'Accompagnateur d’intégration dédié'
    ]
  }
} as const;
