import { AppShell } from '@/components/app-shell';
import { MetricCard } from '@/components/metric-card';

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Aktive Nutzer" value="24" sub="8 Bauleiter, 6 PM, 10 Backoffice" />
        <MetricCard label="Aktive Module" value="4" sub="Docs, Site, Claims, Admin" />
        <MetricCard label="Eingesparte Zeit" value="127 h" sub="letzte 30 Tage" />
        <MetricCard label="MRR" value="2.560 €" sub="Demo-Mandant" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Nutzenübersicht</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="rounded-2xl bg-slate-50 p-4">Dokumentenvorprüfung reduziert Kalkulations- und Assistenzzeit.</div>
            <div className="rounded-2xl bg-slate-50 p-4">Baubesprechungen werden in Protokolle und Maßnahmen übersetzt.</div>
            <div className="rounded-2xl bg-slate-50 p-4">Claims und Abrechnung werden früher vorbereitet.</div>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Aktuelle Signale</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-2xl bg-red-50 p-4 text-red-800">3 kritische Dokumente warten auf Prüfung.</div>
            <div className="rounded-2xl bg-amber-50 p-4 text-amber-900">2 Baustellenberichte sind noch nicht freigegeben.</div>
            <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800">Pilotkunde hat 41% Doku-Zeit reduziert.</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
