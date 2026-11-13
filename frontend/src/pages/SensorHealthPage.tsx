import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import type { SensorHealthItem } from '../services/api';

interface SensorHealthPageProps {
  selectedCowId: string;
}

export const SensorHealthPage: React.FC<SensorHealthPageProps> = ({ selectedCowId }) => {
  const [healthItems, setHealthItems] = useState<SensorHealthItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHealth = () => {
    setIsLoading(true);
    api.getSensorHealth(selectedCowId)
      .then((data) => setHealthItems(data))
      .catch((err) => console.error('Sensor health error:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchHealth();
  }, [selectedCowId]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">ESP32 Sensor Health & Pin Diagnostics</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live hardware diagnostics for physical sensors attached to ESP32 DevKit V1.
            </p>
          </div>
        </div>

        <button
          onClick={fetchHealth}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Hardware Status</span>
        </button>
      </div>

      {/* Sensor Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {healthItems.map((item, idx) => {
          const isOk = item.status === 'Connected';
          const isDelayed = item.status === 'Delayed';

          return (
            <div
              key={idx}
              className={`glass-card p-6 rounded-2xl space-y-4 border ${
                isOk
                  ? 'border-emerald-500/20'
                  : isDelayed
                  ? 'border-amber-500/20'
                  : 'border-rose-500/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{item.name}</h3>
                  <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                    ESP32 Pin: {item.pin}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isOk
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : isDelayed
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {isOk ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Connected</span>
                    </>
                  ) : isDelayed ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Delayed</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Disconnected</span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Last Reading</span>
                  <span className="font-mono font-bold text-slate-200 mt-0.5 block">{item.last_reading}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Data Freshness</span>
                  <span className="font-mono font-medium text-slate-400 mt-0.5 block">{item.last_updated}</span>
                </div>
              </div>

              {item.error && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-mono">
                  Diagnostic Note: {item.error}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
