import { NextResponse } from 'next/server';
import { errorResponse, requireTenantContext } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const ctx = await requireTenantContext();
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.from('projects').select('*').eq('tenant_id', ctx.tenantId).order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ ok: true, projects: data });
  } catch (error) {
    return errorResponse(error);
  }
}
