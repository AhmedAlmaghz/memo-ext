import { useNoteStorage } from '../hooks/useNoteStorage';

export const importNotes = async (file, showNotification) => {
  const { saveNote } = useNoteStorage();

  try {
    const content = await file.text();
    const notes = JSON.parse(content);

    for (const note of notes) {
      await saveNote(note);
    }

    showNotification('Data imported successfully', 'success');
  } catch (error) {
    console.error('Error importing data:', error);
    showNotification('Error importing data', 'error');
  }
};