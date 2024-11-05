import { useState, useEffect } from 'react';
import { openDB } from 'idb';
import { measurePerformance } from '../utils/performance';

const DB_NAME = 'NotesDB';
const STORE_NAME = 'notes';

const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    },
  });
};

export const useNoteStorage = () => {
  const [db, setDB] = useState(null);

  useEffect(() => {
    const setup = async () => {
      const database = await initDB();
      setDB(database);
    };
    setup();
  }, []);

  const saveNote = async (note) => {
    return measurePerformance('saveNote', async () => {
      if (!db) return;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const id = await store.add(note);
      await tx.done;
      return id;
    });
  };

  const getNotes = async () => {
    return measurePerformance('getNotes', async () => {
      if (!db) return [];
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      return store.getAll();
    });
  };

  const getNote = async (id) => {
    return measurePerformance('getNote', async () => {
      if (!db) return null;
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      return store.get(id);
    });
  };

  const updateNote = async (note) => {
    return measurePerformance('updateNote', async () => {
      if (!db) return;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      await store.put(note);
      await tx.done;
    });
  };

  const deleteNote = async (id) => {
    return measurePerformance('deleteNote', async () => {
      if (!db) return;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      await store.delete(id);
      await tx.done;
    });
  };

  return { saveNote, getNotes, getNote, updateNote, deleteNote };
};