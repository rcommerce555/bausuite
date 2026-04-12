import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { errorResponse, requireTenantContext } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireTenantContext('docs');
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'file is required' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${ctx.tenantSlug}/${Date.now()}-${safeName}`;
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.storage.from('documents').upload(filePath, bytes, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

    if (error) throw error;
    return NextResponse.json({ ok: true, filePath, filename: file.name });
  } catch (error) {
    return errorResponse(error);
  }
}
