import { useEffect } from 'react';
import { useNoteStorage } from './useNoteStorage';
import { syncNotesToCloud, getNotesFromCloud } from '../services/cloudSyncService';
import { getCurrentUser } from '../services/authService';

export const useCloudSync = () => {
  const { getNotes, saveNote } = useNoteStorage();

  useEffect(() => {
    const syncNotes = async () => {
      const user = await getCurrentUser();
      if (user) {
        const localNotes = await getNotes();
        await syncNotesToCloud(user.uid, localNotes);

        const cloudNotes = await getNotesFromCloud(user.uid);
        for (const note of cloudNotes) {
          await saveNote(note);
        }
      }
    };

    syncNotes();
    // Set up an interval to sync periodically
    const intervalId = setInterval(syncNotes, 5 * 60 * 1000); // Sync every 5 minutes

    return () => clearInterval(intervalId);
  }, [getNotes, saveNote]);
};