import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface PositivesNegativesProps {
  positives: string[];
  negatives: string[];
}

export const PositivesNegatives: React.FC<PositivesNegativesProps> = ({ positives, negatives }) => {
  return (
    <div className="wellness-card p-6 sm:p-7">
      <h2 className="text-lg font-bold tracking-tight text-slate-900">Health Assessment Analysis</h2>
      <p className="mt-1 text-xs text-slate-500">Key positive observations and areas requiring attention from your report.</p>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Positives */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wide">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Positive Indicators ({positives.length})
          </div>
          <ul className="mt-3 space-y-2">
            {positives.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Negatives / Areas to Monitor */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            Areas to Improve ({negatives.length})
          </div>
          <ul className="mt-3 space-y-2">
            {negatives.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
