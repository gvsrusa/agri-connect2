import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabaseClient'; // Ensure this path is correct
import { NextRequest, NextResponse } from 'next/server';

// Define the expected structure of the user.created event data
interface UserCreatedEventData {
  id: string; // This is the clerk_user_id
  email_addresses: { email_address: string; id: string }[];
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  // Add other relevant fields from Clerk user object if needed
}

export async function POST(req: NextRequest) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return new Response('Error: Webhook secret not configured.', {
      status: 500,
    });
  }

  // Get the headers from the NextRequest object
  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', {
      status: 400,
    });
  }

  // Get the body
  let payload: WebhookEvent;
  try {
    payload = await req.json();
  } catch (err) {
    console.error('Error parsing webhook payload:', err);
    return new Response('Error: Invalid JSON payload', { status: 400 });
  }
  
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err: any) {
    console.error('Error verifying webhook:', err.message);
    return new Response(`Error: ${err.message}`, {
      status: 400,
    });
  }

  const eventType = evt.type;
  
  if (eventType === 'user.created') {
    const eventData = evt.data as UserCreatedEventData;
    const clerkUserId = eventData.id; // Clerk User ID

    console.log(`Webhook for user.created event with Clerk User ID: ${clerkUserId} and type of ${eventType}`);

    // Extract primary email if available, otherwise null
    const primaryEmailObject = eventData.email_addresses?.find(
        (emailObj) => emailObj.id === eventData.primary_email_address_id
      );
    const primaryEmail = primaryEmailObject?.email_address || eventData.email_addresses?.[0]?.email_address || null;

    const name = eventData.first_name || eventData.last_name ? `${eventData.first_name || ''} ${eventData.last_name || ''}`.trim() : null;

    // Defaulting preferred_language to 'en'. 
    // This could be enhanced later, e.g., by trying to infer from request headers if possible,
    // or by allowing users to set it during their first interaction post-signup.
    const preferredLanguage = 'en'; 

    try {
      const { data: existingUser, error: selectError } = await supabase
        .from('user_profiles')
        .select('clerk_user_id')
        .eq('clerk_user_id', clerkUserId)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116: no rows found, which is fine
        console.error('Error checking for existing user in Supabase:', selectError);
        return new Response('Error: Supabase query failed', { status: 500 });
      }

      if (existingUser) {
        console.log(`User ${clerkUserId} already exists in Supabase. Skipping creation.`);
        return new Response('User already exists', { status: 200 });
      }
      
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          clerk_user_id: clerkUserId,
          name: name,
          // email: primaryEmail, // Uncomment if your 'user_profiles' table has an 'email' column
          preferred_language: preferredLanguage,
        });

      if (insertError) {
        console.error('Error inserting user into Supabase user_profiles:', insertError);
        return new Response('Error: Could not create user profile in Supabase', {
          status: 500,
        });
      }
      console.log(`User profile created in Supabase for Clerk user ID: ${clerkUserId}`);
    } catch (err) {
      console.error('Unexpected error during Supabase operation:', err);
      return new Response('Error: Internal server error during Supabase operation', { status: 500 });
    }
  } else {
    console.log(`Received webhook event type: ${eventType}. Skipping.`);
  }

  return new Response('', { status: 200 });
}