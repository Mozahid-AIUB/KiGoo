# KiGoo Rider App — Authentication (Design Spec)

## Document Control

| Item | Detail |
|---|---|
| Document Title | KiGoo Rider App — Real Authentication (Supabase) |
| Date | July 14, 2026 |
| Status | Approved — ready for implementation plan |
| Supersedes | §৩.১ Authentication section of `2026-07-10-kigoo-platform-mvp-v2.md` (auth method changed — see Deviation below) |

---

## Context

The KiGoo rider app (Expo/React Native) has fully built auth screens (Login, SignUp, ForgotPassword, EmailVerification) but they are UI-only mocks — no backend calls, `navigation.reset()` bypasses everything. `RootNavigator` hardcodes `initialRouteName="MainTabs"`, so the app never actually gates on auth state. The Profile screen's "Log out" button has no `onPress` handler at all.

The admin panel already uses Supabase (`admin/src/lib/supabase/server.ts`, migrations in `admin/supabase/migrations/`), so the rider app will join the same Supabase project.

## Deviation from platform spec v2.0

`2026-07-10-kigoo-platform-mvp-v2.md` §৩.১ and Decision #1 specify **Phone + OTP** as the auth method. The actually-built UI is **email + password** (LoginScreen, SignUpScreen) with an email-style 6-digit verification code screen. Per user decision (2026-07-14): build against the UI that exists (email + password), not the spec doc. The platform spec should be updated separately to reflect this; out of scope for this task.

## Goals

- Real Supabase Auth (email + password) wired into all four existing auth screens
- Google OAuth sign-in (button already in UI)
- Session-gated navigation: unauthenticated → auth stack, authenticated → MainTabs
- Working logout
- Enterprise-grade data layer: RLS-protected `profiles` and `verifications` tables, secure token storage

## Non-goals

- Phone/OTP auth (superseded, see Deviation)
- Student verification *feature* (UI/flow) — only the `verifications` table schema is created now, so it's ready when that feature is built
- Booking, trips, or any non-auth feature

---

## 1. Database

Two tables, both RLS-protected, in the same Supabase project the admin panel uses. New migration file in `admin/supabase/migrations/`.

### `profiles`
One row per user, created automatically on signup via trigger on `auth.users`. Holds account-identity fields the user owns and can edit.

```sql
profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text not null,
  gender text check (gender in ('male','female')),
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)
```

- RLS: authenticated user can `select`/`update` only their own row (`auth.uid() = id`). No client-side `insert`/`delete` — row lifecycle is trigger-owned.
- Trigger `on_auth_user_created` (after insert on `auth.users`) inserts into `profiles`, pulling `first_name`/`last_name`/`phone`/`gender` out of `raw_user_meta_data` (passed via `signUp()` options).

### `verifications`
Schema only, for the future Student Verification feature. Kept as its own table (not merged into `profiles`) so admin-only fields (`status`, `reviewed_by`, `reviewed_at`) never need column-level RLS tricks — the whole table is admin-write, user-read-own.

```sql
verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  university text,
  student_id text,
  id_card_url text,
  selfie_url text,
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
)
```

- RLS: user can `select`/`insert` rows where `user_id = auth.uid()`. No client `update`/`delete` (admin panel uses the service-role client, which bypasses RLS).

---

## 2. KiGoo app — client & session layer

- **`src/lib/supabase.ts`** — Supabase client, configured with an `expo-secure-store`-backed storage adapter (not AsyncStorage) so access/refresh tokens sit in the encrypted keychain/keystore, not plaintext.
- **`.env`** in `KiGoo/` for `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`, read via Expo's built-in `EXPO_PUBLIC_*` env support.
- **`src/state/AuthContext.tsx`** — `AuthProvider` + `useAuth()` hook. Subscribes to `supabase.auth.onAuthStateChange`, exposes `{ session, user, loading }`.
- **`App.tsx`** — wraps the tree in `AuthProvider`.

## 3. Navigation

- `RootNavigator` stops hardcoding `initialRouteName`. Instead: while `AuthContext` is `loading`, render nothing (splash stays up); once resolved, conditionally mount either the Auth stack (Login/SignUp/ForgotPassword/EmailVerification) or MainTabs, based on `session`.
- Logout calls `supabase.auth.signOut()`; the `onAuthStateChange` listener flips `session` to `null`, which the root conditional automatically swaps back to the Auth stack — no manual `navigation.reset()` needed anywhere.

## 4. Screen wiring

| Screen | Change |
|---|---|
| `LoginScreen` | `supabase.auth.signInWithPassword()`; inline error message on failure; button loading state |
| `SignUpScreen` | `supabase.auth.signUp({ email, password, options: { data: { first_name, last_name, phone, gender } } })` — metadata feeds the `profiles` trigger |
| `EmailVerificationScreen` | Supabase email-OTP verify: `supabase.auth.verifyOtp({ type: 'signup', email, token })`; "Resend" wired to `supabase.auth.resend()` |
| `ForgotPasswordScreen` | `supabase.auth.resetPasswordForEmail(email)` |
| Login screen's "Continue with Google" | `supabase.auth.signInWithOAuth({ provider: 'google' })` via `expo-web-browser`/`expo-auth-session` redirect flow |
| `ProfileScreen` | "Log out" button gets `onPress={() => supabase.auth.signOut()}` |

**Prerequisite the user must complete (not doable by the agent):** a Google OAuth client in Google Cloud Console, with the Client ID/Secret entered into the Supabase Dashboard's Google Auth provider settings, plus the Expo redirect URI registered. Implementation plan will call this out as a blocking manual step with exact instructions.

## 5. Error handling

- Every Supabase auth call wrapped; raw Supabase error messages mapped to user-facing copy (invalid credentials, duplicate email, weak password, network failure treated distinctly).
- No silent failures — every failure path leaves the UI in a recoverable state (error text shown, button re-enabled).

---

## Open items for the implementation plan

- Exact Google Cloud Console + Supabase Dashboard steps (manual, user-performed)
- Whether `EXPO_PUBLIC_SUPABASE_ANON_KEY` for the rider app is the same Supabase project as admin's (assumed yes — confirm URL/anon key before wiring)
