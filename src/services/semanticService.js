import { getEmbeddings } from './embeddingsService';
import { getCurrentUser } from './authService';
import { logError } from './errorService';
import { initVectorStore, similaritySearch } from './vectorStoreService';
import { APP_CONFIG } from '../config/constants';

// حفظ التضمين للملاحظة
export const saveNoteEmbedding = async (noteId, text) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    const embedding = await getEmbeddings(text);
    const vectorStore = await initVectorStore();

    await vectorStore.addDocuments([{
      pageContent: text,
      metadata: {
        noteId,
        userId: user.id,
        createdAt: new Date().toISOString()
      }
    }]);

  } catch (error) {
    logError(error, 'SEMANTIC_SAVE');
    throw new Error('فشل في حفظ التضمين');
  }
};

// البحث الدلالي
export const semanticSearch = async (searchText, options = {}) => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const results = await similaritySearch(searchText, {
      ...options,
      filter: { userId: user.id }
    });

    return results;
  } catch (error) {
    logError(error, 'SEMANTIC_SEARCH');
    return [];
  }
};

// تحديث التضمين
export const updateNoteEmbedding = async (noteId, newText) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    const vectorStore = await initVectorStore();
    
    // حذف التضمين القديم وإضافة الجديد
    await vectorStore.delete({
      filter: { noteId, userId: user.id }
    });

    await saveNoteEmbedding(noteId, newText);
  } catch (error) {
    logError(error, 'SEMANTIC_UPDATE');
    throw new Error('فشل في تحديث التضمين');
  }
}; 