import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const VoiceInput = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    let recognition = null;

    const initRecognition = () => {
      if (!('webkitSpeechRecognition' in window)) {
        setError('متصفحك لا يدعم خاصية التعرف على الصوت');
        return null;
      }

      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA'; // تعيين اللغة العربية

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
        onTranscript(transcriptText);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError('حدث خطأ في التعرف على الصوت');
        setIsListening(false);
      };

      return recognition;
    };

    if (isListening) {
      recognition = initRecognition();
      if (recognition) {
        recognition.start();
      }
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, onTranscript]);

  const toggleListening = useCallback(() => {
    setIsListening(prev => !prev);
    setError(null);
  }, []);

  return (
    <div className="space-y-2">
      <button
        onClick={toggleListening}
        className={`p-2 rounded text-white transition-colors ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600'
        }`}
        disabled={!!error}
      >
        {isListening ? 'إيقاف التسجيل' : 'بدء التسجيل'}
      </button>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      {transcript && (
        <p className="text-gray-600 text-sm mt-2">
          النص المسجل: {transcript}
        </p>
      )}
    </div>
  );
};

VoiceInput.propTypes = {
  onTranscript: PropTypes.func.isRequired
};

export default React.memo(VoiceInput);