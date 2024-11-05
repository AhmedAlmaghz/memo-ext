import { getItem, setItem } from './localStorageService';
import { logError } from './errorService';

const CACHE_PREFIX = 'cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 دقائق

// حفظ في الذاكرة المؤقتة
export const cacheSet = (key, data, ttl = DEFAULT_TTL) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl
    };
    setItem(`${CACHE_PREFIX}${key}`, cacheData);
  } catch (error) {
    logError(error, 'CACHE');
  }
};

// قراءة من الذاكرة المؤقتة
export const cacheGet = (key) => {
  try {
    const cacheData = getItem(`${CACHE_PREFIX}${key}`);
    if (!cacheData) return null;

    const { data, timestamp, ttl } = cacheData;
    const now = Date.now();

    if (now - timestamp > ttl) {
      cacheRemove(key);
      return null;
    }

    return data;
  } catch (error) {
    logError(error, 'CACHE');
    return null;
  }
};

// حذف من الذاكرة المؤقتة
export const cacheRemove = (key) => {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (error) {
    logError(error, 'CACHE');
  }
};

// تنظيف الذاكرة المؤقتة
export const cacheClear = () => {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  } catch (error) {
    logError(error, 'CACHE');
  }
};

// التحقق من حجم الذاكرة المؤقتة
export const getCacheSize = () => {
  try {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .reduce((size, key) => {
        return size + localStorage.getItem(key).length;
      }, 0);
  } catch (error) {
    logError(error, 'CACHE');
    return 0;
  }
};

// تنظيف الذاكرة المؤقتة القديمة
export const cleanupExpiredCache = () => {
  try {
    const now = Date.now();
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .forEach(key => {
        const cacheData = getItem(key);
        if (cacheData && (now - cacheData.timestamp > cacheData.ttl)) {
          localStorage.removeItem(key);
        }
      });
  } catch (error) {
    logError(error, 'CACHE');
  }
};

// دالة مساعدة للتخزين المؤقت
export const withCache = async (key, callback, ttl = DEFAULT_TTL) => {
  try {
    const cachedData = cacheGet(key);
    if (cachedData) return cachedData;

    const freshData = await callback();
    cacheSet(key, freshData, ttl);
    return freshData;
  } catch (error) {
    logError(error, 'CACHE');
    throw error;
  }
}; 