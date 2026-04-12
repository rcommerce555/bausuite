import { NextRequest, NextResponse } from 'next/server';

type SitePriorityResult = {
  today_focus: string;
  top_priority: string[];
  biggest_risk: string;
  time_loss_estimate: string;
  recommended_route: string;
};

function fallbackAnalysis(text: string): SitePriorityResult {
  const lower = text.toLowerCase();

  const topPriority: string[] = [];

  if (lower.includes('freigabe')) {
    topPriority.push('Freigabe heute sofort klären, sonst bleibt die Ausführung blockiert');
  }

  if (
    lower.includes('lieferant') ||
    lower.includes('lieferung') ||
    lower.includes('verzug') ||
    lower.includes('stahl')
  ) {
    topPriority.push('Lieferant heute anrufen und realistischen Liefertermin verbindlich absichern');
  }

  if (lower.includes('kran') || lower.includes('wartung') || lower.includes('gerät')) {
    topPriority.push('Geräteverfügbarkeit heute prüfen und Ersatzlösung festlegen');
  }

  if (lower.includes('bauherr') || lower.includes('terminplan')) {
    topPriority.push('Terminplan aktualisieren und Bauherrn noch heute informieren');
  }

  if (lower.includes('subunternehmer')) {
    topPriority.push('Subunternehmer-Einsatz neu takten, damit kein Leerlauf entsteht');
  }

  return {
    today_focus:
      topPriority.length > 0
        ? 'Baustelle mit Freigabe-, Material- und Ablaufstörung zuerst bearbeiten'
        : 'Kritischste Baustelle mit offenem Termin- oder Ressourcenrisiko zuerst bearbeiten',
    top_priority: topPriority.length
      ? topPriority
      : ['Heute die kritischsten offenen Punkte priorisieren und verbindlich zuweisen'],
    biggest_risk: 'Stillstand und Blockade nachfolgender Gewerke',
    time_loss_estimate: '+1 bis +3 Tage',
    recommended_route:
      'Zuerst kritische Baustelle prüfen, dann Lieferant/Freigabe klären, danach Terminplan nachziehen',
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

    if (!apiKey) {
      return NextResponse.json({
        source: 'fallback',
        result: fallbackAnalysis(text),
      });
    }

    const prompt = `
Du bist ein erfahrener Bauleiter mit mehreren parallelen Baustellen.

Deine Aufgabe:
Priorisiere die Tageslage operativ und brutal klar.

WICHTIG:
- Keine allgemeinen Aussagen
- Keine Floskeln wie "abstimmen" oder "prüfen"
- Antworte so, dass ein Bauleiter sofort weiß, wo er hin muss und was zuerst zu tun ist
- Fokus auf Stillstand, Folgegewerke, Material, Freigaben, Geräte, Terminplan, Subunternehmer

Gib ausschließlich gültiges JSON mit exakt dieser Struktur zurück:

{
  "today_focus": "Ein Satz: Worum muss sich heute zuerst gekümmert werden?",
  "top_priority": [
    "Konkrete Priorität 1",
    "Konkrete Priorität 2",
    "Konkrete Priorität 3"
  ],
  "biggest_risk": "Größtes operatives Risiko",
  "time_loss_estimate": "Zeitverlust in realistischer Form",
  "recommended_route": "Empfohlene Reihenfolge oder Route für heute"
}

Tageslage:
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

    let parsed: SitePriorityResult;

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
        error: 'Interner Fehler bei der Baustellen-Priorisierung.',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
