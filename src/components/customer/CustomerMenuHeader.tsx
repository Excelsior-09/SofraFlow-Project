import React from 'react';
import { MapPin, Clock, Phone, Globe } from 'lucide-react';
import { Restaurant } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface CustomerMenuHeaderProps {
  restaurant: Restaurant;
  tableNumber?: string;
}

export const CustomerMenuHeader: React.FC<CustomerMenuHeaderProps> = ({ restaurant, tableNumber }) => {
  const { language, setLanguage, t, dir } = useLanguage();

  return (
    <div className="relative bg-forest text-white overflow-hidden pb-6">
      {/* Cover Image with gradient overlay */}
      <div className="relative h-44 sm:h-56 w-full overflow-hidden">
        <img
          src={restaurant.coverImageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/60 to-transparent" />

        {/* Language Switcher Overlay */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20">
          <button
            type="button"
            onClick={() => setLanguage('fr')}
            aria-label="Passer en Français"
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              language === 'fr' ? 'bg-gold text-forest-dark' : 'text-white/80 hover:text-white'
            }`}
          >
            FR
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            aria-label="Switch to English"
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              language === 'en' ? 'bg-gold text-forest-dark' : 'text-white/80 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>

        {/* Table pill if scanned with table query */}
        {tableNumber && (
          <div className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-full bg-gold text-forest-dark font-extrabold text-xs shadow-md tracking-wide uppercase">
            {t('customer.tableNumber', { num: tableNumber })}
          </div>
        )}
      </div>

      {/* Restaurant Info Bar */}
      <div className="max-w-3xl mx-auto px-4 -mt-12 relative z-10 flex flex-col items-center text-center space-y-3">
        {/* Logo avatar */}
        <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-card border-2 border-forest overflow-hidden">
          <img
            src={restaurant.logoUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            {restaurant.name}
          </h1>
          <p className="text-xs text-white/80 max-w-md mx-auto line-clamp-2">
            {restaurant.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/70 pt-1">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gold" />
            {restaurant.city}, {restaurant.country}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gold" />
            {t('customer.openToday')}
          </span>
          {restaurant.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gold" />
              {restaurant.phone}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
