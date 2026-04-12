import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="mt-2 text-sm text-slate-500">Echter Supabase-Login für die SaaS-Oberfläche.</p>
        <LoginForm />
      </div>
    </div>
  );
}
