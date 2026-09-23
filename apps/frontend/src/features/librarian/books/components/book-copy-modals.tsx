import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookCopiesService } from '../../../../services/book-copies.service';
import { CopyStatus, BookCopy, ChargeRecord } from '../../../../types/book-copies';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  copy?: BookCopy;
  bookId: string;
}

export function AddEditCopyModal({ isOpen, onClose, copy, bookId }: ModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    accessionNumber: copy?.accessionNumber || '',
    barcode: copy?.barcode || '',
    condition: copy?.condition || ''
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => copy 
      ? bookCopiesService.update(copy._id, formData)
      : bookCopiesService.create(bookId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-copies', bookId] });
      onClose();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to save copy')
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{copy ? 'Edit Copy' : 'Add Physical Copy'}</h3>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Accession Number</label>
            <input type="text" required value={formData.accessionNumber} onChange={e => setFormData({...formData, accessionNumber: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Barcode (Optional)</label>
            <input type="text" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Condition (Optional)</label>
            <input type="text" value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50">
            {mutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StatusModal({ isOpen, onClose, copy, bookId }: ModalProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(copy?.status || CopyStatus.AVAILABLE);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => bookCopiesService.updateStatus(copy!._id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-copies', bookId] });
      onClose();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to update status')
  });

  if (!isOpen || !copy) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Status</h3>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">New Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as CopyStatus)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
            <option value={CopyStatus.AVAILABLE}>Available</option>
            <option value={CopyStatus.ISSUED}>Issued</option>
            <option value={CopyStatus.RESERVED}>Reserved</option>
            <option value={CopyStatus.MAINTENANCE}>Maintenance</option>
          </select>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50">
            {mutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LostDamagedModal({ isOpen, onClose, copy, bookId }: ModalProps) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<'LOST' | 'DAMAGED'>('LOST');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => bookCopiesService.reportLostDamaged(copy!._id, { type, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-copies', bookId] });
      onClose();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to report')
  });

  if (!isOpen || !copy) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Report Lost or Damaged</h3>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
        
        <div className="p-3 mb-4 bg-yellow-50 text-yellow-800 text-sm rounded-md border border-yellow-200">
          <strong>Warning:</strong> Applying this status will automatically incur the configured system charge against the patron's account.
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select value={type} onChange={e => setType(e.target.value as any)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
              <option value="LOST">Lost</option>
              <option value="DAMAGED">Damaged</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reason / Notes</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" rows={3}></textarea>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50">
            {mutation.isPending ? 'Processing...' : 'Confirm Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FoundModal({ isOpen, onClose, copy, bookId }: ModalProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => bookCopiesService.reportFound(copy!._id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-copies', bookId] });
      onClose();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to report found')
  });

  if (!isOpen || !copy) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-green-600 mb-4">Restore Found Copy</h3>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
        
        <div className="p-3 mb-4 bg-green-50 text-green-800 text-sm rounded-md border border-green-200">
          This will restore the copy to 'Available' status and automatically reverse the previously applied charge.
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Reason / Notes</label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" rows={3}></textarea>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50">
            {mutation.isPending ? 'Processing...' : 'Restore Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function HistoryModal({ isOpen, onClose, copy }: ModalProps) {
  if (!isOpen || !copy) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Charge & Adjustment History</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        {(!copy.chargeHistory || copy.chargeHistory.length === 0) ? (
          <p className="text-sm text-gray-500 text-center py-8">No history records found for this copy.</p>
        ) : (
          <div className="space-y-4">
            {(copy.chargeHistory || []).map((record: ChargeRecord) => (
              <div key={record.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border border-gray-100 rounded-lg bg-gray-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${record.type === 'CHARGE' ? 'bg-red-50 text-red-700 ring-red-600/10' : 'bg-green-50 text-green-700 ring-green-600/10'}`}>
                      {record.type}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{record.workflow} Workflow</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{record.reason}</p>
                  <p className="mt-1 text-xs text-gray-400">{new Date(record.createdAt).toLocaleString()} • Actor: {record.actorId}</p>
                </div>
                <div className={`mt-2 sm:mt-0 text-lg font-bold ${record.amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {record.amount > 0 ? '+' : ''}{record.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
