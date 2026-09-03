import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Download, Scaling, Lock, Unlock, Move, Palette, Sliders } from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { PrivacyNotice } from '../layout/PrivacyNotice';

const PRESETS = [
  { name: 'Instagram Square (1:1)', width: 1080, height: 1080 },
  { name: 'Instagram Portrait (4:5)', width: 1080, height: 1350 },
  { name: 'YouTube Thumbnail (16:9)', width: 1280, height: 720 },
  { name: 'Facebook Post (1.91:1)', width: 1200, height: 630 },
  { name: 'Story / Reel (9:16)', width: 1080, height: 1920 },
  { name: 'X / Twitter Header (3:1)', width: 1500, height: 500 },
];

type FitMode = 'contain' | 'cover' | 'stretch';

export const ImageResizerTool: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);

  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState<boolean>(false);
  const [percentage, setPercentage] = useState<number>(100);

  // Framing & Aspect Ratio Adjustments
  const [fitMode, setFitMode] = useState<FitMode>('contain');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [offsetX, setOffsetX] = useState(50); // 0 to 100%
  const [offsetY, setOffsetY] = useState(50); // 0 to 100%
  const [zoomScale, setZoomScale] = useState(100); // 50% to 200%

  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState<number>(90);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imgRef.current = img;
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
        setWidth(img.width);
        setHeight(img.height);
        setPercentage(100);
        setOffsetX(50);
        setOffsetY(50);
        setZoomScale(100);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && originalWidth > 0) {
      const ratio = originalHeight / originalWidth;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      setWidth(Math.round(val * ratio));
    }
  };

  const handlePercentageChange = (pct: number) => {
    setPercentage(pct);
    if (originalWidth > 0 && originalHeight > 0) {
      const newW = Math.round((originalWidth * pct) / 100);
      const newH = Math.round((originalHeight * pct) / 100);
      setWidth(newW);
      setHeight(newH);
    }
  };

  const applyPreset = (presetW: number, presetH: number) => {
    setWidth(presetW);
    setHeight(presetH);
    setLockAspect(false);
  };

  // Render Resized Canvas Preview
  const renderResizedCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || width <= 0 || height <= 0) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    if (fitMode === 'contain' || format === 'jpeg') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    const scaleFactor = zoomScale / 100;

    if (fitMode === 'stretch') {
      ctx.drawImage(img, 0, 0, width, height);
    } else if (fitMode === 'contain') {
      // Fit original image without distorting, add padding
      const imgAspect = img.width / img.height;
      const targetAspect = width / height;

      let drawW, drawH;
      if (imgAspect > targetAspect) {
        drawW = width * scaleFactor;
        drawH = (width / imgAspect) * scaleFactor;
      } else {
        drawH = height * scaleFactor;
        drawW = (height * imgAspect) * scaleFactor;
      }

      const drawX = (width - drawW) * (offsetX / 100);
      const drawY = (height - drawH) * (offsetY / 100);

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else if (fitMode === 'cover') {
      // Fill entire target frame without distorting (smart crop)
      const imgAspect = img.width / img.height;
      const targetAspect = width / height;

      let drawW, drawH;
      if (imgAspect > targetAspect) {
        drawH = height * scaleFactor;
        drawW = (height * imgAspect) * scaleFactor;
      } else {
        drawW = width * scaleFactor;
        drawH = (width / imgAspect) * scaleFactor;
      }

      const drawX = (width - drawW) * (offsetX / 100);
      const drawY = (height - drawH) * (offsetY / 100);

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }
  }, [width, height, fitMode, bgColor, offsetX, offsetY, zoomScale, format]);

  useEffect(() => {
    renderResizedCanvas();
  }, [renderResizedCanvas]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mime = `image/${format}`;
    const dataUrl = canvas.toDataURL(mime, quality / 100);

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `resized-${width}x${height}.${format === 'jpeg' ? 'jpg' : format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs categoryName="Image" toolName="Image Resizer" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Image Resizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Resize images with live ratio preview without stretching or compressing your picture.
          </p>
        </div>

        {imageSrc && (
          <button
            onClick={handleDownload}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Resized ({width} × {height}px)</span>
          </button>
        )}
      </div>

      {!imageSrc ? (
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center bg-white dark:bg-slate-800/50 hover:border-amber-400 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Scaling className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Upload Image to Resize
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Select an image from your device to change dimensions or ratio safely.
          </p>
          <label className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer shadow-sm transition-colors">
            <Upload className="w-4 h-4" />
            <span>Select Image File</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleUpload(e.target.files[0]);
              }}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel (Left Column) */}
          <div className="space-y-5">
            
            {/* Presets */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/60">
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block mb-3">
                Social Media Aspect Ratio Presets
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map(p => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p.width, p.height)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-slate-800 dark:text-slate-200 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-xs block truncate">{p.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                      {p.width} × {p.height}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Dimensions & Lock Aspect */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Target Dimensions
                </span>
                <button
                  onClick={() => setLockAspect(!lockAspect)}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                    lockAspect ? 'bg-amber-400/20 text-amber-700 dark:text-amber-400 font-bold' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}
                  title={lockAspect ? 'Lock Aspect Ratio' : 'Unlock Aspect Ratio'}
                >
                  {lockAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>Lock Ratio</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 border border-transparent focus:border-amber-400 focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 border border-transparent focus:border-amber-400 focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              {/* Percentage Scaling */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 block mb-2">
                  Quick Percentage Scale
                </span>
                <div className="grid grid-cols-5 gap-1 text-xs font-bold">
                  {[25, 50, 75, 100, 150].map(pct => (
                    <button
                      key={pct}
                      onClick={() => handlePercentageChange(pct)}
                      className={`py-1.5 rounded-lg cursor-pointer ${
                        percentage === pct ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-slate-100 dark:bg-slate-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ratio Fit & Framing Adjustment (No Distortion) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/60 space-y-4 text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Framing & Distortion Control
              </span>

              <div className="grid grid-cols-3 gap-1 font-bold">
                <button
                  onClick={() => setFitMode('contain')}
                  className={`py-2 rounded-xl cursor-pointer ${
                    fitMode === 'contain' ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                  title="Preserve original photo ratio without stretching, padded with background color"
                >
                  Fit (Pad)
                </button>
                <button
                  onClick={() => setFitMode('cover')}
                  className={`py-2 rounded-xl cursor-pointer ${
                    fitMode === 'cover' ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                  title="Fill frame without stretching photo (smart crop)"
                >
                  Fill (Crop)
                </button>
                <button
                  onClick={() => setFitMode('stretch')}
                  className={`py-2 rounded-xl cursor-pointer ${
                    fitMode === 'stretch' ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                  title="Exact stretch/compress to dimensions"
                >
                  Stretch
                </button>
              </div>

              {fitMode === 'contain' && (
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Padding Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0"
                    />
                    <span className="font-mono text-slate-600 dark:text-slate-300 uppercase font-bold">{bgColor}</span>
                  </div>
                </div>
              )}

              {(fitMode === 'contain' || fitMode === 'cover') && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Horizontal Position</span>
                      <span>{offsetX}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={offsetX}
                      onChange={(e) => setOffsetX(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Vertical Position</span>
                      <span>{offsetY}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={offsetY}
                      onChange={(e) => setOffsetY(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Photo Zoom / Scale</span>
                      <span>{zoomScale}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={zoomScale}
                      onChange={(e) => setZoomScale(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Output Format */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/60 space-y-3 text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Export Format & Quality
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['png', 'jpeg', 'webp'] as const).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={`py-2 rounded-xl uppercase font-bold cursor-pointer ${
                      format === fmt ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-slate-100 dark:bg-slate-700'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Live Canvas Preview Panel (Right Column) */}
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center min-h-[460px]">
            <div className="text-xs text-amber-400 font-bold mb-3 flex items-center gap-1.5 bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700">
              <Sliders className="w-3.5 h-3.5" />
              <span>Live Resized Canvas Preview</span>
            </div>

            {/* Dynamic Resized Canvas */}
            <div className="relative max-w-full max-h-[380px] flex items-center justify-center overflow-hidden rounded-lg shadow-2xl bg-slate-950 p-2">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[340px] object-contain border border-slate-800 rounded shadow-md"
              />
            </div>

            {/* Readout stats */}
            <div className="mt-5 px-4 py-2.5 rounded-xl bg-slate-800/90 text-slate-300 text-xs font-mono border border-slate-700 flex flex-wrap items-center justify-center gap-4">
              <span>Original: {originalWidth} × {originalHeight}px</span>
              <span className="text-amber-400 font-bold">Target: {width} × {height}px</span>
              <span className="text-slate-400">Ratio: {(width / (height || 1)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <PrivacyNotice />
    </div>
  );
};
