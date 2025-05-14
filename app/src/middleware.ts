import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

const locales = ['en', 'hi', 'mr'];
const defaultLocale = 'en';

// Configure next-intl middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Options: 'as-needed', 'always', 'never'
  localeDetection: true, // Explicitly enable to ensure default behavior, though true by default
  // The matcher in `config` (below) will prevent this intl middleware
  // from running on /api, /_next, static files, etc.
});

// Define routes that should be protected by Clerk.
// These paths are matched on the full request path, including locale prefixes.
// Example: '/(en|hi|mr)/dashboard(.*)' would match /en/dashboard, /hi/dashboard/settings, /mr/profile
const isProtectedRoute = createRouteMatcher([
  `/(en|hi|mr)/dashboard(.*)`, // Protect dashboard pages under any locale
  // Add other application-specific protected routes here:
  // e.g., `/(en|hi|mr)/profile`, `/(en|hi|mr)/settings`
]);

// Export the combined middleware function
export default clerkMiddleware((auth, req: NextRequest) => {
  // The `auth` object itself has the `protect` method.
  // It can also be called as `auth()` to get a promise for auth state details.
  if (isProtectedRoute(req)) {
    auth.protect(); // Call protect directly on the auth object
  }

  // For all other routes (public routes, Clerk's own authentication pages,
  // or routes where the user is already authenticated and not caught by protect()),
  // Clerk allows the request to proceed.

  // After Clerk's processing (which might include redirection if protect() was called),
  // run the next-intl middleware for internationalization.
  return intlMiddleware(req);
});

export const config = {
  // Matcher for the entire middleware chain (Clerk + next-intl).
  // This regex should match all page routes and exclude:
  // - API routes (unless you want them processed by this middleware chain)
  // - Next.js internal paths (_next, _vercel)
  // - Static files (files with extensions like .png, .ico, .css)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
  // This matcher ensures that the middleware runs for:
  // - The root path ('/')
  // - Locale-prefixed paths (e.g., '/en/about', '/hi/dashboard', '/mr/contact')
  // - Paths without extensions, which are typically pages.
  // It excludes:
  // - Paths starting with '/api/'
  // - Paths starting with '/_next/' (Next.js static/build files)
  // - Paths starting with '/_vercel/' (Vercel-specific files)
  // - Paths containing a '.' before the last slash, likely indicating a file extension.
};