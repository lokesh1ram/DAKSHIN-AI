import React, { useState, useEffect } from "react";
import {
  Scale,
  Sparkles,
  Calendar,
  Plus,
  Paperclip,
  FileDown,
  Bot,
  Radio,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Trash2,
  FileText,
  Volume2,
  Power,
  Eye,
} from "lucide-react";
import type { HealthAnalysis, UserProfile } from "@/types/health";
import { authService, reportHistoryService } from "@/lib/supabase";
import { AddReportModal } from "@/components/AddReportModal";
import { MetricBreakdown } from "@/components/MetricBreakdown";
import { PositivesNegatives } from "@/components/PositivesNegatives";
import { PersonalizedRecommendations } from "@/components/PersonalizedRecommendations";
import { DakshinRobot, type DakshinLanguage, DAKSHIN_LANGUAGES } from "@/components/DakshinRobot";
import { generateHealthReportPDF } from "@/lib/pdfExport";

interface DashboardPageProps {
  user: UserProfile | null;
  onNavigate: (page: "landing" | "auth" | "dashboard") => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onNavigate }) => {
  const [activeNavTab, setActiveNavTab] = useState<"overview" | "attachments">("overview");
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [history, setHistory] = useState<HealthAnalysis[]>([]);
  const [isDakshinOpen, setIsDakshinOpen] = useState(false);
  const [dakshinLanguage, setDakshinLanguage] = useState<DakshinLanguage>("en");
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    let data = await reportHistoryService.getHistory();
    // If user has no historical reports yet, initialize with the baseline evaluation sheet from Screenshot 1 & 2
    if (data.length === 0) {
      const baselineReport: HealthAnalysis = {
        id: "baseline-report-1",
        timestamp: "Today, 10:30 AM",
        summary:
          "Comprehensive Body Composition Assessment indicates Class II Obesity (BMI 35.1) and elevated Visceral Fat (15). Priority lifestyle adjustments: Daily 8,000-10,000 steps, high-protein fiber-rich nutrition, 3.5L hydration, and 7-8 hours restful sleep.",
        overallStatus: "at-risk",
        metrics: [
          { name: "BMI", value: 35.1, unit: "", status: "at-risk", healthyRange: "18.5 - 24.9", explanation: "Class II obesity range; prioritize daily brisk walking and fiber." },
          { name: "Weight", value: 88.8, unit: "kg", status: "at-risk", healthyRange: "55 - 68 kg", explanation: "Target weight management with calorie awareness." },
          { name: "Visceral Fat", value: 15, unit: "level", status: "at-risk", healthyRange: "< 9", explanation: "Elevated abdominal organ fat; requires aerobic cardio & low sugar." },
          { name: "Body Fat", value: 21.1, unit: "%", status: "borderline", healthyRange: "18 - 28%", explanation: "Borderline range for female profile; manageable with diet." },
          { name: "Muscle Mass", value: 21.8, unit: "kg", status: "good", healthyRange: "> 20 kg", explanation: "Healthy skeletal muscle supporting basal metabolism." },
          { name: "Body Water", value: 52.0, unit: "%", status: "good", healthyRange: "50 - 65%", explanation: "Optimal cellular hydration percentage." },
        ],
        positives: [
          "Healthy skeletal muscle mass (21.8 kg) supporting basal metabolic activity",
          "Hydration percentage (52.0%) is within the optimal cellular threshold",
        ],
        negatives: [
          "Visceral fat level (15) significantly exceeds the safe cardiovascular threshold of 9",
          "BMI of 35.1 and body weight of 88.8 kg require structured physical & dietary protocol",
        ],
        recommendations: [
          "Target 8,000 to 10,000 daily steps with 30-min morning walk & 20-min post-dinner stroll",
          "Eat 25-30g protein with fresh greens per meal; eliminate refined white sugar & deep-fried foods",
          "Drink 3.5 to 4.0 liters of water daily, starting with 500ml warm water upon waking",
          "Sleep 7 to 8 hours by 10:30 PM to suppress evening cortisol and reduce visceral fat storage",
        ],
        raw: {
          age: 28,
          gender: "female",
          weight: 88.8,
          height: 170,
          visceralFat: 15,
          trunkSubFat: 18.2,
          bodyFat: 21.1,
          bodyAge: 34,
          bmi: 35.1,
          bmr: 1640,
          skeletalMuscle: 29.5,
          muscleMass: 21.8,
          metabolicAge: 32,
          bodyWater: 52.0,
          boneMass: 3.2,
        },
      };
      await reportHistoryService.saveReport(baselineReport);
      data = [baselineReport];
    }

    setHistory(data);
    if (data.length > 0 && !analysis) {
      setAnalysis(data[0]);
    }
  };

  const handleSaveReport = async (newAnalysis: HealthAnalysis) => {
    setAnalysis(newAnalysis);
    await reportHistoryService.saveReport(newAnalysis);
    await loadHistory();
  };

  const handleDeleteHistory = async (id: string) => {
    await reportHistoryService.deleteReport(id);
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    if (analysis?.id === id) {
      setAnalysis(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleSignOut = async () => {
    if (isDakshinOpen) {
      window.speechSynthesis?.cancel();
    }
    await authService.signOut();
    onNavigate("landing");
  };

  const handleDownloadPDF = () => {
    if (!analysis) return;
    setPdfGenerating(true);
    try {
      generateHealthReportPDF(analysis, user);
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setTimeout(() => setPdfGenerating(false), 800);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F6] text-slate-800 flex flex-col justify-between font-sans">
      {/* APP HEADER */}
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF5E6] text-[#4A8527] shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">ActiveLife Wellness</h1>
              <p className="text-[11px] text-slate-500">
                {user?.fullName ? `Customer: ${user.fullName}` : "Body Index Dashboard"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Header Dakshin AI Power Button */}
            <button
              onClick={() => setIsDakshinOpen(!isDakshinOpen)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isDakshinOpen
                  ? "bg-rose-50 border border-rose-300 text-rose-700"
                  : "bg-[#EBF5E6] border border-[#50942A]/30 text-[#4A8527] hover:bg-[#DEF0D7]"
              }`}
            >
              {isDakshinOpen ? (
                <>
                  <Power className="h-3.5 w-3.5 text-rose-600" />
                  <span>Dakshin AI: ON</span>
                </>
              ) : (
                <>
                  <Bot className="h-3.5 w-3.5 text-[#4A8527]" />
                  <span>Dakshin AI: Ready</span>
                </>
              )}
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-6 flex-1 space-y-5">
        {/* TOP NAVIGATION BAR (SCREENSHOT 2: OVERVIEW & ATTACHMENTS TABS) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 flex items-center gap-2 shadow-xs">
          <button
            onClick={() => setActiveNavTab("overview")}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeNavTab === "overview"
                ? "bg-[#50942A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveNavTab("attachments")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeNavTab === "attachments"
                ? "bg-[#50942A] text-white shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Paperclip className="h-3.5 w-3.5" />
            Attachments
          </button>
        </div>

        {activeNavTab === "overview" && (
          <div className="space-y-5">
            {/* CARD 1: ADD A BODY INDEX REPORT (EXACT SCREENSHOT 2) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Add a body index report</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your measurements or upload a sheet to attach it to your history.
                </p>
              </div>

              <button
                type="button"
                id="add-report-btn"
                onClick={() => setIsAddReportOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#50942A] hover:bg-[#437A23] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all active:scale-95 shrink-0"
              >
                <Plus className="h-4 w-4" />
                Add report
              </button>
            </div>

            {/* CARD 2: YOUR BODY INDEX OVERVIEW (EXACT SCREENSHOT 2) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
              {!analysis ? (
                /* Empty state matching Screenshot 2 */
                <div className="py-12 px-4 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF5E6] text-[#50942A] shadow-xs">
                    <Scale className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">Your body index overview</h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Your reports, whether added by you or your center, will appear here with your progress and measurements.
                  </p>
                  <button
                    onClick={() => setIsAddReportOpen(true)}
                    className="mt-4 text-xs font-semibold text-[#50942A] hover:underline"
                  >
                    Click "+ Add report" above to record your first measurements
                  </button>
                </div>
              ) : (
                /* Populated state: Comprehensive Anthropometric Overview */
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EBF5E6] text-[#50942A] shadow-xs shrink-0">
                        <Scale className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Your body index overview</h3>
                        <p className="text-xs text-slate-500">
                          Recorded on {analysis.timestamp || "Today"} · Status:{" "}
                          <span className="font-semibold capitalize text-emerald-800">{analysis.overallStatus}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          analysis.overallStatus === "good"
                            ? "bg-emerald-100 text-emerald-800"
                            : analysis.overallStatus === "borderline"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {analysis.overallStatus === "good" ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        )}
                        {analysis.overallStatus}
                      </span>
                    </div>
                  </div>

                  {/* KEY METRICS GRID MATCHING EVALUATION SHEET */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[#F7F9F6] border border-slate-200/70">
                      <span className="text-[11px] font-semibold text-slate-500">Weight</span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-900">{analysis.raw?.weight || 88.8}</span>
                        <span className="text-[10px] text-slate-500">kg</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F7F9F6] border border-slate-200/70">
                      <span className="text-[11px] font-semibold text-slate-500">BMI</span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-900">{analysis.raw?.bmi || 35.1}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F7F9F6] border border-slate-200/70">
                      <span className="text-[11px] font-semibold text-slate-500">Visceral Fat</span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-900">{analysis.raw?.visceralFat || 15}</span>
                        <span className="text-[10px] text-slate-500">&lt; 9</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F7F9F6] border border-slate-200/70">
                      <span className="text-[11px] font-semibold text-slate-500">Body Fat %</span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-900">{analysis.raw?.bodyFat || 21.1}</span>
                        <span className="text-[10px] text-slate-500">%</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F7F9F6] border border-slate-200/70">
                      <span className="text-[11px] font-semibold text-slate-500">Muscle Mass</span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-900">{analysis.raw?.muscleMass || 21.8}</span>
                        <span className="text-[10px] text-slate-500">kg</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F7F9F6] border border-slate-200/70">
                      <span className="text-[11px] font-semibold text-slate-500">Body Water</span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-900">{analysis.raw?.bodyWater || 52.0}</span>
                        <span className="text-[10px] text-slate-500">%</span>
                      </div>
                    </div>
                  </div>

                  {/* VISUAL BREAKDOWN & POSITIVES / NEGATIVES */}
                  <MetricBreakdown analysis={analysis} />
                  <PositivesNegatives positives={analysis.positives} negatives={analysis.negatives} />
                  <PersonalizedRecommendations recommendations={analysis.recommendations} />
                </div>
              )}
            </div>

            {/* CARD 3: AI HEALTH REPORT (EXACT SCREENSHOT 2 WITH EN, తె, హి & DAKSHIN AI BESIDE DOWNLOAD PDF) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left side */}
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EBF5E6] text-[#50942A] shadow-xs shrink-0">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">AI health report</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {analysis
                        ? "Clinical analysis ready. Download report or talk with Dakshin AI in English, Telugu, or Hindi."
                        : "Add your first report to generate an explanation of your body composition."}
                    </p>
                  </div>
                </div>

                {/* Right side: Language Pill Switcher + Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* LANGUAGE SWITCHER PILLS (EN, తె, హి AS SHOWN IN SCREENSHOT 2) */}
                  <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setDakshinLanguage("en")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        dakshinLanguage === "en"
                          ? "bg-[#50942A] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => setDakshinLanguage("te")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        dakshinLanguage === "te"
                          ? "bg-[#50942A] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      తె
                    </button>
                    <button
                      type="button"
                      onClick={() => setDakshinLanguage("hi")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        dakshinLanguage === "hi"
                          ? "bg-[#50942A] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      हि
                    </button>
                  </div>

                  {/* ACTION BUTTONS: DOWNLOAD PDF + DAKSHIN AI RIGHT BESIDE IT */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* BUTTON 1: DOWNLOAD PDF */}
                    <button
                      type="button"
                      id="download-pdf-btn"
                      onClick={handleDownloadPDF}
                      disabled={pdfGenerating || !analysis}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 shadow-xs transition-all active:scale-95 disabled:opacity-50"
                    >
                      <FileDown className="h-3.5 w-3.5 text-emerald-700" />
                      {pdfGenerating ? "Generating..." : "Download PDF"}
                    </button>

                    {/* BUTTON 2: DAKSHIN AI SPEAKER BESIDE DOWNLOAD PDF (WITH CLEAR ON / OFF TOGGLE) */}
                    <button
                      type="button"
                      id="dakshin-ai-btn"
                      onClick={() => setIsDakshinOpen(!isDakshinOpen)}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-all active:scale-95 ${
                        isDakshinOpen
                          ? "bg-rose-600 text-white hover:bg-rose-700"
                          : "bg-[#50942A] hover:bg-[#437A23] text-white"
                      }`}
                    >
                      {isDakshinOpen ? (
                        <>
                          <Power className="h-4 w-4" />
                          <span>Turn OFF Dakshin</span>
                        </>
                      ) : (
                        <>
                          <Bot className="h-4 w-4" />
                          <span>Dakshin AI: ON</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Spoken Briefing Banner when report exists */}
              {analysis && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-[#50942A]" />
                    <span>Dakshin Voice:</span>
                    <span className="font-bold text-slate-900">
                      {DAKSHIN_LANGUAGES.find((l) => l.id === dakshinLanguage)?.native} (
                      {DAKSHIN_LANGUAGES.find((l) => l.id === dakshinLanguage)?.label})
                    </span>
                  </div>
                  <button
                    onClick={() => setIsDakshinOpen(true)}
                    className="text-xs font-semibold text-[#50942A] hover:underline flex items-center gap-1"
                  >
                    Click to hear Dakshin talk about your report &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* CARD 4: MEASUREMENT HISTORY (WITH DEDICATED DAKSHIN AI ON/OFF BUTTON ON EVERY REPORT) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Measurement history</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your reports listed from newest to oldest. Click Dakshin AI on any report to talk about it!
                  </p>
                </div>
                <span className="text-xs font-bold text-[#50942A] bg-[#EBF5E6] px-2.5 py-1 rounded-lg">
                  {history.length} {history.length === 1 ? "Report" : "Reports"}
                </span>
              </div>

              {history.length === 0 ? (
                /* Empty state matching Screenshot 2 */
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 py-10 px-4 text-center">
                  <Calendar className="mx-auto h-6 w-6 text-slate-400" />
                  <p className="mt-2 text-xs font-semibold text-slate-700">No reports yet</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Add a report above to start your measurement history.
                  </p>
                </div>
              ) : (
                /* List of historical reports with dedicated Dakshin ON/OFF button on each */
                <div className="mt-4 space-y-3">
                  {history.map((item) => {
                    const isThisReportActive = isDakshinOpen && analysis?.id === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-4 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          analysis?.id === item.id
                            ? "border-[#50942A] bg-emerald-50/20"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-[#EBF5E6] text-[#50942A] flex items-center justify-center shrink-0">
                            <Activity className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">{item.timestamp}</span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  item.overallStatus === "good"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : item.overallStatus === "borderline"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {item.overallStatus}
                              </span>
                              {analysis?.id === item.id && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                                  Current View
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              BMI: <span className="font-semibold text-slate-700">{item.raw?.bmi}</span> · Visceral:{" "}
                              <span className="font-semibold text-slate-700">{item.raw?.visceralFat}</span> · Fat:{" "}
                              <span className="font-semibold text-slate-700">{item.raw?.bodyFat}%</span> · Water:{" "}
                              <span className="font-semibold text-slate-700">{item.raw?.bodyWater || 52}%</span>
                            </p>
                          </div>
                        </div>

                        {/* ACTIONS: DAKSHIN AI ON/OFF BUTTON FOR THIS SPECIFIC REPORT + VIEW + DELETE */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {/* DEDICATED DAKSHIN ON/OFF BUTTON FOR THIS REPORT */}
                          {isThisReportActive ? (
                            <button
                              type="button"
                              onClick={() => setIsDakshinOpen(false)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all"
                              title="Turn OFF Dakshin AI for this report"
                            >
                              <Power className="h-3.5 w-3.5" />
                              <span>Turn OFF Dakshin</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setAnalysis(item);
                                setIsDakshinOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#50942A] hover:bg-[#437A23] text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                              title="Turn ON Dakshin AI to talk about this report"
                            >
                              <Bot className="h-3.5 w-3.5" />
                              <span>Dakshin AI: ON</span>
                            </button>
                          )}

                          {/* VIEW REPORT BUTTON */}
                          <button
                            type="button"
                            onClick={() => setAnalysis(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#50942A] hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            type="button"
                            onClick={() => item.id && handleDeleteHistory(item.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete measurement"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ATTACHMENTS TAB VIEW */}
        {activeNavTab === "attachments" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Attached Proof Documents & Sheets</h2>
            <p className="text-xs text-slate-500">
              Photos and evaluation sheets attached to your measurements for clinical record-keeping.
            </p>

            {analysis?.imageUrl ? (
              <div className="rounded-2xl border border-slate-200 overflow-hidden max-w-md p-2 bg-slate-50">
                <img
                  src={analysis.imageUrl}
                  alt="Proof document"
                  className="rounded-xl w-full max-h-72 object-contain bg-white"
                />
                <p className="mt-2 text-xs font-semibold text-slate-700 px-2">
                  Attached to report ({analysis.timestamp || "Latest"})
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 py-10 px-4 text-center">
                <FileText className="mx-auto h-6 w-6 text-slate-400" />
                <p className="mt-2 text-xs font-semibold text-slate-700">No attachments found</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Upload an evaluation sheet photo when adding a report to see it here.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-200/60 bg-white/70 py-6">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs text-slate-500 max-w-md">
            ActiveLife Wellness Assistant AI is for informational purposes only and does not replace professional medical advice.
          </p>

          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            <a
              href="/ACTIVELIFE_WELLNESS_SOURCE_CODE_DOCUMENTATION.md"
              download="ACTIVELIFE_WELLNESS_SOURCE_CODE_DOCUMENTATION.md"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
              title="Download Source Code Documentation in Markdown format"
            >
              <FileDown className="h-3.5 w-3.5 text-emerald-600" />
              <span>Download Source Code Doc (.md)</span>
            </a>

            <a
              href="/source_code_documentation.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-2xs transition-colors"
              title="View formatted documentation and print to PDF"
            >
              <FileText className="h-3.5 w-3.5 text-emerald-400" />
              <span>View & Print PDF Doc</span>
            </a>
          </div>
        </div>
      </footer>

      {/* MODAL 1: ADD YOUR BODY INDEX REPORT (EXACT SCREENSHOT 1) */}
      <AddReportModal
        isOpen={isAddReportOpen}
        onClose={() => setIsAddReportOpen(false)}
        onSave={handleSaveReport}
        initialAge={user?.age || 28}
        initialGender={user?.gender || "female"}
      />

      {/* DAKSHIN AI ROBOT (ALEXA / GOOGLE / GEMINI TRAINED SMART SPEAKER ROBOT) */}
      <DakshinRobot
        isOpen={isDakshinOpen}
        onToggle={setIsDakshinOpen}
        analysis={analysis}
        user={user}
        language={dakshinLanguage}
        onLanguageChange={setDakshinLanguage}
      />
    </div>
  );
};
