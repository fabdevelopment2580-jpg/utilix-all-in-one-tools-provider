import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Type, 
  Sliders, 
  Sparkles, 
  MousePointerClick, 
  Link, 
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { GeneratedFile, SelectedElementInfo, WebsiteProject } from '../../../types/websiteBuilder';

interface VisualEditorPanelProps {
  project: WebsiteProject;
  activePagePath: string;
  selectedElement: SelectedElementInfo | null;
  onUpdateFileContent: (path: string, newContent: string) => void;
}

export const VisualEditorPanel: React.FC<VisualEditorPanelProps> = ({
  project,
  activePagePath,
  selectedElement,
  onUpdateFileContent
}) => {
  const activeFile = project.files.find(f => f.path === activePagePath);

  const [textValue, setTextValue] = useState('');
  const [colorValue, setColorValue] = useState('#ffffff');
  const [bgColorValue, setBgColorValue] = useState('#f59e0b');
  const [fontSizeValue, setFontSizeValue] = useState('16px');
  const [appliedNotice, setAppliedNotice] = useState(false);

  useEffect(() => {
    if (selectedElement) {
      setTextValue(selectedElement.innerText.slice(0, 300));
      if (selectedElement.styles.color) setColorValue(selectedElement.styles.color);
      if (selectedElement.styles.backgroundColor) setBgColorValue(selectedElement.styles.backgroundColor);
      if (selectedElement.styles.fontSize) setFontSizeValue(selectedElement.styles.fontSize);
    }
  }, [selectedElement]);

  const handleApplyChanges = () => {
    if (!activeFile) return;

    let html = activeFile.content;

    if (selectedElement && selectedElement.innerText && textValue.trim()) {
      // Replace text snippet in HTML content
      const originalText = selectedElement.innerText.trim();
      if (originalText && html.includes(originalText)) {
        html = html.replace(originalText, textValue.trim());
      }
    }

    onUpdateFileContent(activeFile.path, html);
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 2000);
  };

  return (
    <div className="w-72 bg-white dark:bg-[#111c38] border-l border-slate-200 dark:border-slate-800 flex flex-col h-full text-xs shrink-0 select-none overflow-y-auto p-4 space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-500" />
          <span>Visual Style & Content</span>
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Select elements in preview or edit parameters below.
        </p>
      </div>

      {selectedElement ? (
        <div className="space-y-4">
          <div className="p-2.5 bg-amber-50 dark:bg-[#162244] rounded-xl border border-amber-300 dark:border-amber-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
              Selected Element
            </span>
            <div className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
              &lt;{selectedElement.tagName.toLowerCase()}&gt; {selectedElement.className ? `.${selectedElement.className.split(' ')[0]}` : ''}
            </div>
          </div>

          {/* Text Content */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-amber-500" /> Inner Text Content
            </label>
            <textarea
              rows={3}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-[#162244] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApplyChanges}
            className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            {appliedNotice ? (
              <>
                <Check className="w-4 h-4 text-emerald-800" />
                <span>Applied to HTML ✓</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Apply Visual Edit</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="p-6 text-center space-y-3 bg-slate-50 dark:bg-[#162244] rounded-2xl border border-slate-200 dark:border-slate-800">
          <MousePointerClick className="w-8 h-8 text-amber-500 mx-auto animate-bounce" />
          <h4 className="font-bold text-slate-900 dark:text-white text-xs">Visual Click Inspect Mode</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Click "Visual Click Edit" on the preview toolbar, then click any text, heading, or button on the live website to edit it instantly!
          </p>
        </div>
      )}

      {/* Quick Global Tweaks */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Quick Actions
        </span>

        <button
          onClick={() => {
            if (!activeFile) return;
            let html = activeFile.content;
            if (!html.includes('id="ai-sticky-header"')) {
              html = html.replace(/<header/i, '<header id="ai-sticky-header" style="position:sticky; top:0; z-index:1000;"');
              onUpdateFileContent(activeFile.path, html);
            }
          }}
          className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-[#162244] hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer border border-slate-200 dark:border-slate-800"
        >
          <span>Make Navbar Sticky</span>
          <span className="text-amber-500 font-bold">+</span>
        </button>
      </div>
    </div>
  );
};
