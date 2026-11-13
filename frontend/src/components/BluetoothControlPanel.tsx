import React, { useState, useEffect } from 'react';
import {
  Bluetooth,
  RefreshCw,
  Sparkles,
  Radio,
  PlugZap,
  Info,
  XCircle
} from 'lucide-react';
import { api } from '../services/api';
import type {
  BluetoothStatusResponse,
  BluetoothPortItem
} from '../services/api';

interface BluetoothControlPanelProps {
  onStatusChange?: (status: BluetoothStatusResponse) => void;
  isDemoMode: boolean;
  onToggleDemoMode: (enable: boolean) => void;
}

export const BluetoothControlPanel: React.FC<BluetoothControlPanelProps> = ({
  onStatusChange,
  isDemoMode,
  onToggleDemoMode
}) => {
  const [btStatus, setBtStatus] = useState<BluetoothStatusResponse | null>(null);
  const [ports, setPorts] = useState<BluetoothPortItem[]>([]);
  const [selectedPort, setSelectedPort] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchStatus = () => {
    api.getBluetoothStatus()
      .then((data) => {
        setBtStatus(data);
        if (onStatusChange) onStatusChange(data);
      })
      .catch((err) => console.error('Bluetooth status error:', err));
  };

  const fetchPorts = () => {
    api.getBluetoothPorts()
      .then((items) => {
        setPorts(items);
        if (items.length > 0 && !selectedPort) {
          const candidate = items.find((p) => p.is_bluetooth_candidate);
          setSelectedPort(candidate ? candidate.port : items[0].port);
        }
      })
      .catch((err) => console.error('Bluetooth ports error:', err));
  };

  useEffect(() => {
    fetchStatus();
    fetchPorts();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = () => {
    setIsLoading(true);
    setActionMessage(null);
    api.connectBluetooth(selectedPort || undefined)
      .then((res) => {
        setActionMessage(res.message);
        fetchStatus();
      })
      .catch((err: any) => {
        setActionMessage(`Connection failed: ${err.message || err}`);
      })
      .finally(() => setIsLoading(false));
  };

  const handleDisconnect = () => {
    setIsLoading(true);
    setActionMessage(null);
    api.disconnectBluetooth()
      .then((res) => {
        setActionMessage(res.message);
        fetchStatus();
      })
      .catch((err: any) => {
        setActionMessage(`Disconnect error: ${err.message || err}`);
      })
      .finally(() => setIsLoading(false));
  };

  const isConnected = btStatus?.is_connected || false;
  const statusStr = isDemoMode
    ? 'Demo Mode Active'
    : isConnected
    ? 'ESP32 Connected'
    : btStatus?.status === 'Connecting...'
    ? 'Connecting...'
    : 'Disconnected';

  const devName = btStatus?.connected_device_name || 'BOVINE_MASTITIS_ESP32';

  return (
    <div className="clean-card p-6 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-4">
      {/* Top Header & Status Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        
        {/* Device Brand & Target Info */}
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isConnected
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : isDemoMode
                ? 'bg-purple-50 text-purple-600 border border-purple-200'
                : 'bg-blue-50 text-blue-600 border border-blue-200'
            }`}
          >
            <Bluetooth className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                ESP32 Bluetooth Connection
              </h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Wireless IoT
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Target Device: <strong className="text-slate-800 font-mono">{devName}</strong>
            </p>
          </div>
        </div>

        {/* Right Status Badge & Live Stream Indicator */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Connection Status Badge */}
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 shadow-2xs ${
              isConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isDemoMode
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : statusStr === 'Connecting...'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? 'bg-emerald-500 animate-ping'
                  : isDemoMode
                  ? 'bg-purple-500 animate-pulse'
                  : statusStr === 'Connecting...'
                  ? 'bg-amber-500 animate-spin'
                  : 'bg-slate-400'
              }`}
            />
            <span>{statusStr}</span>
          </div>

          {/* Live Data Indicator */}
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 shadow-2xs ${
              isConnected || isDemoMode
                ? 'bg-emerald-50/60 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isConnected || isDemoMode ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
            <span>{isConnected || isDemoMode ? 'LIVE STREAMING' : 'OFFLINE'}</span>
          </div>
        </div>
      </div>

      {/* Control Buttons & Port Selector */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
        
        {/* COM Port Selector (when available) */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Serial Port:</span>
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
            <select
              value={selectedPort}
              onChange={(e) => setSelectedPort(e.target.value)}
              disabled={isConnected}
              className="bg-transparent text-slate-700 text-xs font-mono py-0.5 focus:outline-none cursor-pointer"
            >
              {ports.length === 0 ? (
                <option value="">No COM Ports (Pair in Windows)</option>
              ) : (
                ports.map((p) => (
                  <option key={p.port} value={p.port}>
                    {p.port} {p.description ? `(${p.description})` : ''}
                  </option>
                ))
              )}
            </select>
            <button
              onClick={fetchPorts}
              title="Rescan COM Ports"
              disabled={isConnected}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>DISCONNECT</span>
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isLoading || isDemoMode}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <PlugZap className="w-4 h-4" />
              <span>{isLoading ? 'CONNECTING...' : 'CONNECT ESP32'}</span>
            </button>
          )}

          {/* Try Demo Mode Button (Just like car parking!) */}
          <button
            onClick={() => onToggleDemoMode(!isDemoMode)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer border ${
              isDemoMode
                ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isDemoMode ? 'EXIT DEMO MODE' : 'TRY DEMO MODE'}</span>
          </button>
        </div>
      </div>

      {/* Action Feedback Message */}
      {actionMessage && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Helpful Connection Notice when disconnected */}
      {!isConnected && !isDemoMode && (
        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-800 text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <span>
            ESP32 is not currently connected. Click <strong>CONNECT ESP32</strong> if paired, or click <strong>TRY DEMO MODE</strong> to preview live data immediately.
          </span>
        </div>
      )}

      {isDemoMode && (
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            <strong>Demo Mode Active:</strong> Generating realistic live cow vitals every 3 seconds for demonstration. You can test normal, mild fever, and mastitis alert conditions!
          </span>
        </div>
      )}
    </div>
  );
};

