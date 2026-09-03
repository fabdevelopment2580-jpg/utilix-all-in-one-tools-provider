import React, { useState, useEffect } from 'react';
import { 
  GeneratedFile, 
  GenerationOptions, 
  SelectedElementInfo, 
  WebsiteProject 
} from '../../types/websiteBuilder';
import { 
  generateWebsiteWithAi, 
  modifyWebsiteWithAi 
} from '../../services/aiWebsiteGenerator';

import { LandingScreen } from './ai-website-generator/LandingScreen';
import { PlanningProgress } from './ai-website-generator/PlanningProgress';
import { ProjectDashboard } from './ai-website-generator/ProjectDashboard';
import { BuilderToolbar } from './ai-website-generator/BuilderToolbar';
import { FileExplorerPanel } from './ai-website-generator/FileExplorerPanel';
import { LivePreviewPanel } from './ai-website-generator/LivePreviewPanel';
import { VisualEditorPanel } from './ai-website-generator/VisualEditorPanel';
import { CodeEditorPanel } from './ai-website-generator/CodeEditorPanel';
import { AiModifyPanel } from './ai-website-generator/AiModifyPanel';

const STORAGE_KEY = 'utilix_ai_website_projects';
const API_KEY_STORAGE = 'utilix_ai_api_key';

