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
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { items, addressId } = await req.json();

    console.log("ITEMS:", items);
    console.log("ADDRESS ID:", addressId, typeof addressId);

    if (!items?.length || !addressId) {
      return Response.json(
        { message: "Missing items or address" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 🔐 ADDRESS CHECK (SAFE FOR NUMBER OR UUID)
    const addressQuery =
      typeof addressId === "number"
        ? supabase.from("addresses").select("*").eq("id", addressId)
        : supabase.from("addresses").select("*").eq("id", addressId);

    const { data: address, error: addressError } = await addressQuery.single();

    if (addressError || !address) {
      return Response.json(
        { message: "Address not found" },
        { status: 404 }
      );
    }

    const lineItems = [];

    for (const item of items) {
      const productId = Number(item.id);

      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (!product) continue;

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(
            (product.offer_price ?? product.price) * 100
          ),
        },
        quantity: item.quantity,
      });
    }

    if (!lineItems.length) {
      return Response.json(
        { message: "No valid items to checkout" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-placed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        userId,
        addressId: String(addressId),
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("CREATE CHECKOUT ERROR:", error);
    return Response.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

