import React, { useState } from 'react';
import { Calculator, Percent, Calendar, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { PrivacyNotice } from '../layout/PrivacyNotice';

type CalcType = 'standard' | 'scientific' | 'percentage' | 'age' | 'unit';

interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  factor: number; // Factor relative to base unit of category
}

const UNITS_DATABASE: Record<string, UnitDefinition[]> = {
  length: [
    { id: 'meter', name: 'Meter', symbol: 'm', factor: 1 },
    { id: 'kilometer', name: 'Kilometer', symbol: 'km', factor: 1000 },
    { id: 'centimeter', name: 'Centimeter', symbol: 'cm', factor: 0.01 },
    { id: 'millimeter', name: 'Millimeter', symbol: 'mm', factor: 0.001 },
    { id: 'mile', name: 'Mile', symbol: 'mi', factor: 1609.344 },
    { id: 'yard', name: 'Yard', symbol: 'yd', factor: 0.9144 },
    { id: 'foot', name: 'Foot', symbol: 'ft', factor: 0.3048 },
    { id: 'inch', name: 'Inch', symbol: 'in', factor: 0.0254 },
  ],
  weight: [
    { id: 'kilogram', name: 'Kilogram', symbol: 'kg', factor: 1 },
    { id: 'gram', name: 'Gram', symbol: 'g', factor: 0.001 },
    { id: 'milligram', name: 'Milligram', symbol: 'mg', factor: 0.000001 },
    { id: 'pound', name: 'Pound', symbol: 'lb', factor: 0.45359237 },
    { id: 'ounce', name: 'Ounce', symbol: 'oz', factor: 0.02834952 },
    { id: 'ton', name: 'Metric Ton', symbol: 't', factor: 1000 },
  ],
  temperature: [
    { id: 'celsius', name: 'Celsius', symbol: '°C', factor: 1 },
    { id: 'fahrenheit', name: 'Fahrenheit', symbol: '°F', factor: 1 },
    { id: 'kelvin', name: 'Kelvin', symbol: 'K', factor: 1 },
  ],
  storage: [
    { id: 'byte', name: 'Byte', symbol: 'B', factor: 1 },
    { id: 'kilobyte', name: 'Kilobyte', symbol: 'KB', factor: 1024 },
    { id: 'megabyte', name: 'Megabyte', symbol: 'MB', factor: 1024 * 1024 },
    { id: 'gigabyte', name: 'Gigabyte', symbol: 'GB', factor: 1024 * 1024 * 1024 },
    { id: 'terabyte', name: 'Terabyte', symbol: 'TB', factor: 1024 * 1024 * 1024 * 1024 },
  ],
  speed: [
    { id: 'mps', name: 'Meters per second', symbol: 'm/s', factor: 1 },
    { id: 'kmh', name: 'Kilometers per hour', symbol: 'km/h', factor: 0.277778 },
    { id: 'mph', name: 'Miles per hour', symbol: 'mph', factor: 0.44704 },
    { id: 'knot', name: 'Knot', symbol: 'kn', factor: 0.514444 },
  ],
  volume: [
    { id: 'liter', name: 'Liter', symbol: 'L', factor: 1 },
    { id: 'milliliter', name: 'Milliliter', symbol: 'mL', factor: 0.001 },
    { id: 'gallon', name: 'Gallon (US)', symbol: 'gal', factor: 3.78541 },
    { id: 'quart', name: 'Quart (US)', symbol: 'qt', factor: 0.946353 },
    { id: 'cup', name: 'Cup (US)', symbol: 'cup', factor: 0.236588 },
  ]
};

