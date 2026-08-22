/**
 * services/socket.js  —  Socket.io client setup for Kirba Bites
 * ───────────────────────────────────────────────────────────────
 * This file exports a socket instance for real-time features:
 *
 *  Customer side:
 *   • Receive live "open/closed" status updates for restaurants
 *   • (Future) order status push notifications
 *
 *  Owner side:
 *   • Receive live "new order" notifications on the dashboard
 *   • Broadcast open/closed toggle to all connected customers
 *
 * TO CONNECT THE BACKEND:
 *  1. Install: npm install socket.io-client
 *  2. Uncomment the import and socket creation below.
 *  3. Replace the URL with your backend's WebSocket URL.
 *  4. In components, import { socket } and call
 *     socket.on("event-name", handler) in a useEffect.
 *     Remember to call socket.off("event-name", handler)
 *     in the useEffect cleanup to avoid listener leaks.
 *
 * Example usage in a component:
 *   import { socket } from "../services/socket";
 *   useEffect(() => {
 *     socket.connect();
 *     socket.on("restaurant:status", (data) => { ... });
 *     return () => {
 *       socket.off("restaurant:status");
 *       socket.disconnect();
 *     };
 *   }, []);
 */

// import { io } from "socket.io-client";

// export const socket = io(
//   import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
//   {
//     autoConnect: false,  // connect manually after auth so we can pass the token
//     auth: (cb) => {
//       const token = localStorage.getItem("kb_token");
//       cb({ token });
//     },
//   }
// );

// ── Placeholder export (remove when backend is ready) ─────────
export const socket = null;
