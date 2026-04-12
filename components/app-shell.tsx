import Link from 'next/link';
import { LogoutButton } from '@/components/logout-button';



export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-72 border-r border-slate-200 bg-white lg:block">
        <div className="border-b border-slate-200 p-5">
          <div className="text-sm text-slate-500">BauSuite AI</div>
          <div className="font-semibold">Demo Nordbau GmbH</div>
        </div>
        <nav className="p-3">
  <Link href="/dashboard" className="mb-1 block rounded-2xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-100">
    Dashboard
  </Link>
  <Link href="/documents" className="mb-1 block rounded-2xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-100">
    Dokumenten-Copilot
  </Link>
  <Link href="/site" className="mb-1 block rounded-2xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-100">
    Bauleitungs-Copilot
  </Link>
  <Link href="/billing" className="mb-1 block rounded-2xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-100">
    Billing
  </Link>
  <Link href="/admin" className="mb-1 block rounded-2xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-100">
    Admin
  </Link>
</nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between rounded-[24px] border border-slate-200 bg-white px-6 py-4 shadow-soft">
          <div>
            <div className="text-sm text-slate-500">SaaS-Oberfläche</div>
            <div className="text-xl font-semibold">{title}</div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">Zur Landingpage</Link>
            <LogoutButton />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
