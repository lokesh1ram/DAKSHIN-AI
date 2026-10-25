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
  Sparkles,
  Minimize2,
  Maximize2,
  AlertCircle,
  Radio,
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

/**
 * Luminous Fluid Neon Sound Wave Canvas (matching the exact ribbon wave from Image 1)
 */
const HolographicSoundWave: React.FC<{ isSpeaking: boolean; isListening: boolean }> = ({
  isSpeaking,
  isListening,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Dynamic amplitude based on voice state
      const targetAmp = isSpeaking ? 24 : isListening ? 18 : 6;
      const speed = isSpeaking ? 0.08 : isListening ? 0.05 : 0.02;
      phase += speed;

      // Draw 3 interwoven glowing ribbon waves (cyan, purple, emerald)
      const waves = [
        {
          freq: 0.015,
          phaseOffset: 0,
          color1: "rgba(6, 182, 212, 0.95)", // Glowing Cyan
          color2: "rgba(168, 85, 247, 0.95)", // Neon Purple
          lineWidth: 2.5,
          blur: 14,
          ampMult: 1.0,
        },
        {
          freq: 0.02,
          phaseOffset: Math.PI / 3,
          color1: "rgba(168, 85, 247, 0.85)", // Neon Purple
          color2: "rgba(59, 130, 246, 0.85)", // Royal Blue
          lineWidth: 2.0,
          blur: 12,
          ampMult: 0.75,
        },
        {
          freq: 0.012,
          phaseOffset: Math.PI / 1.5,
          color1: "rgba(52, 211, 153, 0.8)", // Emerald
          color2: "rgba(6, 182, 212, 0.9)", // Cyan
          lineWidth: 1.5,
          blur: 10,
          ampMult: 0.5,
        },
      ];

      waves.forEach((w) => {
        ctx.save();
        ctx.beginPath();

        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, w.color1);
        grad.addColorStop(0.5, w.color2);
        grad.addColorStop(1, w.color1);

        ctx.strokeStyle = grad;
        ctx.lineWidth = w.lineWidth;
        ctx.shadowColor = w.color1;
        ctx.shadowBlur = w.blur;

        for (let x = 0; x < width; x += 2) {
          const envelope = Math.sin((x / width) * Math.PI);
          const y = centerY + Math.sin(x * w.freq + phase + w.phaseOffset) * targetAmp * w.ampMult * envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking, isListening]);

  return (
    <canvas
      ref={canvasRef}
      width={460}
      height={70}
      className="w-full max-w-[420px] h-[60px] mx-auto pointer-events-none"
    />
  );
};

/**
 * Real-time Phonetic Telugu Transliteration
 * Converts Telugu script (Unicode \u0C00-\u0C7F) into smooth, phonetic Roman text.
 * When a browser/OS (e.g. Windows Chrome) lacks an offline native Telugu TTS voice,
 * this allows an Indian English female voice (Heera/Neerja/Google) to speak authentic,
 * clearly understandable Telugu aloud instead of remaining silent or erroring out.
 */
export function transliterateTeluguToRoman(text: string): string {
  if (!text || !/[\u0C00-\u0C7F]/.test(text)) return text;

  const VOWELS: Record<string, string> = {
    "\u0C05": "a", "\u0C06": "aa", "\u0C07": "i", "\u0C08": "ee",
    "\u0C09": "u", "\u0C0A": "oo", "\u0C0B": "ru", "\u0C0E": "e",
    "\u0C0F": "ae", "\u0C10": "ai", "\u0C12": "o", "\u0C13": "o",
    "\u0C14": "au"
  };

  const CONSONANTS: Record<string, string> = {
    "\u0C15": "k", "\u0C16": "kh", "\u0C17": "g", "\u0C18": "gh", "\u0C19": "ng",
    "\u0C1A": "ch", "\u0C1B": "chh", "\u0C1C": "j", "\u0C1D": "jh", "\u0C1E": "ny",
    "\u0C1F": "t", "\u0C20": "th", "\u0C21": "d", "\u0C22": "dh", "\u0C23": "n",
    "\u0C24": "th", "\u0C25": "th", "\u0C26": "d", "\u0C27": "dh", "\u0C28": "n",
    "\u0C2A": "p", "\u0C2B": "ph", "\u0C2C": "b", "\u0C2D": "bh", "\u0C2E": "m",
    "\u0C2F": "y", "\u0C30": "r", "\u0C31": "r", "\u0C32": "l", "\u0C33": "l",
    "\u0C35": "v", "\u0C36": "sh", "\u0C37": "sh", "\u0C38": "s", "\u0C39": "h"
  };

  const MATRAS: Record<string, string> = {
    "\u0C3E": "aa", "\u0C3F": "i", "\u0C40": "ee", "\u0C41": "u", "\u0C42": "oo",
    "\u0C43": "ru", "\u0C46": "e", "\u0C47": "ae", "\u0C48": "ai", "\u0C4A": "o",
    "\u0C4B": "o", "\u0C4C": "au"
  };

  let out = "";
  const chars = Array.from(text);
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const next = chars[i + 1];

    if (VOWELS[c]) {
      out += VOWELS[c];
    } else if (CONSONANTS[c]) {
      const base = CONSONANTS[c];
      if (next === "\u0C4D") {
        // Virama (halant) - consonant only, no inherent vowel
        out += base;
        i++; // skip virama
      } else if (next && MATRAS[next]) {
        // Consonant with vowel sign
        out += base + MATRAS[next];
        i++; // skip matra
      } else {
        // Consonant with inherent 'a' sound
        out += base + "a";
      }
    } else if (c === "\u0C02") {
      out += "m";
    } else if (c === "\u0C03") {
      out += "h";
    } else {
      out += c;
    }
  }
  return out;
}

// Explicit check for male voices to disqualify
const isMaleVoice = (v: SpeechSynthesisVoice): boolean => {
  const n = v.name.toLowerCase();
  return (
    n.includes("david") ||
    n.includes("mark") ||
    n.includes("george") ||
    n.includes("ravi") ||
    n.includes("mohan") ||
    n.includes("madhur") ||
    n.includes("guy") ||
    n.includes("male") ||
    n.includes("stefan") ||
    n.includes("richard") ||
    n.includes("james") ||
    n.includes("sean")
  );
};

const isConfirmedFemaleVoice = (v: SpeechSynthesisVoice): boolean => {
  const n = v.name.toLowerCase();
  return (
    n.includes("female") ||
    n.includes("woman") ||
    n.includes("zira") ||
    n.includes("jenny") ||
    n.includes("aria") ||
    n.includes("samantha") ||
    n.includes("heera") ||
    n.includes("neerja") ||
    n.includes("swara") ||
    n.includes("shruti") ||
    n.includes("kalpana") ||
    n.includes("chitra") ||
    n.includes("geeta") ||
    n.includes("priya") ||
    n.includes("victoria") ||
    n.includes("karen") ||
    n.includes("google हिन्दी") ||
    n.includes("google us english") ||
    n.includes("google uk english female")
  );
};

