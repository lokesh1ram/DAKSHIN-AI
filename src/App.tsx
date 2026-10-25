import React, { useState, useEffect } from "react";
import { LandingPage } from "@/pages/LandingPage";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { authService } from "@/lib/supabase";
import type { UserProfile } from "@/types/health";

export function App() {
  const [currentPage, setCurrentPage] = useState<"landing" | "auth" | "dashboard">("landing");
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setCurrentPage("dashboard");
    }
  }, []);

  return (
    <div>
      {currentPage === "landing" && (
        <LandingPage onNavigate={setCurrentPage} />
      )}

      {currentPage === "auth" && (
        <AuthPage
          onNavigate={setCurrentPage}
          onLoginSuccess={(u) => {
            setUser(u);
            setCurrentPage("dashboard");
          }}
        />
      )}

      {currentPage === "dashboard" && (
        <DashboardPage
          user={user}
          onNavigate={setCurrentPage}
        />
      )}
    </div>
  );
}
export default App;
