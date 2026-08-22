/**
 * context/AuthContext.jsx  —  Authentication context skeleton
 * ─────────────────────────────────────────────────────────────
 * Provides the logged-in user state to the entire app.
 *
 * Supports TWO account types:
 *   • "customer" — regular student browsing menus / placing orders
 *   • "owner"    — restaurant/stall owner managing their listing
 *
 * TO WIRE UP THE BACKEND:
 *  1. Replace the stub login/logout functions with real API calls
 *     using api.js (e.g., POST /auth/login, POST /auth/owner/login).
 *  2. Store the JWT returned by the API in localStorage with key
 *     "kb_token" so the api.js interceptor picks it up automatically.
 *  3. Call socket.connect() after successful login if real-time is needed.
 */

import { createContext, useContext, useState, useCallback } from "react";

// ── Context shape ─────────────────────────────────────────────
const AuthContext = createContext({
  user:    null,   // { id, name, email, role: "customer" | "owner" }
  isLoggedIn: false,
  isOwner: false,
  login:   async () => {},
  logout:  () => {},
});

// ── Provider component ────────────────────────────────────────
export function AuthProvider({ children }) {
  // user shape: { id, name, email, role: "customer" | "owner", restaurantId? }
  const [user, setUser] = useState(null);

  /**
   * login  —  stub; replace with real API call
   * @param {string} email
   * @param {string} password
   * @param {"customer"|"owner"} role
   */
  const login = useCallback(async (email, password, role = "customer") => {
    // TODO: call api.post("/auth/login", { email, password, role })
    // const { data } = await api.post("/auth/login", { email, password });
    // localStorage.setItem("kb_token", data.token);
    // setUser(data.user);

    // ── Temporary stub so UI doesn't crash during development ──
    console.log("[AuthContext] login stub called", { email, role });
    setUser({ id: "stub-1", name: "Student", email, role });
  }, []);

  /** logout  —  clears session and redirects to landing */
  const logout = useCallback(() => {
    // TODO: optionally call api.post("/auth/logout")
    localStorage.removeItem("kb_token");
    setUser(null);
  }, []);

  const value = {
    user,
    isLoggedIn: !!user,
    isOwner:    user?.role === "owner",
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Convenience hook ──────────────────────────────────────────
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
