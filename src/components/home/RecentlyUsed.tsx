import React from 'react';
import { History, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TOOLS } from '../../data/toolsData';

export const RecentlyUsed: React.FC = () => {
  const { recentToolIds, setActiveToolId } = useApp();

  const recentTools = TOOLS.filter(tool => recentToolIds.includes(tool.id));

  if (recentTools.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-amber-500" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Recently Used
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {recentTools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveToolId(tool.id)}
            className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-amber-400 dark:hover:border-amber-500/50 shadow-sm text-left transition-all group flex items-center justify-between"
          >
            <div className="truncate pr-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors block truncate">
                {tool.name}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                {tool.categoryLabel}
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
