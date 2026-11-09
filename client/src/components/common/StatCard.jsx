import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendType = 'up', color = 'indigo' }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50/80 text-indigo-600 border-indigo-200/60 shadow-glow-indigo',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      line: 'bg-indigo-600',
    },
    emerald: {
      bg: 'bg-emerald-50/80 text-emerald-600 border-emerald-200/60 shadow-glow-emerald',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      line: 'bg-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50/80 text-amber-600 border-amber-200/60 shadow-glow-amber',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      line: 'bg-amber-600',
    },
    rose: {
      bg: 'bg-rose-50/80 text-rose-600 border-rose-200/60',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      line: 'bg-rose-600',
    },
    sky: {
      bg: 'bg-sky-50/80 text-sky-600 border-sky-200/60',
      badge: 'bg-sky-50 text-sky-700 border-sky-200',
      line: 'bg-sky-600',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="relative group overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
      {/* Subtle top indicator border */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${scheme.line} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl border transition-transform duration-300 group-hover:scale-110 ${scheme.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1">
            {trendType === 'up' ? (
              <span className="flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md text-[10px] border border-emerald-200/60">
                <TrendingUp className="w-3 h-3" /> {trend}
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded-md text-[10px] border border-rose-200/60">
                <TrendingDown className="w-3 h-3" /> {trend}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
        </div>
      )}
    </div>
  );
};

