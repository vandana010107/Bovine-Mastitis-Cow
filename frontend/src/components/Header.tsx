import React, { useEffect, useState } from 'react';
import { Bluetooth, BluetoothOff, Clock, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import type { LatestSensorResponse, CowProfile } from '../services/api';

interface HeaderProps {
  statusData: LatestSensorResponse | null;
  selectedCowId: string;
  onCowIdChange: (cowId: string) => void;
  isSimulatedMode?: boolean;
  lastSyncTime?: Date;
}

export const Header: React.FC<HeaderProps> = ({
  statusData,
  selectedCowId,
  onCowIdChange,
  isSimulatedMode = false,
  lastSyncTime,
}) => {
  const [cows, setCows] = useState<CowProfile[]>([]);

  // Periodically fetch cows list so new/edited cow names show up immediately
  const refreshCows = () => {
    api.getCows()
      .then((data) => setCows(data))
      .catch((err) => console.error('Failed to load cows for header:', err));
  };

  useEffect(() => {
    refreshCows();
    const interval = setInterval(refreshCows, 5000);
    const handleCowsUpdated = () => refreshCows();
    window.addEventListener('cows-updated', handleCowsUpdated);
    return () => {
      clearInterval(interval);
      window.removeEventListener('cows-updated', handleCowsUpdated);
    };
  }, [selectedCowId]);

  const btStatus = statusData?.bluetooth_status || 'Waiting for Device';
  const devName = statusData?.connected_device_name || 'BOVINE_MASTITIS_ESP32';

  // Format real-time clock and accurate local update time
  const getFormattedTime = () => {
    if (lastSyncTime) {
      return lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    if (statusData?.last_updated) {
      const ts = statusData.last_updated;
      const normalized = ts.endsWith('Z') || ts.includes('+') ? ts : `${ts}Z`;
      const d = new Date(normalized);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    }
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const lastUpdated = getFormattedTime();

  const isBtConnected = btStatus === 'Bluetooth Connected';

  const hasSelectedInList = cows.some((c) => c.id === selectedCowId);
  const displayCows = hasSelectedInList
    ? cows
    : [{ id: selectedCowId, breed: 'Sahiwal', age: 4, lactation_stage: 'Mid-Lactation', farm: 'Farm A', location: '', monitoring_start_date: '' }, ...cows];

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-xs flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Project Identity */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
          <span className="text-2xl select-none" role="img" aria-label="Cow">🐄</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Smart Cow Health & Milk Monitoring
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 uppercase tracking-wide">
              ESP32 IoT
            </span>
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Real-Time Cattle Wellness, Milk Quality & Early Disease Detection
          </p>
        </div>
      </div>

      {/* Right Controls: Cow Selector & Status Pills */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {/* Cow Selector */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="text-slate-500 font-medium">Selected Cow:</span>
          <select
            value={selectedCowId}
            onChange={(e) => onCowIdChange(e.target.value)}
            className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
          >
            {displayCows.map((cow) => (
              <option key={cow.id} value={cow.id}>
                {cow.id} ({cow.breed || 'Cattle'}{cow.farm ? ` • ${cow.farm}` : ''})
              </option>
            ))}
          </select>
        </div>

        {/* Demo Mode Badge */}
        {isSimulatedMode && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>DEMO MODE ACTIVE</span>
          </div>
        )}

        {/* Connection Status Pill */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200" title={`Target Device: ${devName}`}>
          {isBtConnected ? (
            <Bluetooth className="w-4 h-4 text-emerald-600" />
          ) : (
            <BluetoothOff className="w-4 h-4 text-slate-400" />
          )}
          <span className="text-slate-500 font-medium">Device:</span>
          <span
            className={`font-bold flex items-center gap-1.5 ${
              isBtConnected
                ? 'text-emerald-700'
                : isSimulatedMode
                ? 'text-purple-700'
                : btStatus === 'Waiting for Device'
                ? 'text-amber-700'
                : 'text-slate-600'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBtConnected
                  ? 'bg-emerald-500 animate-pulse'
                  : isSimulatedMode
                  ? 'bg-purple-500 animate-pulse'
                  : btStatus === 'Waiting for Device'
                  ? 'bg-amber-500'
                  : 'bg-slate-400'
              }`}
            />
            {isSimulatedMode ? 'Demo Active' : btStatus}
          </span>
        </div>

        {/* Last Updated Pill */}
        <div className="hidden sm:flex items-center gap-1.5 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Updated: {lastUpdated}</span>
        </div>
      </div>
    </header>
  );
};
