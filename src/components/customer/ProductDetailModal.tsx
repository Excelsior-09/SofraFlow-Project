import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, ShieldAlert } from 'lucide-react';
import { CartItemOptionSelection, Product } from '../../types';
import { Button } from '../common/Button';
import { useLanguage } from '../../context/LanguageContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedOptions: CartItemOptionSelection[],
    specialInstructions?: string
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  const { t, formatCurrency } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<CartItemOptionSelection[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSpecialInstructions('');

      // Pre-select first choice for required single-select option groups
      const defaultOptions: CartItemOptionSelection[] = [];
      for (const group of product.optionGroups || []) {
        if (group.required && group.choices.length > 0) {
          const first = group.choices[0];
          defaultOptions.push({
            groupId: group.id,
            groupTitle: t(group.title),
            choiceId: first.id,
            choiceName: t(first.name),
            priceModifier: first.priceModifier
          });
        }
      }
      setSelectedOptions(defaultOptions);
    }
  }, [product]);

  if (!product) return null;

  const title = t(product.name);
  const description = t(product.description);

  const handleSelectOption = (groupId: string, groupTitle: string, choiceId: string, choiceName: string, priceModifier: number) => {
    setSelectedOptions(prev => {
      // Replace existing choice for this group (single select behavior)
      const filtered = prev.filter(o => o.groupId !== groupId);
      return [
        ...filtered,
        { groupId, groupTitle, choiceId, choiceName, priceModifier }
      ];
    });
  };

  const optionsTotalModifier = selectedOptions.reduce((acc, opt) => acc + opt.priceModifier, 0);
  const unitPrice = product.price + optionsTotalModifier;
  const totalPrice = unitPrice * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddToCart(product, quantity, selectedOptions, specialInstructions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sheet / Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-elevated z-10 overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Modal Header Image */}
        <div className="relative h-56 sm:h-64 w-full bg-ivory flex-shrink-0">
          <img
            src={product.imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-forest font-display">
                {title}
              </h2>
              <span className="text-lg font-extrabold text-forest whitespace-nowrap">
                {formatCurrency(unitPrice, product.currency)}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-ink-secondary mt-1.5 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Verified Ingredients & Allergens Box */}
          {(product.verifiedIngredients.length > 0 || product.verifiedAllergens.length > 0) && (
            <div className="p-3.5 bg-ivory rounded-2xl border border-border-subtle space-y-2 text-xs">
              {product.verifiedIngredients.length > 0 && (
                <div>
                  <span className="font-bold text-forest">Ingrédients : </span>
                  <span className="text-ink-secondary">{product.verifiedIngredients.join(', ')}</span>
                </div>
              )}

              {product.verifiedAllergens.length > 0 && (
                <div className="flex items-center gap-1.5 text-amber-800 font-medium">
                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Allergènes déclarés : {product.verifiedAllergens.join(', ')}</span>
                </div>
              )}
            </div>
          )}

          {/* Option Groups */}
          {product.optionGroups && product.optionGroups.map((group) => {
            const groupTitle = t(group.title);
            const currentSelected = selectedOptions.find(o => o.groupId === group.id)?.choiceId;

            return (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-forest uppercase tracking-wider">
                    {groupTitle}
                  </h4>
                  {group.required && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      {t('common.required')}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {group.choices.map((choice) => {
                    const choiceName = t(choice.name);
                    const isSelected = currentSelected === choice.id;

                    return (
                      <div
                        key={choice.id}
                        onClick={() => handleSelectOption(group.id, groupTitle, choice.id, choiceName, choice.priceModifier)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? 'border-forest bg-forest/5 font-semibold text-forest shadow-soft'
                            : 'border-border-subtle bg-white text-ink-main hover:bg-ivory'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-forest bg-forest text-white' : 'border-border-subtle'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span>{choiceName}</span>
                        </div>

                        {choice.priceModifier > 0 && (
                          <span className="font-bold text-forest">
                            +{formatCurrency(choice.priceModifier, product.currency)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Special Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-forest uppercase tracking-wider block">
              {t('customer.specialInstructions')}
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder={t('customer.specialInstructionsPlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-border-subtle bg-ivory/50 text-xs focus:ring-2 focus:ring-forest"
            />
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-6 bg-white border-t border-border-subtle flex items-center justify-between gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center gap-3 bg-ivory px-3 py-2 rounded-2xl border border-border-subtle">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 rounded-xl text-ink-secondary hover:text-forest disabled:opacity-30"
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-sm text-forest min-w-[20px] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 rounded-xl text-ink-secondary hover:text-forest"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Submit Button */}
          <Button
            variant="primary"
            size="md"
            className="flex-1 font-bold"
            onClick={handleSubmit}
          >
            {t('customer.addToOrder')} • {formatCurrency(totalPrice, product.currency)}
          </Button>
        </div>
      </div>
    </div>
  );
};
