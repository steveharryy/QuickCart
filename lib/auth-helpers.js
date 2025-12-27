import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getAuthenticatedSupabaseClient() {
  const { userId, getToken } = await auth();

  if (!userId) {
    return { client: null, userId: null, error: 'Unauthorized' };
  }

  try {
    const token = await getToken({ template: 'supabase' });

    const client = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: token ? {
          Authorization: `Bearer ${token}`
        } : {}
      }
    });

    return { client, userId, error: null };
  } catch (error) {
    return { client: null, userId, error: error.message };
  }
}
