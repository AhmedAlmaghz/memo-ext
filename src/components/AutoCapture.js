import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const AutoCapture = ({ onCapture }) => {
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState(null);

  const getBrowser = () => {
    // التحقق من المتصفح المتوفر
    if (typeof chrome !== 'undefined') {
      return chrome;
    }
    if (typeof browser !== 'undefined') {
      return browser; // Firefox
    }
    return null;
  };

  const captureInfo = useCallback(async () => {
    setCapturing(true);
    setError(null);
    
    try {
      const browserAPI = getBrowser();
      
      // التحقق من وجود واجهة برمجة الإضافات
      if (!browserAPI?.tabs) {
        throw new Error('هذه الميزة متاحة فقط في إضافات المتصفح');
      }

      const [tab] = await browserAPI.tabs.query({ 
        active: true, 
        currentWindow: true 
      });

      if (!tab) {
        throw new Error('لا يمكن الوصول إلى التبويب الحالي');
      }

      const info = {
        siteName: tab.title || '',
        siteUrl: tab.url || '',
        favicon: tab.favIconUrl || '',
        timestamp: new Date().toISOString(),
        tabId: tab.id
      };

      onCapture(info);
    } catch (err) {
      setError(err.message);
      console.error('خطأ في التقاط معلومات الموقع:', err);
    } finally {
      setCapturing(false);
    }
  }, [onCapture]);

  return (
    <div className="space-y-2">
      <button
        onClick={captureInfo}
        disabled={capturing}
        className={`
          flex items-center justify-center px-4 py-2 rounded
          ${capturing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600'}
          text-white transition-colors duration-200
        `}
      >
        {capturing ? (
          <>
            <svg 
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            جاري الالتقاط...
          </>
        ) : (
          'التقاط تلقائي'
        )}
      </button>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

AutoCapture.propTypes = {
  onCapture: PropTypes.func.isRequired
};

export default React.memo(AutoCapture);