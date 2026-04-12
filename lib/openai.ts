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
      'You are a construction document copilot for a German construction SaaS.',
      'Return strict JSON with keys: docType, summary, riskScore, risks, actions, entities.',
      'riskScore must be an integer 0-100.',
      'risks/actions/entities must each be arrays of short strings.',
      'Focus on contractual, scheduling, approval, logistics, soil, execution and documentation risks.',
      'Do not include markdown.',
    ].join(' '),
    input,
  );
}

export async function analyzeDocumentLive(input: string): Promise<DocumentAnalysis> {
  return runJsonTask<DocumentAnalysis>(
    [
      'You are an experienced construction site manager under time and cost pressure.',
      'Do not produce a generic summary. Produce an operational decision brief.',
      'Think like a Bauleiter, not like an analyst.',
      'Be concrete, short and actionable.',
      'Do not use vague phrases like "coordinate", "review" or "check" without saying exactly who must do what and why.',
      'Return strict JSON with exactly these keys: priority, summary, actions_today, decision_required, impact_if_no_action, critical_missing.',
      'priority must be one of: Hoch, Mittel, Niedrig.',
      'summary must be 1-2 short sentences explaining the real on-site problem.',
      'actions_today must be an array of concrete actions for today, including responsible party where possible.',
      'decision_required must be one short sentence describing the decision that must be made now.',
      'impact_if_no_action must be an object with keys: time, cost, chain_reaction.',
      'critical_missing must be an array of missing information that blocks action.',
      'Do not include markdown.',
    ].join(' '),
    input,
  );
}
