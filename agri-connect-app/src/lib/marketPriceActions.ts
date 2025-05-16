import { supabase } from '@/services/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Fetches all market prices.
 * If both cropNameKey and marketNameKey are provided, filters by those values.
 * If only one is provided, filters by that value only.
 * If none are provided, returns all market prices.
 * 
 * @param cropNameKey Optional crop name key to filter by
 * @param marketNameKey Optional market name key to filter by
 * @returns Object containing data and error values
 */
export async function getMarketPrices(cropNameKey?: string, marketNameKey?: string) {
  try {
    let query = supabase
      .from("market_prices")
      .select("*")
      .order("price_date", { ascending: false });
    
    if (cropNameKey) {
      query = query.eq("crop_name_key", cropNameKey);
    }
    
    if (marketNameKey) {
      query = query.eq("market_name_key", marketNameKey);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching market prices:", error);
      return { data: null, error: 'Error fetching market prices' };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error in getMarketPrices:", error);
    return { 
      data: null, 
      error: 'An unexpected error occurred' 
    };
  }
}

/**
 * Fetches a specific market price based on crop and market
 * 
 * @param cropNameKey The crop name key to find
 * @param marketNameKey The market name key to find
 * @returns Object containing data and error values
 */
export async function getMarketPrice(cropNameKey: string, marketNameKey: string) {
  try {
    const { data, error } = await supabase
      .from("market_prices")
      .select("*")
      .eq("crop_name_key", cropNameKey)
      .eq("market_name_key", marketNameKey)
      .order("price_date", { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      // Don't consider not found as an error for this function
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      
      console.error("Error fetching market price:", error);
      return { data: null, error: 'Error fetching market price' };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error in getMarketPrice:", error);
    return { 
      data: null, 
      error: 'An unexpected error occurred' 
    };
  }
}

/**
 * Utility function to get distinct keys from a table column
 *
 * @param supabaseClient The Supabase client to use
 * @param tableName The table to fetch from (e.g., 'market_prices')
 * @param columnName The column name to get distinct values from (e.g., 'crop_name_key', 'market_name_key')
 * @returns Object containing data and error values
 */
export async function getDistinctKeysFromTable(
  supabaseClient: SupabaseClient,
  tableName: string,
  columnName: string
): Promise<{ data: string[] | null; error: string | null }> {
  try {
    // Using distinct on the SQL query since .distinct() may not be available
    const { data, error } = await supabaseClient
      .from(tableName)
      .select(columnName)
      .order(columnName);
    
    if (error) {
      console.error(`Error fetching distinct ${columnName} from ${tableName}:`, error);
      return { data: null, error: `Error fetching ${columnName}` };
    }
    
    // Create a unique set of keys
    const uniqueKeys = new Set<string>();
    data.forEach((item: any) => {
      uniqueKeys.add(item[columnName]);
    });
    
    // Convert Set back to array
    const keys = Array.from(uniqueKeys);
    
    return { data: keys, error: null };
  } catch (error) {
    console.error(`Unexpected error in getDistinctKeysFromTable for ${columnName}:`, error);
    return {
      data: null,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Gets a distinct list of crop name keys from the market_prices table
 *
 * @returns Object containing data and error values
 */
export async function getDistinctCropNameKeys() {
  return getDistinctKeysFromTable(supabase, "market_prices", "crop_name_key");
}

/**
 * Gets a distinct list of market name keys from the market_prices table
 *
 * @returns Object containing data and error values
 */
export async function getDistinctMarketNameKeys() {
  return getDistinctKeysFromTable(supabase, "market_prices", "market_name_key");
}