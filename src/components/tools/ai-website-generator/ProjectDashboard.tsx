import React from 'react';
import { 
  FolderKanban, 
  Plus, 
  Trash2, 
  Download, 
  ExternalLink, 
  Copy, 
  Calendar, 
  Globe, 
  ArrowLeft,
  Wand2
} from 'lucide-react';
import JSZip from 'jszip';
import { WebsiteProject } from '../../../types/websiteBuilder';

interface ProjectDashboardProps {
  projects: WebsiteProject[];
  onOpenProject: (proj: WebsiteProject) => void;
  onDuplicateProject: (proj: WebsiteProject) => void;
  onDeleteProject: (id: string) => void;
  onCreateNew: () => void;
  onBack: () => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  projects,
  onOpenProject,
  onDuplicateProject,
  onDeleteProject,
  onCreateNew,
  onBack
}) => {
  const handleExportZip = async (project: WebsiteProject, e: React.MouseEvent) => {
    e.stopPropagation();
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
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Dashboard Top Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#162244] hover:bg-slate-200 dark:hover:bg-[#1f2e5c] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-amber-500" />
              <span>Saved Website Projects</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage and export all websites created with AI Website Generator.</p>
          </div>
        </div>

        <button
          onClick={onCreateNew}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New AI Website</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#111c38] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/20 text-amber-500 flex items-center justify-center mx-auto">
            <Wand2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Saved Projects Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Describe any website idea in natural language to generate your first complete multi-page HTML/CSS/JS website.
          </p>
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First AI Website</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(proj => {
            const htmlCount = proj.files.filter(f => f.type === 'html' || f.path.endsWith('.html')).length;

            return (
              <div
                key={proj.id}
                onClick={() => onOpenProject(proj)}
                className="group bg-white dark:bg-[#111c38] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-400 border border-amber-400/30">
                      {proj.type || 'Website'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {htmlCount} {htmlCount === 1 ? 'Page' : 'Pages'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors line-clamp-1">
                    {proj.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(proj.updatedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onDuplicateProject(proj); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-[#162244]"
                      title="Duplicate Project"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleExportZip(proj, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-[#162244]"
                      title="Export ZIP"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteProject(proj.id); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-[#162244]"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
