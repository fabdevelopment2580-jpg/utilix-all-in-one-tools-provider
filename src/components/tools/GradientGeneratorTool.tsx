import React, { useState, useRef } from 'react';
import { Paintbrush, Copy, Check, Download, Plus, Trash2, Upload, Eye, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { PrivacyNotice } from '../layout/PrivacyNotice';

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

const PRESETS = [
  { name: 'Warm Amber', color1: '#F59E0B', color2: '#EF4444' },
  { name: 'Sunset Glow', color1: '#FF7E5F', color2: '#FEB47B' },
  { name: 'Oceanic', color1: '#2B5876', color2: '#4E4376' },
  { name: 'Neon Life', color1: '#B92B27', color2: '#1565C0' },
  { name: 'Lush Mint', color1: '#11998E', color2: '#38EF7D' },
  { name: 'Midnight Purple', color1: '#0F2027', color2: '#2C5364' },
  { name: 'Cherry Blossom', color1: '#F857A6', color2: '#FF5858' },
  { name: 'Golden Hour', color1: '#FFE000', color2: '#799F0C' },
];

export const GradientGeneratorTool: React.FC = () => {
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState(135);

  // 2-Color & Ratio State
  const [color1, setColor1] = useState('#F59E0B');
  const [color2, setColor2] = useState('#D97706');
  const [ratio, setRatio] = useState(50); // Midpoint ratio between 0% and 100%

  // Download Aspect Ratio & Format State
  const [exportRatio, setExportRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3' | '3:2' | '21:9'>('16:9');
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  const [copied, setCopied] = useState(false);

  // Image Color Extraction State
  const [importedImageSrc, setImportedImageSrc] = useState<string | null>(null);
  const [pickingTarget, setPickingTarget] = useState<'color1' | 'color2'>('color1');
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // CSS Value Calculation
  const cssValue = gradientType === 'linear'
    ? `linear-gradient(${angle}deg, ${color1} 0%, ${color1} ${ratio / 2}%, ${color2} ${ratio + (100 - ratio) / 2}%, ${color2} 100%)`
    : `radial-gradient(circle, ${color1} 0%, ${color1} ${ratio / 2}%, ${color2} ${ratio + (100 - ratio) / 2}%, ${color2} 100%)`;

  const cleanCssValue = gradientType === 'linear'
    ? `linear-gradient(${angle}deg, ${color1} 0%, ${color2} ${ratio}%)`
    : `radial-gradient(circle, ${color1} 0%, ${color2} ${ratio}%)`;

  const fullCssCode = `background: ${cleanCssValue};`;

  const handleCopyCss = () => {
    navigator.clipboard.writeText(fullCssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Image Import & Palette Extraction
  const handleImageImport = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImportedImageSrc(src);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;
        const canvas = imageCanvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          autoExtractImageColors();
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Pick Color on Image Click
  const handleImageClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;

    if (pickingTarget === 'color1') {
      setColor1(hex);
      setPickingTarget('color2');
    } else {
      setColor2(hex);
      setPickingTarget('color1');
    }
  };

  // Auto Extract 2 Dominant Colors from Imported Image
  const autoExtractImageColors = () => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let r1 = 0, g1 = 0, b1 = 0, count1 = 0;
    let r2 = 0, g2 = 0, b2 = 0, count2 = 0;

    // Sample top half and bottom half pixels
    const totalPixels = data.length / 4;
    const half = Math.floor(totalPixels / 2);

    for (let i = 0; i < half; i += 16) {
      r1 += data[i * 4];
      g1 += data[i * 4 + 1];
      b1 += data[i * 4 + 2];
      count1++;
    }

    for (let i = half; i < totalPixels; i += 16) {
      r2 += data[i * 4];
      g2 += data[i * 4 + 1];
      b2 += data[i * 4 + 2];
      count2++;
    }

    if (count1 > 0 && count2 > 0) {
      const hex1 = `#${((1 << 24) + (Math.floor(r1 / count1) << 16) + (Math.floor(g1 / count1) << 8) + Math.floor(b1 / count1)).toString(16).slice(1)}`;
      const hex2 = `#${((1 << 24) + (Math.floor(r2 / count2) << 16) + (Math.floor(g2 / count2) << 8) + Math.floor(b2 / count2)).toString(16).slice(1)}`;
      setColor1(hex1);
      setColor2(hex2);
    }
  };

  const handleDownloadImage = () => {
    const canvas = document.createElement('canvas');

    let w = 1920;
    let h = 1080;

    switch (exportRatio) {
      case '16:9':
        w = 1920;
        h = 1080;
        break;
      case '9:16':
        w = 1080;
        h = 1920;
        break;
      case '1:1':
        w = 1080;
        h = 1080;
        break;
      case '4:3':
        w = 1440;
        h = 1080;
        break;
      case '3:2':
        w = 1620;
        h = 1080;
        break;
      case '21:9':
        w = 2520;
        h = 1080;
        break;
      default:
        w = 1920;
        h = 1080;
    }

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let grad;
    if (gradientType === 'linear') {
      const rad = (angle * Math.PI) / 180;
      const x1 = canvas.width / 2 - (Math.cos(rad) * canvas.width) / 2;
      const y1 = canvas.height / 2 - (Math.sin(rad) * canvas.height) / 2;
      const x2 = canvas.width / 2 + (Math.cos(rad) * canvas.width) / 2;
      const y2 = canvas.height / 2 + (Math.sin(rad) * canvas.height) / 2;
      grad = ctx.createLinearGradient(x1, y1, x2, y2);
    } else {
      const radius = Math.max(canvas.width, canvas.height) / 2;
      grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, radius
      );
    }

    grad.addColorStop(0, color1);
    grad.addColorStop(ratio / 100, color2);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const mimeType = exportFormat === 'jpeg' ? 'image/jpeg' : exportFormat === 'webp' ? 'image/webp' : 'image/png';
    const fileExt = exportFormat;

    const a = document.createElement('a');
    a.href = canvas.toDataURL(mimeType, 0.95);
    a.download = `gradient-${exportRatio.replace(':', 'x')}.${fileExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs categoryName="Design" toolName="Gradient Generator" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Two-Color Gradient & Image Color Picker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pick 2 colors, adjust ratio & angles, or import an image to pick colors directly from your photo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Ratio:</span>
            {(['16:9', '9:16', '1:1', '4:3', '3:2', '21:9'] as const).map(r => (
              <button
                key={r}
                onClick={() => setExportRatio(r)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  exportRatio === r ? 'bg-amber-400 text-slate-950 font-extrabold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Format:</span>
            {(['png', 'jpeg', 'webp'] as const).map(f => (
              <button
                key={f}
                onClick={() => setExportFormat(f)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs uppercase transition-colors cursor-pointer ${
                  exportFormat === f ? 'bg-amber-400 text-slate-950 font-extrabold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadImage}
            className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download {exportFormat.toUpperCase()} ({exportRatio})</span>
          </button>

          <button
            onClick={handleCopyCss}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied CSS!' : 'Copy CSS Code'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column (Left) */}
        <div className="space-y-6">
          
          {/* Two Color Selection & Ratio Slider */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
              Two-Color Selector
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Color 1</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color1}
                    onChange={(e) => setColor1(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">{color1}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Color 2</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color2}
                    onChange={(e) => setColor2(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">{color2}</span>
                </div>
              </div>
            </div>

            {/* Gradient Ratio Adjuster */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Gradient Ratio / Balance</span>
                <span className="text-amber-600 font-extrabold">{ratio}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={ratio}
                onChange={(e) => setRatio(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Move slider left or right to adjust the balance ratio of Color 1 vs Color 2.
              </p>
            </div>

            {/* Gradient Type & Angle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => setGradientType('linear')}
                  className={`py-2 rounded-xl transition-colors cursor-pointer ${
                    gradientType === 'linear' ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  Linear
                </button>
                <button
                  onClick={() => setGradientType('radial')}
                  className={`py-2 rounded-xl transition-colors cursor-pointer ${
                    gradientType === 'radial' ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  Radial
                </button>
              </div>

              {gradientType === 'linear' && (
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Angle</span>
                    <span className="text-amber-600 font-extrabold">{angle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Import Image & Pick Colors Feature */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/60 space-y-3 text-xs">
            <span className="font-bold text-slate-900 dark:text-slate-100 block">
              Import Image & Pick 2 Colors
            </span>

            <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-amber-400 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/50">
              <ImageIcon className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Upload Image File</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageImport(e.target.files[0]);
                }}
              />
            </label>

            {importedImageSrc && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-500">
                    Click photo to pick: <strong className="text-amber-500 uppercase">{pickingTarget}</strong>
                  </span>
                  <button
                    onClick={autoExtractImageColors}
                    className="text-amber-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto Palette</span>
                  </button>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48 bg-slate-950 flex items-center justify-center">
                  <canvas
                    ref={imageCanvasRef}
                    onClick={handleImageClick}
                    className="max-w-full max-h-48 object-contain cursor-crosshair"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Curated 2-Color Presets */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
              2-Color Quick Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setColor1(preset.color1);
                    setColor2(preset.color2);
                  }}
                  className="h-10 rounded-xl text-left px-3 text-xs font-bold text-white shadow-sm flex items-center justify-between hover:scale-105 transition-transform cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})`
                  }}
                >
                  <span className="drop-shadow font-extrabold">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Live Preview Box Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Preview Box */}
          <div
            className="w-full h-80 sm:h-96 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 transition-all relative overflow-hidden"
            style={{ background: cssValue }}
          />

          {/* Generated CSS Code Box */}
          <div className="bg-slate-900 rounded-2xl p-4 text-xs font-mono text-amber-300 border border-slate-800 flex items-center justify-between gap-4">
            <span className="truncate">{fullCssCode}</span>
            <button
              onClick={handleCopyCss}
              className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold shrink-0 hover:bg-amber-500 transition-colors cursor-pointer"
            >
              Copy CSS
            </button>
          </div>

        </div>

      </div>

      <PrivacyNotice />
    </div>
  );
};
