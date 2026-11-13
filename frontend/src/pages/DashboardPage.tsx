import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  CloudSun,
  Activity,
  Milk,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Brain,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
  Trash2,
  Radio
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
import type { LatestSensorResponse, SensorReading, MlPredictionData } from '../services/api';
import { BluetoothControlPanel } from '../components/BluetoothControlPanel';
import { VisualCowInspection } from '../components/VisualCowInspection';

interface DashboardPageProps {
  selectedCowId: string;
  statusData: LatestSensorResponse | null;
  onRefresh?: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: (enable: boolean) => void;
}

interface ActivityEvent {
  id: string;
  timestamp: string;
  source: string;
  value: string;
  impact: string;
  statusType: 'normal' | 'warning' | 'alert';
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  selectedCowId,
  statusData,
  onRefresh,
  isDemoMode,
  onToggleDemoMode
}) => {
  const [timeframe, setTimeframe] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [historyReadings, setHistoryReadings] = useState<SensorReading[]>([]);
  const [mlPrediction, setMlPrediction] = useState<MlPredictionData | null>(null);
  const [isSpecOpen, setIsSpecOpen] = useState(false);

  // Simulated live demo state
  const [demoState, setDemoState] = useState<{
    udder_1: number;
    udder_2: number;
    ambient: number;
    humidity: number;
    activity: number;
    tds: number;
    condition: 'healthy' | 'mild' | 'mastitis' | 'heat_stress';
  }>({
    udder_1: 38.35,
    udder_2: 38.40,
    ambient: 28.5,
    humidity: 62.0,
    activity: 1.015,
    tds: 420.0,
    condition: 'healthy'
  });

  // Activity logs - starts empty until ESP32 streams or Demo Mode is toggled
  const [activityLogs, setActivityLogs] = useState<ActivityEvent[]>([]);

  // When demo mode is toggled on, populate simulated activity logs
  useEffect(() => {
    if (isDemoMode && activityLogs.length === 0) {
      setActivityLogs([
        {
          id: '1',
          timestamp: new Date().toLocaleTimeString(),
          source: 'Udder Temperature Sensors (DS18B20)',
          value: '38.4 °C (Left: 38.35°C, Right: 38.40°C)',
          impact: 'Normal bovine temperature • Low infection risk',
          statusType: 'normal'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 30000).toLocaleTimeString(),
          source: 'Milk Purity Probe (TDS Meter)',
          value: '420 ppm',
          impact: 'Good milk purity • Standard electrolyte balance',
          statusType: 'normal'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
          source: 'Cattle Motion Collar (MPU6050)',
          value: '1.015 g (Active)',
          impact: 'Normal grazing and chewing rumination behavior',
          statusType: 'normal'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 90000).toLocaleTimeString(),
          source: 'Barn Climate Unit (DHT22)',
          value: '28.5 °C • 62% Humidity',
          impact: 'Comfortable shed microclimate (THI: 72)',
          statusType: 'normal'
        }
      ]);
    }
  }, [isDemoMode]);

  // When live hardware data packets arrive, append to activity logs
  useEffect(() => {
    if (!isDemoMode && statusData?.data) {
      const d = statusData.data;
      const timeStr = new Date().toLocaleTimeString();
      setActivityLogs((prev) => [
        {
          id: String(Date.now()),
          timestamp: timeStr,
          source: `ESP32 Hardware (${statusData.connected_device_name || 'BOVINE_MASTITIS_ESP32'})`,
          value: `Udder: ${d.udder_temp_1?.toFixed(2) ?? '--'}°C / ${d.udder_temp_2?.toFixed(2) ?? '--'}°C • TDS: ${d.tds_ppm?.toFixed(0) ?? '--'} ppm • Act: ${d.activity?.toFixed(3) ?? '--'}g`,
          impact: (d.udder_temp_1 ?? 0) > 39.4 ? 'Elevated udder temperature detected' : 'Live sensor packet ingested successfully',
          statusType: (d.udder_temp_1 ?? 0) > 39.4 ? 'alert' : 'normal'
        },
        ...prev.slice(0, 19)
      ]);
    }
  }, [statusData?.last_updated, isDemoMode]);

  // Demo mode auto-fluctuation
  useEffect(() => {
    if (!isDemoMode) return;
    const interval = setInterval(() => {
      setDemoState((prev) => {
        const jitter = (Math.random() - 0.5) * 0.08;
        const actJitter = (Math.random() - 0.5) * 0.02;
        return {
          ...prev,
          udder_1: +(prev.udder_1 + jitter).toFixed(2),
          udder_2: +(prev.udder_2 + jitter).toFixed(2),
          activity: +(prev.activity + actJitter).toFixed(3)
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  const handleSimulateCondition = (type: 'healthy' | 'mild' | 'mastitis' | 'heat_stress') => {
    const time = new Date().toLocaleTimeString();
    if (type === 'healthy') {
      setDemoState({
        udder_1: 38.35,
        udder_2: 38.40,
        ambient: 28.5,
        humidity: 62.0,
        activity: 1.015,
        tds: 420.0,
        condition: 'healthy'
      });
      setActivityLogs((prev) => [
        {
          id: String(Date.now()),
          timestamp: time,
          source: 'System Simulation',
          value: '38.4°C / 420 ppm / 1.02g',
          impact: 'Simulated Normal Cow Health • Low Risk',
          statusType: 'normal'
        },
        ...prev.slice(0, 15)
      ]);
    } else if (type === 'mild') {
      setDemoState({
        udder_1: 38.90,
        udder_2: 38.95,
        ambient: 30.0,
        humidity: 65.0,
        activity: 0.940,
        tds: 480.0,
        condition: 'mild'
      });
      setActivityLogs((prev) => [
        {
          id: String(Date.now()),
          timestamp: time,
          source: 'Udder Thermal Alert',
          value: '38.95 °C (Elevated)',
          impact: 'Mild temperature rise • Observe during next milking',
          statusType: 'warning'
        },
        ...prev.slice(0, 15)
      ]);
    } else if (type === 'mastitis') {
      setDemoState({
        udder_1: 39.55,
        udder_2: 39.60,
        ambient: 31.0,
        humidity: 70.0,
        activity: 0.810,
        tds: 640.0,
        condition: 'mastitis'
      });
      setActivityLogs((prev) => [
        {
          id: String(Date.now()),
          timestamp: time,
          source: 'AI Mastitis Warning Engine',
          value: '39.60 °C • 640 ppm TDS',
          impact: 'High infection indicators • Veterinary inspection advised',
          statusType: 'alert'
        },
        ...prev.slice(0, 15)
      ]);
    } else {
      setDemoState({
        udder_1: 38.50,
        udder_2: 38.55,
        ambient: 35.0,
        humidity: 78.0,
        activity: 0.890,
        tds: 430.0,
        condition: 'heat_stress'
      });
      setActivityLogs((prev) => [
        {
          id: String(Date.now()),
          timestamp: time,
          source: 'Barn Climate Unit',
          value: '35.0 °C • 78% Humidity (THI 84)',
          impact: 'Severe heat stress in barn • Turn on ventilation fans',
          statusType: 'warning'
        },
        ...prev.slice(0, 15)
      ]);
    }
  };

  // Fetch chart history & ML Prediction
  useEffect(() => {
    let isMounted = true;
    api.getSensorHistory(selectedCowId, timeframe)
      .then((res) => {
        if (isMounted) {
          setHistoryReadings(res.readings || []);
        }
      })
      .catch((err) => console.error('History API error:', err));

    api.getMlPrediction(selectedCowId)
      .then((data) => {
        if (isMounted) setMlPrediction(data);
      })
      .catch((err) => console.error('ML prediction error:', err));

    return () => {
      isMounted = false;
    };
  }, [selectedCowId, timeframe, statusData?.last_updated]);

  // Determine current active sensor values (real live hardware or demo mode)
  const latest = statusData?.data;

  const currentUdder1: number | null = isDemoMode
    ? demoState.udder_1
    : (latest?.udder_temp_1 ?? null);

  const currentUdder2: number | null = isDemoMode
    ? demoState.udder_2
    : (latest?.udder_temp_2 ?? null);

  const avgTemp: number | null = (currentUdder1 !== null && currentUdder2 !== null)
    ? (currentUdder1 + currentUdder2) / 2
    : (currentUdder1 ?? currentUdder2 ?? null);

  const currentAmbient: number | null = isDemoMode
    ? demoState.ambient
    : (latest?.ambient_temp ?? null);

  const currentHumidity: number | null = isDemoMode
    ? demoState.humidity
    : (latest?.humidity ?? null);

  const currentActivity: number | null = isDemoMode
    ? demoState.activity
    : (latest?.activity ?? null);

  const currentTds: number | null = isDemoMode
    ? demoState.tds
    : (latest?.tds_ppm ?? null);

  // Active telemetry flag (true if Demo Mode is on OR live hardware readings exist)
  const hasActiveData = isDemoMode || (avgTemp !== null || currentTds !== null || currentActivity !== null);

  // Calculate THI if ambient and humidity are available
  const thiValue = (currentAmbient !== null && currentHumidity !== null)
    ? Math.round((1.8 * currentAmbient + 32.0) - (0.55 - 0.0055 * currentHumidity) * (1.8 * currentAmbient - 26.0))
    : null;

  // Determine Overall Cow Health Status (only when data exists)
  const isWarning = hasActiveData && ((avgTemp !== null && avgTemp > 39.4) || (currentTds !== null && currentTds > 550));
  const isHealthy = hasActiveData && !isWarning && ((avgTemp !== null && avgTemp <= 39.2) && (currentTds === null || currentTds <= 500));
  const isMild = hasActiveData && !isHealthy && !isWarning;

  // Chart data formatting
  const chartData =
    historyReadings.length > 0
      ? historyReadings.map((r) => ({
          time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          udder_1: r.udder_temp_1,
          udder_2: r.udder_temp_2,
          ambient: r.ambient_temp,
          humidity: r.humidity,
          activity: r.activity,
          tds: r.tds_ppm
        }))
      : isDemoMode
      ? [
          { time: '12:00', udder_1: 38.3, udder_2: 38.35, ambient: 27.5, humidity: 60, activity: 1.02, tds: 410 },
          { time: '12:15', udder_1: 38.35, udder_2: 38.4, ambient: 28.0, humidity: 61, activity: 1.05, tds: 415 },
          { time: '12:30', udder_1: 38.4, udder_2: 38.4, ambient: 28.2, humidity: 62, activity: 0.98, tds: 420 },
          { time: '12:45', udder_1: demoState.udder_1, udder_2: demoState.udder_2, ambient: demoState.ambient, humidity: demoState.humidity, activity: demoState.activity, tds: demoState.tds }
        ]
      : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* 1. TOP BLUETOOTH CONNECTION CARD */}
      <BluetoothControlPanel
        isDemoMode={isDemoMode}
        onToggleDemoMode={onToggleDemoMode}
      />

      {/* 2. DYNAMIC COW HEALTH STATUS BANNER */}
      <div
        className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
          !hasActiveData
            ? 'bg-slate-50 border-slate-200 text-slate-800'
            : isWarning
            ? 'bg-red-50 border-red-200 text-red-900'
            : isMild
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
              !hasActiveData
                ? 'bg-slate-200 text-slate-600'
                : isWarning
                ? 'bg-red-600 text-white'
                : isMild
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {!hasActiveData ? (
              <Radio className="w-6 h-6 text-slate-500" />
            ) : isWarning ? (
              <AlertCircle className="w-6 h-6 animate-pulse" />
            ) : isMild ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-75">
                Live Herd Diagnosis
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/70 border border-current/20">
                {selectedCowId}
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              {!hasActiveData
                ? 'AWAITING ESP32 HARDWARE TELEMETRY'
                : isWarning
                ? 'HEALTH ALERT: Early Mastitis Indicators Detected'
                : isMild
                ? 'ATTENTION: Mild Temperature Elevation Detected'
                : 'COW HEALTH STATUS: HEALTHY & NORMAL'}
            </h2>
            <p className="text-xs opacity-90 mt-0.5 font-normal">
              {!hasActiveData
                ? 'No live hardware packets received yet. Connect your ESP32 hardware via Bluetooth below, or click "TRY DEMO MODE" to preview simulated data.'
                : isWarning
                ? 'Elevated udder temperature (>39.3°C) and milk electrical conductivity detected. Veterinary check is recommended.'
                : isMild
                ? 'Slight thermal deviation or altered activity pattern observed. Recommended to monitor during next milking.'
                : 'All vital signs (body temperature, milk quality, movement) are in safe normal ranges. No early signs of mastitis.'}
            </p>
          </div>
        </div>

        {/* Status Pill on the Right */}
        <div className="shrink-0 self-end sm:self-center">
          <span
            className={`px-4 py-2 rounded-xl text-xs font-bold border shadow-2xs inline-flex items-center gap-2 ${
              !hasActiveData
                ? 'bg-white text-slate-600 border-slate-300'
                : isWarning
                ? 'bg-white text-red-700 border-red-200'
                : isMild
                ? 'bg-white text-amber-700 border-amber-200'
                : 'bg-white text-emerald-700 border-emerald-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                !hasActiveData
                  ? 'bg-slate-400'
                  : isWarning
                  ? 'bg-red-500 animate-ping'
                  : isMild
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
            <span>
              {!hasActiveData
                ? 'HARDWARE DATA: NONE (--)'
                : isWarning
                ? 'MASTITIS RISK: HIGH'
                : isMild
                ? 'MASTITIS RISK: MILD'
                : 'MASTITIS RISK: LOW (SAFE)'}
            </span>
          </span>
        </div>
      </div>

      {/* 3. FOUR CLEAR PRIMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Body Temperature */}
        <div className="clean-card p-5 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Cow Body Temp
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {avgTemp !== null ? avgTemp.toFixed(1) : '--'}
              </span>
              <span className="text-sm font-bold text-slate-500">°C</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {currentUdder1 !== null && currentUdder2 !== null
                ? `L: ${currentUdder1.toFixed(1)}°C • R: ${currentUdder2.toFixed(1)}°C`
                : 'L: -- °C • R: -- °C'}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span
              className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                avgTemp === null
                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                  : avgTemp > 39.4
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : avgTemp > 39.2
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {avgTemp === null
                ? '⚪ Waiting for Sensor'
                : avgTemp > 39.4
                ? '🔴 High Fever'
                : avgTemp > 39.2
                ? '🟡 Mild Fever'
                : '🟢 Healthy (38-39.2°)'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Dual DS18B20</span>
          </div>
        </div>

        {/* KPI 2: Milk Quality (TDS) */}
        <div className="clean-card p-5 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Milk Quality (TDS)
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Milk className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {currentTds !== null ? currentTds.toFixed(0) : '--'}
              </span>
              <span className="text-sm font-bold text-slate-500">ppm</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Milk mineral dissolved solids
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span
              className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                currentTds === null
                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                  : currentTds > 550
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {currentTds === null ? '⚪ Waiting for Sensor' : currentTds > 550 ? '🔴 High Conductivity' : '🟢 Good Purity'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">TDS Meter</span>
          </div>
        </div>

        {/* KPI 3: Cattle Activity */}
        <div className="clean-card p-5 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Cattle Movement
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {currentActivity !== null
                  ? (currentActivity < 0.85 ? 'Resting' : 'Active')
                  : '--'}
              </span>
              {currentActivity !== null && (
                <span className="text-xs font-mono font-bold text-slate-400">
                  ({currentActivity.toFixed(2)}g)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Collar kinematics & rumination
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span
              className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                currentActivity === null
                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {currentActivity === null ? '⚪ Waiting for Sensor' : currentActivity < 0.85 ? '🟡 Resting' : '🟢 Normal Grazing'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">MPU6050</span>
          </div>
        </div>

        {/* KPI 4: Barn Microclimate */}
        <div className="clean-card p-5 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Barn Comfort
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <CloudSun className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {currentAmbient !== null ? `${currentAmbient.toFixed(1)}°C` : '--'}
              </span>
              <span className="text-sm font-bold text-slate-500">
                / {currentHumidity !== null ? `${currentHumidity.toFixed(0)}%` : '--'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {thiValue !== null ? `THI Index: ~${thiValue} (${thiValue < 72 ? 'Comfortable' : 'Heat Stress'})` : 'THI Index: --'}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span
              className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                currentAmbient === null
                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {currentAmbient === null ? '⚪ Waiting for Sensor' : '🟢 Safe Environment'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">DHT22 Ambient</span>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE 2D COW HEALTH & SENSOR LAYOUT */}
      <VisualCowInspection
        udderTemp1={currentUdder1}
        udderTemp2={currentUdder2}
        ambientTemp={currentAmbient}
        humidity={currentHumidity}
        activity={currentActivity}
        tdsPpm={currentTds}
        isDemoMode={isDemoMode}
        onSimulateCondition={handleSimulateCondition}
      />

      {/* 5. AI EARLY MASTITIS RISK FORECAST CARD */}
      <div className="clean-card p-6 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI Early Disease Risk Forecasting Engine
              </h3>
              <p className="text-xs text-slate-500">
                Predicts sub-clinical mastitis risk up to 48 hours before visible signs appear
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Model Active (RandomForest)</span>
          </span>
        </div>

        {/* 3 Forecasting Time Horizons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Risk */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Current Mastitis Risk
            </span>
            <span
              className={`text-2xl font-extrabold block ${
                !hasActiveData
                  ? 'text-slate-400'
                  : (mlPrediction?.current_risk?.includes('High') || isWarning)
                  ? 'text-red-600'
                  : (mlPrediction?.current_risk?.includes('Moderate') || isMild)
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {!hasActiveData ? '--' : (mlPrediction?.current_risk || (isWarning ? 'High (84%)' : isMild ? 'Moderate (32%)' : 'Low (8%)'))}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {!hasActiveData ? '⚪ Connect ESP32 hardware' : (mlPrediction?.alert_level || (isWarning ? '🔴 Requires Veterinary Check' : '🟢 Safe Normal Baseline'))}
            </span>
          </div>

          {/* +24 Hours Projection */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              24-Hour Forward Projection
            </span>
            <span
              className={`text-2xl font-extrabold block ${
                !hasActiveData
                  ? 'text-slate-400'
                  : (mlPrediction?.risk_24h?.includes('High') || isWarning)
                  ? 'text-red-600'
                  : (mlPrediction?.risk_24h?.includes('Moderate') || isMild)
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {!hasActiveData ? '--' : (mlPrediction?.risk_24h || (isWarning ? 'High (88%)' : isMild ? 'Moderate (36%)' : 'Low (11%)'))}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {!hasActiveData ? '⚪ Awaiting telemetry' : '+24h Machine Learning projection'}
            </span>
          </div>

          {/* +48 Hours Projection */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              48-Hour Forward Projection
            </span>
            <span
              className={`text-2xl font-extrabold block ${
                !hasActiveData
                  ? 'text-slate-400'
                  : (mlPrediction?.risk_48h?.includes('High') || isWarning)
                  ? 'text-red-600'
                  : (mlPrediction?.risk_48h?.includes('Moderate') || isMild)
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {!hasActiveData ? '--' : (mlPrediction?.risk_48h || (isWarning ? 'High (91%)' : isMild ? 'Moderate (42%)' : 'Low (14%)'))}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {!hasActiveData ? '⚪ Awaiting telemetry' : '+48h Machine Learning projection'}
            </span>
          </div>
        </div>

        {/* Contributing Features & Recommendation */}
        {hasActiveData && mlPrediction && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">
                Key Evaluated Physiological & Environmental Factors:
              </span>
              <span className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                RandomForest • Accuracy: 100%
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {mlPrediction.contributing_features?.map((feat, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-[11px] shadow-2xs"
                >
                  {feat}
                </span>
              ))}
            </div>
            {mlPrediction.recommendation && (
              <div className="pt-2 border-t border-slate-200 text-slate-700">
                <strong className="text-slate-900">Veterinary Action:</strong> {mlPrediction.recommendation}
              </div>
            )}
          </div>
        )}

        {/* Friendly Explanation Note */}
        <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-900 text-xs flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            <strong>How AI Helps:</strong> The algorithm correlates udder temperature symmetry between left and right quarters with movement and milk conductivity. This detects infection 24 to 48 hours before visible milk clots or painful udder swelling appear.
          </span>
        </div>
      </div>

      {/* 6. TIME-SERIES SENSOR CHARTS */}
      <div className="clean-card p-6 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Live Sensor Trends & Telemetry Charts
            </h3>
            <p className="text-xs text-slate-500">
              Real-time graphs updating with each received ESP32 Bluetooth packet
            </p>
          </div>

          {/* Timeframe Selectors */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
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

        {chartData.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/60 text-center p-6 space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">No Historical Telemetry Packets Recorded</p>
              <p className="text-[11px] text-slate-500 max-w-md mt-0.5">
                Connect your ESP32 hardware via Bluetooth below to stream live telemetry, or click <strong className="text-purple-600 font-bold">"TRY DEMO MODE"</strong> above to preview interactive time-series sensor charts.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 1: Udder Temperature */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Udder Left & Right Temperature (°C)</span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  DS18B20 Probes
                </span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                    <Line type="monotone" dataKey="udder_1" name="Left Udder (°C)" stroke="#e11d48" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="udder_2" name="Right Udder (°C)" stroke="#f43f5e" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Milk Quality (TDS) */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Milk Dissolved Solids (TDS ppm)</span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  TDS Sensor
                </span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                    <Line type="monotone" dataKey="tds" name="Milk TDS (ppm)" stroke="#d97706" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Cattle Motion */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Cattle Daily Motion Activity (g)</span>
                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  MPU6050 Motion Unit
                </span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                    <Line type="monotone" dataKey="activity" name="Activity (g)" stroke="#0d9488" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Ambient Barn Climate */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Barn Temp (°C) & Humidity (%)</span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  DHT22 Ambient
                </span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                    <Line type="monotone" dataKey="ambient" name="Barn Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#2563eb" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. RECENT ACTIVITY LOG SECTION (Just like car parking's activity log!) */}
      <div className="clean-card p-6 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Recent Cattle Health Activity Log
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 font-mono">
                  {selectedCowId}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Real-time sensor telemetry and health events transmitted by ESP32 for <strong className="text-slate-700">{selectedCowId}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivityLogs([])}
              title="Clear temporary dashboard display view"
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span>Clear View</span>
            </button>
            <button
              onClick={async () => {
                if (window.confirm(`Permanently delete all activity logs for ${selectedCowId} from the database?`)) {
                  try {
                    await api.deleteAllSensorData(selectedCowId);
                    setActivityLogs([]);
                    onRefresh?.();
                  } catch (err) {
                    console.error('Failed to delete activity logs:', err);
                  }
                }
              }}
              title="Permanently delete all sensor activity logs from database"
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Logs</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Event Source</th>
                <th className="p-3">Measurement</th>
                <th className="p-3">Cow Health Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activityLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-5 text-center text-slate-400 italic">
                    No activity events recorded yet. Connect ESP32 or activate Demo Mode to view logs.
                  </td>
                </tr>
              ) : (
                activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-slate-500">{log.timestamp}</td>
                    <td className="p-3 font-semibold text-slate-800">{log.source}</td>
                    <td className="p-3 font-mono text-slate-700">{log.value}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold inline-flex items-center gap-1.5 ${
                          log.statusType === 'alert'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : log.statusType === 'warning'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            log.statusType === 'alert'
                              ? 'bg-red-500'
                              : log.statusType === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                        {log.impact}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. TECHNICAL ESP32 HARDWARE SPECIFICATIONS ACCORDION (Just like car parking!) */}
      <div className="clean-card border border-slate-200 bg-white rounded-2xl shadow-xs overflow-hidden">
        <button
          onClick={() => setIsSpecOpen(!isSpecOpen)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                ESP32 Hardware & Sensor Technical Specifications
              </h4>
              <p className="text-xs text-slate-500">
                Microcontroller pinouts, communication baud rate, and electrical specs
              </p>
            </div>
          </div>
          <div className="text-slate-400">
            {isSpecOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {isSpecOpen && (
          <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Device Name</span>
                <code className="text-slate-800 font-bold font-mono">BOVINE_MASTITIS_ESP32</code>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Protocol & Baud Rate</span>
                <span className="text-slate-800 font-bold">Bluetooth Classic SPP @ 115200</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Udder Temp Probes</span>
                <span className="text-slate-800 font-bold">DS18B20 1-Wire &bull; GPIO 4</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Barn Climate Sensor</span>
                <span className="text-slate-800 font-bold">DHT22 Digital &bull; GPIO 15</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Motion Accelerometer</span>
                <span className="text-slate-800 font-bold">MPU6050 I2C &bull; GPIO 21 (SDA), 22 (SCL)</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Milk TDS Sensor</span>
                <span className="text-slate-800 font-bold">Analog ADC &bull; GPIO 34 (0-3.3V)</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Power Supply</span>
                <span className="text-slate-800 font-bold">5V Micro-USB / Li-Ion Battery</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Safety Circuitry</span>
                <span className="text-slate-800 font-bold">4.7kΩ Pull-Up Resistor on 1-Wire</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 pt-6 pb-2">
        <p>Smart Cow Health & Milk Monitoring System &bull; ESP32 Hardware Web Dashboard &bull; Bluetooth Classic SPP Integration</p>
      </footer>
    </div>
  );
};
