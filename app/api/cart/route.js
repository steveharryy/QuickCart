import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function PUT(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { cartItems } = await req.json();

    if (!Array.isArray(cartItems)) {
      return Response.json(
        { success: false, message: "Invalid cart items" },
        { status: 400 }
      );
    }

    // 🔐 SANITIZE CART ITEMS (THIS FIXES EVERYTHING)
    const sanitizedCartItems = cartItems.map(item => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity) || 1,
    }));

    console.log("SAVING CART ITEMS TO DB:", sanitizedCartItems);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('users')
      .update({ cart_items: sanitizedCartItems })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Cart update error:', error);
      return Response.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      cartItems: data.cart_items,
    });
  } catch (error) {
    console.error('Cart update error:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

