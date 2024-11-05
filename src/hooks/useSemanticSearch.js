import { useState, useCallback } from 'react';
import { semanticSearch } from '../services/semanticService';
import { useDebounce } from './useDebounce';
import { useApp } from '../contexts/AppContext';
import { APP_CONFIG } from '../config/constants';

export const useSemanticSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { dispatch } = useApp();

  // البحث مع تأخير لتحسين الأداء
  const searchWithDebounce = useDebounce(async (query, options = {}) => {
    if (!query?.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await semanticSearch(query, {
        limit: options.limit || 10,
        threshold: options.threshold || 0.7,
        filter: options.filter,
        includeMetadata: true
      });

      setResults(searchResults);
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'حدث خطأ أثناء البحث' 
      });
    } finally {
      setLoading(false);
    }
  }, 300);

  // البحث في الملاحظات
  const searchNotes = useCallback(async (query, options = {}) => {
    await searchWithDebounce(query, {
      ...options,
      filter: {
        type: 'note',
        ...options.filter
      }
    });
  }, [searchWithDebounce]);

  // البحث في التصنيفات
  const searchCategories = useCallback(async (query, options = {}) => {
    await searchWithDebounce(query, {
      ...options,
      filter: {
        type: 'category',
        ...options.filter
      }
    });
  }, [searchWithDebounce]);

  // البحث في الوسوم
  const searchTags = useCallback(async (query, options = {}) => {
    await searchWithDebounce(query, {
      ...options,
      filter: {
        type: 'tag',
        ...options.filter
      }
    });
  }, [searchWithDebounce]);

  // تصفية النتائج
  const filterResults = useCallback((filterFn) => {
    return results.filter(filterFn);
  }, [results]);

  // ترتيب النتائج
  const sortResults = useCallback((sortFn) => {
    return [...results].sort(sortFn);
  }, [results]);

  return {
    results,
    loading,
    searchNotes,
    searchCategories,
    searchTags,
    filterResults,
    sortResults
  };
};