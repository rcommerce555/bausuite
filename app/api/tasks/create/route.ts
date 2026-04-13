import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { errorResponse, requireTenantContext } from '@/lib/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const bodySchema = z.object({
  title: z.string().min(3),
  priority: z.enum(['niedrig', 'mittel', 'hoch']).default('mittel'),
  dueToday: z.boolean().optional().default(true),
  source: z.string().optional().default('ki'),
});

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireTenantContext();
    const body = bodySchema.parse(await request.json());
    const supabase = getSupabaseAdminClient();

    const dueDate = body.dueToday ? new Date().toISOString().slice(0, 10) : null;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        tenant_id: ctx.tenantId,
        title: body.title,
        priority: body.priority,
        status: 'offen',
        due_date: dueDate,
        source: body.source,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, task: data });
  } catch (error) {
    return errorResponse(error);
  }
}
