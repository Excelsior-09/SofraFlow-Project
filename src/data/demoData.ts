import { DemoDish } from '../types';

export interface DemoRestaurantInfo {
  name: string;
  tagline: { en: string; fr: string };
  city: string;
  country: string;
  address: string;
  currency: string;
  taxRatePercent: number;
  phone: string;
  logoUrl: string;
  coverImageUrl: string;
}

export const DEMO_RESTAURANT: DemoRestaurantInfo = {
  name: 'Café & Bistro Atlas',
  tagline: {
    en: 'Artisan Moroccan Coffee, Fresh Tagines & Bistro Fare',
    fr: 'Café de Spécialité, Tagines Savoureux & Cuisine Bistro'
  },
  city: 'Casablanca',
  country: 'Morocco',
  address: '14 Boulevard d’Anfa, Casablanca',
  currency: 'MAD',
  taxRatePercent: 10,
  phone: '+212 522 99 88 77',
  logoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80',
  coverImageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80'
};

export const DEMO_DISHES: DemoDish[] = [
  {
    id: 'dish_tagine_agneau',
    name: {
      en: 'Slow-Cooked Lamb Tagine with Prunes',
      fr: 'Tajine d’Agneau aux Pruneaux & Amandes'
    },
    category: 'mains',
    description: {
      en: 'Tender Atlas lamb braised with sweet spices, caramelized prunes, golden almonds, and sesame.',
      fr: 'Agneau fondant mijoté aux épices douces, pruneaux caramélisés, amandes dorées et sésame.'
    },
    price: 95,
    currency: 'MAD',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    popular: true,
    dietary: 'chef_special',
    pairings: ['dish_the_menthe', 'dish_zaalouk']
  },
  {
    id: 'dish_burger_atlas',
    name: {
      en: 'Atlas Gourmet Smash Burger',
      fr: 'Smash Burger Gourmet de l’Atlas'
    },
    category: 'mains',
    description: {
      en: 'Double 100% halal beef patty, smoked gouda, caramelized shallots, harissa mayo on brioche.',
      fr: 'Double steak haché 100% bœuf halal, gouda fumé, échalotes confites, mayonnaise harissa sur pain brioché.'
    },
    price: 78,
    currency: 'MAD',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    popular: true,
    dietary: 'halal',
    pairings: ['dish_lemonade_menthe', 'dish_frites_maison']
  },
  {
    id: 'dish_avocado_toast',
    name: {
      en: 'Sourdough Avocado & Poached Egg',
      fr: 'Toast Avocat & Œuf Poché au Levain'
    },
    category: 'brunch',
    description: {
      en: 'Artisan sourdough, whipped Haas avocado, organic poached egg, pomegranate molasses, dukkah.',
      fr: 'Pain au levain artisanal, avocat écrasé, œuf poché fermier, mélasse de grenade et dukkah croquant.'
    },
    price: 58,
    currency: 'MAD',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
    popular: false,
    dietary: 'vegetarian',
    pairings: ['dish_saffron_latte']
  },
  {
    id: 'dish_the_menthe',
    name: {
      en: 'Traditional Moroccan Mint Tea',
      fr: 'Thé à la Menthe Fraîche Traditionnel'
    },
    category: 'drinks',
    description: {
      en: 'Royal gunpowder green tea, freshly plucked organic spearmint, light cane sugar, pine nuts.',
      fr: 'Thé vert gunpowder, menthe fraîche cueillie du jour, sucre de canne léger et pignons de pin.'
    },
    price: 22,
    currency: 'MAD',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    popular: true,
    dietary: 'vegetarian',
    pairings: ['dish_cornes_gazelle']
  },
  {
    id: 'dish_saffron_latte',
    name: {
      en: 'Taliouine Saffron & Honey Latte',
      fr: 'Latte au Safran de Taliouine & Miel Pur'
    },
    category: 'drinks',
    description: {
      en: 'Velvety espresso, organic milk, real Taliouine saffron threads, and wild cedar honey.',
      fr: 'Double espresso soyeux, lait entier texturé, pistils de safran pur de Taliouine et miel de cèdre.'
    },
    price: 36,
    currency: 'MAD',
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80',
    popular: true,
    dietary: 'vegetarian',
    pairings: ['dish_avocado_toast', 'dish_cornes_gazelle']
  },
  {
    id: 'dish_lemonade_menthe',
    name: {
      en: 'Fresh Mint & Agadir Lemon Cooler',
      fr: 'Citronnade Fraîche d’Agadir à la Menthe'
    },
    category: 'drinks',
    description: {
      en: 'Freshly pressed sun-ripened Moroccan lemons, crushed mint leaves, and blossom water.',
      fr: 'Citrons d’Agadir pressés minute, feuilles de menthe pilées et pointe d’eau de fleur d’oranger.'
    },
    price: 28,
    currency: 'MAD',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    popular: false,
    dietary: 'vegetarian',
    pairings: ['dish_burger_atlas']
  },
  {
    id: 'dish_cornes_gazelle',
    name: {
      en: 'Handmade Almond Gazelle Horns (Pair)',
      fr: 'Cornes de Gazelle Artisanales aux Amandes'
    },
    category: 'desserts',
    description: {
      en: 'Traditional Moroccan pastries filled with ground almond paste and orange blossom essence.',
      fr: 'Pâtisserie fine traditionnelle marocaine farcie de pure pâte d’amandes et fleur d’oranger.'
    },
    price: 32,
    currency: 'MAD',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    popular: true,
    dietary: 'vegetarian',
    pairings: ['dish_the_menthe']
  },
  {
    id: 'dish_zaalouk',
    name: {
      en: 'Smoked Eggplant Zaalouk with Warm Bread',
      fr: 'Zaalouk d’Aubergines Fumées & Pain Chaud'
    },
    category: 'brunch',
    description: {
      en: 'Roasted eggplant cooked down with ripe tomatoes, garlic, cumin, virgin olive oil, and fresh pita.',
      fr: 'Caviar d’aubergines grillées au feu de bois, tomates mûres, ail doux, cumin et huile d’olive vierge.'
    },
    price: 38,
    currency: 'MAD',
    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80',
    popular: false,
    dietary: 'vegetarian',
    pairings: ['dish_tagine_agneau']
  },
  {
    id: 'dish_frites_maison',
    name: {
      en: 'Crispy Truffle & Paprika Hand-Cut Fries',
      fr: 'Frites Fraîches Maison au Paprika Fumé'
    },
    category: 'brunch',
    description: {
      en: 'Double-fried Agadir potatoes tossed in smoked sweet paprika and sea salt, garlic dipping sauce.',
      fr: 'Pommes de terre d’Agadir taillées main, double cuisson, sel de mer, paprika fumé et sauce aïoli maison.'
    },
    price: 24,
    currency: 'MAD',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
    popular: false,
    dietary: 'vegetarian',
    pairings: ['dish_burger_atlas']
  }
];

