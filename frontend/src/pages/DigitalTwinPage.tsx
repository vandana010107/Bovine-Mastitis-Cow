import React, { useState, useEffect } from 'react';
import { Dna, Activity, Thermometer, Beaker, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import type { DigitalTwinData } from '../services/api';

interface DigitalTwinPageProps {
  selectedCowId: string;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({ selectedCowId }) => {
  const [twinData, setTwinData] = useState<DigitalTwinData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTwinData = () => {
    setIsLoading(true);
    api.getDigitalTwin(selectedCowId)
      .then((data) => setTwinData(data))
      .catch((err) => console.error('Digital Twin API error:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTwinData();
  }, [selectedCowId]);

  const isLearning = twinData?.baseline_status === 'learning';
  const readingsCount = twinData?.readings_collected || 0;
  const minRequired = twinData?.min_readings_required || 30;
  const progressPercent = Math.min(100, Math.round((readingsCount / minRequired) * 100));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Dna className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Cow Digital Twin — {selectedCowId}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              The Digital Twin represents the individual cow's normal sensor pattern and compares current measurements against its historical baseline.
            </p>
          </div>
        </div>

        <button
          onClick={fetchTwinData}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Baselines</span>
        </button>
      </div>

      {/* Learning Status Banner */}
      {isLearning ? (
        <div className="glass-card p-6 rounded-2xl border-amber-500/30 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-amber-300 uppercase tracking-wide">
                  Baseline Learning In Progress
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {readingsCount} / {minRequired} Readings ({progressPercent}%)
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Insufficient historical real sensor readings to calculate a statistically valid personal baseline. The Digital Twin is actively accumulating physical ESP32 telemetry.
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-xs font-semibold">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Personal baseline established from {readingsCount} historical real sensor payloads.</span>
        </div>
      )}

      {/* Baseline Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Udder Temp 1 */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-rose-400" />
              <h3 className="font-bold text-slate-200 text-sm">Udder Temperature 1</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">DS18B20 #1</span>
          </div>

          {isLearning ? (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-xs font-semibold text-amber-400">Baseline learning in progress</span>
              <p className="text-[11px] text-slate-500 mt-1">Personal baseline will appear after 30 payload submissions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Current</span>
                <span className="text-base font-extrabold text-white font-mono">
                  {twinData?.latest_values.udder_temp_1 !== undefined && twinData?.latest_values.udder_temp_1 !== null ? `${twinData.latest_values.udder_temp_1.toFixed(2)} °C` : 'No data'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Baseline</span>
                <span className="text-base font-bold text-cyan-300 font-mono">
                  {twinData?.baselines?.udder_temp_1 !== undefined && twinData?.baselines?.udder_temp_1 !== null ? `${twinData.baselines.udder_temp_1.toFixed(2)} °C` : 'No data'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Deviation</span>
                <span className={`text-base font-extrabold font-mono ${
                  twinData?.deviations?.udder_temp_1 && twinData.deviations.udder_temp_1 > 0.5 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {twinData?.deviations?.udder_temp_1 !== undefined && twinData.deviations?.udder_temp_1 !== null
                    ? `${twinData.deviations.udder_temp_1 > 0 ? '+' : ''}${twinData.deviations.udder_temp_1} °C`
                    : 'No data'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Udder Temp 2 */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-rose-400" />
              <h3 className="font-bold text-slate-200 text-sm">Udder Temperature 2</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">DS18B20 #2</span>
          </div>

          {isLearning ? (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-xs font-semibold text-amber-400">Baseline learning in progress</span>
              <p className="text-[11px] text-slate-500 mt-1">Personal baseline will appear after 30 payload submissions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Current</span>
                <span className="text-base font-extrabold text-white font-mono">
                  {twinData?.latest_values.udder_temp_2 !== undefined && twinData?.latest_values.udder_temp_2 !== null ? `${twinData.latest_values.udder_temp_2.toFixed(2)} °C` : 'No data'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Baseline</span>
                <span className="text-base font-bold text-cyan-300 font-mono">
                  {twinData?.baselines?.udder_temp_2 !== undefined && twinData?.baselines?.udder_temp_2 !== null ? `${twinData.baselines.udder_temp_2.toFixed(2)} °C` : 'No data'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Deviation</span>
                <span className={`text-base font-extrabold font-mono ${
                  twinData?.deviations?.udder_temp_2 && twinData.deviations.udder_temp_2 > 0.5 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {twinData?.deviations?.udder_temp_2 !== undefined && twinData.deviations?.udder_temp_2 !== null
                    ? `${twinData.deviations.udder_temp_2 > 0 ? '+' : ''}${twinData.deviations.udder_temp_2} °C`
                    : 'No data'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <h3 className="font-bold text-slate-200 text-sm">Cattle Activity</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">MPU6050</span>
          </div>

          {isLearning ? (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-xs font-semibold text-amber-400">Baseline learning in progress</span>
              <p className="text-[11px] text-slate-500 mt-1">Personal baseline will appear after 30 payload submissions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Current</span>
                <span className="text-base font-extrabold text-white font-mono">
                  {twinData?.latest_values.activity !== undefined && twinData?.latest_values.activity !== null ? twinData.latest_values.activity.toFixed(3) : 'No data'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Baseline</span>
                <span className="text-base font-bold text-cyan-300 font-mono">
                  {twinData?.baselines?.activity !== undefined && twinData?.baselines?.activity !== null ? twinData.baselines.activity.toFixed(3) : 'No data'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Deviation</span>
                <span className="text-base font-extrabold font-mono text-teal-300">
                  {twinData?.deviations?.activity !== undefined && twinData.deviations?.activity !== null
                    ? `${twinData.deviations.activity > 0 ? '+' : ''}${twinData.deviations.activity}`
                    : 'No data'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* TDS Experimental */}
        <div className="glass-card p-6 rounded-2xl space-y-4 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Beaker className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-amber-300 text-sm">TDS (Experimental)</h3>
            </div>
            <span className="text-[10px] text-amber-400 font-mono">Prototype Probe</span>
          </div>

          {isLearning ? (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-xs font-semibold text-amber-400">Baseline learning in progress</span>
              <p className="text-[11px] text-slate-500 mt-1">Personal baseline will appear after 30 payload submissions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Current</span>
                <span className="text-base font-extrabold text-white font-mono">
                  {twinData?.latest_values.tds_ppm !== undefined && twinData?.latest_values.tds_ppm !== null ? `${twinData.latest_values.tds_ppm.toFixed(1)} ppm` : 'No data'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Baseline</span>
                <span className="text-base font-bold text-cyan-300 font-mono">
                  {twinData?.baselines?.tds_ppm !== undefined && twinData?.baselines?.tds_ppm !== null ? `${twinData.baselines.tds_ppm.toFixed(1)} ppm` : 'No data'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Deviation</span>
                <span className="text-base font-extrabold font-mono text-amber-400">
                  {twinData?.deviations?.tds_ppm !== undefined && twinData.deviations?.tds_ppm !== null
                    ? `${twinData.deviations.tds_ppm > 0 ? '+' : ''}${twinData.deviations.tds_ppm}`
                    : 'No data'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
