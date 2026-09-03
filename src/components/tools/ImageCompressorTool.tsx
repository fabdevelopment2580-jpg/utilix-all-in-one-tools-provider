import React, { useState, useEffect } from 'react';
import { Upload, Download, RefreshCw, CheckCircle2, FileImage, Trash2, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { PrivacyNotice } from '../layout/PrivacyNotice';

interface CompressedImage {
  id: string;
  file: File;
  originalSize: number;
  compressedBlob: Blob | null;
  compressedSize: number;
  compressedUrl: string | null;
  status: 'idle' | 'compressing' | 'done' | 'error';
}

export const ImageCompressorTool: React.FC = () => {
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [quality, setQuality] = useState<number>(75);
  const [targetFormat, setTargetFormat] = useState<'original' | 'image/jpeg' | 'image/webp'>('original');

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = (files: FileList | null) => {
    if (!files) return;
    const newItems: CompressedImage[] = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        originalSize: file.size,
        compressedBlob: null,
        compressedSize: 0,
        compressedUrl: null,
        status: 'idle'
      }));

    setImages(prev => [...prev, ...newItems]);
  };

  // Process Compression
  const compressSingleImage = (item: CompressedImage, targetQuality: number, format: string): Promise<CompressedImage> => {
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

        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        let mimeType = item.file.type;
        if (format !== 'original') mimeType = format;
        if (mimeType === 'image/png') mimeType = 'image/jpeg'; // PNG canvas compression converts to JPG or WebP for true compression

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ ...item, status: 'error' });
              return;
            }
            const compressedUrl = URL.createObjectURL(blob);
            resolve({
              ...item,
              compressedBlob: blob,
              compressedSize: blob.size,
              compressedUrl,
              status: 'done'
            });
          },
          mimeType,
          targetQuality / 100
        );
      };

      img.onerror = () => {
        resolve({ ...item, status: 'error' });
      };

      img.src = url;
    });
  };

  // Re-compress when Quality or Format changes
  useEffect(() => {
    if (images.length === 0) return;

    let isMounted = true;
    const processAll = async () => {
      const updated = await Promise.all(
        images.map(img => compressSingleImage(img, quality, targetFormat))
      );
      if (isMounted) {
        setImages(updated);
      }
    };

    processAll();

    return () => {
      isMounted = false;
    };
  }, [quality, targetFormat, images.length]);

  const handleDownloadAll = () => {
    images.forEach(img => {
      if (img.compressedUrl) {
        const a = document.createElement('a');
        a.href = img.compressedUrl;
        const ext = targetFormat === 'image/webp' ? 'webp' : targetFormat === 'image/jpeg' ? 'jpg' : img.file.name.split('.').pop();
        a.download = `compressed-${img.file.name.replace(/\.[^/.]+$/, '')}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(item => item.id !== id));
  };

  const totalOriginal = images.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalCompressed = images.reduce((acc, curr) => acc + (curr.compressedSize || curr.originalSize), 0);
  const totalSavedPercent = totalOriginal > 0 ? Math.max(0, Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs categoryName="Image" toolName="Image Compressor" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Image Compressor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Shrink image file sizes without noticeable quality loss. Batch processing included.
          </p>
        </div>

        {images.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setImages([])}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>

            <button
              onClick={handleDownloadAll}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download All ({images.length})</span>
            </button>
          </div>
        )}
      </div>

      {images.length === 0 ? (
        /* Upload Area */
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center bg-white dark:bg-slate-800/50 hover:border-amber-400 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Drop your images here to compress
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Supports multiple JPG, PNG, and WebP images. Processed entirely inside your browser.
          </p>
          <label className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer shadow-sm transition-colors">
            <Upload className="w-4 h-4" />
            <span>Select Images</span>
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
        /* Compressor Controls & List */
        <div className="space-y-6">
          
          {/* Controls Bar & Total Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Quality Slider */}
            <div>
              <div className="flex justify-between items-center font-bold text-xs text-slate-900 dark:text-slate-100 mb-2">
                <span>Compression Quality</span>
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

            {/* Target Format */}
            <div>
              <label className="font-bold text-xs text-slate-900 dark:text-slate-100 block mb-2">
                Output Format
              </label>
              <div className="grid grid-cols-3 gap-1 text-xs font-semibold">
                <button
                  onClick={() => setTargetFormat('original')}
                  className={`py-1.5 rounded-lg ${
                    targetFormat === 'original' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setTargetFormat('image/jpeg')}
                  className={`py-1.5 rounded-lg ${
                    targetFormat === 'image/jpeg' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  JPG
                </button>
                <button
                  onClick={() => setTargetFormat('image/webp')}
                  className={`py-1.5 rounded-lg ${
                    targetFormat === 'image/webp' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  WebP
                </button>
              </div>
            </div>

            {/* Total Compression Summary */}
            <div className="bg-amber-500/10 dark:bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 text-center">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-700 dark:text-amber-400 block">
                Total Savings
              </span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                Saved {totalSavedPercent}%
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                {formatBytes(totalOriginal)} → {formatBytes(totalCompressed)}
              </p>
            </div>

          </div>

          {/* List of Images */}
          <div className="space-y-3">
            {images.map(img => {
              const savedPct = img.originalSize > 0 && img.compressedSize > 0
                ? Math.max(0, Math.round(((img.originalSize - img.compressedSize) / img.originalSize) * 100))
                : 0;

              return (
                <div
                  key={img.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  {/* Thumbnail & File Details */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {img.compressedUrl ? (
                      <img
                        src={img.compressedUrl}
                        alt="Compressed Preview"
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <FileImage className="w-6 h-6 text-slate-400" />
                      </div>
                    )}

                    <div className="truncate">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                        {img.file.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Original: {formatBytes(img.originalSize)}
                      </p>
                    </div>
                  </div>

                  {/* Size Comparison & Savings Badge */}
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                        <span>{formatBytes(img.originalSize)}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-amber-600 dark:text-amber-400">{formatBytes(img.compressedSize || img.originalSize)}</span>
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px]">
                        Saved {savedPct}%
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {img.compressedUrl && (
                        <a
                          href={img.compressedUrl}
                          download={`compressed-${img.file.name}`}
                          className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold transition-colors"
                          title="Download Image"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => removeImage(img.id)}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      <PrivacyNotice />
    </div>
  );
};
