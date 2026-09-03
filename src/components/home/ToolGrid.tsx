import React, { useState } from 'react';
import { 
  Wand2,
  Image, 
  Minimize2, 
  RefreshCw, 
  Scaling, 
  FileText, 
  Edit3, 
  KeyRound, 
  QrCode, 
  Palette, 
  Paintbrush, 
  Code2, 
  Clock, 
  Calculator, 
  Star, 
  ArrowRight, 
  SearchX
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TOOLS, CATEGORIES } from '../../data/toolsData';
import { ToolCategory, ToolItem } from '../../types';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Wand2,
  Image, 
  Minimize2, 
  RefreshCw, 
  Scaling, 
  FileText, 
  Edit3, 
  KeyRound, 
  QrCode, 
  Palette, 
  Paintbrush, 
  Code2, 
  Clock, 
  Calculator, 
};

export const ToolGrid: React.FC = () => {
  const { setActiveToolId, searchQuery, setSearchQuery, isFavorite, toggleFavorite } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');

  const filteredTools = TOOLS.filter(tool => {
    // Category match
    if (selectedCategory !== 'all' && tool.category !== selectedCategory) {
      return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = tool.name.toLowerCase().includes(q);
      const descMatch = tool.description.toLowerCase().includes(q);
      const catMatch = tool.categoryLabel.toLowerCase().includes(q);
      const kwMatch = tool.keywords.some(k => k.toLowerCase().includes(q));
      return nameMatch || descMatch || catMatch || kwMatch;
    }

    return true;
  });

  return (
    <section id="tool-directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Category Filter Pills & Search Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tool Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose a tool below. Everything processes locally in your browser.
          </p>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as ToolCategory)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tools */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No tools found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            We couldn't find any tool matching "{searchQuery}". Try adjusting your search term or category.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-500 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTools.map(tool => {
            const IconComponent = ICON_MAP[tool.iconName] || Image;
            const fav = isFavorite(tool.id);

            return (
              <div
                key={tool.id}
                onClick={() => setActiveToolId(tool.id)}
                className="group relative bg-white dark:bg-[#111c38] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 hover:border-amber-400/80 dark:hover:border-amber-500/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                {/* Card Header: Icon + Category Badge + Favorite Star */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-amber-400/15 text-amber-600 dark:text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-[#162244] px-2 py-0.5 rounded-md">
                        {tool.categoryLabel}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(tool.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-300 dark:text-slate-500 hover:text-amber-400 transition-colors"
                        title={fav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className={`w-4 h-4 ${fav ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Tool Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {tool.name}
                  </h3>

                  {/* Tool Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-1.5 leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                {/* Card Footer: CTA Arrow */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  <span>Open Tool</span>
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#162244] group-hover:bg-amber-400 group-hover:text-slate-950 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
