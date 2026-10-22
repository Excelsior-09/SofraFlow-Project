import fs from 'fs';
import path from 'path';

const TEMPLATES = [
  {
    id: 'template_modern_fine_dining',
    name: 'Modern Fine Dining',
    tagline: 'Restrained elegance, generous whitespace & fine dining prestige',
    primaryColor: '#0F2C59',
    accentColor: '#D4AF37',
    hero: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1400&auto=format&fit=crop&q=82',
    font: 'Georgia, serif',
    categories: [
      {
        name: 'Preludes & Raw Bar',
        items: [
          {
            title: 'Atlantic Sea Bass Carpaccio with Yuzu',
            desc: 'Thinly sliced wild line-caught sea bass, finger lime pearls, fleur de sel, yuzu vinaigrette.',
            price: 110,
            tag: 'Chef Special',
            img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Pan-Seared Duck Foie Gras',
            desc: 'Artisan duck foie gras, caramelized figs in balsamic, toasted brioche.',
            price: 125,
            tag: 'Popular',
            img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Diver Sea Scallops with Brown Butter',
            desc: 'Pan-roasted Atlantic scallops, parsnip velvet puree, crispy coral chips, chive oil.',
            price: 130,
            tag: 'Signature',
            img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop&q=80'
          }
        ]
      },
      {
        name: 'Grand Courses',
        items: [
          {
            title: 'Beef Tenderloin Rossini with Black Truffle',
            desc: 'Prime aged beef tenderloin, pan-seared foie gras, shaved seasonal black truffles, mousseline.',
            price: 210,
            tag: 'Signature',
            img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Atlantic Turbot with Saffron Beurre Blanc',
            desc: 'Wild turbot roasted on bone, saffron emulsion, glazed baby leeks, oscietra caviar.',
            price: 195,
            tag: 'Chef Special',
            img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Herb-Crusted Rack of Atlas Lamb',
            desc: 'Roasted pink rack of lamb, rosemary and parsley crust, baby roasted carrots, rich lamb jus.',
            price: 185,
            tag: 'Popular',
            img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
          }
        ]
      }
    ]
  },
  {
    id: 'template_moroccan_heritage',
    name: 'Moroccan Heritage',
    tagline: 'Warm terracotta tones, refined hierarchy & authentic Moroccan dishes',
    primaryColor: '#B45309',
    accentColor: '#D97706',
    hero: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=1400&auto=format&fit=crop&q=82',
    font: 'Palatino, "Book Antiqua", serif',
    categories: [
      {
        name: 'Salades & Briouates',
        items: [
          {
            title: 'Trio de Salades Traditionnelles de Fès',
            desc: 'Zaalouk fumé, Taktouka confite et carottes mchermla parfumées à l’huile d’argan.',
            price: 45,
            tag: 'Végétarien',
            img: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Pastilla Royale au Poulet & Amandes',
            desc: 'Feuilletage doré croustillant, effiloché de poulet au safran pur, cannelle et amandes concassées.',
            price: 75,
            tag: 'Signature',
            img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
          }
        ]
      },
      {
        name: 'Tajines & Couscous',
        items: [
          {
            title: 'Tajine d’Agneau aux Pruneaux & Amandes',
            desc: 'Agneau mijoté doucement aux épices douces, pruneaux confits, amandes et sésame grillé.',
            price: 135,
            tag: 'Populaire',
            img: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Tajine de Poulet Fermier au Citron Confit',
            desc: 'Poulet fermier mijoté au safran pur, olives violettes meslalla et écorces de citron confit.',
            price: 115,
            tag: 'Halal',
            img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Couscous Royal aux Sept Légumes',
            desc: 'Semoule fine beurrée, bouillon parfumé, légumes fondants, agneau et poulet fermier.',
            price: 140,
            tag: 'Signature',
            img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80'
          }
        ]
      }
    ]
  },
  {
    id: 'template_specialty_coffee',
    name: 'Specialty Coffee',
    tagline: 'Editorial beverage listings, specialty espresso, beans & brunch',
    primaryColor: '#38261E',
    accentColor: '#B9794B',
    hero: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&auto=format&fit=crop&q=82',
    font: '"Plus Jakarta Sans", sans-serif',
    categories: [
      {
        name: 'Specialty Espresso & Brews',
        items: [
          {
            title: 'Double Espresso Pure Origin (Ethiopia)',
            desc: 'Notes of jasmine, bergamot, and sweet citrus with silky crema.',
            price: 24,
            tag: 'Popular',
            img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Taliouine Saffron & Honey Latte',
            desc: 'Double espresso shot, steamed whole milk, natural saffron infusion, organic honey.',
            price: 36,
            tag: 'Signature',
            img: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Cold Brew Single Origin (18h Steeping)',
            desc: 'Slow cold-extracted coffee served over hand-cut clear ice sphere.',
            price: 34,
            tag: 'Craft',
            img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80'
          }
        ]
      },
      {
        name: 'Brunch & Artisanal Toasts',
        items: [
          {
            title: 'Sourdough Avocado & Poached Egg Toast',
            desc: 'Artisan sourdough, whipped avocado, organic poached egg, pomegranate molasses.',
            price: 58,
            tag: 'Popular',
            img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Organic Farm Shakshuka with Feta',
            desc: 'Cast iron skillet with spiced simmered tomatoes, sweet peppers, pasture eggs and creamy feta.',
            price: 52,
            tag: 'Vegetarian',
            img: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&auto=format&fit=crop&q=80'
          }
        ]
      }
    ]
  },
  {
    id: 'template_burger_fast_food',
    name: 'Burger & Fast Food',
    tagline: 'Bold cards, prominent prices in MAD & high-speed browsing',
    primaryColor: '#DC2626',
    accentColor: '#F59E0B',
    hero: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400&auto=format&fit=crop&q=82',
    font: 'Impact, "Arial Black", sans-serif',
    categories: [
      {
        name: 'Signature Smash Burgers',
        items: [
          {
            title: 'Atlas Double Smash Gourmet Burger',
            desc: 'Double 100% halal beef patty, smoked gouda, caramelized shallots, harissa mayo.',
            price: 78,
            tag: 'Bestseller',
            img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Crispy Buttermilk Chicken Burger',
            desc: 'Crispy fried chicken breast, aged cheddar, tangy pickles, garlic aioli on brioche.',
            price: 68,
            tag: 'Popular',
            img: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Truffle & Swiss Mushroom Smash',
            desc: 'Double smash patty, melted Swiss Gruyere, sautéed portobello mushrooms, black truffle mayo.',
            price: 85,
            tag: 'Signature',
            img: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80'
          }
        ]
      },
      {
        name: 'Tacos & Loaded Sides',
        items: [
          {
            title: 'French Tacos 2 Meats Gratiné',
            desc: 'Minced beef, marinated chicken, signature cheese sauce, french fries inside.',
            price: 62,
            tag: 'Popular',
            img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Loaded Cheddar & Bacon Fries',
            desc: 'Crispy skin-on fries, warm melted cheddar cheese, crispy turkey bacon, jalapenos.',
            price: 35,
            tag: 'Loaded',
            img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80'
          }
        ]
      }
    ]
  },
  {
    id: 'template_italian_pizzeria',
    name: 'Italian Pizzeria & Trattoria',
    tagline: 'Wood-fired sourdough pizzas, fresh handcrafted pasta & antipasti',
    primaryColor: '#991B1B',
    accentColor: '#16A34A',
    hero: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1400&auto=format&fit=crop&q=82',
    font: '"Times New Roman", Times, serif',
    categories: [
      {
        name: 'Antipasti & Bruschetta',
        items: [
          {
            title: 'Truffle Burrata Pugliese',
            desc: 'Fresh 200g burrata, summer black truffle cream, heirloom cherry tomatoes, basil glaze.',
            price: 75,
            tag: 'Popular',
            img: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80'
          }
        ]
      },
      {
        name: 'Wood-Fired Sourdough Pizzas',
        items: [
          {
            title: 'Pizza Margherita Di Bufala DOP',
            desc: 'San Marzano tomato sauce, mozzarella di bufala Campana, fresh basil leaves, extra virgin olive oil.',
            price: 78,
            tag: 'Classic',
            img: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Pizza Diavola Piccante',
            desc: 'Fiore di latte mozzarella, spicy beef salami, charred red chili flakes, kalamata olives.',
            price: 88,
            tag: 'Spicy',
            img: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Pizza Tartufo e Funghi Selvatici',
            desc: 'White base with black truffle paste, sautéed wild mushrooms, fior di latte, white truffle oil.',
            price: 98,
            tag: 'Signature',
            img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80'
          }
        ]
      },
      {
        name: 'Dolci Tradizionali',
        items: [
          {
            title: 'Traditional Savoiardi Tiramisu',
            desc: 'Savoiardi ladyfingers soaked in dark espresso, creamy mascarpone cream, Dutch cocoa powder.',
            price: 45,
            tag: 'Popular',
            img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80'
          }
        ]
      }
    ]
  },
  {
    id: 'template_asian_sushi_wok',
    name: 'Asian Sushi & Wok',
    tagline: 'Minimalist dark aesthetics, vibrant rolls, bowls & dim sum',
    primaryColor: '#18181B',
    accentColor: '#EF4444',
    hero: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1400&auto=format&fit=crop&q=82',
    font: '"Helvetica Neue", Arial, sans-serif',
    categories: [
      {
        name: 'Signature Rolls & Nigiri',
        items: [
          {
            title: 'Flamed Salmon Dragon Roll (8 pcs)',
            desc: 'Prawn tempura, avocado, flame-seared Norwegian salmon, spicy teriyaki glaze, tobiko.',
            price: 98,
            tag: 'Chef Special',
            img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Crispy Prawn & Crab California',
            desc: 'Crispy fried panko prawn, seasoned crab, cucumber, Japanese sesame and spicy mayo.',
            price: 85,
            tag: 'Popular',
            img: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Deluxe Nigiri Moriawase (6 pcs)',
            desc: 'Premium fresh salmon and bluefin tuna nigiri, brushed with sweet soy and fresh wasabi.',
            price: 92,
            tag: 'Signature',
            img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&auto=format&fit=crop&q=80'
          }
        ]
      },
      {
        name: 'Wok Specialties & Dim Sum',
        items: [
          {
            title: 'Pad Thai with Sautéed Prawns',
            desc: 'Rice noodles, jumbo wild prawns, tamarind sauce, bean sprouts, crushed peanuts, lime.',
            price: 92,
            tag: 'Popular',
            img: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Pan-Fried Chicken Gyozas (6 pcs)',
            desc: 'Crispy pan-fried dumplings filled with seasoned chicken, cabbage, ginger, scallions.',
            price: 52,
            tag: 'Halal',
            img: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80'
          }
        ]
      }
    ]
  },
  {
    id: 'template_seafood_mediterranean',
    name: 'Seafood & Mediterranean Grill',
    tagline: 'A little more coast. Ocean blue, sea glass & catch of the day',
    primaryColor: '#0E7490',
    accentColor: '#2DD4BF',
    hero: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=1400&auto=format&fit=crop&q=82',
    font: '"Arial Narrow", Arial, sans-serif',
    categories: [
      {
        name: 'Raw Bar & Starters',
        items: [
          {
            title: 'Marrakech Spiced Octopus Carpaccio',
            desc: 'Tender octopus, citrus vinaigrette, pink peppercorns, capers, micro herbs.',
            price: 78,
            tag: 'Popular',
            img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Crispy Salt & Pepper Calamari',
            desc: 'Crispy baby calamari, homemade garlic aioli, charred lemon wedge.',
            price: 68,
            tag: 'Favorite',
            img: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80'
          }
        ]
      },
      {
        name: 'Catch of the Day & Grills',
        items: [
          {
            title: 'Whole Sea Bass with Herb Oil',
            desc: 'Line-caught whole sea bass grilled over wood charcoal, infused herb oil, seasonal potatoes.',
            price: 135,
            tag: 'Signature',
            img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Atlantic Salmon Steak with Herbs',
            desc: 'Pan-seared salmon fillet, crispy skin, crushed baby potatoes, tomato basil compote.',
            price: 125,
            tag: 'Popular',
            img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80'
          }
        ]
      }
    ]
  },
  {
    id: 'template_bakery_patisserie',
    name: 'Bakery & Patisserie',
    tagline: 'Pastel elegance, visual emphasis on sweet creations & pastries',
    primaryColor: '#BE185D',
    accentColor: '#F59E0B',
    hero: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&auto=format&fit=crop&q=82',
    font: 'Didot, Bodoni, serif',
    categories: [
      {
        name: 'Pure Butter Viennoiseries',
        items: [
          {
            title: 'Flaky French Butter Croissant',
            desc: 'Traditional laminating with Charentes butter, crisp crust, honeyed honeycomb interior.',
            price: 12,
            tag: 'Classic',
            img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Pain au Chocolat Double Baton',
            desc: 'Golden flaky pastry, filled with two sticks of intense Valrhona dark chocolate.',
            price: 14,
            tag: 'Popular',
            img: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=600&auto=format&fit=crop&q=80'
          }
        ]
      },
      {
        name: 'Fine Pastry Creations',
        items: [
          {
            title: 'Fresh Raspberry & Pistachio Tartlet',
            desc: 'Sweet almond sable tart, Sicilian pistachio frangipane, fresh raspberries, coulis.',
            price: 38,
            tag: 'Signature',
            img: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Grand Cru Dark Chocolate Éclair',
            desc: 'Crisp choux pastry shell filled with silky Guanaja chocolate cream, mirror cocoa glaze.',
            price: 28,
            tag: 'Popular',
            img: 'https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&auto=format&fit=crop&q=80'
          }
        ]
      }
    ]
  },
  {
    id: 'template_fresh_juice_healthy_eats',
    name: 'Fresh Juice & Healthy Eats',
    tagline: 'Bright botanical accents, smoothie bowls, cold-pressed juices & salads',
    primaryColor: '#047857',
    accentColor: '#84CC16',
    hero: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1400&auto=format&fit=crop&q=82',
    font: '"Plus Jakarta Sans", system-ui, sans-serif',
    categories: [
      {
        name: 'Cold-Pressed Juices & Boosters',
        items: [
          {
            title: 'Green Detox Pure Elixir',
            desc: 'Cold-pressed green apple, organic Tuscan kale, cucumber, mint, spicy ginger kick.',
            price: 32,
            tag: 'Organic',
            img: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Atlas Sunshine Citrus Boost',
            desc: 'Sun-ripened Berkane oranges, sweet carrots, fresh turmeric root, lemon squeeze.',
            price: 28,
            tag: 'Fresh',
            img: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80'
          }
        ]
      },
      {
        name: 'Superfood Bowls & Fresh Salads',
        items: [
          {
            title: 'Amazonian Acai Energy Bowl',
            desc: 'Frozen pure organic acai puree, almond milk base, banana slices, chia seeds, raw honey.',
            price: 55,
            tag: 'Popular',
            img: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Fresh Atlantic Salmon & Avocado Poke',
            desc: 'Diced fresh salmon, sushi rice, ripe avocado, edamame beans, wakame, sesame ponzu.',
            price: 75,
            tag: 'Signature',
            img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
          }
        ]
      }
    ]
  },
  {
    id: 'template_premium_lounge_bistro',
    name: 'Premium Lounge & Bistro',
    tagline: 'Stay for the atmosphere. Midnight navy, muted bronze',
    primaryColor: '#173A4B',
    accentColor: '#6F9F98',
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&auto=format&fit=crop&q=82',
    font: '"Arial Narrow", Arial, sans-serif',
    categories: [
      {
        name: 'Featured Sharing Plates',
        items: [
          {
            title: 'Truffle & Fontina Flatbread',
            desc: 'Crispy artisan flatbread, black truffle paste, melted fontina cheese, wild arugula.',
            price: 68,
            tag: 'Signature',
            img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Burrata with Caramelized Peaches',
            desc: 'Pugliese burrata, grilled spiced peaches, orange blossom honey, toasted pecans.',
            price: 75,
            tag: 'Popular',
            img: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80'
          }
        ]
      },
      {
        name: 'Mains & Midnight Signatures',
        items: [
          {
            title: 'Glazed Beef Short Rib in Date Molasses',
            desc: '12-hour braised beef short rib, date glaze, creamy sweet potato puree, pickled shallots.',
            price: 165,
            tag: 'Signature',
            img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
          },
          {
            title: 'Pan-Seared Bluefin Tuna Tataki',
            desc: 'Sashimi-grade tuna seared rare, sesame crust, ginger soy reduction, pickled ginger.',
            price: 135,
            tag: 'Chef Special',
            img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80'
          }
        ]
      }
    ]
  }
];

