# QuickCart Stripe Payment Integration - Complete Setup

## What Has Been Added

I've integrated Stripe payment gateway with support for:
- Credit/Debit Card payments
- UPI payments (for Indian customers)
- Secure checkout with Stripe's hosted payment page
- Automatic order creation after successful payment
- Email confirmation for paid orders
- Payment method selection UI (COD or Stripe)

## Files Created/Modified

### New Files Created:
1. `lib/stripe.js` - Stripe configuration
2. `app/api/create-checkout-session/route.js` - Creates Stripe checkout session
3. `app/api/stripe-webhook/route.js` - Handles Stripe webhook events
4. `.env.example` - Environment variables template
5. `STRIPE_SETUP.md` - Detailed Stripe setup guide

### Modified Files:
1. `components/OrderSummary.jsx` - Added payment method selection and Stripe integration
2. `package.json` - Added Stripe packages

## Quick Setup Steps

### Step 1: Install Dependencies
```bash
npm install
```

The Stripe packages (`stripe` and `@stripe/stripe-js`) have already been installed.

### Step 2: Set Up Environment Variables

Create a `.env.local` file in your project root and add:

```env
# Stripe Payment Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Your existing variables (keep these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_existing_key
CLERK_SECRET_KEY=your_existing_key
NEXT_PUBLIC_SUPABASE_URL=your_existing_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_existing_key
SUPABASE_SERVICE_ROLE_KEY=your_existing_key
SMTP_USER=your_existing_email
SMTP_PASS=your_existing_password
NEXT_PUBLIC_CURRENCY=$
```

### Step 3: Get Your Stripe Keys

1. **Go to Stripe Dashboard:**
   - Visit: https://dashboard.stripe.com/test/apikeys

2. **Copy Your Keys:**
   - **Publishable key** (starts with `pk_test_`) → Add to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (starts with `sk_test_`) → Add to `STRIPE_SECRET_KEY`

### Step 4: Enable Payment Methods

1. Go to: https://dashboard.stripe.com/settings/payment_methods
2. Enable:
   - Cards (Visa, Mastercard, etc.)
   - UPI (for Indian customers)

### Step 5: Set Up Webhook

#### For Local Testing:

1. **Install Stripe CLI:**
   - Download from: https://stripe.com/docs/stripe-cli

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Start Webhook Forwarding:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```

4. **Copy the webhook secret** (displayed after running the command, starts with `whsec_`)
   Add it to your `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

5. **Keep this terminal running** while testing

#### For Production:

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Add URL: `https://yourdomain.com/api/stripe-webhook`
4. Select event: `checkout.session.completed`
5. Copy the webhook signing secret
6. Add it to your production environment variables

### Step 6: Run Your Application

1. **Terminal 1 - Start Next.js:**
   ```bash
   npm run dev
   ```

2. **Terminal 2 - Start Stripe Webhook Listener (for local testing):**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```

### Step 7: Test the Integration

1. **Open your app:** http://localhost:3000
2. **Add products to cart**
3. **Go to checkout**
4. **Select/Add delivery address**
5. **Choose payment method:** Select "Card / UPI"
6. **Click "Proceed to Payment"**
7. **Use test card details:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits
8. **Complete payment**
9. **You'll be redirected** back to your site
10. **Check email** for order confirmation

## How It Works

### User Flow:

1. User adds items to cart
2. Goes to cart page
3. Selects delivery address
4. Chooses payment method (COD or Stripe)
5. If Stripe selected:
   - Clicks "Proceed to Payment"
   - Redirected to Stripe checkout page
   - Enters card/UPI details
   - Completes payment
   - Redirected back to confirmation page
6. Order is created in database
7. Confirmation email is sent

### Backend Flow:

1. `/api/create-checkout-session` creates Stripe session
2. User completes payment on Stripe
3. Stripe sends webhook to `/api/stripe-webhook`
4. Webhook handler:
   - Verifies webhook signature
   - Creates order in Supabase
   - Sends confirmation email
   - Marks payment as "Paid"

## Test Cards

**Successful Payment:**
- `4242 4242 4242 4242` - Always succeeds

**3D Secure (requires authentication):**
- `4000 0027 6000 3184` - Opens 3D Secure modal

**Declined:**
- `4000 0000 0000 0002` - Always declined

**More test cards:** https://stripe.com/docs/testing

## Important Notes

### Database Consideration:
The webhook handler tries to store `stripe_session_id` in the orders table. If your database schema doesn't have this column, you can either:
1. Remove that line from the webhook handler
2. Or add the column to your orders table (optional)

To remove it, edit `app/api/stripe-webhook/route.js` and remove:
```javascript
stripe_session_id: session.id,
```

### Currency Configuration:
Currently set to USD. To change:
1. Open `app/api/create-checkout-session/route.js`
2. Change `currency: 'usd'` to your currency code (e.g., `'inr'`, `'eur'`, `'gbp'`)

### Email Configuration:
Make sure your SMTP credentials are set up correctly for order confirmation emails.

## Production Deployment

When going live:

1. **Switch to Live Mode in Stripe:**
   - Get live API keys from: https://dashboard.stripe.com/apikeys
   - Update environment variables with live keys

2. **Update Environment Variables:**
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. **Set Up Production Webhook:**
   - Add webhook endpoint in Stripe Dashboard
   - Use your production URL: `https://yourdomain.com/api/stripe-webhook`
   - Update `STRIPE_WEBHOOK_SECRET` with production webhook secret

4. **Test with real payments** (use small amounts first)

## Troubleshooting

### Issue: "Webhook signature verification failed"
- Check if `STRIPE_WEBHOOK_SECRET` is correct
- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe-webhook`

### Issue: Payment completes but order not created
- Check webhook logs in Stripe Dashboard
- Check your server console for errors
- Verify Supabase connection is working

### Issue: Redirected to Stripe but page blank
- Check if `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Verify the publishable key is correct
- Check browser console for errors

### Issue: After payment, stuck on loading
- Check if webhook endpoint is accessible
- Verify webhook secret is correct
- Check webhook logs in Stripe Dashboard

## Support Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Testing:** https://stripe.com/docs/testing
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Stripe CLI Docs:** https://stripe.com/docs/stripe-cli

## What Users Will See

### Cart Page:
- Payment method selector (COD or Card/UPI)
- "Proceed to Payment" button when Stripe is selected
- "Place Order" button when COD is selected

### Stripe Checkout Page:
- Professional payment form hosted by Stripe
- Card input fields
- UPI payment option (if enabled and currency is INR)
- Secure payment processing

### After Payment:
- Redirected to order confirmation page
- Email confirmation sent
- Order visible in "My Orders" section

## Security Features

- PCI compliance handled by Stripe
- Secure webhook signature verification
- No card details stored on your server
- Environment variables for sensitive keys
- HTTPS required in production

## Questions?

If you encounter any issues:
1. Check the console logs (both browser and server)
2. Review Stripe Dashboard logs
3. Verify all environment variables are set
4. Make sure webhook listener is running locally
5. Refer to `STRIPE_SETUP.md` for detailed troubleshooting

---

**All set!** Your Stripe payment integration is ready to use. Just follow the setup steps above and you'll be accepting payments in minutes.
