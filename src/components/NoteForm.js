import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNoteStorage } from '../hooks/useNoteStorage';
import VoiceInput from './VoiceInput';
import TagInput from './TagInput';
import AutoCapture from './AutoCapture';

const INITIAL_NOTE_STATE = {
  siteName: '',
  siteUrl: '',
  description: '',
  tags: [],
  category: '',
};

const NoteForm = ({ showNotification }) => {
  const [note, setNote] = useState(INITIAL_NOTE_STATE);
  const [loading, setLoading] = useState(false);
  const { saveNote } = useNoteStorage();

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNote(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveNote(note);
      showNotification('تم حفظ الملاحظة بنجاح', 'success');
      setNote(INITIAL_NOTE_STATE);
    } catch (error) {
      console.error('Error saving note:', error);
      showNotification('حدث خطأ أثناء حفظ الملاحظة', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = useCallback((transcriptText) => {
    setNote(prev => ({
      ...prev,
      description: prev.description + ' ' + transcriptText,
    }));
  }, []);

  const handleAutoCapture = useCallback((info) => {
    setNote(prev => ({
      ...prev,
      siteName: info.siteName,
      siteUrl: info.siteUrl,
    }));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
      <AutoCapture onCapture={handleAutoCapture} />
      <div className="space-y-4">
        <input
          type="text"
          name="siteName"
          value={note.siteName}
          onChange={handleInputChange}
          placeholder="اسم الموقع"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="url"
          name="siteUrl"
          value={note.siteUrl}
          onChange={handleInputChange}
          placeholder="رابط الموقع"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          name="description"
          value={note.description}
          onChange={handleInputChange}
          placeholder="الوصف"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          rows="4"
        />
        <TagInput 
          tags={note.tags} 
          setTags={(tags) => setNote(prev => ({ ...prev, tags }))} 
        />
        <select
          name="category"
          value={note.category}
          onChange={handleInputChange}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        >
          <option value="">اختر التصنيف</option>
          <option value="work">العمل</option>
          <option value="personal">شخصي</option>
          <option value="study">دراسة</option>
        </select>
        <VoiceInput onTranscript={handleVoiceInput} />
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 text-white rounded transition-colors
            ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {loading ? 'جاري الحفظ...' : 'حفظ الملاحظة'}
        </button>
      </div>
    </form>
  );
};

NoteForm.propTypes = {
  showNotification: PropTypes.func.isRequired
};

export default React.memo(NoteForm);