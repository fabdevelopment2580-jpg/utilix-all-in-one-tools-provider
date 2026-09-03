import React, { useState } from 'react';
import { Upload, Download, RefreshCw, FileImage, Trash2, ArrowRight, Check } from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { PrivacyNotice } from '../layout/PrivacyNotice';

interface ConvertedFile {
  id: string;
  file: File;
  originalSize: number;
  originalFormat: string;
  convertedBlob: Blob | null;
  convertedSize: number;
  convertedUrl: string | null;
  status: 'idle' | 'converting' | 'done' | 'error';
}

export const ImageConverterTool: React.FC = () => {
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState<number>(90);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = (uploadList: FileList | null) => {
    if (!uploadList) return;
    const newItems: ConvertedFile[] = Array.from(uploadList)
      .filter(f => f.type.startsWith('image/'))
      .map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        originalSize: file.size,
        originalFormat: file.type.split('/')[1]?.toUpperCase() || 'IMAGE',
        convertedBlob: null,
        convertedSize: 0,
        convertedUrl: null,
        status: 'idle'
      }));

    setFiles(prev => [...prev, ...newItems]);
  };

  const convertSingle = (item: ConvertedFile): Promise<ConvertedFile> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(item.file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ ...item, status: 'error' });
          return;
        }

        // Fill white background for JPG conversion from transparent PNG
        if (targetFormat === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        const mime = `image/${targetFormat}`;
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ ...item, status: 'error' });
              return;
            }
            const convertedUrl = URL.createObjectURL(blob);
            resolve({
              ...item,
              convertedBlob: blob,
              convertedSize: blob.size,
              convertedUrl,
              status: 'done'
            });
          },
          mime,
          quality / 100
        );
      };

      img.onerror = () => {
        resolve({ ...item, status: 'error' });
      };

      img.src = url;
    });
  };

  const handleConvertAll = async () => {
    setIsProcessing(true);
    const updated = await Promise.all(files.map(f => convertSingle(f)));
    setFiles(updated);
    setIsProcessing(false);
  };

  const handleDownloadAll = () => {
    files.forEach(f => {
      if (f.convertedUrl) {
        const a = document.createElement('a');
        a.href = f.convertedUrl;
        const baseName = f.file.name.replace(/\.[^/.]+$/, '');
        a.download = `${baseName}.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs categoryName="Image" toolName="Image Converter" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Image Converter
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Convert images between PNG, JPG, and WebP formats instantly in your browser.
          </p>
        </div>

        {files.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiles([])}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Clear All
            </button>

            <button
              onClick={handleConvertAll}
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Convert All ({files.length})</span>
            </button>
          </div>
        )}
      </div>

      {files.length === 0 ? (
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center bg-white dark:bg-slate-800/50 hover:border-amber-400 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Upload Images to Convert
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Select one or multiple images to convert between JPG, PNG, and WebP.
          </p>
          <label className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer shadow-sm transition-colors">
            <Upload className="w-4 h-4" />
            <span>Choose Image Files</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Target Format Selector Bar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            <div>
              <label className="font-bold text-xs text-slate-900 dark:text-slate-100 block mb-2">
                Convert All To Format
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                <button
                  onClick={() => setTargetFormat('png')}
                  className={`py-2 rounded-xl uppercase font-bold transition-colors ${
                    targetFormat === 'png' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  PNG
                </button>
                <button
                  onClick={() => setTargetFormat('jpeg')}
                  className={`py-2 rounded-xl uppercase font-bold transition-colors ${
                    targetFormat === 'jpeg' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  JPG
                </button>
                <button
                  onClick={() => setTargetFormat('webp')}
                  className={`py-2 rounded-xl uppercase font-bold transition-colors ${
                    targetFormat === 'webp' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  WebP
                </button>
              </div>
            </div>

            {targetFormat !== 'png' && (
              <div>
                <div className="flex justify-between items-center font-bold text-xs text-slate-900 dark:text-slate-100 mb-2">
                  <span>Image Quality</span>
                  <span className="text-amber-600 dark:text-amber-400 font-extrabold">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end">
              <button
                onClick={handleDownloadAll}
                disabled={!files.some(f => f.status === 'done')}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Download All Converted</span>
              </button>
            </div>

          </div>

          {/* File Items */}
          <div className="space-y-3">
            {files.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 truncate w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <FileImage className="w-6 h-6" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                      {item.file.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Size: {formatBytes(item.originalSize)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Format Transformation Badge */}
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {item.originalFormat}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="px-2 py-1 rounded-md bg-amber-400 text-slate-950 uppercase font-extrabold">
                      {targetFormat === 'jpeg' ? 'JPG' : targetFormat}
                    </span>
                  </div>

                  {item.convertedUrl ? (
                    <a
                      href={item.convertedUrl}
                      download={`${item.file.name.replace(/\.[^/.]+$/, '')}.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`}
                      className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  ) : (
                    <button
                      onClick={async () => {
                        const updated = await convertSingle(item);
                        setFiles(prev => prev.map(f => f.id === item.id ? updated : f));
                      }}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
                    >
                      Convert
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <PrivacyNotice />
    </div>
  );
};
