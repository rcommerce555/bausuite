'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';

const moduleOptions = [
  { key: 'docs', name: 'Dokumenten-Copilot', price: '590 €/Monat' },
  { key: 'site', name: 'Bauleitungs-Copilot', price: '790 €/Monat' },
  { key: 'claims', name: 'Claim-Modul', price: '690 €/Monat' },
  { key: 'admin', name: 'Admin-/Compliance-Pack', price: '390 €/Monat' },
] as const;

export default function BillingPage() {
  const [selected, setSelected] = useState<string[]>(['docs', 'site']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    const response = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modules: selected }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || 'Checkout fehlgeschlagen');
      return;
    }
    window.location.href = data.url;
  }

  return (
    <AppShell title="Billing & Pakete">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Pakete wählen</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><span>Core-Plattform</span><span className="font-semibold">490 €/Monat</span></div>
            {moduleOptions.map((module) => (
              <label key={module.key} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <div>{module.name}</div>
                  <div className="text-xs text-slate-500">{module.price}</div>
                </div>
                <input
                  type="checkbox"
                  checked={selected.includes(module.key)}
                  onChange={(e) => setSelected((prev) => e.target.checked ? [...new Set([...prev, module.key])] : prev.filter((x) => x !== module.key))}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Stripe Checkout</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Der Checkout verwendet echte Stripe Price IDs aus deiner `.env.local` und legt ein Subscription-Paket aus Core plus gewählten Modulen an.
          </p>
          {error ? <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
          <button onClick={checkout} disabled={loading} className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-white disabled:opacity-60">
            {loading ? 'Leite weiter...' : 'Zu Stripe Checkout'}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
