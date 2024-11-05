import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useNoteStorage } from '../hooks/useNoteStorage';
import LoadingSpinner from '../components/LoadingSpinner';
import TagInput from '../components/TagInput';

const NoteDetail = ({ showNotification }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getNote, updateNote, deleteNote } = useNoteStorage();
  const [note, setNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const fetchedNote = await getNote(parseInt(id));
        if (!fetchedNote) {
          throw new Error('الملاحظة غير موجودة');
        }
        setNote(fetchedNote);
      } catch (error) {
        showNotification(error.message, 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, getNote, navigate, showNotification]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNote(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateNote(note);
      setIsEditing(false);
      showNotification('تم تحديث الملاحظة بنجاح', 'success');
    } catch (error) {
      showNotification('حدث خطأ أثناء تحديث الملاحظة', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
      try {
        await deleteNote(note.id);
        showNotification('تم حذف الملاحظة بنجاح', 'success');
        navigate('/');
      } catch (error) {
        showNotification('حدث خطأ أثناء حذف الملاحظة', 'error');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          to="/" 
          className="text-blue-500 hover:text-blue-600 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          العودة إلى الملاحظات
        </Link>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="siteName"
            value={note.siteName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="url"
            name="siteUrl"
            value={note.siteUrl}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            name="description"
            value={note.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            rows="4"
          />
          <TagInput 
            tags={note.tags} 
            setTags={(tags) => setNote(prev => ({ ...prev, tags }))}
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 text-white rounded
                ${saving ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              إلغاء
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{note.siteName}</h1>
            <div className="space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                تعديل
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                حذف
              </button>
            </div>
          </div>
          
          <a 
            href={note.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline block mb-4"
          >
            {note.siteUrl}
          </a>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
            {note.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {note.tags?.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900 
                         text-blue-800 dark:text-blue-200 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

NoteDetail.propTypes = {
  showNotification: PropTypes.func.isRequired
};

export default NoteDetail;