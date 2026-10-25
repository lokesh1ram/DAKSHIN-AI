import React, { useState, useRef } from "react";
import { Camera, FileText, RotateCcw, Sparkles, Upload } from "lucide-react";
import type { Gender, HealthAnalysis, HealthReport } from "@/types/health";
import { analyzeReportImage, analyzeReportValues } from "@/lib/api";

interface ReportCaptureProps {
  initialAge: number;
  initialGender: Gender;
  onAnalysisComplete: (analysis: HealthAnalysis) => void;
}

export const ReportCapture: React.FC<ReportCaptureProps> = ({
  initialAge,
  initialGender,
  onAnalysisComplete,
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [age, setAge] = useState(initialAge || 30);
  const [gender, setGender] = useState<Gender>(initialGender || "female");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Manual entry states
  const [manualValues, setManualValues] = useState<HealthReport>({
    age: initialAge || 30,
    gender: initialGender || "female",
    weight: 65,
    bmi: 23.5,
    bodyFat: 25,
    muscleMass: 45,
    bodyWater: 55,
    visceralFat: 7,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      if (activeTab === "upload") {
        if (selectedFile) {
          const result = await analyzeReportImage(selectedFile, age, gender);
          onAnalysisComplete(result);
        } else {
          // If no image attached yet, analyze with default sample evaluation sheet
          const sampleBlob = new Blob(["sample"], { type: "image/jpeg" });
          const dummyFile = new File([sampleBlob], "evaluation-sheet.jpg", { type: "image/jpeg" });
          const result = await analyzeReportImage(dummyFile, age, gender);
          onAnalysisComplete(result);
        }
      } else {
        const result = await analyzeReportValues({
          ...manualValues,
          age,
          gender,
        });
        onAnalysisComplete(result);
      }
    } catch (e) {
      console.error("Analysis failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // Demo auto-load evaluation sheet if user clicks
  const loadDemoEvaluationSheet = () => {
    setPreviewUrl("https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800");
  };

  return (
    <div className="wellness-card p-6 sm:p-7">
      <h2 className="text-xl font-bold tracking-tight text-slate-900">Upload or Enter Your BMI Report</h2>
      <p className="mt-1 text-xs text-slate-500">Snap a photo of your report or type the values to get personalized insights.</p>

      {/* Segmented Tab Controls */}
      <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex items-center justify-center gap-2 rounded-lg py-2 transition-all ${
            activeTab === "upload" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
          }`}
        >
          <Camera className="h-4 w-4" /> Upload / Capture
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`flex items-center justify-center gap-2 rounded-lg py-2 transition-all ${
            activeTab === "manual" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
          }`}
        >
          <FileText className="h-4 w-4" /> Manual Entry
        </button>
      </div>

      {/* Age & Gender Row */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Tab 1: Upload / Capture */}
      {activeTab === "upload" && (
        <div className="mt-5 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />

          {previewUrl ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-2 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="BMI Report Preview"
                  className="max-h-64 rounded-xl object-contain shadow-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleClearImage}
                className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear image
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center transition-colors hover:border-emerald-500 hover:bg-emerald-50/30"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Upload className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-800">Click to upload or take a photo</p>
              <p className="mt-1 text-xs text-slate-500">Supports Nutrition Club sheets, InBody, Omron, Tanita reports (JPEG, PNG)</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  loadDemoEvaluationSheet();
                }}
                className="mt-3 text-[11px] font-semibold text-emerald-700 underline"
              >
                Load sample evaluation sheet
              </button>
            </div>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleAnalyze}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#15803D] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 disabled:opacity-70"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Analyzing Report..." : "Analyze My Report"}
          </button>
        </div>
      )}

      {/* Tab 2: Manual Entry */}
      {activeTab === "manual" && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Weight (kg)</label>
              <input
                type="number"
                value={manualValues.weight}
                onChange={(e) => setManualValues({ ...manualValues, weight: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">BMI</label>
              <input
                type="number"
                step="0.1"
                value={manualValues.bmi}
                onChange={(e) => setManualValues({ ...manualValues, bmi: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Body Fat (%)</label>
              <input
                type="number"
                step="0.1"
                value={manualValues.bodyFat}
                onChange={(e) => setManualValues({ ...manualValues, bodyFat: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Muscle Mass (kg)</label>
              <input
                type="number"
                step="0.1"
                value={manualValues.muscleMass}
                onChange={(e) => setManualValues({ ...manualValues, muscleMass: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Body Water (%)</label>
              <input
                type="number"
                step="0.1"
                value={manualValues.bodyWater}
                onChange={(e) => setManualValues({ ...manualValues, bodyWater: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Visceral Fat</label>
              <input
                type="number"
                value={manualValues.visceralFat}
                onChange={(e) => setManualValues({ ...manualValues, visceralFat: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleAnalyze}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#15803D] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 disabled:opacity-70"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Analyzing Values..." : "Analyze My Report"}
          </button>
        </div>
      )}
    </div>
  );
};
