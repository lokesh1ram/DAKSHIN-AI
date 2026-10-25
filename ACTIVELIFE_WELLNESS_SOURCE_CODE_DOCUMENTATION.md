# ActiveLife Wellness Assistant AI
## Comprehensive Source Code & Technical Architecture Documentation

---

### Executive Summary

**ActiveLife Wellness Assistant AI** is an intelligent anthropometric health platform that enables individuals and clinical wellness centers to record, evaluate, and track multi-biomarker body index reports. The platform features **Dakshin AI**, an interactive voice robot assistant inspired by modern smart conversational agents (**Amazon Alexa, Google Assistant, "OK Google", and Gemini**). 

Dakshin provides spoken report briefings and voice-interactive consultation in three languages—**English, Telugu (`తెలుగు`), and Hindi (`हिन्दी`)**—with dedicated guidance on five lifestyle habits: **Daily Step Count, Food & Nutrition Habits, Water Intake, Good Sleep & Recovery, and Visceral Fat Reduction**.

---

### System Architecture Diagram

```
+-------------------------------------------------------------------------+
|                  ActiveLife Wellness Frontend (React 18)                |
|                                                                         |
|  +--------------------+   +-------------------+   +------------------+  |
|  |   AddReportModal   |   |   DashboardPage   |   |   DakshinRobot   |  |
|  | (14 Biomarkers)    |   | (Overview/History)|   | (Alexa/Google AI)|  |
|  +---------+----------+   +---------+---------+   +--------+---------+  |
+------------|------------------------|----------------------|------------+
             |                        |                      |
             v                        v                      v
+-------------------------------------------------------------------------+
|                    Express REST API Backend (Port 5000)                 |
|                                                                         |
|  /api/analyze-report         /api/analyze-values         /api/chat      |
|  (Gemini Vision OCR)         (Anthropometric Rules)     (Dakshin NLP)   |
+-------------------------------------------------------------------------+
             |                                               |
             v                                               v
+------------------------------------+    +-------------------------------+
|      Google Gemini 2.5 Flash       |    |      Web Speech Synthesis     |
|   Multimodal Evaluation & Vision   |    |    English, Telugu & Hindi    |
+------------------------------------+    +-------------------------------+
```

---

### Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & UI Design System** | TailwindCSS, Lucide-React Icons, Glassmorphism, Micro-equalizer animations |
| **AI Vision & NLP Engine** | Google Gemini 2.5 Flash (`@google/genai`), Multilingual NLP |
| **Speech & Audio** | Browser native Web Speech API (TTS & STT), Native Web Audio API (`AudioContext` oscillators) |
| **Document Generation** | `jspdf` (Vectorized clinical health evaluation sheets) |
| **Backend API** | Node.js, Express.js, Multer (Memory Storage), CORS, Dotenv |
| **Database & Auth** | Supabase PostgreSQL + Supabase Auth (with offline LocalStorage fallback) |

---

### Core Source Code Modules

---

#### 1. `src/components/DakshinRobot.tsx`
*The primary interactive Voice Assistant Robot component. Implements Alexa/Google style conversational briefings, animated mouth equalizer, dynamic robot avatar eyes, resilient Web Speech API speech synthesis with Chrome keep-alive, STT listening loops, minimize-to-floating widget mode, and 5 dedicated habit handlers.*

```tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Power,
  RotateCcw,
  Footprints,
  Utensils,
  Droplets,
  Moon,
  TrendingDown,
  Bot,
  User,
  Minimize2,
  Maximize2,
} from "lucide-react";
import type { HealthAnalysis, UserProfile } from "@/types/health";
import { sendDakshinMessage } from "@/lib/api";
import { playWakeChime, playSleepChime } from "@/lib/dakshinAudio";

export type DakshinLanguage = "en" | "te" | "hi";

export const DAKSHIN_LANGUAGES: { id: DakshinLanguage; label: string; native: string; flag: string }[] = [
  { id: "en", label: "English", native: "English", flag: "🇬🇧" },
  { id: "te", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { id: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
];

interface DakshinRobotProps {
  analysis: HealthAnalysis | null;
  user?: UserProfile | null;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  language: DakshinLanguage;
  onLanguageChange: (lang: DakshinLanguage) => void;
}

interface RobotMessage {
  id: string;
  role: "robot" | "user";
  text: string;
  timestamp: string;
  topic?: string;
}

export const DakshinRobot: React.FC<DakshinRobotProps> = ({
  analysis,
  user,
  isOpen,
  onToggle,
  language,
  onLanguageChange,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<RobotMessage[]>([]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [mouthEqualizer, setMouthEqualizer] = useState<number[]>([40, 70, 50, 90, 60]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState("");

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const keepAliveIntervalRef = useRef<any>(null);

  // Load and cache browser speech synthesis voices
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setAvailableVoices(v);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Animate mouth equalizer while Dakshin is speaking
  useEffect(() => {
    let interval: any;
    if (isSpeaking) {
      interval = setInterval(() => {
        setMouthEqualizer([
          Math.floor(Math.random() * 60) + 30,
          Math.floor(Math.random() * 80) + 20,
          Math.floor(Math.random() * 70) + 30,
          Math.floor(Math.random() * 90) + 20,
          Math.floor(Math.random() * 60) + 40,
        ]);
      }, 90);
    } else {
      setMouthEqualizer([20, 20, 20, 20, 20]);
    }
    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Keep-alive loop to prevent Chrome's 15-second speech silence timeout
  useEffect(() => {
    if (isSpeaking) {
      keepAliveIntervalRef.current = setInterval(() => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 5000);
    } else {
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
        keepAliveIntervalRef.current = null;
      }
    }
    return () => {
      if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);
    };
  }, [isSpeaking]);

  // Voice lookup with phonetic fallback for Windows OS
  const getVoiceInfo = useCallback(
    (lang: DakshinLanguage): { voice: SpeechSynthesisVoice | null; hasNativeVoice: boolean } => {
      if (!availableVoices.length) return { voice: null, hasNativeVoice: false };

      if (lang === "te") {
        const teVoice = availableVoices.find(
          (v) =>
            v.lang.toLowerCase().startsWith("te") ||
            v.name.toLowerCase().includes("telugu") ||
            v.name.toLowerCase().includes("mohan")
        );
        if (teVoice) return { voice: teVoice, hasNativeVoice: true };
      }

      if (lang === "hi") {
        const hiVoice = availableVoices.find(
          (v) =>
            v.lang.toLowerCase().startsWith("hi") ||
            v.name.toLowerCase().includes("hindi") ||
            v.name.toLowerCase().includes("madhur") ||
            v.name.toLowerCase().includes("swara") ||
            v.name.toLowerCase().includes("google हिन्दी")
        );
        if (hiVoice) return { voice: hiVoice, hasNativeVoice: true };
      }

      const inEnVoice = availableVoices.find(
        (v) =>
          v.lang.toLowerCase().startsWith("en-in") ||
          v.name.toLowerCase().includes("india") ||
          v.name.toLowerCase().includes("ravi")
      );
      if (inEnVoice) return { voice: inEnVoice, hasNativeVoice: true };

      const naturalVoice = availableVoices.find(
        (v) =>
          (v.lang.startsWith("en") || v.lang.startsWith("en-US")) &&
          (v.name.toLowerCase().includes("natural") ||
            v.name.toLowerCase().includes("google") ||
            v.name.toLowerCase().includes("david") ||
            v.name.toLowerCase().includes("zira"))
      );
      if (naturalVoice) return { voice: naturalVoice, hasNativeVoice: true };

      return { voice: availableVoices[0] || null, hasNativeVoice: false };
    },
    [availableVoices]
  );

  // Core Speech Synthesis execution
  const speakRobotVoice = useCallback(
    (displayText: string, phoneticFallbackText: string | undefined, langToUse: DakshinLanguage, onDone?: () => void) => {
      if (!soundEnabled || !("speechSynthesis" in window)) {
        if (onDone) onDone();
        return;
      }

      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();

        const { voice, hasNativeVoice } = getVoiceInfo(langToUse);
        let spokenString = displayText;
        if ((langToUse === "te" || langToUse === "hi") && !hasNativeVoice && phoneticFallbackText) {
          spokenString = phoneticFallbackText;
        }

        setLastSpokenText(displayText);
        const utterance = new SpeechSynthesisUtterance(spokenString);
        activeUtteranceRef.current = utterance;

        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = langToUse === "te" ? "te-IN" : langToUse === "hi" ? "hi-IN" : "en-US";
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.05;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          activeUtteranceRef.current = null;
          if (onDone) onDone();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          activeUtteranceRef.current = null;
          if (onDone) onDone();
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        setIsSpeaking(false);
        if (onDone) onDone();
      }
    },
    [soundEnabled, getVoiceInfo]
  );

  // Initial Report Briefing (Short & Crisp like Alexa/Google)
  const getInitialReportBriefing = useCallback(
    (lang: DakshinLanguage): { display: string; phonetic: string } => {
      const name = user?.fullName ? user.fullName.split(" ")[0] : "Friend";
      const bmi = analysis?.raw?.bmi ?? 35.1;
      const visceral = analysis?.raw?.visceralFat ?? 15;
      const dateStr = analysis?.timestamp ? `from ${analysis.timestamp}` : "today";

      if (lang === "te") {
        return {
          display: `నమస్కారం ${name}! నేను దక్షిణ్‌ని, మీ AI హెల్త్ రోబోట్‌ని! మీ BMI రిపోర్ట్ (${dateStr}): మీ BMI ${bmi} మరియు విసెరల్ ఫ్యాట్ ${visceral} గా ఉంది. మీ ఆరోగ్యం కోసం 4 ముఖ్యమైన అలవాట్లు: 1. రోజూ 8,000 నుండి 10,000 అడుగులు నడవండి. 2. తీపి, వేపుళ్ళు తగ్గించి ఆకుకూరలు, ప్రొటీన్ ఆహారం తీసుకోండి. 3. రోజూ 3.5 లీటర్ల మంచినీరు త్రాగండి. 4. రాత్రి 10:30 కల్లా 7 నుండి 8 గంటలు నిద్రపోండి. మీ సందేహాలు నన్ను అడగండి!`,
          phonetic: `Namaskaram ${name}! Nenu Dakshin-ni, mee AI health robot-ni! Mee BMI report ${dateStr}: Mee BMI ${bmi} mariyu Visceral fat ${visceral} gaa undhi. Mee aarogyam kosam 4 mukhyamaina alavaatlu: 1. Rojoo 8,000 nundi 10,000 adugulu nadavandi. 2. Theepi, vepudlu thagginchi aakukooralu, protein aahaaram theesukondi. 3. Rojoo 3.5 leetarla manchineeru thaagandi. 4. Raathri 10:30 kalla 7 nundi 8 gantalu nidrapondi. Mee sandehaalu nannu adagandi!`,
        };
      }

      if (lang === "hi") {
        return {
          display: `नमस्ते ${name}! मैं दक्षिण हूँ, आपका AI हेल्थ रोबोट! आपकी BMI रिपोर्ट (${dateStr}): आपका BMI ${bmi} और विसरल फैट ${visceral} है। अपने स्वास्थ्य के लिए 4 आदतें तुरंत अपनाएं: 1. रोजाना 8,000 से 10,000 कदम जरूर चलें। 2. चीनी और तला-भुना छोड़कर हरी सब्जियां व प्रोटीन खाएं। 3. दिनभर में 3.5 लीटर पानी पिएं। 4. रात 10:30 तक 7-8 घंटे की गहरी नींद लें। डाइट या फिटनेस का कोई भी सवाल पूछें!`,
          phonetic: `Namaste ${name}! Main Dakshin hoon, aapka AI health robot! Aapki BMI report ${dateStr}: Aapka BMI ${bmi} aur visceral fat ${visceral} hai. Apne swaasthya ke liye 4 aadatein turant apnayein: 1. Rozana 8,000 se 10,000 kadam zaroor chalein. 2. Cheeni aur tala-bhuna chhodkar hari sabziyan va protein khayein. 3. Dinbhar mein 3.5 liter paani piyein. 4. Raat 10:30 tak 7-8 ghante ki gehri neend lein. Diet ya fitness ka koi bhi sawaal poochein!`,
        };
      }

      const text = `Hello ${name}! I am Dakshin, your AI health robot. I reviewed your BMI report (${dateStr})! Your BMI is ${bmi} and visceral fat is ${visceral}. Here are the 4 key habits to adopt: 1. Walk 8,000 to 10,000 daily steps. 2. Eat 25 to 30 grams of protein with greens and cut refined sugar. 3. Drink 3.5 liters of clean water daily. 4. Sleep 7 to 8 hours by 10:30 PM. Ask me any doubts about your report!`;
      return { display: text, phonetic: text };
    },
    [analysis, user]
  );

  // ON / OFF Lifecycle Management
  useEffect(() => {
    if (!isOpen) {
      playSleepChime();
      window.speechSynthesis?.cancel();
      stopListening();
      setIsSpeaking(false);
      return;
    }

    playWakeChime();
    const briefing = getInitialReportBriefing(language);
    setMessages([
      {
        id: "greeting-" + Date.now(),
        role: "robot",
        text: briefing.display,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    speakRobotVoice(briefing.display, briefing.phonetic, language, () => {
      setTimeout(() => startListening(), 500);
    });

    return () => {
      window.speechSynthesis?.cancel();
      stopListening();
    };
  }, [isOpen, analysis?.id, language, getInitialReportBriefing, speakRobotVoice]);

  // Handle User Doubt & 5 Critical Habits
  const handleUserDoubt = async (queryText: string, specificTopic?: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || loading) return;
    stopListening();

    setMessages((prev) => [
      ...prev,
      {
        id: "user-" + Date.now(),
        role: "user",
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInputText("");
    setLoading(true);

    const reportContext = analysis
      ? `BMI: ${analysis.raw?.bmi}, Visceral Fat: ${analysis.raw?.visceralFat}, Body Fat: ${analysis.raw?.bodyFat}%, Muscle: ${analysis.raw?.muscleMass}kg, Water: ${analysis.raw?.bodyWater}%`
      : undefined;

    const answerDisplay = await sendDakshinMessage(trimmed, language, reportContext);
    setMessages((prev) => [
      ...prev,
      {
        id: "robot-" + Date.now(),
        role: "robot",
        text: answerDisplay,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setLoading(false);

    speakRobotVoice(answerDisplay, answerDisplay, language, () => {
      if (isOpen) setTimeout(() => startListening(), 600);
    });
  };

  return <div>{/* Full Dialog & Minimized Floating Speaker */}</div>;
};
```

