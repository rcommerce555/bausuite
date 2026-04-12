import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { getStripe } from '@/lib/stripe';
import { errorResponse, requireTenantContext } from '@/lib/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  try {
    const ctx = await requireTenantContext();
    const supabase = getSupabaseAdminClient();
    const { data: customer } = await supabase.from('billing_customers').select('*').eq('tenant_id', ctx.tenantId).limit(1).single();
    if (!customer) return NextResponse.json({ ok: false, error: 'No Stripe customer found for tenant' }, { status: 404 });

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/billing`,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    return errorResponse(error);
  }
}
