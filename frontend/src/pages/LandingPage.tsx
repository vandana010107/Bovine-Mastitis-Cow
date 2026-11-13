import React from 'react';
import {
  Activity,
  Cpu,
  Brain,
  Dna,
  CloudSun,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import type { PageId } from '../components/Sidebar';

interface LandingPageProps {
  onNavigate: (page: PageId) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 border border-slate-800 p-8 md:p-12 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Academic Research Project • Indian Dairy Farms</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            AI-Based Predictive Modelling for Early Forecasting of Bovine Mastitis
          </h1>

          <p className="text-base text-slate-300 font-medium">
            IoT-enabled cattle health monitoring and early mastitis risk forecasting using multi-sensor physical telemetry.
          </p>

          <p className="text-xs text-slate-400 leading-relaxed">
            Integrating udder thermal differential monitoring, micro-activity kinematics, ambient microclimate tracking, and experimental physical measurements into an individualized cattle Digital Twin.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all cursor-pointer"
            >
              <span>View ESP32 Hardware Specs</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Core Pillars Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <span>System Architecture & Scientific Pillars</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1: Physical IoT Telemetry */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="p-3 w-fit rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">1. Physical IoT Telemetry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-frequency sensor acquisition with dual DS18B20 udder thermal probes, DHT22 ambient microclimate sensor, MPU6050 6-axis activity tracking, and experimental TDS readings transmitted via ESP32 Wi-Fi HTTP POST.
            </p>
          </div>

          {/* Pillar 2: Cow Digital Twin */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="p-3 w-fit rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Dna className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">2. Individualized Digital Twin</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maintains cow-specific personal baseline signatures. Continuously compares live sensor values against baseline patterns to identify subtle physiological deviations before clinical symptoms emerge.
            </p>
          </div>

          {/* Pillar 3: Predictive ML Forecasting */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">3. AI / ML Risk Forecasting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modular Python FastAPI machine learning engine designed to compute 24-hour and 48-hour sub-clinical mastitis risk probabilities without generating uncalibrated or artificial numbers.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Features List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CloudSun className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-200 text-sm">Environmental THI Monitoring</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time calculation of Temperature-Humidity Index (THI) to quantify thermal stress levels in Indian dairy cattle breeds (e.g. Sahiwal, Gir) across seasonal humidity spikes.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-200 text-sm">Farmer & Veterinary Decision Support</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Acts strictly as a clinical decision-support framework. Never issues automated antibiotic recommendations, promoting responsible antimicrobial stewardship in dairy management.
          </p>
        </div>
      </div>
    </div>
  );
};
