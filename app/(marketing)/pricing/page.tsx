import { SiteHeader } from '@/components/site-header';

const plans = [
  ['Core-Plattform', '490 €/Monat', 'Login, Rollen, Tenanting, Dashboard, Billing, Admin'],
  ['Dokumenten-Copilot', '590 €/Monat', 'Vorprüfung, Risiken, Entitäten, Aufgaben'],
  ['Bauleitungs-Copilot', '790 €/Monat', 'Protokolle, Blocker, Maßnahmen, Tagesberichte'],
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="container-shell py-10">
        <h1 className="text-4xl font-bold">Preise und Module</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {plans.map(([title, price, desc]) => (
            <div key={title} className="card p-6">
              <div className="text-lg font-semibold">{title}</div>
              <div className="mt-3 text-3xl font-bold">{price}</div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
