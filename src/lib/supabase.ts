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
          password: profile.password || "",
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
        if (!data.user || !data.session) {
          return {
            user: null,
            error: "Check your email to confirm your account, then log in.",
          };
        }
        const user: UserProfile = {
          id: data.user.id,
          email: profile.email,
          fullName: profile.fullName,
          age: profile.age,
          height: profile.height,
          gender: profile.gender as any,
        };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        return { user, error: null };
      } catch (err: any) {
        return { user: null, error: err.message || "Could not create your Supabase account." };
      }
    }

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
          password: password || "",
        });
        if (error) throw error;
        if (!data.user || !data.session) {
          return { user: null, error: "Sign in did not return an authenticated session." };
        }
        const meta = data.user?.user_metadata || {};
        const user: UserProfile = {
          id: data.user.id,
          email,
          fullName: meta.full_name || email.split("@")[0],
          age: meta.age || 30,
          height: meta.height || 170,
          gender: meta.gender || "female",
        };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        return { user, error: null };
      } catch (err: any) {
        return { user: null, error: err.message || "Could not sign in to Supabase." };
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
        return { user: null, error: null };
      } catch (err) {
        return {
          user: null,
          error: err instanceof Error ? err.message : "Could not sign in with Google.",
        };
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

function getReportsStorageKey() {
  const user = authService.getCurrentUser();
  return `${STORAGE_KEY_REPORTS}:${user?.id || "guest"}`;
}

async function getCurrentAccessToken() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.access_token || null;
}

async function requestReportsApi(path: string, token: string, init?: RequestInit) {
  let response: Response;
  try {
    response = await fetch(`/api/reports${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new Error("Cannot reach the report backend. Start the app with `npm run dev`.");
  }

  if (!response.ok) {
    let message = "Could not complete the Supabase report request.";
    try {
      const body = await response.json();
      if (typeof body.error === "string") message = body.error;
    } catch {
      // Keep the request error when the backend response is not JSON.
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const reportHistoryService = {
  getHistory: async (): Promise<HealthAnalysis[]> => {
    let localHistory: HealthAnalysis[] = [];
    const storageKey = getReportsStorageKey();
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        localHistory = JSON.parse(saved);
      } catch {
        localHistory = [];
      }
    }

    const token = await getCurrentAccessToken();
    if (!token) return localHistory;

    const data = await requestReportsApi("", token) as Array<Record<string, any>>;
    return data.map((report) => ({
      id: String(report.id),
      timestamp: new Date(report.created_at).toLocaleString(),
      summary: report.summary,
      overallStatus: report.overall_status,
      metrics: report.metrics || [],
      positives: report.positives || [],
      negatives: report.negatives || [],
      recommendations: report.recommendations || [],
      raw: report.raw_values,
    }));
  },

  saveReport: async (report: HealthAnalysis): Promise<HealthAnalysis> => {
    const token = await getCurrentAccessToken();
    if (token) {
      const saved = await requestReportsApi("", token, {
        method: "POST",
        body: JSON.stringify(report),
      });
      return {
        id: String(saved.id),
        timestamp: new Date(saved.created_at).toLocaleString(),
        summary: saved.summary,
        overallStatus: saved.overall_status,
        metrics: saved.metrics || [],
        positives: saved.positives || [],
        negatives: saved.negatives || [],
        recommendations: saved.recommendations || [],
        raw: saved.raw_values,
      };
    }

    const item = {
      ...report,
      id: report.id || Date.now().toString(),
      timestamp: report.timestamp || new Date().toLocaleString(),
    };
    const storageKey = getReportsStorageKey();
    const current = await reportHistoryService.getHistory();
    const updated = [item, ...current.filter((r) => r.id !== item.id)];
    localStorage.setItem(storageKey, JSON.stringify(updated.slice(0, 30)));
    return item;
  },

  deleteReport: async (id: string): Promise<void> => {
    const token = await getCurrentAccessToken();
    if (token) {
      await requestReportsApi(`/${encodeURIComponent(id)}`, token, { method: "DELETE" });
      return;
    }

    const current = await reportHistoryService.getHistory();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(getReportsStorageKey(), JSON.stringify(updated));
  },
};
