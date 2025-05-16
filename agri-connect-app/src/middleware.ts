import {clerkMiddleware, createRouteMatcher} from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';

const locales = ['en', 'hi', 'mr'];
const publicRoutes = createRouteMatcher([
  '/',
  '/(.*)/sign-in(.*)',
  '/(.*)/sign-up(.*)',
  '/api/webhooks/clerk', // Example public webhook
]);

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed' // or 'always' or 'never'
});

export default clerkMiddleware((auth, req) => {
  if (publicRoutes(req)) {
    // For public routes, apply intl middleware directly
    return intlMiddleware(req);
  }
  // For protected routes, first ensure authentication
  auth().protect();
  // Then apply intl middleware
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and public files
    '/((?!_next|.*\\..*).*)',
    // Match all routes including the root
    '/',
  ],
};