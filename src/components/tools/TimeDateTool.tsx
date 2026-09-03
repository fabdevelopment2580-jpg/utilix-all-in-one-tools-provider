import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Timer, 
  Globe, 
  Hash, 
  Play, 
  Pause, 
  RotateCcw, 
  Flag, 
  ArrowRight,
  Bell,
  Search,
  X
} from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { PrivacyNotice } from '../layout/PrivacyNotice';

interface CapitalTimezone {
  capital: string;
  country: string;
  zone: string;
}

const WORLD_CAPITALS: CapitalTimezone[] = [
  { capital: 'Tokyo', country: 'Japan', zone: 'Asia/Tokyo' },
  { capital: 'Washington, D.C.', country: 'United States', zone: 'America/New_York' },
  { capital: 'London', country: 'United Kingdom', zone: 'Europe/London' },
  { capital: 'Paris', country: 'France', zone: 'Europe/Paris' },
  { capital: 'Berlin', country: 'Germany', zone: 'Europe/Berlin' },
  { capital: 'Rome', country: 'Italy', zone: 'Europe/Rome' },
  { capital: 'Madrid', country: 'Spain', zone: 'Europe/Madrid' },
  { capital: 'Ottawa', country: 'Canada', zone: 'America/Toronto' },
  { capital: 'Canberra', country: 'Australia', zone: 'Australia/Sydney' },
  { capital: 'Wellington', country: 'New Zealand', zone: 'Pacific/Auckland' },
  { capital: 'Beijing', country: 'China', zone: 'Asia/Shanghai' },
  { capital: 'New Delhi', country: 'India', zone: 'Asia/Kolkata' },
  { capital: 'Brasília', country: 'Brazil', zone: 'America/Sao_Paulo' },
  { capital: 'Buenos Aires', country: 'Argentina', zone: 'America/Argentina/Buenos_Aires' },
  { capital: 'Santiago', country: 'Chile', zone: 'America/Santiago' },
  { capital: 'Cairo', country: 'Egypt', zone: 'Africa/Cairo' },
  { capital: 'Riyadh', country: 'Saudi Arabia', zone: 'Asia/Riyadh' },
  { capital: 'Abu Dhabi', country: 'United Arab Emirates', zone: 'Asia/Dubai' },
  { capital: 'Bangkok', country: 'Thailand', zone: 'Asia/Bangkok' },
  { capital: 'Seoul', country: 'South Korea', zone: 'Asia/Seoul' },
  { capital: 'Jakarta', country: 'Indonesia', zone: 'Asia/Jakarta' },
  { capital: 'Manila', country: 'Philippines', zone: 'Asia/Manila' },
  { capital: 'Kuala Lumpur', country: 'Malaysia', zone: 'Asia/Kuala_Lumpur' },
  { capital: 'Singapore', country: 'Singapore', zone: 'Asia/Singapore' },
  { capital: 'Hanoi', country: 'Vietnam', zone: 'Asia/Ho_Chi_Minh' },
  { capital: 'Ankara', country: 'Turkey', zone: 'Europe/Istanbul' },
  { capital: 'Moscow', country: 'Russia', zone: 'Europe/Moscow' },
  { capital: 'Kyiv', country: 'Ukraine', zone: 'Europe/Kyiv' },
  { capital: 'Warsaw', country: 'Poland', zone: 'Europe/Warsaw' },
  { capital: 'Amsterdam', country: 'Netherlands', zone: 'Europe/Amsterdam' },
  { capital: 'Brussels', country: 'Belgium', zone: 'Europe/Brussels' },
  { capital: 'Vienna', country: 'Austria', zone: 'Europe/Vienna' },
  { capital: 'Bern', country: 'Switzerland', zone: 'Europe/Zurich' },
  { capital: 'Stockholm', country: 'Sweden', zone: 'Europe/Stockholm' },
  { capital: 'Oslo', country: 'Norway', zone: 'Europe/Oslo' },
  { capital: 'Helsinki', country: 'Finland', zone: 'Europe/Helsinki' },
  { capital: 'Copenhagen', country: 'Denmark', zone: 'Europe/Copenhagen' },
  { capital: 'Dublin', country: 'Ireland', zone: 'Europe/Dublin' },
  { capital: 'Lisbon', country: 'Portugal', zone: 'Europe/Lisbon' },
  { capital: 'Athens', country: 'Greece', zone: 'Europe/Athens' },
  { capital: 'Budapest', country: 'Hungary', zone: 'Europe/Budapest' },
  { capital: 'Prague', country: 'Czech Republic', zone: 'Europe/Prague' },
  { capital: 'Bucharest', country: 'Romania', zone: 'Europe/Bucharest' },
  { capital: 'Sofia', country: 'Bulgaria', zone: 'Europe/Sofia' },
  { capital: 'Zagreb', country: 'Croatia', zone: 'Europe/Zagreb' },
  { capital: 'Bratislava', country: 'Slovakia', zone: 'Europe/Bratislava' },
  { capital: 'Ljubljana', country: 'Slovenia', zone: 'Europe/Ljubljana' },
  { capital: 'Belgrade', country: 'Serbia', zone: 'Europe/Belgrade' },
  { capital: 'Reykjavik', country: 'Iceland', zone: 'Atlantic/Reykjavik' },
  { capital: 'Pretoria', country: 'South Africa', zone: 'Africa/Johannesburg' },
  { capital: 'Nairobi', country: 'Kenya', zone: 'Africa/Nairobi' },
  { capital: 'Abuja', country: 'Nigeria', zone: 'Africa/Lagos' },
  { capital: 'Accra', country: 'Ghana', zone: 'Africa/Accra' },
  { capital: 'Dakar', country: 'Senegal', zone: 'Africa/Dakar' },
  { capital: 'Addis Ababa', country: 'Ethiopia', zone: 'Africa/Addis_Ababa' },
  { capital: 'Tunis', country: 'Tunisia', zone: 'Africa/Tunis' },
  { capital: 'Algiers', country: 'Algeria', zone: 'Africa/Algiers' },
  { capital: 'Rabat', country: 'Morocco', zone: 'Africa/Casablanca' },
  { capital: 'Harare', country: 'Zimbabwe', zone: 'Africa/Harare' },
  { capital: 'Lusaka', country: 'Zambia', zone: 'Africa/Lusaka' },
  { capital: 'Dodoma', country: 'Tanzania', zone: 'Africa/Dar_es_Salaam' },
  { capital: 'Kampala', country: 'Uganda', zone: 'Africa/Kampala' },
  { capital: 'Kigali', country: 'Rwanda', zone: 'Africa/Kigali' },
  { capital: 'Antananarivo', country: 'Madagascar', zone: 'Indian/Antananarivo' },
  { capital: 'Mexico City', country: 'Mexico', zone: 'America/Mexico_City' },
  { capital: 'Bogotá', country: 'Colombia', zone: 'America/Bogota' },
  { capital: 'Lima', country: 'Peru', zone: 'America/Lima' },
  { capital: 'Quito', country: 'Ecuador', zone: 'America/Guayaquil' },
  { capital: 'Caracas', country: 'Venezuela', zone: 'America/Caracas' },
  { capital: 'Montevideo', country: 'Uruguay', zone: 'America/Montevideo' },
  { capital: 'Asunción', country: 'Paraguay', zone: 'America/Asuncion' },
  { capital: 'La Paz', country: 'Bolivia', zone: 'America/La_Paz' },
  { capital: 'San José', country: 'Costa Rica', zone: 'America/Costa_Rica' },
  { capital: 'Panama City', country: 'Panama', zone: 'America/Panama' },
  { capital: 'Havana', country: 'Cuba', zone: 'America/Havana' },
  { capital: 'Kingston', country: 'Jamaica', zone: 'America/Jamaica' },
  { capital: 'Santo Domingo', country: 'Dominican Republic', zone: 'America/Santo_Domingo' },
  { capital: 'San Salvador', country: 'El Salvador', zone: 'America/El_Salvador' },
  { capital: 'Guatemala City', country: 'Guatemala', zone: 'America/Guatemala' },
  { capital: 'Tegucigalpa', country: 'Honduras', zone: 'America/Tegucigalpa' },
  { capital: 'Managua', country: 'Nicaragua', zone: 'America/Managua' },
  { capital: 'Tashkent', country: 'Uzbekistan', zone: 'Asia/Tashkent' },
  { capital: 'Astana', country: 'Kazakhstan', zone: 'Asia/Almaty' },
  { capital: 'Bishkek', country: 'Kyrgyzstan', zone: 'Asia/Bishkek' },
  { capital: 'Dushanbe', country: 'Tajikistan', zone: 'Asia/Dushanbe' },
  { capital: 'Ashgabat', country: 'Turkmenistan', zone: 'Asia/Ashgabat' },
  { capital: 'Tbilisi', country: 'Georgia', zone: 'Asia/Tbilisi' },
  { capital: 'Yerevan', country: 'Armenia', zone: 'Asia/Yerevan' },
  { capital: 'Baku', country: 'Azerbaijan', zone: 'Asia/Baku' },
  { capital: 'Baghdad', country: 'Iraq', zone: 'Asia/Baghdad' },
  { capital: 'Damascus', country: 'Syria', zone: 'Asia/Damascus' },
  { capital: 'Beirut', country: 'Lebanon', zone: 'Asia/Beirut' },
  { capital: 'Amman', country: 'Jordan', zone: 'Asia/Amman' },
  { capital: 'Jerusalem', country: 'Israel', zone: 'Asia/Jerusalem' },
  { capital: 'Muscat', country: 'Oman', zone: 'Asia/Muscat' },
  { capital: 'Doha', country: 'Qatar', zone: 'Asia/Doha' },
  { capital: 'Manama', country: 'Bahrain', zone: 'Asia/Bahrain' },
  { capital: 'Kuwait City', country: 'Kuwait', zone: 'Asia/Kuwait' },
  { capital: 'Tehran', country: 'Iran', zone: 'Asia/Tehran' },
  { capital: 'Kabul', country: 'Afghanistan', zone: 'Asia/Kabul' },
  { capital: 'Islamabad', country: 'Pakistan', zone: 'Asia/Karachi' },
  { capital: 'Dhaka', country: 'Bangladesh', zone: 'Asia/Dhaka' },
  { capital: 'Kathmandu', country: 'Nepal', zone: 'Asia/Kathmandu' },
  { capital: 'Colombo', country: 'Sri Lanka', zone: 'Asia/Colombo' },
  { capital: 'Malé', country: 'Maldives', zone: 'Indian/Maldives' },
  { capital: 'Ulaanbaatar', country: 'Mongolia', zone: 'Asia/Ulaanbaatar' },
  { capital: 'Suva', country: 'Fiji', zone: 'Pacific/Fiji' },
  { capital: 'Port Moresby', country: 'Papua New Guinea', zone: 'Pacific/Port_Moresby' },
];

