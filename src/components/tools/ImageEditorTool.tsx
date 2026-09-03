import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical, 
  Crop, 
  Sliders, 
  Pencil, 
  Type, 
  Square, 
  Circle as CircleIcon, 
  Download, 
  RotateCcw as ResetIcon, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Eraser, 
  MoveRight, 
  Minus,
  Trash2,
  Move,
  Plus
} from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { PrivacyNotice } from '../layout/PrivacyNotice';

type ActiveMode = 'adjust' | 'crop' | 'draw' | 'elements';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  fontFamily: string;
}

interface ShapeElement {
  id: string;
  type: 'rectangle' | 'circle' | 'line' | 'arrow';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
}

interface DrawStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  size: number;
  isEraser: boolean;
}

export const ImageEditorTool: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<ActiveMode>('adjust');

  // Adjustments State
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [customAngle, setCustomAngle] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Drawing State
  const [brushColor, setBrushColor] = useState('#f59e0b');
  const [brushSize, setBrushSize] = useState(8);
  const [isEraser, setIsEraser] = useState(false);
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawStroke | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Text & Elements State
  const [textInput, setTextInput] = useState('Double click or drag me');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(36);
  const [textBold, setTextBold] = useState(true);
  const [textItalic, setTextItalic] = useState(false);
  const [textFont, setTextFont] = useState('sans-serif');
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [shapeElements, setShapeElements] = useState<ShapeElement[]>([]);

  // Dragging State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'text' | 'shape' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Viewport Zoom
  const [zoom, setZoom] = useState(100);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [exportQuality, setExportQuality] = useState(90);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load Image File
  const handleImageUpload = (file: File) => {
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
        resetAll();
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Reset Adjustments
  const resetAll = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHue(0);
    setBlur(0);
    setGrayscale(0);
    setSepia(0);
    setRotation(0);
    setCustomAngle(0);
    setFlipH(false);
    setFlipV(false);
    setTextElements([]);
    setShapeElements([]);
    setStrokes([]);
    setSelectedId(null);
    setSelectedType(null);
  };

  // Render Everything to Canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetWidth = img.width;
    const targetHeight = img.height;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply Filter String
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%)`;

    // Center & Transform Base Image
    const totalRotation = (rotation + customAngle) % 360;
    const rad = (totalRotation * Math.PI) / 180;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    // Render Freehand Drawn Strokes
    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;
    allStrokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (stroke.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.stroke();
      ctx.restore();
    });

    // Render Shapes
    shapeElements.forEach(shape => {
      ctx.save();
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.strokeWidth;
      ctx.fillStyle = shape.color;

      if (shape.type === 'rectangle') {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === 'circle') {
        ctx.beginPath();
        ctx.arc(
          shape.x + shape.width / 2,
          shape.y + shape.height / 2,
          Math.abs(shape.width / 2),
          0,
          2 * Math.PI
        );
        ctx.stroke();
      } else if (shape.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(shape.x, shape.y);
        ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
        ctx.stroke();
      } else if (shape.type === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(shape.x, shape.y);
        ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
        ctx.stroke();
        const headlen = 16;
        const angle = Math.atan2(shape.height, shape.width);
        ctx.beginPath();
        ctx.moveTo(shape.x + shape.width, shape.y + shape.height);
        ctx.lineTo(
          shape.x + shape.width - headlen * Math.cos(angle - Math.PI / 6),
          shape.y + shape.height - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          shape.x + shape.width - headlen * Math.cos(angle + Math.PI / 6),
          shape.y + shape.height - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.fill();
      }

      // Highlight if selected
      if (selectedId === shape.id && selectedType === 'shape') {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(shape.x - 6, shape.y - 6, shape.width + 12, shape.height + 12);
      }
      ctx.restore();
    });

    // Render Text Elements
    textElements.forEach(el => {
      ctx.save();
      ctx.fillStyle = el.color;
      ctx.font = `${el.italic ? 'italic ' : ''}${el.bold ? 'bold ' : ''}${el.fontSize}px ${el.fontFamily}`;
      ctx.textBaseline = 'top';
      ctx.fillText(el.text, el.x, el.y);

      // Highlight if selected
      if (selectedId === el.id && selectedType === 'text') {
        const metrics = ctx.measureText(el.text);
        const textWidth = metrics.width;
        const textHeight = el.fontSize;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(el.x - 6, el.y - 6, textWidth + 12, textHeight + 12);
      }
      ctx.restore();
    });

  }, [brightness, contrast, saturation, hue, blur, grayscale, sepia, rotation, customAngle, flipH, flipV, strokes, currentStroke, textElements, shapeElements, selectedId, selectedType]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Canvas Mouse Coordinates Helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // Canvas Pointer Handlers
  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    if (activeMode === 'draw') {
      setIsDrawing(true);
      setCurrentStroke({
        id: Date.now().toString(),
        points: [coords],
        color: brushColor,
        size: brushSize,
        isEraser: isEraser,
      });
      return;
    }

    // Interactive Dragging Mode (for Text and Shapes)
    const ctx = canvasRef.current?.getContext('2d');

    // Check if clicked on a Text element
    if (ctx) {
      for (let i = textElements.length - 1; i >= 0; i--) {
        const el = textElements[i];
        ctx.font = `${el.italic ? 'italic ' : ''}${el.bold ? 'bold ' : ''}${el.fontSize}px ${el.fontFamily}`;
        const metrics = ctx.measureText(el.text);
        const w = metrics.width;
        const h = el.fontSize;

        if (coords.x >= el.x - 10 && coords.x <= el.x + w + 10 && coords.y >= el.y - 10 && coords.y <= el.y + h + 10) {
          setSelectedId(el.id);
          setSelectedType('text');
          setIsDragging(true);
          setDragOffset({ x: coords.x - el.x, y: coords.y - el.y });
          return;
        }
      }

      // Check if clicked on a Shape element
      for (let i = shapeElements.length - 1; i >= 0; i--) {
        const shape = shapeElements[i];
        if (coords.x >= shape.x - 10 && coords.x <= shape.x + shape.width + 10 && coords.y >= shape.y - 10 && coords.y <= shape.y + shape.height + 10) {
          setSelectedId(shape.id);
          setSelectedType('shape');
          setIsDragging(true);
          setDragOffset({ x: coords.x - shape.x, y: coords.y - shape.y });
          return;
        }
      }
    }

    // Clicked background
    setSelectedId(null);
    setSelectedType(null);
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    if (activeMode === 'draw' && isDrawing && currentStroke) {
      setCurrentStroke(prev => prev ? {
        ...prev,
        points: [...prev.points, coords]
      } : null);
      return;
    }

    if (isDragging && selectedId) {
      if (selectedType === 'text') {
        setTextElements(prev => prev.map(el => el.id === selectedId ? {
          ...el,
          x: coords.x - dragOffset.x,
          y: coords.y - dragOffset.y
        } : el));
      } else if (selectedType === 'shape') {
        setShapeElements(prev => prev.map(shape => shape.id === selectedId ? {
          ...shape,
          x: coords.x - dragOffset.x,
          y: coords.y - dragOffset.y
        } : shape));
      }
    }
  };

  const handlePointerUp = () => {
    if (activeMode === 'draw' && isDrawing && currentStroke) {
      setStrokes(prev => [...prev, currentStroke]);
      setCurrentStroke(null);
      setIsDrawing(false);
    }
    setIsDragging(false);
  };

  // Add Text Element
  const handleAddText = () => {
    if (!textInput.trim() || !canvasRef.current) return;
    const newEl: TextElement = {
      id: Date.now().toString(),
      text: textInput,
      x: canvasRef.current.width / 4,
      y: canvasRef.current.height / 4,
      fontSize: textSize,
      color: textColor,
      bold: textBold,
      italic: textItalic,
      fontFamily: textFont,
    };
    setTextElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
    setSelectedType('text');
  };

  // Add Shape Element
  const handleAddShape = (type: 'rectangle' | 'circle' | 'line' | 'arrow') => {
    if (!canvasRef.current) return;
    const newShape: ShapeElement = {
      id: Date.now().toString(),
      type,
      x: canvasRef.current.width / 3,
      y: canvasRef.current.height / 3,
      width: 160,
      height: 100,
      color: brushColor,
      strokeWidth: 6,
    };
    setShapeElements(prev => [...prev, newShape]);
    setSelectedId(newShape.id);
    setSelectedType('shape');
  };

  // Delete Selected Element
  const handleDeleteSelected = () => {
    if (!selectedId) return;
    if (selectedType === 'text') {
      setTextElements(prev => prev.filter(t => t.id !== selectedId));
    } else if (selectedType === 'shape') {
      setShapeElements(prev => prev.filter(s => s.id !== selectedId));
    }
    setSelectedId(null);
    setSelectedType(null);
  };

  // Export Image Download
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Deselect before export render
    setSelectedId(null);
    setSelectedType(null);

    setTimeout(() => {
      const mime = `image/${exportFormat}`;
      const dataUrl = canvas.toDataURL(mime, exportQuality / 100);

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `edited-image.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 50);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs categoryName="Image" toolName="Image Editor" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Image Editor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Crop, rotate, adjust colors, freehand draw, and drag text & shapes around your picture.
          </p>
        </div>

        {imageSrc && (
          <div className="flex items-center gap-2">
            <button
              onClick={resetAll}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ResetIcon className="w-4 h-4" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleExport}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Image</span>
            </button>
          </div>
        )}
      </div>

      {!imageSrc ? (
        /* Upload Area */
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center bg-white dark:bg-slate-800/50 hover:border-amber-400 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Upload an Image to Start Editing
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Supports JPG, PNG, WebP, GIF. Processed 100% locally on your device.
          </p>
          <label className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer shadow-sm transition-colors">
            <Upload className="w-4 h-4" />
            <span>Choose File</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
              }}
            />
          </label>
        </div>
      ) : (
        /* Editor Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Canvas Viewport (Center / Left) */}
          <div className="lg:col-span-3 bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[480px] overflow-hidden border border-slate-800">
            
            {/* Instruction Banner */}
            <div className="absolute top-3 left-4 right-4 z-10 flex items-center justify-between text-[11px] text-slate-400 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700">
              <span>
                {activeMode === 'draw' 
                  ? '✏️ Draw Mode Active: Click and drag on picture to draw' 
                  : '🖱️ Move Mode: Click & drag any text or shape to move it around'}
              </span>
              {selectedId && (
                <button
                  onClick={handleDeleteSelected}
                  className="text-red-400 font-bold flex items-center gap-1 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected Item</span>
                </button>
              )}
            </div>

            {/* Rendered Image Canvas */}
            <div 
              className="relative overflow-auto max-w-full max-h-[580px] flex items-center justify-center rounded-lg shadow-2xl mt-8"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
            >
              <canvas
                ref={canvasRef}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                className={`max-w-full max-h-[500px] object-contain select-none ${
                  activeMode === 'draw' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
                }`}
              />
            </div>

            {/* Canvas Bottom Viewport Toolbar */}
            <div className="mt-4 flex items-center gap-3 bg-slate-800/90 backdrop-blur px-4 py-2 rounded-xl text-slate-300 text-xs border border-slate-700 z-10">
              <button
                onClick={() => setZoom(prev => Math.max(25, prev - 25))}
                className="p-1 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-semibold w-12 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(prev => Math.min(200, prev + 25))}
                className="p-1 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(100)}
                className="p-1 hover:text-white border-l border-slate-700 pl-2 cursor-pointer"
                title="Reset Zoom"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Controls Sidebar (Right) */}
          <div className="space-y-4">
            
            {/* Mode Tab Navigation */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveMode('adjust')}
                className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  activeMode === 'adjust'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Adjust</span>
              </button>

              <button
                onClick={() => setActiveMode('crop')}
                className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  activeMode === 'crop'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Crop className="w-4 h-4" />
                <span>Rotate</span>
              </button>

              <button
                onClick={() => setActiveMode('draw')}
                className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  activeMode === 'draw'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Pencil className="w-4 h-4" />
                <span>Draw</span>
              </button>

              <button
                onClick={() => setActiveMode('elements')}
                className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  activeMode === 'elements'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Type className="w-4 h-4" />
                <span>Text/Shapes</span>
              </button>
            </div>

            {/* Mode Controls Body */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
              
              {/* ADJUSTMENTS MODE */}
              {activeMode === 'adjust' && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Brightness</span>
                      <span>{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Contrast</span>
                      <span>{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Saturation</span>
                      <span>{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Hue Rotation</span>
                      <span>{hue}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={hue}
                      onChange={(e) => setHue(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Blur</span>
                      <span>{blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={blur}
                      onChange={(e) => setBlur(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Grayscale</span>
                      <span>{grayscale}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={grayscale}
                      onChange={(e) => setGrayscale(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Sepia</span>
                      <span>{sepia}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sepia}
                      onChange={(e) => setSepia(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* ROTATE / FLIP MODE */}
              {activeMode === 'crop' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                      Quick Rotation
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setRotation(prev => (prev + 90) % 360)}
                        className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCw className="w-4 h-4 text-amber-500" />
                        <span>Rotate 90°</span>
                      </button>

                      <button
                        onClick={() => setRotation(prev => (prev + 270) % 360)}
                        className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-amber-500" />
                        <span>Rotate -90°</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                      Flip Image
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setFlipH(!flipH)}
                        className={`py-2.5 px-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          flipH ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-700'
                        }`}
                      >
                        <FlipHorizontal className="w-4 h-4" />
                        <span>Flip Horiz</span>
                      </button>

                      <button
                        onClick={() => setFlipV(!flipV)}
                        className={`py-2.5 px-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          flipV ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-700'
                        }`}
                      >
                        <FlipVertical className="w-4 h-4" />
                        <span>Flip Vert</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Custom Angle</span>
                      <span>{customAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      value={customAngle}
                      onChange={(e) => setCustomAngle(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* DRAW MODE */}
              {activeMode === 'draw' && (
                <div className="space-y-4 text-xs">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEraser(false)}
                      className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                        !isEraser ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 dark:bg-slate-700'
                      }`}
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Brush</span>
                    </button>
                    <button
                      onClick={() => setIsEraser(true)}
                      className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                        isEraser ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 dark:bg-slate-700'
                      }`}
                    >
                      <Eraser className="w-4 h-4" />
                      <span>Eraser</span>
                    </button>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Brush Color
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0"
                      />
                      <span className="font-mono text-slate-600 dark:text-slate-300 uppercase font-bold">{brushColor}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Brush / Eraser Size</span>
                      <span>{brushSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="60"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  {strokes.length > 0 && (
                    <button
                      onClick={() => setStrokes([])}
                      className="w-full py-2 rounded-xl bg-red-500/10 text-red-500 font-bold flex items-center justify-center gap-1.5 hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All Drawings</span>
                    </button>
                  )}
                </div>
              )}

              {/* TEXT & ELEMENTS MODE */}
              {activeMode === 'elements' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Text Content
                    </label>
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 border border-transparent focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Color</span>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-8 rounded-lg cursor-pointer border-0"
                      />
                    </div>

                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Font</span>
                      <select
                        value={textFont}
                        onChange={(e) => setTextFont(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-semibold focus:outline-none"
                      >
                        <option value="sans-serif">Sans-Serif</option>
                        <option value="serif">Serif</option>
                        <option value="monospace">Monospace</option>
                        <option value="cursive">Cursive</option>
                        <option value="Impact">Impact</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Size: {textSize}px</span>
                      <input
                        type="range"
                        min="12"
                        max="120"
                        value={textSize}
                        onChange={(e) => setTextSize(Number(e.target.value))}
                        className="w-28 accent-amber-500"
                      />
                    </div>

                    <div className="flex gap-1 pt-2">
                      <button
                        onClick={() => setTextBold(!textBold)}
                        className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                          textBold ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-700'
                        }`}
                      >
                        B
                      </button>
                      <button
                        onClick={() => setTextItalic(!textItalic)}
                        className={`px-3 py-1.5 rounded-lg italic font-bold cursor-pointer ${
                          textItalic ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-700'
                        }`}
                      >
                        I
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddText}
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Written Text to Picture</span>
                  </button>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                      Add Moveable Shapes
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAddShape('rectangle')}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Square className="w-4 h-4 text-amber-500" />
                        <span>Rectangle</span>
                      </button>

                      <button
                        onClick={() => handleAddShape('circle')}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CircleIcon className="w-4 h-4 text-amber-500" />
                        <span>Circle</span>
                      </button>

                      <button
                        onClick={() => handleAddShape('line')}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Minus className="w-4 h-4 text-amber-500" />
                        <span>Line</span>
                      </button>

                      <button
                        onClick={() => handleAddShape('arrow')}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <MoveRight className="w-4 h-4 text-amber-500" />
                        <span>Arrow</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Export Settings Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 space-y-3 text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Export Format & Quality
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(['png', 'jpeg', 'webp'] as const).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={`py-1.5 rounded-lg font-bold uppercase cursor-pointer ${
                      exportFormat === fmt ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-700'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              {exportFormat !== 'png' && (
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Quality</span>
                    <span>{exportQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={exportQuality}
                    onChange={(e) => setExportQuality(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      <PrivacyNotice />
    </div>
  );
};
