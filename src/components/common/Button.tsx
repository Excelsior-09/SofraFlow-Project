import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variantStyles = {
    primary: 'bg-forest hover:bg-forest-hover dark:bg-gold dark:hover:bg-gold-hover text-white dark:text-forest-dark focus-visible:ring-forest dark:focus-visible:ring-gold shadow-soft hover:shadow-card font-semibold',
    secondary: 'bg-forest-light dark:bg-[#1C332B] text-forest dark:text-[#E2EBE6] hover:bg-forest/15 dark:hover:bg-[#254238] focus-visible:ring-forest',
    outline: 'border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#14241F] text-ink-main dark:text-[#F0F4F2] hover:bg-ivory dark:hover:bg-[#1B2F29] hover:border-ink-secondary/30 focus-visible:ring-forest',
    ghost: 'text-ink-secondary dark:text-[#97A7A0] hover:text-ink-main dark:hover:text-[#F0F4F2] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:ring-forest',
    danger: 'bg-status-error text-white hover:bg-red-700 focus-visible:ring-status-error',
    gold: 'bg-gold text-forest-dark hover:bg-gold-hover font-semibold shadow-soft hover:shadow-card focus-visible:ring-gold'
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
