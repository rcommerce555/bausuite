'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import type { DocumentAnalysis } from '@/types/ai';

const sampleDocument = `Projekt: Neubau Logistikhalle Nord
Dokumenttyp: Leistungsverzeichnis / Auszug
Leistung: Stahlbetonarbeiten, Bodenplatte, Fundamente, Schalung, Bewehrung.
Hinweis: Prüfstatik folgt separat. Freigabe der Schalpläne durch AG erforderlich.
Offene Punkte: Entsorgungskonzept nicht beigefügt. Baustelleneinrichtungsfläche eingeschränkt.
Risiko: Baugrundfreigabe im Dokument nicht abschließend beschrieben.`;

export default function DocumentsPage() {
  const [title, setTitle] = useState('LV Rohbau – Vorprüfung');
  const [text, setText] = useState(sampleDocument);
  const [result, setResult] = useState<DocumentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    setError(null);
    const response = await fetch('/api/documents/analyze', {
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
    <AppShell title="Dokumenten-Copilot">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Dokument analysieren</h2>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Titel" />
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-4 min-h-[320px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4" />
          <div className="mt-4 flex gap-3">
            <button onClick={analyze} disabled={loading} className="rounded-2xl bg-slate-900 px-4 py-3 text-white disabled:opacity-60">{loading ? 'Analysiere...' : 'Live analysieren'}</button>
          </div>
          {error ? <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
        </div>
        <div className="space-y-6">
          <div className="card p-6">
            <div className="text-sm text-slate-500">Dokumenttyp</div>
            <div className="mt-1 text-xl font-semibold">{result?.docType || '–'}</div>
            <div className="mt-4 text-sm text-slate-600">Risikoscore: {result?.riskScore ?? 0}%</div>
            <p className="mt-4 text-sm leading-6 text-slate-700">{result?.summary || 'Noch keine Analyse vorhanden.'}</p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold">Risiken</h3>
            <div className="mt-3 space-y-2 text-sm">
              {(result?.risks || []).map((item) => <div key={item} className="rounded-2xl bg-red-50 p-3 text-red-800">{item}</div>)}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="font-semibold">Aktionen</h3>
          <div className="mt-3 space-y-2 text-sm">{(result?.actions || []).map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-3">{item}</div>)}</div>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold">Entitäten</h3>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">{(result?.entities || []).map((item) => <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1">{item}</span>)}</div>
        </div>
      </div>
    </AppShell>
  );
}
