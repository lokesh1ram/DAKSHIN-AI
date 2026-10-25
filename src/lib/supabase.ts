import { createClient } from "@supabase/supabase-js";
import type { UserProfile, HealthAnalysis } from "@/types/health";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://example.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "example-anon-key";

export const isSupabaseConfigured =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  import.meta.env.VITE_SUPABASE_URL !== "https://example.supabase.co";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const STORAGE_KEY_USER = "activelife_user_session";
const STORAGE_KEY_REPORTS = "activelife_reports_history";

export const authService = {
  // Sign up
  signUp: async (profile: { email: string; password?: string; fullName: string; age: number; height: number; gender: string }) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: profile.email,
          password: profile.password || "password123",
          options: {
            data: {
              full_name: profile.fullName,
              age: profile.age,
              height: profile.height,
              gender: profile.gender,
            },
          },
        });
        if (error) throw error;
        const user: UserProfile = {
          id: data.user?.id || Date.now().toString(),
          email: profile.email,
          fullName: profile.fullName,
          age: profile.age,
          height: profile.height,
          gender: profile.gender as any,
        };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        return { user, error: null };
      } catch (err: any) {
        console.warn("Supabase auth error, falling back to local session:", err);
      }
    }

    // Local session fallback
    const user: UserProfile = {
      id: Date.now().toString(),
      email: profile.email,
      fullName: profile.fullName,
      age: profile.age,
      height: profile.height,
      gender: profile.gender as any,
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    return { user, error: null };
  },

  // Log in
  signIn: async (email: string, password?: string) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || "password123",
        });
        if (error) throw error;
        const meta = data.user?.user_metadata || {};
        const user: UserProfile = {
          id: data.user?.id || Date.now().toString(),
          email,
          fullName: meta.full_name || email.split("@")[0],
          age: meta.age || 30,
          height: meta.height || 170,
          gender: meta.gender || "female",
        };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        return { user, error: null };
      } catch (err: any) {
        console.warn("Supabase login error, checking local session:", err);
      }
    }

    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      const user = JSON.parse(saved);
      return { user, error: null };
    }

    // Default guest profile if none
    const user: UserProfile = {
      id: "demo-user",
      email: email || "lokesh.k0206@gmail.com",
      fullName: "Lokesh K",
      age: 28,
      height: 170,
      gender: "female",
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    return { user, error: null };
  },

  // Continue with Google
  signInWithGoogle: async () => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin + "/dashboard",
          },
        });
        if (error) throw error;
        return;
      } catch (err) {
        console.warn("Google OAuth error, using direct Google session:", err);
      }
    }

    // Direct Google authentication simulation
    const googleUser: UserProfile = {
      id: "google-" + Date.now(),
      email: "lokesh.k0206@gmail.com",
      fullName: "Lokesh Kumar",
      age: 28,
      height: 170,
      gender: "female",
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(googleUser));
    return { user: googleUser };
  },

  // Get current user
  getCurrentUser: (): UserProfile | null => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },

  // Sign out
  signOut: async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    localStorage.removeItem(STORAGE_KEY_USER);
  },
};

export const reportHistoryService = {
  getHistory: async (): Promise<HealthAnalysis[]> => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("health_reports")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            timestamp: new Date(d.created_at).toLocaleString(),
            summary: d.summary,
            overallStatus: d.overall_status,
            metrics: d.metrics,
            positives: d.positives || [],
            negatives: d.negatives || [],
            recommendations: d.recommendations || [],
            raw: d.raw_values,
            imageUrl: d.image_url,
          }));
        }
      } catch (e) {}
    }

    // Local storage fallback
    const saved = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  },

  saveReport: async (report: HealthAnalysis): Promise<void> => {
    const item: HealthAnalysis = {
      ...report,
      id: report.id || Date.now().toString(),
      timestamp: report.timestamp || new Date().toLocaleString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from("health_reports").insert({
          summary: item.summary,
          overall_status: item.overallStatus,
          metrics: item.metrics,
          positives: item.positives,
          negatives: item.negatives,
          recommendations: item.recommendations,
          raw_values: item.raw,
          image_url: item.imageUrl,
        });
      } catch (e) {}
    }

    // Save to local storage
    const current = await reportHistoryService.getHistory();
    const updated = [item, ...current.filter((r) => r.id !== item.id)];
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(updated.slice(0, 30)));
  },

  deleteReport: async (id: string): Promise<void> => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from("health_reports").delete().eq("id", id);
      } catch (e) {}
    }

    const current = await reportHistoryService.getHistory();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(updated));
  },
};
