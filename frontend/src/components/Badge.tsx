import React from 'react';
import { cn } from '../lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'slate' | 'indigo';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'slate', className }) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
    blue: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/10',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/10',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
