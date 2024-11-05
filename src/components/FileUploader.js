import React, { useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const FileUploader = ({ onFileSelect, acceptedTypes = '.pdf,.doc,.docx,.txt', maxSize = 5 }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  const validateFile = useCallback((file) => {
    // التحقق من نوع الملف
    const fileType = file.type;
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const acceptedExtensions = acceptedTypes.split(',');
    
    if (!acceptedExtensions.some(type => 
      type.trim() === fileExtension || fileType.includes(type.trim().replace('.', ''))
    )) {
      throw new Error('نوع الملف غير مدعوم');
    }

    // التحقق من حجم الملف (بالميجابايت)
    if (file.size > maxSize * 1024 * 1024) {
      throw new Error(`حجم الملف يجب أن يكون أقل من ${maxSize} ميجابايت`);
    }

    return true;
  }, [acceptedTypes, maxSize]);

  const handleFile = useCallback((file) => {
    try {
      validateFile(file);
      setError(null);
      onFileSelect(file);
    } catch (err) {
      setError(err.message);
    }
  }, [validateFile, onFileSelect]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  return (
    <div className="space-y-2">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'}
          transition-colors duration-200
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes}
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        />
        
        <div className="text-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-500 hover:text-blue-700"
          >
            اختر ملفاً
          </button>
          <p className="text-gray-500 mt-1">
            أو اسحب وأفلت الملف هنا
          </p>
          <p className="text-sm text-gray-400 mt-2">
            الأنواع المدعومة: {acceptedTypes}
          </p>
          <p className="text-sm text-gray-400">
            الحد الأقصى للحجم: {maxSize} ميجابايت
          </p>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

FileUploader.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  acceptedTypes: PropTypes.string,
  maxSize: PropTypes.number
};

export default React.memo(FileUploader); 