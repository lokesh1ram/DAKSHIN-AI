import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const publishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

const authClient =
  supabaseUrl && publishableKey
    ? createClient(supabaseUrl, publishableKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
const adminClient =
  supabaseUrl && secretKey
    ? createClient(supabaseUrl, secretKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

export const supabaseEnabled = Boolean(authClient && adminClient);

export async function requireSupabaseUser(req, res, next) {
  if (!authClient || !adminClient) {
    return res.status(503).json({
      error:
        "Supabase backend is not configured. Set the project URL, publishable key, and rotated SUPABASE_SECRET_KEY in the backend environment.",
    });
  }

  const authorization = req.get("authorization") || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  if (!token) {
    return res.status(401).json({ error: "Sign in to access saved reports." });
  }

  try {
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "Your session is invalid or expired. Sign in again." });
    }
    req.supabaseUser = data.user;
    next();
  } catch (error) {
    console.error("Could not validate Supabase session:", error);
    return res.status(503).json({ error: "Could not verify your Supabase session." });
  }
}

export function getSupabaseAdminClient() {
  return adminClient;
}
