'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import type { SiteAnalysis } from '@/types/ai';

const sampleSiteNotes = `Baubesprechung Rohbau Abschnitt B
- Betonage Achse 3/4 auf Mittwoch verschoben, da Freigabe Bewehrung fehlt.
- Elektro meldet Kollision mit Durchbrüchen im Planstand B-17.
- Zwei Mitarbeiter morgen krank gemeldet.
- Kran 2 benötigt Wartung, Einsatz nur bis 14:00 sicher.
- Material Lieferung Bewehrungsstahl laut Lieferant mit 1 Tag Verzug.`;

export default function SitePage() {
  const [title, setTitle] = useState('Baubesprechung Abschnitt B');
  const [text, setText] = useState(sampleSiteNotes);
  const [result, setResult] = useState<SiteAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    setError(null);
    const response = await fetch('/api/site-reports/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content: text, mode: 'live' }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || 'Analyse fehlgeschlagen');
      return;
    }
    setResult(data.result);
  }

  return (
    <AppShell title="Bauleitungs-Copilot">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Baustellennotizen analysieren</h2>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Titel" />
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-4 min-h-[320px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4" />
          <button onClick={analyze} disabled={loading} className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-white disabled:opacity-60">{loading ? 'Analysiere...' : 'Live analysieren'}</button>
          {error ? <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
        </div>
        <div className="space-y-6">
          <div className="card p-6">
            <div className="text-sm text-slate-500">Risikoscore</div>
            <div className="mt-1 text-3xl font-bold">{result?.riskScore ?? 0}%</div>
            <p className="mt-4 text-sm leading-6 text-slate-700">{result?.summary || 'Noch keine Analyse vorhanden.'}</p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold">Blocker</h3>
            <div className="mt-3 space-y-2 text-sm">
              {(result?.blockers || []).map((item) => <div key={item} className="rounded-2xl bg-amber-50 p-3 text-amber-900">{item}</div>)}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="font-semibold">Maßnahmen</h3>
          <div className="mt-3 space-y-2 text-sm">{(result?.tasks || []).map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-3">{item}</div>)}</div>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold">Tagesbericht</h3>
          <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">{result?.dailyReport || 'Noch kein Bericht.'}</pre>
        </div>
      </div>
    </AppShell>
  );
}
