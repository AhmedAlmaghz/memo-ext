import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_CATEGORIES = [
  { id: 'work', label: 'العمل', icon: '💼' },
  { id: 'personal', label: 'شخصي', icon: '👤' },
  { id: 'study', label: 'دراسة', icon: '📚' },
  { id: 'project', label: 'مشروع', icon: '🎯' },
  { id: 'idea', label: 'فكرة', icon: '💡' }
];

const CategorySelector = ({ selectedCategory, onSelect, customCategories = [] }) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState({ label: '', icon: '' });

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  const handleAddCategory = useCallback(() => {
    if (newCategory.label.trim()) {
      const category = {
        id: newCategory.label.toLowerCase().replace(/\s+/g, '-'),
        ...newCategory
      };
      // هنا يمكنك إضافة المنطق لحفظ التصنيف الجديد
      setIsAddingNew(false);
      setNewCategory({ label: '', icon: '' });
    }
  }, [newCategory]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {allCategories.map(category => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`
              flex items-center px-3 py-1 rounded-full transition-colors
              ${selectedCategory === category.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}
            `}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </button>
        ))}
        
        <button
          onClick={() => setIsAddingNew(true)}
          className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 
                   text-gray-700 dark:text-gray-300 hover:bg-gray-300 
                   dark:hover:bg-gray-600"
        >
          + تصنيف جديد
        </button>
      </div>

      {isAddingNew && (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newCategory.label}
            onChange={(e) => setNewCategory(prev => ({ ...prev, label: e.target.value }))}
            placeholder="اسم التصنيف"
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={newCategory.icon}
            onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
            placeholder="رمز"
            className="w-16 p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddCategory}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            إضافة
          </button>
          <button
            onClick={() => setIsAddingNew(false)}
            className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            إلغاء
          </button>
        </div>
      )}
    </div>
  );
};

CategorySelector.propTypes = {
  selectedCategory: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  customCategories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
  }))
};

export default React.memo(CategorySelector); 