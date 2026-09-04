import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { StaffUser } from '../../types/admin-user-management';

let closeOpenMenu: (() => void) | undefined;

export function StaffActionMenu({ staff, onChangeStatus }: { staff: StaffUser; onChangeStatus: (staff: StaffUser) => void }) {
  const [open, setOpen] = useState(false);
  const [opensUpward, setOpensUpward] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const close = () => setOpen(false);
  const toggle = () => {
    if (open) { close(); return; }
    closeOpenMenu?.();
    const rect = trigger.current?.getBoundingClientRect();
    setOpensUpward(Boolean(rect && window.innerHeight - rect.bottom < 190));
    closeOpenMenu = close;
    setOpen(true);
  };

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => { if (!container.current?.contains(event.target as Node)) close(); };
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { close(); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', onPointerDown); document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown); document.removeEventListener('keydown', onKeyDown);
      if (closeOpenMenu === close) closeOpenMenu = undefined;
    };
  }, []);

  const statusLabel = staff.accountStatus === 'active' ? 'Deactivate account' : 'Activate account';
  const menuPosition = opensUpward ? 'bottom-[calc(100%+0.5rem)] origin-bottom-right' : 'top-[calc(100%+0.5rem)] origin-top-right';
  return <div ref={container} className="relative inline-flex"><button ref={trigger} type="button" onClick={toggle} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700" aria-label={`Open actions for ${staff.name}`} aria-haspopup="menu" aria-expanded={open}><svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path d="M10 4.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM10 11.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM10 18.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" /></svg></button>{open && <div role="menu" aria-label={`Actions for ${staff.name}`} className={`absolute right-0 z-30 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-950/10 ring-1 ring-slate-950/5 ${menuPosition}`}><Link role="menuitem" to={`/admin/users/${staff.id}`} onClick={close} className="block rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700">View details</Link><Link role="menuitem" to={`/admin/users/${staff.id}/edit`} onClick={close} className="block rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700">Edit account</Link><div className="my-1.5 border-t border-slate-100" /><button type="button" role="menuitem" onClick={() => { close(); onChangeStatus(staff); }} className="block w-full rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700">{statusLabel}</button></div>}</div>;
}
