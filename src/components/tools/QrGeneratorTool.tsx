import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Link as LinkIcon, Mail, Phone, Wifi, FileText, Check } from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { PrivacyNotice } from '../layout/PrivacyNotice';

type QrType = 'url' | 'text' | 'email' | 'phone' | 'wifi';

export const QrGeneratorTool: React.FC = () => {
  const [qrType, setQrType] = useState<QrType>('url');

  // Input fields
  const [urlInput, setUrlInput] = useState('https://utilix.app');
  const [textInput, setTextInput] = useState('Hello World!');
  const [emailInput, setEmailInput] = useState('hello@example.com');
  const [emailSubject, setEmailSubject] = useState('Inquiry');
  const [phoneInput, setPhoneInput] = useState('+1234567890');
  const [wifiSsid, setWifiSsid] = useState('MyWifiNetwork');
  const [wifiPass, setWifiPass] = useState('SecretPass123');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

  // Customization
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(300);
  const [margin, setMargin] = useState(2);
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [svgString, setSvgString] = useState<string>('');

  // Generate QR payload
  const getPayload = () => {
    if (qrType === 'url') return urlInput;
    if (qrType === 'text') return textInput;
    if (qrType === 'email') return `mailto:${emailInput}?subject=${encodeURIComponent(emailSubject)}`;
    if (qrType === 'phone') return `tel:${phoneInput}`;
    if (qrType === 'wifi') return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPass};;`;
    return 'https://utilix.app';
  };

  useEffect(() => {
    const payload = getPayload();
    if (!payload) return;

    // Render to Canvas
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        payload,
        {
          width: size,
          margin: margin,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: errorCorrection,
        },
        (err) => {
          if (!err && canvasRef.current) {
            setDataUrl(canvasRef.current.toDataURL('image/png'));
          }
        }
      );
    }

    // Render to SVG
    QRCode.toString(
      payload,
      {
        type: 'svg',
        width: size,
        margin: margin,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorCorrection,
      },
      (err, string) => {
        if (!err && string) {
          setSvgString(string);
        }
      }
    );
  }, [qrType, urlInput, textInput, emailInput, emailSubject, phoneInput, wifiSsid, wifiPass, wifiEncryption, fgColor, bgColor, size, margin, errorCorrection]);

  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qrcode-${qrType}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode-${qrType}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs categoryName="Design" toolName="QR Code Generator" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            QR Code Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create customized, high-resolution QR codes for websites, Wi-Fi, emails, and phone numbers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* QR Content Type Tabs */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-5 gap-1 text-xs font-bold">
            {[
              { id: 'url', label: 'URL', icon: LinkIcon },
              { id: 'text', label: 'Text', icon: FileText },
              { id: 'email', label: 'Email', icon: Mail },
              { id: 'phone', label: 'Phone', icon: Phone },
              { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setQrType(tab.id as QrType)}
                  className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    qrType === tab.id
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Content Inputs */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-4 text-xs">
            {qrType === 'url' && (
              <div>
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 border border-transparent focus:border-amber-400 focus:outline-none"
                />
              </div>
            )}

            {qrType === 'text' && (
              <div>
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                  Plain Text Content
                </label>
                <textarea
                  rows={3}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter text..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 border border-transparent focus:border-amber-400 focus:outline-none"
                />
              </div>
            )}

            {qrType === 'email' && (
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 border border-transparent focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 border border-transparent focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {qrType === 'phone' && (
              <div>
                <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 border border-transparent focus:border-amber-400 focus:outline-none"
                />
              </div>
            )}

            {qrType === 'wifi' && (
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    Network Name (SSID)
                  </label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 border border-transparent focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 border border-transparent focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    Security Encryption
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['WPA', 'WEP', 'nopass'] as const).map(enc => (
                      <button
                        key={enc}
                        onClick={() => setWifiEncryption(enc)}
                        className={`py-2 rounded-xl font-bold uppercase ${
                          wifiEncryption === enc ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-700'
                        }`}
                      >
                        {enc === 'nopass' ? 'Open' : enc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Style Customization */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-4 text-xs">
            <span className="font-bold text-slate-900 dark:text-slate-100 block">
              Colors & Styling
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Foreground Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0"
                  />
                  <span className="font-mono text-slate-600 dark:text-slate-300">{fgColor}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0"
                  />
                  <span className="font-mono text-slate-600 dark:text-slate-300">{bgColor}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Size</span>
                  <span>{size}px</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="600"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Margin Border</span>
                  <span>{margin}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Live Preview Panel (1 Col) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 flex flex-col items-center justify-between text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Live QR Preview
          </span>

          <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-100 inline-block">
            <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg" />
          </div>

          <div className="w-full space-y-2">
            <button
              onClick={handleDownloadPng}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handleDownloadSvg}
              className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download SVG</span>
            </button>
          </div>
        </div>

      </div>

      <PrivacyNotice />
    </div>
  );
};
