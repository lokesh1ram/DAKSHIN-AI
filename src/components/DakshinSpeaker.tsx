import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  X,
  Languages,
  Sparkles,
  Radio,
  Square,
  MessageSquare,
  Activity,
  CheckCircle2,
  AlertTriangle,
  User,
} from "lucide-react";
import type { HealthAnalysis, UserProfile } from "@/types/health";
import { sendDakshinMessage } from "@/lib/api";

export type DakshinLanguage = "en" | "te" | "hi";

export const DAKSHIN_LANGUAGES: { id: DakshinLanguage; label: string; native: string; flag: string }[] = [
  { id: "en", label: "English", native: "English", flag: "🇬🇧" },
  { id: "te", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { id: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
];

interface DakshinSpeakerProps {
  analysis: HealthAnalysis | null;
  user?: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  language: DakshinLanguage;
  onLanguageChange: (lang: DakshinLanguage) => void;
}

interface SpeakerMessage {
  id: string;
  role: "dakshin" | "user";
  text: string;
  timestamp: string;
}

export const DakshinSpeaker: React.FC<DakshinSpeakerProps> = ({
  analysis,
  user,
  isOpen,
  onClose,
  language,
  onLanguageChange,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<SpeakerMessage[]>([]);
  const [activeSpeechText, setActiveSpeechText] = useState("");
  const [micSupported, setMicSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSpokenInitialRef = useRef(false);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeSpeechText, loading]);

  // Trained Female Voice Selection
  const getBestVoice = useCallback((lang: DakshinLanguage): SpeechSynthesisVoice | null => {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    if (lang === "te") {
      const teVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith("te") &&
          (v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("swara") ||
            v.name.toLowerCase().includes("geeta"))
      ) || voices.find((v) => v.lang.toLowerCase().startsWith("te"));
      if (teVoice) return teVoice;
    }

    if (lang === "hi") {
      const hiVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith("hi") &&
          (v.name.toLowerCase().includes("swara") ||
            v.name.toLowerCase().includes("kalpana") ||
            v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("google हिन्दी"))
      ) || voices.find((v) => v.lang.toLowerCase().startsWith("hi"));
      if (hiVoice) return hiVoice;
    }

    // English India Female (Heera, Neerja, Priya)
    const inEnFemale = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("en-in") &&
        (v.name.toLowerCase().includes("heera") ||
          v.name.toLowerCase().includes("neerja") ||
          v.name.toLowerCase().includes("female"))
    );
    if (inEnFemale) return inEnFemale;

    // English Natural Female (Zira, Aria, Jenny, Samantha)
    const preferredEn = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("en") &&
        (v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("aria") ||
          v.name.toLowerCase().includes("jenny") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("karen") ||
          v.name.toLowerCase().includes("female"))
    );
    if (preferredEn) return preferredEn;

    return voices.find((v) => v.lang.startsWith("en")) || voices[0];
  }, []);

  // Web Speech Synthesis Execution
  const speakVoice = useCallback(
    (textToSpeak: string, langToUse: DakshinLanguage, onFinishCallback?: () => void) => {
      if (!soundEnabled || !("speechSynthesis" in window)) {
        if (onFinishCallback) onFinishCallback();
        return;
      }

      window.speechSynthesis.cancel();
      setActiveSpeechText(textToSpeak);

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const voice = getBestVoice(langToUse);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = langToUse === "te" ? "te-IN" : langToUse === "hi" ? "hi-IN" : "en-US";
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.18; // Female voice pitch calibration

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setActiveSpeechText("");
        if (onFinishCallback) {
          onFinishCallback();
        }
      };

      utterance.onerror = (e) => {
        console.warn("Speech error:", e);
        setIsSpeaking(false);
        setActiveSpeechText("");
        if (onFinishCallback) {
          onFinishCallback();
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [soundEnabled, getBestVoice]
  );

  // Generate the detailed report introduction speech in the chosen language
  const generateDetailedReportSpeech = useCallback(
    (lang: DakshinLanguage) => {
      const customerName = user?.fullName ? user.fullName.split(" ")[0] : "Customer";
      const bmi = analysis?.raw?.bmi ?? 35.1;
      const bodyFat = analysis?.raw?.bodyFat ?? 21.1;
      const muscle = analysis?.raw?.muscleMass ?? 21.8;
      const water = analysis?.raw?.bodyWater ?? 52.0;
      const visceral = analysis?.raw?.visceralFat ?? 15;
      const overall = analysis?.overallStatus || "at-risk";

      if (lang === "te") {
        return `నమస్కారం ${customerName}! నేను దక్షిణ్‌ని, మీ AI హెల్త్ స్పీకర్‌ని. మీ BMI మరియు బాడీ కంపోజిషన్ రిపోర్ట్‌ను విశ్లేషించాను. మీ బాడీ మాస్ ఇండెక్స్ ${bmi} గా ఉంది, ఇది సాధారణ స్థాయి కంటే ఎక్కువ. మీ విసెరల్ ఫ్యాట్ లెవెల్ ${visceral} గా ఉంది, ఇది సాధారణంగా 9 లోపు ఉండాలి. మీ శరీరంలో నీటి శాతం ${water}% మరియు బాడీ ఫ్యాట్ ${bodyFat}%. మీ ఆరోగ్యం వేగంగా మెరుగుపడటానికి రోజూ 30 నిమిషాల వాకింగ్ చేయడం, పంచదార తగ్గించడం మరియు 3 నుండి 4 లీటర్ల మంచినీరు త్రాగడం ప్రారంభించండి. మీ డైట్ లేదా వ్యాయామం గురించి ఏ సందేహం ఉన్నా నన్ను అడగండి, నేను మాట్లాడుతాను!`;
      }

      if (lang === "hi") {
        return `नमस्ते ${customerName}! मैं दक्षिण हूँ, आपका AI हेल्थ स्पीकर। मैंने आपकी BMI रिपोर्ट का विस्तार से विश्लेषण किया है। आपका BMI ${bmi} है, जो सामान्य स्तर से अधिक है। आपका विसरल फैट स्तर ${visceral} है, जिसे 9 से कम होना चाहिए, और बॉडी वाटर ${water}% है। अपने स्वास्थ्य को बेहतर बनाने के लिए रोजाना 30 मिनट तेज चलें, भोजन में प्रोटीन और फाइबर शामिल करें, और पर्याप्त पानी पिएं। आपको अपनी डाइट या एक्सरसाइज के बारे में कुछ भी पूछना हो, तो मुझसे सीधे पूछें!`;
      }

      // English Default
      const overallDesc =
        overall === "good" ? "optimal" : overall === "borderline" ? "borderline" : "elevated and requires attention";

      return `Hello ${customerName}! I am Dakshin, your AI health speaker. I have analyzed your BMI report in detail. Your overall health status is ${overallDesc}. Your BMI is currently ${bmi}, your visceral fat rating is ${visceral} against the safe limit of under 9, and your cellular hydration is at ${water} percent. To optimize your biomarkers, focus on 30 minutes of daily brisk walking, adopt a balanced high-fiber diet, and maintain 3 to 4 liters of hydration daily. I am listening—ask me any questions about your diet, workouts, or how to reduce your visceral fat!`;
    },
    [analysis, user]
  );

  // Setup Web Speech Recognition (STT) for hands-free 2-way conversation like Alexa / ChatGPT
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setMicSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          handleCustomerMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.warn("Speech recognition notice:", err.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setMicSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  // Update recognition language
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang =
        language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-IN";
    }
  }, [language]);

  // Start hands-free listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isSpeaking) return;
    try {
      if (recognitionRef.current) {
        recognitionRef.current.lang =
          language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-IN";
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (e) {
      console.warn("Recognition already active or blocked:", e);
    }
  }, [isSpeaking, language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
  }, []);

  // Triggered when Dakshin is toggled ON or language is changed while open
  useEffect(() => {
    if (!isOpen) {
      // Customer turned OFF Dakshin AI
      window.speechSynthesis?.cancel();
      stopListening();
      setIsSpeaking(false);
      setActiveSpeechText("");
      hasSpokenInitialRef.current = false;
      return;
    }

    // Customer turned ON Dakshin AI
    const initialSpeech = generateDetailedReportSpeech(language);
    const greetingMsg: SpeakerMessage = {
      id: "initial-" + Date.now(),
      role: "dakshin",
      text: initialSpeech,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([greetingMsg]);
    hasSpokenInitialRef.current = true;

    // Speak greeting aloud once without forcing mic on
    speakVoice(initialSpeech, language);

    return () => {
      window.speechSynthesis?.cancel();
      stopListening();
    };
  }, [isOpen, language, generateDetailedReportSpeech, speakVoice, stopListening]);

  // Handle incoming customer question (via voice or text)
  const handleCustomerMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    // Stop listening while processing
    stopListening();

    const userMsg: SpeakerMessage = {
      id: "user-" + Date.now(),
      role: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    const reportContext = analysis
      ? `Age: ${analysis.raw?.age || 30}, Gender: ${analysis.raw?.gender || "female"}, BMI: ${
          analysis.raw?.bmi || 35.1
        }, Body Fat: ${analysis.raw?.bodyFat || 21.1}%, Muscle: ${analysis.raw?.muscleMass || 21.8}kg, Water: ${
          analysis.raw?.bodyWater || 52
        }%, Visceral Fat: ${analysis.raw?.visceralFat || 15}`
      : "General health review";

    try {
      const answer = await sendDakshinMessage(trimmed, language, reportContext);

      const botMsg: SpeakerMessage = {
        id: "dakshin-" + Date.now(),
        role: "dakshin",
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);

      // Dakshin speaks the answer aloud cleanly without forcing mic on
      speakVoice(answer, language);
    } catch (err) {
      console.error("Dakshin reply error:", err);
      setLoading(false);
    }
  };

  // Suggestion chips according to active language
  const suggestionChips = {
    en: [
      "Explain my Visceral Fat",
      "What should my diet plan be?",
      "Which exercises will reduce my BMI?",
      "How much water should I drink daily?",
      "How to improve my muscle mass?",
    ],
    te: [
      "విసెరల్ ఫ్యాట్ ఎలా తగ్గించాలి?",
      "నా ఆరోగ్యానికి డైట్ ప్లాన్ చెప్పండి",
      "ఏ వ్యాయామాలు చేయాలి?",
      "రోజుకు ఎంత నీరు త్రాగాలి?",
      "కండరాల దృఢత్వం ఎలా పెంచాలి?",
    ],
    hi: [
      "विसरल फैट कैसे घटाएं?",
      "मेरे लिए 7-दिन का डाइट चार्ट बताएं",
      "BMI कम करने के लिए कौन सी एक्सरसाइज करें?",
      "रोजाना कितना पानी पीना चाहिए?",
      "मांसपेशियों की ताकत कैसे बढ़ाएं?",
    ],
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-emerald-500/20 overflow-hidden flex flex-col max-h-[92vh]">
        {/* TOP STATUS BAR: SPEAKER HEADER */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/20">
          <div className="flex items-center gap-3.5">
            {/* Glowing Alexa/ChatGPT style Voice Orb */}
            <div className="relative flex items-center justify-center">
              <div
                className={`absolute h-14 w-14 rounded-full ${
                  isSpeaking
                    ? "bg-emerald-500/40 animate-ping"
                    : isListening
                    ? "bg-amber-500/40 animate-ping"
                    : "bg-emerald-500/20"
                }`}
              />
              <div
                className={`relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform ${
                  isSpeaking
                    ? "bg-gradient-to-tr from-emerald-500 to-teal-400 scale-105 shadow-emerald-500/50"
                    : isListening
                    ? "bg-gradient-to-tr from-amber-500 to-orange-400 scale-105 shadow-amber-500/50"
                    : "bg-emerald-600"
                }`}
              >
                <Bot className="h-6 w-6" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                  Dakshin AI
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                    <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
                    AI Speaker Active
                  </span>
                </h3>
              </div>
              <p className="text-xs text-emerald-200/80 font-medium mt-0.5">
                {isSpeaking
                  ? `Speaking in ${DAKSHIN_LANGUAGES.find((l) => l.id === language)?.label}...`
                  : isListening
                  ? "Listening to you... speak your question"
                  : "Conversational Voice Assistant · Alexa & ChatGPT Trained"}
              </p>
            </div>
          </div>

          {/* Controls: Language Selector, Sound Mute, Turn Off Button */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* 3 LANGUAGE SELECTOR PILLS */}
            <div className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/15">
              {DAKSHIN_LANGUAGES.map((lang) => {
                const isActive = language === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => onLanguageChange(lang.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-emerald-500 text-white shadow-md scale-105"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.native}</span>
                  </button>
                );
              })}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                if (soundEnabled) window.speechSynthesis?.cancel();
                setSoundEnabled(!soundEnabled);
              }}
              title={soundEnabled ? "Mute audio" : "Unmute audio"}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
            </button>

            {/* Prominent Turn Off Button as Requested */}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              Turn OFF Dakshin AI
            </button>
          </div>
        </div>

        {/* DYNAMIC VOICE SOUNDWAVE & EQUALIZER VISUALIZER (ALEXA / GOOGLE / CHATGPT EFFECT) */}
        <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Voice Frequency:</span>
            <div className="flex items-end gap-1 h-5">
              {[12, 24, 18, 30, 16, 28, 22, 34, 14, 26, 20, 32].map((height, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isSpeaking
                      ? "bg-gradient-to-t from-emerald-500 to-teal-300 animate-pulse"
                      : isListening
                      ? "bg-gradient-to-t from-amber-400 to-orange-300 animate-bounce"
                      : "bg-slate-700"
                  }`}
                  style={{
                    height: isSpeaking ? `${height}px` : isListening ? `${(height % 16) + 8}px` : "4px",
                    animationDelay: `${i * 60}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSpeaking && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                Speaking Live Audio
              </span>
            )}
            {isListening && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
                Listening... (Speak now)
              </span>
            )}
            {!isSpeaking && !isListening && (
              <span className="text-xs text-slate-400">Ready · Click mic or prompt to talk</span>
            )}
          </div>
        </div>

        {/* CONVERSATION TRANSCRIPT & INTERACTIVE MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF8F5]/80">
          {/* Active Clinical Context Pill */}
          {analysis && (
            <div className="mx-auto max-w-xl bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">Uploaded Report:</span>
                <span>BMI {analysis.raw?.bmi || 35.1}</span>
                <span>• Visceral Fat {analysis.raw?.visceralFat || 15}</span>
                <span>• Hydration {analysis.raw?.bodyWater || 52}%</span>
              </div>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${
                  analysis.overallStatus === "good"
                    ? "bg-emerald-100 text-emerald-800"
                    : analysis.overallStatus === "borderline"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {analysis.overallStatus}
              </span>
            </div>
          )}

          {/* Messages Thread */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 items-start ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "dakshin" && (
                <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center shrink-0 text-white shadow-md">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div
                className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed max-w-[85%] sm:max-w-[75%] shadow-xs ${
                  msg.role === "user"
                    ? "bg-slate-800 text-white rounded-tr-xs"
                    : "bg-white text-slate-900 border border-emerald-200/80 rounded-tl-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                    {msg.role === "dakshin" ? "Dakshin AI Speaker" : user?.fullName || "You"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                </div>
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Speaker replay button */}
                {msg.role === "dakshin" && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => speakVoice(msg.text, language)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      Replay speech
                    </button>
                    <span className="text-[10px] text-slate-400">
                      {DAKSHIN_LANGUAGES.find((l) => l.id === language)?.native}
                    </span>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="h-9 w-9 rounded-2xl bg-slate-200 flex items-center justify-center shrink-0 text-slate-700">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}

          {/* Thinking Indicator */}
          {loading && (
            <div className="flex items-center gap-2.5 pl-12 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping"></span>
              Dakshin AI is thinking and preparing your voice response...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* QUICK SUGGESTIONS CHIPS (MULTILINGUAL) */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-500 shrink-0">Ask Dakshin:</span>
          {suggestionChips[language].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleCustomerMessage(chip)}
              className="shrink-0 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors font-medium shadow-xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* BOTTOM TWO-WAY VOICE & TEXT CONTROLS */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
          {/* Hands-Free Voice Listening Button */}
          <button
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                startListening();
              }
            }}
            disabled={isSpeaking}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 ${
              isListening
                ? "bg-amber-500 text-white animate-pulse shadow-amber-500/40"
                : "bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20"
            } disabled:opacity-50`}
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4" />
                <span>Listening to you... (Click to stop)</span>
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                <span>Speak to Dakshin in {DAKSHIN_LANGUAGES.find((l) => l.id === language)?.native}</span>
              </>
            )}
          </button>

          {/* Text Input Fallback Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCustomerMessage(inputText);
            }}
            className="flex-1 w-full flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Or type your question in ${DAKSHIN_LANGUAGES.find((l) => l.id === language)?.native}...`}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 transition-colors shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
