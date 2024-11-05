import { saveAs } from 'file-saver';
import { supabase } from '../config/supabase';
import { getCurrentUser } from './authService';
import { logError } from './errorService';
import { validateData } from './validationService';



// تصدير البيانات
export const exportData = async (options = {}) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    const data = {
      metadata: {
        exportDate: new Date().toISOString(),
        userId: user.uid,
        version: '1.0'
      },
      notes: [],
      categories: [],
      tags: []
    };

    // جمع الملاحظات
    if (!options.excludeNotes) {
      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.uid);

      if (error) throw error;
      data.notes = notes;
    }

    // جمع التصنيفات
    if (!options.excludeCategories) {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.uid);

      if (error) throw error;
      data.categories = categories;
    }

    // تصدير الملف
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `notes-backup-${new Date().toISOString()}.json`);

    return data;
  } catch (error) {
    logError(error, 'EXPORT');
    throw new Error('فشل في تصدير البيانات');
  }
};

// استيراد البيانات
export const importData = async (file, options = {}) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    const fileContent = await readFileAsText(file);
    const data = JSON.parse(fileContent);

    // التحقق من صحة البيانات
    await validateImportData(data);

    // استيراد الملاحظات
    if (data.notes && !options.excludeNotes) {
      for (const note of data.notes) {
        const { id, ...noteData } = note;
        const { error } = await supabase
          .from('notes')
          .upsert({
            id,
            user_id: user.uid,
            ...noteData,
            importedAt: new Date().toISOString()
          }, { onConflict: 'id' });

        if (error) throw error;
      }
    }

    // استيراد التصنيفات
    if (data.categories && !options.excludeCategories) {
      for (const category of data.categories) {
        const { id, ...categoryData } = category;
        const { error } = await supabase
          .from('categories')
          .upsert({
            id,
            user_id: user.uid,
            ...categoryData,
            importedAt: new Date().toISOString()
          }, { onConflict: 'id' });

        if (error) throw error;
      }
    }

    return data;
  } catch (error) {
    logError(error, 'IMPORT');
    throw new Error('فشل في استيراد البيانات');
  }
};

// قراءة الملف كنص
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

// التحقق من صحة بيانات الاستيراد
const validateImportData = async (data) => {
  const schema = {
    metadata: {
      exportDate: 'string',
      userId: 'string',
      version: 'string'
    },
    notes: 'array',
    categories: 'array'
  };

  try {
    await validateData(data, schema);
    return true;
  } catch (error) {
    throw new Error('بيانات الاستيراد غير صالحة');
  }
};

// تحويل التنسيق القديم
export const migrateOldFormat = (data) => {
  // يمكن إضافة منطق لتحويل التنسيقات القديمة هنا
  return data;
};