import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { errorResponse, requireTenantContext } from '@/lib/auth';

const bodySchema = z.object({
  moduleKey: z.enum(['docs', 'site', 'claims', 'admin']),
  status: z.enum(['active', 'inactive']).default('active'),
});

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireTenantContext();
    if (!['owner', 'admin'].includes(ctx.role)) {
      return NextResponse.json({ ok: false, error: 'Admin role required' }, { status: 403 });
    }

    const body = bodySchema.parse(await request.json());
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('tenant_modules')
      .upsert({ tenant_id: ctx.tenantId, module_key: body.moduleKey, status: body.status }, { onConflict: 'tenant_id,module_key' })
      .select('*')
      .single();
    if (error) throw error;

    await supabase.from('audit_events').insert({
      tenant_id: ctx.tenantId,
      user_id: ctx.userId,
      action: 'module.update',
      entity_type: 'tenant_module',
      entity_id: data.id,
      payload: { moduleKey: body.moduleKey, status: body.status },
    });

    return NextResponse.json({ ok: true, module: data });
  } catch (error) {
    return errorResponse(error);
  }
}
