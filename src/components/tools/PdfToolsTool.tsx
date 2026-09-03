import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { 
  FileText, 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  ArrowUpDown, 
  RotateCw, 
  Scissors, 
  Layers, 
  CheckCircle2, 
  FileCheck
} from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { PrivacyNotice } from '../layout/PrivacyNotice';

type PdfOperation = 'merge' | 'split' | 'reorder' | 'rotate' | 'extract';

interface LoadedPdfFile {
  id: string;
  file: File;
  pageCount: number;
  pdfDoc: PDFDocument | null;
}

export const PdfToolsTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PdfOperation>('merge');
  
  // Merge State
  const [mergeFiles, setMergeFiles] = useState<LoadedPdfFile[]>([]);

  // Single PDF Operations State
  const [singlePdf, setSinglePdf] = useState<LoadedPdfFile | null>(null);
  const [splitRanges, setSplitRanges] = useState('1-2, 3-4');
  const [rotateAngle, setRotateAngle] = useState<number>(90);
  const [extractPages, setExtractPages] = useState('1');

  // Page reordering array: [0, 1, 2, ...]
  const [pageOrder, setPageOrder] = useState<number[]>([]);

  // Processing & Download state
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Handle uploading PDFs for Merge
  const handleMergeUpload = async (fileList: FileList | null) => {
    if (!fileList) return;
    const items: LoadedPdfFile[] = [];

    for (const file of Array.from(fileList)) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        try {
          const buffer = await file.arrayBuffer();
          const doc = await PDFDocument.load(buffer);
          items.push({
            id: Math.random().toString(36).substr(2, 9),
            file,
            pageCount: doc.getPageCount(),
            pdfDoc: doc,
          });
        } catch (err) {
          console.error('Failed to parse PDF', err);
        }
      }
    }

    setMergeFiles(prev => [...prev, ...items]);
  };

  // Handle single PDF load for Split, Reorder, Rotate, Extract
  const handleSingleUpload = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return;
    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      const count = doc.getPageCount();
      setSinglePdf({
        id: Math.random().toString(36).substr(2, 9),
        file,
        pageCount: count,
        pdfDoc: doc,
      });
      setPageOrder(Array.from({ length: count }, (_, i) => i));
      setSplitRanges(`1-${Math.min(2, count)}`);
      setExtractPages(`1`);
    } catch (err) {
      alert('Unable to parse this PDF file. Please ensure it is a valid PDF.');
    }
  };

  // Execute Merge PDF
  const executeMerge = async () => {
    if (mergeFiles.length < 2) {
      alert('Please upload at least 2 PDF files to merge.');
      return;
    }
    setIsProcessing(true);
    setStatusMessage('Merging PDF documents...');

    try {
      const mergedPdf = await PDFDocument.create();
      for (const item of mergeFiles) {
        if (item.pdfDoc) {
          const copiedPages = await mergedPdf.copyPages(item.pdfDoc, item.pdfDoc.getPageIndices());
          copiedPages.forEach(p => mergedPdf.addPage(p));
        }
      }
      const pdfBytes = await mergedPdf.save();
      downloadBytes(pdfBytes, 'merged-document.pdf');
      setStatusMessage('✓ PDF Merge Complete!');
    } catch (err) {
      alert('Error merging PDFs: ' + err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Execute Split PDF
  const executeSplit = async () => {
    if (!singlePdf?.pdfDoc) return;
    setIsProcessing(true);
    setStatusMessage('Splitting PDF document...');

    try {
      const doc = singlePdf.pdfDoc;
      const ranges = splitRanges.split(',').map(r => r.trim()).filter(Boolean);

      for (let idx = 0; idx < ranges.length; idx++) {
        const range = ranges[idx];
        let pagesToInclude: number[] = [];

        if (range.includes('-')) {
          const [start, end] = range.split('-').map(n => parseInt(n, 10));
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = start; i <= end; i++) {
              if (i >= 1 && i <= singlePdf.pageCount) pagesToInclude.push(i - 1);
            }
          }
        } else {
          const pageNum = parseInt(range, 10);
          if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= singlePdf.pageCount) {
            pagesToInclude.push(pageNum - 1);
          }
        }

        if (pagesToInclude.length > 0) {
          const newPdf = await PDFDocument.create();
          const copied = await newPdf.copyPages(doc, pagesToInclude);
          copied.forEach(p => newPdf.addPage(p));
          const bytes = await newPdf.save();
          downloadBytes(bytes, `split-part-${idx + 1}.pdf`);
        }
      }
      setStatusMessage('✓ PDF Split Complete!');
    } catch (err) {
      alert('Error splitting PDF: ' + err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Execute Reorder PDF
  const executeReorder = async () => {
    if (!singlePdf?.pdfDoc || pageOrder.length === 0) return;
    setIsProcessing(true);
    setStatusMessage('Reordering PDF pages...');

    try {
      const newPdf = await PDFDocument.create();
      const copied = await newPdf.copyPages(singlePdf.pdfDoc, pageOrder);
      copied.forEach(p => newPdf.addPage(p));
      const bytes = await newPdf.save();
      downloadBytes(bytes, 'reordered-document.pdf');
      setStatusMessage('✓ Reorder Complete!');
    } catch (err) {
      alert('Error reordering PDF: ' + err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Execute Rotate PDF
  const executeRotate = async () => {
    if (!singlePdf?.pdfDoc) return;
    setIsProcessing(true);
    setStatusMessage('Rotating PDF pages...');

    try {
      const newPdf = await PDFDocument.create();
      const copied = await newPdf.copyPages(singlePdf.pdfDoc, singlePdf.pdfDoc.getPageIndices());
      copied.forEach(p => {
        p.setRotation(degrees((p.getRotation().angle + rotateAngle) % 360));
        newPdf.addPage(p);
      });
      const bytes = await newPdf.save();
      downloadBytes(bytes, 'rotated-document.pdf');
      setStatusMessage('✓ Rotation Complete!');
    } catch (err) {
      alert('Error rotating PDF: ' + err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper download function
  const downloadBytes = (bytes: Uint8Array, filename: string) => {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs categoryName="PDF" toolName="PDF Tools" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            PDF Tools Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Merge, split, reorder, rotate, and extract PDF pages locally in your browser.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'merge', label: 'Merge PDFs', icon: Layers },
          { id: 'split', label: 'Split PDF', icon: Scissors },
          { id: 'reorder', label: 'Reorder & Delete', icon: ArrowUpDown },
          { id: 'rotate', label: 'Rotate Pages', icon: RotateCw },
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as PdfOperation)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* MERGE TAB */}
      {activeTab === 'merge' && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-white dark:bg-slate-800/50 hover:border-amber-400 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Add PDF Files to Merge
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select multiple PDF files to combine into a single document.
            </p>
            <label className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer shadow-sm transition-colors">
              <Plus className="w-4 h-4" />
              <span>Select PDFs</span>
              <input
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={(e) => handleMergeUpload(e.target.files)}
              />
            </label>
          </div>

          {mergeFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Files to Merge ({mergeFiles.length})
                </span>
                <button
                  onClick={executeMerge}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Merge & Download</span>
                </button>
              </div>

              <div className="space-y-2">
                {mergeFiles.map((pdf, idx) => (
                  <div
                    key={pdf.id}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-amber-500">#{idx + 1}</span>
                      <FileText className="w-5 h-5 text-slate-400" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{pdf.file.name}</span>
                        <span className="text-[10px] text-slate-400">{pdf.pageCount} Pages</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setMergeFiles(prev => prev.filter(p => p.id !== pdf.id))}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SPLIT / REORDER / ROTATE TABS (Single PDF upload) */}
      {activeTab !== 'merge' && (
        <div className="space-y-6">
          {!singlePdf ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center bg-white dark:bg-slate-800/50 hover:border-amber-400 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Upload a PDF Document
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Choose a PDF file to {activeTab} pages.
              </p>
              <label className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer shadow-sm transition-colors">
                <Upload className="w-4 h-4" />
                <span>Select PDF File</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleSingleUpload(e.target.files[0]);
                  }}
                />
              </label>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-400/20 text-amber-600 dark:text-amber-400 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{singlePdf.file.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{singlePdf.pageCount} Pages Loaded</p>
                  </div>
                </div>

                <button
                  onClick={() => setSinglePdf(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                >
                  Change File
                </button>
              </div>

              {/* SPLIT MODE CONTROLS */}
              {activeTab === 'split' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                      Specify Page Ranges to Extract
                    </label>
                    <p className="text-slate-500 mb-2">Example: "1-2, 3-5" splits into two separate PDFs.</p>
                    <input
                      type="text"
                      value={splitRanges}
                      onChange={(e) => setSplitRanges(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 border border-transparent focus:border-amber-400 font-mono"
                    />
                  </div>

                  <button
                    onClick={executeSplit}
                    disabled={isProcessing}
                    className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Scissors className="w-4 h-4" />
                    <span>Split & Export PDFs</span>
                  </button>
                </div>
              )}

              {/* REORDER MODE CONTROLS */}
              {activeTab === 'reorder' && (
                <div className="space-y-4 text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    Page Order & Selection ({pageOrder.length} pages)
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {pageOrder.map((pageIdx, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-center relative group"
                      >
                        <span className="font-mono font-bold text-amber-500 block text-sm">Page {pageIdx + 1}</span>
                        <button
                          onClick={() => setPageOrder(prev => prev.filter((_, i) => i !== idx))}
                          className="mt-1 text-[10px] text-red-500 font-bold hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={executeReorder}
                    disabled={isProcessing}
                    className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    <span>Download Reordered PDF</span>
                  </button>
                </div>
              )}

              {/* ROTATE MODE CONTROLS */}
              {activeTab === 'rotate' && (
                <div className="space-y-4 text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    Select Rotation Angle
                  </span>
                  <div className="flex gap-2">
                    {[90, 180, 270].map(angle => (
                      <button
                        key={angle}
                        onClick={() => setRotateAngle(angle)}
                        className={`py-2 px-4 rounded-xl font-bold ${
                          rotateAngle === angle ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-700'
                        }`}
                      >
                        Rotate {angle}°
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={executeRotate}
                    disabled={isProcessing}
                    className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Apply Rotation & Download</span>
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {statusMessage && (
        <div className="mt-4 p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      <PrivacyNotice />
    </div>
  );
};
