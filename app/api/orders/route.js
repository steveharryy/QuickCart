import { createClient } from "@supabase/supabase-js";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";


import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log("SMTP USER:", process.env.SMTP_USER);
console.log("SMTP PASS:", process.env.SMTP_PASS ? "Loaded" : "Missing");

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ success: false }, { status: 401 });
    }

    // ✅ CORRECT WAY TO FETCH USER EMAIL FROM CLERK
   const user = await currentUser();
const userEmail = user?.emailAddresses?.[0]?.emailAddress;


    console.log("Customer Email:", userEmail);

    if (!userEmail) {
      return Response.json({
        success: false,
        message: "User email not found",
      });
    }

    const { items, amount, addressId } = await req.json();
    const detailedItems = [];

    // BUILD PRODUCT DETAILS
    for (const item of items) {
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.id)
        .single();

      if (error || !product) {
        console.error("Product not found:", item.id);
        continue;
      }

      // CLEAN IMAGE URL
      let image_url = null;
      const img = product.image;

      if (img == null) image_url = null;
      else if (typeof img === "string") {
        try {
          const parsed = JSON.parse(img);
          image_url = Array.isArray(parsed) ? parsed[0] : parsed;
        } catch {
          image_url = img.replace(/[\[\]']/g, "").trim();
        }
      } else if (Array.isArray(img)) image_url = img[0];
      else if (typeof img === "object") image_url = img.url || img.src || null;
      else image_url = String(img);

      detailedItems.push({
        product_id: product.id,
        name: product.name,
        image_url,
        price: product.offer_price || product.price,
        quantity: item.quantity,
      });
    }

    // INSERT ORDER IN DATABASE
    const { data: order, error: insertError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        email: userEmail,
        items: detailedItems,
        amount,
        address_id: addressId,
        status: "Order Placed",
        payment_method: "COD",
        payment_status: "Pending",
      })
      .select("*, addresses(*)")
      .single();

    if (insertError) {
      console.error(insertError);
      return Response.json({ success: false, message: insertError.message });
    }

    // SEND ORDER EMAIL USING NODEMAILER
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const emailHtml = `
      <h2>Your Order is Confirmed!</h2>
      <p>Thank you for shopping with QuickCart.</p>

      <h3>Order Summary:</h3>
      <ul>
        ${order.items
          .map(
            (item) =>
              `<li><strong>${item.name}</strong> — Qty: ${item.quantity}</li>`
          )
          .join("")}
      </ul>

      <p><strong>Total Amount:</strong> $${order.amount}</p>
      <p><strong>Payment Method:</strong> ${order.payment_method}</p>
      <p><strong>Status:</strong> ${order.status}</p>

      <h3>Delivery Address:</h3>
      <p>
        ${order.addresses.full_name}<br />
        ${order.addresses.area}<br />
        ${order.addresses.city}, ${order.addresses.state}<br />
        ${order.addresses.phone_number}
      </p>

      <p>Estimated Delivery: 4 days</p>
    `;

    await transporter.sendMail({
      from: `QuickCart <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: "Your QuickCart Order Confirmation",
      html: emailHtml,
    });

    console.log("Order email sent to:", userEmail);

    return Response.json({ success: true, order });

  } catch (error) {
    console.error("ORDER ERROR:", error);
    return Response.json({
      success: false,
      message: error.message,
    });
  }
}


// ==========================================
//           GET ALL USER ORDERS
// ==========================================

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, addresses(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Supabase error:", error);
      return Response.json({ success: false, message: error.message });
    }

    // AUTO-UPDATE DELIVERY STATUS AFTER 4 DAYS
    const now = new Date();
    const toUpdate = [];

    orders.forEach((order) => {
      const diffDays =
        (now - new Date(order.created_at)) / (1000 * 60 * 60 * 24);

      if (diffDays >= 4 && order.status !== "Delivered") {
        toUpdate.push(order.id);
      }
    });

    if (toUpdate.length > 0) {
      await supabase
        .from("orders")
        .update({ status: "Delivered", payment_status: "Paid" })
        .in("id", toUpdate);
    }

    const { data: updatedOrders } = await supabase
      .from("orders")
      .select("*, addresses(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return Response.json({ success: true, orders: updatedOrders });

  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    return Response.json({ success: false, message: error.message });
  }
}
