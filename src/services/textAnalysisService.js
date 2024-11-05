import { pipeline } from '@xenova/transformers';
import { logError } from './errorService';
import { supabase } from '../config/supabase';
import { getItem, setItem } from './localStorageService';
import { APP_CONFIG } from '../config/constants';

let models = {
  sentiment: null,
  summary: null,
  keywords: null
};

// تهيئة النماذج
const initModels = async () => {
  try {
    if (!models.sentiment) {
      models.sentiment = await pipeline('sentiment-analysis', 'Xenova/arabic-sentiment-analysis');
    }
    if (!models.summary) {
      models.summary = await pipeline('summarization', 'Xenova/mt5-small-arabic-text-summarization');
    }
    if (!models.keywords) {
      models.keywords = await pipeline('token-classification', 'Xenova/bert-base-arabic-keywordextraction');
    }
  } catch (error) {
    logError(error, 'MODEL_INITIALIZATION');
    throw new Error('فشل في تهيئة نماذج تحليل النص');
  }
};

// تحليل المشاعر
export const analyzeSentiment = async (text) => {
  try {
    await initModels();
    
    // التحقق من التخزين المؤقت
    const cacheKey = `sentiment_${text.slice(0, 50)}`;
    const cached = await getItem(cacheKey);
    if (cached) return cached;

    const result = await models.sentiment(text);
    const sentiment = {
      sentiment: result[0].label,
      score: result[0].score,
      timestamp: new Date().toISOString()
    };

    // حفظ في التخزين المؤقت
    await setItem(cacheKey, sentiment, { ttl: APP_CONFIG.CACHE_DURATION });

    // حفظ في Supabase
    await supabase.from('text_analysis').insert({
      type: 'sentiment',
      text,
      result: sentiment
    });

    return sentiment;
  } catch (error) {
    logError(error, 'SENTIMENT_ANALYSIS');
    return {
      sentiment: 'neutral',
      score: 0.5
    };
  }
};

// تلخيص النص
export const summarizeText = async (text, maxLength = 150) => {
  try {
    await initModels();

    const cacheKey = `summary_${text.slice(0, 50)}`;
    const cached = await getItem(cacheKey);
    if (cached) return cached;

    const result = await models.summary(text, {
      max_length: maxLength,
      min_length: 30,
      do_sample: false
    });

    const summary = {
      text: result[0].summary_text,
      timestamp: new Date().toISOString()
    };

    await setItem(cacheKey, summary, { ttl: APP_CONFIG.CACHE_DURATION });

    await supabase.from('text_analysis').insert({
      type: 'summary',
      text,
      result: summary
    });

    return summary.text;
  } catch (error) {
    logError(error, 'TEXT_SUMMARIZATION');
    return text.substring(0, maxLength) + '...';
  }
};

// استخراج الكلمات المفتاحية
export const extractKeywords = async (text) => {
  try {
    await initModels();

    const cacheKey = `keywords_${text.slice(0, 50)}`;
    const cached = await getItem(cacheKey);
    if (cached) return cached;

    const result = await models.keywords(text);
    
    const keywords = result.reduce((acc, item) => {
      const keyword = item.word.toLowerCase();
      acc[keyword] = (acc[keyword] || 0) + item.score;
      return acc;
    }, {});

    const keywordsList = Object.entries(keywords)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word, score]) => ({ word, score }));

    await setItem(cacheKey, keywordsList, { ttl: APP_CONFIG.CACHE_DURATION });

    await supabase.from('text_analysis').insert({
      type: 'keywords',
      text,
      result: keywordsList
    });

    return keywordsList;
  } catch (error) {
    logError(error, 'KEYWORD_EXTRACTION');
    return [];
  }
};

// تحليل النص الكامل
export const analyzeText = async (text) => {
  try {
    const [sentiment, summary, keywords] = await Promise.all([
      analyzeSentiment(text),
      summarizeText(text),
      extractKeywords(text)
    ]);

    const analysis = {
      sentiment,
      summary,
      keywords,
      stats: {
        characters: text.length,
        words: text.split(/\s+/).length,
        sentences: text.split(/[.!?]+/).length
      },
      timestamp: new Date().toISOString()
    };

    // حفظ التحليل الكامل
    await supabase.from('text_analysis').insert({
      type: 'full',
      text,
      result: analysis
    });

    return analysis;
  } catch (error) {
    logError(error, 'TEXT_ANALYSIS');
    throw new Error('فشل في تحليل النص');
  }
}; 