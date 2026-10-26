/**
 * pages/Contact.jsx
 * ──────────────────────────────────────────────────────────────────
 * Contact / help page — accessible to both customers and owners.
 *
 * - Pre-fills email from AuthContext if the user is logged in (editable)
 * - On submit: inserts a row into contact_messages via services/contact.js
 * - On success: replaces the form with a confirmation state
 *
 * Required Supabase table (run SQL before testing this page):
 * See the SQL artifact separately.
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { submitContactMessage } from "../services/contact";

export default function Contact() {
  const { user, profile } = useAuth();

  const [email,   setEmail]   = useState(user?.email ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    setLoading(true);
    setError(null);

    const { error: submitErr } = await submitContactMessage({
      userId:  user?.id ?? null,
      email:   email.trim(),
      message: message.trim(),
    });

    setLoading(false);

    if (submitErr) {
      setError("Something went wrong — please try again in a moment.");
    } else {
      setSuccess(true);
    }
  }

  const displayName = profile?.first_name ?? user?.email?.split("@")[0] ?? null;

  return (
    <div className="min-h-screen bg-cream py-14 sm:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 sm:mb-12">
          <p className="font-body text-xs font-bold tracking-[0.2em] uppercase
            text-burntorange mb-2">
            Support
          </p>
          <h1 className="font-display font-black text-forest text-3xl sm:text-4xl leading-tight">
            Need help?
          </h1>
          <p className="font-body text-ink-muted mt-3 text-base max-w-md leading-relaxed">
            We're here for you — reach out and we'll get back to you soon.
          </p>
        </div>

        {success ? (
          /* ── Success state ───────────────────────────────────── */
          <div className="bg-white rounded-3xl p-8 sm:p-10
            shadow-[0_4px_24px_rgba(29,59,42,0.07)] text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-emerald-500"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display font-bold text-forest text-2xl">
              Message received!
            </h2>
            <p className="font-body text-ink-muted text-sm leading-relaxed max-w-xs mx-auto">
              Thanks{displayName ? `, ${displayName}` : ""} — we've got your message and will be in touch
              at <strong className="text-ink">{email}</strong> soon.
            </p>
            <button
              onClick={() => { setSuccess(false); setMessage(""); setError(null); }}
              className="mt-2 font-body text-sm text-burntorange hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          /* ── Contact form ────────────────────────────────────── */
          <div className="bg-white rounded-3xl p-7 sm:p-10
            shadow-[0_4px_24px_rgba(29,59,42,0.07)]">

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl
                font-body text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label
                  htmlFor="contact-email"
                  className="block font-body font-semibold text-ink text-sm mb-1.5"
                >
                  Your email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-cream/60 border border-cream-muted rounded-xl
                    px-4 py-3 text-sm font-body text-ink placeholder:text-ink-faint
                    focus:outline-none focus:ring-2 focus:ring-burntorange/40
                    focus:border-burntorange transition-all duration-150"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  className="block font-body font-semibold text-ink text-sm mb-1.5"
                >
                  Describe your issue
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's going on — the more detail, the better."
                  className="w-full bg-cream/60 border border-cream-muted rounded-xl
                    px-4 py-3 text-sm font-body text-ink placeholder:text-ink-faint
                    focus:outline-none focus:ring-2 focus:ring-burntorange/40
                    focus:border-burntorange transition-all duration-150 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email.trim() || !message.trim()}
                className="w-full py-3.5 rounded-xl bg-forest text-cream
                  font-body font-bold text-sm tracking-wide
                  hover:bg-forest-light transition-all duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:-translate-y-px hover:shadow-lg active:translate-y-0"
              >
                {loading ? "Sending…" : "Send message"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
