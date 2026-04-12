# BauSuite AI – Production-Ready Scaffold

Dieses Paket ist ein belastbares Full-Stack-Gerüst für dein modulares Bau-KI-SaaS.

Es enthält:
- Next.js App Router Frontend
- Marketing-/Vertriebsseiten
- Login / geschützte App-Bereiche
- Dokumenten-Copilot
- Bauleitungs-Copilot
- Supabase Auth / DB / Storage-Anbindung
- Stripe Checkout / Billing Portal / Webhook-Handling
- OpenAI Responses API Anbindung
- Persistenz für Leads, Dokumentanalysen und Baustellenanalysen
- RLS-Policies als Startpunkt
- Deployment-Dokumentation

## Was bereits technisch vorbereitet ist
- API-Schutz via Middleware für App- und API-Bereiche
- Tenant-Kontextprüfung in geschützten Routen
- Speicherung von Leads in Supabase
- Speicherung von Dokumentanalysen in `documents` + `document_insights`
- Speicherung von Baustellenanalysen in `site_reports`
- Upload in Supabase Storage Bucket `documents`
- Stripe Subscription Checkout mit Core + Modul-Add-ons
- Stripe Webhook zur Aktivierung von Kunden / Subscriptions / Modulen

## Was du noch extern selbst einmal anlegen musst
Ohne Zugriff auf deine Accounts kann kein Assistent diese Schritte real in deinen Konten durchführen.
Du musst einmal anlegen und die erzeugten Werte in `.env.local` eintragen:
- Supabase Projekt
- Stripe Produkte / Preise
- OpenAI API Key
- Vercel Projekt / Deployment

Danach ist das Projekt startklar.

## Lokaler Start
1. `.env.example` nach `.env.local` kopieren
2. Werte eintragen
3. `npm install`
4. Supabase Migration ausführen
5. `npm run dev`

## Wichtige Dateien
- `middleware.ts` – Auth-Schutz für App- und API-Bereiche
- `lib/auth.ts` – Tenant-/Rollenprüfung
- `lib/openai.ts` – echte OpenAI-Integration
- `lib/db.ts` – Persistenzlogik
- `app/api/documents/analyze/route.ts`
- `app/api/site-reports/analyze/route.ts`
- `app/api/documents/upload/route.ts`
- `app/api/leads/route.ts`
- `app/api/billing/checkout/route.ts`
- `app/api/webhooks/stripe/route.ts`
- `supabase/migrations/001_init.sql`
- `docs/DEPLOYMENT.md`
- `docs/STRIPE_SETUP.md`
- `docs/SUPABASE_SETUP.md`

## Sicherheitslogik
- Frontend-Bereiche sind per Middleware geschützt
- API-Routen für Analysen, Uploads, Projekte und Module sind geschützt
- Mandantenkontext wird serverseitig geprüft
- Modulaktivierung wird serverseitig geprüft
- Speicherung läuft serverseitig mit Admin-Client
- Lesezugriff läuft tenant-basiert über RLS

## Wichtiger Realitätscheck
Dieses Paket ist jetzt deutlich näher an einer Live-App.
Aber: Externe Dienste müssen mit deinen echten Zugangsdaten verbunden werden.
Das betrifft insbesondere:
- Supabase URL / Keys
- Stripe Secret / Price IDs / Webhook Secret
- OpenAI API Key
- Vercel Deployment Einstellungen
