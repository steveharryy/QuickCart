import { Inngest } from "inngest";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const inngest = new Inngest({
  id: "quickcart-next",
  signingKey: process.env.INNGEST_SIGNING_KEY,
});

const supabase = createClient(supabaseUrl, supabaseKey);

export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },

  async ({ event }) => {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const { error } = await supabase
      .from('users')
      .insert({
        id,
        email: email_addresses[0].email_address,
        name: `${first_name || ''} ${last_name || ''}`.trim(),
        image_url: image_url || null,
        cart_items: {}
      });

    if (error) {
      console.error('Error creating user:', error);
    }
  }
);

export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },

  async ({ event }) => {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const { error } = await supabase
      .from('users')
      .update({
        email: email_addresses[0].email_address,
        name: `${first_name || ''} ${last_name || ''}`.trim(),
        image_url: image_url || null
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating user:', error);
    }
  }
);

export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },

  async ({ event }) => {
    const { id } = event.data;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
    }
  }
);
