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
      className={`bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] text-ink-main dark:text-[#F8FAFC] p-5 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-200 ${
        hoverEffect ? 'hover:border-orange-500/30 dark:hover:border-amber-400/30 hover:shadow-card cursor-pointer hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
