'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';

const options = [
  { key: 'docs', label: 'Dokumenten-Copilot' },
  { key: 'site', label: 'Bauleitungs-Copilot' },
  { key: 'claims', label: 'Claim-Modul' },
  { key: 'admin', label: 'Admin-/Compliance-Pack' },
] as const;

export default function AdminPage() {
  const [states, setStates] = useState<Record<string, boolean>>({ docs: true, site: true, claims: false, admin: true });
  const [message, setMessage] = useState<string | null>(null);

  async function toggleModule(moduleKey: string, next: boolean) {
    const response = await fetch('/api/modules/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleKey, status: next ? 'active' : 'inactive' }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || 'Aktualisierung fehlgeschlagen');
      return;
    }
    setStates((prev) => ({ ...prev, [moduleKey]: next }));
    setMessage(`Modul ${moduleKey} wurde ${next ? 'aktiviert' : 'deaktiviert'}.`);
  }

  return (
    <AppShell title="Adminbereich">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Sicherheit und Governance</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="rounded-2xl bg-slate-50 p-4">Auth-Schutz bis in API-Routen</div>
            <div className="rounded-2xl bg-slate-50 p-4">Mandantenkontext serverseitig geprüft</div>
            <div className="rounded-2xl bg-slate-50 p-4">Supabase Storage für Dokumente</div>
            <div className="rounded-2xl bg-slate-50 p-4">RLS Policies + Audit + Usage Events</div>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Modulverwaltung</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {options.map((option) => (
              <label key={option.key} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span>{option.label}</span>
                <input type="checkbox" checked={states[option.key]} onChange={(e) => toggleModule(option.key, e.target.checked)} />
              </label>
            ))}
          </div>
          {message ? <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}
        </div>
      </div>
    </AppShell>
  );
}
