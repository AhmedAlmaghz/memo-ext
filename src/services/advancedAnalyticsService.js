import { supabase } from '../config/supabase';
import { getCurrentUser } from './authService';
import { logError } from './errorService';


// تحليل أنماط استخدام المستخدم
export const analyzeUserBehavior = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.uid);

    if (error) throw error;

    const notesData = notes.map(note => ({
      id: note.id,
      ...note,
      createdAt: new Date(note.createdAt)
    }));

    // تحليل أوقات النشاط
    const activityHours = notesData.reduce((acc, note) => {
      const hour = note.createdAt.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    // تحليل أيام الأسبوع
    const activityDays = notesData.reduce((acc, note) => {
      const day = note.createdAt.getDay();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    // تحليل التصنيفات المفضلة
    const categoryPreferences = notesData.reduce((acc, note) => {
      const category = note.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // تحليل طول الملاحظات
    const noteLengths = notesData.map(note => ({
      id: note.id,
      length: note.description?.length || 0
    }));

    const averageNoteLength = noteLengths.reduce((sum, note) => sum + note.length, 0) / notesData.length;

    return {
      activityHours,
      activityDays,
      categoryPreferences,
      noteLengths,
      averageNoteLength,
      totalNotes: notesData.length
    };
  } catch (error) {
    logError(error, 'ANALYTICS');
    return null;
  }
};

// تحليل الروابط والمواقع
export const analyzeLinks = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.uid);

    if (error) throw error;

    const notesData = notes.map(note => note);

    // تحليل النطاقات الأكثر زيارة
    const domains = notesData.reduce((acc, note) => {
      if (note.siteUrl) {
        try {
          const domain = new URL(note.siteUrl).hostname;
          acc[domain] = (acc[domain] || 0) + 1;
        } catch (e) {
          // تجاهل الروابط غير الصالحة
        }
      }
      return acc;
    }, {});

    return {
      topDomains: Object.entries(domains)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    };
  } catch (error) {
    logError(error, 'ANALYTICS');
    return null;
  }
};

// تحليل الكلمات والموضوعات
export const analyzeContent = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.uid);

    if (error) throw error;

    const notesData = notes.map(note => note);

    // تحليل الكلمات الشائعة
    const words = notesData.flatMap(note => 
      note.description
        ?.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3) || []
    );

    const wordFrequency = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    // تحليل الوسوم
    const tags = notesData.flatMap(note => note.tags || []);
    const tagFrequency = tags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    return {
      topWords: Object.entries(wordFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20),
      topTags: Object.entries(tagFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    };
  } catch (error) {
    logError(error, 'ANALYTICS');
    return null;
  }
};