---

#### 2. `src/components/AddReportModal.tsx`
*The exact 14-biomarker evaluation form modal matching Screenshot 1. Includes camera and gallery file upload for proof documents, real-time BMI auto-calculation, and form validation.*

```tsx
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
  const [loading, setLoading] = useState(false);

  // 14 Biomarker Form States
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

  if (!isOpen) return null;

  // Real-time automatic BMI recalculation
  const handleWeightChange = (val: string) => {
    setWeight(val);
    const w = parseFloat(val);
    const h = parseFloat(height);
    if (w > 0 && h > 0) setBmi((w / ((h / 100) * (h / 100))).toFixed(1));
  };

  const handleHeightChange = (val: string) => {
    setHeight(val);
    const w = parseFloat(weight);
    const h = parseFloat(val);
    if (w > 0 && h > 0) setBmi((w / ((h / 100) * (h / 100))).toFixed(1));
  };

  const handleSave = () => {
    setLoading(true);
    const reportData: HealthReport = {
      age: parseInt(actualAge) || 28,
      gender,
      weight: parseFloat(weight) || 88.8,
      height: parseFloat(height) || 170,
      visceralFat: parseFloat(visceralFat) || 15,
      trunkSubFat: parseFloat(trunkSubFat) || 18.2,
      bodyFat: parseFloat(bodyFat) || 21.1,
      bodyAge: parseInt(bodyAge) || 34,
      bmi: parseFloat(bmi) || 35.1,
      bmr: parseInt(bmr) || 1640,
      skeletalMuscle: parseFloat(skeletalMuscle) || 29.5,
      muscleMass: parseFloat(muscleMass) || 21.8,
      metabolicAge: parseInt(metabolicAge) || 32,
      bodyWater: parseFloat(bodyWater) || 52.0,
      boneMass: parseFloat(boneMass) || 3.2,
      notes,
      proofDocUrl: previewUrl || undefined,
    };

    const analysis = generateLocalAnalysis(reportData);
    if (previewUrl) analysis.imageUrl = previewUrl;

    onSave(analysis);
    setLoading(false);
    onClose();
  };

  return <div>{/* Form Grid & #9BC778 Save measurement button */}</div>;
};
```

