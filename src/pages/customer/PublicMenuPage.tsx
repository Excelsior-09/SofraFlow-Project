import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, Utensils, AlertCircle } from 'lucide-react';
import { CustomerMenuHeader } from '../../components/customer/CustomerMenuHeader';
import { ProductCard } from '../../components/customer/ProductCard';
import { ProductDetailModal } from '../../components/customer/ProductDetailModal';
import { CartDrawer } from '../../components/customer/CartDrawer';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';
import { supabaseService } from '../../services/supabaseService';
import { Menu, MenuCategory, Product, Restaurant } from '../../types';
import { SEO } from '../../components/common/SEO';

export const PublicMenuPage: React.FC = () => {
  const { restaurantSlug, menuSlug } = useParams<{ restaurantSlug: string; menuSlug?: string }>();
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get('table');

  const { t, formatCurrency } = useLanguage();
  const { totalItemCount, total, setTableNumber, setOrderType, addItem } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');

  // Modals & Drawers
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (!restaurantSlug) return;
    let isMounted = true;

    async function loadPublicData() {
      try {
        const foundRestaurant = await supabaseService.getRestaurantBySlug(restaurantSlug!);
        if (foundRestaurant && isMounted) {
          setRestaurant(foundRestaurant);
          const [allMenus, cats, prods] = await Promise.all([
            supabaseService.getMenusForRestaurant(foundRestaurant.id),
            supabaseService.getCategoriesForRestaurant(foundRestaurant.id),
            supabaseService.getProductsForRestaurant(foundRestaurant.id)
          ]);
          if (isMounted) {
            const targetMenu = menuSlug
              ? allMenus.find(m => m.slug === menuSlug && m.status === 'published')
              : allMenus.find(m => m.isDefault && m.status === 'published') || allMenus[0];

            setMenu(targetMenu || null);
            setCategories(cats);
            setProducts(prods);
            return;
          }
        }
      } catch (err) {
        console.warn('[PublicMenuPage] Supabase load error, fallback to local db:', err);
      }

      // Fallback to local db
      const localRest = db.getRestaurantBySlug(restaurantSlug!);
      if (localRest && isMounted) {
        setRestaurant(localRest);
        const allMenus = db.getMenus(localRest.id);
        const targetMenu = menuSlug
          ? allMenus.find(m => m.slug === menuSlug && m.status === 'published')
          : allMenus.find(m => m.isDefault && m.status === 'published') || allMenus[0];

        setMenu(targetMenu || null);
        setCategories(db.getCategories(localRest.id));
        setProducts(db.getProducts(localRest.id));
      }
    }

    loadPublicData();

    // Sync table query parameter to cart
    if (tableParam) {
      setTableNumber(tableParam);
      setOrderType('dine_in');
    }

    return () => {
      isMounted = false;
    };
  }, [restaurantSlug, menuSlug, tableParam]);

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-soft border border-border-subtle max-w-sm space-y-4">
          <Utensils className="w-10 h-10 text-forest mx-auto" />
          <h2 className="text-xl font-bold text-forest font-display">Établissement introuvable</h2>
          <p className="text-xs text-ink-secondary">
            Le lien "/m/{restaurantSlug}" ne correspond à aucun restaurant actif ou a été modifié.
          </p>
        </div>
      </div>
    );
  }

  // Filter products by menu assignment, category, search, and dietary
  const menuProductIds = menu ? menu.productIds : products.map(p => p.id);
  const visibleProducts = products.filter(p => {
    const isAssigned = menuProductIds.length === 0 || menuProductIds.includes(p.id);
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const titleMatch = t(p.name).toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = t(p.description).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDietary =
      dietaryFilter === 'all' ||
      (dietaryFilter === 'vegetarian' && p.dietaryTags.includes('vegetarian')) ||
      (dietaryFilter === 'halal' && p.dietaryTags.includes('halal')) ||
      (dietaryFilter === 'special' && p.dietaryTags.includes('chef_special'));

    return isAssigned && matchesCategory && (titleMatch || descMatch) && matchesDietary;
  });

  return (
    <div className="min-h-screen bg-ivory pb-28 font-sans">
      <SEO
        title={`${restaurant.name} — Menu Digital & Commande | SOFRAFLOW`}
        description={restaurant.description || `Consultez le menu digital et commandez chez ${restaurant.name} à ${restaurant.city}.`}
        canonical={`/m/${restaurantSlug}`}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Restaurant',
          'name': restaurant.name,
          'description': restaurant.description,
          'telephone': restaurant.phone,
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': restaurant.address,
            'addressLocality': restaurant.city,
            'addressCountry': 'MA'
          },
          'priceRange': 'MAD'
        }}
      />

      {/* Restaurant Header */}
      <CustomerMenuHeader
        restaurant={restaurant}
        tableNumber={tableParam || undefined}
      />

      {/* Sticky Menu Controls & Category Tabs */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border-subtle shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 space-y-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-ink-secondary absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={t('customer.searchDishes')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-ivory/60 border border-border-subtle text-xs focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-forest text-white shadow-soft'
                  : 'bg-ivory text-ink-secondary hover:text-ink-main'
              }`}
            >
              {t('customer.allCategories')} ({products.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-forest text-white shadow-soft'
                    : 'bg-ivory text-ink-secondary hover:text-ink-main'
                }`}
              >
                {t(c.name)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dishes List */}
      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {/* Dietary Filters Pill row */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold text-ink-secondary mr-1">{t('common.filter')} :</span>
          {[
            { id: 'all', label: t('common.all') },
            { id: 'halal', label: t('products.dietaryTags.halal') },
            { id: 'vegetarian', label: t('products.dietaryTags.vegetarian') },
            { id: 'special', label: t('products.dietaryTags.chef_special') }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setDietaryFilter(item.id)}
              className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-colors ${
                dietaryFilter === item.id
                  ? 'bg-forest-light text-forest border border-forest/30'
                  : 'bg-white text-ink-secondary border border-border-subtle hover:bg-ivory'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {visibleProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-border-subtle space-y-2">
            <Utensils className="w-8 h-8 text-ink-secondary/40 mx-auto" />
            <h3 className="font-bold text-forest text-sm">{t('common.noResults')}</h3>
            <p className="text-xs text-ink-secondary">
              Essayez une autre recherche ou sélectionnez une catégorie différente.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories
              .filter(cat => selectedCategory === 'all' || cat.id === selectedCategory)
              .map(cat => {
                const categoryProducts = visibleProducts.filter(p => p.categoryId === cat.id);
                if (categoryProducts.length === 0) return null;

                return (
                  <div key={cat.id} className="space-y-3 pt-2">
                    <div className="border-b border-border-subtle pb-2">
                      <h2 className="text-lg font-bold text-forest font-display">
                        {t(cat.name)}
                      </h2>
                      {cat.description && (
                        <p className="text-xs text-ink-secondary mt-0.5">
                          {t(cat.description)}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {categoryProducts.map(p => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onSelect={setSelectedProductForModal}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </main>

      {/* Floating View Cart Sticky Bar */}
      {totalItemCount > 0 && (
        <div className="fixed bottom-4 inset-x-0 z-40 px-4 max-w-lg mx-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-forest hover:bg-forest-hover text-white rounded-2xl p-4 shadow-elevated flex items-center justify-between transition-all transform active:scale-[0.99] border-2 border-forest-light/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-gold text-forest-dark flex items-center justify-center font-extrabold text-xs">
                {totalItemCount}
              </div>
              <span className="font-bold text-sm">{t('customer.yourOrder')}</span>
            </div>

            <div className="font-extrabold text-base text-gold">
              {formatCurrency(total, restaurant.settings.currency)}
            </div>
          </button>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onAddToCart={addItem}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        restaurant={restaurant}
        availableProducts={products}
      />
    </div>
  );
};
