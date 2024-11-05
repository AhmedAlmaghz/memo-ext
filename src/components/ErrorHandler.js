import React from 'react';
import PropTypes from 'prop-types';
import { useApp } from '../contexts/AppContext';

const ErrorHandler = ({ error }) => {
  const { dispatch } = useApp();

  const handleRetry = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
    window.location.reload();
  };

  const handleDismiss = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  if (!error) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-xl font-bold text-red-600 mb-4">
          حدث خطأ
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'}
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            تجاهل
          </button>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    </div>
  );
};

ErrorHandler.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string,
    code: PropTypes.string
  })
};

export default ErrorHandler; 