export const CalculatorSuiteTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalcType>('standard');

  // STANDARD & SCIENTIFIC CALCULATOR STATE
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState('');

  const handleCalcInput = (btn: string) => {
    if (btn === 'C') {
      setCalcDisplay('0');
      setCalcHistory('');
      return;
    }
    if (btn === 'DEL') {
      setCalcDisplay(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }
    if (btn === '=') {
      try {
        let expr = calcDisplay
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(');

        const result = Function(`'use strict'; return (${expr})`)();
        setCalcHistory(`${calcDisplay} =`);
        setCalcDisplay(String(result));
      } catch (err) {
        setCalcDisplay('Error');
      }
      return;
    }

    if (calcDisplay === '0' || calcDisplay === 'Error') {
      setCalcDisplay(btn);
    } else {
      setCalcDisplay(prev => prev + btn);
    }
  };

  // PERCENTAGE CALCULATOR STATE
  const [pctX, setPctX] = useState('15');
  const [pctY, setPctY] = useState('200');

  const pctResult1 = (!isNaN(Number(pctX)) && !isNaN(Number(pctY))) ? (Number(pctX) / 100) * Number(pctY) : 0;
  const pctResult2 = (!isNaN(Number(pctX)) && !isNaN(Number(pctY)) && Number(pctY) !== 0) ? (Number(pctX) / Number(pctY)) * 100 : 0;

  // AGE CALCULATOR STATE
  const [birthDate, setBirthDate] = useState('2000-01-01');

  const calculateAge = () => {
    const birth = new Date(birthDate);
    const today = new Date();
    if (isNaN(birth.getTime())) return null;

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const diffMs = today.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return { years, months, days, totalDays };
  };

  const ageRes = calculateAge();

  // UNIT CONVERTER STATE
  const [unitCategory, setUnitCategory] = useState<'length' | 'weight' | 'temperature' | 'storage' | 'speed' | 'volume'>('length');
  const [unitValue, setUnitValue] = useState('10');
  const [unitFromId, setUnitFromId] = useState('meter');
  const [unitToId, setUnitToId] = useState('foot');

  const unitsList = UNITS_DATABASE[unitCategory] || UNITS_DATABASE.length;
  const fromUnit = unitsList.find(u => u.id === unitFromId) || unitsList[0];
  const toUnit = unitsList.find(u => u.id === unitToId) || unitsList[1] || unitsList[0];

  const convertUnitValue = () => {
    const val = Number(unitValue);
    if (isNaN(val)) return 0;

    if (unitCategory === 'temperature') {
      if (unitFromId === 'celsius' && unitToId === 'fahrenheit') return (val * 9) / 5 + 32;
      if (unitFromId === 'fahrenheit' && unitToId === 'celsius') return ((val - 32) * 5) / 9;
      if (unitFromId === 'celsius' && unitToId === 'kelvin') return val + 273.15;
      if (unitFromId === 'kelvin' && unitToId === 'celsius') return val - 273.15;
      if (unitFromId === 'fahrenheit' && unitToId === 'kelvin') return ((val - 32) * 5) / 9 + 273.15;
      if (unitFromId === 'kelvin' && unitToId === 'fahrenheit') return ((val - 273.15) * 9) / 5 + 32;
      return val;
    }

    const baseVal = val * fromUnit.factor;
    return baseVal / toUnit.factor;
  };

  const handleSwapUnits = () => {
    const temp = unitFromId;
    setUnitFromId(unitToId);
    setUnitToId(temp);
  };

  const convertedValue = convertUnitValue();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs categoryName="Utilities" toolName="Calculator Suite" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Calculator & Unit Converter Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Standard & scientific calculators, percentage math, age calculator, and precise unit conversions.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'standard', label: 'Standard', icon: Calculator },
          { id: 'scientific', label: 'Scientific', icon: Calculator },
          { id: 'percentage', label: 'Percentage', icon: Percent },
          { id: 'age', label: 'Age Calculator', icon: Calendar },
          { id: 'unit', label: 'Unit Converter', icon: RefreshCw },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CalcType)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-slate-950 shadow-sm font-extrabold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* STANDARD & SCIENTIFIC CALCULATOR VIEW */}
      {(activeTab === 'standard' || activeTab === 'scientific') && (
        <div className="max-w-md mx-auto bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4">
          
          <div className="bg-slate-950 p-4 rounded-2xl text-right font-mono border border-slate-800 space-y-1">
            <span className="text-xs text-slate-500 block min-h-[16px]">{calcHistory}</span>
            <span className="text-3xl font-black text-amber-400 truncate block">{calcDisplay}</span>
          </div>

          <div className={`grid ${activeTab === 'scientific' ? 'grid-cols-5' : 'grid-cols-4'} gap-2 font-mono font-bold text-sm`}>
            {activeTab === 'scientific' && (
              <>
                <button onClick={() => handleCalcInput('sin(')} className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">sin</button>
                <button onClick={() => handleCalcInput('cos(')} className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">cos</button>
                <button onClick={() => handleCalcInput('tan(')} className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">tan</button>
                <button onClick={() => handleCalcInput('π')} className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">π</button>
                <button onClick={() => handleCalcInput('e')} className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">e</button>

                <button onClick={() => handleCalcInput('sqrt(')} className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">√</button>
                <button onClick={() => handleCalcInput('log(')} className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">log</button>
                <button onClick={() => handleCalcInput('ln(')} className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">ln</button>
                <button onClick={() => handleCalcInput('(')} className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">(</button>
                <button onClick={() => handleCalcInput(')')} className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">)</button>
              </>
            )}

            <button onClick={() => handleCalcInput('C')} className="p-3.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 cursor-pointer">C</button>
            <button onClick={() => handleCalcInput('DEL')} className="p-3.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">DEL</button>
            <button onClick={() => handleCalcInput('%')} className="p-3.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">%</button>
            <button onClick={() => handleCalcInput('÷')} className="p-3.5 rounded-xl bg-amber-400 text-slate-950 font-black cursor-pointer">÷</button>

            <button onClick={() => handleCalcInput('7')} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 cursor-pointer">7</button>
            <button onClick={() => handleCalcInput('8')} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 cursor-pointer">8</button>
            <button onClick={() => handleCalcInput('9')} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 cursor-pointer">9</button>
            <button onClick={() => handleCalcInput('×')} className="p-3.5 rounded-xl bg-amber-400 text-slate-950 font-black cursor-pointer">×</button>

            <button onClick={() => handleCalcInput('4')} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 cursor-pointer">4</button>
            <button onClick={() => handleCalcInput('5')} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 cursor-pointer">5</button>
            <button onClick={() => handleCalcInput('6')} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 cursor-pointer">6</button>
            <button onClick={() => handleCalcInput('-')} className="p-3.5 rounded-xl bg-amber-400 text-slate-950 font-black cursor-pointer">-</button>

            <button onClick={() => handleCalcInput('1')} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 cursor-pointer">1</button>
            <button onClick={() => handleCalcInput('2')} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 cursor-pointer">2</button>
            <button onClick={() => handleCalcInput('3')} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 cursor-pointer">3</button>
            <button onClick={() => handleCalcInput('+')} className="p-3.5 rounded-xl bg-amber-400 text-slate-950 font-black cursor-pointer">+</button>

            <button onClick={() => handleCalcInput('0')} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 col-span-2 cursor-pointer">0</button>
            <button onClick={() => handleCalcInput('.')} className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 cursor-pointer">.</button>
            <button onClick={() => handleCalcInput('=')} className="p-3.5 rounded-xl bg-amber-400 text-slate-950 font-black cursor-pointer">=</button>
          </div>
        </div>
      )}

      {/* PERCENTAGE CALCULATOR VIEW */}
      {activeTab === 'percentage' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">What is X% of Y?</h3>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="text-slate-500 font-semibold">What is</span>
              <input
                type="number"
                value={pctX}
                onChange={(e) => setPctX(e.target.value)}
                className="w-24 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-center font-bold text-slate-900 dark:text-white"
              />
              <span className="text-slate-500 font-semibold">% of</span>
              <input
                type="number"
                value={pctY}
                onChange={(e) => setPctY(e.target.value)}
                className="w-28 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-center font-bold text-slate-900 dark:text-white"
              />
              <span className="text-slate-500 font-semibold">=</span>
              <span className="text-xl font-black text-amber-500 font-mono">{pctResult1}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">X is what percent of Y?</h3>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="number"
                value={pctX}
                onChange={(e) => setPctX(e.target.value)}
                className="w-24 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-center font-bold text-slate-900 dark:text-white"
              />
              <span className="text-slate-500 font-semibold">is what % of</span>
              <input
                type="number"
                value={pctY}
                onChange={(e) => setPctY(e.target.value)}
                className="w-28 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-center font-bold text-slate-900 dark:text-white"
              />
              <span className="text-slate-500 font-semibold">=</span>
              <span className="text-xl font-black text-amber-500 font-mono">{pctResult2.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* AGE CALCULATOR VIEW */}
      {activeTab === 'age' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-6">
          <div className="text-xs">
            <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Select Date of Birth</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>

          {ageRes && (
            <div className="grid grid-cols-3 gap-3 p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Years</span>
                <span className="text-3xl font-black text-amber-500">{ageRes.years}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Months</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white">{ageRes.months}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Days</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white">{ageRes.days}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* UNIT CONVERTER VIEW (ENHANCED WITH EXPLICIT UNITS) */}
      {activeTab === 'unit' && (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-6 text-xs">
          
          {/* Category Selector */}
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 block mb-2">
              Select Measurement Category
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['length', 'weight', 'temperature', 'storage', 'speed', 'volume'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setUnitCategory(cat);
                    const newUnits = UNITS_DATABASE[cat];
                    setUnitFromId(newUnits[0].id);
                    setUnitToId(newUnits[1]?.id || newUnits[0].id);
                  }}
                  className={`py-2 rounded-xl capitalize font-bold cursor-pointer ${
                    unitCategory === cat ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Source & Target Unit Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
            
            {/* Convert From */}
            <div className="sm:col-span-5 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="text-slate-500 font-bold block">Convert From</label>
              
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={unitValue}
                  onChange={(e) => setUnitValue(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 font-mono font-bold text-base text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                />
                <span className="font-bold text-amber-500 font-mono text-sm px-1 shrink-0">
                  {fromUnit.symbol}
                </span>
              </div>

              <select
                value={unitFromId}
                onChange={(e) => setUnitFromId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                {unitsList.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="sm:col-span-1 flex items-center justify-center">
              <button
                onClick={handleSwapUnits}
                className="p-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow-sm transition-transform hover:scale-110 cursor-pointer"
                title="Swap Units"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Convert To */}
            <div className="sm:col-span-5 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="text-slate-500 font-bold block">Convert To</label>
              
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="font-mono font-black text-base text-amber-500 truncate">
                  {isNaN(convertedValue) ? '0' : convertedValue.toFixed(4)}
                </span>
                <span className="font-bold text-amber-500 font-mono text-sm px-1 shrink-0">
                  {toUnit.symbol}
                </span>
              </div>

              <select
                value={unitToId}
                onChange={(e) => setUnitToId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                {unitsList.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Formatted Output Result Box */}
          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-center space-y-1">
            <span className="text-[10px] uppercase font-extrabold text-amber-600 dark:text-amber-400 block tracking-wider">
              Exact Converted Result
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">
              {unitValue} {fromUnit.name} ({fromUnit.symbol}) ={' '}
              <span className="text-amber-500">{isNaN(convertedValue) ? '0' : convertedValue.toFixed(6)}</span>{' '}
              {toUnit.name} ({toUnit.symbol})
            </div>
          </div>

        </div>
      )}

      <PrivacyNotice />
    </div>
  );
};
