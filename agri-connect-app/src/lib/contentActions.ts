import { supabase } from '@/services/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Type for advisory or post-harvest content
 */
export interface ContentItem {
  id: string;
  topic_key: string;
  language_code: string;
  title: string;
  body_text: string;
  category_key?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetches a list of advisory content topics for a given language
 * 
 * @param languageCode The language code ('en', 'hi', 'mr')
 * @returns Object containing data and error values
 */
export async function getAdvisoryTopics(languageCode: string) {
  try {
    if (!languageCode) {
      return { data: null, error: 'Language code is required' };
    }
    
    const { data, error } = await supabase
      .from('advisory_content')
      .select('id, topic_key, title, category_key')
      .eq('language_code', languageCode)
      .order('title');
    
    if (error) {
      console.error("Error fetching advisory topics:", error);
      return { data: null, error: 'Error fetching advisory topics' };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error in getAdvisoryTopics:", error);
    return { 
      data: null, 
      error: 'An unexpected error occurred' 
    };
  }
}

/**
 * Fetches specific advisory content by topic key and language code
 * 
 * @param topicKey The topic key to fetch
 * @param languageCode The language code ('en', 'hi', 'mr')
 * @returns Object containing data and error values
 */
export async function getAdvisoryContent(topicKey: string, languageCode: string) {
  try {
    if (!topicKey || !languageCode) {
      return { data: null, error: 'Topic key and language code are required' };
    }
    
    const { data, error } = await supabase
      .from('advisory_content')
      .select('*')
      .eq('topic_key', topicKey)
      .eq('language_code', languageCode)
      .single();
    
    if (error) {
      console.error("Error fetching advisory content:", error);
      return { data: null, error: 'Error fetching advisory content' };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error in getAdvisoryContent:", error);
    return { 
      data: null, 
      error: 'An unexpected error occurred' 
    };
  }
}

/**
 * Fetches a list of post-harvest content topics for a given language
 * 
 * @param languageCode The language code ('en', 'hi', 'mr')
 * @returns Object containing data and error values
 */
export async function getPostHarvestTopics(languageCode: string) {
  try {
    if (!languageCode) {
      return { data: null, error: 'Language code is required' };
    }
    
    const { data, error } = await supabase
      .from('post_harvest_content')
      .select('id, topic_key, title, category_key')
      .eq('language_code', languageCode)
      .order('title');
    
    if (error) {
      console.error("Error fetching post-harvest topics:", error);
      return { data: null, error: 'Error fetching post-harvest topics' };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error in getPostHarvestTopics:", error);
    return { 
      data: null, 
      error: 'An unexpected error occurred' 
    };
  }
}

/**
 * Fetches specific post-harvest content by topic key and language code
 * 
 * @param topicKey The topic key to fetch
 * @param languageCode The language code ('en', 'hi', 'mr')
 * @returns Object containing data and error values
 */
export async function getPostHarvestContent(topicKey: string, languageCode: string) {
  try {
    if (!topicKey || !languageCode) {
      return { data: null, error: 'Topic key and language code are required' };
    }
    
    const { data, error } = await supabase
      .from('post_harvest_content')
      .select('*')
      .eq('topic_key', topicKey)
      .eq('language_code', languageCode)
      .single();
    
    if (error) {
      console.error("Error fetching post-harvest content:", error);
      return { data: null, error: 'Error fetching post-harvest content' };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error in getPostHarvestContent:", error);
    return { 
      data: null, 
      error: 'An unexpected error occurred' 
    };
  }
}

/**
 * Utility function to fetch unique category keys from a table
 *
 * @param supabaseClient The Supabase client to use
 * @param tableName The table to fetch from (e.g., 'advisory_content', 'post_harvest_content')
 * @param categoryColumnName The column name for the category (e.g., 'category_key')
 * @returns Object containing data and error values
 */
export async function getUniqueCategoryKeys(
  supabaseClient: SupabaseClient,
  tableName: string,
  categoryColumnName: string
): Promise<{ data: string[] | null; error: string | null }> {
  try {
    const { data, error } = await supabaseClient
      .from(tableName)
      .select(categoryColumnName)
      .order(categoryColumnName);
    
    if (error) {
      console.error(`Error fetching ${categoryColumnName} from ${tableName}:`, error);
      return { data: null, error: `Error fetching ${tableName} categories` };
    }
    
    // Create a unique set of category keys
    const uniqueKeys = new Set<string>();
    data.forEach((item: any) => {
      if (item[categoryColumnName]) {
        uniqueKeys.add(item[categoryColumnName]);
      }
    });
    
    // Convert Set back to array
    const categoryKeys = Array.from(uniqueKeys);
    
    return { data: categoryKeys, error: null };
  } catch (error) {
    console.error(`Unexpected error in getUniqueCategoryKeys for ${tableName}:`, error);
    return {
      data: null,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Fetches available categories for advisory content
 *
 * @returns Object containing data and error values
 */
export async function getAdvisoryCategories() {
  return getUniqueCategoryKeys(supabase, 'advisory_content', 'category_key');
}

/**
 * Fetches available categories for post-harvest content
 *
 * @returns Object containing data and error values
 */
export async function getPostHarvestCategories() {
  return getUniqueCategoryKeys(supabase, 'post_harvest_content', 'category_key');
}