import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-heading font-extrabold text-2xl mb-4">
        404
      </div>
      <h1 className="text-xl font-heading font-bold text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        The requested portal endpoint or view does not exist. Please check your path or return to your role dashboard.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
      >
        <Home className="w-4 h-4" /> Return to Home
      </Link>
    </div>
  );
};
