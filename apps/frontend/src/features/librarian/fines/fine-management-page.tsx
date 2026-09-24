import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/axios';
import { MemberSearch } from '../circulation/member-search';
import { Member } from '../../../services/members.service';

export const FineManagementPage: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [fines, setFines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFines = async (memberId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/fines/member/${memberId}`);
      setFines(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred while fetching member fines.');
      setFines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMember) {
      fetchFines(selectedMember.id);
    } else {
      setFines([]);
      setError(null);
    }
  }, [selectedMember]);

  const handlePay = async (referenceId: string, referenceType: string, amount: number) => {
    if (window.confirm(`Are you sure you want to record a payment of ₹${amount}?`)) {
       try {
         await apiClient.post('/fines/pay', { referenceId, referenceType, amount });
         alert('Payment successfully recorded!');
         if (selectedMember) fetchFines(selectedMember.id);
       } catch(e: any) {
         alert('Error recording payment: ' + (e.response?.data?.message || 'Unknown error'));
       }
    }
  };

  const handleWaive = async (referenceId: string, referenceType: string, amount: number) => {
    const reason = window.prompt(`Please provide a reason for waiving ₹${amount}:`);
    if (reason) {
       try {
         await apiClient.post('/fines/waive', { referenceId, referenceType, amount, reason });
         alert('Waiver successfully applied!');
         if (selectedMember) fetchFines(selectedMember.id);
       } catch(e: any) {
         alert('Error applying waiver: ' + (e.response?.data?.message || 'Unknown error'));
       }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Fine Management Workspace</h1>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">Member Fine Lookup</h3>
        <div className="max-w-md">
          <MemberSearch onSelect={setSelectedMember} />
        </div>
      </div>

      {error && <div className="text-red-500 font-semibold">{error}</div>}

      {!loading && !error && fines.length === 0 && selectedMember && (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
          No outstanding fines found for this member.
        </div>
      )}

      {fines.length > 0 && (
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">Outstanding Member Fines</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-sm text-muted-foreground">
                  <th className="p-3">Reference ID</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Original Fine</th>
                  <th className="p-3">Remaining Balance</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((fine, idx) => {
                   const balance = fine.amount - (fine.paidAmount || 0) - (fine.waivedAmount || 0);
                   if (balance <= 0) return null;

                   return (
                     <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-mono text-sm">{fine.referenceId}</td>
                        <td className="p-3">
                           <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${fine.type === 'LOST_CHARGE' ? 'border-transparent bg-red-600 text-white shadow hover:bg-red-700/80' : 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80'}`}>
                              {fine.type}
                           </span>
                        </td>
                        <td className="p-3 text-red-600 font-medium">₹{fine.amount.toFixed(2)}</td>
                        <td className="p-3 font-bold">₹{balance.toFixed(2)}</td>
                        <td className="p-3 flex gap-2">
                           <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white hover:bg-indigo-700 shadow h-8 rounded-md px-3" onClick={() => handlePay(fine.referenceId, fine.type, balance)}>Pay Full</button>
                           <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground shadow-sm h-8 rounded-md px-3" onClick={() => handleWaive(fine.referenceId, fine.type, balance)}>Waive</button>
                        </td>
                     </tr>
                   )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
