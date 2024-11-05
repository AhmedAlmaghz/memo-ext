import { supabase } from '../config/supabase';
import { getCurrentUser } from './authService';
import { v4 as uuidv4 } from 'uuid';
import { APP_CONFIG } from '../config/constants';

// رفع ملف
export const uploadFile = async (file, path = 'attachments') => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `users/${user.id}/${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('files')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('files')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath,
      name: fileName,
      type: file.type,
      size: file.size
    };
  } catch (error) {
    logError(error, 'STORAGE_UPLOAD');
    throw new Error('فشل رفع الملف');
  }
};

// حذف ملف
export const deleteFile = async (filePath) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    const { error } = await supabase.storage
      .from('files')
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    logError(error, 'STORAGE_DELETE');
    throw new Error('فشل حذف الملف');
  }
};

// حساب حجم التخزين المستخدم
export const getStorageUsage = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return 0;

    const { data, error } = await supabase.storage
      .from('files')
      .list(`users/${user.id}`);

    if (error) throw error;

    return data.reduce((total, file) => total + (file.metadata?.size || 0), 0);
  } catch (error) {
    logError(error, 'STORAGE_USAGE');
    return 0;
  }
};

// التحقق من صلاحية الملف
export const validateFile = (file) => {
  if (!APP_CONFIG.SUPPORTED_FILE_TYPES.includes(`.${file.name.split('.').pop()}`)) {
    throw new Error('نوع الملف غير مدعوم');
  }

  if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
    throw new Error(`حجم الملف يجب أن يكون أقل من ${APP_CONFIG.MAX_FILE_SIZE / (1024 * 1024)} ميجابايت`);
  }

  return true;
}; 