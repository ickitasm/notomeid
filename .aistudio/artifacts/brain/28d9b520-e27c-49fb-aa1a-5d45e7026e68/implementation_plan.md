# Notome: Authentication & Google Sign-In Integration

Implementation plan for integrating user authentication with one-click Google Sign-In (Gmail verification) via Supabase Auth, gating the application until login, and enabling multi-device cloud synchronization.

> [!IMPORTANT]
> **User Review & Confirmed Authentication Decisions**
> - **Verification & Sign-In Method**: Confirmed **One-click Sign in with Google via Supabase OAuth** (instant Gmail verification and account creation without entering separate passwords).
> - **Access Behavior**: Confirmed **Require login to enter** to ensure personal data is linked to the user's Gmail account and synced across mobile and desktop devices.
> - **Pricing & Limits Confirmation**:
>   - **Supabase Auth**: 100% **FREE** up to **50,000 Monthly Active Users (MAU)** with unlimited logins, no credit card required.
>   - **Google Cloud OAuth**: 100% **FREE** with no per-user charge for standard Google Sign-In authentication.
> - **Development & Preview Resilience**: In the local preview environment before Supabase credentials are input, an immediate "Test Gmail Sign-In / Demo Session" bypass is provided so the user can test the entire application without setup friction.

---

### 1. Overview & Core Concept

**Notome Auth Gate** provides a secure, friction-free entry point into the personal life hub:
- **Sign In & Create Account**: A unified editorial authentication screen allowing users to create an account or sign in using their Google/Gmail account in 1 click.
- **Session & Identity Management**: Real-time authentication listener tracking user session, avatar, email, and display name.
- **Top Bar Profile Pill**: Displays the logged-in user's profile avatar and email with a clean dropdown menu for Account Details, Cloud Sync Status, and "Sign Out".
- **Multi-Device Data Isolation**: Binds media lists, nutrition entries, pet health cards, and calendar events to the user's unique Supabase User ID (`auth.uid()`).

---

### 2. User Experience & Visual Design

#### A. Authentication Screen (`AuthView.tsx`)
- **Aesthetic**: Warm editorial aesthetic matching Notome's rich earth tones (toasted linen, warm terracotta, walnut borders, and serif typography).
- **Split Layout / Focused Card**:
  - Left / Top: Notome brand mark, editorial welcome quote, and summary of the 4 life pillars (Cinema, Nutrition, Pet Health, Master Calendar).
  - Right / Center: Elegant auth card with:
    - **One-Click Google Button**: Prominent button with SVG Google "G" emblem (`"Continue with Google"`).
    - Alternative Email/Password tab with real-time Gmail validation for users who prefer traditional login.
    - Security & Free Tier reassurance badge: *"Free tier powered by Supabase & Google OAuth. Zero tracking or telemetry."*
    - Instant "Demo Session (mike777rafael@gmail.com)" button for local preview.

#### B. In-App User Profile & Header Integration
- When logged in, Zone 3 of the Top Navigation Bar and Mobile Header shows:
  - User's Google avatar photo (or warm letter avatar) + Gmail handle.
  - Dropdown with:
    - **Cloud Sync Status**: Indicator showing synced state with Supabase PostgreSQL.
    - **Export / Backup JSON**: One-click local backup download.
    - **Sign Out**: Clears active session and returns to login gate.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Native Supabase Google OAuth + Fallback Demo Session**
  - *Chosen Approach*: Implement `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`. When running in the sandbox where environment variables are not yet injected, provide a 1-click test login using the user's email (`mike777rafael@gmail.com`).
  - *Why*: Guarantees that the app remains 100% testable in AI Studio while being production-ready for deployment to Vercel with real Google OAuth.

- **Decision 2: Automatic Account Provisioning on First Google Login**
  - *Chosen Approach*: Supabase automatically creates the user record on the first successful Google OAuth callback. No separate "Register" vs "Login" friction for Google users.
  - *Why*: Eliminates forgot-password issues and ensures email verification is handled automatically by Google's trusted identity platform.

- **Decision 3: Row Level Security (RLS) User Data Isolation**
  - *Chosen Approach*: Update `supabase_schema.sql` so that user-created records include `user_id UUID REFERENCES auth.users(id)` and RLS policies enforce `auth.uid() = user_id`.
  - *Why*: Protects user privacy so different accounts only access their own media, nutrition logs, and pet health records.

---

### 4. Technical Architecture & Component Mapping

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Notome Authentication Flow                      │
└────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────────┐
                      │    Is User Authenticated?   │
                      └─────────────────────────────┘
                                     │
                   ┌─────────────────┴─────────────────┐
                   ▼                                   ▼
             [ NO / Signed Out ]                 [ YES / Signed In ]
                   │                                   │
                   ▼                                   ▼
        ┌──────────────────────┐             ┌────────────────────┐
        │       AuthView       │             │      App View      │
        │  - "Sign In with G"  │             │  - Media Tracker   │
        │  - Email + Password  │             │  - Daily Nutrition │
        │  - 1-Click Demo Mode │             │  - Pet Care Medic  │
        │  - Supabase Auth API │             │  - Master Calendar │
        └──────────────────────┘             └────────────────────┘
```

#### Core New Components & State:
1. `src/hooks/useAuth.ts`:
   - State: `user: User | null`, `session: Session | null`, `loading: boolean`.
   - Methods: `signInWithGoogle()`, `signInWithEmail()`, `signUpWithEmail()`, `signOut()`, `loginDemoUser()`.
   - Listens to `supabase.auth.onAuthStateChange()`.
2. `src/components/Auth/AuthView.tsx`:
   - Warm editorial login and register views with tab toggle.
   - Google Sign-In button with standard brand guidelines.
   - Demo session shortcut for immediate preview without Vercel setup.
3. `src/components/Navigation.tsx`:
   - Updated Zone 3 to render user profile pill with avatar and Sign Out action.
4. `supabase_schema.sql`:
   - Updated to add `user_id` column and user-isolated RLS policies for production.

---

### 5. Implementation Steps

1. **Auth State Hook (`src/hooks/useAuth.ts`)**:
   - Create reactive hook managing Supabase session, user object, and authentication status.
2. **Auth Gate Screen (`src/components/Auth/AuthView.tsx`)**:
   - Build warm editorial login card with Google OAuth trigger, email form, and local preview bypass.
3. **App Gating & Profile Dropdown in `App.tsx` & `Navigation.tsx`**:
   - Gate main application rendering behind `useAuth()`.
   - Add user avatar pill and sign out handler in navigation.
4. **Database Schema Update (`supabase_schema.sql`)**:
   - Add `user_id` and RLS policies for per-user data isolation.
5. **Verification**:
   - Validate with `compile_applet` and `lint_applet`.
