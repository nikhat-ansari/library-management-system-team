import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { getDashboardPath } from '../../routes/role-redirect';

export function AccessDeniedPage() {
  const { user } = useAuth();
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Access restricted</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">You don’t have access to that page.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Use the workspace assigned to your account.</p>
        {user && <Link to={getDashboardPath(user.role)} className="mt-6 inline-flex rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700">Go to my dashboard</Link>}
      </section>
    </main>
  );
}
