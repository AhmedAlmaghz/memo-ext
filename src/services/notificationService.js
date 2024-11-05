import { supabase } from '../config/supabase';
import { getCurrentUser } from './authService';
import { getItem, setItem } from './localStorageService';

// التحقق من دعم الإشعارات
const checkNotificationSupport = () => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

// طلب إذن الإشعارات
export const requestNotificationPermission = async () => {
  if (!checkNotificationSupport()) {
    throw new Error('الإشعارات غير مدعومة في هذا المتصفح');
  }

  const permission = await Notification.requestPermission();
  setItem('notificationPermission', permission);
  return permission;
};

// إرسال إشعار
export const sendNotification = async (title, options = {}) => {
  try {
    const permission = getItem('notificationPermission') || await Notification.permission;
    
    if (permission !== 'granted') {
      throw new Error('لم يتم منح إذن الإشعارات');
    }

    const notification = new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/badge-96x96.png',
      ...options
    });

    notification.onclick = function(event) {
      event.preventDefault();
      window.focus();
      notification.close();
    };

    // تسجيل الإشعار في قاعدة البيانات
    const user = await getCurrentUser();
    if (user) {
      await supabase
        .from('notifications')
        .insert({
          user_id: user.uid,
          title,
          options,
          timestamp: new Date().toISOString(),
          read: false
        });
    }

    return notification;
  } catch (error) {
    console.error('خطأ في إرسال الإشعار:', error);
    throw error;
  }
};

// جلب الإشعارات غير المقروءة
export const getUnreadNotifications = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.uid)
      .eq('read', false)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('خطأ في جلب الإشعارات:', error);
    return [];
  }
};

// تحديث حالة الإشعار
export const markNotificationAsRead = async (notificationId) => {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        readAt: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('user_id', user.uid);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('خطأ في تحديث حالة الإشعار:', error);
    throw error;
  }
};

// جدولة إشعار
export const scheduleNotification = async (title, options = {}, delay) => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const notification = await sendNotification(title, options);
      resolve(notification);
    }, delay);
  });
};