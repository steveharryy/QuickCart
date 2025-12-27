# Stripe Payment Integration - Quick Start Guide

## What's New

Your QuickCart now supports Stripe payments with Card and UPI options alongside Cash on Delivery (COD).

## 5-Minute Setup

### 1. Add to .env.local

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx
STRIPE_SECRET_KEY=sk_test_51xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get keys from: https://dashboard.stripe.com/test/apikeys

### 2. Install Stripe CLI

Download: https://stripe.com/docs/stripe-cli

```bash
stripe login
```

### 3. Run Your App (2 Terminals)

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

Copy the webhook secret (starts with `whsec_`) and add it to `.env.local`

### 4. Test

1. Add products to cart
2. Go to checkout
3. Select "Card / UPI" payment method
4. Click "Proceed to Payment"
5. Use test card: **4242 4242 4242 4242**
6. Expiry: **12/34**, CVC: **123**
7. Complete payment

## Files Added/Changed

### New Files:
- `lib/stripe.js`
- `app/api/create-checkout-session/route.js`
- `app/api/stripe-webhook/route.js`

### Modified Files:
- `components/OrderSummary.jsx` (added payment method selection)

## Production Checklist

- [ ] Get live Stripe keys
- [ ] Set up production webhook in Stripe Dashboard
- [ ] Update all environment variables with production values
- [ ] Update `NEXT_PUBLIC_APP_URL` to your domain

## Test Cards

**Success:** 4242 4242 4242 4242
**3D Secure:** 4000 0027 6000 3184
**Declined:** 4000 0000 0000 0002

More: https://stripe.com/docs/testing

## Need Help?

Read the detailed guides:
- `SETUP_INSTRUCTIONS.md` - Complete step-by-step setup
- `STRIPE_SETUP.md` - Stripe-specific configuration

## Support

Stripe Dashboard: https://dashboard.stripe.com
Stripe Docs: https://stripe.com/docs
