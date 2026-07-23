'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function registerMenuVisit(businessId: string, visitorId: string) {
  if (!businessId || !visitorId) {
    return { error: 'Missing parameters' };
  }

  const supabase = await createClient();
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || null;
  const userAgent = headersList.get('user-agent') || null;

  try {
    // Attempt to insert the visit
    // RLS policy allows anonymous inserts.
    // The UNIQUE constraint (business_id, visitor_id, visit_date) prevents multiple entries for the same visitor on the same day.
    const { error } = await supabase
      .from('menu_visits')
      .insert({
        business_id: businessId,
        visitor_id: visitorId,
        ip_address: ipAddress,
        user_agent: userAgent
      });

    // If the table doesn't exist yet (42P01), silently ignore to avoid breaking the frontend
    // before the migration is run.
    if (error && error.code === '42P01') {
      return { success: false, message: 'Table not created yet' };
    }

    // If it's a unique violation error (code 23505), we can silently ignore it
    // because it means they already visited today.
    if (error && error.code === '23505') {
      return { success: true, message: 'Already visited today' };
    }

    if (error) {
      console.error('Error inserting menu visit:', JSON.stringify(error));
      return { error: 'Failed to track visit' };
    }

    return { success: true };
  } catch (err) {
    console.error('Exception in registerMenuVisit:', err);
    return { error: 'Internal server error' };
  }
}
