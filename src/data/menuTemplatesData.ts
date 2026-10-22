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
    previewHeroImage: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Preludes & Raw Bar', fr: 'Préludes & Produits d’Exception', ar: 'المقبلات الفاخرة' },
        items: [
          {
            name: { en: 'Atlantic Sea Bass Carpaccio with Yuzu', fr: 'Carpaccio de Bar Sauvage de Dakhla au Yuzu', ar: 'كارباتشيو سمك القاروص باليوزو' },
            description: { en: 'Thinly sliced wild line-caught sea bass, finger lime pearls, fleur de sel, yuzu vinaigrette.', fr: 'Lamelles de bar de ligne, perles de citron caviar, fleur de sel de Guérande et huile vierge.' },
            price: 110,
            imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          },
          {
            name: { en: 'Pan-Seared Duck Foie Gras', fr: 'Foie Gras de Canard Poêlé & Pain d’Épices', ar: 'كبد البط المحمر' },
            description: { en: 'Artisan duck foie gras, caramelized figs in balsamic, toasted brioche.', fr: 'Escalope de foie gras poêlée, chutney de figues de Taounate et pain d’épices doré.' },
            price: 125,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
            dietary: 'chef_special'
          },
          {
            name: { en: 'Diver Sea Scallops with Brown Butter', fr: 'Noix de Saint-Jacques Rôties au Beurre Noisette', ar: 'إسكالوب البحر المشوي' },
            description: { en: 'Pan-roasted Atlantic scallops, parsnip velvet puree, crispy coral chips, chive oil.', fr: 'Noix de Saint-Jacques dorées, mousseline de panais crémeuse et huile d’herbes fraîches.' },
            price: 130,
            imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop&q=80',
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
            imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80',
            dietary: 'halal',
            isPopular: true
          },
          {
            name: { en: 'Atlantic Turbot with Saffron Beurre Blanc', fr: 'Turbot Rôti & Beurre Blanc au Safran de Taliouine', ar: 'سمك التوربو بصلصة الزعفران' },
            description: { en: 'Wild turbot roasted on bone, saffron emulsion, glazed baby leeks, oscietra caviar.', fr: 'Pavé de turbot doré sur peau, émulsion au safran royal et étuvée de poireaux primeurs.' },
            price: 195,
            imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
            dietary: 'chef_special'
          },
          {
            name: { en: 'Herb-Crusted Rack of Atlas Lamb', fr: 'Carré d’Agneau de l’Atlas en Croûte d’Herbes', ar: 'ضلع الخروف بالأعشاب العطرية' },
            description: { en: 'Roasted pink rack of lamb, rosemary and parsley crust, baby roasted carrots, rich lamb jus.', fr: 'Carré d’agneau rôti rosé, chapelure d’herbes sauvages, carottes glacées et jus corsé au romarin.' },
            price: 185,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
            dietary: 'halal'
          }
        ]
      },
      {
        name: { en: 'Fine Desserts', fr: 'Desserts d’Exception', ar: 'تحليات فاخرة' },
        items: [
          {
            name: { en: 'Valrhona Grand Cru Chocolate Sphere', fr: 'Sphère Chocolat Grand Cru Valrhona & Feuille d’Or', ar: 'كرة الشوكولاتة الفاخرة بالذهب' },
            description: { en: 'Warm chocolate pouring, hazelnut praline heart, vanilla bean gelato, 24k gold leaf.', fr: 'Coque de chocolat noir chaud, cœur praliné croustillant noisettes du Piémont et glace vanille Bourbon.' },
            price: 65,
            imageUrl: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=600&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
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
    previewHeroImage: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=1200&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Moroccan Salads & Briouates', fr: 'Salades Marocaines & Briouates', ar: 'المقبلات والبريوات' },
        items: [
          {
            name: { en: 'Traditional Trio of Moroccan Salads', fr: 'Trio de Salades Traditionnelles de Fès', ar: 'سلطات مغربية ثلاثية' },
            description: { en: 'Smoked Zaalouk, caramelized Taktouka, and spiced sweet carrots with argan oil.', fr: 'Zaalouk fumé, Taktouka confite et carottes mchermla parfumées à l’huile d’argan.' },
            price: 45,
            imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80',
            dietary: 'vegetarian'
          },
          {
            name: { en: 'Crispy Almond & Cheese Briouates', fr: 'Briouates Croustillantes Fromage & Amandes', ar: 'بريوات بالجبن واللوز' },
            description: { en: 'Crispy golden warqa pastry, artisan fresh cheese, toasted almonds, orange honey.', fr: 'Feuilleté croustillant au fromage frais de chèvre, amandes dorées et pointe de miel d’oranger.' },
            price: 52,
            imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          },
          {
            name: { en: 'Royal Chicken Pastilla with Toasted Almonds', fr: 'Pastilla Royale au Poulet Fermier & Amandes Grillées', ar: 'بسطيلة الدجاج واللوز الفاخرة' },
            description: { en: 'Delicate crisp pastry layers filled with saffron shredded chicken, cinnamon and crushed almonds.', fr: 'Feuilletage doré croustillant, effiloché de poulet au safran pur, cannelle et amandes concassées.' },
            price: 75,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
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
            imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80',
            dietary: 'halal',
            isPopular: true
          },
          {
            name: { en: 'Free-Range Chicken Tagine with Preserved Lemon', fr: 'Tajine de Poulet Fermier au Citron Confit', ar: 'طاجين الدجاج البلدي بالحامض المصير' },
            description: { en: 'Farm-raised chicken, purple Meslalla olives, aged lemon peel, saffron sauce.', fr: 'Poulet fermier mijoté au safran pur, olives violettes meslalla et écorces de citron confit.' },
            price: 115,
            imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80',
            dietary: 'halal'
          },
          {
            name: { en: 'Royal Seven-Vegetable Couscous', fr: 'Couscous Royal aux Sept Légumes de l’Atlas', ar: 'الكسكس الملكي بسبع خضار' },
            description: { en: 'Fine hand-rolled semolina, rich vegetable bouillon, lamb, chicken, merguez.', fr: 'Semoule fine beurrée, bouillon parfumé, légumes fondants, agneau et poulet fermier.' },
            price: 140,
            imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80',
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
            imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
            isPopular: true
          },
          {
            name: { en: 'Artisan Gazelle Horns & Fassi Pastries', fr: 'Cornes de Gazelle d’Or & Délices Fassis', ar: 'كعب الغزال وحلويات فاس' },
            description: { en: 'Delicate pastry filled with pure Atlas almond paste, orange blossom water, icing dusting.', fr: 'Pâte fine garnie de pure pâte d’amandes de l’Atlas à la fleur d’oranger distillée.' },
            price: 38,
            imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
            dietary: 'vegetarian'
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
    previewHeroImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Specialty Espresso & Brews', fr: 'Cafés de Spécialité', ar: 'القهوة المختصة' },
        items: [
          {
            name: { en: 'Double Espresso Pure Origin (Ethiopia)', fr: 'Double Espresso Pur Terroir (Éthiopie)', ar: 'إسبريسو إثيوبي فاخر' },
            description: { en: 'Notes of jasmine, bergamot, and sweet citrus with silky crema.', fr: 'Profil floral aux notes de jasmin, bergamote et agrumes doux avec créma veloutée.' },
            price: 24,
            imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
            isPopular: true
          },
          {
            name: { en: 'Taliouine Saffron & Honey Latte', fr: 'Latte au Safran de Taliouine & Miel Pur', ar: 'لاتيه بزعفران تاليوين والعسل' },
            description: { en: 'Double espresso shot, steamed whole milk, natural saffron infusion, organic honey.', fr: 'Double shot d’espresso, lait texturé velouté, infusion de safran pur et miel de fleurs.' },
            price: 36,
            imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          },
          {
            name: { en: 'Cold Brew Single Origin (18h Steeping)', fr: 'Cold Brew Infusion Lente Glacée (18h)', ar: 'كولد برو منقوع 18 ساعة' },
            description: { en: 'Slow cold-extracted coffee served over hand-cut clear ice sphere.', fr: 'Extraction lente à froid pendant 18h, servi sur sphère de glace transparente.' },
            price: 34,
            imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80'
          },
          {
            name: { en: 'Velvet Flat White with Oat Milk', fr: 'Flat White Onctueux au Lait d’Avoine', ar: 'فلات وايت بحليب الشوفان' },
            description: { en: 'Double ristretto, micro-foamed barista oat milk, intricate latte art.', fr: 'Double ristretto extrait à pression constante, micromousse de lait d’avoine et latte art.' },
            price: 32,
            imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80'
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
            imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
            dietary: 'vegetarian',
            isPopular: true
          },
          {
            name: { en: 'Organic Farm Shakshuka with Feta', fr: 'Shakshuka aux Œufs Bio, Tomates Confites & Feta', ar: 'شكشوكة بالبيض العضوي والجبن' },
            description: { en: 'Cast iron skillet with spiced simmered tomatoes, sweet peppers, pasture eggs and creamy feta.', fr: 'Poêlon de fonte mijoté aux tomates confites, poivrons rouges doux, œufs plein air et féta émiettée.' },
            price: 52,
            imageUrl: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&auto=format&fit=crop&q=80',
            dietary: 'vegetarian'
          },
          {
            name: { en: 'Wild Berry & Greek Yogurt Granola Bowl', fr: 'Bowl Granola Maison, Fruits Rouges & Yaourt Grec', ar: 'وعاء الجرانولا والفواكه' },
            description: { en: 'Toasted rolled oats, organic honey, Greek yogurt, fresh raspberries, chia seeds.', fr: 'Granola croustillant aux amandes et miel, yaourt grec onctueux et framboises fraîches.' },
            price: 42,
            imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80',
            dietary: 'vegetarian'
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
    previewHeroImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Signature Smash Burgers', fr: 'Smash Burgers Signatures', ar: 'البرغر المميز' },
        items: [
          {
            name: { en: 'Atlas Double Smash Gourmet Burger', fr: 'Smash Burger Gourmet Double Steak', ar: 'سماش برغر مزدوج فاخر' },
            description: { en: 'Double 100% halal beef patty, smoked gouda, caramelized shallots, harissa mayo.', fr: 'Double steak smashé 100% bœuf halal, gouda fumé, oignons confits et sauce harissa.' },
            price: 78,
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
            dietary: 'halal',
            isPopular: true
          },
          {
            name: { en: 'Crispy Buttermilk Chicken Burger', fr: 'Burger Poulet Croustillant & Cheddar Fondu', ar: 'برغر دجاج مقرمش مع جبنة شيدر' },
            description: { en: 'Crispy fried chicken breast, aged cheddar, tangy pickles, garlic aioli on brioche.', fr: 'Blanc de poulet pané extra croustillant, cheddar affiné, pickles et sauce barbecue.' },
            price: 68,
            imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
            dietary: 'halal'
          },
          {
            name: { en: 'Truffle & Swiss Mushroom Smash', fr: 'Burger Truffe Noire & Champignons Poêlés', ar: 'برغر الكمأة والمشروم' },
            description: { en: 'Double smash patty, melted Swiss Gruyere, sautéed portobello mushrooms, black truffle mayo.', fr: 'Double steak croustillant, fromage suisse fondu, champignons poêlés et mayo à la truffe.' },
            price: 85,
            imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
            dietary: 'halal',
            isPopular: true
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
            imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80',
            dietary: 'halal',
            isPopular: true
          },
          {
            name: { en: 'Loaded Cheddar & Bacon Fries', fr: 'Frites Fraîches Loaded Cheddar & Éclats de Dinde', ar: 'بطاطس مقلية بالشيدر والمقبلات' },
            description: { en: 'Crispy skin-on fries, warm melted cheddar cheese, crispy turkey bacon, jalapenos.', fr: 'Frites croustillantes, sauce cheddar fondue, bacon de dinde fumée et jalapeños.' },
            price: 35,
            imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80'
          },
          {
            name: { en: 'Crispy Buffalo Chicken Tenders (6 pcs)', fr: 'Tenders de Poulet Panés Sauce Buffalo (6 pcs)', ar: 'قطع دجاج كرسبي بصوص بافلو' },
            description: { en: 'Hand-breaded juicy chicken tenders, spicy buffalo glaze, homemade herb ranch dip.', fr: 'Aiguillettes de poulet marinées panées minute, sauce piquante et dip ranch maison.' },
            price: 48,
            imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
            dietary: 'halal'
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
    previewHeroImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Antipasti & Bruschetta', fr: 'Antipasti & Bruschetta', ar: 'المقبلات الإيطالية' },
        items: [
          {
            name: { en: 'Truffle Burrata Pugliese', fr: 'Burrata des Pouilles à la Truffe', ar: 'بوراتا الكمأة الإيطالية' },
            description: { en: 'Fresh 200g burrata, summer black truffle cream, heirloom cherry tomatoes, basil glaze.', fr: 'Burrata crémeuse de 200g, crème de truffe d’été, tomates cerises confites et réduction de balsamique.' },
            price: 75,
            imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80',
            dietary: 'vegetarian',
            isPopular: true
          },
          {
            name: { en: 'Artisan Beef Bresaola Carpaccio', fr: 'Carpaccio de Bresaola & Copeaux de Grana Padano', ar: 'كارباتشيو بريزاولا الإيطالية' },
            description: { en: 'Thinly sliced cured beef, wild arugula, lemon citronette, aged 24-month Grana Padano shavings.', fr: 'Fines tranches de bœuf affiné, pousses de roquette sauvage, citron de Sicile et parmesan AOP.' },
            price: 68,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
            dietary: 'halal'
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
            imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80',
            dietary: 'vegetarian',
            isPopular: true
          },
          {
            name: { en: 'Pizza Diavola Piccante', fr: 'Pizza Diavola Piccante', ar: 'بيتزا ديافولا حارة' },
            description: { en: 'Fiore di latte mozzarella, spicy beef salami, charred red chili flakes, kalamata olives.', fr: 'Mozzarella fiore di latte, spianata de bœuf épicée, piments rouges grillés et olives kalamata.' },
            price: 88,
            imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&auto=format&fit=crop&q=80',
            dietary: 'spicy'
          },
          {
            name: { en: 'Pizza Tartufo e Funghi Selvatici', fr: 'Pizza Crème de Truffe & Champignons des Bois', ar: 'بيتزا الكمأة والمشروم البري' },
            description: { en: 'White base with black truffle paste, sautéed wild mushrooms, fior di latte, thyme, white truffle oil.', fr: 'Base blanche crème de truffe, champignons sauvages rissolés, mozzarella fondante et filet d’huile de truffe.' },
            price: 98,
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
            dietary: 'vegetarian',
            isPopular: true
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
            imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
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
    previewHeroImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Signature Rolls & Nigiri', fr: 'Rolls Signatures & Nigiri', ar: 'لفائف السوشي والنيغيري' },
        items: [
          {
            name: { en: 'Flamed Salmon Dragon Roll (8 pcs)', fr: 'Dragon Roll Saumon Flambé (8 pcs)', ar: 'دراجون رول السلمون المشوي' },
            description: { en: 'Prawn tempura, avocado, flame-seared Norwegian salmon, spicy teriyaki glaze, tobiko.', fr: 'Tempura de crevette, avocat, saumon snacké au chalumeau, sauce teriyaki maison et tobiko.' },
            price: 98,
            imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          },
          {
            name: { en: 'Crispy Prawn & Crab California', fr: 'California Crevette Croustillante & Crabe', ar: 'كاليفورنيا رول كرانشي' },
            description: { en: 'Crispy fried panko prawn, seasoned crab, cucumber, Japanese sesame and spicy mayo.', fr: 'Crevette croustillante panée au panko, crabe assaisonné, concombre et sésame torréfié.' },
            price: 85,
            imageUrl: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&auto=format&fit=crop&q=80'
          },
          {
            name: { en: 'Deluxe Nigiri Moriawase (6 pcs)', fr: 'Plateau Nigiris d’Exception Saumon & Thon Rouge', ar: 'تشكيلة النيغيري الفاخرة' },
            description: { en: 'Premium fresh salmon and bluefin tuna nigiri, brushed with sweet soy and fresh wasabi.', fr: 'Nigiris de saumon d’Écosse et thon rouge de ligne, lustrés au pinceau de sauce soja sucrée.' },
            price: 92,
            imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&auto=format&fit=crop&q=80',
            dietary: 'chef_special'
          }
        ]
      },
      {
        name: { en: 'Wok Specialties & Dim Sum', fr: 'Spécialités Wok & Dim Sum', ar: 'أطباق الووك والديم سوم' },
        items: [
          {
            name: { en: 'Pad Thai with Sautéed Prawns', fr: 'Pad Thaï aux Crevettes & Cacahuètes Croquantes', ar: 'باد تاي بالجمبري' },
            description: { en: 'Rice noodles, jumbo wild prawns, tamarind sauce, bean sprouts, crushed peanuts, lime.', fr: 'Nouilles de riz, crevettes sautées, sauce tamarin aigre-douce, pousses de soja et cacahuètes grillées.' },
            price: 92,
            imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80',
            isPopular: true
          },
          {
            name: { en: 'Tokyo Shoyu Ramen with Chashu', fr: 'Ramen Tokyoïte au Bouillon Shoyu Réconfortant', ar: 'رامن شيو طوكيو' },
            description: { en: 'Hand-pulled ramen noodles, slow-simmered rich broth, marinated egg, nori, bamboo shoots.', fr: 'Bouillon mijoté 12 heures, nouilles fraîches, œuf ajitsuke coulant, pousses de bambou et ciboule.' },
            price: 88,
            imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80'
          },
          {
            name: { en: 'Pan-Fried Chicken Gyozas (6 pcs)', fr: 'Gyozas Croustillants au Poulet & Gingembre', ar: 'فطائر الجيوزا المقرمشة' },
            description: { en: 'Crispy pan-fried dumplings filled with seasoned chicken, cabbage, ginger, scallions, dipping sauce.', fr: 'Raviolis japonais dorés à la vapeur puis grillés, farce au poulet fermier et sauce sésame soja.' },
            price: 52,
            imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80',
            dietary: 'halal'
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
    previewHeroImage: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=1200&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Raw Bar & Starters', fr: 'Banc de l’Écailler & Entrées', ar: 'المقبلات البحرية' },
        items: [
          {
            name: { en: 'Marrakech Spiced Octopus Carpaccio', fr: 'Carpaccio de Poulpe Braisé aux Agrumes', ar: 'كارباتشيو الأخطبوط المتبل' },
            description: { en: 'Tender octopus, citrus vinaigrette, pink peppercorns, capers, micro herbs.', fr: 'Poulpe finement tranché, huile d’olive vierge, perles de pamplemousse et baies roses.' },
            price: 78,
            imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          },
          {
            name: { en: 'Crispy Salt & Pepper Calamari', fr: 'Calamars Sautés Sel & Poivre de Séchouan', ar: 'كلمار مقرمش بالملح والبهارات' },
            description: { en: 'Crispy baby calamari, homemade garlic aioli, charred lemon wedge.', fr: 'Petits encornets dorés, aïoli maison à l’ail doux et citron grillé.' },
            price: 68,
            imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80'
          },
          {
            name: { en: 'Garlic Wild King Prawns with Chili', fr: 'Gambas Sauvages Poêlées à l’Ail & Piment Doux', ar: 'جمبري ملكي مشوي بالثوم' },
            description: { en: 'Sizzling jumbo sea prawns, cold-pressed olive oil, sliced garlic, parsley, crusty bread.', fr: 'Gambas royales saisies minute à la plancha, huile vierge à l’ail doré et piment d’Espelette.' },
            price: 95,
            imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
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
            imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
            dietary: 'halal',
            isPopular: true
          },
          {
            name: { en: 'Atlantic Salmon Steak with Herbs', fr: 'Pavé de Saumon d’Écosse & Sauce Vierge', ar: 'فيليه السلمون بالأعشاب' },
            description: { en: 'Pan-seared salmon fillet, crispy skin, crushed baby potatoes, tomato basil compote.', fr: 'Pavé de saumon croustillant sur peau, concassé de tomates de saison au basilic et huile d’olive.' },
            price: 125,
            imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80'
          },
          {
            name: { en: 'Seafood Saffron Paella Valenciana', fr: 'Poêlon de Riz aux Fruits de Mer & Safran Royal', ar: 'بايلا ثمار البحر بالزعفران' },
            description: { en: 'Bomba rice, mussels, calamari, jumbo shrimp, smoked paprika and saffron broth.', fr: 'Riz bomba safrané, moules de bouchot, calamars tendres, gambas et bouillon iodé mijoté.' },
            price: 145,
            imageUrl: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&auto=format&fit=crop&q=80',
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
    previewHeroImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Pure Butter Viennoiseries', fr: 'Viennoiseries Pur Beurre', ar: 'المخبوزات والكرواسون' },
        items: [
          {
            name: { en: 'Flaky French Butter Croissant', fr: 'Croissant Feuilleté Pur Beurre AOP', ar: 'كرواسون فرنسي بالزبدة الطبيعية' },
            description: { en: 'Traditional laminating with Charentes butter, crisp crust, honeyed honeycomb interior.', fr: 'Feuilletage artisanal croustillant au beurre AOP Charentes, alvéolage parfait.' },
            price: 12,
            imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
            isPopular: true
          },
          {
            name: { en: 'Pain au Chocolat Double Baton', fr: 'Pain au Chocolat Double Barre Valrhona', ar: 'خبز الشوكولاتة فالرونا' },
            description: { en: 'Golden flaky pastry, filled with two sticks of intense Valrhona dark chocolate.', fr: 'Feuilletage croustillant pur beurre garni de deux bâtons de chocolat noir Valrhona.' },
            price: 14,
            imageUrl: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=600&auto=format&fit=crop&q=80',
            isPopular: true
          },
          {
            name: { en: 'Artisan Pistachio & Chocolate Escargot', fr: 'Escargot Roulé Pistache & Pépites de Chocolat', ar: 'حلزونية الفستق والشوكولاتة' },
            description: { en: 'Swirled laminated brioche pastry with Sicilian pistachio paste and chocolate drops.', fr: 'Brioche feuilletée croustillante garnie d’une crème onctueuse de pistache et éclats de cacao.' },
            price: 18,
            imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'
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
            imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=600&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          },
          {
            name: { en: 'Grand Cru Dark Chocolate Éclair', fr: 'Éclair Gourmand Chocolat Noir 70%', ar: 'إكلير الشوكولاتة السوداء' },
            description: { en: 'Crisp choux pastry shell filled with silky Guanaja chocolate cream, mirror cocoa glaze.', fr: 'Pâte à choux pur beurre, crémeux onctueux au chocolat noir 70% et glaçage miroir brillant.' },
            price: 28,
            imageUrl: 'https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&auto=format&fit=crop&q=80'
          },
          {
            name: { en: 'Parisian Macaron Assortment (6 pcs)', fr: 'Coffret de Macarons Parisiens d’Exception (6 pcs)', ar: 'مجموعة الماكرون الباريسي' },
            description: { en: 'Crisp almond shells, creamy ganache flavors: Salted caramel, vanilla, pistachio, raspberry.', fr: 'Coques craquantes aux amandes de Provence, ganaches montées caramel fleur de sel, vanille et framboise.' },
            price: 48,
            imageUrl: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&auto=format&fit=crop&q=80',
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
    previewHeroImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Cold-Pressed Juices & Boosters', fr: 'Jus Pressés à Froid & Éclairs Vitaminés', ar: 'العصائر الطبيعية المنعشة' },
        items: [
          {
            name: { en: 'Green Detox Pure Elixir', fr: 'Élixir Détox Vert (Pomme, Kale, Gingembre)', ar: 'عصير الديتوكس الأخضر' },
            description: { en: 'Cold-pressed green apple, organic Tuscan kale, cucumber, mint, spicy ginger kick.', fr: 'Pomme verte granny smith, kale biologique, concombre de terroir et gingembre frais.' },
            price: 32,
            imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
            dietary: 'vegetarian',
            isPopular: true
          },
          {
            name: { en: 'Atlas Sunshine Citrus Boost', fr: 'Booster Solaire Orange de Berkane & Carotte', ar: 'عصير برتقال بركان مع الجزر' },
            description: { en: 'Sun-ripened Berkane oranges, sweet carrots, fresh turmeric root, lemon squeeze.', fr: 'Oranges douces de Berkane, carottes nouvelles, curcuma frais et pointe de citron vert.' },
            price: 28,
            imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80',
            dietary: 'vegetarian'
          },
          {
            name: { en: 'Pink Dragonfruit & Passion Smoothie', fr: 'Smoothie Pitaya Rose & Fruits de la Passion', ar: 'سموذي فاكهة التنين والباشن فروت' },
            description: { en: 'Pure pink pitaya, organic passionfruit pulp, fresh coconut water, chia seeds.', fr: 'Pitaya rose sauvage, pulpe de fruit de la passion acidulée et eau de coco fraîche.' },
            price: 35,
            imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80',
            dietary: 'vegetarian',
            isPopular: true
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
            imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80',
            dietary: 'vegetarian',
            isPopular: true
          },
          {
            name: { en: 'Fresh Atlantic Salmon & Avocado Poke', fr: 'Poke Bowl Saumon d’Écosse & Avocat Hass', ar: 'بوكي بول السلمون والأفوكادو' },
            description: { en: 'Diced fresh salmon, sushi rice, ripe avocado, edamame beans, wakame, sesame ponzu.', fr: 'Saumon frais mariné au ponzu, riz vinaigré japonais, avocat fondant et edamame croquants.' },
            price: 75,
            imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          },
          {
            name: { en: 'Organic Quinoa & Pomegranate Bowl', fr: 'Salade Santé Quinoa Royal, Avocat & Grenade', ar: 'سلطة الكينوا العضوية والرمان' },
            description: { en: 'Tri-color quinoa, baby spinach, Haas avocado, pomegranate rubies, toasted almonds.', fr: 'Quinoa tricolore, pousses d’épinards tendres, arilles de grenade fraîche et vinaigrette au citron.' },
            price: 48,
            imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
            dietary: 'vegetarian'
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
    previewHeroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    categories: [
      {
        name: { en: 'Featured Sharing Plates', fr: 'Assiettes Signatures à Partager', ar: 'أطباق المشاركة الفاخرة' },
        items: [
          {
            name: { en: 'Truffle & Fontina Flatbread', fr: 'Flatbread Croustillant à la Truffe & Fontina', ar: 'فطيرة الكمأة وجبن الفونتينا' },
            description: { en: 'Crispy artisan flatbread, black truffle paste, melted fontina cheese, wild arugula.', fr: 'Pâte croustillante cuite à haute température, crème de truffe, fontina fondue et pousses de roquette.' },
            price: 68,
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
            dietary: 'chef_special',
            isPopular: true
          },
          {
            name: { en: 'Burrata with Caramelized Peaches', fr: 'Burrata Crémeuse & Pêches Caramelisées', ar: 'بوراتا مع الخوخ المكرمل' },
            description: { en: 'Pugliese burrata, grilled spiced peaches, orange blossom honey, toasted pecans.', fr: 'Burrata d’Italie, pêches de saison rôties au miel d’oranger et éclats de noix de pécan.' },
            price: 75,
            imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80',
            dietary: 'vegetarian',
            isPopular: true
          },
          {
            name: { en: 'Angus Beef Truffle Sliders (3 pcs)', fr: 'Trio de Sliders Bœuf Angus & Emmental Fondu', ar: 'سلايدرز لحم أنغوس مع الكمأة' },
            description: { en: 'Mini brioche buns, aged Angus beef patties, truffle mayonnaise, melted Emmental.', fr: 'Mini pains briochés dorés, bœuf Angus juteux, compotée d’oignons et sauce à la truffe.' },
            price: 78,
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
            dietary: 'halal'
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
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
            dietary: 'halal',
            isPopular: true
          },
          {
            name: { en: 'Pan-Seared Bluefin Tuna Tataki', fr: 'Tataki de Thon Rouge aux Deux Sésames', ar: 'تاتاكي التونا مع السمسم' },
            description: { en: 'Sashimi-grade tuna seared rare, sesame crust, ginger soy reduction, pickled ginger.', fr: 'Cœur de thon rouge mi-cuit en croûte de sésame blanc et noir, réduction soja et gingembre.' },
            price: 135,
            imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
            dietary: 'chef_special'
          },
          {
            name: { en: 'Creamy Morel Mushroom Risotto', fr: 'Risotto Carnaroli aux Morilles Sauvages', ar: 'ريزوتو الفطر البري' },
            description: { en: 'Carnaroli rice cooked in rich stock, braised morel mushrooms, 24-month parmesan, thyme.', fr: 'Riz Carnaroli lié au parmesan 24 mois, morilles sauvages parfumées et beurre d’herbes.' },
            price: 110,
            imageUrl: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=600&auto=format&fit=crop&q=80',
            dietary: 'vegetarian'
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
