import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Eye, 
  Sliders, 
  Code2, 
  Download, 
  PackageCheck, 
  Undo2, 
  Redo2, 
  FolderKanban,
  Sparkles,
  FileDown
} from 'lucide-react';
import JSZip from 'jszip';
import { WebsiteProject } from '../../../types/websiteBuilder';

interface BuilderToolbarProps {
  project: WebsiteProject;
  activeView: 'preview' | 'visual' | 'code';
  setActiveView: (view: 'preview' | 'visual' | 'code') => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onBackToLanding: () => void;
  onOpenDashboard: () => void;
}

export const BuilderToolbar: React.FC<BuilderToolbarProps> = ({
  project,
  activeView,
  setActiveView,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onBackToLanding,
  onOpenDashboard
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();

      project.files.forEach(file => {
        zip.file(file.path, file.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-website.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-14 bg-white dark:bg-[#0b132b] border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shrink-0 select-none">
      {/* Left Project Info & Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToLanding}
          className="p-2 rounded-xl bg-slate-100 dark:bg-[#162244] hover:bg-slate-200 dark:hover:bg-[#1f2e5c] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          title="Back to Generator Landing"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div>
          <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span>{project.name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
              {project.files.length} Files
            </span>
          </h2>
        </div>
      </div>

      {/* Center View Mode Switcher */}
      <div className="flex items-center bg-slate-100 dark:bg-[#162244] p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveView('preview')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeView === 'preview'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Preview</span>
        </button>

        <button
          onClick={() => setActiveView('visual')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeView === 'visual'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Visual Editor</span>
        </button>

        <button
          onClick={() => setActiveView('code')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeView === 'code'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Code Editor</span>
        </button>
      </div>

      {/* Right Undo/Redo & Export */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#162244] p-1 rounded-xl">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-amber-500 disabled:opacity-30 cursor-pointer"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-amber-500 disabled:opacity-30 cursor-pointer"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={onOpenDashboard}
          className="p-2 rounded-xl bg-slate-100 dark:bg-[#162244] hover:bg-slate-200 dark:hover:bg-[#1f2e5c] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          title="Saved Projects"
        >
          <FolderKanban className="w-4 h-4 text-amber-500" />
        </button>

        <button
          onClick={handleExportZip}
          disabled={isExporting}
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Zipping...' : 'Export ZIP'}</span>
        </button>
      </div>
    </div>
  );
};
