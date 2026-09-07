import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowRight } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-soft">
        <div className="w-16 h-16 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto">
          <Sprout size={32} />
        </div>
        <span className="text-xs font-bold text-forest-700 tracking-wider uppercase">404 Error</span>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
          Page Lost in the Foliage
        </h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          The page or botanical specimen you're searching for seems to have been relocated or pruned.
        </p>
        <div className="pt-2 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-forest-800 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow hover:bg-forest-900 transition-all min-h-[44px]"
          >
            <span>Return to Garden</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
