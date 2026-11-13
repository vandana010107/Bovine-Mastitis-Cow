import React, { useState } from 'react';
import {
  Cpu,
  Bluetooth,
  Copy,
  Check,
  Sparkles,
  Thermometer,
  Milk,
  Activity,
  CloudSun,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface SettingsPageProps {
  isSimulatedMode: boolean;
  onToggleSimulatedMode: (enable: boolean) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  isSimulatedMode,
  onToggleSimulatedMode
}) => {
  const [copied, setCopied] = useState(false);
  const [showTechnicalSpecs, setShowTechnicalSpecs] = useState(false);

  const handleCopyDeviceName = () => {
    navigator.clipboard.writeText('BOVINE_MASTITIS_ESP32');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header Banner */}
      <div className="clean-card p-6 border border-slate-200 bg-white rounded-2xl shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">
                ESP32 Hardware & Connection Settings
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 uppercase">
                Simple Guide
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Clear, step-by-step instructions to connect your ESP32 board and sensors.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: HOW TO CONNECT IN 3 EASY STEPS */}
      <div className="clean-card p-6 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Bluetooth className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              How to Connect Your ESP32 (3 Easy Steps)
            </h2>
            <p className="text-xs text-slate-500">
              Pair your ESP32 with your computer once over Bluetooth, then connect with one click.
            </p>
          </div>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-xs font-bold text-slate-800">Power On ESP32</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect your ESP32 board using a micro-USB cable or 5V power adapter. The red power light on the board will turn on.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="text-xs font-bold text-slate-800">Pair in Windows</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Open <strong>Windows Settings &gt; Bluetooth</strong>. Click <strong>Add Device</strong> and select:
            </p>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800">
              <span>BOVINE_MASTITIS_ESP32</span>
              <button
                onClick={handleCopyDeviceName}
                title="Copy Device Name"
                className="p-1 text-slate-500 hover:text-blue-600 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="text-xs font-bold text-slate-800">Click Connect</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              On the Dashboard, select your COM port and click <strong>CONNECT ESP32</strong>. Live cow health readings will begin streaming immediately!
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: SENSORS MADE SIMPLE (Visual Pinout Cards) */}
      <div className="clean-card p-6 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Sensors & Hardware Connections (Simple Overview)
          </h2>
          <p className="text-xs text-slate-500">
            Where each sensor connects on the ESP32 board and what health metric it measures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Sensor 1: Udder Temperature */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Udder Temperature Sensors</h3>
                  <span className="text-[10px] text-slate-500">DS18B20 Digital Probes</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold font-mono">
                Pin GPIO 4
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Waterproof digital probes measuring left and right udder skin temperature. Normal healthy range is <strong>38.0°C to 39.2°C</strong>.
            </p>
          </div>

          {/* Sensor 2: Milk Quality TDS */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                  <Milk className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Milk Quality Sensor (TDS)</h3>
                  <span className="text-[10px] text-slate-500">TDS Meter V1.0</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold font-mono">
                Pin GPIO 34
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Analog sensor submerged in fresh milk samples. Checks dissolved mineral electrolytes to detect early changes in milk composition.
            </p>
          </div>

          {/* Sensor 3: Movement Accelerometer */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Cattle Movement Collar</h3>
                  <span className="text-[10px] text-slate-500">MPU6050 Motion Sensor</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold font-mono">
                GPIO 21 & 22
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mounted on the cow's collar to track daily walking, resting, and chewing rumination. Lethargy is a key early sign of cattle sickness.
            </p>
          </div>

          {/* Sensor 4: Barn Climate */}
          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-100 rounded-xl text-teal-600">
                  <CloudSun className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Barn Climate Monitor</h3>
                  <span className="text-[10px] text-slate-500">DHT22 Digital Sensor</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 text-xs font-bold font-mono">
                Pin GPIO 15
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Monitors barn ambient temperature and relative humidity to alert farmers when heat stress weakens cattle immunity.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: DEMO & TESTING MODE (Ideal for Demonstrations) */}
      <div className="clean-card p-6 border border-purple-200 bg-purple-50/30 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Interactive Demo & Testing Mode
              </h2>
              <p className="text-xs text-slate-500">
                Preview live data and test fever/mastitis alert scenarios even when physical hardware is not plugged in.
              </p>
            </div>
          </div>

          <button
            onClick={() => onToggleSimulatedMode(!isSimulatedMode)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isSimulatedMode
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isSimulatedMode ? 'DEMO MODE ACTIVE (CLICK TO STOP)' : 'ENABLE DEMO MODE'}
          </button>
        </div>

        {isSimulatedMode && (
          <div className="p-3.5 rounded-xl bg-purple-100/70 border border-purple-200 text-purple-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              <strong>Demo Mode is ACTIVE:</strong> Simulated live cattle vitals are updating every 3 seconds on the Dashboard.
            </span>
          </div>
        )}
      </div>

      {/* SECTION 4: TECHNICAL SPECIFICATIONS (Collapsible Accordion) */}
      <div className="clean-card border border-slate-200 bg-white rounded-2xl shadow-xs overflow-hidden">
        <button
          onClick={() => setShowTechnicalSpecs(!showTechnicalSpecs)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Technical Hardware Specifications & Pinout Table
              </h3>
              <p className="text-[11px] text-slate-500">
                Click to expand detailed electrical specifications and pinout table
              </p>
            </div>
          </div>
          <div className="text-slate-400">
            {showTechnicalSpecs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showTechnicalSpecs && (
          <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/50">
            <div className="overflow-x-auto pt-4">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-white text-slate-500 uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Sensor Module</th>
                    <th className="p-2.5">ESP32 Pin</th>
                    <th className="p-2.5">Voltage</th>
                    <th className="p-2.5">Interface Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  <tr>
                    <td className="p-2.5 font-bold">DS18B20 Udder Probe #1</td>
                    <td className="p-2.5 text-blue-600">GPIO 4</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">1-Wire Digital (4.7kΩ pull-up)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">DS18B20 Udder Probe #2</td>
                    <td className="p-2.5 text-blue-600">GPIO 4</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">1-Wire Shared Bus</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">DHT22 Ambient Sensor</td>
                    <td className="p-2.5 text-blue-600">GPIO 15</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">Single-Bus Digital</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">MPU6050 Motion Unit</td>
                    <td className="p-2.5 text-blue-600">GPIO 21 (SDA), GPIO 22 (SCL)</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">I2C Standard Speed (0x68)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">TDS Meter V1.0 Probe</td>
                    <td className="p-2.5 text-blue-600">GPIO 34</td>
                    <td className="p-2.5">5.0V</td>
                    <td className="p-2.5 font-sans">Analog ADC (0 - 3.3V)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
