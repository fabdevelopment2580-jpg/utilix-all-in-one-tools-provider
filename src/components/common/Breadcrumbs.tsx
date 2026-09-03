import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BreadcrumbsProps {
  toolName?: string;
  categoryName?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ toolName, categoryName }) => {
  const { setActiveToolId } = useApp();

  return (
    <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-6">
      <button
        onClick={() => setActiveToolId(null)}
        className="flex items-center gap-1.5 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </button>

      {categoryName && (
        <>
          <ChevronRight className="w-4 h-4 mx-2 text-slate-400 dark:text-slate-600" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">{categoryName}</span>
        </>
      )}

      {toolName && (
        <>
          <ChevronRight className="w-4 h-4 mx-2 text-slate-400 dark:text-slate-600" />
          <span className="text-slate-900 dark:text-slate-100 font-semibold">{toolName}</span>
        </>
      )}
    </nav>
  );
};
