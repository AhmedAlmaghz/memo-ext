import { supabase } from '../config/supabase';
import { getCurrentUser } from './authService';
import { logError } from './errorService';
import { cacheGet, cacheSet } from './cacheService';


const SYNC_BATCH_SIZE = 500;

// مزامنة البيانات
export const syncData = async (options = {}) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    const lastSync = await getLastSyncTimestamp();
    const changes = await getLocalChanges(lastSync);
    
    if (changes.length === 0 && !options.force) {
      return { status: 'up-to-date' };
    }

    // مزامنة على دفعات
    const batches = [];
    for (let i = 0; i < changes.length; i += SYNC_BATCH_SIZE) {
      const batch = changes.slice(i, i + SYNC_BATCH_SIZE);
      batches.push(syncBatch(batch));
    }

    await Promise.all(batches);
    await updateLastSyncTimestamp();

    return {
      status: 'success',
      syncedItems: changes.length
    };
  } catch (error) {
    logError(error, 'SYNC');
    throw new Error('فشل في مزامنة البيانات');
  }
};

// مزامنة دفعة واحدة
const syncBatch = async (items) => {
  const user = await getCurrentUser();

  for (const item of items) {
    const { error } = await supabase
      .from(`users_${user.uid}_${item.type}`)
      .upsert({
        id: item.id,
        ...item.data,
        syncedAt: new Date().toISOString()
      });

    if (error) {
      throw error;
    }
  }
};

// الحصول على التغييرات المحلية
const getLocalChanges = async (lastSync) => {
  const changes = [];
  const collections = ['notes', 'categories', 'settings'];

  for (const collectionName of collections) {
    const localData = await cacheGet(`local_${collectionName}`);
    if (localData) {
      const modifiedItems = localData.filter(item => 
        !item.syncedAt || new Date(item.syncedAt) > new Date(lastSync)
      );
      changes.push(...modifiedItems.map(item => ({
        type: collectionName,
        id: item.id,
        data: item
      })));
    }
  }

  return changes;
};

// الحصول على آخر وقت مزامنة
const getLastSyncTimestamp = async () => {
  try {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('sync_status')
      .select('lastSync')
      .eq('user_id', user.uid)
      .single();

    if (error) {
      throw error;
    }

    return data ? data.lastSync : null;
  } catch (error) {
    return null;
  }
};

// تحديث وقت آخر مزامنة
const updateLastSyncTimestamp = async () => {
  const user = await getCurrentUser();
  const { error } = await supabase
    .from('sync_status')
    .upsert({
      user_id: user.uid,
      lastSync: new Date().toISOString(),
      device: navigator.userAgent
    });

  if (error) {
    throw error;
  }
};

// التحقق من حالة المزامنة
export const checkSyncStatus = async () => {
  try {
    const lastSync = await getLastSyncTimestamp();
    const changes = await getLocalChanges(lastSync);
    
    return {
      lastSync,
      pendingChanges: changes.length,
      isUpToDate: changes.length === 0
    };
  } catch (error) {
    logError(error, 'SYNC');
    return {
      error: 'فشل في التحقق من حالة المزامنة'
    };
  }
};