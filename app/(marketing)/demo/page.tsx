import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { LeadForm } from './lead-form';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="container-shell py-10">
        <div className="card p-8">
          <h1 className="text-4xl font-bold">Demo-Flow</h1>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">1. Lead erfasst sich über Landingpage oder Vertrieb</div>
            <div className="rounded-2xl bg-slate-50 p-5">2. Demo-Modul wird im SaaS-Frontend gezeigt</div>
            <div className="rounded-2xl bg-slate-50 p-5">3. Pilotkunde aktiviert Module</div>
            <div className="rounded-2xl bg-slate-50 p-5">4. Stripe aktiviert bezahlte Subscriptions</div>
          </div>
          <LeadForm />
          <div className="mt-6">
            <Link href="/login" className="rounded-2xl bg-slate-900 px-5 py-3 text-white">Zur App</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
