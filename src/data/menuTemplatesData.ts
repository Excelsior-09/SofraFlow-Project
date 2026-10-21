import { FoodLanguageCode } from '../types';

export interface TemplateDishItem {
  name: { en: string; fr: string; ar?: string };
  description: { en: string; fr: string };
  price: number;
  imageUrl?: string;
  isPopular?: boolean;
  dietary?: 'halal' | 'vegetarian' | 'chef_special' | 'spicy';
  flaggedForReview?: boolean;
  reviewReason?: string;
}

export interface TemplateCategory {
  name: { en: string; fr: string; ar?: string };
  items: TemplateDishItem[];
}

export interface MenuTemplateDefinition {
  id: string;
  name: { en: string; fr: string };
  tagline: { en: string; fr: string };
  description: { en: string; fr: string };
  intendedFor: { en: string; fr: string };
  badge: { en: string; fr: string };
  primaryColor: string;
  accentColor: string;
  previewHeroImage: string;
  categories: TemplateCategory[];
}

export const MENU_TEMPLATES: MenuTemplateDefinition[] = [
  {
    id: 'template_modern_restaurant',
    name: {
      en: 'Modern Restaurant',
      fr: 'Restaurant Contemporain'
    },
    tagline: {
      en: 'Spacious cards, refined typography & vibrant photography',
      fr: 'Cartes aérées, typographie soignée et visuels haute définition'
    },
    description: {
      en: 'Clean typography, spacious product cards, and premium food photography. Suitable for casual dining, contemporary bistros, and urban grill houses.',
      fr: 'Typographie moderne, fiches produits spacieuses et visuels gastronomiques soignés. Idéal pour bistrots contemporains et cuisine créative.'
    },
    intendedFor: {
      en: 'Casual Dining, Modern Bistros, Urban Eateries',
      fr: 'Bistrots Contemporains, Brasseries, Restauration Évoluée'
    },
    badge: {
      en: 'Versatile & Modern',
      fr: 'Polyvalent & Moderne'
    },
    primaryColor: '#0F2C59',
    accentColor: '#EA580C',
    previewHeroImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Starters & Sharing', fr: 'Entrées & Partage', ar: 'المقبلات' },
        items: [
          {
            name: { en: 'Creamy Burrata with Candied Tomatoes', fr: 'Burrata Crémeuse aux Tomates Confites' },
            description: { en: 'Artisan burrata, pesto genovese, balsamic reduction, warm focaccia.', fr: 'Burrata crémeuse, pesto de basilic frais, tomates confites au four et focaccia.' },
            price: 68,
            imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=400&auto=format&fit=crop&q=80',
            dietary: 'vegetarian'
          },
          {
            name: { en: 'Black Angus Beef Truffle Carpaccio', fr: 'Carpaccio de Bœuf Black Angus Truffé' },
            description: { en: 'Thinly sliced beef, parmesan flakes, white truffle oil, baby wild arugula.', fr: 'Fines lamelles de bœuf, copeaux de parmesan affiné, huile de truffe blanche et roquette.' },
            price: 75,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          }
        ]
      },
      {
        name: { en: 'Signature Main Courses', fr: 'Plats Signatures', ar: 'الأطباق الرئيسية' },
        items: [
          {
            name: { en: 'Grilled Ribeye with Peppercorn Sauce', fr: 'Entrecôte Grillée Sauce Poivre Noir' },
            description: { en: 'Prime 280g cut, garlic herb butter, hand-cut crispy fries, seasonal greens.', fr: 'Pièce noble de 280g, beurre maître d’hôtel, frites fraîches et légumes de saison.' },
            price: 145,
            imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&auto=format&fit=crop&q=80',
            dietary: 'halal',
            isPopular: true
          },
          {
            name: { en: 'Pan-Seared Salmon Fillet', fr: 'Pavé de Saumon Rôti & Légumes Croquants' },
            description: { en: 'Norwegian salmon, lemon dill emulsion, wild rice pilaf, charred asparagus.', fr: 'Saumon poêlé, émulsion aneth et citron, riz sauvage et asperges braisées.' },
            price: 130,
            imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&auto=format&fit=crop&q=80',
            dietary: 'chef_special'
          },
          {
            name: { en: 'Wild Mushroom Creamy Risotto', fr: 'Risotto Crémeux aux Champignons Sauvages' },
            description: { en: 'Arborio rice, porcini & morels, aged parmigiano reggiano, fresh thyme.', fr: 'Riz arborio crémeux, cèpes et morilles poêlées, parmesan 24 mois et thym frais.' },
            price: 95,
            imageUrl: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=400&auto=format&fit=crop&q=80',
            dietary: 'vegetarian'
          }
        ]
      },
      {
        name: { en: 'Handcrafted Desserts', fr: 'Desserts Maison', ar: 'الحلويات' },
        items: [
          {
            name: { en: 'Warm Valrhona Chocolate Lava Cake', fr: 'Fondant Coulant au Chocolat Valrhona' },
            description: { en: 'Molten dark chocolate cake, Madagascar vanilla bean gelato, cocoa crumble.', fr: 'Cœur coulant chocolat noir, glace artisanale à la vanille de Madagascar.' },
            price: 48,
            imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&auto=format&fit=crop&q=80',
            isPopular: true
          }
        ]
      }
    ]
  },
  {
    id: 'template_moroccan_heritage',
    name: {
      en: 'Moroccan Heritage',
      fr: 'Héritage Marocain'
    },
    tagline: {
      en: 'Warm terracotta tones, refined hierarchy & authentic Moroccan dishes',
      fr: 'Tons terracotta chaleureux, élégance artisanale et cuisine de tradition'
    },
    description: {
      en: 'Subtle Moroccan-inspired visual elements, warm refined colors, and clear category hierarchy. Perfect for Moroccan cuisine, traditional restaurants, and riads.',
      fr: 'Éléments visuels inspirés de l’art de vivre marocain, teintes terracotta et dorées. Conçu pour la gastronomie marocaine, les riads et tables d’hôtes.'
    },
    intendedFor: {
      en: 'Traditional Moroccan, Riads, Heritage Restaurants',
      fr: 'Restaurants Marocains Traditionnels, Riads, Patios de Médina'
    },
    badge: {
      en: 'Authentic & Warm',
      fr: 'Authentique & Chaleureux'
    },
    primaryColor: '#B45309',
    accentColor: '#D97706',
    previewHeroImage: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Moroccan Salads & Briouates', fr: 'Salades Marocaines & Briouates', ar: 'المقبلات والبريوات' },
        items: [
          {
            name: { en: 'Traditional Trio of Moroccan Salads', fr: 'Trio de Salades Traditionnelles de Fès' },
            description: { en: 'Smoked Zaalouk, caramelized Taktouka, and spiced sweet carrots with argan.', fr: 'Zaalouk fumé, Taktouka confite et carottes mchermla parfumées à l’huile d’argan.' },
            price: 45,
            imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=400&auto=format&fit=crop&q=80',
            dietary: 'vegetarian'
          },
          {
            name: { en: 'Crispy Almond & Cheese Briouates', fr: 'Briouates Croustillantes Fromage & Amandes' },
            description: { en: 'Crispy golden warqa pastry, artisan fresh cheese, toasted almonds, orange honey.', fr: 'Feuilleté croustillant au fromage frais de chèvre, amandes dorées et pointe de miel d’oranger.' },
            price: 52,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          }
        ]
      },
      {
        name: { en: 'Authentic Tagines & Couscous', fr: 'Tajines & Couscous de Tradition', ar: 'الطواجن والكسكس' },
        items: [
          {
            name: { en: 'Slow-Cooked Lamb Tagine with Prunes', fr: 'Tajine d’Agneau aux Pruneaux & Amandes' },
            description: { en: 'Tender Atlas lamb braised in sweet spices, caramelized prunes, toasted sesame.', fr: 'Agneau mijoté doucement aux épices douces, pruneaux confits, amandes et sésame grillé.' },
            price: 135,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
            dietary: 'halal',
            isPopular: true
          },
          {
            name: { en: 'Free-Range Chicken Tagine with Preserved Lemon', fr: 'Tajine de Poulet Fermier au Citron Confit' },
            description: { en: 'Farm-raised chicken, purple Meslalla olives, aged lemon peel, saffron sauce.', fr: 'Poulet fermier mijoté au safran pur, olives violettes meslalla et écorces de citron confit.' },
            price: 115,
            imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80',
            dietary: 'halal'
          },
          {
            name: { en: 'Royal Seven-Vegetable Couscous', fr: 'Couscous Royal aux Sept Légumes de l’Atlas' },
            description: { en: 'Fine hand-rolled semolina, rich vegetable bouillon, lamb, chicken, merguez.', fr: 'Semoule fine beurrée, bouillon parfumé, légumes fondants, agneau et poulet fermier.' },
            price: 140,
            imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80',
            dietary: 'halal',
            isPopular: true
          }
        ]
      },
      {
        name: { en: 'Moroccan Sweets & Tea', fr: 'Douceurs & Thé Impérial', ar: 'الشاي والحلويات' },
        items: [
          {
            name: { en: 'Assortment of Gazelle Horns & Sweets', fr: 'Assortiment de Cornes de Gazelle de Fès' },
            description: { en: 'Pure almond paste, orange blossom water, cinnamon, fine pastry dough.', fr: 'Pâte d’amandes pures parfumée à l’eau de fleur d’oranger et cannelle fine.' },
            price: 42,
            imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80'
          },
          {
            name: { en: 'Fresh Spearmint Tea Ceremony', fr: 'Thé à la Menthe Fraîche Traditionnel' },
            description: { en: 'Gunpowder green tea, fresh organic spearmint, light cane sugar, pine nuts.', fr: 'Thé vert gunpowder, menthe fraîche cueillie du jour, sucre de canne et pignons.' },
            price: 22,
            imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80',
            isPopular: true
          }
        ]
      }
    ]
  },
  {
    id: 'template_cafe_coffee',
    name: {
      en: 'Café & Coffee Shop',
      fr: 'Café & Coffee Shop'
    },
    tagline: {
      en: 'Editorial beverage listings, specialty espresso, beans & brunch',
      fr: 'Présentation éditoriale des cafés de spécialité, thés et brunchs'
    },
    description: {
      en: 'Editorial typography, clean beverage listings, specialty coffee, tea, pastries, and light brunch meals. Suitable for cafés and specialty coffee shops.',
      fr: 'Mise en page épurée axée sur les boissons chaudes et froides, cafés de terroir, thés et formules brunch gourmandes.'
    },
    intendedFor: {
      en: 'Coffee Shops, Espresso Bars, Brunch Spots',
      fr: 'Coffee Shops, Bars à Espresso, Salons de Thé'
    },
    badge: {
      en: 'Coffee & Brunch',
      fr: 'Café & Brunch'
    },
    primaryColor: '#78350F',
    accentColor: '#F59E0B',
    previewHeroImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Specialty Espresso & Brews', fr: 'Cafés de Spécialité', ar: 'القهوة المختصة' },
        items: [
          {
            name: { en: 'Double Espresso Pure Origin (Ethiopia)', fr: 'Double Espresso Pur Terroir (Éthiopie)' },
            description: { en: 'Notes of jasmine, bergamot, and sweet citrus with silky crema.', fr: 'Profil floral aux notes de jasmin, bergamote et agrumes doux avec créma veloutée.' },
            price: 24,
            imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
            isPopular: true
          },
          {
            name: { en: 'Taliouine Saffron & Honey Latte', fr: 'Latte au Safran de Taliouine & Miel Pur' },
            description: { en: 'Double espresso shot, steamed whole milk, natural saffron infusion, organic honey.', fr: 'Double shot d’espresso, lait texturé velouté, infusion de safran pur et miel de fleurs.' },
            price: 36,
            imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          },
          {
            name: { en: 'Cold Brew Single Origin (18h Steeping)', fr: 'Cold Brew Infusion Lente Glacée (18h)' },
            description: { en: 'Slow cold-extracted coffee served over hand-cut clear ice sphere.', fr: 'Extraction lente à froid pendant 18h, servi sur sphère de glace transparente.' },
            price: 34,
            imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80'
          }
        ]
      },
      {
        name: { en: 'Artisan Brunch & Toasts', fr: 'Brunch Artisanal & Tartines', ar: 'وجبات الفطور' },
        items: [
          {
            name: { en: 'Sourdough Avocado & Poached Egg Toast', fr: 'Toast Avocat & Œuf Poché Fermier au Levain' },
            description: { en: 'Artisan sourdough, whipped avocado, organic poached egg, pomegranate molasses.', fr: 'Pain au levain croustillant, avocat écrasé au citron vert, œuf fermier et dukkah.' },
            price: 58,
            imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop&q=80',
            dietary: 'vegetarian',
            isPopular: true
          },
          {
            name: { en: 'Organic Berry & Greek Yogurt Granola Bowl', fr: 'Bowl Granola Maison & Yaourt Grec Velouté' },
            description: { en: 'Baked honey oat granola, roasted almonds, seasonal berries, wild blossom honey.', fr: 'Granola croustillant aux noix et miel, yaourt grec crémeux et fruits rouges frais.' },
            price: 46,
            imageUrl: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=400&auto=format&fit=crop&q=80',
            dietary: 'vegetarian'
          }
        ]
      }
    ]
  },
  {
    id: 'template_fast_food_snack',
    name: {
      en: 'Fast Food & Snack',
      fr: 'Fast Food & Snack'
    },
    tagline: {
      en: 'Bold cards, prominent prices in MAD & high-speed browsing',
      fr: 'Fiches dynamiques, prix bien visibles en MAD et commande rapide'
    },
    description: {
      en: 'Bold product cards, highly visible prices in MAD, and easy-to-scan categories. Suitable for burgers, sandwiches, tacos, snacks, and quick-service spots.',
      fr: 'Design dynamique et lisible conçu pour convertir rapidement : burgers gourmets, tacos, grillades et snacks à fort volume.'
    },
    intendedFor: {
      en: 'Smash Burgers, Tacos, Fried Chicken, Snack Bars',
      fr: 'Smash Burgers, Tacos Français, Snacks Rapides, Street Food'
    },
    badge: {
      en: 'High Volume & Quick Scan',
      fr: 'Fort Volume & Rapide'
    },
    primaryColor: '#DC2626',
    accentColor: '#F59E0B',
    previewHeroImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Signature Smash Burgers', fr: 'Smash Burgers Signatures', ar: 'البرغر' },
        items: [
          {
            name: { en: 'Atlas Double Smash Gourmet Burger', fr: 'Smash Burger Gourmet Double Steak' },
            description: { en: 'Double 100% halal beef patty, smoked gouda, caramelized shallots, harissa mayo.', fr: 'Double steak smashé 100% bœuf halal, gouda fumé, oignons confits et sauce harissa.' },
            price: 78,
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
            dietary: 'halal',
            isPopular: true
          },
          {
            name: { en: 'Crispy Buttermilk Chicken Burger', fr: 'Burger Poulet Croustillant & Cheddar Fondu' },
            description: { en: 'Crispy fried chicken breast, aged cheddar, tangy pickles, garlic aioli on brioche.', fr: 'Blanc de poulet pané extra croustillant, cheddar affiné, pickles et sauce barbecue.' },
            price: 68,
            imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=400&auto=format&fit=crop&q=80',
            dietary: 'halal'
          }
        ]
      },
      {
        name: { en: 'Tacos & Loaded Sides', fr: 'Tacos & Frites Gourmandes', ar: 'التاكوس والمقبلات' },
        items: [
          {
            name: { en: 'French Tacos 2 Meats Gratiné', fr: 'Tacos Français 2 Viandes Gratiné Mozzarella' },
            description: { en: 'Minced beef, marinated chicken, signature cheese sauce, french fries inside.', fr: 'Viande hachée, poulet mariné, sauce fromagère maison onctueuse, frites à l’intérieur.' },
            price: 62,
            imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&auto=format&fit=crop&q=80',
            dietary: 'halal',
            isPopular: true
          },
          {
            name: { en: 'Loaded Cheddar & Bacon Fries', fr: 'Frites Fraîches Loaded Cheddar & Éclats de Dinde' },
            description: { en: 'Crispy skin-on fries, warm melted cheddar cheese, crispy turkey bacon, jalapenos.', fr: 'Frites croustillantes, sauce cheddar fondue, bacon de dinde fumée et jalapeños.' },
            price: 35,
            imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80'
          }
        ]
      }
    ]
  },
  {
    id: 'template_minimal_luxury',
    name: {
      en: 'Minimal Luxury',
      fr: 'Luxe Minimaliste'
    },
    tagline: {
      en: 'Restrained elegance, generous whitespace & fine dining prestige',
      fr: 'Élégance épurée, espace généreux et prestige gastronomique'
    },
    description: {
      en: 'Elegant typography, restrained colors, and spacious layouts. Suitable for premium restaurants, luxury lounges, and fine dining establishments.',
      fr: 'Mise en scène noble et sobre, typographie serif élégante, contrastes raffinés pour tables étoilées et lounges d’exception.'
    },
    intendedFor: {
      en: 'Fine Dining, Luxury Lounges, Boutique Hotels',
      fr: 'Gastronomie Fine, Rooftops de Prestige, Salons VIP'
    },
    badge: {
      en: 'Fine Dining & Luxury',
      fr: 'Gastronomie & Prestige'
    },
    primaryColor: '#111827',
    accentColor: '#9CA3AF',
    previewHeroImage: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Preludes & Raw Bar', fr: 'Préludes & Produits d’Exception', ar: 'المقبلات الفاخرة' },
        items: [
          {
            name: { en: 'Atlantic Sea Bass Carpaccio with Yuzu', fr: 'Carpaccio de Bar Sauvage de Dakhla au Yuzu' },
            description: { en: 'Thinly sliced wild line-caught sea bass, finger lime pearls, fleur de sel, yuzu vinaigrette.', fr: 'Lamelles de bar de ligne, perles de citron caviar, fleur de sel de Guérande et huile vierge.' },
            price: 110,
            imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          },
          {
            name: { en: 'Pan-Seared Duck Foie Gras', fr: 'Foie Gras de Canard Poêlé & Pain d’Épices' },
            description: { en: 'Artisan duck foie gras, caramelized figs in balsamic, toasted brioche.', fr: 'Escalope de foie gras poêlée, chutney de figues de Taounate et pain d’épices doré.' },
            price: 125,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
            dietary: 'chef_special'
          }
        ]
      },
      {
        name: { en: 'Grand Courses', fr: 'Les Grands Plats', ar: 'الأطباق الفاخرة' },
        items: [
          {
            name: { en: 'Beef Tenderloin Rossini with Black Truffle', fr: 'Filet de Bœuf Rossini & Truffe Noire' },
            description: { en: 'Prime aged beef tenderloin, pan-seared foie gras, shaved seasonal black truffles, mousseline.', fr: 'Cœur de filet de bœuf poêlé, foie gras poêlé, lamelles de truffe et mousseline au beurre truffé.' },
            price: 210,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          },
          {
            name: { en: 'Atlantic Turbot with Saffron Beurre Blanc', fr: 'Turbot Rôti & Beurre Blanc au Safran de Taliouine' },
            description: { en: 'Wild turbot roasted on bone, saffron emulsion, glazed baby leeks, oscietra caviar.', fr: 'Pavé de turbot doré sur peau, émulsion au safran royal et étuvée de poireaux primeurs.' },
            price: 195,
            imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80',
            dietary: 'chef_special'
          }
        ]
      }
    ]
  },
  {
    id: 'template_bakery_patisserie',
    name: {
      en: 'Bakery & Patisserie',
      fr: 'Boulangerie & Pâtisserie'
    },
    tagline: {
      en: 'Pastel elegance, visual emphasis on sweet creations & pastries',
      fr: 'Élégance pâtissière, valorisation des douceurs et viennoiseries'
    },
    description: {
      en: 'Refined product presentation, visual emphasis on pastries and baked goods, and clean category sections. Suitable for bakeries, dessert shops, and tearooms.',
      fr: 'Présentation délicate et gourmande, idéale pour sublimer gâteaux d’anniversaire, viennoiseries artisanales, tartes de saison et chocolats.'
    },
    intendedFor: {
      en: 'Artisan Bakeries, Pastry Boutiques, Tearooms, Dessert Bars',
      fr: 'Boulangeries Fines, Pâtisseries Artisanales, Salons de Thé'
    },
    badge: {
      en: 'Pastry & Baking',
      fr: 'Pâtisserie Fine'
    },
    primaryColor: '#E11D48',
    accentColor: '#FBBF24',
    previewHeroImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Pure Butter Viennoiseries', fr: 'Viennoiseries Pur Beurre', ar: 'المخبوزات' },
        items: [
          {
            name: { en: 'Flaky French Butter Croissant', fr: 'Croissant Feuilleté Pur Beurre AOP' },
            description: { en: 'Traditional laminating with Charentes butter, crisp crust, honeyed honeycomb interior.', fr: 'Feuilletage artisanal croustillant au beurre AOP Charentes, alvéolage parfait.' },
            price: 12,
            imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80',
            isPopular: true
          },
          {
            name: { en: 'Pain au Chocolat Double Baton', fr: 'Pain au Chocolat Double Barre Valrhona' },
            description: { en: 'Golden flaky pastry, filled with two sticks of intense Valrhona dark chocolate.', fr: 'Feuilletage croustillant pur beurre garni de deux bâtons de chocolat noir Valrhona.' },
            price: 14,
            imageUrl: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400&auto=format&fit=crop&q=80',
            isPopular: true
          }
        ]
      },
      {
        name: { en: 'Fine Pastry Creations', fr: 'Pâtisseries Fines de Saison', ar: 'الحلويات الفاخرة' },
        items: [
          {
            name: { en: 'Fresh Raspberry & Pistachio Tartlet', fr: 'Tartelette Framboises Fraîches & Pistache' },
            description: { en: 'Sweet almond sable tart, Sicilian pistachio frangipane, fresh raspberries, coulis.', fr: 'Pâte sablée croustillante aux amandes, crème pistache d’Iran et framboises fraîches.' },
            price: 38,
            imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=400&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          },
          {
            name: { en: 'Caramelized Vanilla Millefeuille', fr: 'Millefeuille Caramélisé Vanille Bourbon' },
            description: { en: 'Inverted puff pastry caramelized with icing sugar, light Madagascar vanilla bean diplomat cream.', fr: 'Feuilletage inversé caramélisé, crème diplomate légère à la vanille bourbon.' },
            price: 35,
            imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&auto=format&fit=crop&q=80'
          }
        ]
      }
    ]
  }
];
