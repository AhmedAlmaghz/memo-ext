import { QdrantClient } from '@qdrant/js-client-rest';
// import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

import { QdrantVectorStore } from "@langchain/qdrant";
// import { PineconeStore } from "@langchain/pinecone";

import { 
  initEmbeddings, 
  getCurrentEmbeddingDimensions,
  getCurrentProviderInfo 
} from './embeddingsService';
import { APP_CONFIG } from '../config/constants';
import { logError } from './errorService';
import { getItem, setItem } from './localStorageService';

let vectorStore = null;

// تكوين المخازن المتجهية
const VECTOR_STORE_CONFIGS = {
  qdrant: {
    distance: 'Cosine',
    initializeCollection: true,
    searchParams: {
      exact: false,
      hnsw_ef: 128
    }
  },
  pinecone: {
    metric: 'cosine',
    podType: 'p1',
    indexConfig: {
      metric: 'cosine',
      pods: 1,
      replicas: 1,
      pod_type: 'p1'
    }
  },
  zilliz: {
    metric_type: 'IP',
    index_type: 'IVF_SQ8',
    index_params: {
      nlist: 1024
    },
    search_params: {
      nprobe: 10
    }
  }
};

// تهيئة Qdrant
const initQdrant = async () => {
  const client = new QdrantClient({
    url: process.env.REACT_APP_QDRANT_URL,
    apiKey: process.env.REACT_APP_QDRANT_API_KEY
  });

  const dimensions = getCurrentEmbeddingDimensions();
  const config = VECTOR_STORE_CONFIGS.qdrant;
  
  try {
    if (config.initializeCollection) {
      await client.createCollection(APP_CONFIG.COLLECTION_NAME, {
        vectors: {
          size: dimensions,
          distance: config.distance
        },
        optimizers_config: {
          default_segment_number: 2
        },
        replication_factor: 1
      });
    }
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }

  return await QdrantVectorStore.fromExistingCollection(
    await initEmbeddings(),
    {
      client,
      collectionName: APP_CONFIG.COLLECTION_NAME,
      searchParams: config.searchParams
    }
  );
};

// // تهيئة Pinecone
// const initPinecone = async () => {
//   const client = new PineconeClient();
//   await client.init({
//     apiKey: process.env.REACT_APP_PINECONE_API_KEY,
//     environment: process.env.REACT_APP_PINECONE_ENVIRONMENT
//   });

//   const dimensions = getCurrentEmbeddingDimensions();
//   const config = VECTOR_STORE_CONFIGS.pinecone;

//   try {
//     await client.createIndex({
//       name: APP_CONFIG.COLLECTION_NAME,
//       dimension: dimensions,
//       metric: config.metric,
//       ...config.indexConfig
//     });
//   } catch (error) {
//     if (!error.message.includes('already exists')) {
//       throw error;
//     }
//   }

//   const pineconeIndex = client.Index(APP_CONFIG.COLLECTION_NAME);

//   return await PineconeStore.fromExistingIndex(
//     await initEmbeddings(),
//     { pineconeIndex }
//   );
// };

// تهيئة Zilliz
const initZilliz = async () => {
  const dimensions = getCurrentEmbeddingDimensions();
  const config = VECTOR_STORE_CONFIGS.zilliz;
  
  const client = new ZillizClient({
    address: process.env.REACT_APP_ZILLIZ_URI,
    username: process.env.REACT_APP_ZILLIZ_USERNAME,
    password: process.env.REACT_APP_ZILLIZ_PASSWORD
  });

  try {
    await client.createCollection({
      collection_name: APP_CONFIG.COLLECTION_NAME,
      dimension: dimensions,
      ...config
    });
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }

  return await MilvusStore.fromExistingCollection(
    await initEmbeddings(),
    {
      collectionName: APP_CONFIG.COLLECTION_NAME,
      client,
      searchParams: config.search_params
    }
  );
};

// تهيئة مخزن المتجهات
export const initVectorStore = async (storeType = null) => {
  try {
    const selectedType = storeType || 
                        getItem('vectorStoreType') || 
                        APP_CONFIG.DEFAULT_VECTOR_STORE;
    
    if (!APP_CONFIG.VECTOR_STORES.includes(selectedType)) {
      throw new Error('نوع مخزن المتجهات غير مدعوم');
    }

    switch (selectedType) {
      case 'qdrant':
        vectorStore = await initQdrant();
        break;
      case 'pinecone':
        vectorStore = await initPinecone();
        break;
      case 'zilliz':
        vectorStore = await initZilliz();
        break;
      default:
        throw new Error('نوع مخزن المتجهات غير مدعوم');
    }

    if (storeType) {
      setItem('vectorStoreType', storeType);
    }

    return vectorStore;
  } catch (error) {
    logError(error, 'VECTOR_STORE_INIT');
    throw new Error('فشل في تهيئة مخزن المتجهات');
  }
};

// إضافة وثيقة
export const addDocument = async (document) => {
  try {
    if (!vectorStore) {
      await initVectorStore();
    }

    const { id, content, metadata } = document;
    await vectorStore.addDocuments([
      {
        pageContent: content,
        metadata: {
          id,
          ...metadata,
          timestamp: new Date().toISOString()
        }
      }
    ]);

    return id;
  } catch (error) {
    logError(error, 'VECTOR_STORE_ADD');
    throw new Error('فشل في إضافة الوثيقة');
  }
};

// البحث عن الوثائق المشابهة
export const similaritySearch = async (query, k = 5) => {
  try {
    if (!vectorStore) {
      await initVectorStore();
    }

    const results = await vectorStore.similaritySearch(query, k);
    return results.map(result => ({
      content: result.pageContent,
      score: result.score,
      metadata: result.metadata
    }));
  } catch (error) {
    logError(error, 'VECTOR_STORE_SEARCH');
    throw new Error('فشل في البحث عن الوثائق المشابهة');
  }
};

// حذف وثيقة
export const deleteDocument = async (documentId) => {
  try {
    if (!vectorStore) {
      await initVectorStore();
    }

    await vectorStore.delete({ filter: { id: documentId } });
  } catch (error) {
    logError(error, 'VECTOR_STORE_DELETE');
    throw new Error('فشل في حذف الوثيقة');
  }
};

// تحديث وثيقة
export const updateDocument = async (document) => {
  try {
    if (!vectorStore) {
      await initVectorStore();
    }

    await deleteDocument(document.id);
    await addDocument(document);
  } catch (error) {
    logError(error, 'VECTOR_STORE_UPDATE');
    throw new Error('فشل في تحديث الوثيقة');
  }
};

// البحث المتقدم
export const advancedSearch = async (query, filter = {}, k = 5) => {
  try {
    if (!vectorStore) {
      await initVectorStore();
    }

    const results = await vectorStore.similaritySearch(query, k, filter);
    return results.map(result => ({
      content: result.pageContent,
      score: result.score,
      metadata: result.metadata
    }));
  } catch (error) {
    logError(error, 'VECTOR_STORE_ADVANCED_SEARCH');
    throw new Error('فشل في البحث المتقدم');
  }
}; 