const targetDir = path.resolve(process.cwd(), 'public', 'templates');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

TEMPLATES.forEach(t => {
  // 1. Generate CSS
  const cssContent = `:root {
  --primary: ${t.primaryColor};
  --accent: ${t.accentColor};
  --hero: url("${t.hero}");
}
.menu-hero {
  border-bottom: 7px solid var(--accent);
}
.menu-hero h1 {
  font-family: ${t.font};
  font-weight: 800;
}
.item {
  border-radius: var(--radius);
}
`;
  fs.writeFileSync(path.join(targetDir, `${t.id}.css`), cssContent, 'utf-8');

  // 2. Generate HTML with rich cuisine-specific dishes and mouthwatering images
  const categoriesHtml = t.categories.map(cat => `
      <section class="category">
        <h2>${cat.name}</h2>
        <div class="items">
          ${cat.items.map(item => `
          <article class="item">
            <img src="${item.img}" alt="${item.title}" loading="lazy">
            <div class="item-main">
              <div class="item-head">
                <h3>${item.title}</h3>
                <span class="price">${item.price} MAD</span>
              </div>
              <p>${item.desc}</p>
              ${item.tag ? `<span class="tag">${item.tag}</span>` : ''}
            </div>
          </article>`).join('\n')}
        </div>
      </section>`).join('\n');

  const htmlContent = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${t.name} — SofraFlow digital menu template">
  <title>${t.name} — SofraFlow Template</title>
  <link rel="stylesheet" href="template-shared.css">
  <link rel="stylesheet" href="${t.id}.css">
</head>
<body>
  <main class="menu-shell" data-sofraflow-menu data-template-id="${t.id}">
    <header class="menu-hero">
      <div class="brand-row">
        <span class="monogram">SF</span>
        <span class="brand-meta">Maison Noura · Marrakech</span>
      </div>
      <div>
        <h1>${t.name}</h1>
        <p>${t.tagline}</p>
        <div class="hero-meta">
          <span>Digital menu preview · SofraFlow</span>
          <span>Open today · 12:00—23:30</span>
        </div>
      </div>
    </header>
    <div class="menu-body">
      ${categoriesHtml}
    </div>
  </main>
  <p class="menu-note">Front-end template preview · SofraFlow Platform</p>
  <script src="./template-interactions.js" defer></script>
</body>
</html>`;
  fs.writeFileSync(path.join(targetDir, `${t.id}.html`), htmlContent, 'utf-8');
});

console.log('Successfully generated all 10 standalone templates in public/templates with authentic dishes and images');
