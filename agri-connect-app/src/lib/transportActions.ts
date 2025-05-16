import { supabase } from '@/services/supabase/client';
import { revalidatePath } from 'next/cache';

/**
 * Transport request type definition
 */
export interface TransportRequest {
  request_id?: string;
  farmer_user_id: string;
  produce_type: string;
  quantity: string;
  pickup_location: string;
  destination_location: string;
  date_needed: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Transporter type definition
 */
export interface Transporter {
  transporter_id?: string;
  name: string;
  contact_info?: string;
  service_areas?: string;
  capacity?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Creates a new transport request
 * @param requestData - The transport request data
 * @returns Promise with the created transport request or error
 */
export async function createTransportRequest(requestData: TransportRequest) {
  // Validate required fields
  if (!requestData.farmer_user_id) {
    return { data: null, error: 'Farmer user ID is required' };
  }
  if (!requestData.produce_type) {
    return { data: null, error: 'Produce type is required' };
  }
  if (!requestData.quantity) {
    return { data: null, error: 'Quantity is required' };
  }
  if (!requestData.pickup_location) {
    return { data: null, error: 'Pickup location is required' };
  }
  if (!requestData.destination_location) {
    return { data: null, error: 'Destination location is required' };
  }
  if (!requestData.date_needed) {
    return { data: null, error: 'Date needed is required' };
  }
  
  try {
    const { data, error } = await supabase
      .from('transport_requests')
      .insert([requestData])
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating transport request:', error);
      return { data: null, error: 'Error creating transport request' };
    }
    
    // Revalidate relevant paths
    revalidatePath('/[locale]/request-transportation');
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error creating transport request:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Gets transport requests for a specific farmer
 * @param farmerUserId - The farmer's user ID
 * @returns Promise with the farmer's transport requests or error
 */
export async function getTransportRequestsByFarmer(farmerUserId: string) {
  if (!farmerUserId) {
    return { data: null, error: 'Farmer user ID is required' };
  }
  
  try {
    const { data, error } = await supabase
      .from('transport_requests')
      .select('*')
      .eq('farmer_user_id', farmerUserId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching transport requests:', error);
      return { data: null, error: 'Error fetching transport requests' };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching transport requests:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Gets all transport requests, optionally filtered by status
 * @param status - Optional status filter
 * @returns Promise with all transport requests or error
 */
export async function getAllTransportRequests(status?: string) {
  try {
    let query = supabase
      .from('transport_requests')
      .select('*');
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching transport requests:', error);
      return { data: null, error: 'Error fetching transport requests' };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching transport requests:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Gets all transporters
 * @returns Promise with all transporters or error
 */
export async function getTransporters() {
  try {
    const { data, error } = await supabase
      .from('transporters')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching transporters:', error);
      return { data: null, error: 'Error fetching transporters' };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching transporters:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Updates the status of a transport request
 * @param requestId - The ID of the transport request to update
 * @param status - The new status
 * @param userId - The user ID making the update (for verification)
 * @returns Promise with the updated transport request or error
 */
export async function updateTransportRequestStatus(requestId: string, status: string, userId: string) {
  if (!requestId || !status || !userId) {
    return { data: null, error: 'Request ID, status, and user ID are required' };
  }
  
  try {
    // First, verify the request belongs to the user
    const { data: existingRequest, error: fetchError } = await supabase
      .from('transport_requests')
      .select('*')
      .eq('request_id', requestId)
      .eq('farmer_user_id', userId)
      .single();
    
    if (fetchError) {
      console.error('Error verifying transport request ownership:', fetchError);
      return { data: null, error: 'Error verifying transport request ownership' };
    }
    
    if (!existingRequest) {
      return { data: null, error: 'Transport request not found or not owned by user' };
    }
    
    // Then, update the status
    const { data, error } = await supabase
      .from('transport_requests')
      .update({ status })
      .eq('request_id', requestId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating transport request status:', error);
      return { data: null, error: 'Error updating transport request status' };
    }
    
    // Revalidate relevant paths
    revalidatePath('/[locale]/request-transportation');
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating transport request status:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Deletes a transport request
 * @param requestId - The ID of the transport request to delete
 * @param userId - The user ID making the deletion (for verification)
 * @returns Promise with the deleted transport request or error
 */
export async function deleteTransportRequest(requestId: string, userId: string) {
  if (!requestId || !userId) {
    return { data: null, error: 'Request ID and user ID are required' };
  }
  
  try {
    // First, verify the request belongs to the user and is in a deletable state (pending)
    const { data: existingRequest, error: fetchError } = await supabase
      .from('transport_requests')
      .select('*')
      .eq('request_id', requestId)
      .eq('farmer_user_id', userId)
      .eq('status', 'pending')
      .single();
    
    if (fetchError) {
      console.error('Error verifying transport request:', fetchError);
      return { 
        data: null, 
        error: 'Transport request not found, not owned by user, or not in a deletable state' 
      };
    }
    
    // Then, delete the request
    const { error } = await supabase
      .from('transport_requests')
      .delete()
      .eq('request_id', requestId);
    
    if (error) {
      console.error('Error deleting transport request:', error);
      return { data: null, error: 'Error deleting transport request' };
    }
    
    // Revalidate relevant paths
    revalidatePath('/[locale]/request-transportation');
    
    return { data: existingRequest, error: null };
  } catch (error) {
    console.error('Unexpected error deleting transport request:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}