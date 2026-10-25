import React, { useState } from "react";
import { authService } from "@/lib/supabase";

interface AuthPageProps {
  onNavigate: (page: "landing" | "auth" | "dashboard") => void;
  onLoginSuccess: (user: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [tab, setTab] = useState<"login" | "signup" | "forgot">("signup");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState(28);
  const [height, setHeight] = useState(170);
  const [gender, setGender] = useState("female");
  const [email, setEmail] = useState("lokesh.k0206@gmail.com");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { user } = await authService.signUp({
      email,
      password,
      fullName: fullName || "Lokesh K",
      age: Number(age) || 28,
      height: Number(height) || 170,
      gender,
    });
    setLoading(false);
    onLoginSuccess(user);
    onNavigate("dashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { user } = await authService.signIn(email, password);
    setLoading(false);
    onLoginSuccess(user);
    onNavigate("dashboard");
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    const res = await authService.signInWithGoogle();
    setLoading(false);
    if (res?.user) {
      onLoginSuccess(res.user);
      onNavigate("dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center px-4 py-12">
      {/* Top Brand Logo */}
      <div
        onClick={() => onNavigate("landing")}
        className="flex items-center gap-2.5 mb-8 cursor-pointer"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">ActiveLife Wellness</span>
      </div>

      {/* Auth Card (Screenshot 5) */}
      <div className="w-full max-w-[430px] rounded-2xl border border-slate-200/90 bg-white p-7 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Welcome</h2>
        <p className="mt-1 text-xs text-slate-500">Log in or create an account to get your wellness insights.</p>

        {/* Tab Toggle */}
        <div className="mt-5 grid grid-cols-3 rounded-lg bg-slate-100 p-1 text-center text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`rounded-md py-2 transition-all ${tab === "login" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"}`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`rounded-md py-2 transition-all ${tab === "signup" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"}`}
          >
            Sign up
          </button>
          <button
            type="button"
            onClick={() => setTab("forgot")}
            className={`rounded-md py-2 transition-all ${tab === "forgot" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"}`}
          >
            Forgot?
          </button>
        </div>

        {/* Sign Up Form */}
        {tab === "signup" && (
          <form onSubmit={handleSignup} className="mt-5 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Full name</label>
              <input
                type="text"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Age (years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-[#15803D] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        )}

        {/* Log In Form */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="mt-5 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-[#15803D] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        )}

        {/* Forgot Password */}
        {tab === "forgot" && (
          <form onSubmit={(e) => { e.preventDefault(); alert("Password reset link sent to your email!"); setTab("login"); }} className="mt-5 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Registered Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-[#15803D] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
            >
              Send reset link
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs text-slate-400">
            <span className="bg-white px-2">or</span>
          </div>
        </div>

        {/* Continue with Google (Exact requirement) */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
};
