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
    forest: 'bg-forest/10 dark:bg-forest/30 text-forest dark:text-[#4ADE80] border-forest/20 dark:border-forest/40',
    ivory: 'bg-ivory-dark dark:bg-[#1B2F29] text-ink-main dark:text-[#F0F4F2] border-border-subtle dark:border-[#233831]',
    gold: 'bg-gold-light dark:bg-gold/15 text-gold-hover dark:text-gold border-gold/30 dark:border-gold/40',
    success: 'bg-status-success-bg dark:bg-[#102B20] text-status-success dark:text-[#4ADE80] border-status-success/20 dark:border-status-success/30',
    warning: 'bg-status-warning-bg dark:bg-[#2B2310] text-status-warning dark:text-[#FBBF24] border-status-warning/30',
    error: 'bg-status-error-bg dark:bg-[#2E1414] text-status-error dark:text-[#F87171] border-status-error/20 dark:border-status-error/30',
    neutral: 'bg-gray-100 dark:bg-[#1C2C26] text-gray-700 dark:text-[#A3B3AB] border-gray-200 dark:border-[#2C4239]'
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
