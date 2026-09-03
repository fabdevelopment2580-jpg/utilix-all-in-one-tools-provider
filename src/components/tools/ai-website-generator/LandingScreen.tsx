import React, { useState } from 'react';
import { 
  Sparkles, 
  Wand2, 
  ChevronDown, 
  ChevronUp, 
  Key, 
  Globe, 
  FolderKanban, 
  Layers, 
  Palette, 
  Type, 
  Zap, 
  ArrowRight,
  LayoutGrid
} from 'lucide-react';
import { GenerationOptions } from '../../../types/websiteBuilder';

interface LandingScreenProps {
  onGenerate: (prompt: string, options: GenerationOptions, apiKey: string) => void;
  onOpenDashboard: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  isGenerating: boolean;
}

const EXAMPLE_PROMPTS = [
  "Create a modern 5-page website for a digital marketing agency called Nova Growth. Include Home, About, Services, Portfolio and Contact pages. Use a premium dark design with blue accents.",
  "Build a luxury restaurant website for 'Aura Bistro' with Home, Menu, Reservations, Our Story and Contact. Use warm golden lighting and elegant typography.",
  "Design a SaaS landing page and 3-page site for an AI productivity app called 'TaskMind' with pricing tiers, feature comparison, and customer testimonials.",
  "Build a personal portfolio website for a Senior UI/UX Designer featuring projects, interactive resume, skill badges, and a contact form.",
  "Create a 5-page real estate agency website for 'Apex Properties' with property listings grid, team section, client reviews, and inquiry forms."
];

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onGenerate,
  onOpenDashboard,
  apiKey,
  setApiKey,
  isGenerating
}) => {
  const [prompt, setPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const [options, setOptions] = useState<GenerationOptions>({
    type: 'Business',
    pagesCount: 5,
    style: 'Modern',
    colors: 'Dark Blue Accent (#0b132b, #f59e0b)',
    typography: 'Modern Clean (Plus Jakarta Sans)',
    animations: 'Smooth'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate(prompt, options, apiKey);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 dark:bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
            <Wand2 className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              AI Website Generator <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-400 font-semibold border border-amber-400/30">14th Tool</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Generate, preview, visually edit, and export complete multi-page HTML/CSS/JS websites.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenDashboard}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#162244] hover:bg-slate-200 dark:hover:bg-[#1f2e5c] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-800"
          >
            <FolderKanban className="w-4 h-4 text-amber-500" />
            <span>My Saved Projects</span>
          </button>
        </div>
      </div>

      {/* Hero Intro */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-300 dark:border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Full Multi-Page Generation • Visual & Code Editing • ZIP Export</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Build Your Website with AI
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Describe your idea. AI will design, structure, and write complete working multi-page HTML, CSS, and JavaScript website code with a live preview editor.
        </p>
      </div>

      {/* Main Generator Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111c38] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Describe the website you want to build
          </label>
          <div className="relative">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Create a modern 5-page website for a digital marketing agency called Nova Growth. Include Home, About, Services, Portfolio and Contact pages. Use a premium dark design with blue accents..."
              className="w-full p-4 bg-slate-50 dark:bg-[#162244] text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Quick Example Prompt Chips */}
        <div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Or choose an example prompt to start:
          </span>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(ex)}
                className="text-left text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#162244] hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-800 dark:hover:text-amber-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer line-clamp-1 max-w-xs"
              >
                ✨ {ex.slice(0, 42)}...
              </button>
            ))}
          </div>
        </div>

        {/* Expandable Advanced Options */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 py-2 cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              Advanced Generation Settings
            </span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-2 bg-slate-50 dark:bg-[#162244] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              {/* Website Type */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-500" /> Website Category
                </label>
                <select
                  value={options.type}
                  onChange={(e) => setOptions({ ...options, type: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-[#111c38] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none"
                >
                  <option value="Business">Business</option>
                  <option value="Agency">Agency</option>
                  <option value="Portfolio">Portfolio</option>
                  <option value="SaaS">SaaS Product</option>
                  <option value="E-commerce">E-commerce Frontend</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Education">Educational / School</option>
                  <option value="Personal">Personal / Blog</option>
                  <option value="Event">Event / Conference</option>
                  <option value="Real Estate">Real Estate</option>
                </select>
              </div>

              {/* Pages Count */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-amber-500" /> Number of Pages
                </label>
                <select
                  value={options.pagesCount}
                  onChange={(e) => setOptions({ ...options, pagesCount: parseInt(e.target.value) })}
                  className="w-full p-2.5 bg-white dark:bg-[#111c38] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none"
                >
                  <option value={1}>1 Page (Landing Page)</option>
                  <option value={3}>3 Pages (Home, About, Contact)</option>
                  <option value={5}>5 Pages (Home, About, Services, Portfolio, Contact)</option>
                  <option value={7}>7 Pages (Full Comprehensive Site)</option>
                </select>
              </div>

              {/* Design Style */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Design Aesthetic
                </label>
                <select
                  value={options.style}
                  onChange={(e) => setOptions({ ...options, style: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-[#111c38] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none"
                >
                  <option value="Modern">Modern & Sleek</option>
                  <option value="Minimal">Minimalist</option>
                  <option value="Professional">Corporate & Professional</option>
                  <option value="Luxury">Dark Luxury & Gold</option>
                  <option value="Bold">Bold & Vibrant</option>
                  <option value="Glassmorphism">Glassmorphism / Neon</option>
                </select>
              </div>

              {/* Palette */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-500" /> Color Scheme
                </label>
                <input
                  type="text"
                  value={options.colors}
                  onChange={(e) => setOptions({ ...options, colors: e.target.value })}
                  placeholder="e.g. Navy dark background with gold accents"
                  className="w-full p-2.5 bg-white dark:bg-[#111c38] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                />
              </div>

              {/* Typography */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-amber-500" /> Typography
                </label>
                <select
                  value={options.typography}
                  onChange={(e) => setOptions({ ...options, typography: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-[#111c38] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none"
                >
                  <option value="Modern Clean (Plus Jakarta Sans)">Modern Clean (Plus Jakarta Sans)</option>
                  <option value="Elegant Serif (Playfair Display)">Elegant Serif (Playfair Display)</option>
                  <option value="SaaS Minimal (Inter / System)">SaaS Minimal (Inter)</option>
                  <option value="Bold Impact (Outfit)">Bold Impact (Outfit)</option>
                </select>
              </div>

              {/* Animations */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Animations
                </label>
                <select
                  value={options.animations}
                  onChange={(e) => setOptions({ ...options, animations: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-[#111c38] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none"
                >
                  <option value="Smooth">Smooth Micro-interactions</option>
                  <option value="Subtle">Subtle Fade Transitions</option>
                  <option value="Advanced">Advanced Scroll & Hover Effects</option>
                  <option value="None">Static (No Animations)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* API Key Toggle Drawer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-amber-500 flex items-center gap-1.5 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{showApiKeyInput ? 'Hide API Key Settings' : 'Custom API Key (OpenRouter / Gemini)'}</span>
          </button>

          <span className="text-[11px] text-slate-400">
            {apiKey ? '✓ Key Configured' : 'Using System Default Key'}
          </span>
        </div>

        {showApiKeyInput && (
          <div className="p-3 bg-slate-50 dark:bg-[#162244] rounded-xl border border-slate-200 dark:border-slate-800">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter OpenRouter API Key (sk-or-...) or Gemini API Key"
              className="w-full p-2 bg-white dark:bg-[#111c38] text-slate-900 dark:text-white text-xs rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">Pre-configured with your active AI Studio key. You can also paste an OpenRouter or Gemini API key.</p>
          </div>
        )}

        {/* Submit Action */}
        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-base transition-all shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          <Wand2 className="w-5 h-5" />
          <span>{isGenerating ? 'Generating Website...' : 'Generate Complete Website'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
