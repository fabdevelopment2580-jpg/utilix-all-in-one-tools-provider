import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export const PrivacyNotice: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-slate-700/60">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
        <span>100% Client-Side Local Processing</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl my-6">
      <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
        <Lock className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Your Privacy is Protected
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
          All processing for this tool runs entirely locally inside your browser. Your images, PDFs, text, and files never leave your device or get uploaded to external servers.
        </p>
      </div>
    </div>
  );
};
