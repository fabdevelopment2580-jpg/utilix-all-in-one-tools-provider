import React from 'react';
import { Sparkles, Shield, Zap, ArrowDown, Cpu, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Hero: React.FC = () => {
  const { setActiveToolId } = useApp();

  const scrollToGrid = () => {
    const el = document.getElementById('tool-directory');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/5 dark:via-transparent dark:to-transparent border-b border-slate-200/60 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#111c38] text-amber-700 dark:text-amber-400 text-xs font-semibold shadow-sm border border-amber-200/80 dark:border-amber-500/30 mb-6">
          <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>13 Powerful Browser Utilities • 100% Client-Side</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Everything You Need. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent">
            In One Place.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Access 13 essential browser tools for editing images, converting PDFs, generating QR codes, formatting code, and more — completely private and fast.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={scrollToGrid}
            className="px-7 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-400/20 hover:shadow-amber-400/30 transition-all flex items-center gap-2 group cursor-pointer"
          >
            <span>Explore Tools</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>

          <button
            onClick={() => setActiveToolId('image-editor')}
            className="px-7 py-3.5 rounded-xl bg-white dark:bg-[#111c38] hover:bg-slate-100 dark:hover:bg-[#162244] text-slate-900 dark:text-slate-100 font-semibold text-sm border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Try Image Editor</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-white/80 dark:bg-[#111c38] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Zero Server Uploads</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-300">Your files stay on your device</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/80 dark:bg-[#111c38] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Instant Local Speed</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-300">Powered by browser APIs</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/80 dark:bg-[#111c38] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">100% Free Forever</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-300">No accounts or API keys required</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
