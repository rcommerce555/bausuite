import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="container-shell flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">BAU</div>
          <div>
            <div className="text-sm text-slate-500">BauSuite AI</div>
            <div className="font-semibold">Modulare KI für Bauunternehmen</div>
          </div>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/pricing" className="rounded-2xl px-4 py-2 text-slate-600 hover:bg-slate-100">Preise</Link>
          <Link href="/demo" className="rounded-2xl px-4 py-2 text-slate-600 hover:bg-slate-100">Demo</Link>
          <Link href="/login" className="rounded-2xl bg-slate-900 px-4 py-2 text-white">Login</Link>
        </nav>
      </div>
    </header>
  );
}
