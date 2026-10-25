export type Gender = "male" | "female" | "other";

export type HealthStatus = "good" | "borderline" | "at-risk";

export interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  status: HealthStatus;
  healthyRange: string;
  explanation: string;
}

export interface HealthReport {
  age: number;
  gender: Gender;
  weight: number;
  height?: number;
  visceralFat: number;
  trunkSubFat?: number;
  bodyFat: number;
  bodyAge?: number;
  bmi: number;
  bmr?: number;
  skeletalMuscle?: number;
  muscleMass: number;
  metabolicAge?: number;
  bodyWater: number;
  boneMass?: number;
  notes?: string;
  proofDocUrl?: string;
}

export interface HealthAnalysis {
  id?: string;
  timestamp?: string;
  summary: string;
  overallStatus: HealthStatus;
  metrics: HealthMetric[];
  positives: string[];
  negatives: string[];
  recommendations: string[];
  raw?: HealthReport;
  imageUrl?: string;
}

export type SupportedLanguage = "en" | "te" | "hi" | "ta";

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  te: "Telugu (తెలుగు)",
  hi: "Hindi (हिन्दी)",
  ta: "Tamil (தமிழ்)",
};

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  age: number;
  height: number;
  gender: Gender;
}
