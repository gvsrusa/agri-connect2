import { supabase } from '@/services/supabase/client';
import { User } from '@clerk/nextjs/server'; // For type hint, might need client version if used client-side

export interface Language {
  code: string;
  name: string;
  native_name?: string;
}

export interface UserProfile {
  clerk_user_id: string;
  preferred_language_code: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetches all available languages from the 'languages' table.
 */
export const getLanguages = async (): Promise<Language[]> => {
  const { data, error } = await supabase.from('languages').select('*');

  if (error) {
    console.error('Error fetching languages:', error);
    // Fallback or rethrow, for now, return empty or a default set
    // For robustness, consider a predefined fallback list if DB is unavailable
    return [
        { code: 'en', name: 'English (Default)', native_name: 'English' },
        // Add other critical languages as fallback if necessary
    ];
  }
  return data || [];
};

/**
 * Fetches the preferred language for a given Clerk user ID.
 * @param clerkUserId The Clerk user ID.
 * @returns The preferred language code (e.g., 'en') or null if not found/error.
 */
export const getUserPreferredLanguage = async (clerkUserId: string): Promise<string | null> => {
  if (!clerkUserId) {
    console.warn('getUserPreferredLanguage called without clerkUserId');
    return null;
  }
  const { data, error } = await supabase
    .from('users')
    .select('preferred_language_code')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // PGRST116: "The result contains 0 rows"
        console.log(`No user profile found for clerk_user_id: ${clerkUserId}. A new one might be created.`);
        return null; 
    }
    console.error('Error fetching user preferred language:', error);
    return null;
  }
  return data?.preferred_language_code || null;
};

/**
 * Creates or updates a user profile in the 'users' table.
 * Defaults preferred_language_code to 'en' if not provided during creation.
 * @param clerkUserId The Clerk user ID.
 * @param preferredLanguageCode Optional. The user's preferred language code.
 * @returns The created or updated user profile data or null on error.
 */
export const upsertUserProfile = async (
  clerkUserId: string,
  preferredLanguageCode?: string
): Promise<UserProfile | null> => {
  if (!clerkUserId) {
    console.error('upsertUserProfile called without clerkUserId');
    return null;
  }

  // Try to fetch existing user to decide on language code for insert
  let existingUserLanguage: string | null = null;
  if (!preferredLanguageCode) {
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('preferred_language_code')
      .eq('clerk_user_id', clerkUserId)
      .single();
    if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing user before upsert:', fetchError);
        // Potentially proceed with default or handle error
    }
    if (existingUser) {
        existingUserLanguage = existingUser.preferred_language_code;
    }
  }


  const userProfileData: Partial<UserProfile> = {
    clerk_user_id: clerkUserId,
  };

  if (preferredLanguageCode) {
    userProfileData.preferred_language_code = preferredLanguageCode;
  } else if (existingUserLanguage) {
    userProfileData.preferred_language_code = existingUserLanguage;
  } else {
    userProfileData.preferred_language_code = 'en'; // Default for new users
  }
  

  const { data, error } = await supabase
    .from('users')
    .upsert(userProfileData, { onConflict: 'clerk_user_id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user profile:', error);
    return null;
  }

  console.log('User profile upserted successfully:', data);
  return data;
};