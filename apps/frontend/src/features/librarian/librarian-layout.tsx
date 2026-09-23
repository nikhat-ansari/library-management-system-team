import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';

const navigation = [
  { label: 'Dashboard', to: '/librarian' },
  { label: 'Books', to: '/librarian/books' },
  { label: 'Circulation', to: '/librarian/circulation' },
  { label: 'Reservations', to: '/librarian/reservations' },
  { label: 'Seat Bookings', to: '/librarian/seats' },
];

export function LibrarianLayout({ children }: { children: ReactNode }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const signOut = async () => { await logout(); navigate('/login', { replace: true }); };

  const sidebar = (
    <aside className="flex h-full w-72 flex-col bg-white border-r border-gray-200 px-4 py-5 text-gray-900">
      <div className="px-3">
        <p className="text-sm font-semibold text-gray-900">Library Management</p>
        <p className="mt-1 text-xs text-gray-500">Librarian / Staff Workspace</p>
      </div>
      <nav className="mt-8 grid gap-1" aria-label="Librarian navigation">
        {navigation.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === '/librarian'}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex min-h-11 items-center rounded-lg px-3 text-left text-sm font-medium transition ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-gray-100 px-3 pt-4">
        <p className="truncate text-sm font-medium text-gray-900">{user?.name}</p>
        <p className="mt-1 text-xs text-gray-500">LIBRARIAN / STAFF</p>
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 focus-visible:outline-none"
        >
          Log out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex">{sidebar}</div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="absolute inset-0 bg-gray-900/80" />
          <div className="relative h-full">{sidebar}</div>
        </div>
      )}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <header className="flex min-h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="min-h-11 rounded-lg px-3 text-sm font-semibold text-gray-500 hover:text-gray-900 lg:hidden"
          >
            Menu
          </button>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-gray-500">Librarian Dashboard</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
