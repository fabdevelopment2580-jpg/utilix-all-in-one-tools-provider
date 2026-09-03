import React, { useState } from 'react';
import { Wand2, Sparkles, Send, Loader2, RefreshCw } from 'lucide-react';

interface AiModifyPanelProps {
  onModify: (instruction: string) => void;
  isModifying: boolean;
}

const EXAMPLE_INSTRUCTIONS = [
  "Add a testimonials section with client reviews to the homepage.",
  "Change the primary accent color scheme to luxury black and gold.",
  "Make the navbar sticky and add a blur background effect on scroll.",
  "Add an interactive FAQ accordion section on the Services page.",
  "Add pricing plans with Monthly/Yearly toggle switch."
];

export const AiModifyPanel: React.FC<AiModifyPanelProps> = ({ onModify, isModifying }) => {
  const [instruction, setInstruction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isModifying) return;
    onModify(instruction.trim());
    setInstruction('');
  };

  return (
    <div className="p-4 bg-white dark:bg-[#111c38] border-t border-slate-200 dark:border-slate-800 shadow-2xl">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white text-xs">
            Ask AI to Modify Website Code & Styling
          </span>
        </div>

        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={isModifying}
            placeholder="e.g. Add a testimonials section to the homepage, change primary color to gold..."
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-[#162244] text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!instruction.trim() || isModifying}
            className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {isModifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Modifying...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Apply AI Edit</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
          <span className="text-slate-400 font-semibold shrink-0">Suggestions:</span>
          {EXAMPLE_INSTRUCTIONS.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInstruction(ex)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#162244] hover:bg-amber-100 dark:hover:bg-amber-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shrink-0 transition-colors cursor-pointer"
            >
              ✨ {ex.slice(0, 36)}...
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};
