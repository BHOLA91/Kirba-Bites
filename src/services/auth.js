/**
 * services/auth.js  —  Kirba Bites auth service layer
 * ──────────────────────────────────────────────────────────────────
 * All Supabase auth calls are funnelled through this module.
 * Components and AuthContext import from here — nothing calls
 * supabase.auth directly inside UI code.
 *
 * Signup strategy (important — explains why we do it this way):
 *   supabase.auth.signUp() creates the auth.users row and fires the
 *   DB trigger (handle_new_user) which creates a bare profiles row
 *   with just `id`. The trigger does NOT reliably copy raw_user_meta_data
 *   into profile columns in all Supabase configurations, so we never
 *   rely on it for field data.
 *
 *   Instead, after signUp() returns a session we immediately follow up
 *   with an explicit profiles upsert (and restaurants insert for owners)
 *   using the established session. This guarantees the data is written
 *   and gives us real error handling if anything fails.
 *
 * Exports:
 *  signUpCustomer       — email/password signup + profile upsert
 *  signInCustomer       — email/password login for customers
 *  signUpOwner          — email/password signup + profile upsert + restaurant insert
 *  signInOwnerByRuid    — looks up email via R-UID, then signs in
 *  signInWithGoogle     — OAuth via Google (stores intended role first)
 *  signOut              — ends the current session
 *  getCurrentProfile    — fetches the current user's profile row
 *  completeOAuthProfile — called by OAuthComplete page after Google signin
 */

import { supabase } from "./supabaseClient";

// ── Helpers ───────────────────────────────────────────────────────

/** Normalizes Supabase/Postgres errors into a consistent shape */
function authError(message, code = null, field = null) {
  const err   = new Error(message);
  err.code    = code;
  err.field   = field;
  return err;
}

/**
 * Wait until supabase.auth.getSession() returns a valid session.
 * After signUp() the session may take a tick to be established in the
 * client — this retries up to `maxMs` milliseconds before giving up.
 *
 * Returns the session object, or throws if it never arrives.
 */
async function waitForSession(maxMs = 5000) {
  const interval = 150;
  let waited = 0;
  while (waited < maxMs) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return session;
    await new Promise((r) => setTimeout(r, interval));
    waited += interval;
  }
  throw new Error(
    "Session did not establish after signup. " +
    "If email confirmation is enabled in Supabase, disable it for development " +
    "(Auth → Email → toggle off 'Enable email confirmations')."
  );
}

// ── Customer flows ────────────────────────────────────────────────

/**
 * Sign up a new customer account.
 *
 * Flow:
 *  1. auth.signUp()  → creates auth.users row + DB trigger creates bare profiles row
 *  2. waitForSession() → confirms the session is live (RLS will now pass)
 *  3. profiles upsert → writes first_name, last_name, username, address, role
 *
 * All three steps are awaited and any error is surfaced — nothing fails silently.
 */
export async function signUpCustomer({
  email,
  password,
  firstName,
  lastName,
  username,
  address,
}) {
  // ── Step 1: create the auth account ────────────────────────────
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.error("[signUpCustomer] auth.signUp error:", error);
    if (error.message?.toLowerCase().includes("already registered")) {
      throw authError(
        "An account with this email already exists. Try logging in instead.",
        "EMAIL_EXISTS"
      );
    }
    throw error;
  }

  const user = data.user;
  if (!user) {
    // Supabase returns user=null when email confirmation is required
    throw authError(
      "Please check your email and confirm your account before continuing. " +
      "Or ask your admin to disable email confirmation in Supabase.",
      "EMAIL_CONFIRMATION_REQUIRED"
    );
  }

  // ── Step 2: wait for session to be ready (RLS needs it) ────────
  let session;
  try {
    session = await waitForSession();
  } catch (sessionErr) {
    console.error("[signUpCustomer] waitForSession error:", sessionErr);
    throw sessionErr;
  }

  console.log("[signUpCustomer] Session confirmed for user:", session.user.id);

  // ── Step 3: write profile fields ───────────────────────────────
  // The trigger already created the row with id only — we upsert the rest.
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id:         user.id,
      role:       "customer",
      first_name: firstName,
      last_name:  lastName,
      username:   username,
      address:    address,
    });

  if (profileError) {
    console.error("[signUpCustomer] profiles upsert error:", profileError);
    if (
      profileError.code === "23505" ||
      profileError.message?.toLowerCase().includes("username")
    ) {
      throw authError(
        "This username is already taken. Please choose another.",
        "USERNAME_TAKEN",
        "username"
      );
    }
    throw authError(
      "Account created but profile data could not be saved: " + profileError.message,
      "PROFILE_WRITE_FAILED"
    );
  }

  console.log("[signUpCustomer] Profile upserted successfully for:", user.id);
  return data;
}

