import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { items, amount, addressId } = await req.json();

    if (!items || !amount || !addressId) {
      return Response.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        items,
        amount,
        address_id: addressId,
        status: 'Order Placed',
        payment_method: 'COD',
        payment_status: 'Pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Order creation error:', error);
      return Response.json({ success: false, message: error.message }, { status: 500 });
    }

    await supabase
      .from('users')
      .update({ cart_items: {} })
      .eq('id', userId);

    return Response.json({ success: true, order });
  } catch (error) {
    console.error('Order creation error:', error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, addresses(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch orders error:', error);
      return Response.json({ success: false, message: error.message }, { status: 500 });
    }

    return Response.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
