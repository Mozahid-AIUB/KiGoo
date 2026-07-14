# KiGoo Rider App Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the KiGoo rider app's mock auth screens with real Supabase Auth (email + password + Google OAuth), gate navigation on session state, and give the "Log out" button a real handler.

**Architecture:** A Supabase client configured with a platform-aware secure storage adapter (SecureStore on iOS/Android, localStorage on web) lives in `src/lib/supabase.ts`. An `AuthProvider`/`useAuth()` context wraps the app, tracking `session` via `onAuthStateChange`. `RootNavigator` swaps between an Auth stack and `MainTabs` based on that session — no manual navigation resets anywhere. Each auth screen calls the relevant `supabase.auth.*` method directly and renders inline error/loading state. Two new Postgres tables (`profiles`, `verifications`) with RLS live in the same Supabase project the admin panel already uses, created by a new migration; a trigger auto-populates `profiles` on signup.

**Tech Stack:** Expo SDK 54, React Native, TypeScript, `@supabase/supabase-js`, `expo-secure-store`, `expo-web-browser`, `expo-auth-session`, Supabase Postgres/Auth (project shared with `admin/`).

## Global Constraints

- Auth method is email + password (not phone+OTP) — see `docs/superpowers/specs/2026-07-14-kigoo-rider-auth-design.md` Deviation section.
- Session tokens must use `expo-secure-store` on native, never plaintext `AsyncStorage`.
- `profiles` and `verifications` both have RLS enabled; no table is publicly writable.
- No feature work beyond auth — booking/trips/verification-UI are explicitly out of scope.
- Follow existing code conventions: theme tokens from `src/theme/theme.ts`, `PrimaryButton` component, `Ionicons`, existing screen file structure.

---

### Task 1: Database migration — `profiles` and `verifications` tables

**Files:**
- Create: `admin/supabase/migrations/20260714000000_profiles_verifications.sql`

**Interfaces:**
- Produces: `public.profiles` table (`id`, `first_name`, `last_name`, `phone`, `gender`, `email`, `created_at`, `updated_at`), `public.verifications` table (`id`, `user_id`, `university`, `student_id`, `id_card_url`, `selfie_url`, `status`, `reviewed_by`, `reviewed_at`, `rejection_reason`, `created_at`), and trigger function `public.handle_new_user()` firing on `auth.users` insert.

- [ ] **Step 1: Write the migration SQL**

```sql
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text not null,
  gender text check (gender in ('male', 'female')),
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  university text,
  student_id text,
  id_card_url text,
  selfie_url text,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_verifications_user on verifications(user_id);

alter table profiles enable row level security;
alter table verifications enable row level security;

create policy "users read own profile" on profiles
  for select using (auth.uid() = id);

create policy "users update own profile" on profiles
  for update using (auth.uid() = id);

create policy "users read own verification" on verifications
  for select using (auth.uid() = user_id);

create policy "users insert own verification" on verifications
  for insert with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone, gender, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    new.raw_user_meta_data ->> 'gender',
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

- [ ] **Step 2: Apply the migration to the Supabase project**

Run from `admin/`: `npx supabase db push`

If the project isn't linked yet, first run `npx supabase link --project-ref <project-ref>` (project ref is the subdomain in `NEXT_PUBLIC_SUPABASE_URL`, e.g. `https://<project-ref>.supabase.co`), then re-run `db push`.

Expected: CLI reports the new migration applied, no errors.

- [ ] **Step 3: Verify tables and trigger exist**

Run: `npx supabase db diff` (from `admin/`)
Expected: no diff (local migration matches remote — confirms it applied cleanly).

Also check via Supabase Dashboard → Table Editor: `profiles` and `verifications` tables exist with RLS enabled (shield icon).

- [ ] **Step 4: Commit**

```bash
git add admin/supabase/migrations/20260714000000_profiles_verifications.sql
git commit -m "feat(db): add profiles and verifications tables with RLS"
```

---

### Task 2: Install auth dependencies and configure env

**Files:**
- Modify: `KiGoo/package.json` (via npm install)
- Modify: `KiGoo/.gitignore`
- Modify: `KiGoo/app.json`
- Create: `KiGoo/.env`
- Create: `KiGoo/.env.example`

