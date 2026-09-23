import React, { useState } from 'react';
import { IssueTab } from './issue-tab';
import { ReturnTab } from './return-tab';
import { MemberLoansTab } from './member-loans-tab';

export function CirculationPage() {
  const [activeTab, setActiveTab] = useState<'ISSUE' | 'RETURN' | 'LOANS'>('ISSUE');

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Circulation Desk
        </h2>
        <p className="mt-2 max-w-4xl text-sm text-slate-500">
          Manage member loans, return items securely, and handle manual renewals all from this unified operational workspace.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('ISSUE')}
              className={`${
                activeTab === 'ISSUE'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } flex w-full items-center rounded-md px-3 py-2 text-sm font-medium`}
            >
              Issue Book
            </button>
            <button
              onClick={() => setActiveTab('RETURN')}
              className={`${
                activeTab === 'RETURN'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } flex w-full items-center rounded-md px-3 py-2 text-sm font-medium`}
            >
              Return Book
            </button>
            <button
              onClick={() => setActiveTab('LOANS')}
              className={`${
                activeTab === 'LOANS'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } flex w-full items-center rounded-md px-3 py-2 text-sm font-medium`}
            >
              Active Loans & Renewals
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'ISSUE' && <IssueTab />}
          {activeTab === 'RETURN' && <ReturnTab />}
          {activeTab === 'LOANS' && <MemberLoansTab />}
        </div>
      </div>
    </div>
  );
}

