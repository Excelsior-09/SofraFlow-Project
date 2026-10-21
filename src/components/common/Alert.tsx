import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  className = ''
}) => {
  const styles = {
    info: {
      bg: 'bg-forest/5 dark:bg-forest/20 border-forest/20 dark:border-forest/40 text-forest dark:text-[#E2EBE6]',
      icon: <Info className="w-5 h-5 text-forest dark:text-gold flex-shrink-0" />
    },
    success: {
      bg: 'bg-status-success-bg dark:bg-[#102B20] border-status-success/30 text-status-success dark:text-[#4ADE80]',
      icon: <CheckCircle2 className="w-5 h-5 text-status-success dark:text-[#4ADE80] flex-shrink-0" />
    },
    warning: {
      bg: 'bg-status-warning-bg dark:bg-[#2B2310] border-status-warning/40 text-amber-800 dark:text-[#FBBF24]',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-[#FBBF24] flex-shrink-0" />
    },
    error: {
      bg: 'bg-status-error-bg dark:bg-[#2E1414] border-status-error/30 text-status-error dark:text-[#F87171]',
      icon: <AlertCircle className="w-5 h-5 text-status-error dark:text-[#F87171] flex-shrink-0" />
    }
  };

  const current = styles[type];

  return (
    <div className={`flex gap-3 rounded-2xl border p-4 text-sm ${current.bg} ${className}`}>
      {current.icon}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-1">{title}</h5>}
        <div className="leading-relaxed opacity-95">{children}</div>
      </div>
    </div>
  );
};
