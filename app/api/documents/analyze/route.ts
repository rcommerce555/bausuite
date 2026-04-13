import { NextRequest, NextResponse } from 'next/server';

type AnalysisResult = {
  priority: 'Hoch' | 'Mittel' | 'Niedrig';
  summary: string;
  actions_today: string[];
  decision_required: string;
  impact_if_no_action: {
    time: string;
    cost: string;
    chain_reaction: string;
  };
  critical_missing: string[];
};

function fallbackAnalysis(text: string) {
  const lower = text.toLowerCase();

  const actions: string[] = [];
  const missing: string[] = [];

  let main_blocker = 'Operativer Engpass unklar';
  let root_cause = 'Unklare Ausgangslage';

  if (lower.includes('freigabe')) {
    main_blocker = 'Fehlende Freigabe blockiert die Ausführung';
    root_cause = 'Erforderliche Freigabe liegt nicht vor';

    actions.push('Freigabe heute verbindlich mit zuständiger Stelle klären');
    missing.push('Verbindlicher Freigabetermin fehlt');
  }

  if (lower.includes('lieferant') || lower.includes('verzug')) {
    actions.push('Lieferant heute kontaktieren und Liefertermin fix bestätigen');
    missing.push('Bestätigter Lieferstatus fehlt');
  }

  if (lower.includes('beton') || lower.includes('betonage')) {
    actions.push('Betonagefenster neu festlegen und Folgegewerke informieren');
  }

  if (lower.includes('terminplan') || lower.includes('bauherr')) {
    actions.push('Terminplan heute aktualisieren und an Bauherrn senden');
  }

  const priority =
    actions.length >= 3 ? 'Hoch' :
    actions.length === 2 ? 'Mittel' :
    'Niedrig';

  return {
    priority,
    summary: 'Operativer Engpass mit unmittelbarer Termin- und Kostenwirkung.',
    main_blocker,
    root_cause,
    actions_today: actions.length ? actions : ['Heute Hauptproblem identifizieren und Verantwortlichen festlegen'],
    decision_required: 'Engpass heute aktiv lösen oder Termin verbindlich verschieben.',
    impact_if_no_action: {
      time: '+1 bis +2 Tage Verzögerung',
      cost: 'Mehrkosten durch Stillstand und Umplanung',
      chain_reaction: 'Folgegewerke und Terminplan werden blockiert',
    },
    critical_missing: missing.length ? missing : ['Keine klaren Schlüsselinformationen vorhanden'],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = String(body?.text || '').trim();

    if (!text) {
      return NextResponse.json(
        { error: 'Kein Dokumenttext übergeben.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        source: 'fallback',
        result: fallbackAnalysis(text),
      });
    }

    const prompt = `
Du bist ein erfahrener Bauleiter auf einer laufenden Baustelle unter Zeit- und Kostendruck.

Deine Aufgabe:
Analysiere das Dokument und gib KEINE allgemeine Zusammenfassung, sondern eine operative Entscheidungsgrundlage.

WICHTIG:
- Denke wie ein Bauleiter, nicht wie ein Analyst
- Schreibe konkret, knapp, umsetzbar
- Keine Floskeln wie "abstimmen" oder "prüfen"
- Jede Aussage muss eine Handlung oder Konsequenz enthalten

Gib die Antwort ausschließlich als gültiges JSON mit exakt dieser Struktur zurück:

Du bist Bauleiter in einer kritischen Situation.

DEINE AUFGABE:
Erkenne den EINEN operativen Hauptblocker und gib eine klare Handlungsanweisung.

---

DENKREGELN (verpflichtend):

1. Es gibt genau EINEN Hauptblocker
→ Wähle den Punkt, der die Ausführung aktuell verhindert

2. Blocker > alles andere
→ Ignoriere Themen, die nicht direkt blockieren

3. Realität prüfen:
Wenn gleichzeitig:
- Personal vor Ort
- Gerät eingeplant
- Material vorhanden

→ Dann entsteht AKTUELL ein Kostenschaden (kein Risiko)

4. Lieferantenregel:
Wenn Material bereits geliefert wurde:
→ Lieferant ist KEIN Problem und darf NICHT in Actions oder Missing erscheinen

5. Keine generischen Aussagen:
VERBOTEN:
- abstimmen
- prüfen
- klären
- analysieren

ERLAUBT:
- erzwingen
- stoppen
- neu takten
- informieren

6. HARTE ENTSCHEIDUNG (Pflicht):
Die Antwort MUSS enthalten:

- Wenn Blocker heute gelöst wird → sofort weiterarbeiten
- Wenn Blocker nicht gelöst wird → Arbeit stoppen

Die Entscheidung muss im Format sein:

Wenn [Bedingung] → dann [konkrete Handlung]

Beispiel:
Wenn Freigabe heute nicht erfolgt → Betonage stoppen und neu takten
Wenn Freigabe heute erfolgt → Betonage sofort durchführen

Keine "oder"-Formulierungen erlaubt.

7. Kosten konkret benennen:
Keine abstrakten Aussagen.

Statt:
"Mehrkosten"

Nutze:
- "X Mann stehen"
- "Kran läuft"
- "Gerüst bezahlt"

---

OUTPUT-ANFORDERUNG:

summary = beschreibt die reale Lage (inkl. Kosten)

main_blocker = EIN klarer Blocker

root_cause = warum dieser Blocker existiert

actions_today = max 3, nur konkrete Handlungen

decision_required = klare Wenn-Dann Entscheidung (kein "oder")

impact_if_no_action:
- time
- cost (konkret!)
- chain_reaction

critical_missing = nur wirklich blockierende Infos

{
  "priority": "Hoch | Mittel | Niedrig",
  "summary": "1-2 Sätze: Was ist das Problem in der Realität?",
  "actions_today": [
    "Konkrete Maßnahme HEUTE inkl. wer handeln muss",
    "Nächste zwingende Maßnahme",
    "Dritte Maßnahme falls nötig"
  ],
  "decision_required": "Welche Entscheidung jetzt getroffen werden muss",
  "impact_if_no_action": {
    "time": "Konkrete Verzögerung",
    "cost": "Konkretes Kostenrisiko",
    "chain_reaction": "Welche Folgegewerke blockiert werden"
  },
  "critical_missing": [
    "Fehlende Info 1",
    "Fehlende Info 2"
  ]
}

Dokument:
${text}
`.trim();

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.1-mini',
        input: prompt,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        {
          error: 'OpenAI-Analyse fehlgeschlagen.',
          details: errText,
          source: 'openai',
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    const outputText =
      data.output_text ||
      data.output?.map((x: any) =>
        x?.content?.map((c: any) => c?.text || '').join('')
      ).join('') ||
      '';

    let parsed: AnalysisResult;

    try {
      parsed = JSON.parse(outputText);
    } catch {
      return NextResponse.json({
        source: 'fallback-after-parse-fail',
        raw: outputText,
        result: fallbackAnalysis(text),
      });
    }

    return NextResponse.json({
      source: 'openai',
      result: parsed,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Interner Fehler bei der Dokumentenanalyse.',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
