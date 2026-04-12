import type { DocumentAnalysis, SiteAnalysis } from '@/types/ai';

export function analyzeDocumentLocal(text: string): DocumentAnalysis {
  const lower = text.toLowerCase();
  return {
    docType: lower.includes('leistungsverzeichnis') ? 'Leistungsverzeichnis' : 'Projektunterlage',
    summary:
      'Das Dokument enthält leistungsrelevante Hinweise, Freigabeabhängigkeiten und mögliche Termin- oder Nachtragsrisiken.',
    riskScore: Math.min(95, 25 + ['prüfstatik', 'freigabe', 'offene punkte', 'baugrund', 'eingeschränkt'].filter((k) => lower.includes(k)).length * 14),
    risks: [
      lower.includes('prüfstatik') && 'Prüfstatik fehlt oder wird nachgereicht',
      lower.includes('freigabe') && 'Freigaben sind vor Ausführung kritisch',
      lower.includes('offene punkte') && 'Offene Punkte blockieren Vergabe oder Ausführung',
      lower.includes('baugrund') && 'Baugrund-/Freigabethema erzeugt Termin- und Claim-Risiko',
      lower.includes('eingeschränkt') && 'Baustellenlogistik ist eingeschränkt',
    ].filter(Boolean) as string[],
    actions: [
      'Rückfrage zur Prüfstatik formulieren',
      'Freigabeliste für Schalpläne und Ausführungsunterlagen anlegen',
      'Baustellenlogistik separat bewerten',
      'Baugrund- und Entsorgungsthema vertraglich absichern',
    ],
    entities: ['Bodenplatte', 'Fundamente', 'Schalung', 'Bewehrung', 'Abschlagszahlungen'],
  };
}

export function analyzeSiteLocal(text: string): SiteAnalysis {
  const lower = text.toLowerCase();
  const blockers = [
    lower.includes('freigabe') && 'Bewehrungsfreigabe fehlt vor Betonage',
    lower.includes('kollision') && 'Planungskollision zwischen Elektro und Durchbrüchen',
    lower.includes('krank') && 'Personalausfall beeinflusst Tagesleistung',
    lower.includes('wartung') && 'Geräterisiko: Kran nur eingeschränkt verfügbar',
    lower.includes('verzug') && 'Materialverzug bei Bewehrungsstahl',
  ].filter(Boolean) as string[];

  return {
    summary:
      'Die Notizen zeigen Freigabeprobleme, Koordinationskonflikte, Geräteverfügbarkeit und Materialverzug. Das eignet sich für Maßnahmen- und Eskalationslogik.',
    riskScore: Math.min(96, 35 + blockers.length * 10),
    blockers,
    tasks: [
      'Freigabe Bewehrung bis 16:00 klären',
      'Planstand B-17 mit Elektro/TGA bereinigen',
      'Kranwartung und Ersatzfenster disponieren',
      'Terminplan-Update an Bauherrn senden',
    ],
    dailyReport: `Tagesbericht\n\nLeistungsstand:\n- Betonage verschoben\n- Freigaben und Materialversorgung kritisch\n\nRisikopunkte:\n- Freigabe offen\n- Planungskollision\n- Kranverfügbarkeit eingeschränkt\n- Material im Verzug`,
  };
}
