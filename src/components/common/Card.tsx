import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = false
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#14241F] rounded-2xl border border-border-subtle dark:border-[#233831] text-ink-main dark:text-[#F0F4F2] p-5 shadow-soft dark:shadow-none transition-all duration-200 ${
        hoverEffect ? 'hover:border-forest/30 dark:hover:border-gold/40 hover:shadow-card cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
