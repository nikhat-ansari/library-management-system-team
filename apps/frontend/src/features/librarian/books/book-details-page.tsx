import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { booksService } from '../../../services/books.service';
import { referenceDataService } from '../../../services/reference-data.service';
import { bookCopiesService } from '../../../services/book-copies.service';
import { LibrarianLayout } from '../librarian-layout';
import { BookCopiesSection } from './components/book-copies-section';

export function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: book, isLoading: bookLoading, error: bookError } = useQuery({
    queryKey: ['book', id],
    queryFn: () => booksService.findOne(id!),
    enabled: !!id,
  });

  const { data: copiesData } = useQuery({
    queryKey: ['book-copies', id],
    queryFn: () => bookCopiesService.findByBookId(id!),
    enabled: !!id,
  });

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: referenceDataService.getCategories,
  });

  const { data: authors, isLoading: authLoading } = useQuery({
    queryKey: ['authors'],
    queryFn: referenceDataService.getAuthors,
  });

  const { data: publishers, isLoading: pubLoading } = useQuery({
    queryKey: ['publishers'],
    queryFn: referenceDataService.getPublishers,
  });

  if (bookLoading || catLoading || authLoading || pubLoading) {
    return (
      <LibrarianLayout>
        <div className="p-12 text-center animate-pulse">Loading details...</div>
      </LibrarianLayout>
    );
  }

  if (bookError || !book) {
    return (
      <LibrarianLayout>
        <div className="rounded-md bg-red-50 p-4 max-w-2xl mx-auto mt-6">
          <h3 className="text-sm font-medium text-red-800">Failed to load book</h3>
          <button onClick={() => navigate('/librarian/books')} className="mt-2 text-sm text-red-700 underline">Return to books</button>
        </div>
      </LibrarianLayout>
    );
  }

  const categoryName = categories?.find(c => c._id === book.categoryId)?.name || book.categoryId;
  const authorName = authors?.find(a => a._id === book.authorId)?.name || book.authorId;
  const publisherName = publishers?.find(p => p._id === book.publisherId)?.name || book.publisherId;

  return (
    <LibrarianLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/librarian/books" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{book.title}</h1>
                {copiesData !== undefined && (
                  <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${copiesData.titleAvailable ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
                    {copiesData.titleAvailable ? 'Available' : 'Unavailable'}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">ISBN: {book.isbn}</p>
            </div>
          </div>
          <Link
            to={`/librarian/books/${book._id}/edit`}
            className="inline-flex justify-center items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Edit Book
          </Link>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <h3 className="text-base font-semibold leading-7 text-gray-900">Catalogue Information</h3>
          </div>
          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Title</dt>
                <dd className="mt-1 text-sm text-gray-900 font-medium">{book.title}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">ISBN</dt>
                <dd className="mt-1 text-sm text-gray-900">{book.isbn}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">{categoryName}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Author</dt>
                <dd className="mt-1 text-sm text-gray-900">{authorName}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Publisher</dt>
                <dd className="mt-1 text-sm text-gray-900">{publisherName}</dd>
              </div>
            </dl>
          </div>

          <div className="px-6 py-5 border-y border-gray-100 bg-gray-50">
            <h3 className="text-base font-semibold leading-7 text-gray-900">Acquisition Details</h3>
          </div>
          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Acquisition Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{book.acquisition?.type || 'N/A'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Acquisition Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{book.acquisition?.acquisitionDate ? new Date(book.acquisition.acquisitionDate).toLocaleDateString() : 'N/A'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Cost</dt>
                <dd className="mt-1 text-sm text-gray-900">${book.acquisition?.cost?.toFixed(2) || '0.00'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Vendor / Source</dt>
                <dd className="mt-1 text-sm text-gray-900">{book.acquisition?.vendorOrSource || 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </div>

        <BookCopiesSection bookId={book._id} />
      </div>
    </LibrarianLayout>
  );
}
