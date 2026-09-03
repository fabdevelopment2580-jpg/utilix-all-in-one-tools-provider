import { ToolItem } from '../types';

export const TOOLS: ToolItem[] = [
  {
    id: 'ai-website-generator',
    name: 'AI Website Generator',
    category: 'ai',
    categoryLabel: 'AI Tools',
    description: 'Describe any website idea to generate, preview, visually edit, and export complete multi-page HTML/CSS/JS websites.',
    iconName: 'Wand2',
    keywords: ['ai', 'website', 'generator', 'builder', 'html', 'css', 'js', 'export', 'design', 'multi-page', 'no-code'],
    isPopular: true
  },
  {
    id: 'image-editor',
    name: 'Image Editor',
    category: 'image',
    categoryLabel: 'Image',
    description: 'Crop, resize, rotate, adjust colors, draw, add text, and apply filters to images.',
    iconName: 'Image',
    keywords: ['photo', 'edit', 'crop', 'filter', 'draw', 'annotate', 'adjust', 'canvas'],
    isPopular: true
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    category: 'image',
    categoryLabel: 'Image',
    description: 'Reduce image file size instantly without sacrificing visible quality.',
    iconName: 'Minimize2',
    keywords: ['compress', 'optimize', 'shrink', 'size', 'jpg', 'png', 'webp', 'batch'],
    isPopular: true
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    category: 'image',
    categoryLabel: 'Image',
    description: 'Convert images between PNG, JPG, and WebP formats in batch.',
    iconName: 'RefreshCw',
    keywords: ['convert', 'format', 'png', 'jpg', 'jpeg', 'webp', 'batch'],
    isPopular: false
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    category: 'image',
    categoryLabel: 'Image',
    description: 'Resize images by dimensions or percentage with social media aspect presets.',
    iconName: 'Scaling',
    keywords: ['resize', 'dimensions', 'aspect ratio', 'scale', 'instagram', 'youtube', 'facebook'],
    isPopular: false
  },
  {
    id: 'pdf-tools',
    name: 'PDF Tools',
    category: 'pdf',
    categoryLabel: 'PDF',
    description: 'Merge, split, reorder, rotate, and extract pages from PDF files locally.',
    iconName: 'FileText',
    keywords: ['pdf', 'merge', 'split', 'reorder', 'rotate', 'extract', 'combine', 'pages'],
    isPopular: true
  },
  {
    id: 'text-editor',
    name: 'Rich Text Editor',
    category: 'text',
    categoryLabel: 'Text & Code',
    description: 'Clean rich text editor with real-time word counter, character statistics, and export.',
    iconName: 'Edit3',
    keywords: ['text', 'words', 'counter', 'editor', 'rich text', 'formatting', 'characters', 'txt'],
    isPopular: false
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    category: 'utility',
    categoryLabel: 'Utilities',
    description: 'Generate secure, cryptographically random passwords with custom parameters.',
    iconName: 'KeyRound',
    keywords: ['password', 'security', 'generator', 'crypto', 'random', 'pin', 'strong'],
    isPopular: true
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    category: 'design',
    categoryLabel: 'Design',
    description: 'Create customized QR codes for URLs, text, Wi-Fi, email, and phone with instant download.',
    iconName: 'QrCode',
    keywords: ['qr', 'code', 'barcode', 'wifi', 'url', 'link', 'download', 'png', 'svg'],
    isPopular: true
  },
  {
    id: 'color-tools',
    name: 'Color Tools',
    category: 'design',
    categoryLabel: 'Design',
    description: 'Color picker, palette generator, image palette extractor, and WCAG contrast check.',
    iconName: 'Palette',
    keywords: ['color', 'picker', 'hex', 'rgb', 'hsl', 'palette', 'harmony', 'contrast', 'eyedropper'],
    isPopular: false
  },
  {
    id: 'gradient-generator',
    name: 'Gradient Generator',
    category: 'design',
    categoryLabel: 'Design',
    description: 'Design custom CSS linear & radial gradients, copy code, and export image.',
    iconName: 'Paintbrush',
    keywords: ['gradient', 'css', 'color', 'linear', 'radial', 'background', 'builder'],
    isPopular: false
  },
  {
    id: 'code-formatter',
    name: 'Code Formatter',
    category: 'text',
    categoryLabel: 'Text & Code',
    description: 'Format, beautify, minify, and validate JSON, HTML, CSS, and JavaScript.',
    iconName: 'Code2',
    keywords: ['json', 'html', 'css', 'javascript', 'format', 'beautify', 'minify', 'validate', 'syntax'],
    isPopular: false
  },
  {
    id: 'time-date-tools',
    name: 'Time & Date Tools',
    category: 'utility',
    categoryLabel: 'Utilities',
    description: 'Stopwatch, countdown timer, date difference, Unix timestamp converter, and world clocks.',
    iconName: 'Clock',
    keywords: ['time', 'date', 'stopwatch', 'timer', 'countdown', 'timestamp', 'unix', 'diff', 'clock'],
    isPopular: false
  },
  {
    id: 'calculator-suite',
    name: 'Calculator Suite',
    category: 'utility',
    categoryLabel: 'Utilities',
    description: 'Standard & scientific calculators, percentage calculator, age calculator, and unit converter.',
    iconName: 'Calculator',
    keywords: ['calculator', 'math', 'scientific', 'percentage', 'age', 'unit converter', 'length', 'weight'],
    isPopular: true
  }
];

export const CATEGORIES = [
  { id: 'all', label: 'All Tools' },
  { id: 'ai', label: 'AI Tools' },
  { id: 'image', label: 'Image' },
  { id: 'pdf', label: 'PDF' },
  { id: 'text', label: 'Text & Code' },
  { id: 'design', label: 'Design' },
  { id: 'utility', label: 'Utilities' },
];
