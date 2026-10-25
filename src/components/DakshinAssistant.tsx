import React, { useState, useRef, useEffect } from "react";
import { Bot, HelpCircle, Volume2, VolumeX, Languages, Mic, MicOff, Send, User } from "lucide-react";
import type { HealthAnalysis, SupportedLanguage, ChatMessage } from "@/types/health";
import { LANGUAGE_LABELS } from "@/types/health";
import { sendDakshinMessage } from "@/lib/api";

interface DakshinAssistantProps {
  analysis: HealthAnalysis | null;
}

export const DakshinAssistant: React.FC<DakshinAssistantProps> = ({ analysis }) => {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSend(transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, [language]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Voice Speech Synthesis
  const speakText = (text: string, lang: SupportedLanguage) => {
    if (!speechEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === "te") utterance.lang = "te-IN";
    else if (lang === "hi") utterance.lang = "hi-IN";
    else if (lang === "ta") utterance.lang = "ta-IN";
    else utterance.lang = "en-US";

    utterance.rate = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceHold = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        if (language === "te") recognitionRef.current.lang = "te-IN";
        else if (language === "hi") recognitionRef.current.lang = "hi-IN";
        else if (language === "ta") recognitionRef.current.lang = "ta-IN";
        else recognitionRef.current.lang = "en-US";

        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (e) {
          console.warn("Speech recognition error:", e);
        }
      } else {
        alert("Microphone voice input is supported in Google Chrome, Edge, and modern browsers.");
      }
    }
  };

  const handleSend = async (customMessage?: string) => {
    const query = (customMessage || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    const reportContext = analysis
      ? `Age: ${analysis.raw?.age}, Gender: ${analysis.raw?.gender}, BMI: ${analysis.raw?.bmi}, Body Fat: ${analysis.raw?.bodyFat}%, Muscle: ${analysis.raw?.muscleMass}kg, Water: ${analysis.raw?.bodyWater}%, Visceral Fat: ${analysis.raw?.visceralFat}`
      : undefined;

    const reply = await sendDakshinMessage(query, language, reportContext);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, botMsg]);
    setLoading(false);
    speakText(reply, language);
  };

  const quickChips = [
    "Explain my report",
    "Diet plan",
    "Exercise plan",
    "Water intake",
    "Better sleep",
  ];

  return (
    <div className="wellness-card p-6 flex flex-col h-[740px] sticky top-20">
      {/* Header (Screenshots 1, 2, 3) */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#15803D] text-white shadow-sm">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 leading-tight">Dakshin</h3>
            <p className="text-xs text-slate-500">Ready to talk · {LANGUAGE_LABELS[language].split(" ")[0]}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("Dakshin is your personal wellness assistant. Ask questions about your report, diet, exercise, or lifestyle in English, Telugu, Hindi, or Tamil.")}
            className="text-slate-400 hover:text-slate-600 p-1"
            title="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className="text-slate-400 hover:text-slate-600 p-1"
            title={speechEnabled ? "Mute speech" : "Enable speech"}
          >
            {speechEnabled ? <Volume2 className="h-4 w-4 text-emerald-600" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
          </button>
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <Languages className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="te">Telugu (తెలుగు)</option>
              <option value="hi">Hindi (हिन्दी)</option>
              <option value="ta">Tamil (தமிழ்)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {/* Initial Green Health Analysis Summary Bubble (Exact Screenshot UI) */}
        {analysis && (
          <div className="flex gap-2 items-start justify-end">
            <div className="dakshin-chat-bubble p-5 text-xs sm:text-[13px] leading-relaxed max-w-[92%]">
              <p className="font-semibold mb-3">Here is my latest health analysis summary:</p>
              <div className="space-y-1 font-mono text-emerald-50 mb-3">
                <p>Overall status: {analysis.overallStatus}</p>
                {analysis.metrics.map((m) => (
                  <p key={m.name}>
                    {m.name}: {m.value} {m.unit} ({m.status})
                  </p>
                ))}
              </div>
              <p className="text-emerald-50 mb-3 leading-relaxed">
                {analysis.summary}
              </p>
              <p className="italic text-emerald-100 text-[11px]">
                Please use this context when answering my questions.
              </p>
            </div>
            <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-600">
              <User className="h-4 w-4" />
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 items-start ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="h-7 w-7 rounded-full bg-[#15803D] flex items-center justify-center shrink-0 text-white shadow-xs">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`p-3.5 text-xs sm:text-[13px] leading-relaxed max-w-[85%] ${
                msg.role === "user"
                  ? "bg-slate-100 text-slate-900 rounded-2xl rounded-tr-xs"
                  : "bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-2xl rounded-tl-xs shadow-xs font-medium"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 items-center text-xs text-slate-400 pl-9">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Dakshin is thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="flex flex-wrap gap-1.5 py-2.5 border-t border-slate-100">
        {quickChips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleSend(chip)}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors font-medium"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Hold to Talk Voice Button (Screenshot UI) */}
      <button
        type="button"
        onClick={handleVoiceHold}
        className={`mt-1 flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-xs font-semibold transition-colors border ${
          isRecording
            ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse"
            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
      >
        {isRecording ? <MicOff className="h-4 w-4 text-rose-600" /> : <Mic className="h-4 w-4 text-emerald-700" />}
        {isRecording ? "Listening... (Click to stop)" : `Hold to talk in ${LANGUAGE_LABELS[language].split(" ")[0]}`}
      </button>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-2 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Or type in ${LANGUAGE_LABELS[language].split(" ")[0]}...`}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#15803D] text-white hover:bg-emerald-800 disabled:opacity-40 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
