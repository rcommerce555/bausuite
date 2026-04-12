import { NextResponse } from 'next/server';
import { errorResponse, requireTenantContext } from '@/lib/auth';

export async function GET() {
  try {
    const ctx = await requireTenantContext();
    return NextResponse.json({ ok: true, me: ctx });
  } catch (error) {
    return errorResponse(error);
  }
}
