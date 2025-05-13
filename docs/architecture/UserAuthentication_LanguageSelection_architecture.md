# High-Level Architecture: User Authentication & Language Selection

## 1. Introduction

This document outlines the high-level architecture for the User Authentication & Language Selection module of the AgriConnect platform. This module is critical for providing a personalized and accessible experience by allowing users to choose their preferred language and securely manage their accounts.

The design is based on the specifications detailed in the Feature Overview Specification: [`docs/specs/UserAuthentication_LanguageSelection_overview.md`](docs/specs/UserAuthentication_LanguageSelection_overview.md) and the overall project context from the AgriConnect User Blueprint ([`docs/PRD.md`](docs/PRD.md)).

The technology stack for this module includes Next.js, Tailwind CSS, Clerk for authentication, and Supabase for the database.

## 2. Architectural Goals

The architecture aims to achieve the following:

*   **Security**: Ensure robust authentication and protection of user data, complying with DPDPA 2023.
*   **Usability**: Provide a simple, intuitive interface for language selection and authentication.
*   **Maintainability**: Enable easy updates to translations and authentication logic.
*   **Extensibility**: Allow for future addition of languages and authentication methods.
*   **Performance**: Ensure responsive language switching and authentication processes.
*   **Reliability**: Consistently apply user preferences and maintain session integrity.

## 3. Key Components

The module comprises the following key components:

