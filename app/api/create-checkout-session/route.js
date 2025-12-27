import { auth } from '@clerk/nextjs/server';
import { stripe } from '../../../lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req) {
  try {
    // 1️⃣ AUTH CHECK
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2️⃣ READ BODY
    const { items, addressId } = await req.json();

    console.log("ITEMS FROM FRONTEND:", items);
    console.log("ADDRESS ID:", addressId);

    if (!items || items.length === 0 || !addressId) {
      return Response.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 3️⃣ SUPABASE CLIENT
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4️⃣ FETCH ADDRESS
    const { data: address, error: addressError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', Number(addressId))
      .single();

    if (addressError || !address) {
      return Response.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    // 5️⃣ BUILD STRIPE LINE ITEMS
    const lineItems = [];

    for (const item of items) {
      console.log("LOOKING FOR PRODUCT ID:", item.id);

      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', Number(item.id)) // 🔴 IMPORTANT FIX
        .single();

      console.log("FOUND PRODUCT:", product);

      if (error || !product) {
        console.error("Product not found:", item.id);
        continue;
      }

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description || '',
          },
          unit_amount: Math.round(
            (product.offer_price ?? product.price) * 100
          ),
        },
        quantity: item.quantity,
      });
    }

    // 6️⃣ ENSURE LINE ITEMS EXIST
    if (lineItems.length === 0) {
      return Response.json(
        { success: false, message: "No valid items to checkout" },
        { status: 400 }
      );
    }

    console.log("FINAL STRIPE LINE ITEMS:", lineItems);

    // 7️⃣ CREATE STRIPE SESSION
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-placed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        userId,
        addressId: addressId.toString(),
        items: JSON.stringify(items),
      },
    });

    // 8️⃣ RETURN STRIPE URL
    return Response.json({
      success: true,
      url: session.url,
    });

  } catch (error) {
    console.error("Stripe checkout error:", error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