export const TimeDateTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stopwatch' | 'timer' | 'datediff' | 'world' | 'unix'>('dashboard');
  const [worldSearch, setWorldSearch] = useState('');

  // Live Clock State
  const [now, setNow] = useState(new Date());
  const [use24Hour, setUse24Hour] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // STOPWATCH STATE
  const [swTime, setSwTime] = useState(0); // in ms
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (swRunning) {
      interval = setInterval(() => {
        setSwTime(prev => prev + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [swRunning]);

  const formatStopwatch = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
  };

  // COUNTDOWN TIMER STATE
  const [timerInputH, setTimerInputH] = useState(0);
  const [timerInputM, setTimerInputM] = useState(5);
  const [timerInputS, setTimerInputS] = useState(0);
  const [timerRemaining, setTimerRemaining] = useState(300); // seconds
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining(prev => prev - 1);
      }, 1000);
    } else if (timerRemaining === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerRemaining]);

  const startCountdown = () => {
    const totalSecs = timerInputH * 3600 + timerInputM * 60 + timerInputS;
    if (totalSecs > 0) {
      setTimerRemaining(totalSecs);
      setTimerRunning(true);
    }
  };

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // DATE DIFFERENCE CALCULATOR STATE
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const calculateDateDiff = () => {
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;
    const hours = totalDays * 24;

    return { totalDays, weeks, remainingDays, hours };
  };

  const dateDiffRes = calculateDateDiff();

  // UNIX TIMESTAMP CONVERTER STATE
  const [unixInput, setUnixInput] = useState(Math.floor(Date.now() / 1000).toString());
  const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 16));

  const parsedUnixDate = !isNaN(Number(unixInput)) ? new Date(Number(unixInput) * 1000) : null;
  const convertedUnixTs = !isNaN(new Date(dateInput).getTime()) ? Math.floor(new Date(dateInput).getTime() / 1000) : 0;

  // Day of year calculation
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs categoryName="Utilities" toolName="Time & Date Dashboard" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Time & Date Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live clocks, stopwatch, countdown timer, date difference, world time, and unix timestamp converter.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'dashboard', label: 'Clock Dashboard', icon: Clock },
          { id: 'stopwatch', label: 'Stopwatch', icon: Timer },
          { id: 'timer', label: 'Countdown Timer', icon: Bell },
          { id: 'datediff', label: 'Date Difference', icon: Calendar },
          { id: 'world', label: 'World Clock', icon: Globe },
          { id: 'unix', label: 'Unix Timestamp', icon: Hash },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

      {/* DASHBOARD VIEW */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Digital Clock Card */}
          <div className="md:col-span-2 bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-6">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Live Digital Clock</span>
              </span>
              <button
                onClick={() => setUse24Hour(!use24Hour)}
                className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {use24Hour ? '24-Hour Format' : '12-Hour Format'}
              </button>
            </div>

            <div className="my-8 text-center">
              <div className="text-5xl sm:text-7xl font-black text-amber-400 font-mono tracking-tight drop-shadow-md">
                {now.toLocaleTimeString('en-US', { hour12: !use24Hour })}
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-300 mt-4">
                {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono text-slate-400">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Timezone</span>
                <span className="font-bold text-white">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Day of Year</span>
                <span className="font-bold text-white">Day {dayOfYear} / 365</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">UTC Offset</span>
                <span className="font-bold text-white">UTC {now.getTimezoneOffset() <= 0 ? '+' : '-'}{Math.abs(now.getTimezoneOffset() / 60)}h</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Info */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Current Unix Timestamp
              </span>
              <div className="text-2xl font-black text-amber-500 font-mono">
                {Math.floor(now.getTime() / 1000)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seconds elapsed since Jan 1, 1970 00:00:00 UTC.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                ISO 8601 Format
              </span>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono truncate">
                {now.toISOString()}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* STOPWATCH VIEW */}
      {activeTab === 'stopwatch' && (
        <div className="max-w-md mx-auto bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
            Precision Stopwatch
          </div>

          <div className="text-6xl font-black text-amber-400 font-mono tracking-tight my-4">
            {formatStopwatch(swTime)}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setSwRunning(!swRunning)}
              className={`px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-transform hover:scale-105 ${
                swRunning ? 'bg-amber-500 text-slate-950' : 'bg-amber-400 text-slate-950'
              }`}
            >
              {swRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{swRunning ? 'Pause' : 'Start'}</span>
            </button>

            {swRunning && (
              <button
                onClick={() => setLaps(prev => [swTime, ...prev])}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Flag className="w-4 h-4 text-amber-400" />
                <span>Lap</span>
              </button>
            )}

            <button
              onClick={() => {
                setSwRunning(false);
                setSwTime(0);
                setLaps([]);
              }}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          {laps.length > 0 && (
            <div className="pt-4 border-t border-slate-800 max-h-48 overflow-y-auto space-y-2 text-xs font-mono">
              {laps.map((lap, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
                  <span className="text-slate-500 font-bold">Lap {laps.length - i}</span>
                  <span className="text-amber-400 font-bold">{formatStopwatch(lap)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COUNTDOWN TIMER VIEW */}
      {activeTab === 'timer' && (
        <div className="max-w-md mx-auto bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
            Countdown Timer
          </div>

          <div className="text-6xl font-black text-amber-400 font-mono tracking-tight my-4">
            {formatTimer(timerRemaining)}
          </div>

          {!timerRunning ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={timerInputH}
                    onChange={(e) => setTimerInputH(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-800 text-white font-mono text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timerInputM}
                    onChange={(e) => setTimerInputM(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-800 text-white font-mono text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Seconds</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timerInputS}
                    onChange={(e) => setTimerInputS(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-800 text-white font-mono text-center font-bold"
                  />
                </div>
              </div>

              <button
                onClick={startCountdown}
                className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Timer</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setTimerRunning(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-800 text-white font-bold text-xs cursor-pointer hover:bg-slate-700"
              >
                Pause
              </button>
              <button
                onClick={() => {
                  setTimerRunning(false);
                  setTimerRemaining(0);
                }}
                className="flex-1 py-3 rounded-2xl bg-red-500/20 text-red-400 font-bold text-xs cursor-pointer hover:bg-red-500/30"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      )}

      {/* DATE DIFFERENCE VIEW */}
      {activeTab === 'datediff' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          {dateDiffRes && (
            <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl space-y-4 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Duration Result</span>
              <div className="text-3xl font-black text-amber-500 font-mono">
                {dateDiffRes.totalDays} Total Days
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300 font-mono">
                Equivalent to {dateDiffRes.weeks} weeks and {dateDiffRes.remainingDays} days ({dateDiffRes.hours.toLocaleString()} hours)
              </div>
            </div>
          )}
        </div>
      )}

      {/* WORLD CLOCK VIEW */}
      {activeTab === 'world' && (() => {
        const query = worldSearch.toLowerCase().trim();
        const filteredCapitals = WORLD_CAPITALS.filter(
          item => item.capital.toLowerCase().includes(query) || item.country.toLowerCase().includes(query)
        );

        return (
          <div className="space-y-6">
            {/* Top Search Bar */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={worldSearch}
                  onChange={(e) => setWorldSearch(e.target.value)}
                  placeholder="Search capital city or country name..."
                  className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                />
                {worldSearch && (
                  <button
                    onClick={() => setWorldSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                Showing <strong className="text-amber-500 font-extrabold">{filteredCapitals.length}</strong> of {WORLD_CAPITALS.length} world capitals
              </div>
            </div>

            {/* Capitals Grid */}
            {filteredCapitals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCapitals.map(item => {
                  let cityTime = '--:--';
                  let cityDate = '';
                  try {
                    cityTime = new Date().toLocaleTimeString('en-US', {
                      timeZone: item.zone,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: !use24Hour
                    });
                    cityDate = new Date().toLocaleDateString('en-US', {
                      timeZone: item.zone,
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    });
                  } catch (err) {
                    cityTime = new Date().toLocaleTimeString('en-US', { hour12: !use24Hour });
                    cityDate = new Date().toLocaleDateString('en-US');
                  }

                  return (
                    <div
                      key={`${item.capital}-${item.country}`}
                      className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/60 hover:border-amber-400/50 transition-all shadow-xs flex flex-col justify-between gap-3"
                    >
                      <div>
                        <span className="font-extrabold text-base text-slate-900 dark:text-white block truncate">
                          {item.capital}
                        </span>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block truncate mt-0.5">
                          {item.country}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-baseline justify-between">
                        <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                          {cityTime}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {cityDate}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  No world capital or country found matching "{worldSearch}"
                </p>
                <button
                  onClick={() => setWorldSearch('')}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Clear Search Filter
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* UNIX TIMESTAMP CONVERTER VIEW */}
      {activeTab === 'unix' && (
        <div className="max-w-2xl mx-auto space-y-6 text-xs">
          {/* Unix to Human */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Unix Timestamp to Human Date</h3>
            <input
              type="text"
              value={unixInput}
              onChange={(e) => setUnixInput(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-700 font-mono font-bold text-slate-900 dark:text-white"
            />
            {parsedUnixDate && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl font-mono text-slate-800 dark:text-slate-200 font-bold space-y-1">
                <div>UTC: {parsedUnixDate.toUTCString()}</div>
                <div className="text-amber-500">Local: {parsedUnixDate.toString()}</div>
              </div>
            )}
          </div>

          {/* Date to Unix */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Human Date to Unix Timestamp</h3>
            <input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-700 font-mono font-bold text-slate-900 dark:text-white"
            />
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl font-mono text-amber-500 font-black text-lg">
              {convertedUnixTs} seconds
            </div>
          </div>
        </div>
      )}

      <PrivacyNotice />
    </div>
  );
};
