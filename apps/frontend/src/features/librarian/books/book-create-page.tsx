import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksService } from '../../../services/books.service';
import { referenceDataService } from '../../../services/reference-data.service';
import type { CreateBookDto, Book } from '../../../types/books';
import { LibrarianLayout } from '../librarian-layout';

export function BookCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: referenceDataService.getCategories });
  const { data: authors } = useQuery({ queryKey: ['authors'], queryFn: referenceDataService.getAuthors });
  const { data: publishers } = useQuery({ queryKey: ['publishers'], queryFn: referenceDataService.getPublishers });

  const [formData, setFormData] = useState<CreateBookDto>({
    title: '',
    isbn: '',
    categoryId: '',
    authorId: '',
    publisherId: '',
    acquisition: {
      type: 'PURCHASED',
      acquisitionDate: new Date().toISOString().split('T')[0],
      cost: 0,
      vendorOrSource: ''
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBookDto) => booksService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      navigate('/librarian/books');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create book');
    }
  });

  const duplicateCheckMutation = useMutation({
    mutationFn: () => booksService.duplicateCheck(formData.title, formData.isbn),
    onSuccess: (data) => {
      if ((data.candidates && data.candidates.length > 0) || (data.aiCandidates && data.aiCandidates.length > 0)) {
        setDuplicateWarning(data);
      } else {
        executeCreate();
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed duplicate check');
    }
  });

  const aiSuggestMutation = useMutation({
    mutationFn: () => booksService.suggestMetadata(formData.title, formData.isbn),
    onSuccess: (suggestion) => {
      if (suggestion.fallback) {
        setError(suggestion.message);
        return;
      }
      setFormData(prev => ({
        ...prev,
        title: suggestion.suggestedTitle || prev.title,
        isbn: suggestion.suggestedIsbn || prev.isbn,
        categoryId: categories?.find(c => c.name.toLowerCase().includes(suggestion.suggestedCategory?.toLowerCase() || ''))?._id || prev.categoryId,
      }));
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'AI suggestion failed');
    }
  });

  const executeCreate = () => {
    createMutation.mutate({
      ...formData,
      acquisition: {
        ...formData.acquisition,
        acquisitionDate: new Date(formData.acquisition.acquisitionDate).toISOString()
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDuplicateWarning(null);
    duplicateCheckMutation.mutate();
  };

  const confirmSaveWithDuplicates = () => {
    setDuplicateWarning(null);
    executeCreate();
  };

  const handleAiSuggest = () => {
    if (!formData.title && !formData.isbn) {
      setError('Please provide at least a title or ISBN for AI suggestion.');
      return;
    }
    setError(null);
    aiSuggestMutation.mutate();
  };

  return (
    <LibrarianLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <Link to="/librarian/books" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Book</h1>
            <p className="text-sm text-gray-500 mt-1">Enter the book details or use AI to auto-fill metadata.</p>
          </div>
        </div>

        {duplicateWarning && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 w-full">
                <h3 className="text-sm font-semibold text-amber-800">Duplicate Warning</h3>
                <p className="mt-1 text-sm text-amber-700">{duplicateWarning.message}</p>
                
                {duplicateWarning.candidates?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">Exact Matches</p>
                    <ul className="space-y-2">
                      {duplicateWarning.candidates.map((c: any) => (
                        <li key={c._id} className="bg-white/50 px-3 py-2 rounded border border-amber-200 text-sm flex justify-between">
                          <span className="font-medium text-amber-900">{c.title}</span>
                          <span className="text-amber-700 font-mono text-xs">{c.isbn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {duplicateWarning.aiCandidates?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">AI Suggestions</p>
                    <ul className="space-y-2">
                      {duplicateWarning.aiCandidates.map((c: any, i: number) => (
                        <li key={i} className="bg-white/50 px-3 py-2 rounded border border-amber-200 text-sm">
                          <span className="font-medium text-amber-900">{c.title}</span>
                          <p className="text-amber-700 text-xs mt-0.5">{c.reason}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setDuplicateWarning(null)}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Cancel Edit
                  </button>
                  <button
                    onClick={confirmSaveWithDuplicates}
                    className="inline-flex items-center rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500"
                  >
                    Proceed and Save Anyway
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={`bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-2xl overflow-hidden transition-opacity ${duplicateWarning ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{typeof error === 'string' ? error : JSON.stringify(error)}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">Title</label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="isbn" className="block text-sm font-medium leading-6 text-gray-900">ISBN</label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="isbn"
                    id="isbn"
                    required
                    value={formData.isbn}
                    onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={aiSuggestMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-md bg-purple-50 px-3 py-2 text-sm font-semibold text-purple-700 shadow-sm ring-1 ring-inset ring-purple-300 hover:bg-purple-100 disabled:opacity-50 transition-colors"
                >
                  {aiSuggestMutation.isPending ? (
                    <svg className="animate-spin h-4 w-4 text-purple-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  )}
                  AI Auto-Fill Metadata
                </button>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="categoryId" className="block text-sm font-medium leading-6 text-gray-900">Category</label>
                <div className="mt-2">
                  <select
                    id="categoryId"
                    name="categoryId"
                    required
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  >
                    <option value="">Select a category</option>
                    {categories?.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="authorId" className="block text-sm font-medium leading-6 text-gray-900">Author</label>
                <div className="mt-2">
                  <select
                    id="authorId"
                    name="authorId"
                    required
                    value={formData.authorId}
                    onChange={e => setFormData({ ...formData, authorId: e.target.value })}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  >
                    <option value="">Select an author</option>
                    {authors?.map(a => (
                      <option key={a._id} value={a._id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="publisherId" className="block text-sm font-medium leading-6 text-gray-900">Publisher</label>
                <div className="mt-2">
                  <select
                    id="publisherId"
                    name="publisherId"
                    required
                    value={formData.publisherId}
                    onChange={e => setFormData({ ...formData, publisherId: e.target.value })}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  >
                    <option value="">Select a publisher</option>
                    {publishers?.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6 border-t border-gray-100 pt-6 mt-2">
                <h3 className="text-sm font-medium leading-6 text-gray-900 mb-4">Acquisition Details</h3>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="acqType" className="block text-sm font-medium leading-6 text-gray-900">Type</label>
                <div className="mt-2">
                  <select
                    id="acqType"
                    name="acqType"
                    value={formData.acquisition.type}
                    onChange={e => setFormData({ ...formData, acquisition: { ...formData.acquisition, type: e.target.value as 'PURCHASED' | 'DONATED' } })}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  >
                    <option value="PURCHASED">Purchased</option>
                    <option value="DONATED">Donated</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="acqDate" className="block text-sm font-medium leading-6 text-gray-900">Date</label>
                <div className="mt-2">
                  <input
                    type="date"
                    name="acqDate"
                    id="acqDate"
                    required
                    value={formData.acquisition.acquisitionDate}
                    onChange={e => setFormData({ ...formData, acquisition: { ...formData.acquisition, acquisitionDate: e.target.value } })}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="cost" className="block text-sm font-medium leading-6 text-gray-900">Cost (₹)</label>
                <div className="mt-2">
                  <input
                    type="number"
                    name="cost"
                    id="cost"
                    min="0"
                    step="0.01"
                    value={formData.acquisition.cost}
                    onChange={e => setFormData({ ...formData, acquisition: { ...formData.acquisition, cost: parseFloat(e.target.value) } })}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="vendor" className="block text-sm font-medium leading-6 text-gray-900">Vendor / Source</label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="vendor"
                    id="vendor"
                    required
                    value={formData.acquisition.vendorOrSource}
                    onChange={e => setFormData({ ...formData, acquisition: { ...formData.acquisition, vendorOrSource: e.target.value } })}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

            </div>
          </div>
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-6 py-4 bg-gray-50">
            <Link to="/librarian/books" className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600 transition-colors">Cancel</Link>
            <button
              type="submit"
              disabled={createMutation.isPending || duplicateCheckMutation.isPending}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-colors"
            >
              {(createMutation.isPending || duplicateCheckMutation.isPending) ? 'Saving...' : 'Save Book'}
            </button>
          </div>
        </form>
      </div>
    </LibrarianLayout>
  );
}
