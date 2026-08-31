/**
 * components/common/Footer.jsx  —  Shared app footer
 * ──────────────────────────────────────────────────────────────────
 * Appears on all authenticated pages via Layout.jsx.
 * Includes wordmark, link columns, contact info, copyright,
 * and a CTA for restaurant owners.
 */

import { Link } from "react-router-dom";
import KirbaWordmark from "./KirbaWordmark";

// ── Social icon (Instagram) ───────────────────────────────────────
function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor"
      viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

const LINKS = {
  Explore: [
    { label: "Restaurants",   to: "/home" },
    { label: "Popular Dishes",to: "/home" },
    { label: "Offers",        to: "/home" },
    { label: "New on Campus", to: "/home" },
  ],
  Account: [
    { label: "My Profile",    to: "/account" },
    { label: "Order History", to: "/orders"  },
    { label: "Cart",          to: "/cart"    },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/" },
    { label: "Campus Terms",   to: "/" },
    { label: "About Us",       to: "/" },
    { label: "FAQ",            to: "/" },
  ],
};

export default function Footer() {
  return (
    <footer id="footer" className="bg-forest text-cream/80">
      {/* ── Main grid ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-4 flex flex-col items-start">
            {/* Wordmark — cream "Kirba" on dark footer background */}
            <div>
              <KirbaWordmark size="sm" variant="on-dark" showIcon={false} showTagline={false} />
            </div>
            <p className="font-body text-sm text-cream/60 leading-relaxed max-w-xs">
              The fastest way to discover and order from every stall and restaurant
              on your campus. Hot food, zero hassle.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-cream/10 flex items-center justify-center
                  text-cream/60 hover:text-cream hover:bg-cream/20 transition-colors duration-150"
                aria-label="Kirba Bites on Instagram"
              >
                <InstagramIcon />
              </a>
            </div>
            {/* Contact */}
            <div className="space-y-1 pt-1">
              <p className="font-body text-xs text-cream/50">hello@kirbabites.campus</p>
              <p className="font-body text-xs text-cream/50">Campus Food Court, Block A</p>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading} className="space-y-4">
              <h3 className="font-display font-bold text-cream text-sm tracking-wide uppercase">
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="font-body text-sm text-cream/55 hover:text-cream
                        transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────── */}
      <div className="border-t border-cream/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5
          flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-cream/40 text-center sm:text-left">
            © {new Date().getFullYear()} Kirba Bites. All rights reserved.
          </p>

          {/* Owner CTA */}
          <Link
            to="/owner/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-burntorange/90 hover:bg-burntorange text-cream font-body font-semibold text-xs
              transition-all duration-150 hover:-translate-y-px hover:shadow-md shrink-0"
          >
            Own an outlet? Manage here
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}
