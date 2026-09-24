import React, { useState, useEffect } from 'react';
import { MemberSearch } from './member-search';
import { BookSearch } from './book-search';
import { Member } from '../../../services/members.service';
import { circulationService } from '../../../services/circulation.service';
import { bookCopiesService } from '../../../services/book-copies.service';
import { Book } from '../../../types/books';
import { BookCopy } from '../../../types/book-copies';

export function IssueTab() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [availableCopies, setAvailableCopies] = useState<BookCopy[]>([]);
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingCopies, setFetchingCopies] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (selectedBook) {
      const fetchCopies = async () => {
        setFetchingCopies(true);
        try {
          const response = await bookCopiesService.findByBookId(selectedBook._id);
          const available = response.copies.filter((c: BookCopy) => c.status === 'Available');
          setAvailableCopies(available);
          if (available.length > 0) {
            setBarcode(available[0].barcode || '');
          } else {
            setBarcode('');
          }
        } catch (err) {
          console.error('Failed to fetch copies', err);
          setAvailableCopies([]);
          setBarcode('');
        } finally {
          setFetchingCopies(false);
        }
      };
      fetchCopies();
    } else {
      setAvailableCopies([]);
      setBarcode('');
    }
  }, [selectedBook]);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !barcode.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await circulationService.issueBook({
        memberId: selectedMember.id,
        copyBarcode: barcode.trim(),
      });
      setSuccess(`Successfully issued book with barcode "${barcode.trim()}" to ${selectedMember.name}.`);
      setBarcode('');
      setSelectedBook(null); // Reset book selection
    } catch (err: any) {
      setError(err.message || 'Failed to issue book. Please verify the barcode and member status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 border border-slate-200">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-slate-900">Issue Book</h3>
            <p className="mt-1 text-sm text-slate-500">
              Select a member, search for a book, and select an available copy to issue it.
            </p>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form onSubmit={handleIssue} className="space-y-6">
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Member</label>
                <div className="mt-2">
                  <MemberSearch onSelect={setSelectedMember} />
                </div>
                {selectedMember && selectedMember.status !== 'active' && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="mr-1.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                    Warning: This member's account is currently not active.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Book</label>
                <div className="mt-2">
                  {!selectedBook ? (
                    <BookSearch onSelect={setSelectedBook} />
                  ) : (
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                          {selectedBook.title.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{selectedBook.title}</p>
                          <p className="text-xs text-slate-500">{selectedBook.isbn || 'No ISBN'}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedBook(null)}
                        className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {selectedBook && (
                <div>
                  <label htmlFor="barcode" className="block text-sm font-medium leading-6 text-slate-900">
                    Available Book Copy
                  </label>
                  <div className="mt-2">
                    {fetchingCopies ? (
                      <div className="text-sm text-slate-500">Loading available copies...</div>
                    ) : availableCopies.length > 0 ? (
                      <select
                        id="barcode"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        required
                      >
                        {availableCopies.map((copy) => (
                          <option key={copy._id} value={copy.barcode}>
                            {copy.barcode} {copy.accessionNumber ? `(${copy.accessionNumber})` : ''} - {copy.condition}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-red-500">No available copies for this book.</div>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Issue Failed</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Success</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>{success}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!selectedMember || !barcode.trim() || loading}
                  className="inline-flex justify-center rounded-md bg-indigo-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? 'Processing...' : 'Issue Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
