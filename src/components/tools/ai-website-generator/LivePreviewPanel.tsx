import React, { useEffect, useRef, useState } from 'react';
import { 
  Laptop, 
  Tablet, 
  Smartphone, 
  RotateCw, 
  ExternalLink, 
  MousePointerClick, 
  Eye,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { GeneratedFile, SelectedElementInfo, WebsiteProject } from '../../../types/websiteBuilder';

interface LivePreviewPanelProps {
  project: WebsiteProject;
  activePagePath: string;
  onSelectPage: (path: string) => void;
  onSelectElementForVisualEdit?: (info: SelectedElementInfo) => void;
  isVisualInspectMode: boolean;
  setIsVisualInspectMode: (val: boolean) => void;
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  project,
  activePagePath,
  onSelectPage,
  onSelectElementForVisualEdit,
  isVisualInspectMode,
  setIsVisualInspectMode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync fullscreen state with native browser fullscreen API if used
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (containerRef.current && containerRef.current.requestFullscreen) {
        try {
          await containerRef.current.requestFullscreen();
        } catch (e) {
          // Ignore if blocked by browser environment policy
        }
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch (e) {
          // Ignore
        }
      }
    }
  };

  const handleOpenNewTab = () => {
    const fullHtml = buildSelfContainedHtml();
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Find active file
  const activeFile = project.files.find(f => f.path === activePagePath) || 
    project.files.find(f => f.path === 'index.html') || 
    project.files[0];

  // Assemble full HTML with inline CSS & JS bundles so preview is 100% self-contained and super fast
  const buildSelfContainedHtml = () => {
    if (!activeFile) return '<html><body>No active page</body></html>';

    let html = activeFile.content;

    // Collect CSS files
    const cssFiles = project.files.filter(f => f.type === 'css' || f.path.endsWith('.css'));
    const cssBundle = cssFiles.map(f => `<style id="bundle-${f.path.replace(/[^a-zA-Z0-9]/g, '_')}">\n${f.content}\n</style>`).join('\n');

    // Collect JS files
    const jsFiles = project.files.filter(f => f.type === 'js' || f.path.endsWith('.js'));
    const jsBundle = jsFiles.map(f => `<script id="bundle-${f.path.replace(/[^a-zA-Z0-9]/g, '_')}">\n${f.content}\n</script>`).join('\n');

    // Inject iframe inspector script and link click interceptor script
    const inspectorScript = `
    <script>
      (function() {
        // Link click interceptor
        document.addEventListener('click', function(e) {
          const anchor = e.target.closest('a');
          if (anchor) {
            const href = anchor.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#')) {
              e.preventDefault();
              window.parent.postMessage({ type: 'NAVIGATE_PAGE', path: href }, '*');
            }
          }
        }, true);

        // Visual Element Inspector
        let hoveredEl = null;
        let isInspectActive = ${isVisualInspectMode ? 'true' : 'false'};

        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'SET_INSPECT_MODE') {
            isInspectActive = !!event.data.active;
            if (!isInspectActive && hoveredEl) {
              hoveredEl.style.outline = '';
            }
          }
        });

        document.addEventListener('mouseover', function(e) {
          if (!isInspectActive) return;
          if (hoveredEl) hoveredEl.style.outline = '';
          hoveredEl = e.target;
          hoveredEl.style.outline = '2px solid #f59e0b';
          hoveredEl.style.outlineOffset = '-2px';
        });

        document.addEventListener('mouseout', function(e) {
          if (hoveredEl) hoveredEl.style.outline = '';
        });

        document.addEventListener('click', function(e) {
          if (!isInspectActive) return;
          e.preventDefault();
          e.stopPropagation();

          const target = e.target;
          const computed = window.getComputedStyle(target);

          const elementData = {
            tagName: target.tagName,
            id: target.id,
            className: target.className,
            innerText: target.innerText || target.value || '',
            styles: {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize,
              fontWeight: computed.fontWeight,
              padding: computed.padding,
              margin: computed.margin,
              borderRadius: computed.borderRadius,
              border: computed.border,
              display: computed.display,
              textAlign: computed.textAlign
            }
          };

          window.parent.postMessage({ type: 'ELEMENT_SELECTED', data: elementData }, '*');
        }, true);
      })();
    </script>`;

    // Insert CSS before </head>
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${cssBundle}\n</head>`);
    } else {
      html = cssBundle + html;
    }

    // Insert JS & Inspector script before </body>
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${jsBundle}\n${inspectorScript}\n</body>`);
    } else {
      html = html + jsBundle + inspectorScript;
    }

    return html;
  };

  // Listen for iframe navigation messages
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'NAVIGATE_PAGE') {
        const targetPath = e.data.path;
        const matched = project.files.find(f => f.path === targetPath || f.path.endsWith(targetPath));
        if (matched) {
          onSelectPage(matched.path);
        }
      } else if (e.data && e.data.type === 'ELEMENT_SELECTED') {
        if (onSelectElementForVisualEdit) {
          onSelectElementForVisualEdit(e.data.data);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [project.files, onSelectPage, onSelectElementForVisualEdit]);

  // Sync inspect mode to iframe
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SET_INSPECT_MODE',
        active: isVisualInspectMode
      }, '*');
    }
  }, [isVisualInspectMode]);

  // Width styling based on viewport
  const viewportStyles = {
    desktop: 'w-full h-full',
    tablet: 'w-[768px] h-full shadow-2xl rounded-2xl border border-slate-700 my-auto',
    mobile: 'w-[375px] h-full shadow-2xl rounded-2xl border border-slate-700 my-auto'
  }[viewport];

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-[9999] bg-slate-200/95 dark:bg-[#070c1a] flex flex-col h-screen w-screen min-w-0 overflow-hidden"
          : "flex-1 flex flex-col bg-slate-200/80 dark:bg-[#070c1a] h-full min-w-0 overflow-hidden relative"
      }
    >
      {/* Top Preview Controls Bar */}
      <div className="h-12 bg-white dark:bg-[#0b132b] border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 flex items-center justify-between shrink-0 text-xs gap-2">
        {/* Page URL indicator */}
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-[11px] min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="truncate max-w-[180px] sm:max-w-xs">
            preview://{project.name.toLowerCase().replace(/\s+/g, '-')}/{activePagePath}
          </span>
        </div>

        {/* Viewport Toggles */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#162244] p-1 rounded-xl">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewport === 'desktop'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Desktop View (100%)"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewport === 'tablet'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewport === 'mobile'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inspect Toggle & Reload & Fullscreen */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsVisualInspectMode(!isVisualInspectMode)}
            className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
              isVisualInspectMode
                ? 'bg-amber-400 text-slate-950 shadow-sm animate-pulse'
                : 'bg-slate-100 dark:bg-[#162244] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1f2e5c]'
            }`}
            title="Click elements in preview to edit visually"
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isVisualInspectMode ? 'Inspect Active' : 'Visual Edit'}</span>
          </button>

          <button
            onClick={() => setReloadKey(prev => prev + 1)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#162244] text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
            title="Refresh Preview"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleOpenNewTab}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#162244] text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
            title="Open Preview in New Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
              isFullscreen
                ? 'bg-amber-400 text-slate-950 shadow-md hover:bg-amber-500'
                : 'bg-slate-100 dark:bg-[#162244] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1f2e5c]'
            }`}
            title={isFullscreen ? 'Exit Full Screen' : 'View Full Screen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
          </button>
        </div>
      </div>

      {/* Main Iframe Canvas */}
      <div className={`flex-1 flex justify-center items-center overflow-auto min-h-0 ${isFullscreen ? 'p-2' : 'p-2 sm:p-4'}`}>
        <div className={`transition-all duration-300 ${viewportStyles}`}>
          <iframe
            key={reloadKey + activePagePath}
            ref={iframeRef}
            srcDoc={buildSelfContainedHtml()}
            title="Website Live Preview"
            className="w-full h-full bg-white rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};
