import React from 'react';
import { Sprout } from 'lucide-react';

export const PageLoader: React.FC = () => {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-6 gap-4 animate-fade-in">
      <div className="relative flex items-center justify-center">
        {/* Pulsing botanical ring */}
        <div className="w-16 h-16 rounded-full border-2 border-emerald-100 border-t-emerald-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-emerald-700 animate-pulse">
          <Sprout size={24} />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-xs sm:text-sm font-medium text-slate-700 tracking-wide font-serif italic">
          Nurturing fresh botanicals...
        </p>
        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden mx-auto">
          <div className="w-full h-full bg-emerald-500 rounded-full animate-indeterminate" />
        </div>
      </div>
    </div>
  );
};
