import { supabase } from '../config/supabase';
import { getCurrentUser } from './authService';
import { logError } from './errorService';
import { APP_CONFIG } from '../config/constants';

// تحليل أنماط استخدام المستخدم
export const analyzeUserBehavior = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // جلب نشاط المستخدم
    const { data: activities, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // تحليل أوقات النشاط
    const activityHours = activities.reduce((acc, activity) => {
      const hour = new Date(activity.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    // تحليل أيام الأسبوع
    const activityDays = activities.reduce((acc, activity) => {
      const day = new Date(activity.created_at).getDay();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    // تحليل أنواع النشاط
    const activityTypes = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    return {
      activityHours,
      activityDays,
      activityTypes,
      totalActivities: activities.length
    };
  } catch (error) {
    logError(error, 'USER_BEHAVIOR_ANALYSIS');
    return null;
  }
};

// تحليل المحتوى
export const analyzeContent = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // جلب الملاحظات
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    // تحليل الكلمات الشائعة
    const words = notes.flatMap(note => 
      note.content
        ?.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3) || []
    );

    const wordFrequency = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    // تحليل التصنيفات
    const categories = notes.reduce((acc, note) => {
      if (note.category) {
        acc[note.category] = (acc[note.category] || 0) + 1;
      }
      return acc;
    }, {});

    // تحليل الوسوم
    const tags = notes.flatMap(note => note.tags || []);
    const tagFrequency = tags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    // تحليل طول المحتوى
    const contentLengths = notes.map(note => ({
      id: note.id,
      length: note.content?.length || 0
    }));

    const averageLength = contentLengths.reduce((sum, note) => 
      sum + note.length, 0) / notes.length;

    return {
      topWords: Object.entries(wordFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20),
      categories,
      topTags: Object.entries(tagFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
      contentStats: {
        totalNotes: notes.length,
        averageLength,
        contentLengths
      }
    };
  } catch (error) {
    logError(error, 'CONTENT_ANALYSIS');
    return null;
  }
};

// تتبع نشاط المستخدم
export const trackUserActivity = async (action, metadata = {}) => {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    const activityData = {
      user_id: user.id,
      action,
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date().toISOString()
      }
    };

    const { error } = await supabase
      .from('user_activities')
      .insert(activityData);

    if (error) throw error;
  } catch (error) {
    logError(error, 'ACTIVITY_TRACKING');
  }
};

// تحليل الأداء
export const analyzePerformance = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // جلب قياسات الأداء
    const { data: metrics, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // تحليل أوقات الاستجابة
    const responseTimes = metrics.reduce((acc, metric) => {
      acc[metric.operation] = {
        avg: metric.response_time,
        count: metric.count
      };
      return acc;
    }, {});

    // تحليل استخدام الموارد
    const resourceUsage = metrics.reduce((acc, metric) => {
      acc.storage = (acc.storage || 0) + metric.storage_used;
      acc.memory = (acc.memory || 0) + metric.memory_used;
      return acc;
    }, {});

    return {
      responseTimes,
      resourceUsage,
      totalOperations: metrics.length
    };
  } catch (error) {
    logError(error, 'PERFORMANCE_ANALYSIS');
    return null;
  }
}; 