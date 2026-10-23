import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { t, formatCurrency, dir, language } = useLanguage();

  const title = t(product.name);
  const description = t(product.description);

  return (
    <div
      onClick={() => product.isAvailable && onSelect(product)}
      className={`bg-white rounded-3xl p-4 border border-border-subtle shadow-soft transition-all duration-200 flex gap-4 select-none ${
        product.isAvailable
          ? 'hover:border-forest/30 hover:shadow-card cursor-pointer active:scale-[0.99]'
          : 'opacity-60 cursor-not-allowed bg-gray-50'
      }`}
    >
      {/* Product Image */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-ivory flex-shrink-0">
        <img
          src={product.imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 text-center">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              {t('customer.dishSoldOut')}
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm sm:text-base text-forest font-display line-clamp-1">
              {title}
            </h3>
          </div>

          <p className="text-xs text-ink-secondary line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 pt-1">
            {product.dietaryTags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-forest-light text-forest"
              >
                {t(`products.dietaryTags.${tag}`) || tag.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Price & Add Action */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-sm sm:text-base font-extrabold text-forest">
            {formatCurrency(product.price, product.currency)}
          </span>

          {product.isAvailable ? (
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl bg-forest hover:bg-forest-hover text-white text-xs font-bold flex items-center gap-1 shadow-soft transition-transform active:scale-95"
              aria-label={language === 'en' ? `Add ${title} to order` : `Ajouter ${title} à la commande`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('customer.addToOrder')}</span>
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-ink-secondary">
              {t('customer.dishSoldOut')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