export const DakshinRobot: React.FC<DakshinRobotProps> = ({
  analysis,
  user,
  isOpen,
  onToggle,
  language = "en",
  onLanguageChange,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMicHeldOn, setIsMicHeldOn] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<RobotMessage[]>([]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);

  // References to keep event handlers stable with zero re-rendering thrashing
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const isSpeakingRef = useRef(false);
  const micHeldActiveRef = useRef(false);
  const accumulatedSpeechRef = useRef<string>("");
  const silenceTimerRef = useRef<any>(null);
  const spokenSessionKeyRef = useRef<string>("");
  const currentLanguageRef = useRef<DakshinLanguage>(language);
  const soundEnabledRef = useRef<boolean>(soundEnabled);
  const handleUserDoubtRef = useRef<(query: string, topic?: string) => void>(() => {});

  // Sync language and soundEnabled refs immediately
  useEffect(() => {
    currentLanguageRef.current = language;
  }, [language]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    if (!soundEnabled) {
      stopAllAudioAndSpeech();
    }
  }, [soundEnabled]);

  // Load and cache browser voices safely
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          setAvailableVoices(voices);
        }
      } catch (_) {}
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSpeaking, loading, isMinimized, interimTranscript]);

  /**
   * Stop all active audio and Web Speech voices immediately
   */
  const stopAllAudioAndSpeech = useCallback(() => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
        activeAudioRef.current = null;
      } catch (_) {}
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    activeUtteranceRef.current = null;
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  }, []);

  /**
   * TRAINED FEMALE / WOMEN VOICE SELECTOR
   * Strictly filters out all male voices and picks high quality female voices.
   */
  const getTrainedFemaleVoice = useCallback(
    (lang: DakshinLanguage): { voice: SpeechSynthesisVoice | null; hasNativeVoice: boolean } => {
      const liveVoices =
        typeof window !== "undefined" && "speechSynthesis" in window
          ? window.speechSynthesis.getVoices()
          : [];
      const voices = liveVoices.length > 0 ? liveVoices : availableVoices;
      if (!voices.length) {
        return { voice: null, hasNativeVoice: false };
      }

      // Filter out male voices so we NEVER play a man's voice
      const nonMalePool = voices.filter((v) => !isMaleVoice(v));
      const pool = nonMalePool.length > 0 ? nonMalePool : voices;

      // 1. Native Telugu Female Voice (e.g. Edge "Microsoft Shruti")
      if (lang === "te") {
        const teVoice = pool.find((v) => v.lang.toLowerCase().startsWith("te"));
        if (teVoice) return { voice: teVoice, hasNativeVoice: true };
      }

      // 2. Native Hindi Female Voice (e.g. "Microsoft Swara", "Google हिन्दी")
      if (lang === "hi") {
        const hiVoice = pool.find((v) => v.lang.toLowerCase().startsWith("hi"));
        if (hiVoice) return { voice: hiVoice, hasNativeVoice: true };
      }

      // 3. Indian English Female (Heera, Neerja, Priya)
      const inEnFemale =
        pool.find(
          (v) => v.lang.toLowerCase().startsWith("en-in") && isConfirmedFemaleVoice(v)
        ) || pool.find((v) => v.lang.toLowerCase().startsWith("en-in"));
      if (inEnFemale) return { voice: inEnFemale, hasNativeVoice: false };

      // 4. Confirmed Natural Female Voices (Zira, Jenny, Aria, Samantha)
      const confirmedFemale = pool.find((v) => isConfirmedFemaleVoice(v));
      if (confirmedFemale) return { voice: confirmedFemale, hasNativeVoice: false };

      // 5. Any English voice that isn't male
      const genericEn = pool.find((v) => v.lang.toLowerCase().startsWith("en")) || pool[0];
      return { voice: genericEn || null, hasNativeVoice: false };
    },
    [availableVoices]
  );

  /**
   * Secondary Fallback: Browser Web Speech API
   */
  const playViaSpeechSynthesis = useCallback(
    (
      textToSpeak: string,
      langToUse: DakshinLanguage,
      phoneticFallback?: string,
      onFinished?: () => void
    ) => {
      if (!soundEnabledRef.current || !("speechSynthesis" in window)) {
        if (onFinished) onFinished();
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const { voice, hasNativeVoice } = getTrainedFemaleVoice(langToUse);

        let spokenString = textToSpeak;
        if (langToUse === "te" && !hasNativeVoice) {
          spokenString = phoneticFallback || transliterateTeluguToRoman(textToSpeak);
        } else if (langToUse === "hi" && !hasNativeVoice && phoneticFallback) {
          spokenString = phoneticFallback;
        }

        const utterance = new SpeechSynthesisUtterance(spokenString);
        activeUtteranceRef.current = utterance;

        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = langToUse === "te" ? "te-IN" : langToUse === "hi" ? "hi-IN" : "en-IN";
        }

        utterance.pitch = 1.25;
        utterance.rate = 0.98;

        utterance.onstart = () => {
          isSpeakingRef.current = true;
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          activeUtteranceRef.current = null;
          if (micHeldActiveRef.current) {
            startBrowserRecognition();
          }
          if (onFinished) onFinished();
        };

        utterance.onerror = (e) => {
          if (e.error !== "canceled" && e.error !== "interrupted") {
            console.warn("Speech error:", e.error);
          }
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          activeUtteranceRef.current = null;
          if (micHeldActiveRef.current) {
            startBrowserRecognition();
          }
          if (onFinished) onFinished();
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis error:", err);
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        if (micHeldActiveRef.current) {
          startBrowserRecognition();
        }
        if (onFinished) onFinished();
      }
    },
    [getTrainedFemaleVoice]
  );

  /**
   * Speak with Dakshin's Trained Real Female Voice
   * - In Telugu (te) & Hindi (hi): Speaks authentic, native Indian female voice via Natural Audio Stream.
   *   Seamlessly plays sequentially so long paragraphs sound fluid with zero robotic artifact!
   * - In English (en): Uses high quality tuned female speech (pitch 1.25).
   * - Offline resilient: Falls back safely if network drops.
   */
  const speakFemaleVoice = useCallback(
    (
      displayText: string,
      phoneticFallbackText: string | undefined,
      langToUse: DakshinLanguage,
      onDone?: () => void
    ) => {
      if (!soundEnabledRef.current) {
        if (onDone) onDone();
        return;
      }

      stopAllAudioAndSpeech();

      // For Telugu and Hindi: Natural Authentic Female Audio Engine
      if (langToUse === "te" || langToUse === "hi") {
        const cleanText = displayText
          .replace(/[\*\#\_\[\]\(\)]/g, "")
          .replace(/[0-9]+(\.[0-9]+)?/g, (match) => ` ${match} `)
          .trim();

        // Split text into natural spoken phrases (max ~130 chars each) for fluid playback
        const sentences = cleanText
          .split(/(?<=[.!?,\n])\s+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        const chunks: string[] = [];
        let current = "";
        for (const s of sentences) {
          if ((current + " " + s).trim().length <= 130) {
            current = (current + " " + s).trim();
          } else {
            if (current) chunks.push(current);
            current = s.length > 130 ? s.slice(0, 130) : s;
          }
        }
        if (current) chunks.push(current);

        const chunksToPlay = chunks.length > 0 ? chunks : [cleanText.slice(0, 130)];
        let chunkIndex = 0;

        const playNextChunk = () => {
          if (chunkIndex >= chunksToPlay.length || !soundEnabledRef.current) {
            isSpeakingRef.current = false;
            setIsSpeaking(false);
            activeAudioRef.current = null;
            if (micHeldActiveRef.current) {
              startBrowserRecognition();
            }
            if (onDone) onDone();
            return;
          }

          const currentChunk = chunksToPlay[chunkIndex];
          chunkIndex++;

          const proxyUrl = `/api/tts?tl=${langToUse}&q=${encodeURIComponent(currentChunk)}`;
          const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langToUse}&client=tw-ob&q=${encodeURIComponent(
            currentChunk
          )}`;

          const audio = new Audio(proxyUrl);
          activeAudioRef.current = audio;

          isSpeakingRef.current = true;
          setIsSpeaking(true);

          audio.onended = () => {
            playNextChunk();
          };

          audio.onerror = () => {
            // Direct fallback
            const fallbackAudio = new Audio(directUrl);
            activeAudioRef.current = fallbackAudio;
            fallbackAudio.onended = () => {
              playNextChunk();
            };
            fallbackAudio.onerror = () => {
              playViaSpeechSynthesis(currentChunk, langToUse, phoneticFallbackText, () => {
                playNextChunk();
              });
            };
            fallbackAudio.play().catch(() => {
              playViaSpeechSynthesis(currentChunk, langToUse, phoneticFallbackText, () => {
                playNextChunk();
              });
            });
          };

          audio.play().catch((err) => {
            console.warn("Audio play blocked or offline, trying direct or speech synthesis:", err);
            const directAudio = new Audio(directUrl);
            activeAudioRef.current = directAudio;
            directAudio.onended = () => playNextChunk();
            directAudio.onerror = () => {
              playViaSpeechSynthesis(currentChunk, langToUse, phoneticFallbackText, () => {
                playNextChunk();
              });
            };
            directAudio.play().catch(() => {
              playViaSpeechSynthesis(currentChunk, langToUse, phoneticFallbackText, () => {
                playNextChunk();
              });
            });
          });
        };

        playNextChunk();
        return;
      }

      // English: Browser SpeechSynthesis with high-quality female pitch
      playViaSpeechSynthesis(displayText, langToUse, phoneticFallbackText, onDone);
    },
    [stopAllAudioAndSpeech, playViaSpeechSynthesis]
  );

  /**
   * Safe recognition starter helper with dynamic language binding
   */
  const startBrowserRecognition = () => {
    if (!recognitionRef.current || isSpeakingRef.current) return;
    try {
      const activeLang = currentLanguageRef.current;
      recognitionRef.current.lang =
        activeLang === "te" ? "te-IN" : activeLang === "hi" ? "hi-IN" : "en-IN";
      recognitionRef.current.start();
    } catch (_) {
      // If already started, that's fine
    }
  };

  /**
   * Update Speech Recognition language whenever user changes language pill
   */
  useEffect(() => {
    if (recognitionRef.current) {
      const recognitionLang =
        language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-IN";
      recognitionRef.current.lang = recognitionLang;

      // If mic is currently active, restart recognition with new language immediately
      if (micHeldActiveRef.current && !isSpeakingRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
        setTimeout(() => {
          if (micHeldActiveRef.current && !isSpeakingRef.current) {
            try {
              recognitionRef.current.lang = recognitionLang;
              recognitionRef.current.start();
            } catch (_) {}
          }
        }, 150);
      }
    }
  }, [language]);

  /**
   * CONTINUOUS SPEECH RECOGNITION SETUP
   * Keeps listening continuously until the customer explicitly turns OFF the mic!
   */
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicNotice("Speech recognition is not supported in this browser. Please use Chrome/Edge or type your doubt.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      // CONTINUOUS LISTENING MODE: Does NOT turn off after one sentence!
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setMicNotice(null);
      };

      recognition.onresult = (event: any) => {
        // If Dakshin is currently speaking aloud, do not transcribe Dakshin's own voice
        if (isSpeakingRef.current) return;

        let liveInterim = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalChunk += " " + item[0].transcript;
          } else {
            liveInterim += " " + item[0].transcript;
          }
        }

        const combinedText = (finalChunk || liveInterim).trim();
        if (combinedText) {
          accumulatedSpeechRef.current = (accumulatedSpeechRef.current + " " + finalChunk).trim();
          setInterimTranscript(combinedText);

          // Sentence Completion Debounce:
          // When customer pauses talking for 1.3 seconds, automatically send the question to Dakshin
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            const queryToSend = accumulatedSpeechRef.current || combinedText;
            if (queryToSend.trim().length > 1) {
              accumulatedSpeechRef.current = "";
              setInterimTranscript("");
              handleUserDoubtRef.current(queryToSend.trim());
            }
          }, 1300);
        }
      };

      recognition.onerror = (err: any) => {
        if (err.error === "no-speech") {
          // Normal brief silence in continuous mode, keep running
          return;
        }
        if (err.error === "not-allowed" || err.error === "service-not-allowed") {
          setMicNotice("Microphone permission was denied. Please allow microphone in your browser address bar.");
          micHeldActiveRef.current = false;
          setIsMicHeldOn(false);
          return;
        }
      };

      // CRITICAL RECOVERY: If browser stops recognition (e.g. timeout), but customer kept mic ON:
      // AUTOMATICALLY RESTART IT! It stays ON until customer turns it OFF!
      recognition.onend = () => {
        if (micHeldActiveRef.current && !isSpeakingRef.current) {
          setTimeout(() => {
            if (micHeldActiveRef.current && !isSpeakingRef.current) {
              try {
                const activeLang = currentLanguageRef.current;
                recognition.lang =
                  activeLang === "te" ? "te-IN" : activeLang === "hi" ? "hi-IN" : "en-IN";
                recognition.start();
              } catch (_) {}
            }
          }, 200);
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn("SpeechRecognition setup error:", e);
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  /**
   * Customer presses "Turn ON Mic"
   * KEPT ON CONTINUOUSLY UNTIL CUSTOMER PRESSES TURN OFF!
   */
  const handleTurnOnContinuousMic = () => {
    if (!recognitionRef.current) {
      setMicNotice("Microphone is not supported in this browser. Please type your question below.");
      return;
    }

    // Stop any ongoing voice playback
    stopAllAudioAndSpeech();

    // Set Held ON flags
    micHeldActiveRef.current = true;
    setIsMicHeldOn(true);
    accumulatedSpeechRef.current = "";
    setInterimTranscript("");
    setMicNotice(null);

    startBrowserRecognition();
  };

  /**
   * Customer presses "Turn OFF Mic"
   * Stops continuous listening cleanly
   */
  const handleTurnOffMic = () => {
    micHeldActiveRef.current = false;
    setIsMicHeldOn(false);

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    // If there is any remaining speech waiting, send it before stopping
    const leftover = (accumulatedSpeechRef.current || interimTranscript).trim();
    accumulatedSpeechRef.current = "";
    setInterimTranscript("");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

    if (leftover.length > 1) {
      handleUserDoubtRef.current(leftover);
    }
  };

  // Female Greetings
  const getShortGreeting = (lang: DakshinLanguage): { display: string; phonetic: string } => {
    const customerName = user?.fullName ? user.fullName.split(" ")[0] : "";
    const namePrefix = customerName ? `${customerName}! ` : "";

    if (lang === "te") {
      return {
        display: `నమస్కారం ${namePrefix}నేను దక్షిణ్‌ని, మీ పర్సనల్ AI హెల్త్ అసిస్టెంట్‌ని. మీ BMI మరియు ఆరోగ్యం గురించి మాట్లాడండి!`,
        phonetic: `Namaskaram ${namePrefix}Nenu Dakshin-ni, mee personal AI health assistant-ni. Mee BMI mariyu aarogyam gurinchi maatlaadandi!`,
      };
    }

    if (lang === "hi") {
      return {
        display: `नमस्ते ${namePrefix}मैं दक्षिण हूँ, आपकी पर्सनल AI हेल्थ असिस्टेंट। अपनी BMI रिपोर्ट, डाइट या फिटनेस के बारे में बात करें!`,
        phonetic: `Namaste ${namePrefix}Main Dakshin hoon, aapki personal AI health assistant! Apni report ke baare mein baat karein!`,
      };
    }

    const text = `Hello ${namePrefix}I am Dakshin, your AI health coach. Talk with me about your BMI report, diet, steps, or sleep!`;
    return { display: text, phonetic: text };
  };

  // 5 Habit Knowledge Answers
  const habitKnowledge: Record<
    string,
    Record<DakshinLanguage, { title: string; display: string; phonetic: string }>
  > = {
    steps: {
      en: {
        title: "Daily Step Count Protocol",
        display: `Based on your BMI of ${analysis?.raw?.bmi || 35.1}, your optimal daily target is 8,000 to 10,000 steps. A 30-minute brisk walk in the morning and a 20-minute stroll after dinner burns over 350 calories and directly mobilizes visceral belly fat. Make walking a daily habit!`,
        phonetic: `Based on your BMI of ${analysis?.raw?.bmi || 35.1}, your optimal daily target is 8,000 to 10,000 steps. A 30-minute brisk walk in the morning and a 20-minute stroll after dinner burns over 350 calories and directly mobilizes visceral belly fat. Make walking a daily habit!`,
      },
      te: {
        title: "రోజువారీ నడక సూచన",
        display: `మీ BMI ${analysis?.raw?.bmi || 35.1} ప్రకారం, మీరు రోజూ 8,000 నుండి 10,000 అడుగులు నడవాలి. ఉదయం 30 నిమిషాల వేగవంతమైన నడక మరియు రాత్రి భోజనం తర్వాత 20 నిమిషాల నడక కడుపులోని విసెరల్ కొవ్వును త్వరగా కరిగిస్తుంది!`,
        phonetic: `Mee BMI ${analysis?.raw?.bmi || 35.1} prakaaram, meeru rojoo 8,000 nundi 10,000 adugulu nadavaali. Udayam 30 nimishaala vegavantamaina nadaka mariyu raathri bhojanam tharvaatha 20 nimishaala nadaka kadupuloni visceral kovvunu thvaragaa karigisthundhi!`,
      },
      hi: {
        title: "डेली स्टेप काउंट नियम",
        display: `आपके BMI ${analysis?.raw?.bmi || 35.1} के अनुसार, आपको रोजाना 8,000 से 10,000 कदम चलना चाहिए। सुबह 30 मिनट तेज चाल और रात के खाने के बाद 20 मिनट वॉक करने से विसरल फैट तेजी से कम होता है!`,
        phonetic: `Aapke BMI ${analysis?.raw?.bmi || 35.1} ke anusaar, aapko rozana 8,000 se 10,000 kadam chalna chahiye. Subah 30 minute tez chaal aur raat ke khaane ke baad 20 minute walk karne se visceral fat tezi se kam hota hai!`,
      },
    },
    diet: {
      en: {
        title: "Food & Nutrition Habits",
        display: `To reduce your body fat (${analysis?.raw?.bodyFat || 21.1}%), start every meal with fiber like cucumber or fresh greens. Aim for 25 to 30 grams of protein per meal from lentils, eggs, sprouts, or paneer. Strictly eliminate refined white sugar, soda, and deep-fried snacks, and eat dinner by 8:00 PM.`,
        phonetic: `To reduce your body fat (${analysis?.raw?.bodyFat || 21.1}%), start every meal with fiber like cucumber or fresh greens. Aim for 25 to 30 grams of protein per meal from lentils, eggs, sprouts, or paneer. Strictly eliminate refined white sugar, soda, and deep-fried snacks, and eat dinner by 8:00 PM.`,
      },
      te: {
        title: "ఆహారపు అలవాట్లు",
        display: `మీ శరీర కొవ్వు తగ్గడానికి, భోజనానికి ముందు దోసకాయ లేదా తాజా సలాడ్లు తినండి. ప్రతి భోజనంలో పప్పులు, గుడ్లు లేదా మొలకలతో 30 గ్రాముల ప్రొటీన్ ఉండేలా చూసుకోండి. పంచదార, మైదా, వేపుళ్ళు పూర్తిగా మానేయండి!`,
        phonetic: `Mee shareera kovvu thaggadaaniki, bhojanaaniki mundhu dosakaaya ledaa thaajaa salad-lu thinandi. Prathi bhojanamlo pappulu, gudlu ledaa molakatho 30 graamula protein undelaa choosukondi. Panchadaara, maida, vepudlu poorthigaa maaneyandi!`,
      },
      hi: {
        title: "खान-पान की आदतें",
        display: `बॉडी फैट कम करने के लिए खाने से पहले खीरा या सलाद खाएं। हर बार भोजन में 25-30 ग्राम प्रोटीन शामिल करें। सफेद चीनी, कोल्ड ड्रिंक्स और तली-भुनी चीजें पूरी तरह बंद करें!`,
        phonetic: `Body fat kam karne ke liye khaane se pehle kheera ya salad khayein. Har baar bhojan mein 25-30 gram protein shaamil karein. Safed cheeni, cold drinks aur tali-bhuni cheezein poori tarah band karein!`,
      },
    },
    water: {
      en: {
        title: "Daily Water Intake Routine",
        display: `Your body water index is at ${analysis?.raw?.bodyWater || 52}%. You should consume 3.5 to 4 liters of clean water daily. Drinking 500ml of warm water right after waking up speeds up metabolism by 24%. Keep a water bottle with you and sip consistently throughout the day.`,
        phonetic: `Your body water index is at ${analysis?.raw?.bodyWater || 52}%. You should consume 3.5 to 4 liters of clean water daily. Drinking 500ml of warm water right after waking up speeds up metabolism by 24%. Keep a water bottle with you and sip consistently throughout the day.`,
      },
      te: {
        title: "నీటి పరిమాణం నియమం",
        display: `మీ శరీరంలో నీరు ${analysis?.raw?.bodyWater || 52}% గా ఉంది. రోజూ కనీసం 3.5 నుండి 4 లీటర్ల మంచినీరు త్రాగాలి. ఉదయం నిద్రలేవగానే గోరువెచ్చని నీరు త్రాగడం జీర్ణక్రియను మరియు ఫ్యాట్ బర్నింగ్‌ను వేగవంతం చేస్తుంది!`,
        phonetic: `Mee shareeramlo neeru ${analysis?.raw?.bodyWater || 52}% gaa undhi. Rojoo kaneesam 3.5 nundi 4 leetarla manchineeru thaagaali. Udayam nidralevagaane goruvechani neeru thaagadam jeernakriyanu mariyu fat burning-nu vegavantam chesthundhi!`,
      },
      hi: {
        title: "पानी पीने का सही नियम",
        display: `आपका बॉडी वाटर ${analysis?.raw?.bodyWater || 52}% है। आपको रोजाना 3.5 से 4 लीटर पानी पीना चाहिए। सुबह उठते ही 2 गिलास गुनगुना पानी पीने से मेटाबॉलिज्म तेज होता है और टॉक्सिन्स बाहर निकलते हैं!`,
        phonetic: `Aapka body water ${analysis?.raw?.bodyWater || 52}% hai. Aapko rozana 3.5 se 4 liter paani peena chahiye. Subah uthte hi 2 glass gunguna paani peene se metabolism tez hota hai aur toxins baahar nikalte hain!`,
      },
    },
    sleep: {
      en: {
        title: "Good Sleep & Recovery Routine",
        display: `Deep sleep regulates your metabolism. Sleeping 7 to 8 hours by 10:30 PM reduces cortisol—the primary stress hormone that stores visceral fat around your organs. Disconnect from screens 30 minutes before bed and keep your bedroom cool and dark.`,
        phonetic: `Deep sleep regulates your metabolism. Sleeping 7 to 8 hours by 10:30 PM reduces cortisol—the primary stress hormone that stores visceral fat around your organs. Disconnect from screens 30 minutes before bed and keep your bedroom cool and dark.`,
      },
      te: {
        title: "మంచి నిద్ర అలవాట్లు",
        display: `రాత్రి 10:30 కల్లా పడుకుని 7 నుండి 8 గంటల నిద్రపోవడం చాలా ముఖ్యం. తగినంత నిద్ర లేకపోతే కార్టిసాల్ హార్మోన్ పెరిగి పొట్ట చుట్టూ కొవ్వు పెరుగుతుంది. పడుకునే అరగంట ముందు ఫోన్ చూడటం ఆపండి!`,
        phonetic: `Raathri 10:30 kalla padukuni 7 nundi 8 gantala nidrapovadam chaala mukhyam. Thaginantha nidra lekapothe cortisol hormone perigi potta chuttoo kovvu peruguthundhi. Padukune araganta mundhu phone choodatam aapandi!`,
      },
      hi: {
        title: "अच्छी नींद और रिकवरी",
        display: `रात 10:30 तक सोएं और 7-8 घंटे की गहरी नींद लें। नींद की कमी से तनाव हार्मोन बढ़ता है जो पेट का विसरल फैट बढ़ाता है। सोने से 30 मिनट पहले मोबाइल स्क्रीन बंद कर दें!`,
        phonetic: `Raat 10:30 tak soyein aur 7-8 ghante ki gehri neend lein. Neend ki kami se stress hormone badhta hai jo pet ka visceral fat badhaata hai. Sone se 30 minute pehle mobile screen band kar dein!`,
      },
    },
    visceral: {
      en: {
        title: "Visceral Fat Reduction",
        display: `Your visceral fat rating is ${analysis?.raw?.visceralFat || 15}, which is above the safe threshold of 9. Visceral fat surrounds your liver and heart. Combine daily brisk walking with zero refined sugar and a 12-hour overnight intermittent fast to eliminate it safely.`,
        phonetic: `Your visceral fat rating is ${analysis?.raw?.visceralFat || 15}, which is above the safe threshold of 9. Visceral fat surrounds your liver and heart. Combine daily brisk walking with zero refined sugar and a 12-hour overnight intermittent fast to eliminate it safely.`,
      },
      te: {
        title: "విసెరల్ ఫ్యాట్ తగ్గించే విధానం",
        display: `మీ విసెరల్ ఫ్యాట్ ${analysis?.raw?.visceralFat || 15} గా ఉంది, ఇది 9 లోపు ఉండాలి. రోజూ బ్రిస్క్ వాకింగ్, పంచదార పూర్తిగా ఆపడం మరియు రాత్రి త్వరగా భోజనం చేయడం ద్వారా దీనిని తగ్గించవచ్చు!`,
        phonetic: `Mee visceral fat ${analysis?.raw?.visceralFat || 15} gaa undhi, idhi 9 lopu undaali. Rojoo brisk walking, panchadaara poorthigaa aapadam mariyu raathri thvaragaa bhojanam cheyadam dvaaraa deenini thagginchavachhu!`,
      },
      hi: {
        title: "विसरल फैट कैसे घटाएं",
        display: `आपका विसरल फैट स्तर ${analysis?.raw?.visceralFat || 15} है, जो 9 से कम होना चाहिए। रोजाना 30 मिनट तेज वॉक, चीनी से परहेज और रात का खाना जल्दी खाने से यह तेजी से घटता है!`,
        phonetic: `Aapka visceral fat level ${analysis?.raw?.visceralFat || 15} hai, jo 9 se kam hona chahiye. Rozana 30 minute tez walk, cheeni se parhez aur raat ka khaana jaldi khaane se yeh tezi se ghat-ta hai!`,
      },
    },
  };

  // Trigger when Dakshin is turned ON or language is switched
  useEffect(() => {
    if (!isOpen) {
      spokenSessionKeyRef.current = "";
      stopAllAudioAndSpeech();
      handleTurnOffMic();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      return;
    }

    const sessionKey = `${analysis?.id || "demo"}_${language}`;
    if (spokenSessionKeyRef.current === sessionKey) {
      return;
    }
    spokenSessionKeyRef.current = sessionKey;

    playWakeChime();

    const greeting = getShortGreeting(language);
    const greetingMsg: RobotMessage = {
      id: "greeting-" + Date.now(),
      role: "robot",
      text: greeting.display,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([greetingMsg]);

    // Speak initial greeting in trained female voice
    speakFemaleVoice(greeting.display, greeting.phonetic, language);
  }, [isOpen, analysis?.id, language, speakFemaleVoice, stopAllAudioAndSpeech]);

  // Handle customer query from Voice or Text or Habit Chips
  const handleUserDoubt = useCallback(
    async (queryText: string, specificTopic?: string) => {
      const trimmed = queryText.trim();
      if (!trimmed || loading) return;

      const currentLang = currentLanguageRef.current;

      const userMsg: RobotMessage = {
        id: "user-" + Date.now(),
        role: "user",
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText("");
      setLoading(true);

      let answerDisplay = "";
      let answerPhonetic: string | undefined = undefined;

      const q = trimmed.toLowerCase();
      if (specificTopic && habitKnowledge[specificTopic]) {
        answerDisplay = habitKnowledge[specificTopic][currentLang].display;
        answerPhonetic = habitKnowledge[specificTopic][currentLang].phonetic;
      } else if (
        // Name introduction or greeting check (including Telugu/Hindi/English)
        q.includes("lokesh") ||
        q.includes("naate") ||
        q.includes("naa peru") ||
        q.includes("mera naam") ||
        q.includes("నా పేరు") ||
        q.includes("లోకేష్") ||
        q.includes("मेरा नाम") ||
        q.includes("लोकेश") ||
        q.includes("hello") ||
        q.includes("hi") ||
        q.includes("hey") ||
        q.includes("who are you") ||
        q.includes("నమస్కా") ||
        q.includes("నమస్తే") ||
        q.includes("नमस्ते")
      ) {
        if (currentLang === "te") {
          answerDisplay =
            "నమస్కారం లోకేష్ గారు! నేను దక్షిణ్‌ని, మీ పర్సనల్ AI హెల్త్ అసిస్టెంట్‌ని. మీ BMI నివేదిక 35.1 మరియు విసెరల్ ఫ్యాట్ 15 గా ఉంది. ఆహారపు అలవాట్లు, రోజువారీ నడక, నీరు లేదా నిద్ర గురించి ఏ సందేహం ఉన్నా అడగండి, నేను సమాధానం చెబుతాను!";
          answerPhonetic =
            "Namaskaram Lokesh gaaru! Nenu Dakshin-ni, mee personal AI health assistant-ni. Mee BMI report, aahaarapu alavaatlu, rojoo nadaka ledaa nidra gurinchi emi sandeham unnaa adagandi, nenu maatlaadathaanu!";
        } else if (currentLang === "hi") {
          answerDisplay =
            "नमस्ते लोकेश जी! मैं दक्षिण हूँ, आपकी पर्सनल AI हेल्थ असिस्टेंट। आपकी BMI रिपोर्ट 35.1 और विसरल फैट 15 है। डाइट, रोजाना 10,000 कदम वॉक, पानी या नींद को लेकर जो भी सवाल हो, मुझसे सीधे पूछें!";
          answerPhonetic =
            "Namaste Lokesh ji! Main Dakshin hoon, aapki personal AI health assistant! Apni report ke baare mein baat karein!";
        } else {
          answerDisplay =
            "Hello Lokesh! I am Dakshin, your AI health coach. Talk with me about your BMI report (35.1), healthy nutrition, daily 10,000 steps, hydration, or sleep habits!";
          answerPhonetic = answerDisplay;
        }
      } else if (
        q.includes("step") ||
        q.includes("walk") ||
        q.includes("నడక") ||
        q.includes("అడుగు") ||
        q.includes("వాకింగ్") ||
        q.includes("कदम") ||
        q.includes("वॉक") ||
        q.includes("चलना")
      ) {
        answerDisplay = habitKnowledge.steps[currentLang].display;
        answerPhonetic = habitKnowledge.steps[currentLang].phonetic;
      } else if (
        q.includes("food") ||
        q.includes("diet") ||
        q.includes("eat") ||
        q.includes("meal") ||
        q.includes("ఆహార") ||
        q.includes("తిండి") ||
        q.includes("తినాలి") ||
        q.includes("డైట్") ||
        q.includes("डाइट") ||
        q.includes("खाना") ||
        q.includes("भोजन")
      ) {
        answerDisplay = habitKnowledge.diet[currentLang].display;
        answerPhonetic = habitKnowledge.diet[currentLang].phonetic;
      } else if (
        q.includes("water") ||
        q.includes("drink") ||
        q.includes("నీరు") ||
        q.includes("మంచినీరు") ||
        q.includes("నీళ్ళు") ||
        q.includes("पानी")
      ) {
        answerDisplay = habitKnowledge.water[currentLang].display;
        answerPhonetic = habitKnowledge.water[currentLang].phonetic;
      } else if (
        q.includes("sleep") ||
        q.includes("rest") ||
        q.includes("bed") ||
        q.includes("నిద్ర") ||
        q.includes("పడుకో") ||
        q.includes("नींद") ||
        q.includes("सोना")
      ) {
        answerDisplay = habitKnowledge.sleep[currentLang].display;
        answerPhonetic = habitKnowledge.sleep[currentLang].phonetic;
      } else if (
        q.includes("visceral") ||
        q.includes("belly") ||
        q.includes("tummy") ||
        q.includes("కొవ్వు") ||
        q.includes("పొట్ట") ||
        q.includes("ఫ్యాట్") ||
        q.includes("చర్బీ") ||
        q.includes("पेट")
      ) {
        answerDisplay = habitKnowledge.visceral[currentLang].display;
        answerPhonetic = habitKnowledge.visceral[currentLang].phonetic;
      } else if (
        q.includes("price") ||
        q.includes("cost") ||
        q.includes("free") ||
        q.includes("fee") ||
        q.includes("charge") ||
        q.includes("plan") ||
        q.includes("ధర") ||
        q.includes("ఖరీదు") ||
        q.includes("ఫీజు") ||
        q.includes("డబ్బు") ||
        q.includes("ఉచితం") ||
        q.includes("ప్రైస్") ||
        q.includes("प्राइस") ||
        q.includes("कीमत") ||
        q.includes("दाम") ||
        q.includes("फीस")
      ) {
        if (currentLang === "te") {
          answerDisplay =
            "యాక్టివ్‌లైఫ్ వెల్నెస్ ప్రాథమిక BMI విశ్లేషణ మరియు నా AI హెల్త్ కోచింగ్ పూర్తిగా ఉచితం! మీకు ప్రత్యేకమైన న్యూట్రిషన్ ప్లాన్ కావాలంటే మా వెల్నెస్ కోచ్‌లు వివరాలు అందిస్తారు.";
          answerPhonetic =
            "ActiveLife Wellness praathamika BMI vishleshana mariyu naa AI health coaching poorthigaa uchitham! Meeku prathyekamaina nutrition plan kaavaalante maa wellness coach-lu vivaraalu andhisthaaru.";
        } else if (currentLang === "hi") {
          answerDisplay =
            "एक्टिवलाइफ वेलनेस पर बुनियादी BMI रिपोर्ट एनालिसिस और मेरी AI हेल्थ सहायता बिल्कुल मुफ्त है! अगर आप व्यक्तिगत डाइट और न्यूट्रिशन क्लब कोचिंग प्लान चाहते हैं, तो हमारे एक्सपर्ट कोच से संपर्क करें।";
          answerPhonetic =
            "ActiveLife Wellness par buniyadi BMI report analysis aur meri AI health sahayata bilkul muft hai! Personal diet aur nutrition club plan ke liye hamare wellness coach se sampark karein.";
        } else {
          answerDisplay =
            "ActiveLife Wellness basic report analysis and my AI health coaching are completely free! If you would like a personalized nutrition club diet or one-on-one fitness coaching, our wellness coaches can share package details.";
          answerPhonetic = answerDisplay;
        }
      } else {
        const reportContext = analysis
          ? `BMI: ${analysis.raw?.bmi || 35.1}, Visceral Fat: ${analysis.raw?.visceralFat || 15}, Body Fat: ${
              analysis.raw?.bodyFat || 21.1
            }%, Muscle: ${analysis.raw?.muscleMass || 21.8}kg, Water: ${analysis.raw?.bodyWater || 52}%`
          : undefined;
        answerDisplay = await sendDakshinMessage(trimmed, currentLang, reportContext);
        answerPhonetic = currentLang === "te" ? transliterateTeluguToRoman(answerDisplay) : answerDisplay;
      }

      const robotMsg: RobotMessage = {
        id: "robot-" + Date.now(),
        role: "robot",
        text: answerDisplay,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, robotMsg]);
      setLoading(false);

      // Dakshin speaks the answer aloud in trained female voice
      speakFemaleVoice(answerDisplay, answerPhonetic, currentLang);
    },
    [loading, analysis, speakFemaleVoice]
  );

  // Keep handleUserDoubtRef synchronized
  useEffect(() => {
    handleUserDoubtRef.current = handleUserDoubt;
  }, [handleUserDoubt]);

  if (!isOpen) return null;

  // MINIMIZED FLOATING ROBOT WIDGET
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 bg-slate-950/90 backdrop-blur-xl border border-cyan-500/40 text-white rounded-3xl p-3 shadow-2xl shadow-cyan-950/50 max-w-sm animate-in fade-in duration-200">
        <div className="relative shrink-0">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border border-cyan-400/60 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-teal-400/20 animate-pulse"></div>
            <svg className="w-7 h-7 text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="12" x="3" y="6" rx="4"/>
              <circle cx="9" cy="11" r="1.5" fill="currentColor"/>
              <circle cx="15" cy="11" r="1.5" fill="currentColor"/>
              <path d="M9 15c.8.6 1.8 1 3 1s2.2-.4 3-1"/>
              <path d="M12 2v4"/>
              <circle cx="12" cy="2" r="1" fill="currentColor"/>
            </svg>
          </div>
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4] border border-slate-950" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-300">
              Dakshin AI
            </span>
            <span className="text-[10px] text-slate-400">
              {isSpeaking
                ? (language === "te" ? "మాట్లాడుతోంది..." : language === "hi" ? "बोल रही हूँ..." : "Speaking...")
                : isMicHeldOn
                ? (language === "te" ? "వింటోంది..." : language === "hi" ? "सुन रही हूँ..." : "Listening...")
                : (language === "te" ? "సిద్ధంగా ఉంది" : language === "hi" ? "तैयार हूँ" : "Ready")}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 truncate mt-0.5">
            {isMicHeldOn
              ? (language === "te" ? "వింటోంది... మాట్లాడండి" : language === "hi" ? "सुन रही हूँ... बोलिए" : "Listening... speak now")
              : (language === "te" ? "మాట్లాడటానికి నొక్కండి" : language === "hi" ? "बात करने के लिए टैप करें" : "Tap to speak")}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              if (isMicHeldOn) handleTurnOffMic();
              else handleTurnOnContinuousMic();
            }}
            className={`p-2.5 rounded-xl font-bold transition-all shadow-md ${
              isMicHeldOn
                ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-500/40 animate-pulse"
                : "bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-cyan-500/30"
            }`}
            title={isMicHeldOn ? "Stop mic" : "Start speaking"}
          >
            {isMicHeldOn ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setIsMinimized(false)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            title="Expand Dakshin AI"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              playSleepChime();
              onToggle(false);
            }}
            className="p-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white transition-colors shadow-md shadow-rose-950/40"
            title="Turn OFF Dakshin"
          >
            <Power className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // EXPANDED FUTURISTIC SPEAKING CHATBOT MODAL (CLEAN HOLOGRAPHIC DESIGN)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Outer Glow Container */}
      <div className="relative w-full max-w-lg bg-slate-950 rounded-[2.5rem] shadow-[0_0_60px_rgba(6,182,212,0.18)] border border-cyan-500/30 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Background Ambient Glowing Orbs */}
        <div className="absolute top-10 left-8 w-44 h-44 rounded-full bg-purple-600/20 blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute top-16 right-8 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full bg-teal-500/15 blur-3xl pointer-events-none -z-0"></div>

        {/* 1. TOP CONTROL BAR */}
        <div className="relative z-10 px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/10 bg-slate-950/60 backdrop-blur-md">
          {/* Brand with Glowing Neon Dot */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_8px_#06b6d4]"></span>
            </span>
            <div>
              <span className="text-xs font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 uppercase">
                Dakshin AI
              </span>
            </div>
          </div>

          {/* Right Controls: Language Selector, Mute, Minimize, Turn OFF */}
          <div className="flex items-center gap-2">
            {/* Language Pills (English, తెలుగు, हिन्दी) */}
            <div className="flex items-center bg-white/5 backdrop-blur-md rounded-xl p-0.5 border border-white/10">
              {DAKSHIN_LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => onLanguageChange(l.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    language === l.id
                      ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)] scale-105"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {l.native}
                </button>
              ))}
            </div>

            {/* Audio Mute/Unmute Toggle */}
            <button
              onClick={() => {
                if (soundEnabled) {
                  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
                setSoundEnabled(!soundEnabled);
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
              title={soundEnabled ? "Mute voice" : "Enable voice"}
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-slate-500" />
              )}
            </button>

            {/* Minimize button */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
              title="Minimize widget"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>

            {/* Turn OFF Button (Solid Glowing Red Pill) */}
            <button
              type="button"
              onClick={() => {
                playSleepChime();
                onToggle(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-[0_0_14px_rgba(225,29,72,0.4)] transition-all active:scale-95"
              title="Turn OFF Dakshin AI"
            >
              <Power className="h-3.5 w-3.5" />
              <span>Turn OFF</span>
            </button>
          </div>
        </div>

        {/* 2. HERO HOLOGRAPHIC SPEAKING CHATBOT DISPLAY */}
        <div className="relative z-10 px-6 pt-5 pb-3 flex flex-col items-center text-center">
          {/* Glowing Circular Hologram Avatar Container */}
          <div className="relative flex items-center justify-center my-2">
            {/* Pulsing Neon Orb Behind Avatar */}
            <div
              className={`absolute -inset-3 rounded-full bg-gradient-to-tr from-cyan-500/30 via-purple-500/30 to-emerald-400/30 blur-xl transition-all duration-500 ${
                isSpeaking
                  ? "scale-110 opacity-95 animate-pulse"
                  : isMicHeldOn
                  ? "scale-105 opacity-85"
                  : "opacity-40"
              }`}
            ></div>

            {/* Outer Iridescent Gradient Ring */}
            <div className="relative w-28 h-28 rounded-full p-[2.5px] bg-gradient-to-tr from-cyan-400 via-purple-500 to-emerald-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]">
              {/* Inner Dark Glass Orb */}
              <div className="w-full h-full rounded-full bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden border border-white/10 relative">
                <div className="absolute inset-0 bg-radial from-cyan-500/25 via-transparent to-transparent"></div>

                {/* Cute Smiling Holographic Robot Head */}
                <svg
                  className={`w-14 h-14 text-cyan-300 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.9)] ${
                    isSpeaking ? "scale-105" : isMicHeldOn ? "scale-100" : "scale-95"
                  }`}
                  viewBox="0 0 48 48"
                  fill="none"
                >
                  <line x1="24" y1="12" x2="24" y2="6" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="24" cy="5" r="2.5" fill="#38bdf8" className="animate-pulse" />

                  <rect
                    x="10"
                    y="12"
                    width="28"
                    height="24"
                    rx="8"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    fill="rgba(6, 182, 212, 0.08)"
                  />

                  <rect x="6" y="19" width="3" height="10" rx="1.5" fill="#38bdf8" />
                  <rect x="39" y="19" width="3" height="10" rx="1.5" fill="#38bdf8" />

                  <circle cx="18" cy="22" r="3" fill="#22d3ee" />
                  <circle cx="30" cy="22" r="3" fill="#22d3ee" />

                  <path
                    d="M18 28C19.8 30.5 22 31.5 24 31.5C26 31.5 28.2 30.5 30 28"
                    stroke="#22d3ee"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Heading Text */}
          <div className="mt-2 space-y-1">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
              {language === "te"
                ? "నమస్కారం! నేను ఎలా సహాయపడగలను?"
                : language === "hi"
                ? "नमस्ते! मैं आपकी कैसे सहायता कर सकती हूँ?"
                : "Hello! How can I assist you today?"}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {isSpeaking
                ? (language === "te" ? "మాట్లాడుతోంది..." : language === "hi" ? "बोल रही हूँ..." : "Speaking...")
                : isMicHeldOn
                ? (language === "te" ? "వింటోంది... మాట్లాడండి" : language === "hi" ? "सुन रही हूँ... बोलिए" : "Listening... speak now")
                : (language === "te" ? "సిద్ధంగా ఉంది" : language === "hi" ? "तैयार हूँ" : "Ready to talk")}
            </p>
          </div>

          {/* 3. FLUID NEON RIBBON SOUND WAVE */}
          <div className="w-full flex justify-center mt-1">
            <HolographicSoundWave isSpeaking={isSpeaking} isListening={isMicHeldOn} />
          </div>
        </div>

        {/* 4. QUICK SUGGESTION HABIT PILLS */}
        <div className="relative z-10 px-4 py-2 border-y border-white/10 bg-slate-950/40 backdrop-blur-md flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            {language === "te" ? "అడగండి:" : language === "hi" ? "पूछें:" : "Ask:"}
          </span>

          <button
            onClick={() => handleUserDoubt(habitKnowledge.steps[language].title, "steps")}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-xs font-medium text-slate-300 hover:text-cyan-200 transition-all active:scale-95 shadow-xs"
          >
            <Footprints className="h-3.5 w-3.5 text-cyan-400" />
            <span>{language === "te" ? "రోజువారీ నడక" : language === "hi" ? "डेली वॉक" : "Daily Steps"}</span>
          </button>

          <button
            onClick={() => handleUserDoubt(habitKnowledge.diet[language].title, "diet")}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/40 text-xs font-medium text-slate-300 hover:text-emerald-200 transition-all active:scale-95 shadow-xs"
          >
            <Utensils className="h-3.5 w-3.5 text-emerald-400" />
            <span>{language === "te" ? "ఆహారపు అలవాట్లు" : language === "hi" ? "खान-पान" : "Food Habits"}</span>
          </button>

          <button
            onClick={() => handleUserDoubt(habitKnowledge.water[language].title, "water")}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-400/40 text-xs font-medium text-slate-300 hover:text-blue-200 transition-all active:scale-95 shadow-xs"
          >
            <Droplets className="h-3.5 w-3.5 text-blue-400" />
            <span>{language === "te" ? "మంచినీరు" : language === "hi" ? "पानी का नियम" : "Water Intake"}</span>
          </button>

          <button
            onClick={() => handleUserDoubt(habitKnowledge.sleep[language].title, "sleep")}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/40 text-xs font-medium text-slate-300 hover:text-purple-200 transition-all active:scale-95 shadow-xs"
          >
            <Moon className="h-3.5 w-3.5 text-purple-400" />
            <span>{language === "te" ? "మంచి నిద్ర" : language === "hi" ? "अच्छी नींद" : "Good Sleep"}</span>
          </button>

          <button
            onClick={() => handleUserDoubt(habitKnowledge.visceral[language].title, "visceral")}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/40 text-xs font-medium text-slate-300 hover:text-rose-200 transition-all active:scale-95 shadow-xs"
          >
            <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
            <span>{language === "te" ? "విసెరల్ ఫ్యాట్" : language === "hi" ? "विसरल फैट" : "Visceral Fat"}</span>
          </button>
        </div>

        {/* 5. NOTICE / LIVE SPEECH TRANSCRIPTION BANNER */}
        {micNotice && (
          <div className="relative z-10 bg-amber-950/40 border-b border-amber-500/30 px-4 py-2 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>{micNotice}</span>
          </div>
        )}

        {isMicHeldOn && (
          <div className="relative z-10 bg-cyan-950/40 border-b border-cyan-500/20 px-4 py-2 text-cyan-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping shrink-0"></span>
              <span className="font-semibold text-cyan-300 shrink-0">
                {language === "te" ? "వింటోంది:" : language === "hi" ? "सुन रही हूँ:" : "Listening:"}
              </span>
              <span className="italic truncate text-white">
                {interimTranscript ? `"${interimTranscript}"` : (language === "te" ? "మాట్లాడండి..." : language === "hi" ? "बोलिए..." : "Speak now...")}
              </span>
            </div>
          </div>
        )}

        {/* 6. CONVERSATION TRANSCRIPT (FROSTED GLASS BUBBLES) */}
        <div className="relative z-10 flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/80">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 items-start ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "robot" && (
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shrink-0 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] sm:max-w-[80%] backdrop-blur-md shadow-md ${
                  msg.role === "user"
                    ? "bg-cyan-500/20 text-white border border-cyan-400/40 rounded-tr-xs"
                    : "bg-white/5 text-slate-100 border border-white/10 rounded-tl-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1 border-b border-white/10 pb-1">
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                    {msg.role === "robot" ? "Dakshin AI" : user?.fullName || "You"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                </div>
                <p className="whitespace-pre-line text-slate-200">{msg.text}</p>

                {msg.role === "robot" && (
                  <button
                    onClick={() => speakFemaleVoice(msg.text, undefined, language)}
                    className="mt-2 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <Volume2 className="h-3 w-3" />
                    Speak aloud again
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 pl-10 text-xs font-semibold text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
              Dakshin AI is preparing your voice response...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 7. BOTTOM INTERACTIVE CONTROLS (MIC TOGGLE + TEXT INPUT) */}
        <div className="relative z-10 p-4 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl flex flex-col gap-2.5">
          {/* MIC ON / OFF TOGGLE */}
          <button
            type="button"
            id="dakshin-mic-btn"
            onClick={() => {
              if (isMicHeldOn) {
                handleTurnOffMic();
              } else {
                handleTurnOnContinuousMic();
              }
            }}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md active:scale-98 ${
              isMicHeldOn
                ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-[0_0_16px_rgba(225,29,72,0.4)] animate-pulse"
                : "bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-[0_0_16px_rgba(6,182,212,0.3)] hover:opacity-95"
            }`}
          >
            {isMicHeldOn ? (
              <>
                <MicOff className="h-4 w-4" />
                <span>
                  {language === "te" ? "మైక్ ఆపండి" : language === "hi" ? "माइक बंद करें" : "Stop Mic"}
                </span>
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                <span>
                  {language === "te" ? "మాట్లాడండి" : language === "hi" ? "बात करें" : "Tap to Speak"}
                </span>
              </>
            )}
          </button>

          {/* Fallback Text Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUserDoubt(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                language === "te"
                  ? "మీ సందేహాన్ని ఇక్కడ టైప్ చేయండి..."
                  : language === "hi"
                  ? "अपना सवाल यहाँ लिखें..."
                  : "Type your question..."
              }
              className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold hover:opacity-90 disabled:opacity-30 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              title="Send text query"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
