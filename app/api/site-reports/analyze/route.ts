import { NextRequest, NextResponse } from 'next/server';

type SitePriorityResult = {
  today_focus: string;
  top_priority: string[];
  biggest_risk: string;
  immediate_cost_driver: string;
  time_loss_estimate: string;
  recommended_route: string;
  escalation_today: string;
};

function fallbackSiteAnalysis(text: string): SitePriorityResult {
  const lower = text.toLowerCase();
  const top: string[] = [];

  let focus = 'Kritischste Baustellenstörung heute priorisieren';
  let biggestRisk = 'Stillstand und Folgegewerke werden blockiert';
  let immediateCostDriver = 'Bereits disponierte Ressourcen verlieren Produktivität';
  let escalation = 'Heute Eskalation an Projektleitung oder technische Freigabestelle notwendig';

  if (lower.includes('freigabe')) {
    focus = 'Freigabeproblem zuerst lösen, da ohne Freigabe alle Folgearbeiten blockiert sind';
    top.push('Freigabe sofort mit zuständiger Stelle klären und Eskalation einleiten');
  }

  if (lower.includes('lieferant') || lower.includes('verzug') || lower.includes('stahl')) {
    top.push('Lieferant sofort kontaktieren und verbindlichen Liefertermin sichern');
  }

  if (lower.includes('kran') || lower.includes('wartung')) {
    top.push('Geräteverfügbarkeit sofort klären und Ersatzlösung organisieren');
    immediateCostDriver = 'Geräteausfall und stehende Kolonne verursachen sofort Kosten';
  }

  if (lower.includes('beton') || lower.includes('betonage')) {
    immediateCostDriver = 'Bestellter Beton und wartende Kolonne verursachen sofort Kosten';
    top.push('Betonlieferung prüfen und ggf. sofort verschieben oder stoppen');
  }

  if (lower.includes('bauherr') || lower.includes('terminplan')) {
    top.push('Terminplan heute aktualisieren und Bauherrn aktiv informieren');
  }

  return {
    today_focus: focus,
    top_priority: top.length
      ? top
      : ['Heute größte operative Störung identifizieren und direkt Maßnahmen auslösen'],
    biggest_risk: biggestRisk,
    immediate_cost_driver: immediateCostDriver,
    time_loss_estimate: '+1 bis +3 Tage Verzögerung',
    recommended_route:
      'Zuerst Hauptblocker lösen, dann Ressourcen absichern, dann Kommunikation durchführen',
    escalation_today: escalation,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = String(body?.text || '').trim();

    if (!text) {
      return NextResponse.json(
        { error: 'Kein Baustellenstatus übergeben.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // 👉 FALLBACK wenn kein Key
    if (!apiKey) {
      return NextResponse.json({
        source: 'fallback',
        result: fallbackSiteAnalysis(text),
      });
    }

    const prompt = `
Du bist ein erfahrener Bauleiter mit mehreren parallelen Baustellen.

Deine Aufgabe:
Priorisiere die Tageslage operativ, direkt und ohne Umschweife.

Regeln:
- Keine Floskeln wie "abstimmen" oder "prüfen"
- Immer konkret sagen, wer was tun muss
- Fokus auf Stillstand, Kosten, Folgegewerke und Zeitdruck
- Identifiziere, was JETZT Geld kostet (Kolonne, Beton, Geräte, Lieferanten)
- Erzwinge klare Prioritäten

Gib ausschließlich gültiges JSON mit exakt dieser Struktur zurück:

{
  "today_focus": "Ein Satz: Worum muss sich heute zuerst gekümmert werden?",
  "top_priority": [
    "Konkrete Priorität 1",
    "Konkrete Priorität 2",
    "Konkrete Priorität 3"
  ],
  "biggest_risk": "Größtes operatives Risiko",
  "immediate_cost_driver": "Was verursacht jetzt sofort Kosten?",
  "time_loss_estimate": "Realistische Zeitverzögerung",
  "recommended_route": "Reihenfolge der Schritte für heute",
  "escalation_today": "Was muss heute eskaliert werden und an wen?"
}

Tageslage:
${text}
`.trim();

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: \`Bearer \${apiKey}\`,
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

    let parsed: SitePriorityResult;

    try {
      parsed = JSON.parse(outputText);
    } catch {
      return NextResponse.json({
        source: 'fallback-after-parse-fail',
        raw: outputText,
        result: fallbackSiteAnalysis(text),
      });
    }

    return NextResponse.json({
      source: 'openai',
      result: parsed,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Interner Fehler bei der Baustellen-Priorisierung.',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
