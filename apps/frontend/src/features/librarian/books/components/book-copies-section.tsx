import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookCopiesService } from '../../../../services/book-copies.service';
import { BookCopy, CopyStatus } from '../../../../types/book-copies';
import { AddEditCopyModal, StatusModal, LostDamagedModal, FoundModal, HistoryModal } from './book-copy-modals';

export function BookCopiesSection({ bookId }: { bookId: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['book-copies', bookId],
    queryFn: () => bookCopiesService.findByBookId(bookId),
    enabled: !!bookId
  });

  const [activeModal, setActiveModal] = useState<'ADD_EDIT' | 'STATUS' | 'LOST' | 'FOUND' | 'HISTORY' | null>(null);
  const [selectedCopy, setSelectedCopy] = useState<BookCopy | undefined>(undefined);

  const archiveMutation = useMutation({
    mutationFn: (id: string) => bookCopiesService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-copies', bookId] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to archive copy');
    }
  });

  const openModal = (modal: typeof activeModal, copy?: BookCopy) => {
    setSelectedCopy(copy);
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedCopy(undefined);
  };

  const getStatusColor = (status: CopyStatus) => {
    switch (status) {
      case CopyStatus.AVAILABLE: return 'bg-green-100 text-green-800 ring-green-600/20';
      case CopyStatus.ISSUED: return 'bg-blue-100 text-blue-800 ring-blue-600/20';
      case CopyStatus.RESERVED: return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
      case CopyStatus.MAINTENANCE: return 'bg-purple-100 text-purple-800 ring-purple-600/20';
      case CopyStatus.LOST: 
      case CopyStatus.DAMAGED: return 'bg-red-100 text-red-800 ring-red-600/20';
      case CopyStatus.ARCHIVED: return 'bg-gray-100 text-gray-800 ring-gray-600/20';
      default: return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Physical Copies</h2>
        <button 
          onClick={() => openModal('ADD_EDIT')}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          Add New Copy
        </button>
      </div>

      {isLoading && <div className="p-8 text-center text-gray-500 animate-pulse">Loading copies...</div>}
      {error && <div className="p-4 text-sm text-red-700 bg-red-50 rounded-md">Failed to load physical copies.</div>}

      {!isLoading && !error && data?.copies.length === 0 && (
        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl">
          <p className="text-sm text-gray-500">No physical copies exist for this book.</p>
        </div>
      )}

      {!isLoading && !error && data && data.copies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.copies.map((copy: BookCopy) => (
            <div key={copy._id} className={`flex flex-col p-5 border rounded-xl shadow-sm ${copy.status === CopyStatus.ARCHIVED ? 'bg-gray-50 opacity-75' : 'bg-white'}`}>
              <div className="flex justify-between items-start mb-3">
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(copy.status)}`}>
                  {copy.status}
                </span>
                <span className="text-xs text-gray-400">ID: {copy._id.slice(-6)}</span>
              </div>
              
              <div className="space-y-1 mb-4 flex-grow">
                <p className="text-sm font-medium text-gray-900">ACC: <span className="font-normal text-gray-600">{copy.accessionNumber}</span></p>
                <p className="text-sm font-medium text-gray-900">BC: <span className="font-normal text-gray-600">{copy.barcode || 'N/A'}</span></p>
                <p className="text-sm font-medium text-gray-900">Condition: <span className="font-normal text-gray-600">{copy.condition || 'N/A'}</span></p>
              </div>

              <div className="border-t border-gray-100 pt-3 flex flex-wrap gap-2">
                <button onClick={() => openModal('ADD_EDIT', copy)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Edit</button>
                <span className="text-gray-300">|</span>
                
                {copy.status !== CopyStatus.ARCHIVED && copy.status !== CopyStatus.LOST && copy.status !== CopyStatus.DAMAGED && (
                  <>
                    <button onClick={() => openModal('STATUS', copy)} className="text-xs font-semibold text-blue-600 hover:text-blue-800">Status</button>
                    <span className="text-gray-300">|</span>
                  </>
                )}

                {copy.status !== CopyStatus.ARCHIVED && copy.status !== CopyStatus.LOST && copy.status !== CopyStatus.DAMAGED && (
                  <>
                    <button onClick={() => openModal('LOST', copy)} className="text-xs font-semibold text-red-600 hover:text-red-800">Report Lost/Damaged</button>
                    <span className="text-gray-300">|</span>
                  </>
                )}

                {(copy.status === CopyStatus.LOST || copy.status === CopyStatus.DAMAGED) && (
                  <>
                    <button onClick={() => openModal('FOUND', copy)} className="text-xs font-semibold text-green-600 hover:text-green-800">Restore Found</button>
                    <span className="text-gray-300">|</span>
                  </>
                )}

                <button onClick={() => openModal('HISTORY', copy)} className="text-xs font-semibold text-gray-600 hover:text-gray-900">History ({copy.chargeHistory?.length || 0})</button>

                {copy.status !== CopyStatus.ARCHIVED && (
                  <>
                    <span className="text-gray-300">|</span>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to archive this copy? It will be removed from circulation permanently.')) {
                          archiveMutation.mutate(copy._id);
                        }
                      }} 
                      className="text-xs font-semibold text-gray-400 hover:text-red-600"
                    >
                      Archive
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddEditCopyModal isOpen={activeModal === 'ADD_EDIT'} onClose={closeModal} copy={selectedCopy} bookId={bookId} />
      <StatusModal isOpen={activeModal === 'STATUS'} onClose={closeModal} copy={selectedCopy} bookId={bookId} />
      <LostDamagedModal isOpen={activeModal === 'LOST'} onClose={closeModal} copy={selectedCopy} bookId={bookId} />
      <FoundModal isOpen={activeModal === 'FOUND'} onClose={closeModal} copy={selectedCopy} bookId={bookId} />
      <HistoryModal isOpen={activeModal === 'HISTORY'} onClose={closeModal} copy={selectedCopy} bookId={bookId} />
    </div>
  );
}
