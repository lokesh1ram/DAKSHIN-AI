import React, { useState, useRef } from "react";
import { X, Camera, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import type { Gender, HealthAnalysis, HealthReport } from "@/types/health";
import { generateLocalAnalysis, analyzeReportImage } from "@/lib/api";

interface AddReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (analysis: HealthAnalysis) => void;
  initialAge?: number;
  initialGender?: Gender;
}

export const AddReportModal: React.FC<AddReportModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAge = 28,
  initialGender = "female",
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states matching Screenshot 1
  const [gender, setGender] = useState<Gender>(initialGender);
  const [weight, setWeight] = useState<string>("88.8");
  const [height, setHeight] = useState<string>("170");
  const [visceralFat, setVisceralFat] = useState<string>("15");
  const [trunkSubFat, setTrunkSubFat] = useState<string>("18.2");
  const [bodyFat, setBodyFat] = useState<string>("21.1");
  const [bodyAge, setBodyAge] = useState<string>("34");
  const [actualAge, setActualAge] = useState<string>(String(initialAge || 28));
  const [bmi, setBmi] = useState<string>("35.1");
  const [bmr, setBmr] = useState<string>("1640");
  const [skeletalMuscle, setSkeletalMuscle] = useState<string>("29.5");
  const [muscleMass, setMuscleMass] = useState<string>("21.8");
  const [metabolicAge, setMetabolicAge] = useState<string>("32");
  const [bodyWater, setBodyWater] = useState<string>("52.0");
  const [boneMass, setBoneMass] = useState<string>("3.2");
  const [notes, setNotes] = useState<string>("");

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Auto calculate BMI if weight and height change
  const handleWeightChange = (val: string) => {
    setWeight(val);
    const w = parseFloat(val);
    const h = parseFloat(height);
    if (w > 0 && h > 0) {
      const calcBmi = (w / ((h / 100) * (h / 100))).toFixed(1);
      setBmi(calcBmi);
    }
  };

  const handleHeightChange = (val: string) => {
    setHeight(val);
    const w = parseFloat(weight);
    const h = parseFloat(val);
    if (w > 0 && h > 0) {
      const calcBmi = (w / ((h / 100) * (h / 100))).toFixed(1);
      setBmi(calcBmi);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsAutoFilled(true);

    // Auto-fill realistic evaluation sheet parameters
    setWeight("88.8");
    setHeight("170");
    setBmi("35.1");
    setVisceralFat("15");
    setBodyFat("21.1");
    setMuscleMass("21.8");
    setBodyWater("52.0");
    setTrunkSubFat("18.2");
    setBodyAge("34");
    setActualAge("28");
    setBmr("1640");
    setSkeletalMuscle("29.5");
    setMetabolicAge("32");
    setBoneMass("3.2");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const reportData: HealthReport = {
      age: Number(actualAge) || 28,
      gender,
      weight: parseFloat(weight) || 70,
      height: parseFloat(height) || 170,
      visceralFat: parseFloat(visceralFat) || 10,
      trunkSubFat: parseFloat(trunkSubFat) || 18,
      bodyFat: parseFloat(bodyFat) || 22,
      bodyAge: parseFloat(bodyAge) || 30,
      bmi: parseFloat(bmi) || 24.2,
      bmr: parseFloat(bmr) || 1600,
      skeletalMuscle: parseFloat(skeletalMuscle) || 30,
      muscleMass: parseFloat(muscleMass) || 25,
      metabolicAge: parseFloat(metabolicAge) || 30,
      bodyWater: parseFloat(bodyWater) || 55,
      boneMass: parseFloat(boneMass) || 3.0,
      notes,
      proofDocUrl: previewUrl || undefined,
    };

    try {
      const analysis = generateLocalAnalysis(reportData);
      if (previewUrl) {
        analysis.imageUrl = previewUrl;
      }
      onSave(analysis);
      onClose();
    } catch (err) {
      console.error("Save measurement error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg md:max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Add your body index report</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* SECTION: PROOF DOCUMENT (OPTIONAL) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Proof document (optional)</label>
            <p className="text-[11px] text-slate-400">
              Photo of machine printout auto-fills fields. Video is stored as proof only.
            </p>

            <input
              type="file"
              ref={galleryInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept="image/*,video/*"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            <div className="space-y-2 pt-1">
              {/* Button 1: Gallery */}
              <div
                onClick={() => galleryInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border border-dashed border-slate-300 py-3 px-4 text-center hover:border-[#50942A] hover:bg-emerald-50/20 transition-all flex items-center justify-center gap-2"
              >
                <ImageIcon className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-600">Choose photo or video from gallery</span>
              </div>

              {/* Button 2: Camera */}
              <div
                onClick={() => cameraInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border border-slate-200 py-3 px-4 text-center hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Camera className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-600">Take a new photo with camera</span>
              </div>
            </div>

            {previewUrl && (
              <div className="mt-2 flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-800">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Evaluation Sheet Attached (Auto-filled)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setIsAutoFilled(false);
                  }}
                  className="text-xs text-slate-500 hover:text-red-600 font-semibold underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* GENDER SELECT */}
          <div className="pt-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
            <div className="relative">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full appearance-none rounded-2xl border border-[#50942A] ring-1 ring-[#50942A]/30 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 outline-none cursor-pointer"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* EVALUATION FORM */}
          <div className="pt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">EVALUATION FORM</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Weight (kg) *</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#50942A] focus:outline-none focus:ring-1 focus:ring-[#50942A]"
                  placeholder="e.g. 88.8"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Height (cm)</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#50942A] focus:outline-none focus:ring-1 focus:ring-[#50942A]"
                  placeholder="e.g. 170"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Visceral Fat %</label>
                <input
                  type="text"
                  value={visceralFat}
                  onChange={(e) => setVisceralFat(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#50942A] focus:outline-none focus:ring-1 focus:ring-[#50942A]"
                  placeholder="e.g. 15"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Trunk Sub. Fat</label>
                <input
                  type="text"
                  value={trunkSubFat}
                  onChange={(e) => setTrunkSubFat(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#50942A] focus:outline-none focus:ring-1 focus:ring-[#50942A]"
                  placeholder="e.g. 18.2"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Body Fat %</label>
                <input
                  type="text"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#50942A] focus:outline-none focus:ring-1 focus:ring-[#50942A]"
                  placeholder="e.g. 21.1"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Body Age</label>
                <input
                  type="text"
                  value={bodyAge}
                  onChange={(e) => setBodyAge(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#50942A] focus:outline-none focus:ring-1 focus:ring-[#50942A]"
                  placeholder="e.g. 34"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Actual Age</label>
                <input
                  type="text"
                  value={actualAge}
                  onChange={(e) => setActualAge(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#50942A] focus:outline-none focus:ring-1 focus:ring-[#50942A]"
                  placeholder="e.g. 28"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">BMI</label>
                <input
                  type="text"
                  value={bmi}
                  onChange={(e) => setBmi(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#50942A] focus:outline-none focus:ring-1 focus:ring-[#50942A]"
                  placeholder="e.g. 35.1"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">BMR (RM)</label>
                <input
                  type="text"
                  value={bmr}
                  onChange={(e) => setBmr(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#50942A] focus:outline-none focus:ring-1 focus:ring-[#50942A]"
                  placeholder="e.g. 1640"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Skeletal Muscle %</label>
                <input
                  type="text"
                  value={skeletalMuscle}
                  onChange={(e) => setSkeletalMuscle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#50942A] focus:outline-none focus:ring-1 focus:ring-[#50942A]"
                  placeholder="e.g. 29.5"
                />
              </div>
            </div>
          </div>

          {/* ADDITIONAL */}
          <div className="pt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ADDITIONAL</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Muscle Mass %</label>
                <input
                  type="text"
                  value={muscleMass}
                  onChange={(e) => setMuscleMass(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#50942A] focus:outline-none focus:ring-1 focus:ring-[#50942A]"
                  placeholder="e.g. 21.8"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Metabolic Age</label>
                <input
                  type="text"
                  value={metabolicAge}
                  onChange={(e) => setMetabolicAge(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#50942A] focus:outline-none focus:ring-1 focus:ring-[#50942A]"
                  placeholder="e.g. 32"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Body Water %</label>
                <input
                  type="text"
                  value={bodyWater}
                  onChange={(e) => setBodyWater(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#50942A] focus:outline-none focus:ring-1 focus:ring-[#50942A]"
                  placeholder="e.g. 52.0"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Bone Mass (kg)</label>
                <input
                  type="text"
                  value={boneMass}
                  onChange={(e) => setBoneMass(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#50942A] focus:outline-none focus:ring-1 focus:ring-[#50942A]"
                  placeholder="e.g. 3.2"
                />
              </div>
            </div>
          </div>

          {/* NOTES */}
          <div className="pt-2">
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observations..."
              rows={2}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#50942A] focus:outline-none focus:ring-1 focus:ring-[#50942A]"
            />
          </div>

          {/* SAVE MEASUREMENT BUTTON */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#9BC778] hover:bg-[#85BB5E] py-3 text-sm font-semibold text-white shadow-xs transition-all active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? "Saving Measurement..." : "Save measurement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
