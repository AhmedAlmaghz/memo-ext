import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const TagInput = ({ tags, setTags }) => {
  const [input, setInput] = useState('');

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const addTag = useCallback((tag) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setInput('');
    }
  }, [tags, setTags]);

  const handleInputKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }, [input, tags, addTag, setTags]);

  const removeTag = useCallback((tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }, [tags, setTags]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span 
            key={tag} 
            className="inline-flex items-center px-3 py-1 rounded-full 
                     text-sm font-medium bg-blue-100 text-blue-800"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
              aria-label={`إزالة الوسم ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="أضف وسماً... (اضغط Enter أو فاصلة للإضافة)"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          aria-label="إدخال وسم جديد"
        />
      </div>
      
      <p className="text-sm text-gray-500">
        اضغط Enter أو فاصلة لإضافة وسم. اضغط Backspace لحذف آخر وسم.
      </p>
    </div>
  );
};

TagInput.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  setTags: PropTypes.func.isRequired
};

export default React.memo(TagInput);