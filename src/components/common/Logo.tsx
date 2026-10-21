import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'light' | 'dark' | 'auto';
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
  linkTo?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'auto',
  showTagline = false,
  size = 'md',
  iconOnly = false,
  linkTo = '/',
  className = ''
}) => {
  const isLight = variant === 'light';

  // Height mappings for proportional scaling of the official logo
  const heightClasses = {
    sm: 'h-8',
    md: 'h-10 sm:h-11',
    lg: 'h-14 sm:h-16',
    xl: 'h-20'
  };

  const iconHeightClasses = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const content = (
    <div className={`inline-flex flex-col items-start select-none ${className}`}>
      {iconOnly ? (
        <div
          className={`relative rounded-xl overflow-hidden flex items-center justify-center ${
            isLight ? 'bg-white p-1 rounded-xl shadow-xs' : 'bg-white/90 dark:bg-white p-1 rounded-xl shadow-xs'
          }`}
        >
          <img
            src="/logo-icon.png"
            alt="SofraFlow Logo Icon"
            className={`${iconHeightClasses[size]} object-contain`}
          />
        </div>
      ) : (
        <div
          className={`flex items-center transition-transform ${
            isLight
              ? 'bg-white/95 px-3 py-1.5 rounded-2xl shadow-soft hover:bg-white'
              : 'dark:bg-white/95 dark:px-2.5 dark:py-1 dark:rounded-xl dark:shadow-soft'
          }`}
        >
          <img
            src="/logo-full.png"
            alt="SOFRAFLOW Logo"
            className={`${heightClasses[size]} w-auto object-contain`}
          />
        </div>
      )}

      {showTagline && (
        <span
          className={`text-[10px] tracking-widest uppercase font-bold mt-1 pl-1 ${
            isLight ? 'text-white/80' : 'text-ink-secondary'
          }`}
        >
          From Menu to Momentum
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className="inline-block transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest"
      >
        {content}
      </Link>
    );
  }

  return content;
};
