import { saveAs } from 'file-saver';

export const exportNotes = (notes) => {
  const data = JSON.stringify(notes, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  saveAs(blob, 'notes_export.js:on')
};