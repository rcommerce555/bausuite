'use client';

import { useState } from 'react';

export function LeadForm() {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', pain: '' });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error || 'Lead konnte nicht gespeichert werden.');
      return;
    }
    setMessage('Lead wurde in Supabase gespeichert.');
    setForm({ name: '', company: '', email: '', phone: '', pain: '' });
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-3 md:grid-cols-2">
      <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Firma" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="E-Mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <textarea className="min-h-[120px] rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" placeholder="Wo ist aktuell euer größter Engpass?" value={form.pain} onChange={(e) => setForm({ ...form, pain: e.target.value })} />
      <div className="md:col-span-2">
        <button disabled={loading} className="rounded-2xl bg-slate-900 px-5 py-3 text-white disabled:opacity-60">{loading ? 'Speichere...' : 'Pilot anfragen'}</button>
      </div>
      {message ? <div className="md:col-span-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{message}</div> : null}
    </form>
  );
}
