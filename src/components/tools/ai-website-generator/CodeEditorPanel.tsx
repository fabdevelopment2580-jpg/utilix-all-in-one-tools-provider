import React, { useState } from 'react';
import { 
  Code, 
  FileCode, 
  Copy, 
  Check, 
  Wand2, 
  Sparkles,
  Search,
  RotateCcw
} from 'lucide-react';
import { GeneratedFile, WebsiteProject } from '../../../types/websiteBuilder';

interface CodeEditorPanelProps {
  project: WebsiteProject;
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  onUpdateFileContent: (path: string, newContent: string) => void;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  project,
  activeFilePath,
  onSelectFile,
  onUpdateFileContent
}) => {
  const activeFile = project.files.find(f => f.path === activeFilePath) || project.files[0];

  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!activeFile) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = activeFile.content.split('\n');

  return (
    <div className="flex-1 flex flex-col bg-[#0b132b] text-slate-200 h-full font-mono text-xs overflow-hidden">
      {/* Editor File Bar */}
      <div className="h-10 bg-[#070c1a] border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto">
          {project.files.map(file => {
            const isActive = file.path === activeFilePath;
            return (
              <button
                key={file.path}
                onClick={() => onSelectFile(file.path)}
                className={`px-3 py-1 rounded-t-lg font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isActive 
                    ? 'bg-[#0b132b] text-amber-400 font-bold border-t-2 border-amber-400' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111c38]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{file.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-[#162244] hover:bg-[#1f2e5c] text-slate-300 text-[11px] font-sans font-semibold transition-colors flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Editor Main Textarea Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers */}
        <div className="py-3 px-3 bg-[#070c1a] text-slate-600 select-none text-right font-mono text-[11px] border-r border-slate-800/60 shrink-0">
          {lines.map((_, i) => (
            <div key={i} className="h-5 leading-5">{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={activeFile.content}
          onChange={(e) => onUpdateFileContent(activeFile.path, e.target.value)}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-slate-100 font-mono text-xs leading-5 focus:outline-none resize-none overflow-auto whitespace-pre"
        />
      </div>
    </div>
  );
};
