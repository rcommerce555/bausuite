import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { MetricCard } from '@/components/metric-card';

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="container-shell py-10">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
              SaaS + modulare Monetarisierung
            </div>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
              Das KI-Betriebssystem für Bauunternehmen
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              Dokumenten-Copilot und Bauleitungs-Copilot in einer modularen Plattform mit Login,
              Dashboard, Billing, Lead-Erfassung und Adminbereich.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/demo" className="rounded-2xl bg-slate-900 px-5 py-3 text-white">Demo ansehen</Link>
              <Link href="/pricing" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-slate-700">Preise ansehen</Link>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <MetricCard label="Zeitersparnis" value="30–60%" sub="bei Doku und Vorprüfung" />
              <MetricCard label="Module" value="Core + Add-ons" sub="separat monetarisierbar" />
              <MetricCard label="Betrieb" value="Mandantenfähig" sub="mit Rollen und Audit-Logik" />
            </div>
          </div>
          <div className="card p-6">
            <h2 className="text-2xl font-semibold">Was der Kunde kauft</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="rounded-2xl bg-slate-50 p-4">Dokumenten-Copilot für LV-, Vertrags- und Risikoanalyse</div>
              <div className="rounded-2xl bg-slate-50 p-4">Bauleitungs-Copilot für Baustellenprotokolle, Blocker und Tagesberichte</div>
              <div className="rounded-2xl bg-slate-50 p-4">Core-Plattform mit Login, Modulverwaltung, Billing und Adminbereich</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
