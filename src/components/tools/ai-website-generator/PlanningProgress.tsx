import React from 'react';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';

interface PlanningProgressProps {
  currentStep: string;
}

const ALL_STEPS = [
  'Understanding website concept...',
  'Planning page architecture & site map...',
  'Designing design system, colors & typography...',
  'Generating HTML pages, CSS styles & JS interactions...',
  'Finalizing project & building live preview...'
];

export const PlanningProgress: React.FC<PlanningProgressProps> = ({ currentStep }) => {
  const currentIndex = ALL_STEPS.findIndex(step => step === currentStep);

  return (
    <div className="max-w-xl mx-auto my-16 p-8 bg-white dark:bg-[#111c38] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-400/20 text-amber-500 flex items-center justify-center mx-auto animate-pulse">
        <Sparkles className="w-8 h-8" />
      </div>

      <div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Generating Your Website</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Our AI web architect is designing your complete multi-page code structure.</p>
      </div>

      <div className="space-y-3 text-left max-w-md mx-auto pt-2">
        {ALL_STEPS.map((step, idx) => {
          const isDone = idx < currentIndex || (currentIndex === -1 && idx === ALL_STEPS.length - 1);
          const isCurrent = idx === currentIndex;

          return (
            <div 
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isCurrent 
                  ? 'bg-amber-50 dark:bg-[#162244] border border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 font-bold text-xs' 
                  : isDone 
                  ? 'text-slate-700 dark:text-slate-300 text-xs font-semibold' 
                  : 'text-slate-400 dark:text-slate-600 text-xs opacity-50'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
