import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getCurrentUser } from '../services/authService';
import { useNoteStorage } from '../hooks/useNoteStorage';
import FileUploader from '../components/FileUploader';
import LoadingSpinner from '../components/LoadingSpinner';

const SYNC_OPTIONS = [
  { value: 'auto', label: 'مزامنة تلقائية' },
  { value: 'manual', label: 'مزامنة يدوية' },
  { value: 'disabled', label: 'إيقاف المزامنة' }
];

const NOTIFICATION_SETTINGS = [
  { id: 'saveSuccess', label: 'نجاح الحفظ', default: true },
  { id: 'syncComplete', label: 'اكتمال المزامنة', default: true },
  { id: 'errors', label: 'الأخطاء', default: true }
];

const Settings = ({ showNotification, toggleTheme }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    theme: 'light',
    syncMode: 'auto',
    notifications: NOTIFICATION_SETTINGS.reduce((acc, setting) => ({
      ...acc,
      [setting.id]: setting.default
    }), {}),
    autoBackup: true,
    language: 'ar'
  });

  const { getNotes, importNotes } = useNoteStorage();

  useEffect(() => {
    const loadUserAndSettings = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        // هنا يمكنك تحميل الإعدادات من التخزين المحلي أو قاعدة البيانات
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('خطأ في تحميل الإعدادات:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserAndSettings();
  }, []);

  const handleSettingChange = useCallback((setting, value) => {
    setSettings(prev => {
      const newSettings = { ...prev, [setting]: value };
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  }, []);

  const handleExportData = useCallback(async () => {
    try {
      const notes = await getNotes();
      const dataStr = JSON.stringify(notes, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notes-backup-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('تم تصدير البيانات بنجاح', 'success');
    } catch (error) {
      showNotification('حدث خطأ أثناء تصدير البيانات', 'error');
    }
  }, [getNotes, showNotification]);

  const handleImportData = useCallback(async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const notes = JSON.parse(e.target.result);
          await importNotes(notes);
          showNotification('تم استيراد البيانات بنجاح', 'success');
        } catch (error) {
          showNotification('ملف غير صالح', 'error');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      showNotification('حدث خطأ أثناء استيراد البيانات', 'error');
    }
  }, [importNotes, showNotification]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-6">الإعدادات</h1>

      {/* معلومات المستخدم */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">الحساب</h2>
        {user && (
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              البريد الإلكتروني: {user.email}
            </p>
          </div>
        )}
      </section>

      {/* إعدادات المظهر */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">المظهر</h2>
        <div className="space-y-4">
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            تبديل السمة ({settings.theme === 'light' ? 'فاتح' : 'داكن'})
          </button>
        </div>
      </section>

      {/* إعدادات المزامنة */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">المزامنة</h2>
        <div className="space-y-4">
          <select
            value={settings.syncMode}
            onChange={(e) => handleSettingChange('syncMode', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            {SYNC_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* إعدادات الإشعارات */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">الإشعارات</h2>
        <div className="space-y-4">
          {NOTIFICATION_SETTINGS.map(setting => (
            <label key={setting.id} className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications[setting.id]}
                onChange={(e) => handleSettingChange(
                  'notifications',
                  { ...settings.notifications, [setting.id]: e.target.checked }
                )}
                className="mr-2"
              />
              <span>{setting.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* إدارة البيانات */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">إدارة البيانات</h2>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              تصدير البيانات
            </button>
          </div>
          <div className="mt-4">
            <FileUploader
              onFileSelect={handleImportData}
              acceptedTypes=".json"
              maxSize={10}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

Settings.propTypes = {
  showNotification: PropTypes.func.isRequired,
  toggleTheme: PropTypes.func.isRequired
};

export default Settings;