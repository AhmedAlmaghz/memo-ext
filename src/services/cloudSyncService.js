import { supabase } from '../config/supabase';
import { getCurrentUser } from './authService';
import { logError } from './errorService';
import { getItem, setItem } from './localStorageService';
import { APP_CONFIG } from '../config/constants';

// مزامنة الملاحظات مع Supabase
export const syncNotesToCloud = async (notes) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    const { data, error } = await supabase
      .from('notes')
      .upsert(
        notes.map(note => ({
          ...note,
          user_id: user.id,
          updated_at: new Date().toISOString()
        })),
        { onConflict: 'id' }
      );

    if (error) throw error;
    return data;
  } catch (error) {
    logError(error, 'CLOUD_SYNC');
    throw new Error('فشل في مزامنة الملاحظات');
  }
};

// جلب الملاحظات من Supabase
export const getNotesFromCloud = async (lastSync = null) => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    let query = supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (lastSync) {
      query = query.gt('updated_at', lastSync);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  } catch (error) {
    logError(error, 'CLOUD_FETCH');
    return [];
  }
};

// تحديث حالة المزامنة
export const updateSyncStatus = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    const { error } = await supabase
      .from('sync_status')
      .upsert({
        user_id: user.id,
        last_sync: new Date().toISOString(),
        device: navigator.userAgent
      });

    if (error) throw error;
  } catch (error) {
    logError(error, 'SYNC_STATUS_UPDATE');
  }
};

// التحقق من حالة المزامنة
export const checkSyncStatus = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return { synced: false, lastSync: null };

    const { data, error } = await supabase
      .from('sync_status')
      .select('last_sync')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return {
      synced: true,
      lastSync: data?.last_sync || null
    };
  } catch (error) {
    logError(error, 'SYNC_STATUS_CHECK');
    return { synced: false, lastSync: null };
  }
};

// مزامنة التصنيفات
export const syncCategories = async (categories) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    const { data, error } = await supabase
      .from('categories')
      .upsert(
        categories.map(category => ({
          ...category,
          user_id: user.id,
          updated_at: new Date().toISOString()
        })),
        { onConflict: 'id' }
      );

    if (error) throw error;
    return data;
  } catch (error) {
    logError(error, 'CATEGORY_SYNC');
    throw new Error('فشل في مزامنة التصنيفات');
  }
};

// مزامنة الإعدادات
export const syncSettings = async (settings) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        settings,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    logError(error, 'SETTINGS_SYNC');
    throw new Error('فشل في مزامنة الإعدادات');
  }
};