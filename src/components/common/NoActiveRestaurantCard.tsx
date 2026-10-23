import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, UtensilsCrossed } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { useLanguage } from '../../context/LanguageContext';

export interface NoActiveRestaurantCardProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionTo?: string;
  actionLabel?: string;
  secondaryActionTo?: string;
  secondaryActionLabel?: string;
}

export const NoActiveRestaurantCard: React.FC<NoActiveRestaurantCardProps> = ({
  icon,
  title,
  description,
  actionTo = '/onboarding',
  actionLabel,
  secondaryActionTo,
  secondaryActionLabel
}) => {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const defaultTitle = isEn ? 'No active establishment' : 'Aucun établissement actif';
  const defaultDesc = isEn
    ? 'Please select or create your establishment to access this dashboard feature.'
    : 'Veuillez sélectionner ou créer votre établissement pour accéder à cette fonctionnalité.';
  const defaultAction = isEn ? 'Launch Setup Assistant' : 'Lancer l’Assistant de Configuration';

  return (
    <Card className="p-8 sm:p-10 text-center space-y-4 max-w-lg mx-auto my-12 border-border-subtle dark:border-[#233831] shadow-card dark:shadow-none animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-3xl bg-forest/10 dark:bg-gold/15 text-forest dark:text-gold flex items-center justify-center mx-auto">
        {icon || <UtensilsCrossed className="w-8 h-8" />}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
          {title || defaultTitle}
        </h3>
        <p className="text-xs sm:text-sm text-ink-secondary dark:text-[#97A7A0] max-w-md mx-auto leading-relaxed">
          {description || defaultDesc}
        </p>
      </div>
      <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
        <Link to={actionTo}>
          <Button size="md" variant="primary" leftIcon={<Sparkles className="w-4 h-4 text-amber-200" />}>
            {actionLabel || defaultAction}
          </Button>
        </Link>
        {secondaryActionTo && secondaryActionLabel && (
          <Link to={secondaryActionTo}>
            <Button size="md" variant="outline">
              {secondaryActionLabel}
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
};