export const AiWebsiteGeneratorTool: React.FC = () => {
  // Screen States: 'landing' | 'planning' | 'workspace' | 'dashboard'
  const [screen, setScreen] = useState<'landing' | 'planning' | 'workspace' | 'dashboard'>('landing');

  // API Key State
  const [apiKey, setApiKey] = useState<string>(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE);
    if (stored && stored.startsWith('sk-or-v1-b2dc96fd')) {
      localStorage.removeItem(API_KEY_STORAGE);
      return '';
    }
    return stored || '';
  });

  // Saved Projects List
  const [projects, setProjects] = useState<WebsiteProject[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Active Website Project
  const [activeProject, setActiveProject] = useState<WebsiteProject | null>(null);

  // Undo / Redo History Stacks
  const [history, setHistory] = useState<GeneratedFile[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Active Workspace View: 'preview' | 'visual' | 'code'
  const [activeView, setActiveView] = useState<'preview' | 'visual' | 'code'>('preview');

  // Visual Inspection State
  const [isVisualInspectMode, setIsVisualInspectMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElementInfo | null>(null);

  // Progress Tracker State
  const [progressStep, setProgressStep] = useState('Understanding website concept...');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModifying, setIsModifying] = useState(false);

  // Save projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save website projects to localStorage:', e);
    }
  }, [projects]);

  // Save custom API Key to localStorage
  const handleSetApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem(API_KEY_STORAGE, key);
  };

  // Push State to History
  const pushHistory = (files: GeneratedFile[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(files)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Handle Generate New Website
  const handleGenerate = async (prompt: string, options: GenerationOptions, userKey: string) => {
    setIsGenerating(true);
    setScreen('planning');

    try {
      const project = await generateWebsiteWithAi(
        prompt, 
        options, 
        userKey || apiKey, 
        (step) => setProgressStep(step)
      );

      // Add to projects
      setProjects(prev => [project, ...prev]);
      setActiveProject(project);

      // Reset history
      setHistory([JSON.parse(JSON.stringify(project.files))]);
      setHistoryIndex(0);

      setScreen('workspace');
    } catch (err) {
      console.error('Generation error:', err);
      alert('Failed to generate website. Please try again.');
      setScreen('landing');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle AI Modification
  const handleAiModify = async (instruction: string) => {
    if (!activeProject || isModifying) return;
    setIsModifying(true);

    try {
      const updatedFiles = await modifyWebsiteWithAi(instruction, activeProject.files, apiKey);

      const updatedProj = {
        ...activeProject,
        files: updatedFiles,
        updatedAt: Date.now()
      };

      setActiveProject(updatedProj);
      updateProjectInList(updatedProj);
      pushHistory(updatedFiles);
    } catch (err) {
      console.error('Modification error:', err);
      alert('Failed to apply modification with AI.');
    } finally {
      setIsModifying(false);
    }
  };

  // Update file content directly (from Code Editor or Visual Editor)
  const handleUpdateFileContent = (path: string, newContent: string) => {
    if (!activeProject) return;

    const updatedFiles = activeProject.files.map(f => f.path === path ? { ...f, content: newContent } : f);
    const updatedProj = {
      ...activeProject,
      files: updatedFiles,
      updatedAt: Date.now()
    };

    setActiveProject(updatedProj);
    updateProjectInList(updatedProj);
    pushHistory(updatedFiles);
  };

  // Helper to sync updated project into projects list
  const updateProjectInList = (updatedProj: WebsiteProject) => {
    setProjects(prev => prev.map(p => p.id === updatedProj.id ? updatedProj : p));
  };

  // Select File in Explorer
  const handleSelectFile = (path: string) => {
    if (!activeProject) return;
    setActiveProject({ ...activeProject, activePagePath: path });
  };

  // Add Page
  const handleAddPage = (pageName: string) => {
    if (!activeProject) return;

    const sanitized = pageName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = sanitized.endsWith('.html') ? sanitized : `${sanitized}.html`;

    const brandName = activeProject.name;
    const pageTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1);

    const newHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle} - ${brandName}</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/script.js" defer></script>
</head>
<body>
  <header class="header">
    <div class="nav-container">
      <a href="index.html" class="logo"><span>⚡</span> ${brandName}</a>
      <nav class="nav-links">
        ${activeProject.files.filter(f => f.type === 'html').map(f => `<a href="${f.path}">${f.name.replace('.html', '')}</a>`).join('\n        ')}
        <a href="${filename}" class="active">${pageTitle}</a>
      </nav>
      <a href="contact.html" class="btn btn-primary">Get Started</a>
    </div>
  </header>

  <main class="hero">
    <span class="hero-tag">${pageTitle}</span>
    <h1>${pageTitle} - ${brandName}</h1>
    <p>Welcome to our ${pageTitle} page. Tailored solutions for your digital growth.</p>
  </main>
</body>
</html>`;

    const newFile: GeneratedFile = {
      path: filename,
      name: filename,
      type: 'html',
      content: newHtml
    };

    const updatedFiles = [...activeProject.files, newFile];
    const updatedProj = {
      ...activeProject,
      files: updatedFiles,
      activePagePath: filename,
      updatedAt: Date.now()
    };

    setActiveProject(updatedProj);
    updateProjectInList(updatedProj);
    pushHistory(updatedFiles);
  };

  // Rename File
  const handleRenameFile = (oldPath: string, newPath: string) => {
    if (!activeProject) return;

    const updatedFiles = activeProject.files.map(f => f.path === oldPath ? {
      ...f,
      path: newPath,
      name: newPath.split('/').pop() || newPath
    } : f);

    const updatedProj = {
      ...activeProject,
      files: updatedFiles,
      activePagePath: activeProject.activePagePath === oldPath ? newPath : activeProject.activePagePath,
      updatedAt: Date.now()
    };

    setActiveProject(updatedProj);
    updateProjectInList(updatedProj);
    pushHistory(updatedFiles);
  };

  // Duplicate File
  const handleDuplicateFile = (path: string) => {
    if (!activeProject) return;

    const target = activeProject.files.find(f => f.path === path);
    if (!target) return;

    const nameParts = target.name.split('.');
    const ext = nameParts.pop();
    const base = nameParts.join('.');
    const newName = `${base}-copy.${ext}`;

    const newFile: GeneratedFile = {
      path: newName,
      name: newName,
      type: target.type,
      content: target.content
    };

    const updatedFiles = [...activeProject.files, newFile];
    const updatedProj = {
      ...activeProject,
      files: updatedFiles,
      activePagePath: newName,
      updatedAt: Date.now()
    };

    setActiveProject(updatedProj);
    updateProjectInList(updatedProj);
    pushHistory(updatedFiles);
  };

  // Delete File
  const handleDeleteFile = (path: string) => {
    if (!activeProject || activeProject.files.length <= 1) return;

    const updatedFiles = activeProject.files.filter(f => f.path !== path);
    const fallbackPath = updatedFiles[0]?.path || 'index.html';

    const updatedProj = {
      ...activeProject,
      files: updatedFiles,
      activePagePath: activeProject.activePagePath === path ? fallbackPath : activeProject.activePagePath,
      updatedAt: Date.now()
    };

    setActiveProject(updatedProj);
    updateProjectInList(updatedProj);
    pushHistory(updatedFiles);
  };

  // Undo / Redo Actions
  const handleUndo = () => {
    if (historyIndex > 0 && activeProject) {
      const prevIdx = historyIndex - 1;
      const prevFiles = history[prevIdx];
      setHistoryIndex(prevIdx);

      const updatedProj = { ...activeProject, files: prevFiles };
      setActiveProject(updatedProj);
      updateProjectInList(updatedProj);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && activeProject) {
      const nextIdx = historyIndex + 1;
      const nextFiles = history[nextIdx];
      setHistoryIndex(nextIdx);

      const updatedProj = { ...activeProject, files: nextFiles };
      setActiveProject(updatedProj);
      updateProjectInList(updatedProj);
    }
  };

  // Render according to active screen
  if (screen === 'landing') {
    return (
      <LandingScreen
        onGenerate={handleGenerate}
        onOpenDashboard={() => setScreen('dashboard')}
        apiKey={apiKey}
        setApiKey={handleSetApiKey}
        isGenerating={isGenerating}
      />
    );
  }

  if (screen === 'planning') {
    return <PlanningProgress currentStep={progressStep} />;
  }

  if (screen === 'dashboard') {
    return (
      <ProjectDashboard
        projects={projects}
        onOpenProject={(proj) => {
          setActiveProject(proj);
          setHistory([JSON.parse(JSON.stringify(proj.files))]);
          setHistoryIndex(0);
          setScreen('workspace');
        }}
        onDuplicateProject={(proj) => {
          const dup: WebsiteProject = {
            ...proj,
            id: 'proj_' + Date.now(),
            name: `${proj.name} (Copy)`,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          setProjects(prev => [dup, ...prev]);
        }}
        onDeleteProject={(id) => {
          setProjects(prev => prev.filter(p => p.id !== id));
        }}
        onCreateNew={() => setScreen('landing')}
        onBack={() => setScreen('landing')}
      />
    );
  }

  if (screen === 'workspace' && activeProject) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-100 dark:bg-[#070c1a]">
        {/* Workspace Toolbar Header */}
        <BuilderToolbar
          project={activeProject}
          activeView={activeView}
          setActiveView={setActiveView}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onBackToLanding={() => setScreen('landing')}
          onOpenDashboard={() => setScreen('dashboard')}
        />

        {/* Workspace Main Split Body */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Left Explorer Sidebar */}
          <FileExplorerPanel
            project={activeProject}
            activeFilePath={activeProject.activePagePath}
            onSelectFile={handleSelectFile}
            onAddPage={handleAddPage}
            onRenameFile={handleRenameFile}
            onDuplicateFile={handleDuplicateFile}
            onDeleteFile={handleDeleteFile}
          />

          {/* Center Main Stage according to view mode */}
          {activeView === 'preview' && (
            <LivePreviewPanel
              project={activeProject}
              activePagePath={activeProject.activePagePath}
              onSelectPage={handleSelectFile}
              onSelectElementForVisualEdit={(info) => {
                setSelectedElement(info);
                setActiveView('visual');
              }}
              isVisualInspectMode={isVisualInspectMode}
              setIsVisualInspectMode={setIsVisualInspectMode}
            />
          )}

          {activeView === 'visual' && (
            <>
              <LivePreviewPanel
                project={activeProject}
                activePagePath={activeProject.activePagePath}
                onSelectPage={handleSelectFile}
                onSelectElementForVisualEdit={(info) => setSelectedElement(info)}
                isVisualInspectMode={true}
                setIsVisualInspectMode={setIsVisualInspectMode}
              />
              <VisualEditorPanel
                project={activeProject}
                activePagePath={activeProject.activePagePath}
                selectedElement={selectedElement}
                onUpdateFileContent={handleUpdateFileContent}
              />
            </>
          )}

          {activeView === 'code' && (
            <CodeEditorPanel
              project={activeProject}
              activeFilePath={activeProject.activePagePath}
              onSelectFile={handleSelectFile}
              onUpdateFileContent={handleUpdateFileContent}
            />
          )}
        </div>

        {/* Bottom AI Modification Drawer */}
        <AiModifyPanel
          onModify={handleAiModify}
          isModifying={isModifying}
        />
      </div>
    );
  }

  return null;
};
