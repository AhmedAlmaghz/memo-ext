import { supabase } from '../config/supabase';
import { logError } from './errorService';
import { getItem, setItem } from './localStorageService';
import { APP_CONFIG } from '../config/constants';

// التحقق من قوة كلمة المرور
export const checkPasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasArabic = /[\u0600-\u06FF]/.test(password);

  const strength = {
    isStrong: false,
    score: 0,
    feedback: []
  };

  if (password.length < minLength) {
    strength.feedback.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  } else {
    strength.score += 1;
  }

  if (!hasUpperCase) {
    strength.feedback.push('يجب أن تحتوي على حرف كبير');
  } else {
    strength.score += 1;
  }

  if (!hasLowerCase) {
    strength.feedback.push('يجب أن تحتوي على حرف صغير');
  } else {
    strength.score += 1;
  }

  if (!hasNumbers) {
    strength.feedback.push('يجب أن تحتوي على رقم');
  } else {
    strength.score += 1;
  }

  if (!hasSpecialChars) {
    strength.feedback.push('يجب أن تحتوي على رمز خاص');
  } else {
    strength.score += 1;
  }

  if (hasArabic) {
    strength.score += 1;
  }

  strength.isStrong = strength.score >= 4;
  return strength;
};

// التحقق من صحة الجلسة
export const validateSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (!session) {
      throw new Error('جلسة غير صالحة');
    }

    const lastActivity = getItem('lastActivity');
    const now = Date.now();

    if (lastActivity && (now - lastActivity > APP_CONFIG.AUTH.SESSION_TIMEOUT)) {
      await supabase.auth.signOut();
      throw new Error('انتهت صلاحية الجلسة');
    }

    setItem('lastActivity', now);
    return true;
  } catch (error) {
    logError(error, 'SESSION_VALIDATION');
    return false;
  }
};

// تشفير البيانات الحساسة
export const encryptData = async (data) => {
  try {
    const { data: encrypted, error } = await supabase.rpc('encrypt_data', {
      payload: JSON.stringify(data)
    });
    
    if (error) throw error;
    return encrypted;
  } catch (error) {
    logError(error, 'DATA_ENCRYPTION');
    throw new Error('فشل في تشفير البيانات');
  }
};

// فك تشفير البيانات
export const decryptData = async (encryptedData) => {
  try {
    const { data: decrypted, error } = await supabase.rpc('decrypt_data', {
      encrypted_payload: encryptedData
    });
    
    if (error) throw error;
    return JSON.parse(decrypted);
  } catch (error) {
    logError(error, 'DATA_DECRYPTION');
    throw new Error('فشل في فك تشفير البيانات');
  }
};

// تتبع محاولات تسجيل الدخول الفاشلة
export const trackFailedLogins = async (email) => {
  try {
    const failedAttempts = getItem(`failedLogins_${email}`) || 0;

    if (failedAttempts >= APP_CONFIG.AUTH.MAX_LOGIN_ATTEMPTS) {
      const lastAttempt = getItem(`lastFailedLogin_${email}`);
      const now = Date.now();

      if (lastAttempt && (now - lastAttempt < APP_CONFIG.AUTH.LOCKOUT_DURATION)) {
        throw new Error('تم قفل الحساب مؤقتاً. يرجى المحاولة لاحقاً');
      } else {
        setItem(`failedLogins_${email}`, 0);
      }
    }

    setItem(`failedLogins_${email}`, failedAttempts + 1);
    setItem(`lastFailedLogin_${email}`, Date.now());
  } catch (error) {
    logError(error, 'LOGIN_TRACKING');
    throw error;
  }
};

// تنظيف البيانات المدخلة
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<[^>]*>/g, '') // إزالة وسوم HTML
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s.,!?-]/g, '') // السماح بالعربية والإنجليزية والأرقام وبعض الرموز
    .trim();
};