/**
 * services/api.js  —  Axios instance for Kirba Bites REST API
 * ─────────────────────────────────────────────────────────────
 * This file creates a pre-configured Axios instance that every
 * service module (auth, restaurants, orders, etc.) will import.
 *
 * TO CONNECT THE BACKEND:
 *  1. Uncomment the baseURL line and set the correct URL
 *     (e.g., "http://localhost:5000/api" in development,
 *            "https://api.kirbabites.com" in production).
 *  2. If using JWT auth, the request interceptor below will
 *     automatically attach the token from localStorage — just
 *     make sure AuthContext stores it there on login.
 */

import axios from "axios";

// ── Instance ─────────────────────────────────────────────────
const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  baseURL: "/api", // placeholder — update when backend is ready
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach JWT token ─────────────────────
api.interceptors.request.use(
  (config) => {
    // TODO: read token from AuthContext / localStorage once auth is wired
    // const token = localStorage.getItem("kb_token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: global error handling ───────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: dispatch logout action from AuthContext on 401
      console.warn("[api] Unauthorized — redirect to login");
    }
    return Promise.reject(error);
  }
);

export default api;
