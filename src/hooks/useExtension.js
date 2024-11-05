import { useEffect, useCallback } from 'react';
import { useNoteStorage } from './useNoteStorage';
import { useNotification } from './useNotification';

export const useExtension = () => {
  const { saveNote } = useNoteStorage();
  const { showNotification } = useNotification();

  // معالجة الرسائل من contentScript
  const handleMessage = useCallback(async (request) => {
    if (request.action === 'openSidePanel') {
      try {
        if (request.data) {
          const note = {
            type: request.data.type || 'page',
            content: request.data.content || '',
            url: request.data.url,
            title: request.data.title,
            source: request.data.source,
            timestamp: new Date().toISOString()
          };
          
          await saveNote(note);
          showNotification('تم حفظ المحتوى بنجاح', 'success');
        }
      } catch (error) {
        showNotification('فشل في حفظ المحتوى', 'error');
      }
    }
  }, [saveNote, showNotification]);

  useEffect(() => {
    // الاستماع لرسائل الإضافة
    if (chrome?.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(handleMessage);
      return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }
  }, [handleMessage]);

  // إرسال رسالة للإضافة
  const sendMessage = useCallback((message) => {
    if (chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage(message);
    }
  }, []);

  return { sendMessage };
}; 