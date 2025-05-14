# Feature Overview: UserAuthentication_LanguageSelection (Refinement: Post-Login Language Application)

**Project:** AgriConnect
**Version:** 1.0
**Date:** May 14, 2025
**JIRA/User Story ID(s):** [Refinement_UserAuth_LangSelect_20250514060209]

## 1. Introduction

This document outlines the specifications for the refinement of the User Authentication Language Selection feature, specifically focusing on applying a user's preferred language from their Supabase profile immediately after they log in. The primary goal is to ensure a seamless experience where the application UI reflects the user's chosen language preference stored in their profile.

## 2. Goals

- To automatically fetch an authenticated user's preferred language from their Supabase profile upon successful login.
- To apply the fetched language to the application UI using `next-intl`.
- To ensure this preference overrides other language detection methods for authenticated users post-login.
- To handle fallback scenarios gracefully if the preferred language is not set or invalid.

## 3. Target Users

- Authenticated Users of the AgriConnect application.

## 4. User Stories

As an authenticated AgriConnect user,
I want the application to automatically switch to my preferred language (stored in my profile) immediately after I log in,
So that I can use the application in the language I am most comfortable with without manual intervention.

## 5. Scope

### 5.1. In Scope

- Fetching the `preferred_language` from the Supabase `user_profiles` table for the authenticated user upon successful login.
- Applying the fetched language to the application using `next-intl`, potentially involving a redirect to the correct locale path or updating the i18n context.
- Implementing session-aware logic, likely within [`app/src/app/[locale]/layout.tsx`](app/src/app/[locale]/layout.tsx) or a similar higher-order component, to manage this process.
- Ensuring the language preference from Supabase takes precedence over other detection methods (e.g., cookie, browser header) for authenticated users post-login.
- Handling cases where the preferred language might not be set or is invalid, falling back to a default or existing mechanism.

### 5.2. Out of Scope

- Changes to the language selection mechanism itself (LanguageSwitcher component).
- Changes to how language preference is stored for unauthenticated users.
- Modifications to the Clerk authentication flow, beyond reacting to successful login.
- Adding new languages.

## 6. Functional Requirements

- **FR-REFINE-1:** Upon successful user login, the system MUST fetch the `preferred_language` attribute from the authenticated user's profile in the Supabase `user_profiles` table.
- **FR-REFINE-2:** If a `preferred_language` is found and is a supported locale, the system MUST apply this language to the application UI using `next-intl`. This may involve redirecting the user to the URL path corresponding to their preferred locale (e.g., `/hi/dashboard` if preferred language is Hindi).
- **FR-REFINE-3:** The logic for fetching and applying the preferred language MUST be executed as soon as the user's authenticated state is available post-login.
- **FR-REFINE-4:** If the user's `preferred_language` in Supabase is not set, is invalid, or not supported, the system SHOULD fall back to the currently active locale (e.g., from URL or cookie) or a default application language.
- **FR-REFINE-5:** The application of the stored preferred language should override any language preference set via cookie or browser header for the duration of the authenticated session, specifically for determining the initial language setting post-login.

## 7. Non-Functional Requirements

- **NFR-REFINE-1 (Performance):** The process of fetching and applying the preferred language should minimize perceived latency. If a redirect is necessary, it should be as seamless as possible. Avoid significant delays or multiple visible page reloads.
- **NFR-REFINE-2 (Usability):** The user should experience a consistent language across the application once their preferred language is applied. Minimize content flashing in the old language before the new one is applied.
- **NFR-REFINE-3 (Reliability):** The mechanism must reliably fetch and apply the language preference on every login for users with a set preference.

## 8. Acceptance Criteria

- **AC-REFINE-1:** Given an authenticated user has 'hi' (Hindi) set as their `preferred_language` in their Supabase profile, when the user logs in (regardless of the language of the login page itself), then the application UI should automatically switch to or load in Hindi.
- **AC-REFINE-2:** Given an authenticated user has an invalid or unset `preferred_language` in Supabase, when the user logs in, then the application should use the default language detection mechanism (e.g., URL locale, cookie, or application default).
- **AC-REFINE-3:** Given an authenticated user logs in, the transition to their preferred language (if different from the pre-login language) should be efficient, minimizing any visible flash of content in the previous language.
- **AC-REFINE-4:** Once the preferred language is applied post-login, subsequent navigation within the authenticated session should respect this language, assuming no further manual changes via the LanguageSwitcher.

## 9. UI/UX Considerations

- The primary UX consideration is a smooth transition to the user's preferred language post-login.
- If a redirect is used, it should happen quickly.
- If client-side logic updates the language, any flash of content in a different language should be minimized or avoided.

## 10. Technical Considerations & Constraints

- Implementation will likely involve client-side logic in [`app/src/app/[locale]/layout.tsx`](app/src/app/[locale]/layout.tsx) using Clerk's `useUser()` or `useAuth()` hooks to detect authentication status and user ID.
- Supabase client will be used to fetch user profile data.
- `next-intl`'s `useRouter()` or Next.js's `useRouter()` might be needed for redirection if that approach is chosen.
- Consider potential race conditions between initial page load, authentication state resolution, and language preference fetching.
- Refer to the findings in [`comprehension/UserAuthentication_LanguageSelection_refinement_comprehension_report.md`](comprehension/UserAuthentication_LanguageSelection_refinement_comprehension_report.md) for deeper technical insights if needed during implementation.

## 11. Key Dependencies

- Clerk (for authentication state)
- Supabase (for user profile data)
- `next-intl` (for i18n management)
- Next.js (App Router, middleware, layout components)

## 12. Existing Documentation

The following documents provide additional context and should be consulted as needed:
- [`docs/specs/UserAuthentication_LanguageSelection_overview.md`](docs/specs/UserAuthentication_LanguageSelection_overview.md)
- [`docs/architecture/UserAuthentication_LanguageSelection_architecture.md`](docs/architecture/UserAuthentication_LanguageSelection_architecture.md)
- [`comprehension/UserAuthentication_LanguageSelection_refinement_comprehension_report.md`](comprehension/UserAuthentication_LanguageSelection_refinement_comprehension_report.md)