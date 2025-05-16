'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers'; 
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Define the schema for a produce listing for validation
export const ProduceListingSchema = z.object({
  listing_id: z.string().uuid().optional(),
  seller_user_id: z.string().uuid(),
  crop_type: z.string().min(1, { message: 'Crop type is required' }),
  quantity: z.number().positive({ message: 'Quantity must be a positive number' }),
  price: z.number().positive({ message: 'Price must be a positive number' }),
  description: z.string().optional(),
  status: z.enum(['available', 'sold', 'delisted']).default('available'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type ProduceListing = z.infer<typeof ProduceListingSchema>;

export type CreateProduceListingInput = Omit<ProduceListing, 'listing_id' | 'created_at' | 'updated_at' | 'status' | 'seller_user_id'> & {
  status?: 'available' | 'sold' | 'delisted';
};
export type UpdateProduceListingInput = Partial<Omit<ProduceListing, 'listing_id' | 'seller_user_id' | 'created_at' | 'updated_at'>> & { listing_id: string };

// Helper function to get Supabase client and user
async function getSupabaseClientWithUser() {
  const cookieStore = await cookies(); // Await the cookies() call
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // NOP if called from a Server Component, as recommended by Supabase docs
            // if middleware handles session refresh.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, '', options);
          } catch (error) {
            // NOP if called from a Server Component.
          }
        },
      },
    }
  );
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not authenticated or error fetching user.');
  }
  return { supabase, user };
}

// Helper function to get Supabase client (for public reads)
async function getSupabaseClient() {
    const cookieStore = await cookies(); // Await the cookies() call
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                  try {
                    cookieStore.set(name, value, options);
                  } catch (error) {
                    // NOP for server components
                  }
                },
                remove(name: string, options: CookieOptions) {
                  try {
                    cookieStore.set(name, '', options);
                  } catch (error) {
                    // NOP for server components
                  }
                },
            },
        }
    );
}

/**
 * Creates a new produce listing.
 */
export async function createProduceListing(
  data: CreateProduceListingInput
): Promise<{ data?: ProduceListing; error?: string, errorFields?: any }> {
  try {
    const { supabase, user } = await getSupabaseClientWithUser();
    const validatedData = ProduceListingSchema.omit({ 
      listing_id: true, created_at: true, updated_at: true,
    }).partial({ status: true })
    .safeParse({ ...data, seller_user_id: user.id });

    if (!validatedData.success) {
      return { error: "Validation failed", errorFields: validatedData.error.flatten().fieldErrors };
    }
    
    const listingDataToInsert = {
        ...validatedData.data,
        seller_user_id: user.id, 
        status: validatedData.data.status || 'available',
    };

    const { data: newListing, error } = await supabase
      .from('produce_listings')
      .insert(listingDataToInsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating produce listing:', error);
      return { error: error.message };
    }

    revalidatePath('/[locale]/marketplace', 'page');
    revalidatePath(`/[locale]/marketplace/list-crop`, 'page');
    return { data: newListing as ProduceListing };
  } catch (e: any) {
    console.error('Unexpected error in createProduceListing:', e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}

/**
 * Fetches all produce listings.
 */
export async function getAllProduceListings(): Promise<{ data?: ProduceListing[]; error?: string }> {
  try {
    const supabase = await getSupabaseClient(); // Await the helper
    const { data, error } = await supabase
      .from('produce_listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all produce listings:', error);
      return { error: error.message };
    }
    return { data: data as ProduceListing[] };
  } catch (e: any) {
    console.error('Unexpected error in getAllProduceListings:', e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}

/**
 * Fetches a single produce listing by its ID.
 */
export async function getProduceListingById(
  listingId: string
): Promise<{ data?: ProduceListing; error?: string }> {
  if (!listingId) return { error: 'Listing ID is required.' };
  try {
    const supabase = await getSupabaseClient(); // Await the helper
    const { data, error } = await supabase
      .from('produce_listings')
      .select('*')
      .eq('listing_id', listingId)
      .single();

    if (error) {
      console.error(`Error fetching produce listing by ID (${listingId}):`, error);
      return { error: error.message };
    }
    return { data: data as ProduceListing };
  } catch (e: any) {
    console.error('Unexpected error in getProduceListingById:', e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}

/**
 * Fetches all produce listings for a specific user.
 */
export async function getProduceListingsByUserId(
  userId: string
): Promise<{ data?: ProduceListing[]; error?: string }> {
  if (!userId) return { error: 'User ID is required.' };
  try {
    const supabase = await getSupabaseClient(); // Await the helper
    const { data, error } = await supabase
      .from('produce_listings')
      .select('*')
      .eq('seller_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching produce listings for user ID (${userId}):`, error);
      return { error: error.message };
    }
    return { data: data as ProduceListing[] };
  } catch (e: any) {
    console.error('Unexpected error in getProduceListingsByUserId:', e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}

/**
 * Updates an existing produce listing.
 */
export async function updateProduceListing(
  updateData: UpdateProduceListingInput
): Promise<{ data?: ProduceListing; error?: string, errorFields?: any }> {
  try {
    const { supabase, user } = await getSupabaseClientWithUser();
    const { listing_id, ...fieldsToUpdate } = updateData;

    if (!listing_id) return { error: 'Listing ID is required for an update.' };
    if (Object.keys(fieldsToUpdate).length === 0) return { error: 'No fields provided to update.' };

    const partialSchema = ProduceListingSchema.partial().omit({ 
        listing_id: true, seller_user_id: true, created_at: true, updated_at: true 
    });
    const validatedFields = partialSchema.safeParse(fieldsToUpdate);

    if (!validatedFields.success) {
      return { error: "Validation failed", errorFields: validatedFields.error.flatten().fieldErrors };
    }

    const { data: updatedListing, error } = await supabase
      .from('produce_listings')
      .update(validatedFields.data)
      .eq('listing_id', listing_id)
      .eq('seller_user_id', user.id) 
      .select()
      .single();

    if (error) {
      console.error(`Error updating produce listing (${listing_id}):`, error);
      return { error: error.message };
    }
    if (!updatedListing) return { error: 'Listing not found or user not authorized to update.' };

    revalidatePath('/[locale]/marketplace', 'page');
    revalidatePath(`/[locale]/marketplace/list-crop`, 'page');
    revalidatePath(`/[locale]/marketplace/edit-crop/${listing_id}`, 'page'); 
    return { data: updatedListing as ProduceListing };
  } catch (e: any) {
    console.error('Unexpected error in updateProduceListing:', e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}

/**
 * Deletes a produce listing.
 */
export async function deleteProduceListing(
  listingId: string
): Promise<{ success?: boolean; error?: string }> {
  if (!listingId) return { error: 'Listing ID is required.' };
  try {
    const { supabase, user } = await getSupabaseClientWithUser();
    const { error } = await supabase
      .from('produce_listings')
      .delete()
      .eq('listing_id', listingId)
      .eq('seller_user_id', user.id); 

    if (error) {
      console.error(`Error deleting produce listing (${listingId}):`, error);
      return { error: error.message };
    }

    revalidatePath('/[locale]/marketplace', 'page');
    revalidatePath(`/[locale]/marketplace/list-crop`, 'page');
    return { success: true };
  } catch (e: any) {
    console.error('Unexpected error in deleteProduceListing:', e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}