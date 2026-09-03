import React, { useState, useEffect } from 'react';
import { Code2, Copy, Check, Trash2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { PrivacyNotice } from '../layout/PrivacyNotice';

type LanguageMode = 'json' | 'html' | 'css' | 'js';

export const CodeFormatterTool: React.FC = () => {
  const [lang, setLang] = useState<LanguageMode>('json');
  const [inputCode, setInputCode] = useState<string>(
    '{"name":"Utilix","tools":13,"features":["100% Client-side","Private","Fast"],"status":{"active":true,"version":1.0}}'
  );
  const [outputCode, setOutputCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Format Code Function
  const formatCode = (code: string, language: LanguageMode, minify = false) => {
    setErrorMessage(null);
    if (!code.trim()) {
      setOutputCode('');
      return;
    }

    try {
      if (language === 'json') {
        const parsed = JSON.parse(code);
        setOutputCode(JSON.stringify(parsed, null, minify ? 0 : 2));
      } else if (language === 'html') {
        if (minify) {
          setOutputCode(code.replace(/>\s+</g, '><').trim());
        } else {
          // Simple HTML Indenter
          let formatted = '';
          let indent = 0;
          const tokens = code.replace(/></g, '>\n<').split('\n');
          for (let token of tokens) {
            if (token.match(/<\/\w+/)) indent = Math.max(0, indent - 1);
            formatted += '  '.repeat(indent) + token.trim() + '\n';
            if (token.match(/<\w+[^>]*[^\/]>$/)) indent++;
          }
          setOutputCode(formatted.trim());
        }
      } else if (language === 'css') {
        if (minify) {
          setOutputCode(code.replace(/\s+/g, ' ').replace(/\s*([\{\}\:\;])\s*/g, '$1').trim());
        } else {
          let formatted = code
            .replace(/\{/g, ' {\n  ')
            .replace(/\;/g, ';\n  ')
            .replace(/\s*\}\s*/g, '\n}\n')
            .replace(/\n\s*\n/g, '\n');
          setOutputCode(formatted.trim());
        }
      } else if (language === 'js') {
        if (minify) {
          setOutputCode(code.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*/g, '').replace(/\s+/g, ' ').trim());
        } else {
          // Basic JS Indenter
          let indent = 0;
          const lines = code.split('\n');
          const formatted = lines.map(line => {
            let trimmed = line.trim();
            if (trimmed.startsWith('}')) indent = Math.max(0, indent - 1);
            const res = '  '.repeat(indent) + trimmed;
            if (trimmed.endsWith('{')) indent++;
            return res;
          }).join('\n');
          setOutputCode(formatted);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid syntax in code');
      setOutputCode('');
    }
  };

  useEffect(() => {
    formatCode(inputCode, lang, false);
  }, [inputCode, lang]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCode || inputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs categoryName="Text & Code" toolName="Code Formatter" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Code Formatter & Minifier
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Format, beautify, validate, and minify JSON, HTML, CSS, and JavaScript.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInputCode('')}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Output!' : 'Copy Formatted'}</span>
          </button>
        </div>
      </div>

      {/* Language Selector Bar & Minify Action Buttons */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Language Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold w-full sm:w-auto">
          {(['json', 'html', 'css', 'js'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg uppercase transition-colors ${
                lang === l ? 'bg-amber-400 text-slate-950 font-extrabold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => formatCode(inputCode, lang, false)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-slate-900 dark:text-slate-100 font-bold text-xs transition-colors"
          >
            Format / Beautify
          </button>

          <button
            onClick={() => formatCode(inputCode, lang, true)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-slate-900 dark:text-slate-100 font-bold text-xs transition-colors"
          >
            Minify Code
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Invalid Code: {errorMessage}</span>
        </div>
      )}

      {/* Split Code Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Input Code Column */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
            <span>INPUT ({lang.toUpperCase()})</span>
            <span>{new Blob([inputCode]).size} bytes</span>
          </div>

          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Paste code here..."
            className="w-full h-96 bg-transparent text-slate-100 font-mono text-xs focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Formatted Output Column */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-amber-400 border-b border-slate-800 pb-2">
            <span>FORMATTED OUTPUT</span>
            <span>{new Blob([outputCode]).size} bytes</span>
          </div>

          <textarea
            value={outputCode}
            readOnly
            placeholder="Formatted output will appear here..."
            className="w-full h-96 bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed"
          />
        </div>

      </div>

      <PrivacyNotice />
    </div>
  );
};
