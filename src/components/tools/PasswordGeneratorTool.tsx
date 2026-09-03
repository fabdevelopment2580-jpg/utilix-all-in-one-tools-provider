import React, { useState, useEffect, useCallback } from 'react';
import { KeyRound, Copy, RefreshCw, Check, ShieldCheck, History, Eye, EyeOff } from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { PrivacyNotice } from '../layout/PrivacyNotice';

export const PasswordGeneratorTool: React.FC = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);

  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [history, setHistory] = useState<string[]>([]);

  const generatePassword = useCallback(() => {
    let uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lowers = 'abcdefghijklmnopqrstuvwxyz';
    let numbers = '0123456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeAmbiguous) {
      uppers = uppers.replace(/[IO]/g, '');
      lowers = lowers.replace(/[l]/g, '');
      numbers = numbers.replace(/[01]/g, '');
      symbols = symbols.replace(/[\{\}\[\]\(\)\/\'\"\`\~\,\;\.\<\>]/g, '');
    }

    let charSet = '';
    if (includeUpper) charSet += uppers;
    if (includeLower) charSet += lowers;
    if (includeNumbers) charSet += numbers;
    if (includeSymbols) charSet += symbols;

    if (!charSet) {
      setPassword('Please select at least one character type');
      return;
    }

    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);

    let result = '';
    for (let i = 0; i < length; i++) {
      result += charSet[randomValues[i] % charSet.length];
    }

    setPassword(result);
    setHistory(prev => [result, ...prev.filter(p => p !== result)].slice(0, 5));
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const calculateStrength = () => {
    if (!password || password.startsWith('Please')) return { label: 'None', score: 0, color: 'bg-slate-300' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { label: 'Weak', score: 25, color: 'bg-red-500' };
    if (score <= 4) return { label: 'Fair', score: 50, color: 'bg-amber-500' };
    if (score <= 5) return { label: 'Good', score: 75, color: 'bg-blue-500' };
    return { label: 'Very Strong', score: 100, color: 'bg-emerald-500' };
  };

  const strength = calculateStrength();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (type: 'pin' | 'memorable' | 'complex' | 'high') => {
    if (type === 'pin') {
      setLength(6);
      setIncludeUpper(false);
      setIncludeLower(false);
      setIncludeNumbers(true);
      setIncludeSymbols(false);
    } else if (type === 'memorable') {
      setLength(18);
      setIncludeUpper(true);
      setIncludeLower(true);
      setIncludeNumbers(true);
      setIncludeSymbols(false);
    } else if (type === 'complex') {
      setLength(16);
      setIncludeUpper(true);
      setIncludeLower(true);
      setIncludeNumbers(true);
      setIncludeSymbols(true);
    } else if (type === 'high') {
      setLength(32);
      setIncludeUpper(true);
      setIncludeLower(true);
      setIncludeNumbers(true);
      setIncludeSymbols(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs categoryName="Utilities" toolName="Password Generator" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Password Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate strong, cryptographically secure passwords locally using browser Web Crypto APIs.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Main Generated Password Display Box */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4">
          <div className="relative flex items-center bg-slate-100 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
            <span className="font-mono text-lg sm:text-2xl font-bold tracking-wider text-slate-900 dark:text-white truncate flex-1 pr-12">
              {showPassword ? password : '••••••••••••••••'}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Toggle visibility"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>

              <button
                onClick={generatePassword}
                className="p-2.5 text-slate-400 hover:text-amber-500 transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleCopy(password)}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Strength Meter Bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Password Strength</span>
              <span className="text-amber-600 dark:text-amber-400 font-extrabold">{strength.label}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strength.color}`}
                style={{ width: `${strength.score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 shrink-0">Presets:</span>
          <button
            onClick={() => applyPreset('complex')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Complex (16 chars)
          </button>
          <button
            onClick={() => applyPreset('high')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            High Security (32 chars)
          </button>
          <button
            onClick={() => applyPreset('pin')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            PIN (6 numbers)
          </button>
        </div>

        {/* Configuration Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-5 text-xs">
          
          {/* Length Slider */}
          <div>
            <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 mb-2">
              <span>Password Length</span>
              <span className="text-amber-600 dark:text-amber-400 font-extrabold text-sm">{length} characters</span>
            </div>
            <input
              type="range"
              min="4"
              max="64"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 cursor-pointer">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Uppercase Letters (A-Z)</span>
              <input
                type="checkbox"
                checked={includeUpper}
                onChange={(e) => setIncludeUpper(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 cursor-pointer">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Lowercase Letters (a-z)</span>
              <input
                type="checkbox"
                checked={includeLower}
                onChange={(e) => setIncludeLower(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 cursor-pointer">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Numbers (0-9)</span>
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 cursor-pointer">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Symbols (!@#$%^&*)</span>
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span>Exclude ambiguous characters (1, l, I, 0, O)</span>
          </label>
        </div>

        {/* History */}
        {history.length > 1 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Recent Passwords
              </h3>
            </div>
            <div className="space-y-2">
              {history.slice(1).map((histPass, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs font-mono"
                >
                  <span className="truncate pr-4 text-slate-700 dark:text-slate-300">{histPass}</span>
                  <button
                    onClick={() => handleCopy(histPass)}
                    className="p-1.5 hover:text-amber-500 text-slate-400 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <PrivacyNotice />
    </div>
  );
};
