import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSemanticSearch } from '../hooks/useSemanticSearch';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import LoadingSpinner from '../components/LoadingSpinner';

const ITEMS_PER_PAGE = 10;

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { searchNotes } = useSemanticSearch();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const loadMoreItems = useCallback(() => {
    if (!loading) {
      setPage(prev => prev + 1);
    }
  }, [loading]);

  const [isFetching, setIsFetching] = useInfiniteScroll(loadMoreItems);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchTerm) {
        setLoading(true);
        try {
          const searchResults = await searchNotes(debouncedSearchTerm);
          setResults(searchResults.slice(0, page * ITEMS_PER_PAGE));
        } catch (error) {
          console.error('خطأ في البحث:', error);
        } finally {
          setLoading(false);
          setIsFetching(false);
        }
      } else {
        setResults([]);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, searchNotes, page, setIsFetching]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 shadow-md z-10">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ابحث في ملاحظاتك..."
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 
                   dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {loading && results.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          {results.map((note) => (
            <Link
              key={note.id}
              to={`/note/${note.id}`}
              className="block p-4 bg-white dark:bg-gray-700 rounded-lg shadow 
                       hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                {note.favicon && (
                  <img
                    src={note.favicon}
                    alt=""
                    className="w-6 h-6 mt-1"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{note.siteName}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {note.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {note.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900 
                                 text-blue-800 dark:text-blue-200 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    التطابق: {(note.similarity * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </Link>
          ))}

          {isFetching && (
            <div className="text-center py-4">
              <LoadingSpinner />
            </div>
          )}

          {!loading && results.length === 0 && searchTerm && (
            <p className="text-center text-gray-500 dark:text-gray-400">
              لم يتم العثور على نتائج
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;