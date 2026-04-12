# Stripe Setup

## 1. Produkte / Preise anlegen
Lege in Stripe mindestens diese recurring prices an:
- Core Plattform
- Dokumenten-Copilot
- Bauleitungs-Copilot
- Claim-Modul
- Admin-/Compliance-Pack

## 2. Price IDs in `.env.local`
- `STRIPE_PRICE_CORE`
- `STRIPE_PRICE_DOCS`
- `STRIPE_PRICE_SITE`
- `STRIPE_PRICE_CLAIMS`
- `STRIPE_PRICE_ADMIN`

## 3. Webhook anlegen
Webhook-Ziel:
- Lokal: `http://localhost:3000/api/webhooks/stripe`
- Produktion: `https://deine-domain.tld/api/webhooks/stripe`

Events:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Webhook Secret in `.env.local`:
- `STRIPE_WEBHOOK_SECRET`

## 4. Billing Verhalten
Checkout erstellt:
- Core-Subscription
- optional Modul-Add-ons

Webhook speichert:
- `billing_customers`
- `billing_subscriptions`
- `tenant_modules`
