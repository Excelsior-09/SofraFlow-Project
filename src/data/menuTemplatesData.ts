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
  // 1. Modern Fine Dining
  {
    id: 'template_modern_fine_dining',
    name: {
      en: 'Modern Fine Dining',
      fr: 'Haute Gastronomie Contemporaine'
    },
    tagline: {
      en: 'Restrained elegance, generous whitespace & fine dining prestige',
      fr: 'Élégance épurée, espace généreux et prestige gastronomique'
    },
    description: {
      en: 'Elegant serif typography, restrained colors, and spacious layouts. Suitable for premium restaurants, luxury lounges, and fine dining establishments.',
      fr: 'Mise en scène noble et sobre, typographie serif élégante, contrastes raffinés pour tables étoilées, rooftops et salons de dégustation.'
    },
    intendedFor: {
      en: 'Fine Dining, Luxury Lounges, Boutique Hotels',
      fr: 'Gastronomie Fine, Rooftops de Prestige, Salons VIP'
    },
    badge: {
      en: 'Fine Dining & Luxury',
      fr: 'Gastronomie & Prestige'
    },
    primaryColor: '#0F2C59',
    accentColor: '#D4AF37',
    previewHeroImage: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Preludes & Raw Bar', fr: 'Préludes & Produits d’Exception', ar: 'المقبلات الفاخرة' },
        items: [
          {
            name: { en: 'Atlantic Sea Bass Carpaccio with Yuzu', fr: 'Carpaccio de Bar Sauvage de Dakhla au Yuzu', ar: 'كارباتشيو سمك القاروص باليوزو' },
            description: { en: 'Thinly sliced wild line-caught sea bass, finger lime pearls, fleur de sel, yuzu vinaigrette.', fr: 'Lamelles de bar de ligne, perles de citron caviar, fleur de sel de Guérande et huile vierge.' },
            price: 110,
            imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          },
          {
            name: { en: 'Pan-Seared Duck Foie Gras', fr: 'Foie Gras de Canard Poêlé & Pain d’Épices', ar: 'كبد البط المحمر' },
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
            name: { en: 'Beef Tenderloin Rossini with Black Truffle', fr: 'Filet de Bœuf Rossini & Truffe Noire', ar: 'فيليه اللحم البقري مع الكمأة السوداء' },
            description: { en: 'Prime aged beef tenderloin, pan-seared foie gras, shaved seasonal black truffles, mousseline.', fr: 'Cœur de filet de bœuf poêlé, foie gras poêlé, lamelles de truffe et mousseline au beurre truffé.' },
            price: 210,
            imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&auto=format&fit=crop&q=80',
            dietary: 'halal',
            isPopular: true
          },
          {
            name: { en: 'Atlantic Turbot with Saffron Beurre Blanc', fr: 'Turbot Rôti & Beurre Blanc au Safran de Taliouine', ar: 'سمك التوربو بصلصة الزعفران' },
            description: { en: 'Wild turbot roasted on bone, saffron emulsion, glazed baby leeks, oscietra caviar.', fr: 'Pavé de turbot doré sur peau, émulsion au safran royal et étuvée de poireaux primeurs.' },
            price: 195,
            imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80',
            dietary: 'chef_special'
          }
        ]
      }
    ]
  },

  // 2. Moroccan Heritage
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
            name: { en: 'Traditional Trio of Moroccan Salads', fr: 'Trio de Salades Traditionnelles de Fès', ar: 'سلطات مغربية ثلاثية' },
            description: { en: 'Smoked Zaalouk, caramelized Taktouka, and spiced sweet carrots with argan.', fr: 'Zaalouk fumé, Taktouka confite et carottes mchermla parfumées à l’huile d’argan.' },
            price: 45,
            imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=400&auto=format&fit=crop&q=80',
            dietary: 'vegetarian'
          },
          {
            name: { en: 'Crispy Almond & Cheese Briouates', fr: 'Briouates Croustillantes Fromage & Amandes', ar: 'بريوات بالجبن واللوز' },
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
            name: { en: 'Slow-Cooked Lamb Tagine with Prunes', fr: 'Tajine d’Agneau aux Pruneaux & Amandes', ar: 'طاجين اللحم بالبرقوق واللوز' },
            description: { en: 'Tender Atlas lamb braised in sweet spices, caramelized prunes, toasted sesame.', fr: 'Agneau mijoté doucement aux épices douces, pruneaux confits, amandes et sésame grillé.' },
            price: 135,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
            dietary: 'halal',
            isPopular: true
          },
          {
            name: { en: 'Free-Range Chicken Tagine with Preserved Lemon', fr: 'Tajine de Poulet Fermier au Citron Confit', ar: 'طاجين الدجاج البلدي بالحامض المصير' },
            description: { en: 'Farm-raised chicken, purple Meslalla olives, aged lemon peel, saffron sauce.', fr: 'Poulet fermier mijoté au safran pur, olives violettes meslalla et écorces de citron confit.' },
            price: 115,
            imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80',
            dietary: 'halal'
          },
          {
            name: { en: 'Royal Seven-Vegetable Couscous', fr: 'Couscous Royal aux Sept Légumes de l’Atlas', ar: 'الكسكس الملكي بسبع خضار' },
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
            name: { en: 'Fresh Spearmint Tea Ceremony', fr: 'Thé à la Menthe Fraîche Traditionnel', ar: 'أتاي بالنعناع المغربي' },
            description: { en: 'Gunpowder green tea, fresh organic spearmint, light cane sugar, pine nuts.', fr: 'Thé vert gunpowder, menthe fraîche cueillie du jour, sucre de canne et pignons.' },
            price: 22,
            imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80',
            isPopular: true
          }
        ]
      }
    ]
  },

  // 3. Specialty Coffee
  {
    id: 'template_specialty_coffee',
    name: {
      en: 'Specialty Coffee',
      fr: 'Café & Coffee Shop de Spécialité'
    },
    tagline: {
      en: 'Editorial beverage listings, specialty espresso, beans & brunch',
      fr: 'Présentation éditoriale des cafés de spécialité, torréfaction et brunchs'
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
    primaryColor: '#38261E',
    accentColor: '#B9794B',
    previewHeroImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Specialty Espresso & Brews', fr: 'Cafés de Spécialité', ar: 'القهوة المختصة' },
        items: [
          {
            name: { en: 'Double Espresso Pure Origin (Ethiopia)', fr: 'Double Espresso Pur Terroir (Éthiopie)', ar: 'إسبريسو إثيوبي فاخر' },
            description: { en: 'Notes of jasmine, bergamot, and sweet citrus with silky crema.', fr: 'Profil floral aux notes de jasmin, bergamote et agrumes doux avec créma veloutée.' },
            price: 24,
            imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
            isPopular: true
          },
          {
            name: { en: 'Taliouine Saffron & Honey Latte', fr: 'Latte au Safran de Taliouine & Miel Pur', ar: 'لاتيه بزعفران تاليوين والعسل' },
            description: { en: 'Double espresso shot, steamed whole milk, natural saffron infusion, organic honey.', fr: 'Double shot d’espresso, lait texturé velouté, infusion de safran pur et miel de fleurs.' },
            price: 36,
            imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          },
          {
            name: { en: 'Cold Brew Single Origin (18h Steeping)', fr: 'Cold Brew Infusion Lente Glacée (18h)', ar: 'كولد برو منقوع 18 ساعة' },
            description: { en: 'Slow cold-extracted coffee served over hand-cut clear ice sphere.', fr: 'Extraction lente à froid pendant 18h, servi sur sphère de glace transparente.' },
            price: 34,
            imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80'
          }
        ]
      },
      {
        name: { en: 'Artisan Brunch & Toasts', fr: 'Brunch Artisanal & Tartines', ar: 'فطور برانش وتوست' },
        items: [
          {
            name: { en: 'Sourdough Avocado & Poached Egg Toast', fr: 'Toast Avocat & Œuf Poché Fermier au Levain', ar: 'توست الأفوكادو والبيض المسلوق' },
            description: { en: 'Artisan sourdough, whipped avocado, organic poached egg, pomegranate molasses.', fr: 'Pain au levain croustillant, avocat écrasé au citron vert, œuf fermier et dukkah.' },
            price: 58,
            imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop&q=80',
            dietary: 'vegetarian',
            isPopular: true
          }
        ]
      }
    ]
  },

  // 4. Burger & Fast Food
  {
    id: 'template_burger_fast_food',
    name: {
      en: 'Burger & Fast Food',
      fr: 'Burger & Fast Food Gourmet'
    },
    tagline: {
      en: 'Bold cards, prominent prices in MAD & high-speed browsing',
      fr: 'Fiches dynamiques, prix bien visibles en MAD et commande rapide'
    },
    description: {
      en: 'Bold product cards, highly visible prices in MAD, and easy-to-scan categories. Suitable for burgers, sandwiches, tacos, snacks, and quick-service spots.',
      fr: 'Design dynamique et lisible conçu pour convertir rapidement : smash burgers gourmets, tacos, street food et snacks à fort volume.'
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
        name: { en: 'Signature Smash Burgers', fr: 'Smash Burgers Signatures', ar: 'البرغر المميز' },
        items: [
          {
            name: { en: 'Atlas Double Smash Gourmet Burger', fr: 'Smash Burger Gourmet Double Steak', ar: 'سماش برغر مزدوج فاخر' },
            description: { en: 'Double 100% halal beef patty, smoked gouda, caramelized shallots, harissa mayo.', fr: 'Double steak smashé 100% bœuf halal, gouda fumé, oignons confits et sauce harissa.' },
            price: 78,
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
            dietary: 'halal',
            isPopular: true
          },
          {
            name: { en: 'Crispy Buttermilk Chicken Burger', fr: 'Burger Poulet Croustillant & Cheddar Fondu', ar: 'برغر دجاج مقرمش مع جبنة شيدر' },
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
            name: { en: 'French Tacos 2 Meats Gratiné', fr: 'Tacos Français 2 Viandes Gratiné Mozzarella', ar: 'تاكوس فرنسي بجبنة الموتزاريلا' },
            description: { en: 'Minced beef, marinated chicken, signature cheese sauce, french fries inside.', fr: 'Viande hachée, poulet mariné, sauce fromagère maison onctueuse, frites à l’intérieur.' },
            price: 62,
            imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&auto=format&fit=crop&q=80',
            dietary: 'halal',
            isPopular: true
          },
          {
            name: { en: 'Loaded Cheddar & Bacon Fries', fr: 'Frites Fraîches Loaded Cheddar & Éclats de Dinde', ar: 'بطاطس مقلية بالشيدر والمقبلات' },
            description: { en: 'Crispy skin-on fries, warm melted cheddar cheese, crispy turkey bacon, jalapenos.', fr: 'Frites croustillantes, sauce cheddar fondue, bacon de dinde fumée et jalapeños.' },
            price: 35,
            imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80'
          }
        ]
      }
    ]
  },

  // 5. Italian Pizzeria & Trattoria
  {
    id: 'template_italian_pizzeria',
    name: {
      en: 'Italian Pizzeria & Trattoria',
      fr: 'Pizzeria & Trattoria Italienne'
    },
    tagline: {
      en: 'Wood-fired sourdough pizzas, fresh handcrafted pasta & antipasti',
      fr: 'Pizzas au feu de bois, pâtes fraîches maison et antipasti italiens'
    },
    description: {
      en: 'Artisan wood-fired pizzas, rich tomato sauces, handcrafted pasta, and Mediterranean antipasti. Designed for authentic pizzerias and Italian bistros.',
      fr: 'Pizzas napolitaines croustillantes, pâtes fraîches artisanales et antipasti gorgés de soleil. Idéal pour trattorias et pizzerias authentiques.'
    },
    intendedFor: {
      en: 'Pizzerias, Italian Trattorias, Mediterranean Bistros',
      fr: 'Pizzerias Artisanales, Trattorias Italiennes, Ristorantes'
    },
    badge: {
      en: 'Wood-Fired & Pasta',
      fr: 'Feu de Bois & Pâtes'
    },
    primaryColor: '#991B1B',
    accentColor: '#16A34A',
    previewHeroImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Antipasti & Bruschetta', fr: 'Antipasti & Bruschetta', ar: 'المقبلات الإيطالية' },
        items: [
          {
            name: { en: 'Truffle Burrata Pugliese', fr: 'Burrata des Pouilles à la Truffe', ar: 'بوراتا الكمأة الإيطالية' },
            description: { en: 'Fresh 200g burrata, summer black truffle cream, heirloom cherry tomatoes, basil glaze.', fr: 'Burrata crémeuse de 200g, crème de truffe d’été, tomates cerises confites et réduction de balsamique.' },
            price: 75,
            imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=400&auto=format&fit=crop&q=80',
            dietary: 'vegetarian',
            isPopular: true
          }
        ]
      },
      {
        name: { en: 'Wood-Fired Sourdough Pizzas', fr: 'Pizzas Napolitaines au Feu de Bois', ar: 'البيتزا على الحطب' },
        items: [
          {
            name: { en: 'Pizza Margherita Di Bufala DOP', fr: 'Pizza Margherita Di Bufala DOP', ar: 'بيتزا مارغريتا بوفالا' },
            description: { en: 'San Marzano tomato sauce, mozzarella di bufala Campana, fresh basil leaves, extra virgin olive oil.', fr: 'Sauce tomate San Marzano, mozzarella di bufala AOP, feuilles de basilic frais et huile d’olive extra vierge.' },
            price: 78,
            imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&auto=format&fit=crop&q=80',
            dietary: 'vegetarian',
            isPopular: true
          },
          {
            name: { en: 'Pizza Diavola Piccante', fr: 'Pizza Diavola Piccante', ar: 'بيتزا ديافولا حارة' },
            description: { en: 'Fiore di latte mozzarella, spicy beef salami, charred red chili flakes, kalamata olives.', fr: 'Mozzarella fiore di latte, spianata de bœuf épicée, piments rouges grillés et olives kalamata.' },
            price: 88,
            imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&auto=format&fit=crop&q=80',
            dietary: 'spicy'
          }
        ]
      },
      {
        name: { en: 'Dolci & Italian Desserts', fr: 'Dolci & Desserts Maison', ar: 'الحلويات الإيطالية' },
        items: [
          {
            name: { en: 'Traditional Savoiardi Tiramisu', fr: 'Tiramisu Traditionnel au Mascarpone & Café', ar: 'تيراميسو تقليدي' },
            description: { en: 'Savoiardi ladyfingers soaked in dark espresso, creamy mascarpone cream, Dutch cocoa powder.', fr: 'Biscuits cuillère imbibés d’espresso intense, crème onctueuse au mascarpone et cacao amer.' },
            price: 45,
            imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&auto=format&fit=crop&q=80',
            isPopular: true,
            dietary: 'chef_special'
          }
        ]
      }
    ]
  },

  // 6. Asian Sushi & Wok
  {
    id: 'template_asian_sushi_wok',
    name: {
      en: 'Asian Sushi & Wok',
      fr: 'Sushi Bar & Wok Asiatique'
    },
    tagline: {
      en: 'Minimalist dark aesthetics, vibrant rolls, bowls & dim sum',
      fr: 'Élégance sombre, sushis d’exception, woks fumants et dim sum'
    },
    description: {
      en: 'Striking black and ruby palette, highlighting fresh nigiri, specialty sushi rolls, crispy gyozas, and sizzling wok noodles. Perfect for modern Japanese and pan-Asian dining.',
      fr: 'Palette noire et rubis sublimant nigiris frais, rolls signatures, gyozas croustillants et nouilles au wok sautées à la minute.'
    },
    intendedFor: {
      en: 'Sushi Bars, Japanese Izakayas, Asian Fusion, Wok & Ramen',
      fr: 'Bars à Sushi, Izakayas, Cuisine Fusion Asiatique, Ramen'
    },
    badge: {
      en: 'Sushi & Wok',
      fr: 'Sushi & Street Food Asiatique'
    },
    primaryColor: '#18181B',
    accentColor: '#EF4444',
    previewHeroImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Signature Rolls & Nigiri', fr: 'Rolls Signatures & Nigiri', ar: 'لفائف السوشي والنيغيري' },
        items: [
          {
            name: { en: 'Flamed Salmon Dragon Roll (8 pcs)', fr: 'Dragon Roll Saumon Flambé (8 pcs)', ar: 'دراجون رول السلمون المشوي' },
            description: { en: 'Prawn tempura, avocado, flame-seared Norwegian salmon, spicy teriyaki glaze, tobiko.', fr: 'Tempura de crevette, avocat, saumon snacké au chalumeau, sauce teriyaki maison et tobiko.' },
            price: 98,
            imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          },
          {
            name: { en: 'Crispy Prawn & Crab California', fr: 'California Crevette Croustillante & Crabe', ar: 'كاليفورنيا رول كرانشي' },
            description: { en: 'Crispy fried panko prawn, seasoned crab, cucumber, Japanese sesame and spicy mayo.', fr: 'Crevette croustillante panée au panko, crabe assaisonné, concombre et sésame torréfié.' },
            price: 85,
            imageUrl: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&auto=format&fit=crop&q=80'
          }
        ]
      },
      {
        name: { en: 'Wok Specialties & Noodles', fr: 'Spécialités Wok & Nouilles Sautées', ar: 'أطباق الووك والنودلز' },
        items: [
          {
            name: { en: 'Pad Thai with Sautéed Prawns', fr: 'Pad Thaï aux Crevettes & Cacahuètes Croquantes', ar: 'باد تاي بالجمبري' },
            description: { en: 'Rice noodles, jumbo wild prawns, tamarind sauce, bean sprouts, crushed peanuts, lime.', fr: 'Nouilles de riz, crevettes sautées, sauce tamarin aigre-douce, pousses de soja et cacahuètes grillées.' },
            price: 92,
            imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&auto=format&fit=crop&q=80',
            isPopular: true
          }
        ]
      }
    ]
  },

  // 7. Seafood & Mediterranean Grill
  {
    id: 'template_seafood_mediterranean',
    name: {
      en: 'Seafood & Mediterranean Grill',
      fr: 'Fruits de Mer & Grillades Côtières'
    },
    tagline: {
      en: 'A little more coast. Ocean blue, sea glass & catch of the day',
      fr: 'L’air du grand large : bleu océan, arrivages frais et poissons grillés'
    },
    description: {
      en: 'Crisp coastal tones, showcasing grilled catch of the day, fresh oysters, calamari, and fragrant Mediterranean sides. Designed for seaside dining and fish restaurants.',
      fr: 'Ambiance iodée et méditerranéenne mettant en vedette la pêche du jour, poulpes braisés, homards et dorades royales sur braise.'
    },
    intendedFor: {
      en: 'Seafood Restaurants, Coastal Grills, Fish Markets',
      fr: 'Restaurants de Poissons, Grillades Côtières, Cabanes de Plage'
    },
    badge: {
      en: 'Coastal & Grill',
      fr: 'Pêche & Grillades'
    },
    primaryColor: '#0E7490',
    accentColor: '#2DD4BF',
    previewHeroImage: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Raw Bar & Starters', fr: 'Banc de l’Écailler & Entrées', ar: 'المقبلات البحرية' },
        items: [
          {
            name: { en: 'Marrakech Spiced Octopus Carpaccio', fr: 'Carpaccio de Poulpe Braisé aux Agrumes', ar: 'كارباتشيو الأخطبوط المتبل' },
            description: { en: 'Tender octopus, citrus vinaigrette, pink peppercorns, capers, micro herbs.', fr: 'Poulpe finement tranché, huile d’olive vierge, perles de pamplemousse et baies roses.' },
            price: 78,
            imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=82',
            dietary: 'chef_special',
            isPopular: true
          },
          {
            name: { en: 'Crispy Salt & Pepper Calamari', fr: 'Calamars Sautés Sel & Poivre de Séchouan', ar: 'كلمار مقرمش بالملح والبهارات' },
            description: { en: 'Crispy baby calamari, homemade garlic aioli, charred lemon wedge.', fr: 'Petits encornets dorés, aïoli maison à l’ail doux et citron grillé.' },
            price: 68,
            imageUrl: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=400&auto=format&fit=crop&q=82'
          }
        ]
      },
      {
        name: { en: 'Catch of the Day & Grills', fr: 'Pêche du Jour & Grillades Côtières', ar: 'أسماك اليوم المشوية' },
        items: [
          {
            name: { en: 'Whole Sea Bass with Herb Oil', fr: 'Bar Entier Grillé à l’Huile d’Herbes Côtières', ar: 'سمك القاروص الكامل المشوي' },
            description: { en: 'Line-caught whole sea bass grilled over wood charcoal, infused herb oil, seasonal potatoes.', fr: 'Bar de ligne entier grillé au feu de bois, émulsion d’origan sauvage et pommes grenailles.' },
            price: 135,
            imageUrl: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=400&auto=format&fit=crop&q=82',
            dietary: 'halal',
            isPopular: true
          }
        ]
      }
    ]
  },

  // 8. Bakery & Patisserie
  {
    id: 'template_bakery_patisserie',
    name: {
      en: 'Bakery & Patisserie',
      fr: 'Boulangerie & Pâtisserie Fine'
    },
    tagline: {
      en: 'Pastel elegance, visual emphasis on sweet creations & pastries',
      fr: 'Élégance pâtissière, valorisation des douceurs et viennoiseries'
    },
    description: {
      en: 'Refined product presentation, visual emphasis on pastries and baked goods, and clean category sections. Suitable for bakeries, dessert shops, and tearooms.',
      fr: 'Présentation délicate et gourmande, idéale pour sublimer viennoiseries pur beurre, gâteaux d’anniversaire, tartes de saison et chocolats.'
    },
    intendedFor: {
      en: 'Artisan Bakeries, Pastry Boutiques, Tearooms, Dessert Bars',
      fr: 'Boulangeries Fines, Pâtisseries Artisanales, Salons de Thé'
    },
    badge: {
      en: 'Pastry & Baking',
      fr: 'Pâtisserie Fine'
    },
    primaryColor: '#BE185D',
    accentColor: '#F59E0B',
    previewHeroImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Pure Butter Viennoiseries', fr: 'Viennoiseries Pur Beurre', ar: 'المخبوزات والكرواسون' },
        items: [
          {
            name: { en: 'Flaky French Butter Croissant', fr: 'Croissant Feuilleté Pur Beurre AOP', ar: 'كرواسون فرنسي بالزبدة الطبيعية' },
            description: { en: 'Traditional laminating with Charentes butter, crisp crust, honeyed honeycomb interior.', fr: 'Feuilletage artisanal croustillant au beurre AOP Charentes, alvéolage parfait.' },
            price: 12,
            imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80',
            isPopular: true
          },
          {
            name: { en: 'Pain au Chocolat Double Baton', fr: 'Pain au Chocolat Double Barre Valrhona', ar: 'خبز الشوكولاتة فالرونا' },
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
            name: { en: 'Fresh Raspberry & Pistachio Tartlet', fr: 'Tartelette Framboises Fraîches & Pistache', ar: 'تارت الفراولة والفستق' },
            description: { en: 'Sweet almond sable tart, Sicilian pistachio frangipane, fresh raspberries, coulis.', fr: 'Pâte sablée croustillante aux amandes, crème pistache d’Iran et framboises fraîches.' },
            price: 38,
            imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=400&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          }
        ]
      }
    ]
  },

  // 9. Fresh Juice & Healthy Eats
  {
    id: 'template_fresh_juice_healthy_eats',
    name: {
      en: 'Fresh Juice & Healthy Eats',
      fr: 'Bar à Jus & Cuisine Saine'
    },
    tagline: {
      en: 'Bright botanical accents, smoothie bowls, cold-pressed juices & salads',
      fr: 'Fraîcheur végétale, jus pressés à froid, bowls énergétiques et salades bio'
    },
    description: {
      en: 'Vibrant green and citrus accents, spotlighting nutrient-dense ingredients, cold-pressed elixirs, protein bowls, and gluten-free offerings.',
      fr: 'Ambiance saine et vitaminée idéale pour les bars à jus, bars à salades, cafés bien-être et concepts végétariens/vegans.'
    },
    intendedFor: {
      en: 'Juice Bars, Salad Bars, Organic Cafés, Healthy Bowls',
      fr: 'Bars à Jus, Salad Bars, Cafés Bio, Poke & Acai Bowls'
    },
    badge: {
      en: 'Fresh & Organic',
      fr: 'Fraîcheur & Bio'
    },
    primaryColor: '#047857',
    accentColor: '#84CC16',
    previewHeroImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Cold-Pressed Juices & Boosters', fr: 'Jus Pressés à Froid & Éclairs Vitaminés', ar: 'العصائر الطبيعية المنعشة' },
        items: [
          {
            name: { en: 'Green Detox Pure Elixir', fr: 'Élixir Détox Vert (Pomme, Kale, Gingembre)', ar: 'عصير الديتوكس الأخضر' },
            description: { en: 'Cold-pressed green apple, organic Tuscan kale, cucumber, mint, spicy ginger kick.', fr: 'Pomme verte granny smith, kale biologique, concombre de terroir et gingembre frais.' },
            price: 32,
            imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&auto=format&fit=crop&q=80',
            dietary: 'vegetarian',
            isPopular: true
          },
          {
            name: { en: 'Atlas Sunshine Citrus Boost', fr: 'Booster Solaire Orange de Berkane & Carotte', ar: 'عصير برتقال بركان مع الجزر' },
            description: { en: 'Sun-ripened Berkane oranges, sweet carrots, fresh turmeric root, lemon squeeze.', fr: 'Oranges douces de Berkane, carottes nouvelles, curcuma frais et pointe de citron vert.' },
            price: 28,
            imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&auto=format&fit=crop&q=80',
            dietary: 'vegetarian'
          }
        ]
      },
      {
        name: { en: 'Superfood Bowls & Fresh Salads', fr: 'Bowls Superaliments & Salades Colorées', ar: 'أطباق السوبرفود والسلطات' },
        items: [
          {
            name: { en: 'Amazonian Acai Energy Bowl', fr: 'Açaí Bowl Énergétique & Granola Maison', ar: 'وعاء الآساي مع الجرانولا' },
            description: { en: 'Frozen pure organic acai puree, almond milk base, banana slices, chia seeds, raw honey.', fr: 'Açaí bio fouetté, bananes fondantes, graines de chia, baies de goji et miel sauvage.' },
            price: 55,
            imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&auto=format&fit=crop&q=80',
            dietary: 'vegetarian',
            isPopular: true
          }
        ]
      }
    ]
  },

  // 10. Premium Lounge & Bistro
  {
    id: 'template_premium_lounge_bistro',
    name: {
      en: 'Premium Lounge & Bistro',
      fr: 'Lounge & Bistro Nocturne'
    },
    tagline: {
      en: 'Stay for the atmosphere. Midnight navy, muted bronze',
      fr: 'Prolongez la soirée : bleu nuit, bronze chaleureux et petites assiettes raffinées'
    },
    description: {
      en: 'Sophisticated dark atmosphere with warm muted bronze highlights. Ideal for evening bistros, rooftops, cocktail lounges, and chic tapas venues.',
      fr: 'Ambiance feutrée et nocturne rehaussée de bronze brossé. Idéal pour les rooftops, bars à tapas chic, lounges et dîners tardifs.'
    },
    intendedFor: {
      en: 'Rooftops, Cocktail Lounges, Cigar Bars, Evening Bistros',
      fr: 'Rooftops, Lounges Chic, Bars à Cocktails, Tapas & Bistrots'
    },
    badge: {
      en: 'Lounge & Sunset',
      fr: 'Lounge & Rooftop'
    },
    primaryColor: '#173A4B',
    accentColor: '#6F9F98',
    previewHeroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Featured Sharing Plates', fr: 'Assiettes Signatures à Partager', ar: 'أطباق المشاركة الفاخرة' },
        items: [
          {
            name: { en: 'Truffle & Fontina Flatbread', fr: 'Flatbread Croustillant à la Truffe & Fontina', ar: 'فطيرة الكمأة وجبن الفونتينا' },
            description: { en: 'Crispy artisan flatbread, black truffle paste, melted fontina cheese, wild arugula.', fr: 'Pâte croustillante cuite à haute température, crème de truffe, fontina fondue et pousses de roquette.' },
            price: 68,
            imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=420&auto=format&fit=crop&q=82',
            dietary: 'chef_special',
            isPopular: true
          },
          {
            name: { en: 'Burrata with Caramelized Peaches', fr: 'Burrata Crémeuse & Pêches Caramelisées', ar: 'بوراتا مع الخوخ المكرمل' },
            description: { en: 'Pugliese burrata, grilled spiced peaches, orange blossom honey, toasted pecans.', fr: 'Burrata d’Italie, pêches de saison rôties au miel d’oranger et éclats de noix de pécan.' },
            price: 75,
            imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=420&auto=format&fit=crop&q=82',
            dietary: 'vegetarian',
            isPopular: true
          }
        ]
      },
      {
        name: { en: 'Mains & Midnight Signatures', fr: 'Plats Nobles & Créations du Chef', ar: 'الأطباق الرئيسية المسائية' },
        items: [
          {
            name: { en: 'Glazed Beef Short Rib in Date Molasses', fr: 'Short Rib de Bœuf Braisé au Mélasse de Dattes', ar: 'أضلاع اللحم البقري المطهوة ببطء' },
            description: { en: '12-hour braised beef short rib, date glaze, creamy sweet potato puree, pickled shallots.', fr: 'Bœuf braisé 12h fondant, laqué au mélasse de dattes de Zagora, mousseline de patates douces.' },
            price: 165,
            imageUrl: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=420&auto=format&fit=crop&q=82',
            dietary: 'halal',
            isPopular: true
          }
        ]
      }
    ]
  }
];

/**
 * Backward compatibility helper to look up templates by ID or legacy alias
 */
export function getTemplateById(id: string): MenuTemplateDefinition | undefined {
  if (!id) return undefined;
  
  // Exact match
  const exact = MENU_TEMPLATES.find(t => t.id === id);
  if (exact) return exact;

  // Legacy alias mapping
  const aliases: Record<string, string> = {
    'template_modern_restaurant': 'template_modern_fine_dining',
    'template_minimal_luxury': 'template_modern_fine_dining',
    'template_cafe_coffee': 'template_specialty_coffee',
    'template_fast_food_snack': 'template_burger_fast_food',
  };

  const mappedId = aliases[id];
  if (mappedId) {
    return MENU_TEMPLATES.find(t => t.id === mappedId);
  }

  return undefined;
}
