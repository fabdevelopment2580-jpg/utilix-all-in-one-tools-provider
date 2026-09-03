import React, { useState } from 'react';
import { 
  FileText, 
  Code, 
  Plus, 
  Trash2, 
  Copy, 
  Edit2, 
  ChevronRight, 
  ChevronDown, 
  Globe,
  FileCode,
  Check,
  X
} from 'lucide-react';
import { GeneratedFile, WebsiteProject } from '../../../types/websiteBuilder';

interface FileExplorerPanelProps {
  project: WebsiteProject;
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  onAddPage: (pageName: string) => void;
  onRenameFile: (oldPath: string, newPath: string) => void;
  onDuplicateFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
}

export const FileExplorerPanel: React.FC<FileExplorerPanelProps> = ({
  project,
  activeFilePath,
  onSelectFile,
  onAddPage,
  onRenameFile,
  onDuplicateFile,
  onDeleteFile
}) => {
  const [newPageName, setNewPageName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const htmlFiles = project.files.filter(f => f.type === 'html' || f.path.endsWith('.html'));
  const otherFiles = project.files.filter(f => f.type !== 'html' && !f.path.endsWith('.html'));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim()) return;
    onAddPage(newPageName.trim());
    setNewPageName('');
    setShowAddModal(false);
  };

  const handleStartRename = (file: GeneratedFile) => {
    setEditingPath(file.path);
    setEditName(file.name);
  };

  const handleSaveRename = (file: GeneratedFile) => {
    if (editName.trim() && editName !== file.name) {
      const newPath = file.path.includes('/') 
        ? file.path.substring(0, file.path.lastIndexOf('/') + 1) + editName.trim()
        : editName.trim();
      onRenameFile(file.path, newPath);
    }
    setEditingPath(null);
  };

  return (
    <div className="w-64 bg-slate-50 dark:bg-[#0b132b] border-r border-slate-200 dark:border-slate-800 flex flex-col h-full text-xs shrink-0 select-none">
      {/* Panel Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px]">
          Project Pages & Files
        </span>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-1 rounded-lg bg-amber-400/20 text-amber-600 dark:text-amber-400 hover:bg-amber-400 hover:text-slate-950 transition-colors cursor-pointer flex items-center gap-1 font-bold text-[10px] px-1.5"
          title="Add New HTML Page"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Page</span>
        </button>
      </div>

      {/* File List Scrollable */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Pages Section */}
        <div>
          <div className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Globe className="w-3 h-3" />
            <span>Pages ({htmlFiles.length})</span>
          </div>

          <div className="space-y-0.5 mt-1">
            {htmlFiles.map(file => {
              const isActive = activeFilePath === file.path;
              const isEditing = editingPath === file.path;

              return (
                <div
                  key={file.path}
                  onClick={() => onSelectFile(file.path)}
                  className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#162244]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                    {isEditing ? (
                      <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full bg-white dark:bg-[#111c38] px-1 py-0.5 rounded border border-amber-500 text-xs"
                          autoFocus
                        />
                        <button onClick={() => handleSaveRename(file)} className="text-emerald-500 hover:text-emerald-600">
                          <Check className="w-3 h-3" />
                        </button>
                        <button onClick={() => setEditingPath(null)} className="text-slate-400">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="truncate text-xs">{file.name}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStartRename(file); }}
                        className="p-1 text-slate-400 hover:text-amber-500"
                        title="Rename Page"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDuplicateFile(file.path); }}
                        className="p-1 text-slate-400 hover:text-amber-500"
                        title="Duplicate Page"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {htmlFiles.length > 1 && file.path !== 'index.html' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteFile(file.path); }}
                          className="p-1 text-slate-400 hover:text-rose-500"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Styles & Scripts Section */}
        <div>
          <div className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <FileCode className="w-3 h-3" />
            <span>Styles & Scripts ({otherFiles.length})</span>
          </div>

          <div className="space-y-0.5 mt-1">
            {otherFiles.map(file => {
              const isActive = activeFilePath === file.path;

              return (
                <div
                  key={file.path}
                  onClick={() => onSelectFile(file.path)}
                  className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#162244]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Code className={`w-3.5 h-3.5 shrink-0 ${file.type === 'css' ? 'text-cyan-500' : 'text-amber-500'}`} />
                    <span className="truncate text-xs">{file.path}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Page Dialog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c38] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Add New Website Page</h4>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Page Title or Filename</label>
                <input
                  type="text"
                  placeholder="e.g. pricing, blog, gallery"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-[#162244] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPageName.trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-500 disabled:opacity-50"
                >
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
