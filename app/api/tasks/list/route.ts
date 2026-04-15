import { NextResponse } from 'next/server';
import { errorResponse, requireTenantContext } from '@/lib/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const ctx = await requireTenantContext();
    const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('tenant_id', ctx.tenantId)
  .order('done', { ascending: true })
  .order('blocker', { ascending: false })
  .order('created_at', { ascending: false })
  .limit(50);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, tasks: data });
  } catch (error) {
    return errorResponse(error);
  }
}
