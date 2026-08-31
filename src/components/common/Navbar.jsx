/**
 * components/common/Navbar.jsx  —  Shared app navigation bar
 * ──────────────────────────────────────────────────────────────────
 * Appears on all authenticated pages (Home, Orders, Account, Cart,
 * RestaurantDetail, Checkout). NOT on auth pages or the landing page.
 *
 * Layout:
 *  Left   — KirbaWordmark (compact, no icon, no tagline)
 *  Center — Nav links: Home, Outlets, Menu, Contact
 *  Right  — Cart icon (with item count badge) | Search toggle | Avatar dropdown
 *
 * Sticky + cream background with a subtle bottom shadow on scroll.
 * Mobile: hamburger collapses the center nav links.
 */

import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import KirbaWordmark from "./KirbaWordmark";

// ── Cart icon (SVG) ───────────────────────────────────────────────
function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h11.8M7 13l-.4-2M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  );
}

// ── Search icon ───────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
    </svg>
  );
}

// ── Chevron down ──────────────────────────────────────────────────
function ChevronDown({ open }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg"
      className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ── Hamburger icon ────────────────────────────────────────────────
function HamburgerIcon({ open }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      {open
        ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
    </svg>
  );
}

// ── Avatar initials badge ─────────────────────────────────────────
function AvatarBadge({ name = "" }) {
  const initials = name
    .trim()
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
  return (
    <div className="w-8 h-8 rounded-full bg-forest text-cream font-body font-bold text-xs
      flex items-center justify-center select-none shrink-0" aria-hidden="true">
      {initials || "?"}
    </div>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────
export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate  = useNavigate();

  const [scrolled,       setScrolled]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [searchQuery,    setSearchQuery]    = useState("");

  const dropdownRef = useRef(null);
  const searchRef   = useRef(null);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function onOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, []);

  const displayName = profile?.first_name
    ? `${profile.first_name}${profile.last_name ? " " + profile.last_name : ""}`
    : user?.email?.split("@")[0] ?? "User";

  async function handleSignOut() {
    setDropdownOpen(false);
    await signOut();
    navigate("/");
  }

  // Active link style helper
  const navLinkClass = ({ isActive }) =>
    `relative font-body text-sm font-medium transition-colors duration-150 pb-0.5
    after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5
    after:rounded-full after:transition-all after:duration-200
    ${isActive
      ? "text-forest after:bg-burntorange after:opacity-100"
      : "text-ink-muted hover:text-forest after:opacity-0 hover:after:opacity-50 after:bg-burntorange"}`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 bg-cream transition-shadow duration-300
        ${scrolled ? "shadow-[0_2px_16px_rgba(29,59,42,0.10)]" : "border-b border-cream-muted/60"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Left: Wordmark ─────────────────────────────────── */}
          <Link to="/home" className="shrink-0 flex items-center" aria-label="Kirba Bites — home">
            <KirbaWordmark size="sm" showIcon={false} showTagline={false} />
          </Link>

          {/* ── Center: Nav links (desktop) ────────────────────── */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            <NavLink to="/home"    end className={navLinkClass}>Home</NavLink>
            <NavLink to="/outlets" className={navLinkClass}>Outlets</NavLink>
            <NavLink to="/home"    className={({ isActive: _ }) => navLinkClass({ isActive: false })}>Menu</NavLink>
            <a
              href="#footer"
              className="relative font-body text-sm font-medium text-ink-muted
                hover:text-forest transition-colors duration-150"
            >
              Contact
            </a>
          </nav>

          {/* ── Right: icons + avatar ───────────────────────────── */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => { setSearchOpen((v) => !v); setDropdownOpen(false); }}
                className="w-9 h-9 flex items-center justify-center rounded-xl
                  text-ink-muted hover:text-forest hover:bg-forest/8
                  transition-colors duration-150"
                aria-label="Toggle search"
                aria-expanded={searchOpen}
              >
                <SearchIcon />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-cream rounded-2xl
                  shadow-xl border border-cream-muted p-3 animate-fade-in">
                  <input
                    autoFocus
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search restaurants or dishes…"
                    className="w-full bg-white/60 border border-cream-muted rounded-xl
                      px-4 py-2.5 text-sm font-body text-ink placeholder:text-ink-faint
                      focus:outline-none focus:ring-2 focus:ring-burntorange/40"
                  />
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-xl
                text-ink-muted hover:text-forest hover:bg-forest/8
                transition-colors duration-150"
              aria-label="Shopping cart"
            >
              <CartIcon />
              {/* Cart badge — placeholder, wire to CartContext when ready */}
              {false && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-burntorange
                  text-cream text-[10px] font-bold rounded-full flex items-center justify-center">
                  0
                </span>
              )}
            </Link>

            {/* User avatar + dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => { setDropdownOpen((v) => !v); setSearchOpen(false); }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl
                  hover:bg-forest/8 transition-colors duration-150"
                aria-label="User menu"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <AvatarBadge name={displayName} />
                <span className="hidden sm:block font-body text-sm font-medium text-ink max-w-[100px] truncate">
                  {displayName.split(" ")[0]}
                </span>
                <ChevronDown open={dropdownOpen} />
              </button>

              {dropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-52 bg-cream rounded-2xl
                    shadow-xl border border-cream-muted overflow-hidden animate-fade-in"
                >
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-cream-muted bg-forest/[0.04]">
                    <p className="font-body font-semibold text-forest text-sm truncate">{displayName}</p>
                    <p className="font-body text-ink-faint text-xs truncate mt-0.5">{user?.email}</p>
                  </div>
                  {/* Menu items */}
                  {[
                    { label: "My Account",     to: "/account" },
                    { label: "Order History",  to: "/orders"  },
                  ].map(({ label, to }) => (
                    <Link
                      key={to}
                      to={to}
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-3 font-body text-sm text-ink
                        hover:bg-forest/8 hover:text-forest transition-colors duration-100"
                    >
                      {label}
                    </Link>
                  ))}
                  <div className="border-t border-cream-muted">
                    <button
                      role="menuitem"
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 font-body text-sm
                        text-burntorange hover:bg-burntorange/8 transition-colors duration-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl
                text-ink-muted hover:text-forest hover:bg-forest/8 transition-colors duration-150 ml-1"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <HamburgerIcon open={mobileOpen} />
            </button>
          </div>
        </div>

        {/* ── Mobile nav drawer ──────────────────────────────────── */}
        {mobileOpen && (
          <nav
            className="md:hidden border-t border-cream-muted py-3 pb-4 space-y-1 animate-fade-in"
            aria-label="Mobile navigation"
          >
            {[
              { label: "Home",    to: "/home" },
              { label: "Cart",    to: "/cart" },
              { label: "Orders",  to: "/orders" },
              { label: "Account", to: "/account" },
            ].map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-xl font-body text-sm font-medium transition-colors duration-100
                  ${isActive ? "bg-forest/10 text-forest" : "text-ink-muted hover:bg-forest/6 hover:text-forest"}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
