import React, { useState } from 'react';
import { Palette, Copy, Check, Upload, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { PrivacyNotice } from '../layout/PrivacyNotice';

export const ColorToolsTool: React.FC = () => {
  const [color, setColor] = useState('#F59E0B'); // Warm Amber Yellow
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [extractedPalette, setExtractedPalette] = useState<string[]>([]);

  // Convert HEX to RGB
  const hexToRgb = (hex: string) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  };

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // HSL to HEX
  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * c).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const hexVal = color.toUpperCase();
  const rgbVal = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslVal = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  // Palettes logic
  const complementary = hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
  const analogous = [
    hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
    color,
    hslToHex((hsl.h + 330) % 360, hsl.s, hsl.l)
  ];
  const triadic = [
    color,
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
  ];
  const monochromatic = [
    hslToHex(hsl.h, hsl.s, Math.max(10, hsl.l - 30)),
    hslToHex(hsl.h, hsl.s, Math.max(20, hsl.l - 15)),
    color,
    hslToHex(hsl.h, hsl.s, Math.min(90, hsl.l + 15)),
    hslToHex(hsl.h, hsl.s, Math.min(95, hsl.l + 30)),
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Image color extraction using canvas
  const handleImageExtract = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, 100, 100);
        const data = ctx.getImageData(0, 0, 100, 100).data;

        const colorCounts: Record<string, number> = {};
        for (let i = 0; i < data.length; i += 16) {
          const r = Math.round(data[i] / 32) * 32;
          const g = Math.round(data[i + 1] / 32) * 32;
          const b = Math.round(data[i + 2] / 32) * 32;
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }

        const sorted = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);
        setExtractedPalette(sorted.slice(0, 6));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs categoryName="Design" toolName="Color Tools" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Color Tools Utility
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pick colors, convert formats, generate harmony palettes, and extract colors from images.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Color Picker Card (1 Col) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-5">
          
          {/* Main Color Box */}
          <div
            className="w-full h-40 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: color }}
          >
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span className="bg-slate-950/70 backdrop-blur text-white font-mono text-sm font-bold px-3 py-1.5 rounded-xl border border-white/20 shadow-lg">
              {hexVal}
            </span>
          </div>

          {/* Color Code Values */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 font-mono">
              <span className="text-slate-500 font-sans font-bold">HEX</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{hexVal}</span>
              <button onClick={() => handleCopy(hexVal)} className="p-1 hover:text-amber-500">
                {copiedCode === hexVal ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 font-mono">
              <span className="text-slate-500 font-sans font-bold">RGB</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{rgbVal}</span>
              <button onClick={() => handleCopy(rgbVal)} className="p-1 hover:text-amber-500">
                {copiedCode === rgbVal ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 font-mono">
              <span className="text-slate-500 font-sans font-bold">HSL</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{hslVal}</span>
              <button onClick={() => handleCopy(hslVal)} className="p-1 hover:text-amber-500">
                {copiedCode === hslVal ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

        </div>

        {/* Harmony Palettes & Extraction Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Harmony Palettes */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-5">
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block uppercase tracking-wider">
              Color Harmonies & Palettes
            </span>

            {/* Monochromatic */}
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-2">Monochromatic</span>
              <div className="grid grid-cols-5 gap-2">
                {monochromatic.map((hex, i) => (
                  <button
                    key={i}
                    onClick={() => handleCopy(hex)}
                    className="h-12 rounded-xl flex items-end justify-center pb-1 text-[10px] font-mono font-bold text-white shadow-sm hover:scale-105 transition-transform cursor-pointer border border-black/10"
                    style={{ backgroundColor: hex }}
                  >
                    {copiedCode === hex ? '✓' : hex}
                  </button>
                ))}
              </div>
            </div>

            {/* Analogous */}
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-2">Analogous</span>
              <div className="grid grid-cols-3 gap-2">
                {analogous.map((hex, i) => (
                  <button
                    key={i}
                    onClick={() => handleCopy(hex)}
                    className="h-12 rounded-xl flex items-end justify-center pb-1 text-[10px] font-mono font-bold text-white shadow-sm hover:scale-105 transition-transform cursor-pointer border border-black/10"
                    style={{ backgroundColor: hex }}
                  >
                    {copiedCode === hex ? '✓' : hex}
                  </button>
                ))}
              </div>
            </div>

            {/* Triadic & Complementary */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-2">Complementary</span>
                <div className="grid grid-cols-2 gap-2">
                  {[color, complementary].map((hex, i) => (
                    <button
                      key={i}
                      onClick={() => handleCopy(hex)}
                      className="h-12 rounded-xl flex items-end justify-center pb-1 text-[10px] font-mono font-bold text-white shadow-sm hover:scale-105 transition-transform cursor-pointer border border-black/10"
                      style={{ backgroundColor: hex }}
                    >
                      {copiedCode === hex ? '✓' : hex}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-2">Triadic</span>
                <div className="grid grid-cols-3 gap-2">
                  {triadic.map((hex, i) => (
                    <button
                      key={i}
                      onClick={() => handleCopy(hex)}
                      className="h-12 rounded-xl flex items-end justify-center pb-1 text-[10px] font-mono font-bold text-white shadow-sm hover:scale-105 transition-transform cursor-pointer border border-black/10"
                      style={{ backgroundColor: hex }}
                    >
                      {copiedCode === hex ? '✓' : hex}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Extract Colors from Image */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block uppercase tracking-wider">
              Extract Palette from Image
            </span>

            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-amber-500" />
              <span>Upload Image to Extract Palette</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageExtract(e.target.files[0]);
                }}
              />
            </label>

            {extractedPalette.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-500 block mb-2">
                  Extracted Swatches (Click to copy)
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {extractedPalette.map((hex, i) => (
                    <button
                      key={i}
                      onClick={() => { setColor(hex); handleCopy(hex); }}
                      className="h-12 rounded-xl flex items-end justify-center pb-1 text-[10px] font-mono font-bold text-white shadow-sm hover:scale-105 transition-transform cursor-pointer border border-black/10"
                      style={{ backgroundColor: hex }}
                    >
                      {hex}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      <PrivacyNotice />
    </div>
  );
};
