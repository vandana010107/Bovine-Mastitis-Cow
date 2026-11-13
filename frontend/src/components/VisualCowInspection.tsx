import React, { useState } from 'react';
import {
  Thermometer,
  CloudSun,
  Activity,
  Milk,
  Info,
  Sparkles
} from 'lucide-react';

interface VisualCowInspectionProps {
  udderTemp1: number | null;
  udderTemp2: number | null;
  ambientTemp: number | null;
  humidity: number | null;
  activity: number | null;
  tdsPpm: number | null;
  isDemoMode?: boolean;
  onSimulateCondition?: (type: 'healthy' | 'mild' | 'mastitis' | 'heat_stress') => void;
}

export const VisualCowInspection: React.FC<VisualCowInspectionProps> = ({
  udderTemp1,
  udderTemp2,
  ambientTemp,
  humidity,
  activity,
  tdsPpm,
  isDemoMode = false,
  onSimulateCondition
}) => {
  const [selectedSensor, setSelectedSensor] = useState<
    'udder' | 'milk' | 'motion' | 'climate' | null
  >('udder');

  // Compute status for each sensor
  const avgUdderTemp =
    udderTemp1 !== null && udderTemp2 !== null
      ? (udderTemp1 + udderTemp2) / 2
      : udderTemp1 !== null
      ? udderTemp1
      : udderTemp2 !== null
      ? udderTemp2
      : null;

  const isTempMild = avgUdderTemp !== null && avgUdderTemp > 39.2 && avgUdderTemp <= 39.4;
  const isTempHigh = avgUdderTemp !== null && avgUdderTemp > 39.4;

  const isTdsNormal = tdsPpm !== null ? tdsPpm <= 500 : true;

  return (
    <div className="clean-card p-6 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Interactive 2D Cow & Sensor Inspection Layout
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 uppercase">
              Visual Map
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any sensor marker on the cow diagram below to learn what it measures and view its live reading.
          </p>
        </div>

        {/* Demo Mode Quick Simulation Pills */}
        {isDemoMode && onSimulateCondition && (
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-[11px] font-bold text-slate-500 px-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Demo:
            </span>
            <button
              onClick={() => onSimulateCondition('healthy')}
              className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold transition-all cursor-pointer"
            >
              🟢 Healthy Cow
            </button>
            <button
              onClick={() => onSimulateCondition('mild')}
              className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-bold transition-all cursor-pointer"
            >
              🟡 Mild Fever
            </button>
            <button
              onClick={() => onSimulateCondition('mastitis')}
              className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-[11px] font-bold transition-all cursor-pointer"
            >
              🔴 Mastitis Alert
            </button>
          </div>
        )}
      </div>

      {/* Main Visual Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Cow Graphic & Interactive Sensor Hotspots (Left 7 Cols) */}
        <div className="lg:col-span-7 relative bg-gradient-to-b from-slate-50 to-slate-100/80 rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center min-h-[340px]">
          
          {/* Barn Ceiling Climate Sensor Indicator */}
          <div
            onClick={() => setSelectedSensor('climate')}
            className={`absolute top-3 right-4 px-3 py-1.5 rounded-xl border cursor-pointer transition-all shadow-xs flex items-center gap-2 ${
              selectedSensor === 'climate'
                ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
            }`}
          >
            <CloudSun className="w-4 h-4 text-amber-500" />
            <div className="text-left">
              <span className="block text-[10px] font-semibold text-slate-400 uppercase leading-none">Barn Weather</span>
              <span className="text-xs font-bold leading-tight">
                {ambientTemp !== null ? `${ambientTemp.toFixed(1)}°C` : '--'} • {humidity !== null ? `${humidity.toFixed(0)}%` : '--'}
              </span>
            </div>
          </div>

          {/* Cow SVG Diagram with Color Zones */}
          <div className="relative w-full max-w-[420px] aspect-[16/11] flex items-center justify-center my-2">
            <svg
              viewBox="0 0 500 350"
              className="w-full h-full drop-shadow-sm transition-all"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background Ground Grass subtle */}
              <ellipse cx="250" cy="315" rx="200" ry="20" fill="#e2e8f0" />

              {/* Cow Silhouette Graphic */}
              <g id="cow-body" className="transition-all duration-300">
                {/* Back Legs */}
                <path d="M125 210 L120 300 L140 300 L145 220 Z" fill="#94a3b8" />
                <path d="M345 210 L340 300 L360 300 L365 220 Z" fill="#94a3b8" />

                {/* Main Body */}
                <path
                  d="M130 140 C140 120, 200 115, 300 125 C340 128, 380 135, 400 160 C420 185, 410 220, 390 230 C370 240, 350 245, 330 245 C280 250, 210 250, 160 245 C130 240, 115 200, 120 170 C125 150, 125 145, 130 140 Z"
                  fill="#ffffff"
                  stroke="#475569"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />

                {/* Natural Cow Spots */}
                <path d="M180 140 C195 135, 230 140, 225 170 C220 195, 175 190, 170 170 C165 155, 170 145, 180 140 Z" fill="#334155" />
                <path d="M290 150 C310 145, 335 160, 330 180 C325 200, 290 195, 280 180 C275 165, 280 155, 290 150 Z" fill="#334155" />

                {/* Fore Legs */}
                <path d="M160 230 L155 305 L175 305 L180 235 Z" fill="#64748b" />
                <path d="M315 235 L310 305 L330 305 L335 235 Z" fill="#64748b" />

                {/* Cow Udder Area Highlight */}
                <path
                  d="M205 240 C205 265, 255 265, 255 240 Z"
                  fill={isTempHigh ? '#fecaca' : isTempMild ? '#fef3c7' : '#fce7f3'}
                  stroke={isTempHigh ? '#ef4444' : isTempMild ? '#f59e0b' : '#ec4899'}
                  strokeWidth="3"
                  className="transition-colors duration-300"
                />
                {/* Teats */}
                <line x1="218" y1="262" x2="218" y2="276" stroke="#db2777" strokeWidth="4" strokeLinecap="round" />
                <line x1="242" y1="262" x2="242" y2="276" stroke="#db2777" strokeWidth="4" strokeLinecap="round" />

                {/* Cow Head and Neck */}
                <path
                  d="M380 150 C400 130, 430 120, 445 135 C460 150, 465 180, 445 195 C430 205, 400 200, 385 180 Z"
                  fill="#ffffff"
                  stroke="#475569"
                  strokeWidth="4"
                />
                {/* Cow Ear */}
                <path d="M415 130 C410 115, 435 115, 430 130 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
                {/* Cow Eye */}
                <circle cx="432" cy="148" r="4" fill="#0f172a" />
                {/* Cow Muzzle */}
                <ellipse cx="448" cy="178" rx="14" ry="10" fill="#fbcfe8" stroke="#475569" strokeWidth="3" />
                {/* Cow Collar */}
                <path d="M390 160 L410 185" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
              </g>

              {/* Collar Bell / Motion Sensor Indicator */}
              <circle cx="400" cy="188" r="9" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* INTERACTIVE HOTSPOT 1: Udder Temperature Sensor (Dual DS18B20) */}
            <button
              onClick={() => setSelectedSensor('udder')}
              className={`absolute bottom-[28%] left-[45%] -translate-x-1/2 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105 cursor-pointer ${
                selectedSensor === 'udder'
                  ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-300'
                  : isTempHigh
                  ? 'bg-red-50 text-red-700 border-red-300 animate-bounce'
                  : isTempMild
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-white text-slate-800 border-rose-200'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              <span>Udder: {avgUdderTemp !== null ? `${avgUdderTemp.toFixed(1)}°C` : '--'}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  avgUdderTemp === null
                    ? 'bg-slate-300'
                    : isTempHigh
                    ? 'bg-red-500'
                    : isTempMild
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
            </button>

            {/* INTERACTIVE HOTSPOT 2: Motion Collar (MPU6050) */}
            <button
              onClick={() => setSelectedSensor('motion')}
              className={`absolute top-[42%] right-[14%] px-2.5 py-1 rounded-xl text-xs font-bold border shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105 cursor-pointer ${
                selectedSensor === 'motion'
                  ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300'
                  : 'bg-white text-slate-800 border-blue-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span>Collar: {activity !== null ? `${activity.toFixed(2)}g` : '--'}</span>
              <span className={`w-2 h-2 rounded-full ${activity !== null ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            </button>

            {/* INTERACTIVE HOTSPOT 3: Milk Quality Sensor (TDS Probe) */}
            <button
              onClick={() => setSelectedSensor('milk')}
              className={`absolute bottom-[8%] left-[24%] px-2.5 py-1 rounded-xl text-xs font-bold border shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105 cursor-pointer ${
                selectedSensor === 'milk'
                  ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-300'
                  : isTdsNormal
                  ? 'bg-white text-slate-800 border-amber-200'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}
            >
              <Milk className="w-3.5 h-3.5 text-amber-500" />
              <span>Milk: {tdsPpm !== null ? `${tdsPpm.toFixed(0)} ppm` : '--'}</span>
              <span className={`w-2 h-2 rounded-full ${tdsPpm === null ? 'bg-slate-300' : isTdsNormal ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 text-center font-medium mt-1">
            Visual representations of sensor placement on the cow and barn.
          </p>
        </div>

        {/* Selected Sensor Detailed Explanation Card (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {selectedSensor === 'udder' && (
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <span>Udder Temperature Probes</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                  Pin GPIO 4
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-rose-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Current Reading</span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {avgUdderTemp !== null ? `${avgUdderTemp.toFixed(2)} °C` : '--'}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                    avgUdderTemp === null
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : isTempHigh
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : isTempMild
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {avgUdderTemp === null ? '⚪ Waiting for Sensor' : isTempHigh ? '🔴 Mastitis Fever' : isTempMild ? '🟡 Mild Elevation' : '🟢 Healthy Normal'}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <p>
                  <strong>What this sensor does:</strong> Measures the surface skin temperature of the left and right udder quarters using dual digital DS18B20 temperature probes.
                </p>
                <p>
                  <strong>Why it matters:</strong> Early sub-clinical mastitis causes inflammation and increases localized heat by 1.0°C to 1.5°C before visible swelling or milk clotting occurs.
                </p>
                <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Normal bovine body range: <strong>38.0°C to 39.2°C</strong></span>
                </div>
              </div>
            </div>
          )}

          {selectedSensor === 'milk' && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                    <Milk className="w-5 h-5" />
                  </div>
                  <span>Milk Quality Sensor (TDS)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Pin GPIO 34
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Dissolved Solids (TDS)</span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {tdsPpm !== null ? (
                      <>
                        {tdsPpm.toFixed(0)} <span className="text-xs font-normal text-slate-500">ppm</span>
                      </>
                    ) : (
                      '--'
                    )}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                  tdsPpm === null
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : isTdsNormal
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}>
                  {tdsPpm === null ? '⚪ Waiting for Sensor' : isTdsNormal ? '🟢 Good Purity' : '🟡 Elevated TDS'}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <p>
                  <strong>What this sensor does:</strong> Tests the mineral electrical conductivity and total dissolved solids in fresh milk samples.
                </p>
                <p>
                  <strong>Why it matters:</strong> Udder infection alters the permeability of mammary cell walls, leaking blood electrolytes (Na+ and Cl-) into milk, raising conductivity.
                </p>
                <div className="pt-1 text-[11px] text-amber-700 flex items-center gap-1 font-medium">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Used as a research proxy indicator for milk purity.</span>
                </div>
              </div>
            </div>
          )}

          {selectedSensor === 'motion' && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                  <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span>Collar Movement Sensor</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  GPIO 21 & 22
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Current Activity</span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {activity !== null ? (
                      <>
                        {activity.toFixed(3)} <span className="text-xs font-normal text-slate-500">g</span>
                      </>
                    ) : (
                      '--'
                    )}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                  activity === null
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {activity === null ? '⚪ Waiting for Sensor' : '🟢 Normal Grazing'}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <p>
                  <strong>What this sensor does:</strong> Mounted on the cow's neck collar (MPU6050 6-axis accelerometer) to monitor daily walking, standing, and resting cycles.
                </p>
                <p>
                  <strong>Why it matters:</strong> Cattle with mastitis experience pain and discomfort, resulting in significantly reduced rumination and prolonged lying down.
                </p>
              </div>
            </div>
          )}

          {selectedSensor === 'climate' && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                    <CloudSun className="w-5 h-5" />
                  </div>
                  <span>Barn Climate Sensor (DHT22)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Pin GPIO 15
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Barn Weather</span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {ambientTemp !== null ? `${ambientTemp.toFixed(1)}°C` : '--'} / {humidity !== null ? `${humidity.toFixed(0)}%` : '--'}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                  ambientTemp === null
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {ambientTemp === null ? '⚪ Waiting for Sensor' : '🟢 Comfortable'}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <p>
                  <strong>What this sensor does:</strong> Tracks the ambient room temperature and relative humidity inside the dairy shelter.
                </p>
                <p>
                  <strong>Why it matters:</strong> Temperature-Humidity Index (THI) above 72 stresses dairy cows, weakening their immune defenses and dramatically raising bacterial risk.
                </p>
              </div>
            </div>
          )}

          {/* Quick Selection Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => setSelectedSensor('udder')}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                selectedSensor === 'udder'
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" />
              <span>Udder</span>
            </button>

            <button
              onClick={() => setSelectedSensor('milk')}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                selectedSensor === 'milk'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Milk className="w-3.5 h-3.5" />
              <span>Milk TDS</span>
            </button>

            <button
              onClick={() => setSelectedSensor('motion')}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                selectedSensor === 'motion'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Motion</span>
            </button>

            <button
              onClick={() => setSelectedSensor('climate')}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                selectedSensor === 'climate'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CloudSun className="w-3.5 h-3.5" />
              <span>Barn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