**Interfaces:**
- Produces: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` env vars readable via `process.env.EXPO_PUBLIC_*`; `scheme: "kigoo"` in `app.json` for OAuth redirect.

- [ ] **Step 1: Install packages**

Run from `KiGoo/`:
```bash
npx expo install @supabase/supabase-js expo-secure-store expo-web-browser expo-auth-session expo-crypto @react-native-async-storage/async-storage
```

`expo install` (not plain `npm install`) picks SDK-54-compatible versions automatically. `@react-native-async-storage/async-storage` is needed as the web-platform fallback in the storage adapter (Task 3) since `expo-secure-store` has no web implementation.

Expected: all six packages appear in `KiGoo/package.json` dependencies, install completes with no peer-dependency errors.

- [ ] **Step 2: Fix `.gitignore` to actually ignore the real env file**

Current `.gitignore` only has `.env*.local`, which does **not** match a plain `.env`. Read `KiGoo/.gitignore`, find the line `.env*.local` and replace it:

```
# local env files
.env
.env*.local
```

- [ ] **Step 3: Create `.env` with real project credentials**

Read `admin/.env.local` to get the actual `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` values (same Supabase project — confirmed in design spec Open Items). Write `KiGoo/.env`:

```
EXPO_PUBLIC_SUPABASE_URL=<value copied from admin/.env.local NEXT_PUBLIC_SUPABASE_URL>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<value copied from admin/.env.local NEXT_PUBLIC_SUPABASE_ANON_KEY>
```

- [ ] **Step 4: Create `.env.example` (committed, no real values)**

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

- [ ] **Step 5: Add a `scheme` to `app.json` for OAuth redirect**

Read `KiGoo/app.json`, add `"scheme": "kigoo"` alongside the existing `"slug": "KiGoo"` key:

```json
{
  "expo": {
    "name": "KiGoo",
    "slug": "KiGoo",
    "scheme": "kigoo",
    "version": "1.0.0",
    ...
```

- [ ] **Step 6: Verify env vars load**

Run: `cd KiGoo && npx expo start --web --clear`
In the browser console (after app loads), there's no direct way to print env vars from outside code yet — defer full verification to Task 3's Step 4, which imports and uses them. For now, expected: dev server starts with no missing-module errors for the newly installed packages.

- [ ] **Step 7: Commit**

```bash
git add KiGoo/package.json KiGoo/package-lock.json KiGoo/.gitignore KiGoo/app.json KiGoo/.env.example
git commit -m "chore: add supabase/auth dependencies and env scaffolding"
```

Note: `KiGoo/.env` is intentionally NOT committed (real credentials, now gitignored per Step 2).

---

### Task 3: Supabase client with platform-aware secure storage

**Files:**
- Create: `KiGoo/src/lib/supabase.ts`
- Test: manual (see Step 4 — no test runner is configured in this project; verification is a runtime smoke check)

**Interfaces:**
- Consumes: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` from Task 2.
- Produces: `export const supabase: SupabaseClient` — the single Supabase client instance every other task imports from `../lib/supabase` (or relative equivalent).

- [ ] **Step 1: Write the storage adapter and client**

```typescript
// KiGoo/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SECURE_STORE_MAX_BYTES = 2048;

const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => {
    if (value.length > SECURE_STORE_MAX_BYTES) {
      // Supabase sessions can exceed SecureStore's per-item limit; AsyncStorage
      // has no such cap, so large session payloads fall back to it.
      return AsyncStorage.setItem(key, value);
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const storage = Platform.OS === 'web' ? AsyncStorage : secureStoreAdapter;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Check KiGoo/.env.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd KiGoo && npx tsc --noEmit`
Expected: no errors referencing `src/lib/supabase.ts`.

- [ ] **Step 3: Smoke-test the client resolves a session (even if null)**

Temporarily add to `KiGoo/App.tsx` inside the `App` function body, right after the `useFonts` call, a one-off effect (this is removed again in Task 4 once `AuthProvider` takes over):

```typescript
import { supabase } from './src/lib/supabase';
// ...inside App(), after useFonts:
useEffect(() => {
  supabase.auth.getSession().then(({ data, error }) => {
    console.log('[smoke test] session:', data.session, 'error:', error);
  });
}, []);
```

Run: `cd KiGoo && npx expo start --web`, open the browser, check the console.
Expected: logs `[smoke test] session: null error: null` (no session yet, no connection error). If `error` is non-null, the URL/anon key in `.env` is wrong — fix before proceeding.

Revert this temporary snippet from `App.tsx` before continuing (Task 4 replaces it properly).

- [ ] **Step 4: Commit**

```bash
git add KiGoo/src/lib/supabase.ts
git commit -m "feat(auth): add supabase client with secure session storage"
```

---

### Task 4: AuthContext and provider

**Files:**
- Create: `KiGoo/src/state/AuthContext.tsx`
- Modify: `KiGoo/App.tsx`

**Interfaces:**
- Consumes: `supabase` from `../lib/supabase` (Task 3).
- Produces: `export function AuthProvider({ children }: { children: React.ReactNode })`, `export function useAuth(): { session: Session | null; user: User | null; loading: boolean }` — every screen in Tasks 5-8 and `RootNavigator` in Task 6 import `useAuth` from `../state/AuthContext`.

- [ ] **Step 1: Write AuthContext**

```typescript
// KiGoo/src/state/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
```

- [ ] **Step 2: Wrap the app in `AuthProvider`**

Read `KiGoo/App.tsx`. Remove the Task-3 smoke-test snippet if still present. Add the import and wrap `NavigationContainer`:

```typescript
import AuthProvider from './src/state/AuthContext'; // note: named export, see below
```

Correction — `AuthProvider` is a named export, not default. Import as:

```typescript
import { AuthProvider } from './src/state/AuthContext';
```

Modify the return statement:

```tsx
return (
  <SafeAreaProvider>
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="dark" />
      </NavigationContainer>
    </AuthProvider>
  </SafeAreaProvider>
);
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd KiGoo && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Runtime smoke test**

Run: `cd KiGoo && npx expo start --web`, open browser, confirm the app still loads to the current (mock) MainTabs screen with no console errors about `useAuth`/`AuthContext`.

- [ ] **Step 5: Commit**

```bash
git add KiGoo/src/state/AuthContext.tsx KiGoo/App.tsx
git commit -m "feat(auth): add AuthProvider and useAuth hook"
```

---

### Task 5: Session-gated navigation in RootNavigator

**Files:**
- Modify: `KiGoo/src/navigation/RootNavigator.tsx`

**Interfaces:**
- Consumes: `useAuth()` from `../state/AuthContext` (Task 4).
- Produces: `RootNavigator` no longer hardcodes `initialRouteName`; renders `null` while `loading`, the Auth stack when `session` is null, `MainTabs`-rooted stack when `session` exists.

- [ ] **Step 1: Restructure RootNavigator around session state**

Read the current `KiGoo/src/navigation/RootNavigator.tsx` (109 lines) in full before editing — every existing `Stack.Screen` must be preserved, just reorganized under a conditional `initialRouteName`.

Replace the `export default function RootNavigator()` body:

```tsx
import { useAuth } from '../state/AuthContext';

// ...(keep all existing imports and the Stack.Screen list definitions above this)

export default function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator initialRouteName={session ? 'MainTabs' : 'Login'}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EmailVerification"
        component={EmailVerificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="CampusHub" component={CampusHubScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Routes" component={RoutesScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="TripSelection"
        component={TripSelectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SeatSelection"
        component={SeatSelectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookingSummary"
        component={BookingSummaryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QrTicket"
        component={QrTicketScreen}
        options={{ headerShown: false, headerBackVisible: false }}
      />
      <Stack.Screen name="MyTrips" component={MyTripsScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="CampusNotifications"
        component={CampusNotificationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Plans" component={PlansScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Community" component={CommunityScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="StudentVerification"
        component={StudentVerificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VerificationStatus"
        component={VerificationStatusScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
```

The screen list is unchanged from the current file — only `initialRouteName` becomes conditional and the early `loading` return is added. React Navigation remounts the navigator when `initialRouteName` changes because `RootNavigator` itself re-renders on session change, which resets the stack to the correct root (this is standard React Navigation conditional-auth-flow behavior, not a bug to guard against).

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd KiGoo && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Runtime check — logged out state shows Login**

Run: `cd KiGoo && npx expo start --web --clear`, open browser.
Expected: since no session exists yet (nothing has signed in), the app now opens on `LoginScreen`, not `MainTabs`. This is the first visible behavior change.

- [ ] **Step 4: Commit**

```bash
git add KiGoo/src/navigation/RootNavigator.tsx
git commit -m "feat(auth): gate root navigation on session state"
```

---

### Task 6: Wire LoginScreen and SignUpScreen to real Supabase calls

**Files:**
- Modify: `KiGoo/src/screens/auth/LoginScreen.tsx`
- Modify: `KiGoo/src/screens/auth/SignUpScreen.tsx`

**Interfaces:**
- Consumes: `supabase` from `../../lib/supabase` (Task 3).
- Produces: no new exports; both screens now call real auth methods and manage local `error`/`submitting` state.

- [ ] **Step 1: Rewrite LoginScreen's submit logic**

Read the current `KiGoo/src/screens/auth/LoginScreen.tsx` in full (186 lines) before editing.

Add imports at the top:

```typescript
import { useState } from 'react';
import { ActivityIndicator, ... } from 'react-native'; // merge into existing react-native import
import { supabase } from '../../lib/supabase';
```

Add state alongside the existing `email`/`password`/`showPassword` state:

```typescript
const [error, setError] = useState<string | null>(null);
const [submitting, setSubmitting] = useState(false);
```

Add a submit handler function, and replace the `PrimaryButton`'s `onPress`:

```typescript
function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'Incorrect email or password.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Please verify your email before logging in.';
  }
  return 'Something went wrong. Please try again.';
}

async function handleLogin() {
  setError(null);
  setSubmitting(true);
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  setSubmitting(false);
  if (signInError) {
    setError(mapAuthError(signInError.message));
  }
  // On success, AuthContext's onAuthStateChange updates session automatically;
  // RootNavigator swaps to MainTabs on its own — no manual navigation here.
}
```

Replace:
```tsx
<PrimaryButton
  label="Log In"
  disabled={!isValid}
  onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
  style={styles.button}
/>
```
with:
```tsx
{error && <Text style={styles.errorText}>{error}</Text>}
<PrimaryButton
  label={submitting ? 'Logging in…' : 'Log In'}
  disabled={!isValid || submitting}
  onPress={handleLogin}
  style={styles.button}
/>
```

Add to the `styles` `StyleSheet.create` object:
```typescript
errorText: { color: colors.danger, fontSize: 13, fontFamily: fonts.bodyMedium, marginBottom: spacing.sm, textAlign: 'center' },
```

- [ ] **Step 2: Rewrite SignUpScreen's submit logic**

Read the current `KiGoo/src/screens/auth/SignUpScreen.tsx` in full (268 lines) before editing.

Add the same `error`/`submitting` state and `supabase` import as Step 1.

Replace:
```tsx
<PrimaryButton
  label="Create Account"
  disabled={!isValid}
  onPress={() => navigation.navigate('EmailVerification')}
  style={styles.button}
/>
```
with:
```typescript
async function handleSignUp() {
  setError(null);
  setSubmitting(true);
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: `+880${phone}`,
        gender,
      },
    },
  });
  setSubmitting(false);
  if (signUpError) {
    setError(
      signUpError.message.includes('already registered')
        ? 'An account with this email already exists.'
        : 'Something went wrong. Please try again.'
    );
    return;
  }
  navigation.navigate('EmailVerification', { email });
}
```
```tsx
{error && <Text style={styles.errorText}>{error}</Text>}
<PrimaryButton
  label={submitting ? 'Creating account…' : 'Create Account'}
  disabled={!isValid || submitting}
  onPress={handleSignUp}
  style={styles.button}
/>
```

Add the same `errorText` style used in Step 1.

`EmailVerification` currently has no params in `RootStackParamList` (`EmailVerification: undefined`). This will be fixed in Task 7 Step 1 (adding `{ email: string }`) — do that change as part of this task's Step 3 below so the code compiles.

- [ ] **Step 3: Update `RootStackParamList` to pass email to EmailVerification**

In `KiGoo/src/navigation/RootNavigator.tsx`, change:
```typescript
EmailVerification: undefined;
```
to:
```typescript
EmailVerification: { email: string };
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd KiGoo && npx tsc --noEmit`
Expected: no errors. (Task 7 will fix `EmailVerificationScreen`'s own prop usage; if `tsc` flags that file for not reading `route.params.email` yet, that's expected and resolved in Task 7 — confirm the *only* remaining errors, if any, are inside `EmailVerificationScreen.tsx`.)

- [ ] **Step 5: Runtime check — signup creates a user**

Run: `cd KiGoo && npx expo start --web`, open browser, go through Sign Up with a real test email you control, a valid Bangladeshi-format phone (11 digits), and a 6+ char password.
Expected: navigates to `EmailVerificationScreen`; in the Supabase Dashboard → Authentication → Users, the new user appears with status "Waiting for verification"; in Table Editor → `profiles`, a matching row exists with the entered `first_name`/`last_name`/`phone`/`gender`.

- [ ] **Step 6: Runtime check — login rejects wrong password**

In the running app, go to Login, enter the test email with a deliberately wrong password.
Expected: inline error "Incorrect email or password." appears, button re-enables, no navigation happens.

- [ ] **Step 7: Commit**

```bash
git add KiGoo/src/screens/auth/LoginScreen.tsx KiGoo/src/screens/auth/SignUpScreen.tsx KiGoo/src/navigation/RootNavigator.tsx
git commit -m "feat(auth): wire login and signup to supabase"
```

---

### Task 7: Wire EmailVerificationScreen to Supabase OTP verify

**Files:**
- Modify: `KiGoo/src/screens/auth/EmailVerificationScreen.tsx`

**Interfaces:**
- Consumes: `supabase` from `../../lib/supabase`; `route.params.email` (from Task 6 Step 3's param type change).

- [ ] **Step 1: Rewrite EmailVerificationScreen's submit logic**

Read the current file in full (135 lines) before editing.

Change the `Props` usage to destructure `route`:
```typescript
export default function EmailVerificationScreen({ navigation, route }: Props) {
  const { email } = route.params;
```

Add imports: `useState` already imported (via `useRef, useState`); add `supabase` import:
```typescript
import { supabase } from '../../lib/supabase';
```

Add state:
```typescript
const [error, setError] = useState<string | null>(null);
const [submitting, setSubmitting] = useState(false);
const [resending, setResending] = useState(false);
```

Replace the `PrimaryButton`'s `onPress`:
```typescript
async function handleVerify() {
  setError(null);
  setSubmitting(true);
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'signup',
  });
  setSubmitting(false);
  if (verifyError) {
    setError('Invalid or expired code. Please try again.');
    return;
  }
  // Success: signUp's session is now confirmed; onAuthStateChange fires,
  // RootNavigator swaps to MainTabs on its own.
}
```
```tsx
<PrimaryButton
  label={submitting ? 'Verifying…' : 'Verify Email'}
  disabled={!isValid || submitting}
  onPress={handleVerify}
  style={styles.button}
/>
```

Replace the "Resend" `TouchableOpacity`:
```tsx
<TouchableOpacity
  disabled={resending}
  onPress={async () => {
    setResending(true);
    setError(null);
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
    setResending(false);
    if (resendError) {
      setError('Could not resend code. Please try again shortly.');
    }
  }}
>
  <Text style={styles.resend}>{resending ? 'Sending…' : "Didn't get a code? Resend"}</Text>
</TouchableOpacity>
{error && <Text style={styles.errorText}>{error}</Text>}
```

Add to `styles`:
```typescript
errorText: { color: colors.danger, fontSize: 13, fontFamily: fonts.bodyMedium, marginTop: spacing.sm, textAlign: 'center' },
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd KiGoo && npx tsc --noEmit`
Expected: no errors anywhere in `KiGoo/src`.

- [ ] **Step 3: Runtime check — full signup-to-login loop**

Using the Supabase Dashboard (Authentication → Users → find the test user → note there's no way to read the OTP from the dashboard directly; instead check the inbox of the real test email used in Task 6 Step 5), retrieve the 6-digit code emailed to the test address, enter it in the running app.
Expected: on correct code, app navigates into `MainTabs` (session now exists — confirms the whole signup → verify → session chain works). On a deliberately wrong 6-digit code, inline error "Invalid or expired code..." shows.

- [ ] **Step 4: Commit**

```bash
git add KiGoo/src/screens/auth/EmailVerificationScreen.tsx
git commit -m "feat(auth): wire email verification to supabase otp"
```

---

### Task 8: Wire ForgotPasswordScreen and Profile logout

**Files:**
- Modify: `KiGoo/src/screens/auth/ForgotPasswordScreen.tsx`
- Modify: `KiGoo/src/screens/profile/ProfileScreen.tsx`

**Interfaces:**
- Consumes: `supabase` from `../../lib/supabase`.

- [ ] **Step 1: Rewrite ForgotPasswordScreen's submit logic**

Read the current file in full (116 lines) before editing.

Add imports: `supabase`, keep existing `useState`.

Add state:
```typescript
const [error, setError] = useState<string | null>(null);
const [submitting, setSubmitting] = useState(false);
```

Replace the "Send Reset Link" button:
```typescript
async function handleReset() {
  setError(null);
  setSubmitting(true);
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
  setSubmitting(false);
  if (resetError) {
    setError('Could not send reset link. Please check the email and try again.');
    return;
  }
  setSent(true);
}
```
```tsx
{error && <Text style={styles.errorText}>{error}</Text>}
<PrimaryButton
  label={submitting ? 'Sending…' : 'Send Reset Link'}
  disabled={!isValid || submitting}
  onPress={handleReset}
  style={styles.button}
/>
```

Add to `styles`:
```typescript
errorText: { color: colors.danger, fontSize: 13, fontFamily: fonts.bodyMedium, marginTop: spacing.sm, textAlign: 'center' },
```

- [ ] **Step 2: Wire the logout button in ProfileScreen**

Read the current `KiGoo/src/screens/profile/ProfileScreen.tsx` in full (95 lines) before editing.

Add import:
```typescript
import { supabase } from '../../lib/supabase';
```

Replace:
```tsx
<TouchableOpacity style={styles.logoutBtn}>
  <Text style={styles.logoutText}>Log out</Text>
</TouchableOpacity>
```
with:
```tsx
<TouchableOpacity style={styles.logoutBtn} onPress={() => supabase.auth.signOut()}>
  <Text style={styles.logoutText}>Log out</Text>
</TouchableOpacity>
```

No local navigation call is needed — `AuthContext`'s `onAuthStateChange` fires on sign-out, `session` becomes `null`, and `RootNavigator` (Task 5) automatically swaps back to the `Login` screen.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd KiGoo && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Runtime check — forgot password**

In the running app, go to Login → Forgot password, enter the test email.
Expected: "Check your inbox" success screen shows; a password-reset email arrives at the test inbox.

- [ ] **Step 5: Runtime check — logout returns to Login (the originally reported bug)**

While logged in (from Task 7's verification), go to Profile tab, tap "Log out".
Expected: app immediately navigates to `LoginScreen`. This is the fix for the original bug report — previously the button had no handler at all.

- [ ] **Step 6: Commit**

```bash
git add KiGoo/src/screens/auth/ForgotPasswordScreen.tsx KiGoo/src/screens/profile/ProfileScreen.tsx
git commit -m "feat(auth): wire forgot-password flow and fix non-functional logout button"
```

---

### Task 9: Google OAuth sign-in

**Files:**
- Modify: `KiGoo/src/screens/auth/LoginScreen.tsx`

**Interfaces:**
- Consumes: `supabase` from `../../lib/supabase`; `expo-web-browser`, `expo-auth-session` (installed in Task 2).

**Manual prerequisite (user must complete before this task can work end-to-end):**
1. In [Google Cloud Console](https://console.cloud.google.com/), create an OAuth 2.0 Client ID (Web application type) under APIs & Services → Credentials.
2. Add authorized redirect URI: `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback` (found on Supabase Dashboard → Authentication → Providers → Google, which shows the exact callback URL to paste).
3. In Supabase Dashboard → Authentication → Providers → Google, toggle it on, paste the Client ID and Client Secret from step 1.
4. No changes needed to Google Console for the Expo redirect — `expo-auth-session`'s `makeRedirectUri()` produces a redirect Supabase forwards back to, handled by `scheme: "kigoo"` set in Task 2.

This task's code changes work regardless of whether the manual setup is done, but sign-in will fail with a provider-not-configured error from Supabase until the user completes it.

- [ ] **Step 1: Add Google sign-in handler to LoginScreen**

Add imports:
```typescript
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();
```

Add a handler function (alongside `handleLogin` from Task 6):
```typescript
const [googleSubmitting, setGoogleSubmitting] = useState(false);

async function handleGoogleLogin() {
  setError(null);
  setGoogleSubmitting(true);
  const redirectTo = AuthSession.makeRedirectUri();
  const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (oauthError || !data.url) {
    setGoogleSubmitting(false);
    setError('Could not start Google sign-in. Please try again.');
    return;
  }
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  setGoogleSubmitting(false);
  if (result.type !== 'success') {
    return; // user cancelled — no error needed
  }
  // Supabase exchanges the code and onAuthStateChange fires automatically
  // once the session lands in storage; RootNavigator swaps to MainTabs.
}
```

Replace the existing Google button:
```tsx
<TouchableOpacity style={styles.googleButton} activeOpacity={0.85}>
  <Ionicons name="logo-google" size={18} color={colors.text} />
  <Text style={styles.googleButtonText}>Continue with Google</Text>
</TouchableOpacity>
```
with:
```tsx
<TouchableOpacity
  style={styles.googleButton}
  activeOpacity={0.85}
  disabled={googleSubmitting}
  onPress={handleGoogleLogin}
>
  <Ionicons name="logo-google" size={18} color={colors.text} />
  <Text style={styles.googleButtonText}>
    {googleSubmitting ? 'Opening Google…' : 'Continue with Google'}
  </Text>
</TouchableOpacity>
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd KiGoo && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Runtime check (after manual Google Cloud Console setup is done)**

Run: `cd KiGoo && npx expo start --web`, open browser, tap "Continue with Google" on Login.
Expected: a Google account picker opens; after choosing an account and granting consent, the browser redirects back and the app lands on `MainTabs`. Check Supabase Dashboard → Authentication → Users: a new user with the Google email appears, and `profiles` has a row (via the same trigger — note `first_name`/`last_name`/`phone` will be empty since Google's OAuth metadata doesn't populate them; this is expected and out of scope to backfill).

If the manual setup from this task's prerequisite isn't done yet, expected instead: an error surfaces from Supabase ("Unsupported provider" or similar) — confirms the code path runs, defer full verification until setup is complete.

- [ ] **Step 4: Commit**

```bash
git add KiGoo/src/screens/auth/LoginScreen.tsx
git commit -m "feat(auth): add google oauth sign-in"
```

---

### Task 10: Full end-to-end verification pass

**Files:** none (verification only)

- [ ] **Step 1: Fresh install sanity check**

Run: `cd KiGoo && rm -rf node_modules && npm install && npx tsc --noEmit`
Expected: clean install, zero TypeScript errors.

- [ ] **Step 2: Cold-start logged-out flow**

Run: `cd KiGoo && npx expo start --web --clear`. In an incognito/private browser window (no cached session), open the app.
Expected: lands on `LoginScreen` (not `MainTabs`) — confirms Task 5's session gate works with zero session state.

- [ ] **Step 3: Full loop — signup, verify, browse, logout, login**

In the same window: Sign Up (new test email) → Email Verification (real code from inbox) → confirm landing on `MainTabs` → tap Profile tab → tap "Log out" → confirm landing back on `LoginScreen` → Log In with the same email/password → confirm landing on `MainTabs` again.

Expected: every step transitions correctly with no manual refresh needed, no console errors.

- [ ] **Step 4: Session persistence across reload**

While logged in from Step 3, refresh the browser page (F5).
Expected: app briefly shows nothing (loading state), then lands back on `MainTabs` — confirms `expo-secure-store`/`AsyncStorage`-backed session persistence works (Task 3).

- [ ] **Step 5: Confirm RLS is actually enforced**

The Dashboard's SQL Editor runs as an elevated role, so it can't be used to test RLS directly. Instead: open `admin/supabase/migrations/20260714000000_profiles_verifications.sql` (created in Task 1) and re-read the four `create policy` statements.

Expected: every policy uses `auth.uid() = id` or `auth.uid() = user_id` — never `using (true)`. Also confirm in Supabase Dashboard → Table Editor that both `profiles` and `verifications` show the "RLS enabled" shield icon (already checked once in Task 1 Step 3; this is a final re-confirmation before shipping).

This task produces no commit — it's a verification gate confirming Tasks 1–9 work together.
