import React, { useState, useEffect } from 'react';
import { AlertTriangle, Stethoscope, Clock, Info } from 'lucide-react';
import { api } from '../services/api';
import type { MlPredictionData } from '../services/api';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

interface AlertsPageProps {
  selectedCowId: string;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ selectedCowId }) => {
  const [mlData, setMlData] = useState<MlPredictionData | null>(null);

  useEffect(() => {
    api.getMlPrediction(selectedCowId)
      .then((data) => setMlData(data))
      .catch((err) => console.error('Alerts API error:', err));
  }, [selectedCowId]);

  const isModelUnavailable = mlData?.model_status === 'model_unavailable';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
        <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100">Cattle Health Early Warning Panel</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated decision-support alerts derived from calibrated ML inference models.
          </p>
        </div>
      </div>

      <ScientificDisclaimer type="ml" />

      {/* Main Alert Card */}
      <div className="glass-card p-6 rounded-2xl border-rose-500/30 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active System Alert Level
            </span>
            <div className="flex items-center gap-3">
              <span className={`text-xl font-extrabold px-4 py-1.5 rounded-xl border ${
                isModelUnavailable
                  ? 'bg-slate-900 border-slate-700 text-slate-400'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              }`}>
                {mlData?.alert_level || 'Risk unavailable — ML model not connected'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Time Generated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Contributing Features */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
            Key Contributing Telemetry Features
          </h3>

          {isModelUnavailable ? (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Feature attribution disabled while ML model is not connected.</span>
            </div>
          ) : (
            <ul className="space-y-2">
              {mlData?.contributing_features.map((feat, i) => (
                <li key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 flex items-center gap-2 font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Veterinary Action Recommendation */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
            <Stethoscope className="w-4 h-4" />
            <span>Veterinary Recommendation</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {mlData?.recommendation || 'Maintain standard veterinary monitoring protocols. Consult a qualified veterinarian if physical symptoms of mastitis (udder swelling, localized heat, milk discoloration) are observed.'}
          </p>
          <p className="text-[11px] text-rose-300/80 italic pt-1 border-t border-slate-800/80">
            <strong>Antimicrobial Stewardship Notice:</strong> This system does not prescribe or recommend antibiotics automatically. Any therapeutic intervention must be ordered by a licensed veterinarian following clinical assessment.
          </p>
        </div>
      </div>
    </div>
  );
};