---

#### 3. `src/pages/DashboardPage.tsx`
*The primary workspace orchestrator matching Screenshot 2. Includes Overview & Attachments tabs, Add a body index report card, Your body index overview card, AI health report card with language pills, and Measurement History with dedicated Dakshin ON/OFF buttons on every report.*

```tsx
import React, { useState, useEffect } from "react";
import { Scale, Sparkles, Plus, Paperclip, FileDown, Bot, Power, Activity, Trash2, Eye } from "lucide-react";
import type { HealthAnalysis, UserProfile } from "@/types/health";
import { reportHistoryService } from "@/lib/supabase";
import { AddReportModal } from "@/components/AddReportModal";
import { DakshinRobot, type DakshinLanguage } from "@/components/DakshinRobot";
import { generateHealthReportPDF } from "@/lib/pdfExport";

export const DashboardPage: React.FC<{ user: UserProfile | null; onNavigate: any }> = ({ user, onNavigate }) => {
  const [activeNavTab, setActiveNavTab] = useState<"overview" | "attachments">("overview");
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [history, setHistory] = useState<HealthAnalysis[]>([]);
  const [isDakshinOpen, setIsDakshinOpen] = useState(false);
  const [dakshinLanguage, setDakshinLanguage] = useState<DakshinLanguage>("en");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await reportHistoryService.getHistory();
    setHistory(data);
    if (data.length > 0 && !analysis) setAnalysis(data[0]);
  };

  return (
    <div className="min-h-screen bg-[#F7F9F6]">
      {/* 1. Header with Dakshin AI Ready / ON status */}
      {/* 2. Overview & Attachments Navigation Bar */}
      {/* 3. Add a Body Index Report Card */}
      {/* 4. Your Body Index Overview Card */}
      {/* 5. AI Health Report Card with Language Pills & Download PDF */}
      {/* 6. Measurement History with dedicated Dakshin ON/OFF button on EVERY report */}
      {history.map((item) => {
        const isThisReportActive = isDakshinOpen && analysis?.id === item.id;
        return (
          <div key={item.id} className="report-card">
            {isThisReportActive ? (
              <button onClick={() => setIsDakshinOpen(false)} className="bg-rose-600 text-white animate-pulse">
                <Power className="h-3.5 w-3.5" /> Turn OFF Dakshin
              </button>
            ) : (
              <button
                onClick={() => {
                  setAnalysis(item);
                  setIsDakshinOpen(true);
                }}
                className="bg-[#50942A] text-white"
              >
                <Bot className="h-3.5 w-3.5" /> Dakshin AI: ON
              </button>
            )}
          </div>
        );
      })}

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
```

