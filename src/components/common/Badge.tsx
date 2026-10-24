import React from 'react';
import { NotificationDeliveryStatus, OrderStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'forest' | 'ivory' | 'gold' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon
}) => {
  const variantStyles = {
    forest: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
    ivory: 'bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.08]',
    gold: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
    success: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
    warning: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
    error: 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25',
    neutral: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.08]'
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus; className?: string }> = ({ status, className = '' }) => {
  const { t } = useLanguage();

  const variantMap: Record<OrderStatus, BadgeProps['variant']> = {
    new: 'warning',
    confirmed: 'forest',
    preparing: 'gold',
    ready: 'forest',
    completed: 'success',
    cancelled: 'error'
  };

  const label = t(`orders.statusLabels.${status}`) || status;
  const variant = variantMap[status] || 'neutral';

  return (
    <Badge variant={variant} className={className}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-subtle" />
      {label}
    </Badge>
  );
};

export const WhatsAppStatusBadge: React.FC<{ status: NotificationDeliveryStatus; className?: string }> = ({
  status,
  className = ''
}) => {
  const { t } = useLanguage();

  const variantMap: Record<NotificationDeliveryStatus, BadgeProps['variant']> = {
    pending: 'neutral',
    processing: 'warning',
    accepted: 'gold',
    delivered: 'success',
    failed: 'error'
  };

  const label = t(`orders.whatsappStatusLabels.${status}`) || `WhatsApp: ${status}`;
  const variant = variantMap[status] || 'neutral';

  return (
    <Badge variant={variant} size="sm" className={className}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
};
