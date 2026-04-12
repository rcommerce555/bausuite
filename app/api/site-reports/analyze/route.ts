import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { SiteAnalysis } from '@/types/ai';
import { analyzeSiteLocal } from '@/lib/demo-logic';
import { analyzeSiteLive } from '@/lib/openai';
import { saveSiteAnalysis } from '@/lib/db';
import { errorResponse, requireTenantContext } from '@/lib/auth';

const bodySchema = z.object({
  title: z.string().min(2).default('Baustellenbericht'),
  content: z.string().min(20),
  projectId: z.string().uuid().optional().nullable(),
  mode: z.enum(['demo', 'live']).default('live'),
});

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireTenantContext('site');
    const body = bodySchema.parse(await request.json());
    const result: SiteAnalysis = body.mode === 'demo' ? analyzeSiteLocal(body.content) : await analyzeSiteLive(body.content);

    const report = await saveSiteAnalysis({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      title: body.title,
      projectId: body.projectId ?? null,
      sourceNotes: body.content,
      analysis: result,
    });

    return NextResponse.json({ ok: true, result, report });
  } catch (error) {
    return errorResponse(error);
  }
}
