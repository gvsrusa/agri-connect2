import { supabase } from '@/services/supabase/client';

/**
 * User feedback type definition
 */
export interface UserFeedback {
  feedback_id?: string;
  user_id?: string | null;
  rating?: number;
  comments: string;
  page_context?: string;
  created_at?: string;
}

/**
 * Submits user feedback
 * @param feedbackData - The feedback data
 * @returns Promise with the submitted feedback or error
 */
export async function submitUserFeedback(feedbackData: UserFeedback) {
  // Validate required fields
  if (!feedbackData.comments || feedbackData.comments.trim() === '') {
    return { data: null, error: 'Comments are required' };
  }
  
  if (feedbackData.rating !== undefined && (feedbackData.rating < 1 || feedbackData.rating > 5)) {
    return { data: null, error: 'Rating must be a number between 1 and 5' };
  }
  
  try {
    const { data, error } = await supabase
      .from('user_feedback')
      .insert([feedbackData])
      .select('*')
      .single();
    
    if (error) {
      console.error('Error submitting user feedback:', error);
      return { data: null, error: handleFeedbackSubmissionError(error) };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error submitting user feedback:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Gets feedback entries for a specific user
 * @param userId - The user ID to get feedback for
 * @returns Promise with the user's feedback entries or error
 */
export async function getFeedbackByUser(userId: string) {
  if (!userId) {
    return { data: null, error: 'User ID is required' };
  }
  
  try {
    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user feedback:', error);
      return { data: null, error: 'Error fetching feedback' };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching user feedback:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Gets all feedback entries
 * Note: This would typically be restricted to admin users via RLS
 * @returns Promise with all feedback entries or error
 */
export async function getAllFeedback() {
  try {
    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all feedback:', error);
      return { data: null, error: 'Error fetching feedback' };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching all feedback:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Handles authentication errors in feedback submission
 * @param error - The error object from Supabase
 * @returns A user-friendly error message
 */
function handleFeedbackSubmissionError(error: any): string {
  if (error.code === '42501') {
    return 'Authentication error. Try submitting anonymously.';
  }
  return 'Error submitting feedback';
}