---

#### 4. `server/geminiService.js`
*The server-side multimodal AI engine. Implements Google Gemini 2.5 Flash for image OCR evaluation extraction and multilingual habit reasoning.*

```javascript
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function chatWithDakshin(message, language = "en", reportContext = "") {
  if (ai) {
    try {
      const prompt = `You are Dakshin, a smart, warm, and highly trained AI health robot for ActiveLife Wellness (like Alexa, Google Assistant, or Gemini).
Language requested: ${language}.
Current report context: ${reportContext}.
User question: ${message}

Rules:
1. Talk directly, warmly, and concisely in 2 to 4 crisp sentences.
2. Directly answer lifestyle habit changes: Daily Step Count (8,000-10,000), Food Habits (fiber first, 25-30g protein, no sugar), Water Intake (3.5-4L, 500ml warm water upon waking), and Good Sleep (7-8 hours by 10:30 PM to suppress cortisol and visceral fat).
3. Provide response strictly in ${language}.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      if (response && response.text) return response.text.trim();
    } catch (e) {
      console.warn("Gemini API call failed, falling back to rule engine:", e);
    }
  }

  // Fallback Rule Engine with detailed multilingual habit knowledge
  return generateFallbackReply(message, language, reportContext);
}
```

---

#### 5. `src/lib/pdfExport.ts`
*Clinical-grade vectorized PDF generator using `jspdf`. Outputs customer metadata, biomarker classification tables, positive markers, risk areas, and a structured 4-pillar lifestyle prescription.*

```typescript
import { jsPDF } from "jspdf";
import type { HealthAnalysis, UserProfile } from "@/types/health";

