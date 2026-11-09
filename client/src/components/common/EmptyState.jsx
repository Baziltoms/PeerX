import React from 'react';
import { Inbox, AlertCircle, RefreshCw } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records to display in this section.',
  action,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="font-heading font-semibold text-slate-800 text-sm mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  if (type === 'table') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-3">
        <div className="h-8 bg-slate-100 rounded-lg w-1/3 mb-4"></div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-100 rounded-lg w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-8 bg-slate-100 rounded w-1/2"></div>
          <div className="h-3 bg-slate-100 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
};

export const ErrorState = ({ message = 'Failed to load content.', onRetry }) => {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
      <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
      <h4 className="font-heading font-semibold text-sm mb-1">An Error Occurred</h4>
      <p className="text-xs text-rose-600 max-w-md mx-auto mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      )}
    </div>
  );
};
