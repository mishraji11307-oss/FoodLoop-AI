import React from 'react';
import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  colorScheme?: 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp,
  colorScheme = 'emerald',
  className
}) => {
  const iconBg = {
    emerald: 'bg-emerald-500/10 text-emerald-600',
    amber: 'bg-amber-500/10 text-amber-600',
    rose: 'bg-rose-500/10 text-rose-600',
    sky: 'bg-sky-500/10 text-sky-600',
    indigo: 'bg-indigo-500/10 text-indigo-600'
  };

  return (
    <div className={cn('glass-panel p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('p-3 rounded-xl', iconBg[colorScheme])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs">
          <span className={cn('font-semibold', trendUp ? 'text-emerald-600' : 'text-rose-600')}>
            {trend}
          </span>
          <span className="text-slate-400 ml-1.5">vs last month</span>
        </div>
      )}
    </div>
  );
};
