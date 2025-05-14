import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { language } = await req.json();

    if (!language || typeof language !== 'string') {
      return NextResponse.json({ error: 'Language code is required and must be a string.' }, { status: 400 });
    }

    // Validate language code (optional, but good practice)
    const validLanguages = ['en', 'hi', 'mr'];
    if (!validLanguages.includes(language)) {
      return NextResponse.json({ error: 'Invalid language code.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ preferred_language: language, updated_at: new Date().toISOString() })
      .eq('clerk_user_id', clerkUserId)
      .select('clerk_user_id, preferred_language') // Optionally return the updated record
      .single(); // Use single() if you expect only one record or it should error if not

    if (error) {
      console.error('Supabase error updating preferred language:', error);
      if (error.code === 'PGRST116') { // No row found for the clerk_user_id
        return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to update preferred language.', details: error.message }, { status: 500 });
    }
    
    if (!data) {
        // This case should ideally be caught by PGRST116, but as a fallback
        return NextResponse.json({ error: 'User profile not found after update attempt.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Preferred language updated.', userProfile: data }, { status: 200 });

  } catch (error: any) {
    console.error('Error in update-language API:', error);
    return NextResponse.json({ error: 'Internal server error.', details: error.message }, { status: 500 });
  }
}