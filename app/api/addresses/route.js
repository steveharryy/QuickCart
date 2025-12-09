import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch addresses error:', error);
      return Response.json({ success: false, message: error.message }, { status: 500 });
    }

    return Response.json({ success: true, addresses });
  } catch (error) {
    console.error('Fetch addresses error:', error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { fullName, phoneNumber, pincode, area, city, state } = await req.json();

    if (!fullName || !phoneNumber || !pincode || !area || !city || !state) {
      return Response.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: address, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        full_name: fullName,
        phone_number: phoneNumber,
        pincode,
        area,
        city,
        state
      })
      .select()
      .single();

    if (error) {
      console.error('Address creation error:', error);
      return Response.json({ success: false, message: error.message }, { status: 500 });
    }

    return Response.json({ success: true, address });
  } catch (error) {
    console.error('Address creation error:', error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