/**
 * Sign in an existing customer with email + password.
 */
export async function signInCustomer({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error("[signInCustomer] error:", error);
    if (
      error.message?.toLowerCase().includes("invalid login credentials") ||
      error.message?.toLowerCase().includes("invalid email or password")
    ) {
      throw authError(
        "Incorrect email or password. Please try again.",
        "INVALID_CREDENTIALS"
      );
    }
    throw error;
  }
  return data;
}

// ── Owner flows ───────────────────────────────────────────────────

/**
 * Check if an R-UID is still available (pre-signup validation).
 * Public read on restaurants is allowed by RLS.
 * Returns true if available, false if taken.
 */
export async function checkRuidAvailability(ruid) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("id")
    .eq("r_uid", ruid)
    .maybeSingle();
  if (error) console.warn("[checkRuidAvailability] error:", error);
  return !data; // true = available
}

/**
 * Sign up a new owner account.
 *
 * Flow:
 *  1. Pre-check R-UID uniqueness (gives a clean inline error before account creation)
 *  2. auth.signUp()  → creates auth.users row + DB trigger creates bare profiles row
 *  3. waitForSession() → confirms the session is live (RLS needs this)
 *  4. profiles upsert  → writes role, first_name (owner name), phone_number
 *  5. restaurants insert → writes restaurant_name, r_uid, owner_id, phone_number
 *
 * All steps are awaited, all errors are surfaced with console.error + thrown.
 */
export async function signUpOwner({
  email,
  password,
  ownerName,
  restaurantName,
  ruid,
  phone,
}) {
  // ── Step 1: pre-check R-UID before creating the account ────────
  const available = await checkRuidAvailability(ruid);
  if (!available) {
    throw authError(
      "This Restaurant ID is already taken. Please choose a different one.",
      "RUID_TAKEN",
      "ruid"
    );
  }

  // ── Step 2: create the auth account ────────────────────────────
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.error("[signUpOwner] auth.signUp error:", error);
    if (error.message?.toLowerCase().includes("already registered")) {
      throw authError(
        "An account with this email already exists. Try logging in instead.",
        "EMAIL_EXISTS"
      );
    }
    throw error;
  }

  const user = data.user;
  if (!user) {
    throw authError(
      "Please check your email and confirm your account before continuing. " +
      "Or disable email confirmation in Supabase (Auth → Email).",
      "EMAIL_CONFIRMATION_REQUIRED"
    );
  }

  // ── Step 3: wait for session to be established ─────────────────
  let session;
  try {
    session = await waitForSession();
  } catch (sessionErr) {
    console.error("[signUpOwner] waitForSession error:", sessionErr);
    throw sessionErr;
  }

  console.log("[signUpOwner] Session confirmed for user:", session.user.id);

  // ── Step 4: write profile row ──────────────────────────────────
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id:           user.id,
      role:         "owner",
      first_name:   ownerName,
      phone_number: phone || null,
    });

  if (profileError) {
    console.error("[signUpOwner] profiles upsert error:", profileError);
    throw authError(
      "Account created but profile data could not be saved: " + profileError.message,
      "PROFILE_WRITE_FAILED"
    );
  }

  console.log("[signUpOwner] Profile upserted successfully.");

  // ── Step 5: insert the restaurant row ─────────────────────────
  const { error: restaurantError } = await supabase
    .from("restaurants")
    .insert({
      owner_id:        user.id,
      restaurant_name: restaurantName,
      r_uid:           ruid,
      phone_number:    phone || null,
    });

  if (restaurantError) {
    console.error("[signUpOwner] restaurants insert error:", restaurantError);
    // Unique violation on r_uid (race condition — pre-check passed but another
    // signup won the race in the narrow window between check and insert)
    if (
      restaurantError.code === "23505" ||
      restaurantError.message?.toLowerCase().includes("r_uid") ||
      restaurantError.message?.toLowerCase().includes("duplicate")
    ) {
      throw authError(
        "This Restaurant ID was just taken by another signup. Please choose a different one.",
        "RUID_TAKEN",
        "ruid"
      );
    }
    throw authError(
      "Account created but restaurant listing could not be saved: " + restaurantError.message,
      "RESTAURANT_WRITE_FAILED"
    );
  }

  console.log("[signUpOwner] Restaurant row inserted successfully:", ruid);
  return data;
}

/**
 * Sign in an owner using their R-UID (not email).
 * Flow:
 *  1. Call the get_owner_email_by_ruid RPC function (SECURITY DEFINER,
 *     reads auth.users which the anon role can't access directly).
 *  2. Use the resolved email + entered password to call signInWithPassword.
 */
