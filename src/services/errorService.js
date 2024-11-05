import { supabase } from '../config/supabase';
import { getCurrentUser } from './authService';

// تهيئة عميل Supabase


// تصنيفات الأخطاء
export const ErrorTypes = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  AUTH: 'auth',
  DATABASE: 'database',
  UNKNOWN: 'unknown'
};

// تسجيل الخطأ
export const logError = async (error, type = ErrorTypes.UNKNOWN, metadata = {}) => {
  try {
    const user = await getCurrentUser();
    const errorData = {
      message: error.message,
      stack: error.stack,
      type,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      userId: user?.id || 'anonymous'
    };

    const { data, error: insertError } = await supabase
      .from('errors')
      .insert([errorData]);

    if (insertError) {
      throw insertError;
    }

    // إرسال الخطأ إلى وحدة التحكم في وضع التطوير
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorData);
    }
  } catch (loggingError) {
    console.error('Failed to log error:', loggingError);
  }
};

// إنشاء خطأ مخصص
export class AppError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN, metadata = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }

  async log() {
    await logError(this, this.type, this.metadata);
  }
}

// معالجة الأخطاء غير المتوقعة
export const handleUnexpectedError = async (error, context = {}) => {
  const appError = error instanceof AppError 
    ? error 
    : new AppError(error.message, ErrorTypes.UNKNOWN, context);
  
  await appError.log();
  
  return {
    message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً.',
    error: appError
  };
};

// التحقق من صحة البيانات
export const validateData = (data, schema) => {
  try {
    return schema.validateSync(data, { abortEarly: false });
  } catch (error) {
    throw new AppError(
      'خطأ في التحقق من صحة البيانات',
      ErrorTypes.VALIDATION,
      { validationErrors: error.errors }
    );
  }
};