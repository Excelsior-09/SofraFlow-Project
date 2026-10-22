import React, { useState, useEffect, useMemo } from 'react';
import { MenuTemplateDefinition, TemplateCategory, TemplateDishItem } from '../../data/menuTemplatesData';
import { Restaurant, Menu, FoodLanguageCode } from '../../types';
import { X, Search, ShoppingBag, Plus, Minus, ArrowRight, Check, Heart, Sparkles, AlertCircle } from 'lucide-react';

interface SofraFlowTemplateRendererProps {
  template: MenuTemplateDefinition;
  restaurant?: Restaurant | null;
  menu?: Menu | null;
  locale?: FoodLanguageCode;
  previewMode?: boolean;
  onDishAdd?: (item: any) => void;
  onTemplateSelect?: (templateId: string) => void;
  onCheckout?: (cart: any[]) => void;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

const getLocalized = (
  obj?: { en: string; fr: string; ar?: string },
  lang: FoodLanguageCode = 'en'
): string => {
  if (!obj) return '';
  if (lang === 'ar' && obj.ar) return obj.ar;
  if (lang === 'en' && obj.en) return obj.en;
  if (lang === 'fr' && obj.fr) return obj.fr;
  return obj.en || obj.fr || obj.ar || '';
};

export const SofraFlowTemplateRenderer: React.FC<SofraFlowTemplateRendererProps> = ({
  template,
  restaurant,
  menu,
  locale: initialLocale = 'en',
  previewMode = false,
  onDishAdd,
  onTemplateSelect,
  onCheckout
}) => {
  const [currentLocale, setCurrentLocale] = useState<FoodLanguageCode>(initialLocale);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<TemplateDishItem | null>(null);

  useEffect(() => {
    setCurrentLocale(initialLocale);
  }, [initialLocale]);

  const isRtl = currentLocale === 'ar';

  const copy = useMemo(() => {
    if (currentLocale === 'fr') {
      return {
        search: 'Rechercher un plat...',
        all: 'Tout',
        cart: 'Votre commande',
        empty: 'Votre panier est vide.',
        subtotal: 'Sous-total',
        add: 'Ajouter',
        close: 'Fermer',
        order: 'Continuer la commande',
        noResults: 'Aucun plat trouvé.',
        popular: 'Populaire',
        previewBadge: 'Aperçu Interactif',
        openHours: 'Ouvert aujourd’hui · 12:00 — 23:30',
        useTemplate: 'Utiliser ce modèle',
        chefSpecial: 'Signature du Chef',
        halal: 'Halal Certifié',
        vegetarian: 'Végétarien',
        spicy: 'Épicé'
      };
    }
    if (currentLocale === 'ar') {
      return {
        search: 'ابحث عن طبق...',
        all: 'الكل',
        cart: 'طلبك',
        empty: 'سلة الطلب فارغة.',
        subtotal: 'المجموع الفرعي',
        add: 'أضف إلى الطلب',
        close: 'إغلاق',
        order: 'متابعة الطلب',
        noResults: 'لم يتم العثور على أطباق.',
        popular: 'الأكثر طلباً',
        previewBadge: 'معاينة القالب',
        openHours: 'مفتوح اليوم · 12:00 — 23:30',
        useTemplate: 'استخدم هذا القالب',
        chefSpecial: 'طبق الشيف',
        halal: 'حلال',
        vegetarian: 'نباتي',
        spicy: 'حار'
      };
    }
    return {
      search: 'Search the menu...',
      all: 'All',
      cart: 'Your order',
      empty: 'Your cart is empty.',
      subtotal: 'Subtotal',
      add: 'Add to order',
      close: 'Close',
      order: 'Continue to order',
      noResults: 'No dishes found.',
      popular: 'Popular',
      previewBadge: 'Interactive Preview',
      openHours: 'Open today · 12:00 — 23:30',
      useTemplate: 'Use this template',
      chefSpecial: 'Chef Special',
      halal: 'Halal Certified',
      vegetarian: 'Vegetarian',
      spicy: 'Spicy'
    };
  }, [currentLocale]);

  const displayName = restaurant?.name || getLocalized(template.name, currentLocale);
  const displayTagline = restaurant?.description || getLocalized(template.tagline, currentLocale);
  const heroImage = restaurant?.coverImageUrl || template.previewHeroImage;
  const monogram = displayName.slice(0, 2).toUpperCase();

  const categories = template.categories;

  // Filter items
  const filteredCategories = useMemo(() => {
    return categories
      .map(category => {
        const catName = getLocalized(category.name, currentLocale);
        const matchesCategorySelection = selectedCategory === 'all' || catName === selectedCategory;
        if (!matchesCategorySelection) return null;

        const matchingItems = category.items.filter(item => {
          const name = getLocalized(item.name, currentLocale).toLowerCase();
          const desc = getLocalized(item.description, currentLocale).toLowerCase();
          const query = searchQuery.toLowerCase().trim();
          return !query || name.includes(query) || desc.includes(query);
        });

        if (matchingItems.length === 0) return null;
        return {
          ...category,
          items: matchingItems
        };
      })
      .filter(Boolean) as TemplateCategory[];
  }, [categories, currentLocale, selectedCategory, searchQuery]);

  const handleAddToCart = (dish: TemplateDishItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const dishName = dish.name[currentLocale] || dish.name.fr || dish.name.en;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === dishName);
      if (existing) {
        return prev.map(item => item.id === dishName ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        id: dishName,
        name: dishName,
        price: dish.price,
        quantity: 1,
        imageUrl: dish.imageUrl
      }];
    });

    if (onDishAdd) {
      onDishAdd({
        name: dishName,
        price: dish.price,
        imageUrl: dish.imageUrl
      });
    }

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const cartTotal = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const totalItemCount = cart.reduce((sum, it) => sum + it.quantity, 0);

  const handleCheckoutClick = () => {
    if (onCheckout) {
      onCheckout(cart);
    } else {
      window.dispatchEvent(new CustomEvent('sofraflow:checkout', { detail: cart }));
    }
  };

  return (
    <div
      data-sofraflow-menu
      data-template-id={template.id}
      dir={isRtl ? 'rtl' : 'ltr'}
      lang={currentLocale}
      className="sofraflow-template-root w-full bg-[var(--paper)] text-[var(--ink)] font-sans transition-all duration-300 relative selection:bg-[var(--accent)] selection:text-white"
      style={{
        ['--primary' as any]: template.primaryColor,
        ['--accent' as any]: template.accentColor,
        ['--hero' as any]: `url("${heroImage}")`,
        ['--surface' as any]: '#ffffff',
        ['--paper' as any]: '#FAF8F5',
        ['--line' as any]: 'rgba(0, 0, 0, 0.08)',
        ['--ink' as any]: '#111827',
        ['--muted' as any]: '#6B7280',
        ['--radius' as any]: '16px'
      }}
    >
      <main className="menu-shell max-w-4xl mx-auto bg-white min-h-screen shadow-xl relative overflow-hidden flex flex-col justify-between">
        <div>
          {/* Menu Hero Header */}
          <header className="menu-hero relative px-6 py-12 sm:py-16 text-white overflow-hidden bg-gradient-to-b from-black/60 via-black/40 to-black/80">
            <div
              className="absolute inset-0 bg-cover bg-center -z-10 transform scale-105 transition-transform duration-700"
              style={{ backgroundImage: `url("${heroImage}")` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent -z-10" />

            <div className="relative z-10 space-y-4">
              <div className="brand-row flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="monogram w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-lg"
                    style={{ backgroundColor: template.accentColor }}
                  >
                    {monogram}
                  </span>
                  <div>
                    <span className="brand-meta text-xs sm:text-sm font-bold tracking-wide text-white/90">
                      {displayName}
                    </span>
                    <span className="block text-[11px] text-white/70">
                      {restaurant?.city || 'Morocco'}
                    </span>
                  </div>
                </div>

                {previewMode && onTemplateSelect && (
                  <button
                    type="button"
                    onClick={() => onTemplateSelect(template.id)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/25 transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{copy.useTemplate}</span>
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
                  {displayName}
                </h1>
                <p className="text-xs sm:text-sm text-white/85 max-w-xl leading-relaxed">
                  {displayTagline}
                </p>
              </div>

              <div className="hero-meta flex flex-wrap items-center gap-4 text-[11px] font-semibold text-white/80 pt-1">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{copy.openHours}</span>
                </span>
                <span>•</span>
                <span>{getLocalized(template.badge, currentLocale)}</span>
              </div>
            </div>
          </header>

          {/* Menu Body */}
          <div className="menu-body p-4 sm:p-8 space-y-8">
            {/* Interactive Toolbar */}
            <div className="sf-menu-toolbar p-4 rounded-2xl border border-black/8 bg-slate-50/80 dark:bg-slate-900/40 backdrop-blur-sm space-y-3.5 shadow-sm">
              <div className="sf-toolbar-top flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                  <input
                    type="search"
                    data-sf-search
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={copy.search}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-black/10 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                {/* Cart Button */}
                <button
                  type="button"
                  data-sf-open-cart
                  onClick={() => setIsCartOpen(true)}
                  className="px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all transform active:scale-95"
                  style={{ backgroundColor: template.primaryColor }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="sf-cart-label">{copy.cart}</span>
                  <b
                    data-sf-cart-count
                    className="min-w-5 h-5 px-1.5 rounded-full text-[10px] flex items-center justify-center font-black"
                    style={{ backgroundColor: template.accentColor, color: '#ffffff' }}
                  >
                    {totalItemCount}
                  </b>
                </button>
              </div>

              {/* Category Nav */}
              <div className="sf-category-nav flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === 'all'
                      ? 'text-white shadow-sm'
                      : 'bg-white border border-black/10 text-slate-600 hover:bg-slate-100'
                  }`}
                  style={selectedCategory === 'all' ? { backgroundColor: template.accentColor } : {}}
                >
                  {copy.all}
                </button>
                {categories.map((cat, idx) => {
                  const catTitle = cat.name[currentLocale] || cat.name.fr || cat.name.en;
                  const isActive = selectedCategory === catTitle;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedCategory(catTitle)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                        isActive
                          ? 'text-white shadow-sm'
                          : 'bg-white border border-black/10 text-slate-600 hover:bg-slate-100'
                      }`}
                      style={isActive ? { backgroundColor: template.accentColor } : {}}
                    >
                      {catTitle}
                    </button>
                  );
                })}
              </div>

              {/* Toolbar Bottom: Locale Switcher & Demo Badge */}
              <div className="sf-toolbar-bottom flex items-center justify-between text-xs pt-1 border-t border-black/5">
                <div className="sf-locale-switcher flex items-center gap-1.5" role="group" aria-label="Language">
                  {(['en', 'fr', 'ar'] as FoodLanguageCode[]).map(l => (
                    <button
                      key={l}
                      type="button"
                      data-sf-locale={l}
                      onClick={() => setCurrentLocale(l)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                        currentLocale === l
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 bg-transparent'
                      }`}
                    >
                      {l === 'ar' ? 'عربي' : l.toUpperCase()}
                    </button>
                  ))}
                </div>

                <span className="sf-demo-note text-[11px] text-slate-400 font-medium">
                  {copy.previewBadge} • SofraFlow
                </span>
              </div>
            </div>

            {/* Categories & Dish Items */}
            {filteredCategories.length === 0 ? (
              <div className="sf-empty-results text-center py-16 text-slate-400 text-xs">
                {copy.noResults}
              </div>
            ) : (
              filteredCategories.map((category, catIdx) => {
                const categoryTitle = category.name[currentLocale] || category.name.fr || category.name.en;
                return (
                  <section key={catIdx} className="category space-y-4">
                    <h2
                      className="text-lg sm:text-xl font-black font-display pb-1.5 inline-block border-b-2"
                      style={{ color: template.primaryColor, borderColor: template.accentColor }}
                    >
                      {categoryTitle}
                    </h2>

                    <div className="items grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {category.items.map((dish, dishIdx) => {
                        const dishTitle = getLocalized(dish.name, currentLocale);
                        const dishDesc = getLocalized(dish.description, currentLocale);

                        return (
                          <article
                            key={dishIdx}
                            className="item group rounded-2xl border border-black/8 bg-white hover:shadow-md transition-all overflow-hidden flex flex-col justify-between cursor-pointer"
                            onClick={() => setSelectedDish(dish)}
                          >
                            {dish.imageUrl && (
                              <div className="relative h-44 overflow-hidden bg-slate-100">
                                <img
                                  src={dish.imageUrl}
                                  alt={dishTitle}
                                  loading="lazy"
                                  onError={(e: any) => {
                                    e.target.style.display = 'none';
                                  }}
                                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                                />
                                {dish.isPopular && (
                                  <span
                                    className="tag absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-sm"
                                    style={{ backgroundColor: template.accentColor }}
                                  >
                                    {copy.popular}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="item-main p-4 flex-1 flex flex-col justify-between space-y-3">
                              <div className="space-y-1">
                                <div className="item-head flex items-baseline justify-between gap-2">
                                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-[var(--accent)] transition-colors">
                                    {dishTitle}
                                  </h3>
                                  <span
                                    className="price text-sm font-black whitespace-nowrap"
                                    style={{ color: template.accentColor }}
                                  >
                                    {dish.price} MAD
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                  {dishDesc}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-black/5">
                                <div className="text-[10px] font-bold text-slate-400">
                                  {dish.dietary && (
                                    <span className="capitalize">
                                      {copy[dish.dietary as keyof typeof copy] || dish.dietary}
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  data-sf-add
                                  onClick={(e) => handleAddToCart(dish, e)}
                                  className="sf-add-button px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5"
                                  style={{
                                    borderColor: template.accentColor,
                                    color: template.primaryColor
                                  }}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>{copy.add}</span>
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Note */}
        <p className="menu-note text-center text-xs text-slate-400 py-6 border-t border-black/5">
          {displayName} • Digital menu preview powered by SofraFlow
        </p>
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="sf-cart-backdrop fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <aside
            className="sf-cart-drawer w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 animate-slide-left"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className="space-y-6 flex-1 overflow-y-auto">
              <div className="sf-cart-head flex items-center justify-between pb-4 border-b border-black/8">
                <h2 className="text-xl font-black text-slate-900 font-display">
                  {copy.cart}
                </h2>
                <button
                  type="button"
                  data-sf-close-cart
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  {copy.empty}
                </div>
              ) : (
                <div className="sf-cart-lines divide-y divide-black/5">
                  {cart.map((line) => (
                    <div key={line.id} className="sf-cart-line py-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <strong className="block text-xs font-bold text-slate-900 truncate">
                          {line.name}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          {line.price} MAD
                        </span>
                      </div>

                      <div className="sf-qty flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(line.id, -1)}
                          className="w-7 h-7 rounded-lg border border-black/10 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <b className="text-xs font-bold min-w-4 text-center">{line.quantity}</b>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(line.id, 1)}
                          className="w-7 h-7 rounded-lg border border-black/10 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            <div className="sf-cart-foot pt-4 border-t border-black/8 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  {copy.subtotal}
                </span>
                <strong className="text-lg font-black text-slate-900">
                  {cartTotal} MAD
                </strong>
              </div>

              <button
                type="button"
                data-sf-checkout
                disabled={cart.length === 0}
                onClick={handleCheckoutClick}
                className="sf-order-button w-full py-3.5 rounded-xl text-white font-black text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
                style={{ backgroundColor: template.primaryColor }}
              >
                {copy.order}
              </button>

              <small className="block text-center text-[10px] text-slate-400">
                Interactive preview · Order events bridge to SofraFlow dashboard
              </small>
            </div>
          </aside>
        </div>
      )}

      {/* Dish Detail Modal */}
      {selectedDish && (
        <div
          className="sf-modal-backdrop fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedDish(null)}
        >
          <div
            className="sf-item-modal max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-black/10"
            onClick={e => e.stopPropagation()}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {selectedDish.imageUrl && (
              <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                <img
                  src={selectedDish.imageUrl}
                  alt={selectedDish.name[currentLocale] || selectedDish.name.fr}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedDish(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="sf-modal-content p-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900 font-display">
                    {getLocalized(selectedDish.name, currentLocale)}
                  </h2>
                  <strong className="text-lg font-black" style={{ color: template.accentColor }}>
                    {selectedDish.price} MAD
                  </strong>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {getLocalized(selectedDish.description, currentLocale)}
                </p>
              </div>

              {selectedDish.dietary && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span className="capitalize">
                    {copy[selectedDish.dietary as keyof typeof copy] || selectedDish.dietary}
                  </span>
                </div>
              )}

              <button
                type="button"
                data-sf-modal-add
                onClick={() => {
                  handleAddToCart(selectedDish);
                  setSelectedDish(null);
                }}
                className="w-full py-3.5 rounded-xl text-white font-black text-xs sm:text-sm shadow-md transition-all"
                style={{ backgroundColor: template.primaryColor }}
              >
                {copy.add} • {selectedDish.price} MAD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
