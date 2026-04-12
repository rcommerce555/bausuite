'use client';

import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
      onClick={async () => {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
      }}
    >
      Logout
    </button>
  );
}