*   **UI Components (Next.js/React with Tailwind CSS)**:
    *   `LanguageSwitcher`: Allows users to select their preferred language (e.g., dropdown, buttons).
    *   `AuthForms (via Clerk UI)`: Pre-built React components from Clerk (`<SignUp />`, `<SignIn />`, `<UserButton />`, `<UserProfile />`) for registration, login, user profile management, and displaying user state. These will be styled with Tailwind CSS to match the AgriConnect theme.
    *   `LanguagePreferenceSetting`: A section within the user profile (managed via Clerk's `<UserProfile />` or a custom component) to view/change stored language preference.
*   **Next.js Application Logic**:
    *   `i18nMiddleware` (Next.js Middleware): Detects user's preferred language from URL path, cookies, or browser settings, and sets the appropriate locale for `next-intl`.
    *   `NextIntlProvider`: Wraps the application to provide localization context and translation functions (from `next-intl`).
    *   `ServerComponents/ClientComponents`: React components that consume translations via `next-intl` hooks (e.g., `useTranslations`).
    *   `API Routes/Server Actions`:
        *   (Potentially) `POST /api/user/profile/sync`: A backend endpoint triggered by a Clerk webhook upon new user creation to create a corresponding user profile entry in Supabase, storing the Clerk User ID and initial language preference.
        *   (Potentially) `PUT /api/user/profile/language`: An endpoint for authenticated users to update their language preference in Supabase. Alternatively, this can be a direct client-side Supabase call if RLS is configured appropriately.
*   **Authentication Service (Clerk)**:
    *   `Clerk SDK for Next.js`: Provides UI components, hooks (`useUser`, `useAuth`), and server-side utilities for session management and protecting routes/APIs.
    *   `Clerk Backend`: Manages user identities, authentication methods (Google, Phone, Email/Password), session tokens, and security.
    *   `Clerk Webhooks`: To notify the AgriConnect backend of events like user creation or updates.
*   **Database (Supabase)**:
    *   `Supabase Client (supabase-js)`: Used by Next.js backend (and potentially client-side for specific, secured operations) to interact with the database.
    *   `user_profiles` Table: Stores AgriConnect-specific user data, including `clerk_user_id` (linking to Clerk user) and `preferred_language`.
*   **Localization Management (`next-intl`)**:
    *   `Translation Files`: JSON files per language (e.g., `locales/en.json`, `locales/hi.json`, `locales/mr.json`) containing key-value pairs for UI strings.

## 4. Interactions and Data Flows

### 4.1. Initial Language Detection and Selection (Unauthenticated User)

1.  **Visit**: User accesses the AgriConnect site.
2.  **Detection (Next.js Middleware with `next-intl` logic)**:
    *   Checks for locale in URL path (e.g., `/hi/some-page`).
    *   If not in URL, checks for language preference in a persistent cookie (e.g., `NEXT_LOCALE`).
    *   If not in cookie, checks `Accept-Language` browser header.
    *   If none found or matched, falls back to a default language (e.g., English).
3.  **Redirection/Rendering**: Middleware redirects to the locale-specific URL (e.g., `/en`) or directly renders the page with the determined locale. `next-intl` loads the appropriate translation file.
4.  **Display**: UI renders in the detected/default language. The `LanguageSwitcher` component is visible.
5.  **User Selection**: User interacts with `LanguageSwitcher` and selects a new language (e.g., Marathi).
6.  **Client-Side Update**:
    *   The `next-intl` context is updated.
    *   The selected locale (e.g., `mr`) is saved to a cookie.
    *   The application navigates to the corresponding locale path (e.g., `/mr/current-page`), triggering a re-render with new translations.

### 4.2. User Registration

1.  **Access**: User navigates to the registration page (displays Clerk's `<SignUp />` component). UI is in the currently selected language.
2.  **Input**: User chooses a registration method (Google, Phone, Email/Password) and provides details.
3.  **Clerk Processing**: Clerk SDK handles the entire registration flow securely, including OAuth redirects or OTP verification.
4.  **Clerk User Creation**: Upon successful validation, Clerk creates a new user record in its system and establishes a session.
5.  **Profile Sync to Supabase (via Webhook & API Route)**:
    *   Clerk triggers a webhook (e.g., `user.created`) to a predefined Next.js API route (e.g., `/api/user/profile/sync`).
    *   The API route verifies the webhook signature.
    *   It extracts the `clerk_user_id` and other relevant data (e.g., email).
    *   It retrieves the current language preference (e.g., from the cookie set during initial language selection, or defaults if none).
    *   It uses the Supabase client to insert a new record into the `user_profiles` table, storing `clerk_user_id` and `preferred_language`.
6.  **Login**: User is automatically logged in.

### 4.3. User Login

1.  **Access**: User navigates to the login page (displays Clerk's `<SignIn />` component). UI is in the currently selected language.
2.  **Input**: User chooses a login method and provides credentials.
3.  **Clerk Authentication**: Clerk SDK securely handles authentication.
4.  **Session Established**: Upon success, Clerk establishes a user session.
5.  **Language Preference Retrieval**:
    *   Client-side, upon authentication state change (e.g., using Clerk's `useUser` hook), the application fetches the user's profile from Supabase `user_profiles` table using the `clerk_user_id`.
    *   The `preferred_language` is retrieved.
6.  **Apply Preference**:
    *   The `next-intl` context is updated with the fetched `preferred_language`.
    *   This preference is also stored in the language cookie for consistency.
    *   The UI re-renders in the user's stored preferred language.

### 4.4. Storing and Retrieving User's Preferred Language (Authenticated User)

*   **Storing on Update**:
    1.  User is logged in and accesses their profile settings or uses the global `LanguageSwitcher`.
    2.  User selects a new preferred language.
    3.  Client-side:
        *   `next-intl` context is updated.
        *   Language cookie is updated.
        *   A request is made to update the `preferred_language` in their Supabase `user_profiles` record. This can be:
            *   A direct Supabase client call from the client (if RLS allows the authenticated user to update their own record).
            *   A call to a secure Next.js API route (`PUT /api/user/profile/language`) which then uses the Supabase admin client or a service role client to perform the update.
*   **Retrieving**: As described in the User Login flow (Section 4.3, Step 5).

### 4.5. Applying Selected Language Across UI

1.  **`next-intl` Setup**: `next-intl` is configured with Next.js App Router, including middleware for locale detection and dynamic routes like `app/[locale]/page.tsx`.
2.  **Provider**: `NextIntlClientProvider` wraps the root layout in `app/[locale]/layout.tsx`, making translations available via context.
3.  **Translation Usage**: React components (both Server and Client Components) use `useTranslations` hook from `next-intl` to access translated strings based on the active locale.
    ```javascript
    // Example in a React component
    import {useTranslations} from 'next-intl';

    export default function MyComponent() {
      const t = useTranslations('MyComponentMessages');
      return <h1>{t('title')}</h1>;
    }
    ```
4.  **Dynamic Content**: UI chrome, labels, buttons, and static informational content are translated. Dynamic content (e.g., user-generated content) will remain in its original language.

## 5. Integration Points

### 5.1. Clerk Integration

*   **Frontend**: Clerk's Next.js SDK (`@clerk/nextjs`) provides:
    *   `<ClerkProvider>` to wrap the application.
    *   UI components: `<SignUp />`, `<SignIn />`, `<UserButton />`, `<UserProfile />`.
    *   Hooks: `useUser()`, `useAuth()`, `useSession()` for accessing user and session state.
*   **Backend**:
    *   Protecting API routes and Server Components using `auth()` helper from Clerk.
    *   Handling webhooks from Clerk for events like user creation/deletion to sync with Supabase.
*   **Configuration**: Clerk dashboard settings for authentication methods, redirect URLs, webhook endpoints.

### 5.2. Supabase Integration

*   **Client**: Supabase JS Client (`@supabase/supabase-js`) used in Next.js API routes/server actions (or client-side for specific RLS-protected actions).
*   **Authentication**: Supabase authentication is not directly used for user login; Clerk handles this. The `clerk_user_id` is used to link Supabase data to Clerk users.
*   **Data Storage**: `user_profiles` table stores `preferred_language` and other AgriConnect-specific user data.
*   **Row Level Security (RLS)**: Crucial for data protection. Policies will ensure:
    *   Users can only read their own profile data.
    *   Users can only update their own `preferred_language` (and other mutable profile fields).
    *   Profile creation might be restricted to a server-side process (via API route handling Clerk webhook) or allow users to insert their own profile if `clerk_user_id` matches `auth.uid()` (if Clerk JWTs are used with Supabase, or a custom mapping is established).

## 6. Localization Management

*   **Strategy**: `next-intl` library will be used for internationalization (i18n).
*   **File Structure**:
    ```
    /locales
      en.json
      hi.json
      mr.json
    ```
*   **Content Format (JSON)**:
    ```json
    // en.json
    {
      "navigation": {
        "home": "Home",
        "market": "Marketplace"
      },
      "auth": {
        "loginButton": "Login",
        "signupPrompt": "Don't have an account? Sign Up"
      }
    }
    ```
*   **Serving Translations**:
    *   Next.js Middleware (using `next-intl`'s `createIntlMiddleware`) handles locale detection from path, cookies, or headers.
    *   Dynamic routes `app/[locale]/...` ensure locale is part of the URL structure.
    *   `NextIntlClientProvider` in `app/[locale]/layout.tsx` loads and provides messages.
*   **Adding New Languages**: Add a new JSON file in `/locales` and update the `LanguageSwitcher` and `next-intl` configuration.

## 7. Data Model (Supabase)

*   **Table: `user_profiles`**
    *   `id`: `UUID`, Primary Key (default `uuid_generate_v4()`)
    *   `clerk_user_id`: `TEXT`, Unique, Not Null (Foreign key conceptually linking to Clerk's user ID). Indexed.
    *   `preferred_language`: `TEXT` (e.g., 'en', 'hi', 'mr'), Not Null, Default 'en'.
    *   `name`: `TEXT`, Nullable (if collected during signup).
    *   `created_at`: `TIMESTAMP WITH TIME ZONE`, Not Null, Default `now()`.
    *   `updated_at`: `TIMESTAMP WITH TIME ZONE`, Not Null, Default `now()`.

    *Example RLS Policy for `user_profiles` (conceptual):*
    ```sql
    -- Allow users to read their own profile
    CREATE POLICY "Allow individual user read access"
    ON public.user_profiles FOR SELECT
    USING (auth.uid()::text = clerk_user_id); -- Assumes Clerk JWT's sub is used as auth.uid() or a custom claim maps it

    -- Allow users to update their own profile
    CREATE POLICY "Allow individual user update access"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid()::text = clerk_user_id);

    -- Allow new authenticated users to insert their own profile (if not using webhooks exclusively)
    CREATE POLICY "Allow individual user insert access"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid()::text = clerk_user_id);
    ```
    *(Note: Exact RLS policies depend on how Clerk JWTs are integrated with Supabase's `auth.uid()` or if service roles are used for mutations from backend.)*

## 8. Security Considerations

*   **Authentication (Clerk)**:
    *   Clerk manages all aspects of authentication: password hashing/salting, OAuth 2.0 flows, OTP mechanisms, session management (secure HttpOnly cookies).
    *   Protection against common vulnerabilities like XSS, CSRF (Clerk's SDKs and recommended practices help mitigate these).
*   **Data Protection (Supabase & DPDPA)**:
    *   **RLS**: Supabase Row Level Security is paramount to ensure users can only access and modify their own data in `user_profiles`.
    *   **Encryption**: Supabase provides encryption at rest and in transit (HTTPS).
    *   **DPDPA Compliance**:
        *   Obtain explicit consent for collecting language preference and PII.
        *   Secure handling of data.
        *   Provide means for users to access/correct their data (Clerk's `<UserProfile />` and custom UI for language).
*   **API Security**:
    *   Next.js API Routes (e.g., for webhook handling or profile updates) must be protected using Clerk's authentication middleware (`auth()`).
    *   Webhook endpoints must verify signatures from Clerk.
*   **Input Validation**: All user inputs (though primarily handled by Clerk forms) and API request payloads must be validated.

## 9. Scalability and Maintainability

*   **Scalability**:
    *   **Languages**: Adding new languages involves creating a new JSON translation file and updating configurations. `next-intl` scales well.
    *   **Authentication Methods**: Clerk supports various auth providers; adding new ones is typically a configuration change in Clerk dashboard.
    *   **Platform**: Clerk and Supabase are managed services designed for scalability. Next.js applications can be scaled effectively (e.g., on Vercel).
*   **Maintainability**:
    *   **Modularity**: Component-based architecture in React/Next.js.
    *   **Separation of Concerns**: Auth logic is largely encapsulated by Clerk. Database interactions are managed via Supabase client. Localization is handled by `next-intl`.
    *   **Centralized Translations**: JSON files for languages are easy to manage and update by translators or developers.
    *   **Typed Code**: Using TypeScript (recommended) would further enhance maintainability.

## 10. API Design (Internal Next.js Endpoints)

While many operations can be handled by Clerk's frontend components and direct client-side Supabase calls (with RLS), a server-side API endpoint for profile synchronization via webhook is robust.

*   **`POST /api/clerk-webhooks/sync-user-profile`**
    *   **Trigger**: Clerk webhook (e.g., `user.created`, `user.updated`).
    *   **Protection**: Webhook signature verification.
    *   **Request Body (from Clerk)**: Clerk user object.
    *   **Action**:
        *   On `user.created`: Creates a new record in `user_profiles` table in Supabase, linking `clerk_user_id` and setting a default or detected initial `preferred_language`.
        *   On `user.updated`: Updates relevant fields in `user_profiles` if necessary (e.g., email, name).
    *   **Response**: `200 OK` on success, appropriate error codes on failure.

*   **`PUT /api/user/profile/language` (Alternative to client-side Supabase call)**
    *   **Trigger**: Authenticated user changes language preference in UI.
    *   **Protection**: Clerk authentication (`auth()` middleware).
    *   **Request Body**: `{ "preferredLanguage": "hi" }`
    *   **Action**: Updates the `preferred_language` field in the `user_profiles` table for the authenticated user (`clerk_user_id` obtained from session).
    *   **Response**: `200 OK` or error.
    *   **Note**: This can often be avoided by allowing authenticated users to update their own `preferred_language` directly from the client using Supabase JS SDK, secured by RLS. This reduces an API hop. The choice depends on complexity and security posture. For simplicity and strong RLS, client-side update is viable.

## 11. Conclusion

This architecture provides a robust foundation for the User Authentication and Language Selection module. By leveraging Clerk for authentication, Supabase for data storage with RLS, and `next-intl` for localization within a Next.js application, the module aims to be secure, user-friendly, and maintainable. Key considerations include careful RLS policy implementation and robust webhook handling for data synchronization.