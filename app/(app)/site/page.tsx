'use client';

import { useState } from 'react';

type SitePriorityResult = {
  today_focus: string;
  top_priority: string[];
  biggest_risk: string;
  time_loss_estimate: string;
  recommended_route: string;
};

export default function SitePage() {
  const [text, setText] = useState(`Tageslage Baustellen:

- Betonage verschoben wegen fehlender Freigabe
- Lieferant meldet 2 Tage Verzug beim Stahl
- Kran 2 in Wartung
- Bauherr fordert neuen Terminplan bis heute 17:00
- Subunternehmer kommt erst morgen`);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SitePriorityResult | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/site-reports/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Priorisierung fehlgeschlagen');
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
        <h1 className="text-2xl font-semibold text-slate-900">Daily Baustellen-Copilot</h1>
        <p className="mt-2 text-sm text-slate-500">
          Füge die aktuelle Tageslage ein und erhalte eine harte Priorisierung: Was ist heute kritisch, wo musst du hin und was droht bei Nicht-Handeln.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-6 min-h-[260px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
          placeholder="Tageslage hier einfügen"
        />

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={analyze}
            disabled={loading}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm text-white disabled:opacity-60"
          >
            {loading ? 'Priorisiere...' : 'Tageslage priorisieren'}
          </button>

          {source ? <span className="text-sm text-slate-500">Quelle: {source}</span> : null}
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>

      {result ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">Worum du dich heute zuerst kümmern musst</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{result.today_focus}</p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="text-sm font-semibold text-slate-900">Größtes operatives Risiko</h3>
              <div className="mt-3 rounded-xl bg-red-50 px-3 py-3 text-sm text-red-800">
                {result.biggest_risk}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="text-sm font-semibold text-slate-900">Geschätzter Zeitverlust</h3>
              <div className="mt-3 rounded-xl bg-amber-50 px-3 py-3 text-sm text-amber-800">
                {result.time_loss_estimate}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="text-sm font-semibold text-slate-900">Top-Prioritäten heute</h3>
              <ul className="mt-3 space-y-2">
             {result.top_priority.map((item, index) => (
  <li key={index} className="rounded-xl bg-slate-100 px-3 py-3 text-sm text-slate-800">
    <div className="flex items-start justify-between gap-3">
      <span>{item}</span>

      <button
        onClick={async () => {
          try {
            const res = await fetch('/api/tasks/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: item,
                priority: 'hoch',
                dueToday: true,
                source: 'site-ai',
                blocker: index === 0,
              }),
            });

            if (!res.ok) throw new Error('Fehler');
            alert('Aufgabe erstellt');
          } catch {
            alert('Fehler beim Erstellen');
          }
        }}
        className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-xs text-white"
      >
        + Aufgabe
      </button>
    </div>
  </li>
))}
              </ul>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="text-sm font-semibold text-slate-900">Empfohlene Reihenfolge für heute</h3>
              <div className="mt-3 rounded-xl bg-blue-50 px-3 py-3 text-sm text-blue-800">
                {result.recommended_route}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
