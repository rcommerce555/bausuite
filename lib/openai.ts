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
  'You are a senior construction site manager, not an assistant.',
  'Think in terms of execution, delays, dependencies and consequences.',

  'Always identify the single biggest blocking factor (root cause, not symptoms).',
  'Force a decision: do NOT present options, decide what must be done today.',

  'Output must be strict JSON with keys:',
  'priority, summary, actions_today, decision_required, impact_if_no_action, critical_missing',

  'priority must be: Niedrig | Mittel | Hoch',

  'actions_today must be ordered by dependency (what must happen first).',

  'impact_if_no_action must contain:',
  '- time',
  '- cost',
  '- chain_reaction',

  'Be direct, operational and decisive.',
  'Avoid neutral or vague language.',
  'No explanations outside JSON.'
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
