export const APP_CONFIG = {
    APP_NAME: 'Memory AI',
    VERSION: '1.0.0',
    DEFAULT_LANGUAGE: 'ar',
    SUPPORTED_LANGUAGES: ['ar', 'en'],
    
    // تكوين API
    API_TIMEOUT: 30000,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    RETRY_ATTEMPTS: 3,
    BATCH_SIZE: 100,
  
    // تكوين الملفات
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    SUPPORTED_FILE_TYPES: ['.pdf', '.doc', '.docx', '.txt', '.md'],
    
    // تكوين المخازن المتجهية
    COLLECTION_NAME: 'notes_embeddings',
    DEFAULT_VECTOR_STORE: 'qdrant',
    VECTOR_STORES: ['qdrant', 'pinecone', 'zilliz'],
    
    // تكوين التضمين
    DEFAULT_EMBEDDING_PROVIDER: 'voyage',
    EMBEDDING_PROVIDERS: ['openai', 'voyage', 'together', 'huggingface'],
    
    // تكوين التخزين المحلي
    STORAGE_PREFIX: 'memo_ai_',
    STORAGE_VERSION: '1',
    
    // تكوين الواجهة
    THEME: {
      LIGHT: 'light',
      DARK: 'dark'
    },
    
    // تكوين المصادقة
    AUTH: {
      SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
      MAX_LOGIN_ATTEMPTS: 5,
      LOCKOUT_DURATION: 15 * 60 * 1000 // 15 minutes
    }
  };
  
  export const ROUTES = {
    HOME: '/',
    AUTH: '/auth',
    SEARCH: '/search',
    SETTINGS: '/settings',
    NOTE_DETAIL: '/note/:id'
  };
  
  export const KEYBOARD_SHORTCUTS = {
    NEW_NOTE: { key: 'n', description: 'إنشاء ملاحظة جديدة' },
    SEARCH: { key: 'f', description: 'البحث' },
    SETTINGS: { key: 's', description: 'الإعدادات' },
    QUICK_SEARCH: { key: '/', description: 'البحث السريع' },
    EXPORT: { key: 'e', description: 'تصدير البيانات' },
    CLOSE_MODAL: { key: 'Escape', description: 'إغلاق النوافذ المنبثقة' }
  };
  
  // التحقق من صحة التكوين
  const validateConfig = () => {
    const requiredEnvVars = [
      'REACT_APP_SUPABASE_URL',
      'REACT_APP_SUPABASE_ANON_KEY',
      'REACT_APP_VOYAGE_API_KEY'
    ];
  
    const missingVars = requiredEnvVars.filter(
      varName => !process.env[varName]
    );
  
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
    }
  };
  
  validateConfig();