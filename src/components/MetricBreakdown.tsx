import React from "react";
import { Activity, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import type { HealthAnalysis, HealthStatus } from "@/types/health";

interface MetricBreakdownProps {
  analysis: HealthAnalysis;
}

const statusBadgeConfig: Record<HealthStatus, { label: string; bg: string; text: string; border: string; icon: any }> = {
  good: {
    label: "Healthy",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  borderline: {
    label: "Borderline",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: AlertTriangle,
  },
  "at-risk": {
    label: "At Risk",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: AlertCircle,
  },
};

export const MetricBreakdown: React.FC<MetricBreakdownProps> = ({ analysis }) => {
  const metrics = analysis.metrics || [];

  // Find max value to scale bars nicely
  const maxValue = Math.max(...metrics.map((m) => m.value), 60);

  return (
    <div className="space-y-6">
      {/* Top Card: Metric Breakdown Bar Chart */}
      <div className="wellness-card p-6 sm:p-7">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-700" />
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Metric Breakdown</h2>
        </div>

        {/* Custom SVG Bar Chart Matching Screenshot 2 */}
        <div className="mt-6">
          <div className="h-56 w-full flex items-end justify-between gap-3 sm:gap-6 border-b border-l border-slate-200 px-4 pb-1">
            {metrics.map((m) => {
              const heightPct = Math.max(12, Math.min(100, (m.value / maxValue) * 100));
              const isGood = m.status === "good";
              const isBorderline = m.status === "borderline";
              const barColor = isGood ? "#15803d" : isBorderline ? "#ca8a04" : "#dc2626";

              return (
                <div key={m.name} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-mono font-semibold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {m.value}{m.unit}
                  </span>
                  <div
                    className="w-full max-w-[56px] rounded-t-md transition-all duration-500 ease-out hover:opacity-90 shadow-sm"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: barColor,
                    }}
                  />
                  <span className="text-[11px] font-medium text-slate-500 text-center truncate max-w-[64px] sm:max-w-none pt-2 -rotate-12 sm:rotate-0">
                    {m.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-600">
            <span className="h-3 w-3 bg-[#15803d] rounded-sm"></span>
            <span>Current Value</span>
          </div>
        </div>
      </div>

      {/* Grid of 5 Metric Cards (Screenshot 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m) => {
          const cfg = statusBadgeConfig[m.status] || statusBadgeConfig.good;
          const Icon = cfg.icon;

          return (
            <div key={m.name} className="wellness-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-slate-500">{m.name}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                  >
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">{m.value}</span>
                  {m.unit && <span className="text-xs font-medium text-slate-500">{m.unit}</span>}
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="text-[11px] text-slate-400">Healthy range: {m.healthyRange}</p>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{m.explanation}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
