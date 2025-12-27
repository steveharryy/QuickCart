import { auth } from '@clerk/nextjs/server';
import { stripe } from '../../../lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req) {
  try {
    // 1️⃣ AUTH
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ BODY
    const { items, addressId } = await req.json();

    console.log("RAW ITEMS FROM FRONTEND:", items);
    console.log("ADDRESS ID:", addressId);

    if (!Array.isArray(items) || items.length === 0 || !addressId) {
      return Response.json(
        { message: "Missing items or address" },
        { status: 400 }
      );
    }

    // 3️⃣ SUPABASE
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4️⃣ ADDRESS CHECK
    const { data: address } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", addressId)
      .single();

    if (!address) {
      return Response.json(
        { message: "Address not found" },
        { status: 404 }
      );
    }

    // 5️⃣ BUILD LINE ITEMS
    const lineItems = [];

  for (const item of items) {
  const productId = item.product_id || item.id;

  console.log("LOOKING UP PRODUCT UUID:", productId, typeof productId);

  if (!productId) {
    console.error("INVALID PRODUCT ID:", item);
    continue;
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, name, price, offer_price")
    .eq("id", productId)
    .single();

  if (!product) {
    console.error("PRODUCT NOT FOUND:", productId);
    continue;
  }

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
    quantity: Number(item.quantity) || 1,
  });
}


    console.log("FINAL STRIPE LINE ITEMS:", lineItems);

    // 6️⃣ HARD FAIL IF EMPTY
    if (lineItems.length === 0) {
      return Response.json(
        {
          message:
            "No valid items to checkout. Product IDs sent from frontend do not match products table.",
        },
        { status: 400 }
      );
    }

    // 7️⃣ STRIPE SESSION
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