export const DEMO_CATEGORIES = [
  { id: 'all', label: { en: 'All Items', fr: 'Tous les Plats' } },
  { id: 'mains', label: { en: 'Plats & Burgers', fr: 'Plats & Burgers' } },
  { id: 'drinks', label: { en: 'Drinks & Coffee', fr: 'Boissons & Cafés' } },
  { id: 'brunch', label: { en: 'Sides & Brunch', fr: 'Sides & Brunch' } },
  { id: 'desserts', label: { en: 'Pâtisserie & Treats', fr: 'Pâtisserie & Desserts' } }
];

export const AI_CUSTOMER_PROMPTS = [
  {
    id: 'budget_80',
    prompt: {
      en: 'What can I get for under 80 MAD?',
      fr: 'Que puis-je commander pour moins de 80 MAD ?'
    },
    response: {
      en: 'For under 80 MAD, you have excellent options! You could enjoy our Atlas Gourmet Smash Burger (78 MAD), or combine a Sourdough Avocado Toast (58 MAD) with Traditional Moroccan Mint Tea (22 MAD) for exactly 80 MAD. Both are crowd favorites!',
      fr: 'Pour moins de 80 MAD, vous avez d’excellents choix ! Vous pouvez déguster notre Smash Burger Gourmet de l’Atlas (78 MAD), ou bien combiner le Toast Avocat au Levain (58 MAD) avec un Thé à la Menthe Fraîche (22 MAD) pour exactement 80 MAD. Deux incontournables !'
    },
    recommendedIds: ['dish_burger_atlas', 'dish_avocado_toast', 'dish_the_menthe']
  },
  {
    id: 'burger_pair',
    prompt: {
      en: 'I’m ordering a burger. What goes well with it?',
      fr: 'Je commande un burger. Que me conseillez-vous avec ?'
    },
    response: {
      en: 'Great choice! Our Atlas Gourmet Smash Burger pairs perfectly with our Crispy Hand-Cut Fries (24 MAD) and a refreshing Mint & Agadir Lemon Cooler (28 MAD). It’s our guests’ most frequently ordered combination!',
      fr: 'Excellent choix ! Notre Smash Burger Gourmet de l’Atlas se marie à la perfection avec nos Frites Fraîches Maison (24 MAD) et notre Citronnade Fraîche d’Agadir à la Menthe (28 MAD). C’est la formule favorite de nos habitués !'
    },
    recommendedIds: ['dish_frites_maison', 'dish_lemonade_menthe']
  },
  {
    id: 'vegetarian',
    prompt: {
      en: 'Do you have vegetarian recommendations?',
      fr: 'Avez-vous des recommandations végétariennes ?'
    },
    response: {
      en: 'Absolutely! Our Sourdough Avocado & Poached Egg (58 MAD) and our Smoked Eggplant Zaalouk with warm pita (38 MAD) are both 100% vegetarian, deeply flavorful, and freshly prepared today.',
      fr: 'Absolument ! Notre Toast Avocat & Œuf Poché (58 MAD) ainsi que notre Zaalouk d’Aubergines Fumées au feu de bois (38 MAD) sont 100% végétariens, riches en saveurs et préparés le matin même.'
    },
    recommendedIds: ['dish_avocado_toast', 'dish_zaalouk']
  },
  {
    id: 'sweet_finish',
    prompt: {
      en: 'What dessert do you recommend for coffee time?',
      fr: 'Quel dessert recommandez-vous pour l’heure du café ?'
    },
    response: {
      en: 'For a refined afternoon break, our Handmade Almond Gazelle Horns (32 MAD) paired with a Taliouine Saffron & Honey Latte (36 MAD) create a sublime balance of orange blossom and aromatic saffron.',
      fr: 'Pour une pause gourmande et raffinée, nos Cornes de Gazelle Artisanales aux Amandes (32 MAD) accompagnées d’un Latte au Safran de Taliouine (36 MAD) offrent un équilibre sublime de fleur d’oranger et de miel pur.'
    },
    recommendedIds: ['dish_cornes_gazelle', 'dish_saffron_latte']
  }
];

