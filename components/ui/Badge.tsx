import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'yellow' | 'blue' | 'green' | 'red' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'yellow',
  className = '',
}) => {
  const variantStyles = {
    yellow: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    blue: 'bg-blue-50 text-brand-blue border-blue-200 font-bold',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    red: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
