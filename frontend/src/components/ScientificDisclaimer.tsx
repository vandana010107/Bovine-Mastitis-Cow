import React from 'react';
import { AlertCircle, Info, Beaker } from 'lucide-react';

interface DisclaimerProps {
  type: 'tds' | 'thi' | 'ml' | 'general';
}

export const ScientificDisclaimer: React.FC<DisclaimerProps> = ({ type }) => {
  if (type === 'tds') {
    return (
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3 my-3">
        <Beaker className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300 block mb-0.5 uppercase tracking-wide">
            Experimental TDS Prototype Disclaimer
          </span>
          <p className="text-[11px] text-amber-200/90 leading-relaxed">
            The TDS (Total Dissolved Solids) sensor is an exploratory hardware addition and is <strong>NOT</strong> a validated measurement of milk electrical conductivity or somatic cell count. Do not interpret TDS values alone as a diagnosis of bovine mastitis.
          </p>
        </div>
      </div>
    );
  }

  if (type === 'thi') {
    return (
      <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs flex items-start gap-3 my-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-cyan-300 block mb-0.5 uppercase tracking-wide">
            Environmental THI Disclaimer
          </span>
          <p className="text-[11px] text-cyan-200/90 leading-relaxed">
            Temperature-Humidity Index (THI) is calculated from ambient temperature and relative humidity to quantify cattle thermal comfort and heat stress. THI is an environmental stressor and does not directly indicate mastitis infection.
          </p>
        </div>
      </div>
    );
  }

  if (type === 'ml') {
    return (
      <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs flex items-start gap-3 my-3">
        <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-purple-300 block mb-0.5 uppercase tracking-wide">
            Scientific Decision-Support & ML Model Notice
          </span>
          <p className="text-[11px] text-purple-200/90 leading-relaxed">
            This dashboard serves as an early-warning decision-support tool for farmers and veterinarians. Automated risk scores are active only when a validated Machine Learning model is connected. This system does not issue autonomous veterinary diagnoses or prescribe antibiotic therapies.
          </p>
        </div>
      </div>
    );
  }

  return null;
};