export const AI_FINANCIAL_PROMPTS = [
  {
    id: 'margins',
    question: {
      en: 'Which products should I review if I want to improve my margins?',
      fr: 'Quels produits devrais-je examiner pour optimiser mes marges ?'
    },
    insight: {
      en: 'Focus on high-volume beverage pairings. In Moroccan hospitality, specialty tea and coffee drinks (like our Mint Tea and Saffron Latte) generally carry lower raw ingredient costs relative to price, offering stronger gross margin contributions compared to meat-heavy dishes.',
      fr: 'Concentrez-vous sur les boissons d’accompagnement à fort volume. Au Maroc, les thés et cafés de spécialité présentent un coût matière réduit par rapport au prix de vente, générant une contribution de marge brute supérieure aux plats carnés.'
    },
    actionableStep: {
      en: 'Introduce smart pairing prompts on checkout (e.g. suggesting tea with pastries).',
      fr: 'Activez les suggestions automatiques de boissons au moment du panier (ex. thé avec pâtisseries).'
    }
  },
  {
    id: 'pricing_strategy',
    question: {
      en: 'How does item customization affect my average order value?',
      fr: 'Comment les suppléments et options impactent-ils mon panier moyen ?'
    },
    insight: {
      en: 'Allowing customers to choose extra cheese (+8 MAD), double patties (+20 MAD), or specialty sauces directly in the digital menu typically increases average ticket size by 14% to 18% without friction.',
      fr: 'Permettre aux clients de choisir un supplément fromage (+8 MAD), double steak (+20 MAD) ou sauce maison augmente naturellement la valeur du panier de 14% à 18% sans aucune insistance commerciale.'
    },
    actionableStep: {
      en: 'Ensure top 5 dishes have at least two relevant customization options.',
      fr: 'Assurez-vous que vos 5 meilleurs plats proposent au moins deux options d’extra.'
    }
  }
];

export const DEMO_ANALYTICS_DATA = {
  summary: {
    revenue: 46250,
    ordersCount: 384,
    aov: 120.4,
    upsellConversionRate: '22.8%'
  },
  dailyRevenue: [
    { day: 'Lun', dayEn: 'Mon', revenue: 5800, orders: 48 },
    { day: 'Mar', dayEn: 'Tue', revenue: 6400, orders: 52 },
    { day: 'Mer', dayEn: 'Wed', revenue: 5900, orders: 50 },
    { day: 'Jeu', dayEn: 'Thu', revenue: 7100, orders: 58 },
    { day: 'Ven', dayEn: 'Fri', revenue: 8650, orders: 72 },
    { day: 'Sam', dayEn: 'Sat', revenue: 9400, orders: 81 },
    { day: 'Dim', dayEn: 'Sun', revenue: 8000, orders: 67 }
  ],
  categoryBreakdown: [
    { name: 'Plats & Burgers', nameEn: 'Mains & Burgers', value: 46, color: '#0F2C59' },
    { name: 'Boissons & Cafés', nameEn: 'Drinks & Coffee', value: 28, color: '#EA580C' },
    { name: 'Brunch & Sides', nameEn: 'Brunch & Sides', value: 16, color: '#D97706' },
    { name: 'Pâtisserie', nameEn: 'Pastries', value: 10, color: '#16A34A' }
  ],
  topDishes: [
    { name: 'Smash Burger Gourmet de l’Atlas', nameEn: 'Atlas Gourmet Smash Burger', orders: 142, revenue: '11,076 MAD' },
    { name: 'Tajine d’Agneau aux Pruneaux', nameEn: 'Lamb Tagine with Prunes', orders: 98, revenue: '9,310 MAD' },
    { name: 'Toast Avocat & Œuf Poché', nameEn: 'Sourdough Avocado Toast', orders: 74, revenue: '4,292 MAD' },
    { name: 'Thé à la Menthe Fraîche', nameEn: 'Moroccan Mint Tea', orders: 186, revenue: '4,092 MAD' }
  ]
};
