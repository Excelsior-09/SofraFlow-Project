import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Utensils, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { Product, Restaurant } from '../../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  availableProducts: Product[];
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  restaurant,
  availableProducts
}) => {
  const navigate = useNavigate();
  const { t, formatCurrency, language } = useLanguage();
  const {
    items,
    orderType,
    setOrderType,
    tableNumber,
    setTableNumber,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerNotes,
    setCustomerNotes,
    updateQuantity,
    removeItem,
    subtotal,
    taxAmount,
    serviceFeeAmount,
    total,
    isSubmitting,
    submissionError,
    submitOrder
  } = useCart();

  if (!isOpen) return null;

  const handleCheckout = async () => {
    const order = await submitOrder(restaurant, availableProducts);
    if (order) {
      // Fire celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
      onClose();
      navigate(`/order/${order.publicOrderReference}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-elevated z-10 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-forest-light text-forest flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-forest font-display">{t('customer.yourOrder')}</h3>
              <p className="text-[11px] text-ink-secondary">{items.length} article(s) dans le panier</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-ink-secondary hover:text-ink-main hover:bg-ivory"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-ivory flex items-center justify-center text-ink-secondary">
              <ShoppingBag className="w-8 h-8 text-ink-secondary/50" />
            </div>
            <h4 className="font-bold text-forest text-base">{t('customer.emptyCartTitle')}</h4>
            <p className="text-xs text-ink-secondary max-w-xs">
              {t('customer.emptyCartDesc')}
            </p>
            <Button variant="primary" size="sm" onClick={onClose}>
              {t('customer.backToMenu')}
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {submissionError && <Alert type="error">{submissionError}</Alert>}

            {/* Fulfillment Type Toggle */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-forest uppercase tracking-wider block">
                {t('customer.orderType')}
              </span>
              <div className="grid grid-cols-2 gap-2 bg-ivory p-1 rounded-2xl border border-border-subtle">
                <button
                  type="button"
                  onClick={() => setOrderType('dine_in')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    orderType === 'dine_in'
                      ? 'bg-forest text-white shadow-soft'
                      : 'text-ink-secondary hover:text-ink-main'
                  }`}
                >
                  {t('customer.dineIn')}
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('takeaway')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    orderType === 'takeaway'
                      ? 'bg-forest text-white shadow-soft'
                      : 'text-ink-secondary hover:text-ink-main'
                  }`}
                >
                  {t('customer.takeaway')}
                </button>
              </div>
            </div>

            {/* Table Number Input if Dine-In */}
            {orderType === 'dine_in' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-forest uppercase tracking-wider block">
                  {t('customer.tableLabel')} *
                </label>
                <input
                  type="text"
                  required
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="ex. 4 (indiqué sur votre chevalet)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-ivory/50 text-xs font-bold text-forest focus:ring-2 focus:ring-forest"
                />
              </div>
            )}

            {/* Customer Contact Details */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-ink-secondary block mb-1">
                  {t('customer.customerName')} ({t('common.optional')})
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t('customer.customerNamePlaceholder')}
                  className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-ivory/50 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-ink-secondary block mb-1">
                  {t('customer.customerPhone')} ({t('common.optional')})
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+212 6..."
                  className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-ivory/50 text-xs font-mono"
                />
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-forest uppercase tracking-wider block">
                Articles commandés ({items.length})
              </span>

              <div className="divide-y divide-border-subtle">
                {items.map((item) => (
                  <div key={item.cartItemId} className="py-3 flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <h4 className="font-bold text-xs text-forest">{item.name}</h4>

                      {/* Options */}
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="text-[11px] text-ink-secondary">
                          {item.selectedOptions.map(o => o.choiceName).join(', ')}
                        </div>
                      )}

                      {/* Special instructions */}
                      {item.specialInstructions && (
                        <p className="text-[11px] text-amber-700 italic">
                          "{item.specialInstructions}"
                        </p>
                      )}

                      <span className="text-xs font-bold text-forest block">
                        {formatCurrency(item.price * item.quantity, restaurant.settings.currency)}
                      </span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 bg-ivory px-2 py-1 rounded-xl border border-border-subtle">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                        className="p-1 text-ink-secondary hover:text-forest"
                        aria-label={language === 'en' ? "Decrease quantity" : "Diminuer la quantité"}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold min-w-[16px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        className="p-1 text-ink-secondary hover:text-forest"
                        aria-label={language === 'en' ? "Increase quantity" : "Augmenter la quantité"}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.cartItemId)}
                      className="p-1.5 text-ink-secondary hover:text-status-error"
                      aria-label={language === 'en' ? "Remove this item" : "Supprimer cet article"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Special Note */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-forest uppercase tracking-wider block">
                {t('customer.specialInstructions')}
              </label>
              <textarea
                rows={2}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Allergies particulières, préférences de cuisson…"
                className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-ivory/50 text-xs focus:ring-2 focus:ring-forest"
              />
            </div>

            {/* Calculations Breakdown */}
            <div className="p-4 bg-ivory rounded-2xl border border-border-subtle space-y-2 text-xs">
              <div className="flex justify-between text-ink-secondary">
                <span>{t('customer.subtotal')} :</span>
                <span className="font-semibold text-ink-main">{formatCurrency(subtotal, restaurant.settings.currency)}</span>
              </div>
              <div className="flex justify-between text-ink-secondary">
                <span>{t('customer.tax')} (10%) :</span>
                <span className="font-semibold text-ink-main">{formatCurrency(taxAmount, restaurant.settings.currency)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-forest pt-2 border-t border-border-subtle">
                <span>{t('customer.total')} :</span>
                <span>{formatCurrency(total, restaurant.settings.currency)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Drawer Action Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-border-subtle space-y-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-card"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={handleCheckout}
            >
              {t('customer.confirmOrderBtn', { total: formatCurrency(total, restaurant.settings.currency) })}
            </Button>
            <p className="text-[10px] text-ink-secondary text-center">
              {t('customer.kitchenNotifiedDesc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
