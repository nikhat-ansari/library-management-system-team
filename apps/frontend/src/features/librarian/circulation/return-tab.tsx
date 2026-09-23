import React, { useState } from 'react';
import { circulationService } from '../../../services/circulation.service';

export function ReturnTab() {
  const [barcode, setBarcode] = useState('');
  const [condition, setCondition] = useState<'NORMAL' | 'LOST' | 'DAMAGED'>('NORMAL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await circulationService.returnBook({
        copyBarcode: barcode.trim(),
        condition: condition === 'NORMAL' ? undefined : condition,
      });
      setSuccess(
        `Successfully returned copy "${barcode.trim()}". Status: ${data.status}. ${
          data.fineAmount && data.fineAmount > 0 ? `Fine assessed: $${data.fineAmount}` : 'No fines assessed.'
        }`
      );
      setBarcode('');
      setCondition('NORMAL');
    } catch (err: any) {
      setError(err.message || 'Failed to return book. Verify the barcode is correct and issued.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 border border-slate-200">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-slate-900">Return Book</h3>
            <p className="mt-1 text-sm text-slate-500">
              Process a book return and record its physical condition.
            </p>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form onSubmit={handleReturn} className="space-y-6">
              <div>
                <label htmlFor="barcode" className="block text-sm font-medium leading-6 text-slate-900">
                  Book Copy Barcode
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="e.g. BC-987654321"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900 mb-3">Return Condition</label>
                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-3 sm:gap-x-4">
                  <label
                    className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
                      condition === 'NORMAL' ? 'border-indigo-600 ring-2 ring-indigo-600' : 'border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value="NORMAL"
                      className="sr-only"
                      checked={condition === 'NORMAL'}
                      onChange={() => setCondition('NORMAL')}
                    />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className="block text-sm font-medium text-slate-900">Normal</span>
                        <span className="mt-1 flex items-center text-sm text-slate-500">Good condition</span>
                      </span>
                    </span>
                    <svg className={`h-5 w-5 text-indigo-600 ${condition === 'NORMAL' ? 'block' : 'hidden'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                  </label>

                  <label
                    className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
                      condition === 'DAMAGED' ? 'border-red-600 ring-2 ring-red-600' : 'border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value="DAMAGED"
                      className="sr-only"
                      checked={condition === 'DAMAGED'}
                      onChange={() => setCondition('DAMAGED')}
                    />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className="block text-sm font-medium text-slate-900">Damaged</span>
                        <span className="mt-1 flex items-center text-sm text-slate-500">Needs repair</span>
                      </span>
                    </span>
                    <svg className={`h-5 w-5 text-red-600 ${condition === 'DAMAGED' ? 'block' : 'hidden'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                  </label>

                  <label
                    className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
                      condition === 'LOST' ? 'border-orange-600 ring-2 ring-orange-600' : 'border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value="LOST"
                      className="sr-only"
                      checked={condition === 'LOST'}
                      onChange={() => setCondition('LOST')}
                    />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className="block text-sm font-medium text-slate-900">Lost</span>
                        <span className="mt-1 flex items-center text-sm text-slate-500">Report missing</span>
                      </span>
                    </span>
                    <svg className={`h-5 w-5 text-orange-600 ${condition === 'LOST' ? 'block' : 'hidden'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                  </label>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Return Failed</h3>
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
                  disabled={!barcode.trim() || loading}
                  className="inline-flex justify-center rounded-md bg-indigo-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? 'Processing...' : 'Return Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
