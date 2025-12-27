# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment with Card and UPI support for QuickCart.

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Your Stripe API keys (Publishable key and Secret key)
- Stripe CLI installed (for webhook testing locally)

## Step-by-Step Setup Instructions

### 1. Add Environment Variables

Add these variables to your `.env.local` file:

```env
# Stripe Payment Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# App URL (change in production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Where to find these keys:**
- Go to https://dashboard.stripe.com/test/apikeys
- Copy your **Publishable key** → Add to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Copy your **Secret key** → Add to `STRIPE_SECRET_KEY`
- For webhook secret, see step 3 below

### 2. Enable Payment Methods in Stripe Dashboard

1. Go to https://dashboard.stripe.com/settings/payment_methods
2. Enable the following payment methods:
   - **Cards** (Visa, Mastercard, American Express)
   - **UPI** (for Indian customers)
   - Any other methods you want to support

### 3. Set Up Webhook (For Local Testing)

#### Option A: Using Stripe CLI (Recommended for Local Development)

1. Install Stripe CLI from https://stripe.com/docs/stripe-cli

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```

4. Copy the webhook signing secret (starts with `whsec_`) and add it to your `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

5. Keep this terminal running while testing locally

#### Option B: For Production Deployment

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/stripe-webhook`
4. Select events to listen to:
   - `checkout.session.completed`
5. Copy the webhook signing secret and add it to your production environment variables

### 4. Test Your Integration

#### Test Cards (Use these in Stripe test mode):

**Successful Payment:**
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits

**3D Secure Authentication:**
- Card Number: `4000 0027 6000 3184`
- Expiry: Any future date
- CVC: Any 3 digits

**Payment Declined:**
- Card Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

**UPI Testing:**
- UPI is automatically available for INR currency
- In test mode, you can use test UPI IDs

### 5. Start Your Application

1. Make sure all packages are installed:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. In another terminal, start Stripe webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```

### 6. Test the Complete Flow

1. Add products to cart
2. Go to checkout
3. Select an address
4. Choose "Card / UPI" as payment method
5. Click "Proceed to Payment"
6. You'll be redirected to Stripe checkout page
7. Use a test card (mentioned above)
8. Complete the payment
9. You'll be redirected back to order confirmation page
10. Check your email for order confirmation

### 7. Production Deployment Checklist

When deploying to production:

- [ ] Switch from test keys to live keys in Stripe Dashboard
- [ ] Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with live publishable key
- [ ] Update `STRIPE_SECRET_KEY` with live secret key
- [ ] Set up production webhook endpoint in Stripe Dashboard
- [ ] Update `NEXT_PUBLIC_APP_URL` to your production URL
- [ ] Update `STRIPE_WEBHOOK_SECRET` with production webhook secret
- [ ] Test with real payment methods (use small amounts)
- [ ] Set up proper error handling and logging
- [ ] Review Stripe's security best practices

## Webhook Events

The integration listens for these Stripe events:
- `checkout.session.completed` - Triggered when payment is successful

## Currency Configuration

Currently set to USD. To change currency:
1. Update the `currency` field in `app/api/create-checkout-session/route.js`
2. Change from `'usd'` to your desired currency code (e.g., `'inr'` for Indian Rupees)

## Troubleshooting

### Webhook Not Working Locally
- Make sure Stripe CLI is running with `stripe listen`
- Check if the webhook secret matches in your `.env.local`
- Verify the endpoint URL is correct

### Payment Not Completing
- Check browser console for errors
- Verify all environment variables are set correctly
- Ensure webhook secret is correctly configured
- Check Stripe dashboard logs for any errors

### Orders Not Creating in Database
- Check the webhook logs in Stripe dashboard
- Verify Supabase connection is working
- Check server console for any database errors

## Support

For Stripe-specific issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For QuickCart issues:
- Check the GitHub repository
- Contact the development team
