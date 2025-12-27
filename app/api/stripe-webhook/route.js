import { stripe } from '../../../lib/stripe';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { currentUser, clerkClient } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return Response.json({ error: 'Webhook Error' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const { userId, addressId, items, amount } = session.metadata;

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      const userEmail = user.emailAddresses[0].emailAddress;

      const parsedItems = JSON.parse(items);
      const detailedItems = [];

      for (const item of parsedItems) {
        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.id)
          .single();

        if (error || !product) {
          console.error('Product not found:', item.id);
          continue;
        }

        let image_url = null;
        const img = product.image;

        if (img == null) image_url = null;
        else if (typeof img === 'string') {
          try {
            const parsed = JSON.parse(img);
            image_url = Array.isArray(parsed) ? parsed[0] : parsed;
          } catch {
            image_url = img.replace(/[\[\]']/g, '').trim();
          }
        } else if (Array.isArray(img)) image_url = img[0];
        else if (typeof img === 'object') image_url = img.url || img.src || null;
        else image_url = String(img);

        detailedItems.push({
          product_id: product.id,
          name: product.name,
          image_url,
          price: product.offer_price || product.price,
          quantity: item.quantity,
        });
      }

      const { data: order, error: insertError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          email: userEmail,
          items: detailedItems,
          amount: parseFloat(amount),
          address_id: addressId,
          status: 'Order Placed',
          payment_method: 'Stripe',
          payment_status: 'Paid',
          stripe_session_id: session.id,
        })
        .select('*, addresses(*)')
        .single();

      if (insertError) {
        console.error('Order creation error:', insertError);
        return Response.json({ error: 'Order creation failed' }, { status: 500 });
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const emailHtml = `
        <h2>Your Order is Confirmed!</h2>
        <p>Thank you for shopping with QuickCart. Your payment was successful.</p>

        <h3>Order Summary:</h3>
        <ul>
          ${order.items
            .map(
              (item) =>
                `<li><strong>${item.name}</strong> — Qty: ${item.quantity}</li>`
            )
            .join('')}
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
        subject: 'Your QuickCart Order Confirmation - Payment Successful',
        html: emailHtml,
      });

      console.log('Order created and email sent for session:', session.id);
    } catch (error) {
      console.error('Webhook processing error:', error);
      return Response.json({ error: 'Processing failed' }, { status: 500 });
    }
  }

  return Response.json({ received: true });
}
