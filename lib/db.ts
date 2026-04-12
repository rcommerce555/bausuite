import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { DocumentAnalysis, SiteAnalysis } from '@/types/ai';

export async function createLead(data: {
  tenantId?: string | null;
  source?: string;
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  pain?: string | null;
  stage?: string;
}) {
  const supabase = getSupabaseAdminClient();
  const { data: row, error } = await supabase
    .from('leads')
    .insert({
      tenant_id: data.tenantId ?? null,
      source: data.source ?? 'website',
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone ?? null,
      pain: data.pain ?? null,
      stage: data.stage ?? 'new',
    })
    .select('*')
    .single();

  if (error) throw error;
  return row;
}

export async function saveDocumentAnalysis(input: {
  tenantId: string;
  userId: string;
  title: string;
  projectId?: string | null;
  contentText: string;
  filePath?: string | null;
  analysis: DocumentAnalysis;
}) {
  const supabase = getSupabaseAdminClient();
  const { data: document, error: docError } = await supabase
    .from('documents')
    .insert({
      tenant_id: input.tenantId,
      project_id: input.projectId ?? null,
      title: input.title,
      file_path: input.filePath ?? null,
      doc_type: input.analysis.docType,
      content_text: input.contentText,
      ai_summary: input.analysis.summary,
      risk_score: input.analysis.riskScore,
      created_by: input.userId,
    })
    .select('*')
    .single();

  if (docError) throw docError;

  const { error: insightError } = await supabase.from('document_insights').insert({
    document_id: document.id,
    risk_items: input.analysis.risks,
    actions: input.analysis.actions,
    entities: input.analysis.entities,
    raw_output: input.analysis,
  });
  if (insightError) throw insightError;

  await supabase.from('audit_events').insert({
    tenant_id: input.tenantId,
    user_id: input.userId,
    action: 'document.analyze',
    entity_type: 'document',
    entity_id: document.id,
    payload: { title: input.title },
  });

  await supabase.from('usage_events').insert({
    tenant_id: input.tenantId,
    user_id: input.userId,
    module_key: 'docs',
    event_type: 'analysis',
    units: 1,
  });

  return document;
}

export async function saveSiteAnalysis(input: {
  tenantId: string;
  userId: string;
  title: string;
  projectId?: string | null;
  sourceNotes: string;
  analysis: SiteAnalysis;
}) {
  const supabase = getSupabaseAdminClient();
  const { data: report, error } = await supabase
    .from('site_reports')
    .insert({
      tenant_id: input.tenantId,
      project_id: input.projectId ?? null,
      title: input.title,
      source_notes: input.sourceNotes,
      ai_summary: input.analysis.summary,
      blockers: input.analysis.blockers,
      tasks: input.analysis.tasks,
      daily_report_text: input.analysis.dailyReport,
      risk_score: input.analysis.riskScore,
      created_by: input.userId,
    })
    .select('*')
    .single();
  if (error) throw error;

  await supabase.from('audit_events').insert({
    tenant_id: input.tenantId,
    user_id: input.userId,
    action: 'site_report.analyze',
    entity_type: 'site_report',
    entity_id: report.id,
    payload: { title: input.title },
  });

  await supabase.from('usage_events').insert({
    tenant_id: input.tenantId,
    user_id: input.userId,
    module_key: 'site',
    event_type: 'analysis',
    units: 1,
  });

  return report;
}
