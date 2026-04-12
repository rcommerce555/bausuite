export type DocumentAnalysis = {
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

export type SiteAnalysis = {
  summary: string;
  riskScore: number;
  blockers: string[];
  tasks: string[];
  dailyReport: string;
};

export type DocumentAnalysis = {
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

export type SiteAnalysis = {
  summary: string;
  riskScore: number;
  blockers: string[];
  tasks: string[];
  dailyReport: string;
};
