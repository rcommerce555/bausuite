import { NextRequest, NextResponse } from 'next/server';

type AnalysisResult = {
  documentType: string;
  summary: string;
  risks: string[];
  missingInfo: string[];
  recommendation: string;
  priority: 'Niedrig' | 'Mittel' | 'Hoch' | 'Sofort';
};

function fallbackAnalysis(text: string): AnalysisResult {
  const lower = text.toLowerCase();

  const risks: string[] = [];
  const missingInfo: string[] = [];

  if (lower.includes('verzug') || lower.includes('verschoben')) {
    risks.push('Möglicher Terminverzug');
  }
  if (lower.includes('freigabe fehlt') || lower.includes('freigabe')) {
    risks.push('Freigabeabhängigkeit kann Folgegewerke blockieren');
    missingInfo.push('Verbindlicher Freigabetermin fehlt');
  }
  if (lower.includes('lieferung') || lower.includes('lieferant')) {
    risks.push('Lieferketten- oder Materialrisiko');
    missingInfo.push('Bestätigter Lieferstatus fehlt');
  }
  if (lower.includes('kollision') || lower.includes('durchbruch')) {
    risks.push('Planungskollision / Abstimmungsfehler');
  }
  if (lower.includes('kran') || lower.includes('wartung')) {
    risks.push('Geräteverfügbarkeit gefährdet Ablauf');
    missingInfo.push('Ersatzgerät oder Wartungsfenster nicht geklärt');
  }

  const priority: AnalysisResult['priority'] =
    risks.length >= 3 ? 'Sofort' :
    risks.length === 2 ? 'Hoch' :
    risks.length === 1 ? 'Mittel' :
    'Niedrig';

  return {
    documentType: 'Bau-Dokument',
    summary:
      'Das Dokument wurde automatisch voranalysiert. Es enthält operative Hinweise und potenzielle Risiken, die priorisiert bewertet werden sollten.',
    risks: risks.length ? risks : ['Keine eindeutigen Hochrisiken automatisch erkannt'],
    missingInfo: missingInfo.length ? missingInfo : ['Keine klaren Informationslücken automatisch erkannt'],
    recommendation:
      priority === 'Sofort' || priority === 'Hoch'
        ? 'Heute noch mit Bauleitung/Projektleitung abstimmen und offene Punkte verbindlich klären.'
        : 'Dokument prüfen, offene Punkte bestätigen und Maßnahmen bei Bedarf anstoßen.',
    priority,
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
Analysiere folgendes Bau-Dokument.
Antworte ausschließlich als gültiges JSON mit exakt dieser Struktur:

{
  "documentType": "string",
  "summary": "string",
  "risks": ["string"],
  "missingInfo": ["string"],
  "recommendation": "string",
  "priority": "Niedrig | Mittel | Hoch | Sofort"
}

Regeln:
- kurz und konkret
- keine Erklärtexte außerhalb des JSON
- Fokus auf Risiko, Zeitverlust, Koordinationsprobleme, Nachtragsrisiko, Freigaben, Material, Geräte, Informationslücken

Dokument:
${text}
`.trim();

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
      data.output?.map((x: any) => x?.content?.map((c: any) => c?.text).join('')).join('') ||
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
