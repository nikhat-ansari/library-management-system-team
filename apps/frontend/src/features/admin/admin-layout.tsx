import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';

const navigation = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'User Management', to: '/admin/users' },
  { label: 'Permissions' }, { label: 'System Settings' }, { label: 'Reports' },
  { label: 'Audit Logs' }, { label: 'System Health' }, { label: 'AI Settings' },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const signOut = async () => { await logout(); navigate('/login', { replace: true }); };
  const sidebar = <aside className="flex h-full w-72 flex-col bg-slate-950 px-4 py-5 text-slate-200"><div className="px-3"><p className="text-sm font-semibold text-white">Library Management</p><p className="mt-1 text-xs text-slate-400">Administration workspace</p></div><nav className="mt-8 grid gap-1" aria-label="Admin navigation">{navigation.map((item) => item.to ? <NavLink key={item.label} to={item.to} end={item.to === '/admin'} onClick={() => setOpen(false)} className={({ isActive }) => `flex min-h-11 items-center rounded-lg px-3 text-left text-sm font-medium transition ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>{item.label}</NavLink> : <button key={item.label} type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-lg px-3 text-left text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">{item.label}<span className="ml-2 text-xs font-normal text-slate-500">Soon</span></button>)}</nav><div className="mt-auto border-t border-slate-800 px-3 pt-4"><p className="truncate text-sm font-medium text-white">{user?.name}</p><p className="mt-1 text-xs text-slate-400">Administrator</p><button type="button" onClick={signOut} className="mt-4 min-h-10 text-sm font-semibold text-indigo-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300">Log out</button></div></aside>;
  return <div className="min-h-screen bg-slate-100 text-slate-950"><div className="hidden lg:fixed lg:inset-y-0 lg:flex">{sidebar}</div>{open && <div className="fixed inset-0 z-40 lg:hidden"><button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="absolute inset-0 bg-slate-950/50" /><div className="relative h-full">{sidebar}</div></div>}<div className="lg:pl-72"><header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8"><button type="button" onClick={() => setOpen(true)} className="min-h-11 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700 lg:hidden">Menu</button><div className="hidden lg:block"><p className="text-sm font-medium text-slate-600">Admin dashboard</p></div><div className="text-right"><p className="text-sm font-semibold text-slate-900">{user?.name}</p><p className="text-xs text-slate-500">ADMIN</p></div></header><main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main></div></div>;
}
