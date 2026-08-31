/**
 * pages/OAuthComplete.jsx  (route: /complete-profile)
 * ──────────────────────────────────────────────────────────────────
 * Shown whenever an authenticated user has an incomplete profile —
 * specifically when profile.role is null or username is null.
 *
 * This covers two scenarios:
 *  A) First-time Google OAuth signup — user just came back from Google
 *     and has a valid session but profile.role is still null.
 *  B) Any edge-case where the profile write failed silently after signup
 *     (ProtectedRoute now gates on profileComplete, so this page will
 *     always intercept before the user reaches /home).
 *
 * Intended-role detection (scenario A):
 *  Before calling signInWithOAuth(), Login.jsx / OwnerLogin.jsx store
 *  the intended role in sessionStorage under "oauth_intended_role".
 *  This survives the OAuth redirect because sessionStorage is per-tab.
 *  We read it here to decide which fields to ask for.
 *  If the key is missing (scenario B), we ask the user to pick a role.
 *
 * Google name pre-fill:
 *  Supabase exposes the Google profile in user.user_metadata.
 *  We pre-fill first_name / last_name from full_name or given_name /
 *  family_name when available, letting the user confirm or edit.
 *
 * Flow:
 *  1. Read intended role from sessionStorage (or ask user to pick)
 *  2. Pre-fill name fields from Google metadata
 *  3. User fills in missing fields and submits
 *  4. completeOAuthProfile() upserts profile row + inserts restaurant (owners)
 *  5. refreshProfile() updates AuthContext → profileComplete becomes true
 *  6. ProtectedRoute lets the user through → navigate to /home or /owner/dashboard
 */

import { useState, useEffect }     from "react";
import { useNavigate, Link }        from "react-router-dom";
import { useAuth }                  from "../context/AuthContext";
import { completeOAuthProfile }     from "../services/auth";
import AuthCard                     from "../components/auth/AuthCard";
import FormInput                    from "../components/common/FormInput";
import KirbaWordmark                from "../components/common/KirbaWordmark";

// ── Validation ────────────────────────────────────────────────────
// Matches the same rules as Signup.jsx / OwnerSignup.jsx

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const RUID_RE     = /^[a-zA-Z0-9_]{3,20}$/;
const PHONE_RE    = /^\+?[0-9]{7,15}$/;

function validateCustomer(f) {
  const e = {};
  if (!f.firstName.trim()) e.firstName = "First name is required.";
  if (!f.lastName.trim())  e.lastName  = "Last name is required.";
  if (!f.username.trim())  e.username  = "Username is required.";
  else if (!USERNAME_RE.test(f.username))
    e.username = "3–20 characters: letters, numbers, underscores only.";
  if (!f.address.trim())   e.address   = "Campus address / hostel block is required.";
  return e;
}

function validateOwner(f) {
  const e = {};
  if (!f.ownerName.trim())      e.ownerName      = "Your name is required.";
  if (!f.restaurantName.trim()) e.restaurantName = "Restaurant name is required.";
  if (!f.ruid.trim())           e.ruid           = "Restaurant ID is required.";
  else if (!RUID_RE.test(f.ruid))
    e.ruid = "3–20 characters: letters, numbers, underscores only. No spaces.";
  if (f.phone && !PHONE_RE.test(f.phone.replace(/\s/g, "")))
    e.phone = "Enter a valid phone number (7–15 digits).";
  return e;
}

// ── Watermark (matches other auth pages) ─────────────────────────
const WM = {
  position:      "absolute",
  fontFamily:    "'Playfair Display', serif",
  fontWeight:    900,
  fontSize:      "clamp(5rem, 14vw, 11rem)",
  lineHeight:    1,
  color:         "rgba(29,59,42,0.06)",
  userSelect:    "none",
  pointerEvents: "none",
  whiteSpace:    "nowrap",
};

