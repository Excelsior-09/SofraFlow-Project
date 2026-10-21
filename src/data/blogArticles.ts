export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bulletPoints?: string[];
  callout?: string;
}

export interface BlogArticle {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  category: 'Guides & Pratique' | 'Cafés & Salons' | 'Boulangeries' | 'Technologie & WhatsApp' | 'Comparatifs';
  readTime: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishDate: string;
  coverImage: string;
  tags: string[];
  keyTakeaways: string[];
  sections: BlogSection[];
  relatedSlugs: string[];
  ctaText?: string;
  ctaLink?: string;
}

export const BLOG_ARTICLES: Record<string, BlogArticle> = {
  'creer-menu-digital-qr-code-maroc': {
    slug: 'creer-menu-digital-qr-code-maroc',
    title: 'Comment créer un menu digital QR code au Maroc en 2026 : Le guide complet',
    seoTitle: 'Créer un Menu Digital QR Code au Maroc en 2026 | Guide Complet SOFRAFLOW',
    seoDescription: 'Guide pratique pour restaurateurs et commerçants au Maroc : étapes pour créer un menu QR code sans commission, pérenne et compatible WhatsApp.',
    excerpt: 'Découvrez comment numériser votre carte en 10 minutes, choisir des supports QR durables et éviter les pièges des abonnements hors de prix.',
    category: 'Guides & Pratique',
    readTime: '6 min de lecture',
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    author: {
      name: 'Yassine Benkirane',
      role: 'Responsable Expérience Client & Produit',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    publishDate: '15 Octobre 2026',
    tags: ['Menu QR Code', 'Digitalisation Restaurant', 'Maroc', 'WhatsApp'],
    keyTakeaways: [
      'Un bon QR code de table doit être permanent et pointer vers une URL stable pour ne jamais nécessiter de réimpression.',
      'Au Maroc, la clientèle apprécie particulièrement la fluidité sans téléchargement d’application et l’affichage multilingue (Français/Arabe).',
      'Associer le numéro de table directement dans le lien QR évite les erreurs de commande lors du coup de feu.'
    ],
    sections: [
      {
        heading: '1. Pourquoi le menu QR code est devenu un standard au Maroc',
        paragraphs: [
          'De Casablanca à Marrakech, en passant par Tanger et Agadir, les habitudes des consommateurs ont profondément évolué. Le smartphone est omniprésent, et les clients apprécient de pouvoir consulter immédiatement la carte dès leur installation à table.',
          'Pour le restaurateur, l’avantage économique est immédiat : fini les réimpressions coûteuses à chaque fluctuation du prix des viandes ou des légumes sur le marché marocain. Un menu digital se met à jour en 30 secondes depuis un téléphone ou un ordinateur.'
        ],
        callout: 'Astuce : En moyenne, un restaurant marocain réimprime ses cartes 3 à 5 fois par an pour un coût annuel souvent supérieur à 4 000 MAD.'
      },
      {
        heading: '2. Les étapes pour créer votre menu digital en 10 minutes',
        paragraphs: [
          'La création d’un menu digital performant ne nécessite aucune compétence technique particulière. Avec SOFRAFLOW, voici le déroulé typique :'
        ],
        bulletPoints: [
          'Étape 1 : Créez vos catégories principales (Entrées, Tajines, Grillades, Desserts, Boissons).',
          'Étape 2 : Ajoutez vos produits avec des intitulés clairs, des prix nets en MAD (TVA comprise) et de belles photos en lumière naturelle.',
          'Étape 3 : Précisez les options indispensables (cuisson de la viande, garniture au choix, niveau de sucre pour le thé).',
          'Étape 4 : Générez vos QR codes individuels par table dans le format vectoriel pour une impression nette.'
        ]
      },
      {
        heading: '3. Choisir le bon support physique pour vos tables',
        paragraphs: [
          'Un QR code imprimé sur une simple feuille de papier s’abîme en quelques jours. Pour un rendu professionnel, privilégiez des chevalets en bois gravé, des plaques en plexiglas mat ou des stickers vinyles laminés résistants aux produits désinfectants.',
          'Veillez également à ce que le code soit suffisamment contrasté : un QR code sombre sur fond clair assure une lecture instantanée, même sous un éclairage tamisé en soirée.'
        ]
      },
      {
        heading: '4. Pourquoi connecter les commandes à WhatsApp ?',
        paragraphs: [
          'Au Maroc, WhatsApp est l’application de communication par excellence. Plutôt que d’investir dans des tablettes d’encaissement fragiles, recevoir les bons de commande sous forme de messages formatés sur le smartphone de service ou de cuisine garantit une adoption immédiate par l’équipe.'
        ]
      }
    ],
    relatedSlugs: ['menu-papier-vs-menu-qr-code-comparatif', 'workflow-whatsapp-commandes-restaurant-maroc'],
    ctaText: 'Créer mon menu digital gratuit',
    ctaLink: '/signup'
  },

  'menu-qr-code-cafes-coffee-shops-maroc': {
    slug: 'menu-qr-code-cafes-coffee-shops-maroc',
    title: 'Cafés & Coffee Shops au Maroc : Pourquoi le menu QR code transforme le service en terrasse',
    seoTitle: 'Menu QR Code pour Cafés et Coffee Shops au Maroc | SOFRAFLOW',
    seoDescription: 'Comment les cafés et salons de thé marocains réduisent l’attente en terrasse et augmentent leur ticket moyen grâce aux menus QR codes interactifs.',
    excerpt: 'Du café de spécialité aux formules brunch beldi : découvrez comment désengorger le comptoir et ravir votre clientèle en terrasse.',
    category: 'Cafés & Salons',
    readTime: '5 min de lecture',
    coverImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    author: {
      name: 'Kenza Tazi',
      role: 'Consultante Restauration & Expérience Client',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
    },
    publishDate: '18 Octobre 2026',
    tags: ['Cafés', 'Coffee Shop', 'Terrasse', 'Brunch'],
    keyTakeaways: [
      'Les terrasses des cafés marocains connaissent des pics d’affluence très marqués le matin et en fin d’après-midi.',
      'Un menu QR permet au client de choisir sa formule petit-déjeuner et ses suppléments sans attendre que le serveur vienne apporter la carte.',
      'Les photos soignées de pâtisseries fraîches augmentent les ventes impulsives de douceurs avec le café.'
    ],
    sections: [
      {
        heading: '1. Le défi de la gestion des terrasses à forte rotation',
        paragraphs: [
          'Dans les quartiers animés comme Guéliz à Marrakech, Maârif à Casablanca ou l’Agdal à Rabat, les terrasses de café se remplissent en quelques minutes à l’heure du café du matin ou du thé de fin d’après-midi.',
          'Le serveur passe souvent un temps précieux à apporter une carte physique, revenir prendre la commande, puis répéter les mêmes disponibilités de jus frais. Le menu QR code supprime cette friction initiale.'
        ]
      },
      {
        heading: '2. Valoriser les cafés de spécialité et les options',
        paragraphs: [
          'L’engouement pour le specialty coffee (espresso single origin, V60, flat white) et les laits végétaux (avoine, amande) s’accélère au Maroc. Sur une carte papier traditionnelle, il est difficile d’expliquer les profils aromatiques.',
          'Avec une carte digitale dynamique, vous pouvez détailler les origines, les notes de dégustation et ajouter des modificateurs de prix transparents (+5 MAD pour lait d’avoine, +8 MAD pour double shot).'
        ]
      },
      {
        heading: '3. Booster les ventes de pâtisseries du jour',
        paragraphs: [
          'Combien de fois un client commande-t-il simplement un « café noir » faute de savoir ce qui se trouve en vitrine ? En plaçant un QR code visuel sous ses yeux, avec des photos alléchantes de vos cheesecakes, croissants aux amandes ou pastillas au lait, vous multipliez les commandes associées.'
        ]
      }
    ],
    relatedSlugs: ['creer-menu-digital-qr-code-maroc', 'catalogue-digital-boulangeries-patisseries-maroc'],
    ctaText: 'Découvrir la solution pour Cafés',
    ctaLink: '/solutions/cafes'
  },

  'catalogue-digital-boulangeries-patisseries-maroc': {
    slug: 'catalogue-digital-boulangeries-patisseries-maroc',
    title: 'Boulangeries & Pâtisseries : Présenter ses créations artisanales sans réimprimer ses tarifs',
    seoTitle: 'Catalogue Digital pour Boulangeries et Pâtisseries au Maroc | SOFRAFLOW',
    seoDescription: 'Valorisez gâteaux d’anniversaire, cornes de gazelle et plateaux traiteur sur mobile. Guide de digitalisation pour boulangeries-pâtisseries marocaines.',
    excerpt: 'Comment moderniser la prise de commande de gâteaux événementiels et présenter ses tarifs au kilo sans coûts d’impression permanents.',
    category: 'Boulangeries',
    readTime: '5 min de lecture',
    coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    author: {
      name: 'Yassine Benkirane',
      role: 'Responsable Expérience Client & Produit',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    publishDate: '10 Octobre 2026',
    tags: ['Boulangerie', 'Pâtisserie', 'Catalogue Digital', 'Gâteaux'],
    keyTakeaways: [
      'Les prix des matières premières nobles (amandes, beurre, vanille) varient régulièrement au Maroc.',
      'Un catalogue digital permet d’ajuster les tarifs au kilo et les options de taille sans réimprimer des dépliants papier jetables.',
      'Le lien public du catalogue peut être partagé directement dans la bio Instagram ou sur WhatsApp Business.'
    ],
    sections: [
      {
        heading: '1. La vitrine physique a ses limites',
        paragraphs: [
          'Une boulangerie-pâtisserie artisanale réalise des merveilles : pièces montées de mariage, entremets personnalisés, plateaux de salés pour réceptions et boîtes cadeaux de pâtisseries marocaines traditionnelles.',
          'Pourtant, il est impossible d’exposer tous ces modèles dans une vitrine réfrigérée. Le catalogue digital offre une vitrine permanente accessible en magasin via un chevalet QR au comptoir, ou à distance via un simple lien.'
        ]
      },
      {
        heading: '2. Clarté des prix au kilo et par nombre de parts',
        paragraphs: [
          'L’une des interrogations récurrentes des clients concerne le calcul des parts et des tarifs au kilo. Sur SOFRAFLOW, chaque création peut détailler le nombre de convives recommandé (ex. 6-8 parts, 10-12 parts) et les parfums disponibles.'
        ]
      },
      {
        heading: '3. Moins de malentendus lors des commandes personnalisées',
        paragraphs: [
          'Prendre une commande de gâteau d’anniversaire par téléphone comporte des risques d’erreur sur le texte d’inscription ou le parfum. Grâce à la sélection en ligne et à la confirmation WhatsApp, le client et le chef pâtissier disposent d’une trace écrite limpide.'
        ]
      }
    ],
    relatedSlugs: ['menu-qr-code-cafes-coffee-shops-maroc', 'workflow-whatsapp-commandes-restaurant-maroc'],
    ctaText: 'Créer le catalogue de ma pâtisserie',
    ctaLink: '/solutions/boulangeries-patisseries'
  },

  'workflow-whatsapp-commandes-restaurant-maroc': {
    slug: 'workflow-whatsapp-commandes-restaurant-maroc',
    title: 'Commandes par WhatsApp au Maroc : Pourquoi ce workflow surpasse les terminaux matériels',
    seoTitle: 'Workflow WhatsApp pour Commandes de Restaurant au Maroc | SOFRAFLOW',
    seoDescription: 'Comment fonctionne la réception de commandes par WhatsApp Cloud API : avantages de rapidité, fiabilité réseau et zéro investissement matériel.',
    excerpt: 'Comprendre pourquoi l’association du menu QR code et de WhatsApp est la formule la plus fiable et économique pour les établissements marocains.',
    category: 'Technologie & WhatsApp',
    readTime: '6 min de lecture',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    author: {
      name: 'Kenza Tazi',
      role: 'Consultante Restauration & Expérience Client',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
    },
    publishDate: '05 Octobre 2026',
    tags: ['WhatsApp Business', 'Workflow', 'API Cloud', 'Cuisine'],
    keyTakeaways: [
      'WhatsApp ne nécessite aucune formation technique pour le personnel de salle et de cuisine.',
      'Les messages contiennent le numéro de table, la liste ordonnée des plats, options et heure exacte.',
      'En cas d’interruption réseau ponctuelle de WhatsApp, la base de données SOFRAFLOW reste la source de vérité.'
    ],
    sections: [
      {
        heading: '1. Les limites des systèmes de caisse traditionnels au Maroc',
        paragraphs: [
          'Installer des terminaux tactiles dédiés dans une cuisine de restaurant représente un coût d’acquisition élevé (souvent 15 000 à 30 000 MAD pour une installation complète), sans compter les pannes régulières dues à la chaleur ou aux vapeurs de cuisson.',
          'De plus, former le personnel saisonnier à des interfaces complexes est un frein majeur pour de nombreux gérants.'
        ]
      },
      {
        heading: '2. La simplicité universelle de WhatsApp',
        paragraphs: [
          'Chaque membre de votre équipe sait déjà utiliser WhatsApp sur son smartphone personnel ou sur le téléphone de service du restaurant. Lorsqu’une commande est validée sur la carte QR, un bon parfaitement structuré arrive instantanément avec une notification sonore familière.'
        ]
      },
      {
        heading: '3. Résilience et sécurité : La base de données en source de vérité',
        paragraphs: [
          'Une question fréquente concerne la fiabilité : que se passe-t-il si la connexion WhatsApp subit un ralentissement ?',
          'Chez SOFRAFLOW, la commande est d’abord sécurisée dans notre base de données. Le tableau de bord du gérant conserve l’historique complet, les totaux en MAD et le statut d’envoi. Vous ne perdez jamais la trace d’un client.'
        ]
      }
    ],
    relatedSlugs: ['creer-menu-digital-qr-code-maroc', 'menu-papier-vs-menu-qr-code-comparatif'],
    ctaText: 'Tester la notification WhatsApp',
    ctaLink: '/features'
  },

  'menu-papier-vs-menu-qr-code-comparatif': {
    slug: 'menu-papier-vs-menu-qr-code-comparatif',
    title: 'Menu papier vs Menu QR code digital : Comparatif économique, hygiénique et opérationnel',
    seoTitle: 'Menu Papier vs Menu Digital QR Code au Maroc : Comparatif 2026 | SOFRAFLOW',
    seoDescription: 'Analyse comparative détaillée : coûts d’impression, flexibilité, impact hygiénique et retour sur investissement pour les commerces au Maroc.',
    excerpt: 'Combien coûte réellement un menu papier sur une année complète comparé à une formule SaaS digitale ? Chiffres et analyse opérationnelle.',
    category: 'Comparatifs',
    readTime: '7 min de lecture',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    author: {
      name: 'Yassine Benkirane',
      role: 'Responsable Expérience Client & Produit',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    publishDate: '28 Septembre 2026',
    tags: ['Comparatif', 'Économie', 'Menu Papier', 'Rentabilité'],
    keyTakeaways: [
      'Le menu papier entraîne des coûts récurrents invisibles : réimpression, usure, plastification et temps perdu en salle.',
      'Le menu digital permet d’ajuster un plat en rupture ou un nouveau dessert instantanément sans coût marginal.',
      'L’investissement dans un menu QR code est rentabilisé dès le premier trimestre d’utilisation.'
    ],
    sections: [
      {
        heading: '1. Comparatif des coûts sur 12 mois',
        paragraphs: [
          'Pour un établissement moyen de 25 tables au Maroc :',
          'Menu papier : 30 classeurs ou protège-menus (150 MAD l’unité = 4 500 MAD) + 4 réimpressions de pages intérieures par an (4 x 800 MAD = 3 200 MAD). Coût total annuel estimé : 7 700 MAD.',
          'Menu digital SOFRAFLOW (Formule Starter à 290 MAD/mois) : Chevalets de table permanents réutilisables (env. 600 MAD une fois) + abonnement annuel. Vous gagnez en sérénité et disposez de mises à jour illimitées.'
        ]
      },
      {
        heading: '2. Flexibilité et réactivité face au marché',
        paragraphs: [
          'Lorsque le prix du bœuf, des crevettes ou de l’huile d’olive augmente, le restaurateur avec carte papier doit soit coller des étiquettes peu esthétiques sur ses menus, soit absorber la perte de marge.',
          'Avec le menu digital, vous ajustez vos prix en temps réel en préservant votre rentabilité.'
        ]
      },
      {
        heading: '3. L’atout du multilingue pour le tourisme',
        paragraphs: [
          'Imprimer une carte papier en 3 langues (Arabe, Français, Anglais) nécessite des livrets épais et encombrants. Sur mobile, le client choisit sa langue en un toucher d’écran, avec un texte soigné et lisible.'
        ]
      }
    ],
    relatedSlugs: ['creer-menu-digital-qr-code-maroc', 'workflow-whatsapp-commandes-restaurant-maroc'],
    ctaText: 'Démarrer l’essai gratuit SOFRAFLOW',
    ctaLink: '/signup'
  }
};
