import React from "react";
import { ScanLine, Activity, Mic } from "lucide-react";

interface LandingPageProps {
  onNavigate: (page: "landing" | "auth" | "dashboard") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: ScanLine,
      title: "Scan your report",
      text: "Upload or capture your BMI report and we read the values for you.",
    },
    {
      icon: Activity,
      title: "Clear health signals",
      text: "Green, yellow and red indicators with easy-to-read charts.",
    },
    {
      icon: Mic,
      title: "Talk to Dakshin",
      text: "Ask about diet, exercise, sleep and water in English, Telugu, Hindi or Tamil.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">ActiveLife Wellness</span>
          </div>

          <button
            onClick={() => onNavigate("auth")}
            className="rounded-lg bg-[#15803D] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
          >
            Log in
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="mx-auto max-w-6xl px-4 py-16 sm:py-24 flex-1">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl leading-[1.15]">
            Your personal wellness <br /> assistant
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Turn your BMI and body composition report into simple, personalized guidance — and talk it through with
            Dakshin, your multilingual voice assistant.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate("auth")}
              className="rounded-lg bg-[#15803D] px-7 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
            >
              Get started
            </button>
            <button
              onClick={() => onNavigate("auth")}
              className="rounded-lg border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
            >
              I already have an account
            </button>
          </div>
        </section>

        {/* 3 Features */}
        <section className="mt-20 grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <f.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-base font-bold text-slate-900">{f.title}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200/60 bg-white/50 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-xs text-slate-500">
            ActiveLife Wellness Assistant AI is for informational purposes only and does not replace professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
};
