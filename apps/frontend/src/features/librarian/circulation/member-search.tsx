import React, { useState, useEffect, useRef } from 'react';
import { membersService, Member } from '../../../services/members.service';

interface MemberSearchProps {
  onSelect: (member: Member | null) => void;
}

export function MemberSearch({ onSelect }: MemberSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Member | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        const data = await membersService.searchMembers(query);
        setResults(data);
      } catch (err) {
        console.error('Failed to search members', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold">
            {selected.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{selected.name}</p>
            <p className="text-xs text-slate-500">{selected.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelected(null);
            onSelect(null);
            setQuery('');
            setResults([]);
          }}
          className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search member by name or email..."
          className="block w-full rounded-md border-0 py-2.5 pl-10 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          </div>
        )}
      </div>

      {!loading && hasSearched && results.length === 0 && query.trim().length >= 2 && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white py-4 px-3 text-sm text-slate-500 shadow-lg ring-1 ring-black ring-opacity-5">
          No members found matching "{query}".
        </div>
      )}

      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {results.map((member) => (
            <li
              key={member.id}
              onClick={() => {
                setSelected(member);
                onSelect(member);
                setResults([]);
              }}
              className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-slate-900 hover:bg-indigo-50 hover:text-indigo-900 transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-medium">{member.name}</span>
                <span className="text-xs text-slate-500">{member.email}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
