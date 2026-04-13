import type { DocumentAnalysis, SiteAnalysis } from '@/types/ai';

export function analyzeDocumentLocal(text: string): DocumentAnalysis {
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

  if (lower.includes('lieferant') || lower.includes('lieferung') || lower.includes('stahl') || lower.includes('verzug')) {
    actions.push('Lieferant heute anrufen und belastbaren Liefertermin schriftlich bestätigen lassen');
    missing.push('Bestätigter Lieferstatus fehlt');
  }

  if (lower.includes('beton') || lower.includes('betonage') || lower.includes('verschoben')) {
    actions.push('Betonagefenster neu festlegen und betroffene Folgegewerke sofort informieren');
  }

  if (lower.includes('bauherr') || lower.includes('terminplan')) {
    actions.push('Aktualisierten Terminplan heute erstellen und an den Bauherrn senden');
  }

  const priority: DocumentAnalysis['priority'] =
    actions.length >= 3 ? 'Hoch' :
    actions.length === 2 ? 'Mittel' :
    'Niedrig';

  return {
    priority,
    summary:
      'Die Baustelle hat ein akutes Freigabe- und Lieferproblem. Ohne sofortige Klärung drohen Terminverschiebung und Störungen im Bauablauf.',
    main_blocker,
    root_cause,
    actions_today: actions.length
      ? actions
      : ['Heute Hauptproblem identifizieren und Verantwortlichen verbindlich festlegen'],
    decision_required:
      'Entscheidung: Termin aktiv verschieben oder Freigabe- und Materialproblem heute verbindlich lösen.',
    impact_if_no_action: {
      time: '+1 bis +2 Tage Verzögerung',
      cost: 'Mehrkosten durch Stillstand, Umplanung und Nachlauf',
      chain_reaction: 'Folgegewerke und Terminplan werden blockiert',
    },
    critical_missing: missing.length
      ? missing
      : ['Keine klar benannte Schlüsselinformation vorhanden'],
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
