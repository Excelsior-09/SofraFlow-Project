import React, { useState, useEffect, useMemo } from 'react';
import { MenuTemplateDefinition, TemplateCategory, TemplateDishItem } from '../../data/menuTemplatesData';
import { Restaurant, Menu, FoodLanguageCode } from '../../types';
import { X, Search, ShoppingBag, Plus, Minus, Check, Sparkles } from 'lucide-react';

export interface SofraFlowTemplateRendererProps {
  template: MenuTemplateDefinition;
  restaurant?: Restaurant | null;
  menu?: Menu | null;
  locale?: FoodLanguageCode;
  previewMode?: boolean;
  isMobile?: boolean;
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
  menu: _menu,
  locale: initialLocale = 'en',
  previewMode = false,
  isMobile = false,
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
        search: 'Rechercher un plat, une boisson...',
        all: 'Tout le menu',
        cart: 'Votre commande',
        empty: 'Votre panier est vide pour l’instant.',
        subtotal: 'Sous-total',
        add: 'Ajouter',
        close: 'Fermer',
        order: 'Commander maintenant',
        noResults: 'Aucun plat ne correspond à votre recherche.',
        popular: 'Coup de cœur',
        previewBadge: 'Aperçu Interactif',
        openHours: 'Ouvert aujourd’hui · 12:00 — 23:30',
        useTemplate: 'Choisir ce modèle',
        chefSpecial: 'Signature du Chef',
        halal: 'Halal Certifié',
        vegetarian: 'Végétarien',
        spicy: 'Épicé'
      };
    }
    if (currentLocale === 'ar') {
      return {
        search: 'ابحث عن طبق أو مشروب...',
        all: 'كل القائمة',
        cart: 'طلبك الحالي',
        empty: 'سلة الطلب فارغة حالياً.',
        subtotal: 'المجموع الفرعي',
        add: 'أضف للطلب',
        close: 'إغلاق',
        order: 'إتمام الطلب الآن',
        noResults: 'لم يتم العثور على أطباق تطابق بحثك.',
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
      search: 'Search dishes, drinks...',
      all: 'All Menu',
      cart: 'Your order',
      empty: 'Your cart is currently empty.',
      subtotal: 'Subtotal',
      add: 'Add',
      close: 'Close',
      order: 'Complete order now',
      noResults: 'No dishes match your search query.',
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
      className="sofraflow-template-root w-full bg-[#FAF8F5] text-[#111827] font-sans transition-all duration-300 relative selection:bg-[var(--accent)] selection:text-white"
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
          <header className="menu-hero relative px-4 py-8 sm:px-8 sm:py-14 text-white overflow-hidden bg-gradient-to-b from-black/75 via-black/55 to-black/85">
            <div
              className="absolute inset-0 bg-cover bg-center -z-10 transform scale-105 transition-transform duration-700"
              style={{ backgroundImage: `url("${heroImage}")` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 -z-10" />

            <div className="relative z-10 space-y-3.5">
              <div className="brand-row flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="monogram w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-sm sm:text-base text-white shadow-xl ring-2 ring-white/20"
                    style={{ backgroundColor: template.accentColor }}
                  >
                    {monogram}
                  </span>
                  <div>
                    <span className="brand-meta text-xs sm:text-sm font-bold tracking-wide text-white block">
                      {displayName}
                    </span>
                    <span className="block text-[11px] text-white/75 font-medium">
                      {restaurant?.city || 'Marrakech'} · SofraFlow Verified
                    </span>
                  </div>
                </div>

                {previewMode && onTemplateSelect && (
                  <button
                    type="button"
                    onClick={() => onTemplateSelect(template.id)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/25 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">{copy.useTemplate}</span>
                    <span className="sm:hidden">{copy.add}</span>
                  </button>
                )}
              </div>

              <div className="space-y-1.5 pt-1">
                <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white leading-tight">
                  {displayName}
                </h1>
                <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
                  {displayTagline}
                </p>
              </div>

              <div className="hero-meta flex flex-wrap items-center gap-3 text-[11px] font-semibold text-white/85 pt-1">
                <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{copy.openHours}</span>
                </span>
                <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  {getLocalized(template.badge, currentLocale)}
                </span>
              </div>
            </div>
          </header>

          {/* Menu Body */}
          <div className="menu-body p-3.5 sm:p-8 space-y-6 sm:space-y-8">
            {/* Interactive Toolbar */}
            <div className="sf-menu-toolbar p-3 sm:p-4 rounded-2xl border border-black/8 bg-slate-50/90 dark:bg-slate-900/40 backdrop-blur-sm space-y-3 shadow-xs">
              <div className="sf-toolbar-top flex items-center gap-2.5">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none" />
                  <input
                    type="search"
                    data-sf-search
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={copy.search}
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-black/10 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] shadow-xs transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute top-1/2 -translate-y-1/2 right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Cart Button */}
                <button
                  type="button"
                  data-sf-open-cart
                  onClick={() => setIsCartOpen(true)}
                  className="px-3.5 sm:px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all transform active:scale-95 shrink-0"
                  style={{ backgroundColor: template.primaryColor }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="sf-cart-label hidden sm:inline">{copy.cart}</span>
                  <b
                    data-sf-cart-count
                    className="min-w-5 h-5 px-1.5 rounded-full text-[10px] flex items-center justify-center font-black"
                    style={{ backgroundColor: template.accentColor, color: '#ffffff' }}
                  >
                    {totalItemCount}
                  </b>
                </button>
              </div>

              {/* Category Nav — Horizontal Scrollable Pills */}
              <div className="sf-category-nav flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar -mx-1 px-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                    selectedCategory === 'all'
                      ? 'text-white'
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
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                        isActive
                          ? 'text-white'
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
              <div className="sf-toolbar-bottom flex items-center justify-between text-xs pt-2 border-t border-black/5">
                <div className="sf-locale-switcher flex items-center gap-1" role="group" aria-label="Language">
                  {(['en', 'fr', 'ar'] as FoodLanguageCode[]).map(l => (
                    <button
                      key={l}
                      type="button"
                      data-sf-locale={l}
                      onClick={() => setCurrentLocale(l)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                        currentLocale === l
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 bg-transparent'
                      }`}
                    >
                      {l === 'ar' ? 'عربي' : l.toUpperCase()}
                    </button>
                  ))}
                </div>

                <span className="sf-demo-note text-[10px] sm:text-[11px] text-slate-400 font-medium">
                  {copy.previewBadge} · SofraFlow
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
                  <section key={catIdx} className="category space-y-3.5 sm:space-y-4">
                    <h2
                      className="text-base sm:text-xl font-black font-display pb-1.5 inline-block border-b-2"
                      style={{ color: template.primaryColor, borderColor: template.accentColor }}
                    >
                      {categoryTitle}
                    </h2>

                    {/* Responsive Grid: strictly 1-column on mobile or when isMobile prop is passed */}
                    <div className={`items grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {category.items.map((dish, dishIdx) => {
                        const dishTitle = getLocalized(dish.name, currentLocale);
                        const dishDesc = getLocalized(dish.description, currentLocale);

                        return (
                          <article
                            key={dishIdx}
                            className="item group rounded-2xl border border-black/8 bg-white hover:border-black/20 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
                            onClick={() => setSelectedDish(dish)}
                          >
                            {dish.imageUrl && (
                              <div className={`relative overflow-hidden bg-slate-100 ${isMobile ? 'h-48' : 'h-44 sm:h-52'}`}>
                                <img
                                  src={dish.imageUrl}
                                  alt={dishTitle}
                                  loading="lazy"
                                  onError={(e: any) => {
                                    e.target.style.display = 'none';
                                  }}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25 pointer-events-none" />

                                {/* Top Floating Badges */}
                                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
                                  {dish.isPopular ? (
                                    <span
                                      className="tag px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-white shadow-md flex items-center gap-1 backdrop-blur-xs"
                                      style={{ backgroundColor: template.accentColor }}
                                    >
                                      <Sparkles className="w-2.5 h-2.5" />
                                      <span>{copy.popular}</span>
                                    </span>
                                  ) : <span />}

                                  {dish.dietary && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-black/60 backdrop-blur-md shadow-sm">
                                      {copy[dish.dietary as keyof typeof copy] || dish.dietary}
                                    </span>
                                  )}
                                </div>

                                {/* Price Badge over image */}
                                <div className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white font-black text-xs sm:text-sm shadow-md border border-white/10">
                                  {dish.price} MAD
                                </div>
                              </div>
                            )}

                            <div className="item-main p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
                              <div className="space-y-1">
                                <div className="item-head flex items-baseline justify-between gap-2">
                                  <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                                    {dishTitle}
                                  </h3>
                                  {!dish.imageUrl && (
                                    <span
                                      className="price text-sm font-black whitespace-nowrap"
                                      style={{ color: template.accentColor }}
                                    >
                                      {dish.price} MAD
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                  {dishDesc}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-2.5 border-t border-black/5">
                                <span className="text-[11px] font-semibold text-slate-400 capitalize">
                                  {dish.dietary ? (copy[dish.dietary as keyof typeof copy] || dish.dietary) : 'SofraFlow Signature'}
                                </span>

                                <button
                                  type="button"
                                  data-sf-add
                                  onClick={(e) => handleAddToCart(dish, e)}
                                  className="sf-add-button px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 active:scale-95 shadow-xs hover:shadow-sm"
                                  style={{
                                    borderColor: template.accentColor,
                                    backgroundColor: 'transparent',
                                    color: template.accentColor
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = template.accentColor;
                                    e.currentTarget.style.color = '#ffffff';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = template.accentColor;
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
            className="sf-cart-drawer w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-5 sm:p-6 animate-slide-left"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className="space-y-5 flex-1 overflow-y-auto">
              <div className="sf-cart-head flex items-center justify-between pb-4 border-b border-black/8">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[var(--accent)]" />
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                    {copy.cart}
                  </h2>
                </div>
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
                      {line.imageUrl && (
                        <img
                          src={line.imageUrl}
                          alt={line.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-xs"
                        />
                      )}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <strong className="block text-xs font-bold text-slate-900 truncate">
                          {line.name}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          {line.price} MAD × {line.quantity}
                        </span>
                      </div>

                      <div className="sf-qty flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(line.id, -1)}
                          className="w-7 h-7 rounded-lg border border-black/10 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <b className="text-xs font-bold min-w-5 text-center">{line.quantity}</b>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(line.id, 1)}
                          className="w-7 h-7 rounded-lg border border-black/10 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95"
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
                className="sf-order-button w-full py-3.5 rounded-xl text-white font-black text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 active:scale-98"
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
          className="sf-modal-backdrop fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={() => setSelectedDish(null)}
        >
          <div
            className="sf-item-modal max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-black/10"
            onClick={e => e.stopPropagation()}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {selectedDish.imageUrl && (
              <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-100">
                <img
                  src={selectedDish.imageUrl}
                  alt={selectedDish.name[currentLocale] || selectedDish.name.fr}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setSelectedDish(null)}
                  className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3.5">
                  <span className="px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md text-white font-black text-sm shadow-md border border-white/10">
                    {selectedDish.price} MAD
                  </span>
                </div>
              </div>
            )}

            <div className="sf-modal-content p-5 sm:p-6 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                    {getLocalized(selectedDish.name, currentLocale)}
                  </h2>
                  {!selectedDish.imageUrl && (
                    <strong className="text-lg font-black" style={{ color: template.accentColor }}>
                      {selectedDish.price} MAD
                    </strong>
                  )}
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
                className="w-full py-3.5 rounded-xl text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-98"
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
