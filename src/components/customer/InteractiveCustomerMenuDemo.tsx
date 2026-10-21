import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Star,
  CheckCircle2,
  Utensils,
  Search,
  MessageSquare,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DEMO_RESTAURANT, DEMO_DISHES, DEMO_CATEGORIES } from '../../data/demoData';
import { DemoDish } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AiAssistantDrawer } from './AiAssistantDrawer';
import { ReviewInviteModal } from './ReviewInviteModal';

interface CartItem {
  dish: DemoDish;
  quantity: number;
}

export const InteractiveCustomerMenuDemo: React.FC = () => {
  const { language, t, formatCurrency } = useLanguage();
  const isEn = language === 'en';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([
    { dish: DEMO_DISHES[0], quantity: 1 }, // Lamb Tagine
    { dish: DEMO_DISHES[3], quantity: 2 }  // Mint Tea x2
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Cart operations
  const addToCart = (dish: DemoDish) => {
    setCart(prev => {
      const existing = prev.find(i => i.dish.id === dish.id);
      if (existing) {
        return prev.map(i => i.dish.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const updateQuantity = (dishId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(i => {
          if (i.dish.id === dishId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.1 * 100) / 100; // 10% Moroccan restaurant tax
  const total = subtotal + tax;
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSimulateOrder = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    setOrderPlaced(true);
    setIsCartOpen(false);
    setTimeout(() => {
      setIsReviewOpen(true);
    }, 1500);
  };

  // Filter dishes
  const filteredDishes = DEMO_DISHES.filter(d => {
    const matchesCat = selectedCategory === 'all' || d.category === selectedCategory;
    const nameMatch = (d.name[language] || d.name.fr).toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (d.description[language] || d.description.fr).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && (nameMatch || descMatch);
  });

  return (
    <div className="bg-white dark:bg-dark-card rounded-3xl border border-border-subtle dark:border-dark-border shadow-card dark:shadow-none overflow-hidden transition-colors duration-200">
      
      {/* Restaurant Header Banner */}
      <div className="relative bg-gradient-to-r from-brand-navy to-slate-900 text-white p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={DEMO_RESTAURANT.logoUrl}
              alt={DEMO_RESTAURANT.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                  {DEMO_RESTAURANT.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/30 text-orange-300 border border-orange-400/40 text-[10px] font-extrabold uppercase">
                  {isEn ? 'Table 4 • Dine-In' : 'Table 4 • Sur Place'}
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5 max-w-md">
                {DEMO_RESTAURANT.tagline[language] || DEMO_RESTAURANT.tagline.fr}
              </p>
            </div>
          </div>

          {/* Assistant Action Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsAiOpen(true)}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/40 text-orange-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{isEn ? 'Ask AI Guide' : 'Conseils de Zina'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{formatCurrency(total, 'MAD')}</span>
              {totalItemCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-orange text-white text-[10px] font-black flex items-center justify-center">
                  {totalItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar inside Header */}
        <div className="mt-5 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? "Search tagines, burgers, mint tea, pastries..." : "Rechercher un tajine, burger, thé à la menthe..."}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-xs sm:text-sm focus:outline-none focus:bg-white/20 transition-all"
          />
          <Search className="w-4 h-4 text-white/60 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="p-4 border-b border-border-subtle dark:border-dark-border bg-ivory/60 dark:bg-dark-surface/60 overflow-x-auto">
        <div className="flex items-center gap-2">
          {DEMO_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-brand-navy dark:bg-orange-600 text-white shadow-soft'
                    : 'text-ink-secondary dark:text-dark-secondary hover:bg-white dark:hover:bg-dark-card'
                }`}
              >
                {cat.label[language] || cat.label.fr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dish Grid */}
      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDishes.map((dish) => {
          const cartItem = cart.find(i => i.dish.id === dish.id);
          return (
            <div
              key={dish.id}
              className="rounded-2xl border border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden flex flex-col justify-between hover:shadow-card transition-shadow"
            >
              <div>
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={dish.imageUrl}
                    alt={dish.name[language] || dish.name.fr}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {dish.popular && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-brand-orange text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                      ★ {isEn ? 'Popular' : 'Vedette'}
                    </span>
                  )}
                  {dish.dietary && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/90 dark:bg-dark-card/90 text-brand-navy dark:text-dark-text text-[10px] font-bold">
                      {dish.dietary === 'chef_special' ? (isEn ? "Chef's Special" : "Spécialité") : (dish.dietary === 'vegetarian' ? (isEn ? "Vegetarian" : "Végétarien") : "Halal")}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-brand-navy dark:text-dark-text font-display leading-snug">
                      {dish.name[language] || dish.name.fr}
                    </h4>
                    <span className="text-sm font-extrabold text-brand-orange whitespace-nowrap">
                      {formatCurrency(dish.price, dish.currency)}
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary dark:text-dark-secondary line-clamp-2 leading-relaxed">
                    {dish.description[language] || dish.description.fr}
                  </p>
                </div>
              </div>

              {/* Add to order action */}
              <div className="p-4 pt-0">
                {cartItem ? (
                  <div className="flex items-center justify-between p-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60">
                    <button
                      type="button"
                      onClick={() => updateQuantity(dish.id, -1)}
                      className="p-1 rounded-lg bg-white dark:bg-dark-card text-brand-orange hover:bg-orange-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black text-brand-navy dark:text-dark-text">
                      {cartItem.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(dish.id, 1)}
                      className="p-1 rounded-lg bg-brand-orange text-white hover:bg-orange-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => addToCart(dish)}
                    className="w-full py-2.5 rounded-xl border border-border-subtle dark:border-dark-border hover:border-brand-orange text-brand-navy dark:text-dark-text hover:text-brand-orange text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-orange" />
                    <span>{isEn ? 'Add to Order' : 'Ajouter à la commande'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-dark-card h-full shadow-elevated z-10 flex flex-col p-5 space-y-4 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle dark:border-dark-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-orange" />
                <h3 className="font-extrabold text-base text-brand-navy dark:text-dark-text">
                  {isEn ? 'Your Order (Table 4)' : 'Votre Commande (Table 4)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="text-ink-secondary hover:text-brand-orange"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {cart.map((item) => (
                <div
                  key={item.dish.id}
                  className="p-3 rounded-2xl bg-ivory dark:bg-dark-surface border border-border-subtle dark:border-dark-border flex items-center justify-between gap-3"
                >
                  <div className="overflow-hidden">
                    <h5 className="text-xs font-bold text-brand-navy dark:text-dark-text truncate">
                      {item.dish.name[language] || item.dish.name.fr}
                    </h5>
                    <p className="text-[11px] font-extrabold text-brand-orange">
                      {formatCurrency(item.dish.price * item.quantity, item.dish.currency)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.dish.id, -1)}
                      className="p-1 rounded-md bg-white dark:bg-dark-card border border-border-subtle dark:border-dark-border text-brand-navy dark:text-dark-text"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.dish.id, 1)}
                      className="p-1 rounded-md bg-brand-orange text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="p-4 rounded-2xl bg-ivory dark:bg-dark-surface border border-border-subtle dark:border-dark-border space-y-2 text-xs">
              <div className="flex justify-between text-ink-secondary dark:text-dark-secondary">
                <span>{isEn ? 'Subtotal' : 'Sous-total'}</span>
                <span>{formatCurrency(subtotal, 'MAD')}</span>
              </div>
              <div className="flex justify-between text-ink-secondary dark:text-dark-secondary">
                <span>{isEn ? 'Restaurant Tax (10%)' : 'Taxe restaurant (10%)'}</span>
                <span>{formatCurrency(tax, 'MAD')}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-brand-navy dark:text-dark-text pt-2 border-t border-border-subtle dark:border-dark-border">
                <span>{isEn ? 'Total to Pay' : 'Total'}</span>
                <span className="text-brand-orange">{formatCurrency(total, 'MAD')}</span>
              </div>
            </div>

            {/* Confirm Checkout Button */}
            <button
              type="button"
              onClick={handleSimulateOrder}
              className="w-full py-4 rounded-2xl bg-brand-orange hover:bg-orange-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{isEn ? 'Send Order to Kitchen' : 'Envoyer la commande en cuisine'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* AI Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onAddToCart={addToCart}
      />

      {/* Google Review Modal */}
      <ReviewInviteModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        restaurantName={DEMO_RESTAURANT.name}
      />
    </div>
  );
};
