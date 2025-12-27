import { auth } from '@clerk/nextjs/server';
import { stripe } from '../../../lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { items, addressId } = await req.json();

    if (!items || items.length === 0 || !addressId) {
      return Response.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: address } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .single();

    if (!address) {
      return Response.json({ success: false, message: "Address not found" }, { status: 404 });
    }

    const lineItems = [];

    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.id)
        .single();

      if (!product) continue;

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: Math.round(
            (product.offer_price || product.price) * 100
          ),
        },
        quantity: item.quantity,
      });
    }

    if (lineItems.length === 0) {
      return Response.json(
        { success: false, message: "No valid products found for checkout" },
        { status: 400 }
      );
    }

    console.log("STRIPE LINE ITEMS:", lineItems);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-placed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        userId,
        addressId,
        items: JSON.stringify(items),
      },
    });

    return Response.json({ success: true, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
