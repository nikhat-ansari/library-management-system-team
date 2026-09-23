import React, { useState } from 'react';
import { MemberSearch } from './member-search';
import { Member } from '../../../services/members.service';
import { circulationService, Transaction } from '../../../services/circulation.service';

export function MemberLoansTab() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [loans, setLoans] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renewError, setRenewError] = useState<string | null>(null);
  const [renewSuccess, setRenewSuccess] = useState<string | null>(null);

  const fetchLoans = async (memberId: string) => {
    setLoading(true);
    setError(null);
    setRenewError(null);
    setRenewSuccess(null);
    try {
      const data = await circulationService.getMemberActiveLoans(memberId);
      setLoans(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch active loans.');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = (member: Member | null) => {
    setSelectedMember(member);
    if (member) {
      fetchLoans(member.id);
    } else {
      setLoans([]);
      setRenewError(null);
      setRenewSuccess(null);
    }
  };

  const handleRenew = async (transactionId: string) => {
    setRenewError(null);
    setRenewSuccess(null);
    setRenewingId(transactionId);
    try {
      const data = await circulationService.renewBook({ transactionId });
      setRenewSuccess(`Successfully renewed book. New due date: ${new Date(data.dueDate).toLocaleDateString()}`);
      if (selectedMember) fetchLoans(selectedMember.id);
    } catch (err: any) {
      setRenewError(err.message || 'Failed to renew book. Policy limit may be reached.');
    } finally {
      setRenewingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 border border-slate-200">
        <label className="block text-sm font-medium leading-6 text-slate-900 mb-2">Select Member</label>
        <div className="max-w-xl">
          <MemberSearch onSelect={handleMemberSelect} />
        </div>
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedMember && (
        <div className="bg-white shadow sm:rounded-lg border border-slate-200">
          <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold leading-6 text-slate-900">
                Active Loans
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Currently issued copies for {selectedMember.name}.
              </p>
            </div>
            <div className="mt-4 sm:ml-4 sm:mt-0 flex-shrink-0">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {loans.length} Active {loans.length === 1 ? 'Loan' : 'Loans'}
              </span>
            </div>
          </div>

          {(renewError || renewSuccess) && (
            <div className="px-4 py-3 sm:px-6 border-t border-slate-200">
              {renewError && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 text-sm text-red-700">{renewError}</div>
                  </div>
                </div>
              )}
              {renewSuccess && (
                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 text-sm text-green-700">{renewSuccess}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-slate-200">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
              </div>
            ) : loans.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No active loans found for this member.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-300">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Book Details</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Dates</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Renewals</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {loans.map((loan) => (
                      <tr key={loan._id} className={loan.isOverdue ? "bg-red-50/30" : ""}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="font-medium text-slate-900 truncate max-w-[200px]" title={loan.bookId as unknown as string}>
                            {loan.bookId as unknown as string}
                          </div>
                          <div className="mt-1 text-slate-500 flex items-center">
                            <svg className="mr-1.5 h-3.5 w-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM4.5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 014.5 10zM17 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0117 10z" clipRule="evenodd" />
                            </svg>
                            {loan.copyId as unknown as string}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          <div>Issued: {new Date(loan.issueDate).toLocaleDateString()}</div>
                          <div className={`mt-1 font-medium ${loan.isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                            Due: {new Date(loan.dueDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {loan.isOverdue ? (
                            <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                              Overdue
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {loan.renewalCount} / {loan.isOverdue ? 'Disabled' : 'Max'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => handleRenew(loan._id)}
                            disabled={renewingId === loan._id || loan.isOverdue}
                            className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {renewingId === loan._id ? 'Renewing...' : 'Renew'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
