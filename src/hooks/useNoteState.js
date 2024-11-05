import { useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNoteStorage } from './useNoteStorage';
import { useNotification } from './useNotification';

export const useNoteState = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { dispatch } = useApp();
  const { saveNote, deleteNote, updateNote } = useNoteStorage();
  const { showNotification } = useNotification();

  const handleSaveNote = useCallback(async (note) => {
    setLoading(true);
    try {
      const savedNote = await saveNote(note);
      setNotes(prev => [...prev, savedNote]);
      showNotification('تم حفظ الملاحظة بنجاح', 'success');
      return savedNote;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error });
      showNotification('فشل في حفظ الملاحظة', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [saveNote, dispatch, showNotification]);

  // ... المزيد من الوظائف

  return {
    notes,
    loading,
    handleSaveNote,
    // ... باقي الوظائف
  };
}; 