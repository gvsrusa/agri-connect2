// Global type definitions

/**
 * Represents the structure of a user profile in the Supabase `user_profiles` table.
 */
export interface UserProfile {
  /**
   * The unique identifier for the user profile (typically a UUID).
   */
  id: string;
  /**
   * The Clerk user ID associated with this profile.
   */
  clerk_user_id: string;
  /**
   * The user's preferred language code (e.g., "en", "hi").
   */
  preferred_language: string | null;
  /**
   * The user's display name.
   */
  name: string | null;
  /**
   * Timestamp of when the profile was created.
   */
  created_at: string;
  /**
   * Timestamp of when the profile was last updated.
   */
  updated_at: string;
}