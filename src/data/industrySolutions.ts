export interface IndustryBenefit {
  title: string;
  description: string;
  iconName: 'Zap' | 'QrCode' | 'MessageSquare' | 'Globe' | 'Sparkles' | 'Smartphone' | 'Clock' | 'ShieldCheck';
}

export interface SampleMenuItem {
  name: string;
  description: string;
  price: string;
  tag?: string;
  category: string;
}

export interface IndustryWorkflowStep {
  step: string;
  title: string;
  description: string;
}

export interface IndustryFAQ {
  q: string;
  a: string;
}

export interface IndustrySolution {
  slug: string;
  name: string;
  shortTitle: string;
  badge: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  targetAudience: string;
  primaryPainPoint: string;
  solutionOverview: string;
  benefits: IndustryBenefit[];
  sampleMenu: {
    businessName: string;
    businessType: string;
    tableOrLocation: string;
    categories: string[];
    items: SampleMenuItem[];
  };
  workflowSteps: IndustryWorkflowStep[];
  faqs: IndustryFAQ[];
  relatedSlugs: string[];
}

export const INDUSTRY_SOLUTIONS: Record<string, IndustrySolution> = {
  restaurants: {
    slug: 'restaurants',
    name: 'Restaurants & Riads',
    shortTitle: 'Restaurants',
    badge: 'Restauration & Gastronomie',
    metaTitle: 'Menu Digital QR Code pour Restaurants au Maroc | SOFRAFLOW',
    metaDescription: 'Modernisez votre restaurant ou riad au Maroc avec un menu QR multilingue (FR, AR, EN) et transmission de commandes par WhatsApp. Zéro commission.',
    heroTitle: 'Le menu digital pensé pour les restaurants et riads au Maroc',
    heroSubtitle: 'Présentez vos tajines, grillades et spécialités sur une carte mobile élégante. Vos clients consultent et commandent depuis leur table, et la cuisine reçoit le bon structuré sur WhatsApp.',
    targetAudience: 'Restaurants traditionnels, restaurants gastronomiques, riads, bistrots et tables d’hôtes au Maroc.',
    primaryPainPoint: 'Coûts de réimpression constants à chaque changement de tarif, cartes papier abîmées et serveurs surchargés aux heures de pointe.',
    solutionOverview: 'SOFRAFLOW offre un QR code permanent par table relié à votre carte dynamique. Mettez à jour vos prix en MAD et plats du jour instantanément sans réimprimer.',
    benefits: [
      {
        title: 'Rotation des tables accélérée',
        description: 'Les clients consultent immédiatement les plats et photos sans attendre le passage du serveur.',
        iconName: 'Zap'
      },
      {
        title: 'Bons de commande structurés sur WhatsApp',
        description: 'Dès validation par le client, la cuisine reçoit un message WhatsApp avec numéro de table, plats et options.',
        iconName: 'MessageSquare'
      },
      {
        title: 'Multilingue natif (FR / AR / EN)',
        description: 'Offrez un confort total aux habitués locaux et aux touristes avec un support parfait de la typographie arabe.',
        iconName: 'Globe'
      },
      {
        title: 'QR codes de table permanents',
        description: 'Imprimez vos chevalets une seule fois. Les modifications de prix ou d’ingrédients sont synchronisées en direct.',
        iconName: 'QrCode'
      }
    ],
    sampleMenu: {
      businessName: 'Le Jardin de Marrakech',
      businessType: 'Restaurant & Jardin Gourmand',
      tableOrLocation: 'Table 7 • Terrasse',
      categories: ['Entrées & Salades', 'Tajines & Plats', 'Desserts & Thés'],
      items: [
        {
          name: "Tajine d'Agneau aux Pruneaux",
          description: 'Agneau fondant mijoté aux épices de l’Atlas, pruneaux caramélisés, graines de sésame et amandes grillées.',
          price: '135 MAD',
          tag: 'Spécialité Maison',
          category: 'Tajines & Plats'
        },
        {
          name: 'Pastilla Traditionnelle au Poulet',
          description: 'Feuilleté croustillant au poulet fermier effiloché, amandes concassées, cannelle et fleur d’oranger.',
          price: '95 MAD',
          tag: 'Incontournable',
          category: 'Entrées & Salades'
        },
        {
          name: 'Thé à la Menthe Marocain & Pâtisseries',
          description: 'Thé vert gunpowder, menthe fraîche de l’Ourika et sélection de cornes de gazelle.',
          price: '35 MAD',
          category: 'Desserts & Thés'
        }
      ]
    },
    workflowSteps: [
      {
        step: '01',
        title: 'Configurez vos plats & menus',
        description: 'Saisissez vos catégories (entrées, tajines, grillades, desserts) avec photos et prix en MAD.'
      },
      {
        step: '02',
        title: 'Générez vos QR codes par table',
        description: 'Téléchargez les QR codes vectoriels pour Table 1, Table 2, ou Terrasse et imprimez vos supports.'
      },
      {
        step: '03',
        title: 'Les convives scannent et choisissent',
        description: 'Pas d’application à installer. Vos clients parcourent la carte dans leur langue préférée.'
      },
      {
        step: '04',
        title: 'Transmission directe en cuisine',
        description: 'Le chef ou responsable reçoit le bon de commande instantanément sur WhatsApp avec le numéro de table.'
      }
    ],
    faqs: [
      {
        q: 'Est-ce adapté aux riads et maisons d’hôtes ?',
        a: 'Absolument. Vous pouvez attribuer des QR codes pour chaque table de la cour intérieure, du patio ou de la terrasse rooftop.'
      },
      {
        q: 'Puis-je changer les prix des viandes ou du poisson du jour ?',
        a: 'Oui, en 10 secondes depuis votre tableau de bord. Le changement apparaît aussitôt pour les clients sans réimpression de QR code.'
      },
      {
        q: 'Prenez-vous une commission sur les commandes ?',
        a: 'Non, aucune commission. Vous conservez 100% du chiffre d’affaires de votre établissement.'
      }
    ],
    relatedSlugs: ['cafes', 'snacks-fast-food', 'hotels-tourisme']
  },

  cafes: {
    slug: 'cafes',
    name: 'Cafés & Coffee Shops',
    shortTitle: 'Cafés',
    badge: 'Cafés & Salons de thé',
    metaTitle: 'Menu Digital QR pour Cafés et Coffee Shops au Maroc | SOFRAFLOW',
    metaDescription: 'La solution de menu QR code fluide pour cafés, salons de thé et coffee shops au Maroc. Gestion des tailles de boissons, viennoiseries et commande rapide.',
    heroTitle: 'Le menu digital sur mesure pour cafés et coffee shops au Maroc',
    heroSubtitle: 'Gérez vos expressos, cafés de spécialité, thés, jus frais et formules petit-déjeuner. Vos clients en terrasse commandent en un éclair sans faire la queue au comptoir.',
    targetAudience: 'Cafés modernes, coffee shops de spécialité, salons de thé traditionnels et espaces de coworking avec espace café.',
    primaryPainPoint: 'Terrasses bondées aux heures de pointe, serveurs sollicités pour répéter les mêmes tarifs de boissons, cartes plastifiées collantes.',
    solutionOverview: 'Un menu QR mobile ultra-rapide avec catégories claires (chaud, froid, douceurs, brunch) et options de taille (simple, double, lait d’avoine).',
    benefits: [
      {
        title: 'Prise de commande rapide en terrasse',
        description: 'Permettez à vos clients installés dehors de consulter l’ensemble de vos boissons et pâtisseries du jour sans attendre.',
        iconName: 'Zap'
      },
      {
        title: 'Mise en avant des formules petit-déjeuner',
        description: 'Présentez vos formules Fassi, Beldi ou Continental avec composition détaillée et options d’œufs ou viennoiseries.',
        iconName: 'Sparkles'
      },
      {
        title: 'Notification barista instantanée',
        description: 'Les commandes de café arrivent directement sur le WhatsApp du barista ou s’affichent sur votre écran de comptoir.',
        iconName: 'MessageSquare'
      },
      {
        title: 'Mises à jour des douceurs en temps réel',
        description: 'Désactivez un gâteau ou une viennoiserie épuisée d’un simple clic pour éviter les déceptions clients.',
        iconName: 'Clock'
      }
    ],
    sampleMenu: {
      businessName: 'Café Atlas Artisan',
      businessType: 'Coffee Shop & Brunch',
      tableOrLocation: 'Terrasse • Table 12',
      categories: ['Cafés de Spécialité', 'Formules Petit-Déjeuner', 'Pâtisseries Fraîches'],
      items: [
        {
          name: 'Flat White Single Origin',
          description: 'Double espresso d’Éthiopie, micro-mousse de lait entier ou végétal, notes fruitées.',
          price: '32 MAD',
          tag: 'Coup de Cœur',
          category: 'Cafés de Spécialité'
        },
        {
          name: 'Formule Beldi Complète',
          description: 'Thé à la menthe, msemen au miel, harcha, amlou artisanal, huile d’olive et deux œufs au plat au cumin.',
          price: '48 MAD',
          tag: 'Populaire',
          category: 'Formules Petit-Déjeuner'
        },
        {
          name: 'Cheesecake Fleur d’Oranger',
          description: 'Crémeux sur biscuit croustillant sablé, coulis d’abricots de Marrakech.',
          price: '36 MAD',
          category: 'Pâtisseries Fraîches'
        }
      ]
    },
    workflowSteps: [
      {
        step: '01',
        title: 'Ajoutez boissons & pâtisseries',
        description: 'Listez vos cafés, thés, jus et gourmandises avec les suppléments (lait végétal, sirop).'
      },
      {
        step: '02',
        title: 'Posez les QR codes sur les tables',
        description: 'Disposés sur les tables de terrasse ou au comptoir sur des stickers ou chevalets durables.'
      },
      {
        step: '03',
        title: 'Scan instantané par le client',
        description: 'Affichage immédiat sur smartphone en moins de 1 seconde, sans aucune application.'
      },
      {
        step: '04',
        title: 'Préparation au bar',
        description: 'Le barista prépare la commande reçue par WhatsApp et sert la table correspondante.'
      }
    ],
    faqs: [
      {
        q: 'Puis-je gérer les suppléments de boisson (ex. sirop, lait végétal) ?',
        a: 'Oui, vous pouvez créer des modificateurs de prix comme le lait d’amande ou d’avoine, extra-shot d’espresso ou niveau de sucre.'
      },
      {
        q: 'Est-ce adapté pour les commandes à emporter ?',
        a: 'Oui. Vous pouvez afficher un QR code au comptoir pour les clients qui préfèrent emporter leur boisson sans attendre.'
      },
      {
        q: 'Faut-il du matériel spécial pour le barista ?',
        a: 'Non, un simple smartphone ou une tablette avec WhatsApp ou le tableau de bord SOFRAFLOW suffit amplement.'
      }
    ],
    relatedSlugs: ['restaurants', 'boulangeries-patisseries', 'snacks-fast-food']
  },

  'snacks-fast-food': {
    slug: 'snacks-fast-food',
    name: 'Snacks & Fast-Food',
    shortTitle: 'Snacks & Fast-Food',
    badge: 'Restauration Rapide',
    metaTitle: 'Menu Digital QR pour Snacks et Fast-Food au Maroc | SOFRAFLOW',
    metaDescription: 'Réduisez l’attente au comptoir de votre snack ou fast-food au Maroc. Menus burgers, tacos, sandwichs et boissons accessibles en QR code avec envoi WhatsApp.',
    heroTitle: 'Fluidifiez les commandes de votre snack ou fast-food',
    heroSubtitle: 'Éliminez les files d’attente interminables. Vos clients scannent le menu depuis la file ou leur table, composent leur sandwich ou tacos avec sauces et frites, et valident rapidement.',
    targetAudience: 'Snacks urbains, franchises de tacos, burger houses, shawarmas et comptoirs de restauration rapide.',
    primaryPainPoint: 'Files d’attente aux heures de pointe (midi et soir), erreurs de sauces et de cuisson lors des prises de commande orales bruyantes.',
    solutionOverview: 'Un menu digital direct et visuel avec choix clair des sauces, garnitures et boissons. Réception du bon structuré directement au grill ou en caisse.',
    benefits: [
      {
        title: 'Zéro erreur de sauces ou d’options',
        description: 'Chaque commande indique précisément les sauces (algérienne, samouraï, blanche), suppléments fromage et boissons.',
        iconName: 'ShieldCheck'
      },
      {
        title: 'Files d’attente diminuées au comptoir',
        description: 'Vos clients choisissent leur formule avant même d’arriver devant le caissier, accélérant la cadence.',
        iconName: 'Zap'
      },
      {
        title: 'Mise en avant des combos & menus complets',
        description: 'Incitez vos clients à ajouter frites et canette en proposant des formules menu avantageuses.',
        iconName: 'Sparkles'
      },
      {
        title: 'Parfait pour sur place et à emporter',
        description: 'Supporte le service sur place (numéro de table) et la commande à emporter avec nom du client.',
        iconName: 'Smartphone'
      }
    ],
    sampleMenu: {
      businessName: 'Snack Grill Casablanca',
      businessType: 'Street Food & Tacos Artisanaux',
      tableOrLocation: 'Comptoir & Emporter',
      categories: ['Burgers & Tacos', 'Formules Menus', 'Boissons Fraîches'],
      items: [
        {
          name: 'Double Smash Burger Cheddar',
          description: '2 steaks hachés pur bœuf écrasés à la plancha, double cheddar fondu, oignons caramélisés et sauce maison.',
          price: '58 MAD',
          tag: 'Best-Seller',
          category: 'Burgers & Tacos'
        },
        {
          name: 'Tacos Français 2 Viandes (Poulet & Kefta)',
          description: 'Sauce fromagère maison fondante, frites dorées à l’intérieur, sauce algérienne et barbecue.',
          price: '52 MAD',
          tag: 'Gourmand',
          category: 'Burgers & Tacos'
        },
        {
          name: 'Frites Maison & Boisson 33cl',
          description: 'Complément formule avec frites croustillantes et canette fraîche au choix.',
          price: '18 MAD',
          category: 'Formules Menus'
        }
      ]
    },
    workflowSteps: [
      {
        step: '01',
        title: 'Structurez vos sandwichs & sauces',
        description: 'Ajoutez viandes, sauces, suppléments fromage et boissons en quelques clics.'
      },
      {
        step: '02',
        title: 'Affichez le QR code en vitrine et au comptoir',
        description: 'Vos clients scannent dès leur arrivée dans le snack ou depuis les tables.'
      },
      {
        step: '03',
        title: 'Sélection des options sans stress',
        description: 'Le client choisit ses sauces et accompagnements calmement sur son téléphone.'
      },
      {
        step: '04',
        title: 'Préparation instantanée au grill',
        description: 'Le grillardin reçoit le récapitulatif clair sur WhatsApp ou tablette et lance la cuisson.'
      }
    ],
    faqs: [
      {
        q: 'Les clients peuvent-ils choisir plusieurs sauces ?',
        a: 'Oui, vous pouvez configurer des groupes d’options avec sélection unique ou multiple (ex. sauces au choix, cuisson).'
      },
      {
        q: 'Est-ce compatible avec les heures de pointe intenses ?',
        a: 'Oui, SOFRAFLOW est conçu pour être ultra-rapide et ne nécessite aucun chargement lourd, même sur des réseaux 4G encombrés.'
      },
      {
        q: 'Gérez-vous la livraison à domicile ?',
        a: 'SOFRAFLOW gère la commande sur place et à emporter avec notification WhatsApp. La livraison physique reste gérée par votre équipe ou vos livreurs.'
      }
    ],
    relatedSlugs: ['cafes', 'restaurants', 'bars-a-jus-glaciers']
  },

  'boulangeries-patisseries': {
    slug: 'boulangeries-patisseries',
    name: 'Boulangeries & Pâtisseries',
    shortTitle: 'Boulangeries',
    badge: 'Artisanat & Gourmandises',
    metaTitle: 'Catalogue Digital & Menus QR pour Boulangeries et Pâtisseries | SOFRAFLOW',
    metaDescription: 'Présentez vos gâteaux personnalisés, viennoiseries et pains artisanaux sur un catalogue QR code élégant au Maroc. Prix à jour et commandes simplifiées.',
    heroTitle: 'Votre vitrine gourmande accessible sur smartphone',
    heroSubtitle: 'Mettez en valeur vos pains artisanaux, gâteaux d’anniversaire, pièces montées et viennoiseries. Vos clients consultent vos créations, tarifs au kilo et passent commande facilement.',
    targetAudience: 'Boulangeries artisanales, pâtisseries fines marocaines et occidentales, salons de thé gourmands et traiteurs sucrés.',
    primaryPainPoint: 'Difficulté à présenter la variété des gâteaux sur mesure et des plateaux traiteur sur une simple étiquette de vitrine ; réimpression de dépliants coûteuse.',
    solutionOverview: 'Un catalogue digital visuel et soigné présentant vos gâteaux par taille (parts), parfums et tarifs, consultable par QR code en boutique ou partagé sur Instagram et WhatsApp.',
    benefits: [
      {
        title: 'Présentation haute qualité de vos créations',
        description: 'Affichez de magnifiques photos de vos entremets, gâteaux de mariage et boîtes de pâtisseries marocaines.',
        iconName: 'Sparkles'
      },
      {
        title: 'Tarifs et disponibilités toujours à jour',
        description: 'Ajustez facilement les prix selon les cours des matières premières (beurre, amandes) sans rien réimprimer.',
        iconName: 'Clock'
      },
      {
        title: 'Partage facile sur WhatsApp et réseaux sociaux',
        description: 'Votre lien de catalogue (sofraflow.com/m/votre-nom) peut être inséré dans votre bio Instagram et envoyé aux clients.',
        iconName: 'Globe'
      },
      {
        title: 'Prise de commande de gâteaux sans malentendu',
        description: 'Les clients sélectionnent la taille, l’inscription personnalisée et reçoivent confirmation via WhatsApp.',
        iconName: 'MessageSquare'
      }
    ],
    sampleMenu: {
      businessName: 'Pâtisserie Étoile de Rabat',
      businessType: 'Boulangerie Fine & Pâtisserie Traditionnelle',
      tableOrLocation: 'Boutique & Salon Gourmand',
      categories: ['Pâtisseries Marocaines', 'Gâteaux & Entremets', 'Pains Spéciaux'],
      items: [
        {
          name: 'Boîte Prestige Cornes de Gazelle & Feqqas (1 kg)',
          description: 'Pur amandes d’Essaouira, eau de fleur d’oranger distillée à Fès, pâte fine croustillante.',
          price: '220 MAD',
          tag: 'Fabrication Artisanale',
          category: 'Pâtisseries Marocaines'
        },
        {
          name: 'Entremet Chocolat Royal & Praliné Croustillant',
          description: 'Mousse chocolat noir 70%, biscuit dacquoise noisette, croustillant praliné feuillantine. (6-8 personnes)',
          price: '185 MAD',
          tag: 'Fêtes & Événements',
          category: 'Gâteaux & Entremets'
        },
        {
          name: 'Pain Complet au Levain Naturel & Graines',
          description: 'Farine complète moulue sur meule de pierre, fermentation lente 24h, graines de lin, sésame et tournesol.',
          price: '16 MAD',
          category: 'Pains Spéciaux'
        }
      ]
    },
    workflowSteps: [
      {
        step: '01',
        title: 'Organisez vos gammes de produits',
        description: 'Classez vos gâteaux, viennoiseries, pains et plateaux pour réceptions.'
      },
      {
        step: '02',
        title: 'Placez le QR code sur votre comptoir',
        description: 'Les clients en boutique scannent le code pour voir les créations de fête et commandes spéciales.'
      },
      {
        step: '03',
        title: 'Partagez le lien avec vos clients',
        description: 'Envoyez le lien de votre catalogue à vos clients qui souhaitent commander pour le week-end.'
      },
      {
        step: '04',
        title: 'Réception des demandes de commandes',
        description: 'Recevez les détails sur WhatsApp : date de retrait souhaitée, parfum et message personnalisé.'
      }
    ],
    faqs: [
      {
        q: 'Peut-on indiquer des délais de commande préalable (ex. 24h à l’avance) ?',
        a: 'Oui, vous pouvez ajouter cette mention dans la description du produit ou dans les instructions de votre boutique.'
      },
      {
        q: 'Gérez-vous les prix au kilo et à la pièce ?',
        a: 'Absolument. Vous pouvez préciser dans le titre ou les options si le prix s’applique à la pièce, à la part ou au kilo.'
      },
      {
        q: 'Le système gère-t-il les stocks en temps réel ?',
        a: 'SOFRAFLOW permet d’activer ou désactiver manuellement un produit en 1 clic. Il ne remplace pas un logiciel d’inventaire matière première.'
      }
    ],
    relatedSlugs: ['cafes', 'bars-a-jus-glaciers', 'restaurants']
  },

  'bars-a-jus-glaciers': {
    slug: 'bars-a-jus-glaciers',
    name: 'Bars à Jus & Glaciers',
    shortTitle: 'Jus & Glaciers',
    badge: 'Fraîcheur & Douceurs',
    metaTitle: 'Menu Digital QR pour Bars à Jus et Glaciers au Maroc | SOFRAFLOW',
    metaDescription: 'Présentez vos smoothies, jus détox, coupes glacées et crêpes sur un menu QR rafraîchissant au Maroc. Idéal pour terrasses estivales et front de mer.',
    heroTitle: 'La carte digitale fraîche et dynamique pour glaciers et bars à jus',
    heroSubtitle: 'Mettez en valeur vos cocktails de fruits frais, smoothies pressés à la minute, crêpes, gaufres et parfums de glaces artisanales. Idéal pour la saison estivale et les terrasses animées.',
    targetAudience: 'Bars à jus de fruits, glaciers artisanaux, crêperies gourmandes et buvettes de bord de mer au Maroc.',
    primaryPainPoint: 'Fréquents changements de fruits selon les saisons et arrivages du marché ; cartes abîmées par les éclaboussures et le soleil.',
    solutionOverview: 'Un menu QR code digital éclatant, résistant aux intempéries, avec mise à jour immédiate des parfums disponibles du jour.',
    benefits: [
      {
        title: 'Parfums de glace du jour mis à jour en 1 clic',
        description: 'Activez ou masquez les parfums disponibles (mangue, pistache de Sicile, amlou) selon vos bacs en vitrine.',
        iconName: 'Zap'
      },
      {
        title: 'Supports durables pour terrasse & plage',
        description: 'Les QR codes sur plexiglas ou stickers résistent au soleil, au vent et aux projections sans dégradation.',
        iconName: 'QrCode'
      },
      {
        title: 'Composition claire des smoothies & bowls',
        description: 'Détaillez les ingrédients bien-être (avocat, amandes, spiruline, graines de chia) pour séduire vos clients.',
        iconName: 'Sparkles'
      },
      {
        title: 'Commande rapide pour limiter l’attente au chaud',
        description: 'Vos clients parcourent la carte à leur rythme et évitent les longues minutes d’hésitation au comptoir.',
        iconName: 'Smartphone'
      }
    ],
    sampleMenu: {
      businessName: 'Oasis Fruits & Gelato',
      businessType: 'Bar à Jus Frais & Glaces Artisanales',
      tableOrLocation: 'Terrasse Ensoleillée • Table 4',
      categories: ['Jus Frais & Smoothies', 'Glaces & Coupes Gourmandes', 'Crêpes & Gaufres'],
      items: [
        {
          name: 'Smoothie Marrakech Détox',
          description: 'Oranges pressées, mangue fraîche, fraises de Larache, gingembre râpé et graines de chia.',
          price: '34 MAD',
          tag: 'Fraîcheur',
          category: 'Jus Frais & Smoothies'
        },
        {
          name: 'Coupe Artisanale 3 Boules & Chantilly Maison',
          description: 'Parfums au choix : Vanille Bourbon, Pistache Pure, Chocolat Belge, Amlou maison ou Sorbet Citron Basilic.',
          price: '42 MAD',
          tag: 'Gourmandise',
          category: 'Glaces & Coupes Gourmandes'
        },
        {
          name: 'Crêpe Croustillante Amlou & Banane',
          description: 'Crêpe tiède nappée d’amlou artisanal amandes-argan et rondelles de bananes fraîches.',
          price: '38 MAD',
          category: 'Crêpes & Gaufres'
        }
      ]
    },
    workflowSteps: [
      {
        step: '01',
        title: 'Ajoutez vos fruits & douceurs',
        description: 'Listez vos jus, cocktails sans alcool, coupes glacées et garnitures.'
      },
      {
        step: '02',
        title: 'Installez vos QR codes en terrasse',
        description: 'Sur les tables en front de mer, chaises longues ou au bar à jus.'
      },
      {
        step: '03',
        title: 'Consultation colorée et intuitive',
        description: 'Les clients découvrent les photos appétissantes des coupes et boissons.'
      },
      {
        step: '04',
        title: 'Préparation minute',
        description: 'Notification reçue au bar pour presser les fruits et dresser les glaces sans délai.'
      }
    ],
    faqs: [
      {
        q: 'Peut-on utiliser le système pour un commerce saisonnier ?',
        a: 'Oui, vous pouvez souscrire à un abonnement mensuel et l’adapter à votre période d’activité en haute saison.'
      },
      {
        q: 'Puis-je créer des options comme la taille du verre ou sans sucre ajouté ?',
        a: 'Oui, les modificateurs de choix permettent d’ajouter des précisions comme "Sans sucre ajouté", "Grand format 50cl", etc.'
      },
      {
        q: 'Les photos de produits sont-elles obligatoires ?',
        a: 'Non, mais elles sont fortement recommandées car elles augmentent le panier moyen de vos clients de manière notable.'
      }
    ],
    relatedSlugs: ['cafes', 'snacks-fast-food', 'boulangeries-patisseries']
  },

  'hotels-tourisme': {
    slug: 'hotels-tourisme',
    name: 'Hôtels & Établissements Touristiques',
    shortTitle: 'Hôtels & Tourisme',
    badge: 'Hôtellerie & Riads de Charme',
    metaTitle: 'Menu Digital Room Service & Bar d’Hôtel au Maroc | SOFRAFLOW',
    metaDescription: 'La solution de menu QR trilingue (FR, EN, AR) pour room service d’hôtels, bars de piscine et riads au Maroc. Expérience haut de gamme sans frais d’installation.',
    heroTitle: 'La carte digitale multilingue pour hôtels, riads et resorts',
    heroSubtitle: 'Offrez à vos clients internationaux une expérience room service et bar de piscine irréprochable. Présentez vos cartes en Français, Anglais et Arabe avec QR code placé en chambre ou sur transat.',
    targetAudience: 'Hôtels indépendants, riads de charme, resorts, résidences hôtelières et maisons d’hôtes au Maroc.',
    primaryPainPoint: 'Livrets de room service en chambre coûteux à imprimer et rapidement défraîchis, barrières de langue avec la clientèle internationale.',
    solutionOverview: 'Un menu QR digital élégant, disponible en chambre pour le room service ou sur les transats de la piscine, traduit en français, anglais et arabe.',
    benefits: [
      {
        title: 'Expérience trilingue fluide (FR / EN / AR)',
        description: 'Les voyageurs internationaux consultent vos mets dans leur langue maternelle en un clic.',
        iconName: 'Globe'
      },
      {
        title: 'QR codes dédiés par numéro de chambre',
        description: 'Les commandes room service indiquent automatiquement le numéro de chambre sans erreur de note.',
        iconName: 'QrCode'
      },
      {
        title: 'Idéal pour le bar de piscine et le spa',
        description: 'Permettez aux résidents de commander rafraîchissements et snacks légers directement depuis leur transat.',
        iconName: 'Smartphone'
      },
      {
        title: 'Zéro investissement en tablettes coûteuses',
        description: 'Vos résidents utilisent leur propre smartphone, garantissant une hygiène parfaite et un coût nul en matériel.',
        iconName: 'ShieldCheck'
      }
    ],
    sampleMenu: {
      businessName: 'Riad & Spa Palais de l’Atlas',
      businessType: 'Hôtel Boutique 5 Étoiles & Spa',
      tableOrLocation: 'Suite Impériale 204 • Room Service',
      categories: ['Room Service 24/7', 'Cocktails Signature', 'Snacks de Piscine'],
      items: [
        {
          name: 'Club Sandwich au Poulet Fermier & Avocat',
          description: 'Pain de mie toasté, blanc de poulet rôti au thym, avocat de l’Ourika, tomates confites, frites maison et salade verte.',
          price: '110 MAD',
          tag: 'Room Service',
          category: 'Room Service 24/7'
        },
        {
          name: 'Cocktail Signature « Soirée à Fès » (Sans alcool)',
          description: 'Jus de grenade fraîche, eau de fleur d’oranger, tonic méditerranéen et zeste de pamplemousse rose.',
          price: '55 MAD',
          tag: 'Signature',
          category: 'Cocktails Signature'
        },
        {
          name: 'Assiette Fraîcheur & Burrata aux Figues',
          description: 'Burrata crémeuse, figues rôties au miel de jujubier, roquette et vinaigre balsamique réduit.',
          price: '95 MAD',
          category: 'Snacks de Piscine'
        }
      ]
    },
    workflowSteps: [
      {
        step: '01',
        title: 'Configurez vos cartes chambre & piscine',
        description: 'Rédigez les descriptions de vos plats en français, anglais et arabe.'
      },
      {
        step: '02',
        title: 'Générez des QR codes par chambre',
        description: 'Imprimez des supports élégants avec "Chambre 101", "Chambre 102", "Piscine 5".'
      },
      {
        step: '03',
        title: 'Le résident scanne et choisit sa langue',
        description: 'Affichage instantané sans téléchargement d’application.'
      },
      {
        step: '04',
        title: 'Transmission au room service',
        description: 'La brigade de service reçoit le bon sur WhatsApp avec l’heure et le numéro de chambre exact.'
      }
    ],
    faqs: [
      {
        q: 'Comment s’assurer que le client est bien dans la chambre ?',
        a: 'Chaque QR code généré peut être encodé avec le numéro de chambre fixe (ex. Chambre 204), rendant le lien unique à cet espace.'
      },
      {
        q: 'Le système supporte-t-il les devises étrangères ?',
        a: 'L’affichage principal est en Dirhams marocains (MAD) avec mention de la TVA marocaine incluse, adapté à la réglementation locale.'
      },
      {
        q: 'Peut-on utiliser le même compte pour le restaurant et la piscine ?',
        a: 'Oui, vous pouvez créer plusieurs menus distincts (menu restaurant, carte piscine, room service) au sein du même établissement.'
      }
    ],
    relatedSlugs: ['restaurants', 'cafes', 'menus-de-services']
  },

  'menus-de-services': {
    slug: 'menus-de-services',
    name: 'Menus & Catalogues de Services',
    shortTitle: 'Salons & Services',
    badge: 'Beauté, Bien-être & Services',
    metaTitle: 'Catalogue Digital de Tarifs et Prestations au Maroc | SOFRAFLOW',
    metaDescription: 'Présentez vos prestations de coiffure, barbier, spa et soins sur un catalogue mobile QR code au Maroc. Tarifs clairs et demandes simplifiées par WhatsApp.',
    heroTitle: 'Votre carte de prestations et tarifs accessible par QR code',
    heroSubtitle: 'Spas, salons de coiffure, barbiers et studios de beauté au Maroc : présentez vos forfaits, rituels de soin et tarifs détaillés sur un catalogue mobile soigné. Vos clients consultent et vous contactent facilement.',
    targetAudience: 'Salons de coiffure, barbiers traditionnels et modernes, spas orientaux, hammams, ongleries et instituts de beauté.',
    primaryPainPoint: 'Clients qui hésitent sur les tarifs, brochures papier coûteuses à réimprimer lors d’un changement de gamme de produits, manque de visibilité sur les forfaits complets.',
    solutionOverview: 'Un catalogue de services sur smartphone accessible par QR code au miroir ou à l’accueil. Vos clients découvrent toutes vos prestations et vous contactent pour confirmation sur WhatsApp.',
    benefits: [
      {
        title: 'Transparence totale des tarifs et forfaits',
        description: 'Présentez clairement le prix de vos soins, durées recommandées et produits utilisés (argan, kératine, rhassoul).',
        iconName: 'ShieldCheck'
      },
      {
        title: 'QR codes au miroir ou sur le comptoir',
        description: 'Pendant qu’il attend ou s’installe au fauteuil, votre client découvre des soins complémentaires qu’il n’aurait pas osé demander.',
        iconName: 'QrCode'
      },
      {
        title: 'Contact direct pour confirmer la prestation',
        description: 'Le client sélectionne les services souhaités et transmet sa demande directement sur votre numéro WhatsApp.',
        iconName: 'MessageSquare'
      },
      {
        title: 'Mises à jour sans réimpression de brochures',
        description: 'Lancez un forfait de fête (Aïd, mariage) ou ajustez vos prix sans jeter des centaines de dépliants papier.',
        iconName: 'Sparkles'
      }
    ],
    sampleMenu: {
      businessName: 'L’Atelier Barbier & Soins',
      businessType: 'Barbershop & Spa Masculin',
      tableOrLocation: 'Fauteuil 3 • Carte des Soins',
      categories: ['Coupe & Barbe', 'Rituels Bien-Être', 'Produits de Soin'],
      items: [
        {
          name: 'Rituel Barbier Traditionnel au Coupe-Chou',
          description: 'Serviette chaude aux huiles essentielles d’eucalyptus, rasage traditionnel, soin hydratant et massage du cuir chevelu.',
          price: '80 MAD',
          tag: 'Soin Signature',
          category: 'Coupe & Barbe'
        },
        {
          name: 'Forfait Complet Coupe Dégradé Américain & Barbe',
          description: 'Coupe aux ciseaux et tondeuse, traçage des contours à la lame, huile à barbe nourrissante bio.',
          price: '110 MAD',
          tag: 'Populaire',
          category: 'Coupe & Barbe'
        },
        {
          name: 'Soin du Visage Purifiant à l’Argile Noire',
          description: 'Gommage doux, vapeur ionique, masque purifiant et crème revitalisante à l’huile d’argan.',
          price: '90 MAD',
          category: 'Rituels Bien-Être'
        }
      ]
    },
    workflowSteps: [
      {
        step: '01',
        title: 'Renseignez vos prestations & tarifs',
        description: 'Organisez vos soins par catégories avec durée indicative et tarifs en Dirhams.'
      },
      {
        step: '02',
        title: 'Placez les QR codes aux miroirs',
        description: 'Imprimez des stickers soignés à placer sur chaque poste de travail ou à l’accueil.'
      },
      {
        step: '03',
        title: 'Le client parcourt la carte des services',
        description: 'Découverte fluide sur mobile des forfaits et soins additionnels pendant sa présence.'
      },
      {
        step: '04',
        title: 'Demande et échange sur WhatsApp',
        description: 'Le client envoie son choix par WhatsApp pour caler un créneau ou ajouter une prestation sur place.'
      }
    ],
    faqs: [
      {
        q: 'SOFRAFLOW remplace-t-il un logiciel de prise de rendez-vous ?',
        a: 'Non, SOFRAFLOW est un catalogue digital et une carte de tarifs QR code. La confirmation de créneau et le paiement s’effectuent via WhatsApp ou directement sur place dans votre établissement.'
      },
      {
        q: 'Puis-je vendre des produits cosmétiques en vente à emporter ?',
        a: 'Oui, vous pouvez créer une catégorie "Produits & Soins à emporter" (huiles d’argan, cires, shampoings) avec leurs prix.'
      },
      {
        q: 'Le QR code fonctionne-t-il pour un hammam ou un spa ?',
        a: 'Absolument, les QR codes peuvent être affichés sur des chevalets à l’accueil ou dans les espaces de détente.'
      }
    ],
    relatedSlugs: ['hotels-tourisme', 'cafes', 'restaurants']
  }
};
