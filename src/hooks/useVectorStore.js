import { useState, useCallback } from 'react';
import * as vectorStoreService from '../services/vectorStoreService';

export const useVectorStore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // تغيير نوع مخزن المتجهات
  const changeVectorStore = useCallback(async (storeType) => {
    setLoading(true);
    setError(null);
    try {
      await vectorStoreService.initVectorStore(storeType);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // إضافة وثيقة
  const addDocument = useCallback(async (document) => {
    setLoading(true);
    setError(null);
    try {
      const id = await vectorStoreService.addDocument(document);
      return id;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // البحث عن وثائق مشابهة
  const searchSimilar = useCallback(async (query, k = 5) => {
    setLoading(true);
    setError(null);
    try {
      const results = await vectorStoreService.similaritySearch(query, k);
      return results;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // البحث المتقدم
  const searchAdvanced = useCallback(async (query, filter = {}, k = 5) => {
    setLoading(true);
    setError(null);
    try {
      const results = await vectorStoreService.advancedSearch(query, filter, k);
      return results;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    changeVectorStore,
    addDocument,
    searchSimilar,
    searchAdvanced
  };
}; 