import { APP_CONFIG } from '../config/constants';
import { encryptData, decryptData } from './securityService';

const PREFIX = APP_CONFIG.STORAGE_PREFIX;
const VERSION = APP_CONFIG.STORAGE_VERSION;

// التحقق من دعم التخزين المحلي
const isStorageAvailable = () => {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// حفظ البيانات
export const setItem = async (key, value, options = {}) => {
  if (!isStorageAvailable()) {
    throw new Error('التخزين المحلي غير متاح');
  }

  try {
    const data = {
      value,
      timestamp: new Date().toISOString(),
      version: VERSION,
      ...options.metadata
    };

    let finalValue = JSON.stringify(data);

    if (options.encrypt) {
      finalValue = await encryptData(finalValue);
    }

    localStorage.setItem(`${PREFIX}${key}`, finalValue);
  } catch (error) {
    console.error('خطأ في حفظ البيانات:', error);
    throw new Error('فشل في حفظ البيانات');
  }
};

// استرجاع البيانات
export const getItem = async (key, options = {}) => {
  if (!isStorageAvailable()) {
    throw new Error('التخزين المحلي غير متاح');
  }

  try {
    const value = localStorage.getItem(`${PREFIX}${key}`);
    if (!value) return null;

    let data;
    if (options.encrypt) {
      data = await decryptData(value);
    } else {
      data = JSON.parse(value);
    }

    // التحقق من إصدار البيانات
    if (data.version !== VERSION) {
      console.warn('إصدار البيانات قديم');
      return null;
    }

    // التحقق من صلاحية البيانات
    if (options.ttl) {
      const age = Date.now() - new Date(data.timestamp).getTime();
      if (age > options.ttl) {
        removeItem(key);
        return null;
      }
    }

    return data.value;
  } catch {
    return null;
  }
};

// حذف عنصر
export const removeItem = (key) => {
  if (!isStorageAvailable()) {
    throw new Error('التخزين المحلي غير متاح');
  }

  localStorage.removeItem(`${PREFIX}${key}`);
};

// مسح كل البيانات
export const clearAll = () => {
  if (!isStorageAvailable()) {
    throw new Error('التخزين المحلي غير متاح');
  }

  Object.keys(localStorage)
    .filter(key => key.startsWith(PREFIX))
    .forEach(key => localStorage.removeItem(key));
};

// الحصول على حجم التخزين المستخدم
export const getStorageSize = () => {
  if (!isStorageAvailable()) {
    throw new Error('التخزين المحلي غير متاح');
  }

  return Object.keys(localStorage)
    .filter(key => key.startsWith(PREFIX))
    .reduce((size, key) => size + localStorage.getItem(key).length, 0);
};

// التحقق من وجود تحديثات
export const checkForUpdates = () => {
  if (!isStorageAvailable()) {
    throw new Error('التخزين المحلي غير متاح');
  }

  return Object.keys(localStorage)
    .filter(key => key.startsWith(PREFIX))
    .map(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        return {
          key: key.replace(PREFIX, ''),
          currentVersion: data.version,
          requiredVersion: VERSION,
          needsUpdate: data.version !== VERSION
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}; 