export async function signInOwnerByRuid({ ruid, password }) {
  // Step 1: resolve R-UID → owner email via the Postgres function
  const { data: ownerEmail, error: rpcError } = await supabase.rpc(
    "get_owner_email_by_ruid",
    { ruid_input: ruid }
  );

  if (rpcError) {
    console.error("[signInOwnerByRuid] RPC error:", rpcError);
    throw rpcError;
  }

  if (!ownerEmail) {
    throw authError(
      "No restaurant found with that ID. Double-check your R-UID.",
      "RUID_NOT_FOUND",
      "ruid"
    );
  }

  // Step 2: sign in with the resolved email
  const { data, error } = await supabase.auth.signInWithPassword({
    email:    ownerEmail,
    password,
  });

  if (error) {
    console.error("[signInOwnerByRuid] signInWithPassword error:", error);
    if (
      error.message?.toLowerCase().includes("invalid login credentials") ||
      error.message?.toLowerCase().includes("invalid email or password")
    ) {
      throw authError(
        "Incorrect password for this Restaurant ID.",
        "INVALID_CREDENTIALS",
        "password"
      );
    }
    throw error;
  }
  return data;
}

// ── Google OAuth ──────────────────────────────────────────────────

/**
 * Initiate Google OAuth.
 * Stores the intended role in sessionStorage before redirecting so
 * OAuthComplete.jsx knows which profile fields to collect.
 * intendedRole: "customer" | "owner"
 */
export async function signInWithGoogle({ intendedRole = "customer" } = {}) {
  sessionStorage.setItem("oauth_intended_role", intendedRole);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // After OAuth, Supabase redirects here.
      // Add this URL to: Supabase → Auth → URL Configuration → Redirect URLs
      redirectTo: `${window.location.origin}/oauth-complete`,
    },
  });
  if (error) {
    console.error("[signInWithGoogle] error:", error);
    throw error;
  }
  return data;
}

// ── Session / profile ─────────────────────────────────────────────

/** Sign out the current session. */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[signOut] error:", error);
    throw error;
  }
}

/**
 * Fetch the current user's profile row from public.profiles.
 * Returns null if not logged in or profile doesn't exist.
 */
export async function getCurrentProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("[getCurrentProfile] error:", error);
    return null;
  }
  return data;
}

// ── Google OAuth profile completion ───────────────────────────────

/**
 * Called by OAuthComplete.jsx after a Google signin where the profile
 * row has no role yet (first-time Google signup).
 *
 * For customers: upserts profile with role + username + address etc.
 * For owners:    upserts profile with role + ownerName + phone,
 *                then inserts the restaurant row (with r_uid uniqueness check).
 */
export async function completeOAuthProfile({ role, ...rest }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No active session. Please sign in again.");

  if (role === "customer") {
    const { firstName, lastName, username, address } = rest;
    const { error } = await supabase.from("profiles").upsert({
      id:         user.id,
      role:       "customer",
      first_name: firstName,
      last_name:  lastName,
      username,
      address,
    });
    if (error) {
      console.error("[completeOAuthProfile] customer profiles upsert error:", error);
      if (error.code === "23505" || error.message?.toLowerCase().includes("username")) {
        throw authError(
          "This username is already taken. Please choose another.",
          "USERNAME_TAKEN",
          "username"
        );
      }
      throw error;
    }
  } else if (role === "owner") {
    const { ownerName, phone, restaurantName, ruid } = rest;

    // Check R-UID availability before inserting
    const available = await checkRuidAvailability(ruid);
    if (!available) {
      throw authError(
        "This Restaurant ID is already taken. Please choose a different one.",
        "RUID_TAKEN",
        "ruid"
      );
    }

    // Update profile
    const { error: profileErr } = await supabase.from("profiles").upsert({
      id:           user.id,
      role:         "owner",
      first_name:   ownerName,
      phone_number: phone || null,
    });
    if (profileErr) {
      console.error("[completeOAuthProfile] owner profiles upsert error:", profileErr);
      throw profileErr;
    }

    // Insert restaurant
    const { error: restaurantErr } = await supabase
      .from("restaurants")
      .insert({
        owner_id:        user.id,
        restaurant_name: restaurantName,
        r_uid:           ruid,
        phone_number:    phone || null,
      });

    if (restaurantErr) {
      console.error("[completeOAuthProfile] restaurants insert error:", restaurantErr);
      if (
        restaurantErr.code === "23505" ||
        restaurantErr.message?.includes("r_uid")
      ) {
        throw authError(
          "This Restaurant ID was just taken. Please choose a different one.",
          "RUID_TAKEN",
          "ruid"
        );
      }
      throw restaurantErr;
    }
  }
}
