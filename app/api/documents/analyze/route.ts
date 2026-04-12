import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { DocumentAnalysis } from '@/types/ai';
import { analyzeDocumentLocal } from '@/lib/demo-logic';
import { analyzeDocumentLive } from '@/lib/openai';
import { saveDocumentAnalysis } from '@/lib/db';
import { errorResponse, requireTenantContext } from '@/lib/auth';

const bodySchema = z.object({
  title: z.string().min(2).default('Dokumenten-Analyse'),
  content: z.string().min(20),
  projectId: z.string().uuid().optional().nullable(),
  filePath: z.string().optional().nullable(),
  mode: z.enum(['demo', 'live']).default('live'),
});

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireTenantContext('docs');
    const body = bodySchema.parse(await request.json());
    const result: DocumentAnalysis = body.mode === 'demo' ? analyzeDocumentLocal(body.content) : await analyzeDocumentLive(body.content);

    const document = await saveDocumentAnalysis({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      title: body.title,
      projectId: body.projectId ?? null,
      contentText: body.content,
      filePath: body.filePath ?? null,
      analysis: result,
    });

    return NextResponse.json({ ok: true, result, document });
  } catch (error) {
    return errorResponse(error);
  }
}
