import { supabase } from '../config/supabase';
import { getCurrentUser } from './authService';
import { logError } from './errorService';
import { setItem, getItem } from './localStorageService';
import { APP_CONFIG } from '../config/constants';

// حفظ ملاحظة
export const saveNote = async (note) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    // حفظ في Supabase
    const { data, error } = await supabase
      .from('notes')
      .upsert({
        ...note,
        user_id: user.id,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    // حفظ في التخزين المحلي
    await setItem(`note_${note.id}`, note, {
      encrypt: true,
      metadata: { type: 'note' }
    });

    return data;
  } catch (error) {
    logError(error, 'DATA_SAVE_NOTE');
    throw new Error('فشل في حفظ الملاحظة');
  }
};

// جلب الملاحظات
export const getNotes = async (options = {}) => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    let query = supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id);

    if (options.category) {
      query = query.eq('category', options.category);
    }

    if (options.tag) {
      query = query.contains('tags', [options.tag]);
    }

    if (options.startDate && options.endDate) {
      query = query
        .gte('created_at', options.startDate)
        .lte('created_at', options.endDate);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(options.limit || 50);

    if (error) throw error;

    // تحديث التخزين المحلي
    for (const note of data) {
      await setItem(`note_${note.id}`, note, {
        encrypt: true,
        metadata: { type: 'note' }
      });
    }

    return data;
  } catch (error) {
    logError(error, 'DATA_GET_NOTES');
    
    // محاولة استرجاع البيانات من التخزين المحلي
    const cachedNotes = await getItem('cached_notes');
    return cachedNotes || [];
  }
};

// حذف ملاحظة
export const deleteNote = async (noteId) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', user.id);

    if (error) throw error;

    // حذف من التخزين المحلي
    await removeItem(`note_${noteId}`);
  } catch (error) {
    logError(error, 'DATA_DELETE_NOTE');
    throw new Error('فشل في حذف الملاحظة');
  }
}; 