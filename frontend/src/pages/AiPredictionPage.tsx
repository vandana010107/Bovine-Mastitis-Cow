import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle2, FileCode, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import type { MlPredictionData } from '../services/api';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

interface AiPredictionPageProps {
  selectedCowId: string;
}

export const AiPredictionPage: React.FC<AiPredictionPageProps> = ({ selectedCowId }) => {
  const [mlData, setMlData] = useState<MlPredictionData | null>(null);

  useEffect(() => {
    api.getMlPrediction(selectedCowId)
      .then((data) => setMlData(data))
      .catch((err) => console.error('ML Prediction API error:', err));
  }, [selectedCowId]);

  const isModelUnavailable = mlData?.model_status === 'model_unavailable';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">AI / ML Predictive Forecasting Engine</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Machine Learning sub-clinical mastitis early forecasting (24-hour & 48-hour forward horizon).
            </p>
          </div>
        </div>
      </div>

      <ScientificDisclaimer type="ml" />

      {/* Model Status Banner */}
      {isModelUnavailable ? (
        <div className="glass-card p-6 rounded-2xl border-purple-500/30 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="font-bold text-sm text-purple-300 uppercase tracking-wide flex items-center gap-2">
                <span>ML Model Not Connected</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono">
                  {mlData?.model_name || 'No Binary'}
                </span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                No trained machine learning model binary is loaded in <code>backend/ml_service.py</code>. In strict compliance with scientific research standards, uncalibrated or simulated AI prediction percentages are <strong>NEVER</strong> displayed.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Trained ML Model Connected: {mlData?.model_name}</span>
        </div>
      )}

      {/* Risk Output Cards Grid (Current, 24h, 48h) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Current Risk */}
        <div className="glass-card p-6 rounded-2xl space-y-3 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Current Mastitis Risk
          </span>
          <div className="my-2 py-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className={`text-xl font-extrabold ${isModelUnavailable ? 'text-slate-500' : 'text-emerald-400'}`}>
              {mlData?.current_risk || 'Model unavailable'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">Real-time evaluation window</span>
        </div>

        {/* 24-Hour Forecast */}
        <div className="glass-card p-6 rounded-2xl space-y-3 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            24-Hour Mastitis Forecast
          </span>
          <div className="my-2 py-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className={`text-xl font-extrabold ${isModelUnavailable ? 'text-slate-500' : 'text-amber-400'}`}>
              {mlData?.risk_24h || 'Model unavailable'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">+24 hours forward projection</span>
        </div>

        {/* 48-Hour Forecast */}
        <div className="glass-card p-6 rounded-2xl space-y-3 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            48-Hour Mastitis Forecast
          </span>
          <div className="my-2 py-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className={`text-xl font-extrabold ${isModelUnavailable ? 'text-slate-500' : 'text-orange-400'}`}>
              {mlData?.risk_48h || 'Model unavailable'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">+48 hours forward projection</span>
        </div>
      </div>

      {/* Technical Integration Guide for Researchers */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
          <FileCode className="w-4 h-4 text-purple-400" />
          <span>How to Connect Your Trained ML Model</span>
        </h3>

        <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
          <p>
            The backend architecture is structured around <code>backend/ml_service.py</code>. Once you complete dataset collection and train your classification model (e.g., XGBoost, Random Forest, or LightGBM):
          </p>

          <ol className="list-decimal list-inside space-y-2 text-slate-400 bg-slate-950/80 p-4 rounded-xl border border-slate-800 font-mono text-[11px]">
            <li>Save your trained model binary: <code>joblib.dump(model, "backend/models/bovine_mastitis_xgboost.pkl")</code></li>
            <li>In <code>backend/ml_service.py</code>, load the model inside <code>is_model_connected()</code></li>
            <li>Feed the sensor feature dictionary (Udder Temp 1 & 2, THI, Activity, Experimental TDS, and Digital Twin deviations) into your model's <code>predict_proba()</code> method.</li>
            <li>Restart the FastAPI server. The dashboard will automatically update from "Model unavailable" to live inference predictions!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
