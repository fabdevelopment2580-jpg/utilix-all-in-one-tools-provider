import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered, 
  Copy, 
  Download, 
  Check, 
  Undo,
  Redo,
  Quote,
  Code,
  Minus,
  RemoveFormatting,
  Subscript,
  Superscript,
  Palette,
  Highlighter,
  Type
} from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { PrivacyNotice } from '../layout/PrivacyNotice';

const FONT_FAMILIES = [
  { name: 'Sans-Serif (Modern)', value: 'sans-serif' },
  { name: 'Serif (Classic)', value: 'serif' },
  { name: 'Monospace (Code)', value: 'monospace' },
  { name: 'Georgia (Editorial)', value: 'Georgia, serif' },
  { name: 'Playfair Display (Display)', value: "'Playfair Display', serif" },
  { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { name: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { name: 'Courier New', value: "'Courier New', Courier, monospace" },
  { name: 'Comic Sans MS', value: "'Comic Sans MS', cursive, sans-serif" },
  { name: 'Impact', value: 'Impact, Charcoal, sans-serif' },
  { name: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" }
];

const FONT_SIZES = [
  { label: 'Small (12px)', size: '1' },
  { label: 'Normal (16px)', size: '3' },
  { label: 'Medium (20px)', size: '4' },
  { label: 'Large (24px)', size: '5' },
  { label: 'Extra Large (32px)', size: '6' },
  { label: 'Huge (48px)', size: '7' },
];

export const TextEditorTool: React.FC = () => {
  const [content, setContent] = useState<string>(
    '<h2>Welcome to Utilix Rich Text Editor</h2><p>Select any text to apply fonts, custom colors, highlights, text cases, quote blocks, or code formatting. Live word counts and reading time statistics update automatically in real-time as you write!</p>'
  );
  const [copied, setCopied] = useState(false);
  const [selectedFont, setSelectedFont] = useState('sans-serif');
  const [selectedFontSize, setSelectedFontSize] = useState('3');
  const [textColor, setTextColor] = useState('#f59e0b');
  const [highlightColor, setHighlightColor] = useState('#fef08a');

  const editorRef = useRef<HTMLDivElement>(null);

  // Sync initial content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleFontChange = (fontValue: string) => {
    setSelectedFont(fontValue);
    execCommand('fontName', fontValue);
  };

  const handleSizeChange = (sizeValue: string) => {
    setSelectedFontSize(sizeValue);
    execCommand('fontSize', sizeValue);
  };

  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    execCommand('foreColor', color);
  };

  const handleHighlightColorChange = (color: string) => {
    setHighlightColor(color);
    execCommand('hiliteColor', color);
  };

  // Text Case Transformation
  const transformTextCase = (mode: 'upper' | 'lower' | 'title') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectedText = selection.toString();
    if (!selectedText) return;

    let transformed = selectedText;
    if (mode === 'upper') {
      transformed = selectedText.toUpperCase();
    } else if (mode === 'lower') {
      transformed = selectedText.toLowerCase();
    } else if (mode === 'title') {
      transformed = selectedText.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    execCommand('insertText', transformed);
  };

  // Text Stats Calculations
  const plainText = editorRef.current?.innerText || '';
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const charCount = plainText.length;
  const charCountNoSpaces = plainText.replace(/\s/g, '').length;
  const sentenceCount = plainText.trim() ? plainText.split(/[.!?]+/).filter(Boolean).length : 0;
  const paragraphCount = plainText.trim() ? plainText.split(/\n+/).filter(Boolean).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  const handleCopyText = () => {
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs categoryName="Text & Code" toolName="Rich Text Editor" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Rich Text Editor & Font Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Write, select fonts, apply colors, text cases, and format documents with real-time statistics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Text!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download .TXT</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
        
        {/* Expanded Rich Text Toolbar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2 text-slate-700 dark:text-slate-300 text-xs">
          
          {/* Font Family Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <Type className="w-3.5 h-3.5 text-amber-500" />
            <select
              value={selectedFont}
              onChange={(e) => handleFontChange(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {FONT_FAMILIES.map(font => (
                <option key={font.name} value={font.value} className="dark:bg-slate-800">
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-[10px] text-slate-400 uppercase">Size</span>
            <select
              value={selectedFontSize}
              onChange={(e) => handleSizeChange(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {FONT_SIZES.map(s => (
                <option key={s.label} value={s.size} className="dark:bg-slate-800">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-px h-5 bg-slate-300 dark:bg-slate-700" />

          {/* Basic Formatting */}
          <button
            onClick={() => execCommand('bold')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 font-bold cursor-pointer"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand('italic')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 italic cursor-pointer"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand('underline')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 underline cursor-pointer"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand('strikeThrough')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 line-through cursor-pointer"
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-300 dark:bg-slate-700" />

          {/* Text Color Picker */}
          <label className="flex items-center gap-1 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer" title="Text Color">
            <Palette className="w-4 h-4 text-amber-500" />
            <input
              type="color"
              value={textColor}
              onChange={(e) => handleTextColorChange(e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border-0 p-0"
            />
          </label>

          {/* Highlight Color Picker */}
          <label className="flex items-center gap-1 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer" title="Highlight Color">
            <Highlighter className="w-4 h-4 text-amber-500" />
            <input
              type="color"
              value={highlightColor}
              onChange={(e) => handleHighlightColorChange(e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border-0 p-0"
            />
          </label>

          <div className="w-px h-5 bg-slate-300 dark:bg-slate-700" />

          {/* Alignment */}
          <button
            onClick={() => execCommand('justifyLeft')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand('justifyCenter')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand('justifyRight')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-300 dark:bg-slate-700" />

          {/* Lists */}
          <button
            onClick={() => execCommand('insertUnorderedList')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand('insertOrderedList')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-300 dark:bg-slate-700" />

          {/* Advanced Blocks & Formatting */}
          <button
            onClick={() => execCommand('formatBlock', '<blockquote>')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            title="Quote Block"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand('formatBlock', '<pre>')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand('insertHorizontalRule')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            title="Horizontal Line"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={() => execCommand('subscript')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            title="Subscript"
          >
            <Subscript className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand('superscript')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            title="Superscript"
          >
            <Superscript className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-300 dark:bg-slate-700" />

          {/* Case Transformer */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-1.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-[11px]">
            <button
              onClick={() => transformTextCase('upper')}
              className="px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              title="Transform selection to UPPERCASE"
            >
              AA
            </button>
            <button
              onClick={() => transformTextCase('lower')}
              className="px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              title="Transform selection to lowercase"
            >
              aa
            </button>
            <button
              onClick={() => transformTextCase('title')}
              className="px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              title="Transform selection to Title Case"
            >
              Aa
            </button>
          </div>

          <div className="w-px h-5 bg-slate-300 dark:bg-slate-700" />

          {/* Undo / Redo / Clear Formatting */}
          <button
            onClick={() => execCommand('undo')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand('redo')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand('removeFormat')}
            className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 cursor-pointer"
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadHtml}
            className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs ml-auto hover:bg-amber-500 transition-colors cursor-pointer"
            title="Export as HTML"
          >
            Export HTML
          </button>

        </div>

        {/* Editable Canvas */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="p-6 min-h-[380px] text-slate-900 dark:text-slate-100 focus:outline-none leading-relaxed prose dark:prose-invert max-w-none text-sm font-sans"
          style={{ minHeight: '380px' }}
        />

        {/* Live Metrics Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs text-slate-600 dark:text-slate-400 font-mono">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Words</span>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{wordCount}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Characters</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{charCount}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">No Spaces</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{charCountNoSpaces}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Sentences</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{sentenceCount}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Paragraphs</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{paragraphCount}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Reading</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">~{readingTime} min</span>
          </div>
        </div>

      </div>

      <PrivacyNotice />
    </div>
  );
};
