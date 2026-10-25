import React from "react";
import { History, RefreshCw, Trash2, FileText } from "lucide-react";
import type { HealthAnalysis } from "@/types/health";

interface ReportHistoryProps {
  history: HealthAnalysis[];
  onRefresh: () => void;
  onSelect: (analysis: HealthAnalysis) => void;
  onDelete: (id: string) => void;
}

export const ReportHistory: React.FC<ReportHistoryProps> = ({
  history,
  onRefresh,
  onSelect,
  onDelete,
}) => {
  return (
    <div className="wellness-card p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-emerald-700" />
          <h2 className="text-lg font-bold tracking-tight text-slate-900">My Report History</h2>
        </div>
        <button
          onClick={onRefresh}
          title="Refresh history"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500">Only you can see the reports saved to your account.</p>

      <div className="mt-5 space-y-3">
        {history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
            No report history saved yet. Complete an analysis to see your past reports here.
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-300 transition-colors flex gap-4 items-start"
            >
              {/* Thumbnail */}
              <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="Thumbnail" className="h-full w-full object-cover" />
                ) : (
                  <FileText className="h-6 w-6 text-slate-400" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">{item.timestamp}</span>
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                      {item.overallStatus}
                    </span>
                  </div>
                  <button
                    onClick={() => item.id && onDelete(item.id)}
                    title="Delete report"
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>

                <button
                  onClick={() => onSelect(item)}
                  className="mt-2 text-xs font-semibold text-emerald-700 hover:underline"
                >
                  View this analysis
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
