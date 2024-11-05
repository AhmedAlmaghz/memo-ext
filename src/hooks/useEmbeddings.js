import { useState, useCallback } from 'react';
import { initEmbeddings, getCurrentProviderInfo } from '../services/embeddingsService';

export const useEmbeddings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentProvider, setCurrentProvider] = useState(() => getCurrentProviderInfo());

  const changeEmbeddingsProvider = useCallback(async (provider) => {
    setLoading(true);
    setError(null);
    try {
      await initEmbeddings(provider);
      setCurrentProvider(getCurrentProviderInfo());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    currentProvider,
    changeEmbeddingsProvider
  };
}; 