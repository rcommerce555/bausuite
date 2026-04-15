import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { errorResponse, requireTenantContext } from '@/lib/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const bodySchema = z.object({
  id: z.string().uuid(),
  done: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireTenantContext();
    const body = bodySchema.parse(await request.json());
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('tasks')
      .update({ done: body.done })
      .eq('id', body.id)
      .eq('tenant_id', ctx.tenantId)
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
