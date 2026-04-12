# Deployment

## Zielarchitektur
- Frontend / API: Vercel
- DB / Auth / Storage: Supabase
- Billing: Stripe
- KI: OpenAI API

## Vercel Deployment
1. Repository zu GitHub pushen
2. In Vercel importieren
3. Environment Variables setzen:
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - alle `STRIPE_PRICE_*`
4. Deploy ausführen

## Nach Deployment
- Stripe Webhook auf Produktiv-URL umstellen
- Supabase Auth Redirect URLs ergänzen
- Login testen
- Dokumentenupload testen
- Analyse-API testen
- Billing Flow testen

## Smoke-Test Checkliste
- Landingpage erreichbar
- Login erreichbar
- geschützte Route ohne Login blockiert
- Lead kann gespeichert werden
- Dokument kann hochgeladen werden
- Dokumentanalyse wird gespeichert
- Baustellenanalyse wird gespeichert
- Checkout Session wird erstellt
