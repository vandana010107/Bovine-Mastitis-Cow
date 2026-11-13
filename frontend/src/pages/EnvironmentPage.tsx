import React, { useState, useEffect } from 'react';
import {
  LineChart as LucideLineChart,
  Thermometer,
  CloudSun,
  Activity,
  Milk,
  Sun
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../services/api';
import type { LatestSensorResponse, SensorReading } from '../services/api';

interface EnvironmentPageProps {
  statusData: LatestSensorResponse | null;
  selectedCowId?: string;
}

export const EnvironmentPage: React.FC<EnvironmentPageProps> = ({ statusData, selectedCowId = 'COW_001' }) => {
  const [timeframe, setTimeframe] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [historyReadings, setHistoryReadings] = useState<SensorReading[]>([]);
  const [selectedSensorTab, setSelectedSensorTab] = useState<'all' | 'temp' | 'milk' | 'motion' | 'climate'>('all');

  const latest = statusData?.data;
  const temp = latest?.ambient_temp ?? null;
  const humidity = latest?.humidity ?? null;

  // Calculate THI formula if both ambient temp and humidity are available
  const thi = (temp !== null && humidity !== null)
    ? (1.8 * temp + 32.0) - (0.55 - 0.0055 * humidity) * (1.8 * temp - 26.0)
    : null;

  // Fetch history readings for charts
  useEffect(() => {
    let isMounted = true;
    api.getSensorHistory(selectedCowId, timeframe)
      .then((res) => {
        if (isMounted) {
          setHistoryReadings(res.readings || []);
        }
      })
      .catch((err) => console.error('Sensor history error:', err));
    return () => {
      isMounted = false;
    };
  }, [selectedCowId, timeframe, statusData?.last_updated]);

  // Determine Heat Stress category
  const getThiCategory = (val: number | null) => {
    if (val === null) return { label: 'Awaiting Live Climate Sensor', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' };
    if (val < 72) return { label: 'Thermal Comfort (<72)', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (val <= 78) return { label: 'Mild Heat Stress (72-78)', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    if (val <= 88) return { label: 'Moderate Heat Stress (79-88)', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { label: 'Severe Heat Stress (>88)', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const thiCat = getThiCategory(thi);

  // Format chart data - strictly empty if no telemetry packets exist
  const chartData =
    historyReadings.length > 0
      ? historyReadings.map((r) => ({
          time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          udder_1: r.udder_temp_1,
          udder_2: r.udder_temp_2,
          ambient: r.ambient_temp,
          humidity: r.humidity,
          activity: r.activity,
          tds: r.tds_ppm,
          thi: r.thi
        }))
      : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="clean-card p-6 border border-slate-200 bg-white rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <LucideLineChart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900">
                Sensor Trend Charts & Telemetry Analysis
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 uppercase">
                Time Series
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuous live graphs tracking udder temperature, milk quality, movement, and barn comfort.
            </p>
          </div>
        </div>

        {/* Timeframe selector toolbar */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
          {(['1h', '6h', '24h', '7d'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last {tf}
            </button>
          ))}
        </div>
      </div>

      {/* THI Climate Summary Hero Card */}
      <div className={`clean-card p-6 border rounded-2xl shadow-xs space-y-4 ${thiCat.bg} ${thiCat.border}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Barn Thermal Comfort (Temperature-Humidity Index • THI)
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {thi !== null ? thi.toFixed(1) : '--'}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full bg-white border ${thiCat.border} ${thiCat.color} shadow-2xs`}>
                {thiCat.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-left shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Ambient Temperature</span>
              <span className="text-base font-bold text-slate-900">{temp !== null ? `${temp.toFixed(1)} °C` : '--'}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-left shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Relative Humidity</span>
              <span className="text-base font-bold text-slate-900">{humidity !== null ? `${humidity.toFixed(0)} %` : '--'}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 pt-2 border-t border-slate-200/60 leading-relaxed">
          High barn heat and humidity (THI &gt; 72) causes cattle heat stress, suppressing rumination and lowering the cow's immune defense against mastitis-causing pathogens.
        </p>
      </div>

      {/* Sensor Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedSensorTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            selectedSensorTab === 'all'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Sensors
        </button>
        <button
          onClick={() => setSelectedSensorTab('temp')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            selectedSensorTab === 'temp'
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Udder Temperature (°C)
        </button>
        <button
          onClick={() => setSelectedSensorTab('milk')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            selectedSensorTab === 'milk'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Milk Quality (TDS ppm)
        </button>
        <button
          onClick={() => setSelectedSensorTab('motion')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            selectedSensorTab === 'motion'
              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Cattle Activity (g)
        </button>
        <button
          onClick={() => setSelectedSensorTab('climate')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            selectedSensorTab === 'climate'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Barn Climate & THI
        </button>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Udder Temperature */}
        {(selectedSensorTab === 'all' || selectedSensorTab === 'temp') && (
          <div className="clean-card p-5 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <span>Udder Temperature (Left & Right Quarters)</span>
              </div>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                DS18B20 Probes
              </span>
            </div>

            {chartData.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/60 text-center p-4">
                <Thermometer className="w-6 h-6 text-slate-300 mb-1.5" />
                <p className="text-xs font-bold text-slate-700">No Telemetry Ingested</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Awaiting live ESP32 Bluetooth / Serial data or Demo Mode.</p>
              </div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis domain={[37.5, 40.5]} stroke="#94a3b8" fontSize={10} unit="°" />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Line type="monotone" dataKey="udder_1" name="Left Udder (°C)" stroke="#e11d48" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="udder_2" name="Right Udder (°C)" stroke="#fb7185" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Normal Healthy Zone: <strong>38.0°C – 39.2°C</strong></span>
              <span className="text-rose-600 font-bold">Fever Threshold: &gt; 39.3°C</span>
            </div>
          </div>
        )}

        {/* Chart 2: Milk Quality (TDS) */}
        {(selectedSensorTab === 'all' || selectedSensorTab === 'milk') && (
          <div className="clean-card p-5 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
                <Milk className="w-4 h-4 text-amber-500" />
                <span>Milk Dissolved Solids & Conductivity</span>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                TDS Probe
              </span>
            </div>

            {chartData.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/60 text-center p-4">
                <Milk className="w-6 h-6 text-slate-300 mb-1.5" />
                <p className="text-xs font-bold text-slate-700">No Telemetry Ingested</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Awaiting live ESP32 Bluetooth / Serial data or Demo Mode.</p>
              </div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={10} unit=" ppm" />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Line type="monotone" dataKey="tds" name="Milk TDS (ppm)" stroke="#d97706" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Standard Pure Milk: <strong>380 – 480 ppm</strong></span>
              <span className="text-amber-700 font-bold">Elevated Ions: &gt; 550 ppm</span>
            </div>
          </div>
        )}

        {/* Chart 3: Cattle Motion */}
        {(selectedSensorTab === 'all' || selectedSensorTab === 'motion') && (
          <div className="clean-card p-5 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
                <Activity className="w-4 h-4 text-teal-500" />
                <span>Cattle Movement & Rumination Activity</span>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                MPU6050 Motion Unit
              </span>
            </div>

            {chartData.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/60 text-center p-4">
                <Activity className="w-6 h-6 text-slate-300 mb-1.5" />
                <p className="text-xs font-bold text-slate-700">No Telemetry Ingested</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Awaiting live ESP32 Bluetooth / Serial data or Demo Mode.</p>
              </div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={10} unit="g" />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Line type="monotone" dataKey="activity" name="Activity (g)" stroke="#0d9488" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Active Grazing: <strong>0.95g – 1.20g</strong></span>
              <span className="text-teal-700 font-bold">Resting / Rumination: ~0.80g</span>
            </div>
          </div>
        )}

        {/* Chart 4: Barn Climate & THI */}
        {(selectedSensorTab === 'all' || selectedSensorTab === 'climate') && (
          <div className="clean-card p-5 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
                <CloudSun className="w-4 h-4 text-blue-500" />
                <span>Barn Room Heat & Humidity</span>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                DHT22 Ambient
              </span>
            </div>

            {chartData.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/60 text-center p-4">
                <CloudSun className="w-6 h-6 text-slate-300 mb-1.5" />
                <p className="text-xs font-bold text-slate-700">No Telemetry Ingested</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Awaiting live ESP32 Bluetooth / Serial data or Demo Mode.</p>
              </div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Line type="monotone" dataKey="ambient" name="Temp (°C)" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#2563eb" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Comfortable THI: <strong>&lt; 72</strong></span>
              <span className="text-amber-700 font-bold">Heat Stress: &gt; 78</span>
            </div>
          </div>
        )}
      </div>

      {/* THI Comfort Scale Table */}
      <div className="clean-card p-6 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Dairy Cattle Thermal Comfort Standards</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">THI Range</th>
                <th className="p-3">Thermal Stress Level</th>
                <th className="p-3">Cattle Physiological Impact</th>
                <th className="p-3">Recommended Barn Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-3 font-mono font-bold text-emerald-700">&lt; 72</td>
                <td className="p-3 font-semibold text-emerald-700">Thermal Comfort</td>
                <td className="p-3">Normal grazing, body temperature, and rumination</td>
                <td className="p-3 text-slate-500">Normal operations</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-amber-700">72 – 78</td>
                <td className="p-3 font-semibold text-amber-700">Mild Heat Stress</td>
                <td className="p-3">Respiration rate increases slightly, slight milk drop</td>
                <td className="p-3 text-slate-500">Provide clean drinking water and shade</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-orange-700">79 – 88</td>
                <td className="p-3 font-semibold text-orange-700">Moderate Heat Stress</td>
                <td className="p-3">Lethargy, lowered immunity, increased mastitis risk</td>
                <td className="p-3 text-slate-500">Turn on barn fans and mist cooling</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-red-700">&gt; 88</td>
                <td className="p-3 font-semibold text-red-700">Severe Heat Stress</td>
                <td className="p-3">Significant distress, severe fever risk, danger of collapse</td>
                <td className="p-3 text-slate-500">Immediate cooling & veterinary intervention</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
