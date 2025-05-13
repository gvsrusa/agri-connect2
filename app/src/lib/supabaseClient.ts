import { createClient } from '@supabase/supabase-js';

// Ensure your environment variables are set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Example of how to use the service role key for admin tasks (server-side only)
//
// import { createClient as createServerClient } from '@supabase/supabase-js';
//
// export const getSupabaseAdmin = () => {
//   const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
//   if (!supabaseServiceRoleKey) {
//     throw new Error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY for admin client");
//   }
//   // Important: This client bypasses RLS and should only be used in secure server-side environments.
//   return createServerClient(supabaseUrl, supabaseServiceRoleKey);
// };

// Note on usage:
// For client-side (browser) usage, import `supabase` directly:
// import { supabase } from '@/lib/supabaseClient';
//
// For server-side operations that require bypassing RLS (e.g., admin tasks in API routes or Server Actions),
// you would typically use the service_role key. The commented-out `getSupabaseAdmin` function
// provides an example pattern. Ensure SUPABASE_SERVICE_ROLE_KEY is NEVER exposed to the client.