import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export type AppRole = 'owner' | 'admin' | 'sales' | 'project_manager' | 'site_manager' | 'backoffice' | 'viewer';

export type TenantContext = {
  userId: string;
  email: string | null;
  tenantId: string;
  tenantSlug: string;
  role: AppRole;
};

export async function requireTenantContext(requiredModuleKey?: string): Promise<TenantContext> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  const { data: membership, error } = await supabase
    .from('memberships')
    .select('tenant_id, role, tenants!inner(slug)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single();

  if (error || !membership) {
    throw new Error('NO_MEMBERSHIP');
  }

  const tenantSlug = (membership.tenants as unknown as { slug: string }).slug;

  if (requiredModuleKey) {
    const { data: moduleData } = await supabase
      .from('tenant_modules')
      .select('module_key, status')
      .eq('tenant_id', membership.tenant_id)
      .eq('module_key', requiredModuleKey)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    if (!moduleData) {
      throw new Error('MODULE_NOT_ACTIVE');
    }
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    tenantId: membership.tenant_id,
    tenantSlug,
    role: membership.role as AppRole,
  };
}

export function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  if (message === 'UNAUTHORIZED') return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  if (message === 'NO_MEMBERSHIP') return NextResponse.json({ ok: false, error: 'No active tenant membership found' }, { status: 403 });
  if (message === 'MODULE_NOT_ACTIVE') return NextResponse.json({ ok: false, error: 'Required module is not active for tenant' }, { status: 403 });
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}
