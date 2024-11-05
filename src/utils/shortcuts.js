import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { KEYBOARD_SHORTCUTS } from '../config/constants';

export const useShortcuts = () => {
  const navigate = useNavigate();
  const { dispatch } = useApp();

  const handleShortcut = useCallback((event) => {
    // تجاهل الاختصارات عند الكتابة في الحقول النصية
    if (event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' || 
        event.target.isContentEditable) {
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierKey = isMac ? event.metaKey : event.ctrlKey;

    if (modifierKey) {
      switch (event.key.toLowerCase()) {
        case KEYBOARD_SHORTCUTS.NEW_NOTE.key:
          event.preventDefault();
          navigate('/');
          break;

        case KEYBOARD_SHORTCUTS.SEARCH.key:
          event.preventDefault();
          navigate('/search');
          break;

        case KEYBOARD_SHORTCUTS.SETTINGS.key:
          event.preventDefault();
          navigate('/settings');
          break;

        case KEYBOARD_SHORTCUTS.QUICK_SEARCH.key:
          event.preventDefault();
          dispatch({ 
            type: 'UPDATE_UI', 
            payload: { quickSearchOpen: true } 
          });
          break;

        case KEYBOARD_SHORTCUTS.EXPORT.key:
          event.preventDefault();
          document.getElementById('export-button')?.click();
          break;

        default:
          break;
      }
    } else if (event.key === 'Escape') {
      dispatch({ 
        type: 'UPDATE_UI', 
        payload: { 
          modalOpen: false,
          quickSearchOpen: false
        } 
      });
    }
  }, [navigate, dispatch]);

  useEffect(() => {
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [handleShortcut]);

  // إرجاع قائمة الاختصارات للعرض في واجهة المستخدم
  const getShortcutsList = useCallback(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? '⌘' : 'Ctrl';

    return Object.entries(KEYBOARD_SHORTCUTS).map(([key, value]) => ({
      key: key,
      combination: `${modifier}+${value.key.toUpperCase()}`,
      description: value.description
    }));
  }, []);

  return { getShortcutsList };
};