import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { env } from '@/lib/env';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const signature = (await headers()).get('stripe-signature');
  const rawBody = await request.text();

  if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: 'Missing webhook signature or secret.' }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    const supabase = getSupabaseAdminClient();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const tenantId = session.metadata?.tenant_id;
      const modules = (session.metadata?.modules ?? '').split(',').filter(Boolean);

      if (tenantId && session.customer && session.subscription) {
        await supabase.from('billing_customers').upsert({
          tenant_id: tenantId,
          stripe_customer_id: String(session.customer),
        }, { onConflict: 'tenant_id' });

        await supabase.from('billing_subscriptions').upsert({
          tenant_id: tenantId,
          stripe_subscription_id: String(session.subscription),
          status: 'active',
        }, { onConflict: 'tenant_id' });

        if (modules.length) {
          await supabase.from('tenant_modules').upsert(
            modules.map((moduleKey) => ({ tenant_id: tenantId, module_key: moduleKey, status: 'active' })),
            { onConflict: 'tenant_id,module_key' },
          );
        }
      }
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      await supabase.from('billing_subscriptions').update({ status: subscription.status }).eq('stripe_subscription_id', subscription.id);
    }

    return NextResponse.json({ ok: true, type: event.type });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
  }
}
