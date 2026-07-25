import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = true,
}) => {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm ${
        hoverEffect
          ? 'transition-all duration-300 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
