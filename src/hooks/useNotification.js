import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    setNotification({ message, type, duration });
    setTimeout(() => {
      setNotification(null);
    }, duration);
  }, []);

  return { notification, showNotification };
};