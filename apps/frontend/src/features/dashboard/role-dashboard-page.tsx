import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import type { UserRole } from '../../types/auth';

const dashboardTitle: Record<UserRole, string> = {
  ADMIN: 'Admin dashboard',
  LIBRARIAN_STAFF: 'Librarian dashboard',
  MEMBER: 'Member dashboard',
};

export function RoleDashboardPage({ role }: { role: UserRole }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const signOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8">
      <section className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-700">Library management</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{dashboardTitle[role]}</h1>
            <p className="mt-3 text-slate-600">Welcome, {user?.name}. Your account has been verified.</p>
          </div>
          <button type="button" onClick={signOut} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700">Log out</button>
        </div>
        <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">This protected placeholder is limited to Module 1 role verification. Dashboard features will be added in their respective modules.</div>
      </section>
    </main>
  );
}
