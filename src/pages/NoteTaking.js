import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import NoteForm from '../components/NoteForm';
import CategorySelector from '../components/CategorySelector';

const INITIAL_FILTERS = {
  category: '',
  sortBy: 'date',
  sortOrder: 'desc'
};

const NoteTaking = ({ showNotification }) => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">تدوين ملاحظة جديدة</h1>
        <CategorySelector
          selectedCategory={filters.category}
          onSelect={(category) => handleFilterChange('category', category)}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <NoteForm 
          showNotification={showNotification}
          initialCategory={filters.category}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
        >
          <option value="date">تاريخ الإنشاء</option>
          <option value="title">العنوان</option>
          <option value="category">التصنيف</option>
        </select>
        <button
          onClick={() => handleFilterChange('sortOrder', 
            filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 
                   dark:hover:bg-gray-600"
        >
          {filters.sortOrder === 'asc' ? '⬆️' : '⬇️'}
        </button>
      </div>
    </div>
  );
};

NoteTaking.propTypes = {
  showNotification: PropTypes.func.isRequired
};

export default NoteTaking;