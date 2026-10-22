import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define templates inline for standalone script execution
const TEMPLATES = [
  {
    id: 'template_modern_fine_dining',
    name: 'Modern Fine Dining',
    tagline: 'Restrained elegance, generous whitespace & fine dining prestige',
    primaryColor: '#0F2C59',
    accentColor: '#D4AF37',
    hero: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1400&auto=format&fit=crop&q=82',
    font: 'Georgia, serif'
  },
  {
    id: 'template_moroccan_heritage',
    name: 'Moroccan Heritage',
    tagline: 'Warm terracotta tones, refined hierarchy & authentic Moroccan dishes',
    primaryColor: '#B45309',
    accentColor: '#D97706',
    hero: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=1400&auto=format&fit=crop&q=82',
    font: 'Palatino, "Book Antiqua", serif'
  },
  {
    id: 'template_specialty_coffee',
    name: 'Specialty Coffee',
    tagline: 'Editorial beverage listings, specialty espresso, beans & brunch',
    primaryColor: '#38261E',
    accentColor: '#B9794B',
    hero: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&auto=format&fit=crop&q=82',
    font: '"Plus Jakarta Sans", sans-serif'
  },
  {
    id: 'template_burger_fast_food',
    name: 'Burger & Fast Food',
    tagline: 'Bold cards, prominent prices in MAD & high-speed browsing',
    primaryColor: '#DC2626',
    accentColor: '#F59E0B',
    hero: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400&auto=format&fit=crop&q=82',
    font: 'Impact, "Arial Black", sans-serif'
  },
  {
    id: 'template_italian_pizzeria',
    name: 'Italian Pizzeria & Trattoria',
    tagline: 'Wood-fired sourdough pizzas, fresh handcrafted pasta & antipasti',
    primaryColor: '#991B1B',
    accentColor: '#16A34A',
    hero: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1400&auto=format&fit=crop&q=82',
    font: '"Times New Roman", Times, serif'
  },
  {
    id: 'template_asian_sushi_wok',
    name: 'Asian Sushi & Wok',
    tagline: 'Minimalist dark aesthetics, vibrant rolls, bowls & dim sum',
    primaryColor: '#18181B',
    accentColor: '#EF4444',
    hero: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1400&auto=format&fit=crop&q=82',
    font: '"Helvetica Neue", Arial, sans-serif'
  },
  {
    id: 'template_seafood_mediterranean',
    name: 'Seafood & Mediterranean Grill',
    tagline: 'A little more coast. Ocean blue, sea glass & catch of the day',
    primaryColor: '#0E7490',
    accentColor: '#2DD4BF',
    hero: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=1400&auto=format&fit=crop&q=82',
    font: '"Arial Narrow", Arial, sans-serif'
  },
  {
    id: 'template_bakery_patisserie',
    name: 'Bakery & Patisserie',
    tagline: 'Pastel elegance, visual emphasis on sweet creations & pastries',
    primaryColor: '#BE185D',
    accentColor: '#F59E0B',
    hero: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&auto=format&fit=crop&q=82',
    font: 'Didot, Bodoni, serif'
  },
  {
    id: 'template_fresh_juice_healthy_eats',
    name: 'Fresh Juice & Healthy Eats',
    tagline: 'Bright botanical accents, smoothie bowls, cold-pressed juices & salads',
    primaryColor: '#047857',
    accentColor: '#84CC16',
    hero: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1400&auto=format&fit=crop&q=82',
    font: '"Plus Jakarta Sans", system-ui, sans-serif'
  },
  {
    id: 'template_premium_lounge_bistro',
    name: 'Premium Lounge & Bistro',
    tagline: 'Stay for the atmosphere. Midnight navy, muted bronze',
    primaryColor: '#173A4B',
    accentColor: '#6F9F98',
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&auto=format&fit=crop&q=82',
    font: '"Arial Narrow", Arial, sans-serif'
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

  // 2. Generate HTML
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
      <section class="category">
        <h2>Featured plates</h2>
        <div class="items">
          <article class="item">
            <img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=420&auto=format&fit=crop&q=82" alt="Signature Selection" loading="lazy">
            <div class="item-main">
              <div class="item-head">
                <h3>Signature Selection</h3>
                <span class="price">75 MAD</span>
              </div>
              <p>Finely prepared with local ingredients · seasonal chef presentation</p>
              <span class="tag">Popular</span>
            </div>
          </article>
          <article class="item">
            <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=420&auto=format&fit=crop&q=82" alt="House Special" loading="lazy">
            <div class="item-main">
              <div class="item-head">
                <h3>House Special</h3>
                <span class="price">88 MAD</span>
              </div>
              <p>House preparation · served warm with artisan sides</p>
            </div>
          </article>
        </div>
      </section>

      <section class="category">
        <h2>Main courses</h2>
        <div class="items">
          <article class="item">
            <img src="https://images.unsplash.com/photo-1558030006-450675393462?w=420&auto=format&fit=crop&q=82" alt="Prime Plate" loading="lazy">
            <div class="item-main">
              <div class="item-head">
                <h3>Prime Plate</h3>
                <span class="price">135 MAD</span>
              </div>
              <p>Slow roasted to perfection · infused with aromatic herbs</p>
              <span class="tag">Popular</span>
            </div>
          </article>
          <article class="item">
            <img src="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=420&auto=format&fit=crop&q=82" alt="Chef Catch" loading="lazy">
            <div class="item-main">
              <div class="item-head">
                <h3>Chef Catch</h3>
                <span class="price">120 MAD</span>
              </div>
              <p>Fresh catch of the day · extra virgin olive oil and charred lemon</p>
            </div>
          </article>
        </div>
      </section>

      <section class="category">
        <h2>Desserts & Drinks</h2>
        <div class="items">
          <article class="item">
            <img src="https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=420&auto=format&fit=crop&q=82" alt="Sweet Finish" loading="lazy">
            <div class="item-main">
              <div class="item-head">
                <h3>Sweet Finish</h3>
                <span class="price">42 MAD</span>
              </div>
              <p>Handcrafted dessert · served with pure blossom infusion</p>
              <span class="tag">Popular</span>
            </div>
          </article>
        </div>
      </section>
    </div>
  </main>
  <p class="menu-note">Front-end template preview · SofraFlow Platform</p>
  <script src="./template-interactions.js" defer></script>
</body>
</html>`;
  fs.writeFileSync(path.join(targetDir, `${t.id}.html`), htmlContent, 'utf-8');
});

console.log('Successfully generated all 10 standalone templates in public/templates');