// ── Role picker (shown if sessionStorage key is missing) ──────────
function RolePicker({ onPick }) {
  return (
    <div className="space-y-3">
      <p className="font-body text-sm text-ink-muted text-center mb-5">
        Are you signing up as a customer or a restaurant owner?
      </p>
      <button
        type="button"
        onClick={() => onPick("customer")}
        className="
          w-full py-3 rounded-xl border-2 border-forest/20
          text-forest font-body font-semibold text-sm
          hover:border-forest hover:bg-forest/5
          transition-all duration-150
        "
      >
        I'm a customer — I want to order food
      </button>
      <button
        type="button"
        onClick={() => onPick("owner")}
        className="
          w-full py-3 rounded-xl border-2 border-burntorange/20
          text-burntorange font-body font-semibold text-sm
          hover:border-burntorange hover:bg-burntorange/5
          transition-all duration-150
        "
      >
        I'm a restaurant owner — I want to list my stall
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function OAuthComplete() {
  const { user, profile, profileComplete, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Determine intended role:
  //   • From sessionStorage if the user just came through Google OAuth
  //   • Null if unknown — will show the RolePicker
  const [intendedRole, setIntendedRole] = useState(
    () => sessionStorage.getItem("oauth_intended_role") || null
  );

  // ── Redirect: if profile is already complete, send to the right home ──
  // This covers returning users who accidentally navigate here.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (profileComplete) {
      // Profile is complete — no need for onboarding
      sessionStorage.removeItem("oauth_intended_role");
      const dest = profile?.role === "owner" ? "/owner/dashboard" : "/home";
      navigate(dest, { replace: true });
    }
    // If !profileComplete we stay on this page and show the form
  }, [user, profile, profileComplete, loading, navigate]);

  // ── Pre-fill from Google metadata ─────────────────────────────
  // Supabase stores Google's profile in user.user_metadata.
  // Fields: full_name, name, given_name, family_name, avatar_url, email
  const googleMeta = user?.user_metadata ?? {};
  const [customerFields, setCustomerFields] = useState(() => {
    const fullName  = googleMeta.full_name || googleMeta.name || "";
    const parts     = fullName.trim().split(" ");
    const firstName = googleMeta.given_name  || parts[0]                          || "";
    const lastName  = googleMeta.family_name || parts.slice(1).join(" ")          || "";
    return { firstName, lastName, username: "", address: "" };
  });

  const [ownerFields, setOwnerFields] = useState(() => {
    const fullName = googleMeta.full_name || googleMeta.name || "";
    return { ownerName: fullName, restaurantName: "", ruid: "", phone: "" };
  });

  const [errors,     setErrors]     = useState({});
  const [formError,  setFormError]  = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Field handlers ────────────────────────────────────────────
  function handleCustomerChange(e) {
    const { name, value } = e.target;
    setCustomerFields((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    setFormError("");
  }

  function handleOwnerChange(e) {
    const { name, value } = e.target;
    setOwnerFields((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    setFormError("");
  }

  // ── Submit ────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = intendedRole === "customer"
      ? validateCustomer(customerFields)
      : validateOwner(ownerFields);

    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setFormError("");
    try {
      await completeOAuthProfile({
        role: intendedRole,
        ...(intendedRole === "customer" ? customerFields : ownerFields),
      });
      // Refresh AuthContext so profileComplete becomes true immediately
      await refreshProfile();
      sessionStorage.removeItem("oauth_intended_role");
      // ProtectedRoute will now let the user through on the next navigation
      navigate(intendedRole === "owner" ? "/owner/dashboard" : "/home", {
        replace: true,
      });
    } catch (err) {
      console.error("[OAuthComplete] completeOAuthProfile error:", err);
      if (err.field) {
        setErrors({ [err.field]: err.message });
      } else {
        setFormError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render guards ─────────────────────────────────────────────
  // Show nothing while loading or while the redirect useEffect fires
  if (loading || !user || profileComplete) return null;

  const isOwner = intendedRole === "owner";

  return (
    <div
      className="min-h-screen bg-cream flex items-center justify-center px-4 py-12 relative overflow-hidden"
    >
      {/* Watermark */}
      <span style={{ ...WM, top: "4%",  left: "-2%" }} aria-hidden="true">
        {intendedRole === "owner" ? "SETUP" : "ALMOST"}
      </span>
      <span style={{ ...WM, bottom: "2%", right: "-2%" }} aria-hidden="true">
        {intendedRole === "owner" ? "READY" : "THERE"}
      </span>

      <AuthCard className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="flex justify-center mb-6">
          <KirbaWordmark size="sm" showIcon={false} showTagline={false} />
        </div>

        {/* Header */}
        <div className="text-center mb-7">
          <h1 className="font-display font-bold text-forest text-2xl leading-snug mb-1">
            {!intendedRole
              ? "Almost there"
              : isOwner
              ? "Set up your restaurant"
              : "One last step"}
          </h1>
          <p className="text-ink-muted font-body text-sm">
            {!intendedRole
              ? "Tell us how you'll be using Kirba Bites."
              : isOwner
              ? "Tell us about your restaurant before you start managing it."
              : "Just a few details to complete your Kirba Bites profile."}
          </p>
        </div>

        {/* Form-level error */}
        {formError && (
          <div
            role="alert"
            className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 font-body text-sm"
          >
            {formError}
          </div>
        )}

        {/* ── Role picker (shown if intent is unknown) ───────── */}
        {!intendedRole ? (
          <RolePicker onPick={(r) => {
            setIntendedRole(r);
            sessionStorage.setItem("oauth_intended_role", r);
          }} />
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* ── CUSTOMER fields ─────────────────────────── */}
            {!isOwner && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    id="oc-firstName"
                    name="firstName"
                    label="First name"
                    value={customerFields.firstName}
                    onChange={handleCustomerChange}
                    error={errors.firstName}
                    autoComplete="given-name"
                    required
                  />
                  <FormInput
                    id="oc-lastName"
                    name="lastName"
                    label="Last name"
                    value={customerFields.lastName}
                    onChange={handleCustomerChange}
                    error={errors.lastName}
                    autoComplete="family-name"
                    required
                  />
                </div>
                <FormInput
                  id="oc-username"
                  name="username"
                  label="Username"
                  value={customerFields.username}
                  onChange={handleCustomerChange}
                  error={errors.username}
                  helperText="Letters, numbers, underscores. 3–20 characters."
                  autoComplete="username"
                  required
                />
                <FormInput
                  id="oc-address"
                  name="address"
                  label="Campus address / hostel block"
                  value={customerFields.address}
                  onChange={handleCustomerChange}
                  error={errors.address}
                  placeholder="e.g. Block C, Room 214"
                  required
                />
              </>
            )}

            {/* ── OWNER fields ─────────────────────────────── */}
            {isOwner && (
              <>
                <FormInput
                  id="oc-ownerName"
                  name="ownerName"
                  label="Your name"
                  value={ownerFields.ownerName}
                  onChange={handleOwnerChange}
                  error={errors.ownerName}
                  autoComplete="name"
                  required
                />
                <FormInput
                  id="oc-restaurantName"
                  name="restaurantName"
                  label="Restaurant / stall name"
                  value={ownerFields.restaurantName}
                  onChange={handleOwnerChange}
                  error={errors.restaurantName}
                  required
                />
                <FormInput
                  id="oc-ruid"
                  name="ruid"
                  label="Restaurant ID (R-UID)"
                  value={ownerFields.ruid}
                  onChange={handleOwnerChange}
                  error={errors.ruid}
                  helperText="Unique ID customers use to find you. Letters, numbers, underscores. 3–20 chars."
                  required
                />
                <FormInput
                  id="oc-phone"
                  name="phone"
                  label="Contact number (optional)"
                  type="tel"
                  value={ownerFields.phone}
                  onChange={handleOwnerChange}
                  error={errors.phone}
                  autoComplete="tel"
                />
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="
                w-full mt-2 py-3 rounded-xl
                bg-forest text-cream
                font-body font-semibold text-sm
                shadow-md
                hover:bg-forest-light hover:-translate-y-px hover:shadow-lg
                active:translate-y-0
                transition-all duration-150
                disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-burntorange/50
              "
            >
              {submitting
                ? "Saving…"
                : isOwner
                ? "Complete restaurant setup →"
                : "Complete my profile →"}
            </button>
          </form>
        )}

        {/* Escape hatch */}
        <p className="mt-6 text-center font-body text-xs text-ink-muted">
          Wrong account?{" "}
          <Link
            to="/"
            className="text-burntorange hover:underline font-semibold"
            onClick={() => sessionStorage.removeItem("oauth_intended_role")}
          >
            Go back
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
