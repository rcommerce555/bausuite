export type DocumentAnalysis = {
  docType: string;
  summary: string;
  riskScore: number;
  risks: string[];
  actions: string[];
  entities: string[];
};

export type SiteAnalysis = {
  summary: string;
  riskScore: number;
  blockers: string[];
  tasks: string[];
  dailyReport: string;
  escalationNeeded?: boolean;
};
