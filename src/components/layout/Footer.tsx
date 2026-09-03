import React from 'react';
import { Wrench, ShieldCheck, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TOOLS } from '../../data/toolsData';

export const Footer: React.FC = () => {
  const { setActiveToolId } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Column 1: Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <Wrench className="w-4 h-4 text-slate-950" />
              </div>
              <span className="text-lg font-extrabold text-white">
                Utilix<span className="text-amber-400">.</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              An all-in-one suite of 13 fast, privacy-focused web tools designed for client-side processing directly in your browser.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>No API keys • No servers • 100% Private</span>
            </div>
          </div>

          {/* Column 2: Media & Image Tools */}
          <div>
            <h4 className="text-slate-200 font-bold mb-3 text-xs uppercase tracking-wider">Image & PDF Tools</h4>
            <ul className="space-y-1.5">
              {TOOLS.filter(t => t.category === 'image' || t.category === 'pdf').map(tool => (
                <li key={tool.id}>
                  <button
                    onClick={() => setActiveToolId(tool.id)}
                    className="hover:text-amber-400 transition-colors text-slate-400 text-left"
                  >
                    {tool.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Utilities & Design Tools */}
          <div>
            <h4 className="text-slate-200 font-bold mb-3 text-xs uppercase tracking-wider">Design & Code Tools</h4>
            <ul className="space-y-1.5">
              {TOOLS.filter(t => t.category === 'design' || t.category === 'text').map(tool => (
                <li key={tool.id}>
                  <button
                    onClick={() => setActiveToolId(tool.id)}
                    className="hover:text-amber-400 transition-colors text-slate-400 text-left"
                  >
                    {tool.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Utility Suite */}
          <div>
            <h4 className="text-slate-200 font-bold mb-3 text-xs uppercase tracking-wider">Calculators & Utilities</h4>
            <ul className="space-y-1.5">
              {TOOLS.filter(t => t.category === 'utility').map(tool => (
                <li key={tool.id}>
                  <button
                    onClick={() => setActiveToolId(tool.id)}
                    className="hover:text-amber-400 transition-colors text-slate-400 text-left"
                  >
                    {tool.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} Utilix Platform. All processing happens locally in your browser.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with local browser technology & privacy first</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
