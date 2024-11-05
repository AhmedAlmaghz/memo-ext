import { supabase } from '../config/supabase';
import { getCurrentUser } from './authService';

export const saveCategory = async (category) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    const { data, error } = await supabase
      .from('categories')
      .upsert({
        id: category.id,
        user_id: user.uid,
        ...category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('خطأ في حفظ التصنيف:', error);
    throw new Error('فشل حفظ التصنيف');
  }
};

export const getCategories = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.uid);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('خطأ في جلب التصنيفات:', error);
    return [];
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', user.uid);

    if (error) throw error;
  } catch (error) {
    console.error('خطأ في حذف التصنيف:', error);
    throw new Error('فشل حذف التصنيف');
  }
};