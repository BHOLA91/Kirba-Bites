/**
 * main.jsx  —  React application entry point
 * ─────────────────────────────────────────────────────────────────
 * Mounts the React tree to the #root DOM node.
 * StrictMode is enabled during development only (Vite handles this
 * automatically in the template, but we're explicit here).
 */

import React    from "react";
import ReactDOM from "react-dom/client";
import App      from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
