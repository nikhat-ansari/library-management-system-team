import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { booksService } from '../../../services/books.service';
import type { BookQueryDto, PaginatedBooks } from '../../../types/books';
import { LibrarianLayout } from '../librarian-layout';

export function BookListPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState<BookQueryDto>({ page: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['books', query],
    queryFn: () => booksService.findAll(query),
    placeholderData: keepPreviousData,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const exportData = await booksService.exportCatalogue();
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `library-catalogue-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export', err);
      alert('Failed to export catalogue. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <LibrarianLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Book Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage the library's catalog, add new acquisitions, and import books.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex justify-center items-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'Export'}
            </button>
            <Link
              to="/librarian/books/import"
              className="inline-flex justify-center items-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Import CSV
            </Link>
            <Link
              to="/librarian/books/new"
              className="inline-flex justify-center items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 hover:shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Add Book
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
              <input
                type="text"
                placeholder="Search by title or ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
              />
              <button
                type="submit"
                className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            {isError ? (
              <div className="p-12 text-center">
                <p className="text-red-500 font-medium mb-4">{(error as any)?.response?.data?.message || 'Failed to fetch books'}</p>
                <button onClick={() => refetch()} className="text-indigo-600 font-medium">Retry</button>
              </div>
            ) : isLoading ? (
              <div className="p-12 text-center text-gray-500 animate-pulse font-medium">Loading catalog...</div>
            ) : data?.items?.length === 0 ? (
              <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900">No books found</p>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new book to the catalog.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 sm:pl-6">Title</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">ISBN</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Acquisition</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Added On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data?.items?.map((book) => (
                    <tr 
                      key={book._id} 
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/librarian/books/${book._id}`)}
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-indigo-600 sm:pl-6 hover:underline">
                        {book.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          {book.isbn}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {book.acquisition?.type}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {data && data.total > (query.limit || 10) && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setQuery((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                  disabled={(query.page || 1) === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setQuery((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                  disabled={(query.page || 1) * (query.limit || 10) >= data.total}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((query.page || 1) - 1) * (query.limit || 10) + 1}</span> to <span className="font-medium">{Math.min((query.page || 1) * (query.limit || 10), data.total)}</span> of <span className="font-medium">{data.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setQuery((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                      disabled={(query.page || 1) === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      &larr;
                    </button>
                    <button
                      onClick={() => setQuery((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                      disabled={(query.page || 1) * (query.limit || 10) >= data.total}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      &rarr;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LibrarianLayout>
  );
}
