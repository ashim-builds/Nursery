import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { careApi } from '../api/care.api';
import { SEO } from '../components/common/SEO';
import { Sparkles, Sun, Droplets, HeartHandshake, Search, BookOpen, Bug, ShieldCheck, Sprout } from 'lucide-react';
import { CareGuide } from '../types/care';

export const PlantDoctorPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<CareGuide | null>(null);

  const { data: guides, isLoading } = useQuery({
    queryKey: ['care-guides'],
    queryFn: careApi.getGuides,
  });

  const filteredGuides = guides?.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.species?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 pb-20">
      {/* Dynamic SEO Meta */}
      <SEO
        title="Kathmandu Plant Doctor & Botanical Care Clinic | KtmBotanica"
        description="Expert plant care guides, seasonal Kathmandu monsoon and winter advice, pest troubleshooting, and soil recipes from KtmBotanica's resident botanists."
        canonical="https://ktmbotanica.com/plant-doctor"
      />
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-lifted">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles size={14} className="text-emerald-400" />
            <span>KtmBotanica Plant Doctor & Care Clinic</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
            Botanical Care & Diagnostics for Kathmandu Valley
          </h1>

          <p className="text-xs sm:text-sm text-forest-100 font-light leading-relaxed">
            From winter dormancy to monsoon humidity management and pest control, explore expert guides tailored specifically for Nepali climates.
          </p>

          {/* Search bar inside hero */}
          <div className="pt-2 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search care guides (e.g. Monstera, Sayapatri, Pothos)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 focus:bg-white focus:text-slate-900 focus:border-emerald-400 rounded-2xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-forest-200 outline-none transition-all shadow-inner"
              />
              <Search size={16} className="absolute left-3.5 top-3 text-emerald-300 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Guide Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
            <BookOpen size={20} className="text-forest-700" />
            <span>Plant Care Manuals ({filteredGuides?.length || 0})</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredGuides?.map((guide) => (
              <div
                key={guide.id}
                className="bg-white rounded-3xl border border-forest-100 overflow-hidden shadow-soft hover:shadow-lifted hover:border-forest-300 transition-all flex flex-col justify-between"
              >
                {guide.imageUrl && (
                  <div className="h-44 overflow-hidden bg-forest-50 relative">
                    <img
                      src={guide.imageUrl}
                      alt={guide.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 bg-forest-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {guide.difficulty === 'EASY' ? 'Beginner Care' : 'Specialized Care'}
                    </span>
                  </div>
                )}

                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-serif font-bold text-base text-slate-900 leading-snug">
                      {guide.title}
                    </h3>
                    {guide.species && (
                      <p className="text-[11px] text-forest-600 font-serif italic">
                        {guide.species}
                      </p>
                    )}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {guide.summary}
                    </p>
                  </div>

                  {/* Quick specs pill badges */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex items-start gap-1.5 text-xs text-slate-700">
                      <Sun size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{guide.sunlightTips}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-xs text-slate-700">
                      <Droplets size={14} className="text-sky-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{guide.wateringTips}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedGuide(guide)}
                    className="w-full mt-2 bg-forest-50 hover:bg-forest-100 text-forest-900 border border-forest-200 text-xs font-bold py-2.5 rounded-xl transition-colors text-center"
                  >
                    Open Detailed Guide
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guide Detail Modal / Drawer */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-8 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-forest-700 uppercase tracking-wider block">
                  Botanical Care Guide
                </span>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 mt-0.5">
                  {selectedGuide.title}
                </h3>
                {selectedGuide.species && (
                  <p className="text-xs text-slate-500 italic font-serif">{selectedGuide.species}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-forest-50/70 p-3.5 rounded-2xl border border-forest-100">
              {selectedGuide.summary}
            </p>

            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <Sun size={15} /> Sunlight & Placement
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed pl-5">{selectedGuide.sunlightTips}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                  <Droplets size={15} /> Watering Schedule
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed pl-5">{selectedGuide.wateringTips}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-forest-800 flex items-center gap-1.5">
                  <Sprout size={15} /> Soil Mix & Repotting
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed pl-5">
                  {selectedGuide.soilTips} {selectedGuide.repottingTips && `• ${selectedGuide.repottingTips}`}
                </p>
              </div>

              {selectedGuide.pestControlTips && (
                <div className="space-y-1">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                    <Bug size={15} /> Pest Protection (Neem Oil Advice)
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed pl-5">{selectedGuide.pestControlTips}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedGuide(null)}
                className="bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
