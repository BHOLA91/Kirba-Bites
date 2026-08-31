/**
 * context/AuthContext.jsx  —  Real Supabase-backed authentication context
 * ──────────────────────────────────────────────────────────────────
 * Wraps the whole app (see main.jsx). Exposes:
 *
 *  user     — Supabase User object | null
 *  profile  — public.profiles row | null (has role, name, etc.)
 *  role     — "customer" | "owner" | null
 *  isOwner  — bool
 *  isCustomer — bool
 *  loading  — true while initial session is being resolved on app load
 *  signOut  — async fn, clears session
 *
 * NOTE: signUp and signIn are NOT exposed through context — import them
 * directly from services/auth.js inside the page components that need
 * them. Context exists to share the current session state; it doesn't
 * need to own the auth *actions* (which update state via onAuthStateChange).
 *
 * Session flow:
 *  1. On mount: getSession() → populate user + fetch profile
 *  2. onAuthStateChange → keeps state in sync after login/logout/OAuth
 *  3. signOut clears both user and profile
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase }  from "../services/supabaseClient";
import { signOut as authSignOut } from "../services/auth";

// ── Context ───────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  // true until we've resolved the initial session on app load
  const [loading, setLoading] = useState(true);

  // Derived convenience values
  const role       = profile?.role ?? null;
  const isOwner    = role === "owner";
  const isCustomer = role === "customer";

  /**
   * profileComplete — true only when the profile has a role AND the
   * minimum required field for that role has been filled in.
   *
   * Customers  need: role + username (set during signup / OAuthComplete)
   * Owners     need: role  (the restaurant row has r_uid; checking role is enough
   *                  because the restaurant insert happens in the same transaction)
   *
   * A user whose profile.role is null is a first-time Google OAuth user who
   * hasn't completed the onboarding form yet — they must go to /complete-profile.
   */
  const profileComplete = !!(
    profile?.role === "customer" ? profile.username : profile?.role === "owner"
  );

  /** Fetch the profile row for a given userId from public.profiles */
  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error && data) setProfile(data);
    return data ?? null;
  }, []);

  useEffect(() => {
    let mounted = true;

    // ── 1. Resolve existing session on app load ────────────────
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // ── 2. Listen for auth state changes ──────────────────────
    // Fires on: login, logout, token refresh, OAuth redirect
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      // Mark loading done on first event (covers OAuth redirect case)
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  /** Sign out — clears session on Supabase and local state */
  const signOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
    setProfile(null);
  }, []);

  /**
   * refreshProfile — call this after completing OAuth profile setup
   * (OAuthComplete.jsx) so AuthContext reflects the new role without
   * needing a full re-login.
   */
  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const value = {
    user,
    profile,
    role,
    isOwner,
    isCustomer,
    profileComplete,
    loading,
    signOut,
    refreshProfile,
    // Legacy aliases (for any code still referencing the old shape)
    isLoggedIn: !!user,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>. " +
      "Wrap your app in <AuthProvider> in main.jsx.");
  }
  return ctx;
}

export default AuthContext;