export function generateHealthReportPDF(analysis: HealthAnalysis, user?: UserProfile | null): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Clinical Header Banner
  doc.setFillColor(80, 148, 42); // ActiveLife Green #50942A
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ActiveLife Wellness · Body Composition Analysis", 14, 18);

  // 2. Patient & Report Metadata Grid
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.text(`Patient: ${user?.fullName || "Valued Client"}`, 14, 38);
  doc.text(`Evaluation Date: ${analysis.timestamp || "Today"}`, 120, 38);

  // 3. Biomarker Classification Table
  let y = 60;
  analysis.metrics.forEach((m) => {
    doc.text(`${m.name}: ${m.value} ${m.unit} (Ideal: ${m.healthyRange || "N/A"})`, 14, y);
    y += 8;
  });

  // 4. Clinical Recommendations & Dakshin Consultation Notes
  y += 10;
  doc.text("Prescribed Habit Protocol:", 14, y);
  analysis.recommendations.forEach((rec) => {
    y += 6;
    doc.text(`• ${rec}`, 18, y);
  });

  doc.save(`ActiveLife_Report_${(user?.fullName || "Client").replace(/\s+/g, "_")}.pdf`);
}
```

---

#### 6. `src/lib/dakshinAudio.ts`
*Synthesizes modern two-tone smart-speaker wake and sleep chimes using the browser's native Web Audio API.*

```typescript
export function playWakeChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Pleasant two-tone chime: 587Hz (D5) -> 880Hz (A5)
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch (err) {}
}

export function playSleepChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Gentle power-down chime: 660Hz -> 440Hz
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.exponentialRampToValueAtTime(440.0, now + 0.18);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch (err) {}
}
```

---

### Biomarker Reference & Mathematical Formulas

1. **Body Mass Index (BMI)**:
   $$BMI = \frac{\text{Weight in kg}}{(\text{Height in meters})^2}$$
   - **Underweight**: $< 18.5$
   - **Normal Weight**: $18.5 - 24.9$
   - **Overweight**: $25.0 - 29.9$
   - **Obesity Class I**: $30.0 - 34.9$
   - **Obesity Class II**: $\ge 35.0$

2. **Visceral Fat Level**:
   - **Optimal / Safe**: Level $1 - 9$ (Low subcutaneous & intra-abdominal organ stress)
   - **Borderline**: Level $10 - 14$ (Requires dietary intervention)
   - **High Risk**: Level $\ge 15$ (Elevated risk of cardiovascular disease, fatty liver, and insulin resistance)

3. **Body Water Percentage**:
   - **Male Ideal Range**: $50\% - 65\%$
   - **Female Ideal Range**: $45\% - 60\%$

4. **Basal Metabolic Rate (BMR)** (Harris-Benedict revised):
   - **Men**: $BMR = 88.362 + (13.397 \times \text{weight}) + (4.799 \times \text{height}) - (5.677 \times \text{age})$
   - **Women**: $BMR = 447.593 + (9.247 \times \text{weight}) + (3.098 \times \text{height}) - (4.330 \times \text{age})$

---

### REST API Reference

| Endpoint | Method | Payload / Form-Data | Description |
| :--- | :--- | :--- | :--- |
| `/api/analyze-report` | `POST` | `multipart/form-data`: `image`, `age`, `gender` | Performs OCR via Gemini 2.5 Flash on uploaded evaluation sheet and computes diagnostics. |
| `/api/analyze-values` | `POST` | `application/json`: `HealthReport` object | Computes positive indicators, risk areas, and lifestyle prescriptions from manual inputs. |
| `/api/chat` | `POST` | `application/json`: `{ message, language, reportContext }` | Queries Dakshin AI for conversational guidance in English, Telugu, or Hindi. |
| `/api/health` | `GET` | None | Returns backend status, API version, and service configurations. |

---

### Build & Run Instructions

```bash
# 1. Install dependencies
npm install

# 2. Build production assets
npm run build

# 3. Start full-stack application (Server & Frontend on http://localhost:5000)
node server/index.js
```
