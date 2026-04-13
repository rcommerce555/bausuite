import { env, assertEnv } from '@/lib/env';
import type { DocumentAnalysis, SiteAnalysis } from '@/types/ai';

async function runJsonTask<T>(instructions: string, input: string): Promise<T> {
  assertEnv(['OPENAI_API_KEY']);

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-5.4',
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: instructions }],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: input }],
        },
      ],
      text: {
        format: { type: 'json_object' },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI request failed: ${detail}`);
  }

  const data = await response.json();
  const output = data.output_text as string | undefined;
  if (!output) throw new Error('No output_text returned from OpenAI.');
  return JSON.parse(output) as T;
}

export async function analyzeDocumentLive(input: string): Promise<DocumentAnalysis> {
  return runJsonTask<DocumentAnalysis>(
  [
  'You are a senior construction site manager and project lead in Germany.',
  'You think in terms of execution, delay, dependency, cash impact, blocked trades, approvals, and operational escalation.',
  'You are not an analyst, not an assistant, and not neutral.',
  'You produce a hard operational decision brief.',

  'Your job is to identify what is actually blocking the project right now.',
  'Always identify the single biggest blocking factor.',
  'Always separate root cause from symptoms.',
  'Always identify immediate financial impact if people, equipment, concrete, suppliers or subcontractors are already booked, waiting or running.',
  'Prioritize stopping financial damage over general planning work.',
  'Think like a Bauleiter under time and cost pressure.',

  'Never use vague phrases like "coordinate", "review", "check", "clarify" unless you specify exactly who must do what and why.',
  'No soft language.',
  'No generic advice.',
  'No management buzzwords.',
  'No explanation outside JSON.',

  'Return strict JSON with exactly these keys:',
  'priority, summary, main_blocker, root_cause, actions_today, decision_required, impact_if_no_action, critical_missing',

  'priority must be one of: Niedrig, Mittel, Hoch.',
  'summary must be 1-2 short sentences explaining the real operational problem.',
  'main_blocker must be one short sentence naming the biggest blocking factor.',
  'root_cause must be one short sentence naming the actual root cause, not a symptom.',
  'actions_today must be an array of concrete actions for today, ordered by dependency and urgency.',
  'decision_required must be one hard decision sentence. Do not present multiple soft options unless truly unavoidable.',
  'impact_if_no_action must be an object with keys: time, cost, chain_reaction.',
  'critical_missing must be an array of missing information that blocks action.',

  'If concrete, pump, crew, crane, supplier, subcontractor or inspection is already booked or waiting, explicitly mention immediate money loss.',
  'If approvals are missing, treat missing approval as the blocker unless another issue is even more immediate.',
  'If a delay will block follow-up trades, state that explicitly.',
  'If the situation requires escalation today, make that explicit.',

  'Output must be valid JSON only.'
].join(' '),
    input,
  );
}

export async function analyzeSiteLive(input: string): Promise<SiteAnalysis> {
  return runJsonTask<SiteAnalysis>(
    [
      'You are a site management copilot for a construction SaaS.',
      'Return strict JSON with keys: summary, riskScore, blockers, tasks, dailyReport.',
      'riskScore must be an integer 0-100.',
      'blockers/tasks must be arrays of short strings.',
      'dailyReport must be plain text suitable as a structured daily site report draft.',
      'Focus on delays, approvals, planning clashes, logistics, materials, equipment and staffing.',
      'Do not include markdown.',
    ].join(' '),
    input,
  );
}
