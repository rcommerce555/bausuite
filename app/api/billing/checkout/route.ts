import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/lib/env';
import { getStripe } from '@/lib/stripe';
import { errorResponse, requireTenantContext } from '@/lib/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const bodySchema = z.object({
  modules: z.array(z.enum(['docs', 'site', 'claims', 'admin'])).default([]),
});

const priceMap = {
  docs: () => env.STRIPE_PRICE_DOCS,
  site: () => env.STRIPE_PRICE_SITE,
  claims: () => env.STRIPE_PRICE_CLAIMS,
  admin: () => env.STRIPE_PRICE_ADMIN,
};

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireTenantContext();
    const body = bodySchema.parse(await request.json());
    const stripe = getStripe();
    const supabase = getSupabaseAdminClient();

    const lineItems = [env.STRIPE_PRICE_CORE, ...body.modules.map((m) => priceMap[m]())].filter(Boolean).map((price) => ({ price, quantity: 1 }));
    if (!lineItems.length) {
      return NextResponse.json({ ok: false, error: 'No Stripe prices configured' }, { status: 400 });
    }

    const { data: existingCustomer } = await supabase.from('billing_customers').select('*').eq('tenant_id', ctx.tenantId).limit(1).maybeSingle();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: lineItems,
      customer: existingCustomer?.stripe_customer_id ?? undefined,
      customer_email: existingCustomer?.stripe_customer_id ? undefined : ctx.email ?? undefined,
      metadata: {
        tenant_id: ctx.tenantId,
        tenant_slug: ctx.tenantSlug,
        modules: body.modules.join(','),
      },
      success_url: `${env.NEXT_PUBLIC_APP_URL}/billing?success=1`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/billing?canceled=1`,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    return errorResponse(error);
  }
}
