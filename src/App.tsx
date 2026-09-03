import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/home/Hero';
import { RecentlyUsed } from './components/home/RecentlyUsed';
import { ToolGrid } from './components/home/ToolGrid';

// Import all 14 Tool Components
import { AiWebsiteGeneratorTool } from './components/tools/AiWebsiteGeneratorTool';
import { ImageEditorTool } from './components/tools/ImageEditorTool';
import { ImageCompressorTool } from './components/tools/ImageCompressorTool';
import { ImageConverterTool } from './components/tools/ImageConverterTool';
import { ImageResizerTool } from './components/tools/ImageResizerTool';
import { PdfToolsTool } from './components/tools/PdfToolsTool';
import { TextEditorTool } from './components/tools/TextEditorTool';
import { PasswordGeneratorTool } from './components/tools/PasswordGeneratorTool';
import { QrGeneratorTool } from './components/tools/QrGeneratorTool';
import { ColorToolsTool } from './components/tools/ColorToolsTool';
import { GradientGeneratorTool } from './components/tools/GradientGeneratorTool';
import { CodeFormatterTool } from './components/tools/CodeFormatterTool';
import { TimeDateTool } from './components/tools/TimeDateTool';
import { CalculatorSuiteTool } from './components/tools/CalculatorSuiteTool';

const MainContent: React.FC = () => {
  const { activeToolId } = useApp();

  const renderTool = () => {
    switch (activeToolId) {
      case 'ai-website-generator':
        return <AiWebsiteGeneratorTool />;
      case 'image-editor':
        return <ImageEditorTool />;
      case 'image-compressor':
        return <ImageCompressorTool />;
      case 'image-converter':
        return <ImageConverterTool />;
      case 'image-resizer':
        return <ImageResizerTool />;
      case 'pdf-tools':
        return <PdfToolsTool />;
      case 'text-editor':
        return <TextEditorTool />;
      case 'password-generator':
        return <PasswordGeneratorTool />;
      case 'qr-generator':
        return <QrGeneratorTool />;
      case 'color-tools':
        return <ColorToolsTool />;
      case 'gradient-generator':
        return <GradientGeneratorTool />;
      case 'code-formatter':
        return <CodeFormatterTool />;
      case 'time-date':
      case 'time-date-tools':
        return <TimeDateTool />;
      case 'calculator-suite':
        return <CalculatorSuiteTool />;
      default:
        return (
          <main className="flex-1">
            <Hero />
            <RecentlyUsed />
            <ToolGrid />
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b132b] text-slate-900 dark:text-white transition-colors duration-200">
      <Header />
      <div className="flex-1">
        {renderTool()}
      </div>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
