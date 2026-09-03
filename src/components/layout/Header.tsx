import React, { useState, useRef, useEffect } from 'react';
import { 
  Wrench, 
  Search, 
  Sun, 
  Moon, 
  Star, 
  ChevronDown, 
  X, 
  Menu, 
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TOOLS, CATEGORIES } from '../../data/toolsData';

export const Header: React.FC = () => {
  const { 
    theme, 
    toggleTheme, 
    activeToolId, 
    setActiveToolId, 
    searchQuery, 
    setSearchQuery,
    favorites
  } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const favoriteTools = TOOLS.filter(tool => favorites.includes(tool.id));

  // Search matching logic
  const searchMatches = searchQuery.trim()
    ? TOOLS.filter(tool => {
        const q = searchQuery.toLowerCase().trim();
        return (
          tool.name.toLowerCase().includes(q) ||
          tool.description.toLowerCase().includes(q) ||
          tool.categoryLabel.toLowerCase().includes(q) ||
          tool.keywords.some(k => k.toLowerCase().includes(q))
        );
      })
    : [];

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchMatches.length > 0) {
        setActiveToolId(searchMatches[0].id);
        setIsSearchFocused(false);
      } else {
        setActiveToolId(null);
        setIsSearchFocused(false);
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0b132b]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => { setActiveToolId(null); setSearchQuery(''); }}
            className="flex items-center gap-2.5 group focus:outline-none cursor-pointer"
            aria-label="Utilix Home"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400 dark:bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5 text-slate-950" />
            </div>
            <div className="text-left">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Utilix<span className="text-amber-500">.</span>
              </span>
            </div>
          </button>

          {/* Navigation Dropdown (Desktop) */}
          <div className="hidden md:relative md:block" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span>Tools</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Megamenu Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-[540px] bg-white dark:bg-[#111c38] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 grid grid-cols-2 gap-4 z-50">
                {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                  const catTools = TOOLS.filter(t => t.category === cat.id);
                  return (
                    <div key={cat.id} className="space-y-1.5">
                      <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider px-2">
                        {cat.label}
                      </h4>
                      <div className="space-y-0.5">
                        {catTools.map(tool => (
                          <button
                            key={tool.id}
                            onClick={() => {
                              setActiveToolId(tool.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              activeToolId === tool.id
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span>{tool.name}</span>
                            {tool.isPopular && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-700 dark:text-amber-300 font-semibold">
                                Popular
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block relative" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search tools... (e.g. compress, qr, clock, pdf)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-9 py-2 bg-slate-100 dark:bg-[#162244] text-slate-900 dark:text-white text-sm rounded-xl border border-transparent focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-[#0f172a] focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchFocused(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Live Search Overlay Dropdown */}
          {isSearchFocused && searchQuery.trim() !== '' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#111c38] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 max-h-[380px] overflow-y-auto">
              <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#162244] border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Matching Tools ({searchMatches.length})</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-normal">Press Enter for top match</span>
              </div>

              {searchMatches.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {searchMatches.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setActiveToolId(tool.id);
                        setIsSearchFocused(false);
                      }}
                      className="w-full text-left p-3 hover:bg-amber-50/80 dark:hover:bg-[#1c2a52] transition-colors flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shrink-0 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                            {tool.name}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase shrink-0">
                            {tool.categoryLabel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-1 mt-0.5">
                          {tool.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    No tools found matching "{searchQuery}"
                  </p>
                  <button
                    onClick={() => {
                      setActiveToolId(null);
                      setIsSearchFocused(false);
                    }}
                    className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    View all 13 tools in directory &rarr;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Favorites Button */}
          <div className="relative">
            <button
              onClick={() => setIsFavoritesOpen(!isFavoritesOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors cursor-pointer"
              title="Favorite Tools"
            >
              <Star className={`w-5 h-5 ${favoriteTools.length > 0 ? 'fill-amber-400 text-amber-400' : ''}`} />
              {favoriteTools.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500"></span>
              )}
            </button>

            {/* Favorites Popover */}
            {isFavoritesOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#111c38] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    Favorite Tools ({favoriteTools.length})
                  </span>
                  <button onClick={() => setIsFavoritesOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {favoriteTools.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Click the star icon on any tool card to save it here for quick access.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {favoriteTools.map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          setActiveToolId(tool.id);
                          setIsFavoritesOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-300 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>{tool.name}</span>
                        <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle Button (Moon / Sun) */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#162244] border border-transparent dark:border-slate-700/60 transition-colors cursor-pointer flex items-center gap-1.5"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Dark Mode"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-slate-800" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search & Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b132b] px-4 py-4 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-[#162244] text-slate-900 dark:text-white text-sm rounded-xl border border-transparent focus:outline-none"
            />
          </div>

          {/* Mobile Search Results or Categories */}
          {searchQuery.trim() !== '' ? (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Matching Tools ({searchMatches.length})
              </span>
              {searchMatches.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setActiveToolId(tool.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#162244] text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between"
                >
                  <span>{tool.name}</span>
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              <button
                onClick={() => { setActiveToolId(null); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                All Tools Overview
              </button>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 px-3 uppercase tracking-wider">
                  Categories
                </span>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {TOOLS.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setActiveToolId(tool.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                    >
                      {tool.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
