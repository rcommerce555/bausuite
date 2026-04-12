'use client';

import { useState } from 'react';

type AnalysisResult = {
  documentType: string;
  summary: string;
  risks: string[];
  missingInfo: string[];
  recommendation: string;
  priority: 'Niedrig' | 'Mittel' | 'Hoch' | 'Sofort';
};

function PriorityBadge({ priority }: { priority: AnalysisResult['priority'] }) {
  const styles = {
    Niedrig: 'bg-slate-100 text-slate-700',
    Mittel: 'bg-amber-100 text-amber-800',
    Hoch: 'bg-orange-100 text-orange-800',
    Sofort: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${styles[priority]}`}>
      Priorität: {priority}
    </span>
  );
}

export default function DocumentsPage() {
  const [text, setText] = useState(`Baubesprechung Rohbau Abschnitt B

- Betonage Achse 3/4 auf Mittwoch verschoben, da Freigabe Bewehrung fehlt.
- Material Lieferung Bewehrungsstahl laut Lieferant mit 1 Tag Verzug.
- Kran 2 benötigt Wartung.
- Bauherr fordert aktualisierten Terminplan bis Freitag.`);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Analyse fehlgeschlagen');
      }

      setResult(data.result);
      setSource(data.source || null);
    } catch (e: any) {
      setError(e.message || 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-slate-900">Dokumenten-Analyse</h1>
        <p className="mt-2 text-sm text-slate-500">
          Lade Text aus LV, Protokoll, Mail oder Vertragsauszug ein und erhalte in Sekunden eine priorisierte Bewertung.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-6 min-h-[260px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
          placeholder="Dokumenttext hier einfügen"
        />

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={analyze}
            disabled={loading}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm text-white disabled:opacity-60"
          >
            {loading ? 'Analysiere...' : 'Dokument analysieren'}
          </button>

          {source ? (
            <span className="text-sm text-slate-500">Quelle: {source}</span>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>

      {result ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">{result.documentType}</h2>
              <PriorityBadge priority={result.priority} />
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-900">Kurzfassung</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{result.summary}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900">Empfohlener nächster Schritt</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{result.recommendation}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="text-sm font-semibold text-slate-900">Risiken</h3>
              <ul className="mt-3 space-y-2">
                {result.risks.map((item, index) => (
                  <li key={index} className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="text-sm font-semibold text-slate-900">Fehlende Informationen</h3>
              <ul className="mt-3 space-y-2">
                {result.missingInfo.map((item, index) => (
                  <li key={index} className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
