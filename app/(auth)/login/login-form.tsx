'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('demo@baufirma.de');
  const [password, setPassword] = useState('12345678');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    const nextUrl = searchParams.get('next') ?? '/dashboard';
router.push(nextUrl as any);
    router.refresh();
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" type="password" placeholder="Passwort" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error ? <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      <button disabled={loading} className="block w-full rounded-2xl bg-slate-900 px-5 py-3 text-center text-white disabled:opacity-60">
        {loading ? 'Einloggen...' : 'Einloggen'}
      </button>
    </form>
  );
}
