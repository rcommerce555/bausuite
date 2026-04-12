import type { DocumentAnalysis, SiteAnalysis } from '@/types/ai';

export function analyzeDocumentLocal(text: string): DocumentAnalysis {
  const lower = text.toLowerCase();

  const missing: string[] = [];
  const actions: string[] = [];

  if (lower.includes('freigabe')) {
    missing.push('Verbindlicher Freigabetermin fehlt');
    actions.push('Freigabe heute bis 16:00 verbindlich einholen');
  }

  if (lower.includes('lieferant') || lower.includes('lieferung') || lower.includes('stahl')) {
    missing.push('Bestätigter Lieferstatus fehlt');
    actions.push('Lieferant heute anrufen und bestätigten Termin schriftlich sichern');
  }

  if (lower.includes('betonage') || lower.includes('verschiebt')) {
    actions.push('Betonage-Fenster neu bewerten und Folgegewerke informieren');
  }

  if (lower.includes('bauherr') || lower.includes('terminplan')) {
    actions.push('Neuen Terminplan aufsetzen und Bauherrn heute abstimmen');
  }

  const priority: DocumentAnalysis['priority'] =
    actions.length >= 3 ? 'Hoch' :
    actions.length === 2 ? 'Mittel' :
    'Niedrig';

  return {
    priority,
    summary:
      'Die Baustelle hat ein akutes Freigabe- und Lieferproblem. Ohne sofortige Klärung drohen Verzögerung und Blockade nachfolgender Arbeiten.',
    actions_today: actions.length
      ? actions
      : ['Dokument heute operativ bewerten und Verantwortliche fest zuweisen'],
    decision_required:
      'Entscheidung: Betonage verschieben oder Material-/Freigabeproblem heute verbindlich lösen.',
    impact_if_no_action: {
      time: '+1 bis +2 Tage Verzögerung',
      cost: 'Mehrkosten durch Stillstand, Umplanung und Nachlauf',
      chain_reaction: 'Folgegewerke und Terminplan werden blockiert',
    },
    critical_missing: missing.length
      ? missing
      : ['Keine eindeutig fehlenden Kerninformationen erkannt'],
  };
}

export function analyzeSiteLocal(text: string): SiteAnalysis {
  const lower = text.toLowerCase();

  const blockers = [
    lower.includes('freigabe') && 'Freigabeproblem blockiert Ausführung',
    lower.includes('kollision') && 'Planungskollision zwischen Gewerken',
    lower.includes('krank') && 'Personalausfall beeinflusst Leistung',
    lower.includes('wartung') && 'Geräterisiko durch Wartung/Ausfall',
    lower.includes('verzug') && 'Material- oder Terminverzug',
  ].filter(Boolean) as string[];

  const tasks = [
    'Kritische Punkte heute im Jour fixe eskalieren',
    'Verantwortlichkeiten verbindlich festlegen',
    'Auswirkungen auf Terminplan sofort nachführen',
  ];

  return {
    summary:
      'Die Baustelle zeigt mehrere operative Störungen, die zeitnah koordiniert werden müssen.',
    riskScore: Math.min(95, 35 + blockers.length * 12),
    blockers: blockers.length ? blockers : ['Keine eindeutigen Blocker erkannt'],
    tasks,
    dailyReport:
      'Tagesbericht: Kritische Punkte wurden identifiziert, Verantwortlichkeiten sind nachzuführen und Auswirkungen auf den Terminplan zu bewerten.',
  };
}
