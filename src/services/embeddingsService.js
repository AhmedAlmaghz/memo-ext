
import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";
import { TogetherAIEmbeddings } from "@langchain/community/embeddings/togetherai";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

import { APP_CONFIG } from '../config/constants';
import { logError } from './errorService';
import { getItem, setItem } from './localStorageService';
import { supabase } from '../config/supabase';

let embeddingsInstance = null;

// تكوين نماذج التضمين مع دعم النصوص العربية
const EMBEDDING_CONFIGS = {
  // openai: {
  //   modelName: 'text-embedding-3-small',
  //   dimensions: 1536,
  //   batchSize: 100,
  //   language: ['ar', 'en']
  // },
  voyage: {
    modelName: 'voyage-large-2',
    dimensions: 1024,
    batchSize: 50,
    language: ['ar', 'en']
  },
  together: {
    modelName: 'BAAI/bge-large-zh-v1.5',
    dimensions: 1024,
    batchSize: 32,
    language: ['ar', 'en', 'zh']
  },
  huggingface: {
    modelName: 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
    dimensions: 384,
    batchSize: 32,
    language: ['ar', 'en', 'fr', 'es', 'de']
  }
};

// تخزين التضمينات في Supabase
const storeEmbedding = async (text, embedding, metadata = {}) => {
  const { data, error } = await supabase
    .from('embeddings')
    .insert([{
      text,
      embedding,
      metadata,
      created_at: new Date().toISOString()
    }]);

  if (error) throw error;
  return data;
};

// جلب التضمين المخزن
const getStoredEmbedding = async (text) => {
  const { data, error } = await supabase
    .from('embeddings')
    .select('*')
    .eq('text', text)
    .single();

  if (error) return null;
  return data;
};

// تهيئة نموذج التضمين
export const initEmbeddings = async (provider = null) => {
  try {
    const selectedProvider = provider || 
                           getItem('embeddingsProvider') || 
                           APP_CONFIG.DEFAULT_EMBEDDING_PROVIDER;
    
    const config = EMBEDDING_CONFIGS[selectedProvider];
    if (!config) throw new Error('مزود التضمين غير مدعوم');

    const options = {
      batchSize: config.batchSize,
      stripNewLines: true,
      maxRetries: 3,
      cache: true
    };

    switch (selectedProvider) {
      // case 'openai':
      //   embeddingsInstance = new OpenAIEmbeddings({
      //     ...options,
      //     openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
      //     modelName: config.modelName
      //   });
      //   break;

      case 'voyage':
        embeddingsInstance = new VoyageEmbeddings({
          ...options,
          apiKey: process.env.REACT_APP_VOYAGE_API_KEY,
          modelName: config.modelName
        });
        break;

      case 'together':
        embeddingsInstance = new TogetherAIEmbeddings({
          ...options,
          apiKey: process.env.REACT_APP_TOGETHER_API_KEY,
          modelName: config.modelName
        });
        break;

      case 'huggingface':
        embeddingsInstance = new HuggingFaceInferenceEmbeddings({
          ...options,
          apiKey: process.env.REACT_APP_HUGGINGFACE_API_KEY,
          modelName: config.modelName
        });
        break;

      default:
        throw new Error('مزود التضمين غير مدعوم');
    }

    if (provider) {
      setItem('embeddingsProvider', provider);
    }

    return embeddingsInstance;
  } catch (error) {
    logError(error, 'EMBEDDINGS_INIT');
    throw new Error('فشل في تهيئة نموذج التضمين');
  }
};

// معالجة النص العربي
const preprocessArabicText = (text) => {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // إزالة التشكيل
    .replace(/\s+/g, ' ') // توحيد المسافات
    .trim();
};

// الحصول على تضمين للنص
export const getEmbeddings = async (texts, options = {}) => {
  try {
    if (!embeddingsInstance) {
      await initEmbeddings();
    }

    if (!Array.isArray(texts)) {
      texts = [texts];
    }

    const processedTexts = texts.map(text => preprocessArabicText(text));
    const embeddings = [];

    for (const text of processedTexts) {
      // التحقق من وجود تضمين مخزن
      let embedding = await getStoredEmbedding(text);
      
      if (!embedding) {
        const result = await embeddingsInstance.embedDocuments([text]);
        embedding = result[0];
        
        // تخزين التضمين الجديد
        if (options.store !== false) {
          await storeEmbedding(text, embedding, options.metadata);
        }
      }

      embeddings.push(embedding);
    }

    return embeddings;
  } catch (error) {
    logError(error, 'EMBEDDINGS_GENERATION');
    throw new Error('فشل في إنشاء التضمين');
  }
};

// الحصول على معلومات المزود الحالي
export const getCurrentProviderInfo = () => {
  const provider = getItem('embeddingsProvider') || APP_CONFIG.DEFAULT_EMBEDDING_PROVIDER;
  return {
    provider,
    ...EMBEDDING_CONFIGS[provider]
  };
};

// الحصول على أبعاد التضمين الحالي
export const getCurrentEmbeddingDimensions = () => {
  const provider = getItem('embeddingsProvider') || APP_CONFIG.DEFAULT_EMBEDDING_PROVIDER;
  return EMBEDDING_CONFIGS[provider].dimensions;
};

// التحقق من دعم اللغة
export const isLanguageSupported = (language) => {
  const provider = getItem('embeddingsProvider') || APP_CONFIG.DEFAULT_EMBEDDING_PROVIDER;
  return EMBEDDING_CONFIGS[provider].language.includes(language);
};