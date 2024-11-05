import { supabase } from '../config/supabase';
import { logError } from './errorService';

// إنشاء حساب جديد
export const signUp = async (email, password, displayName) => {
  try {
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    });

    if (error) throw error;
    return user;
  } catch (error) {
    logError(error, 'AUTH_SIGNUP');
    throw new Error('فشل في إنشاء الحساب');
  }
};

// تسجيل الدخول
export const signIn = async (email, password) => {
  try {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return user;
  } catch (error) {
    logError(error, 'AUTH_SIGNIN');
    throw new Error('فشل في تسجيل الدخول');
  }
};

// تسجيل الخروج
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    logError(error, 'AUTH_SIGNOUT');
    throw new Error('فشل في تسجيل الخروج');
  }
};

// إعادة تعيين كلمة المرور
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  } catch (error) {
    logError(error, 'AUTH_RESET_PASSWORD');
    throw new Error('فشل في إرسال رابط إعادة تعيين كلمة المرور');
  }
};

// تحديث الملف الشخصي
export const updateProfile = async (updates) => {
  try {
    const { data: { user }, error } = await supabase.auth.updateUser({
      data: updates
    });

    if (error) throw error;
    return user;
  } catch (error) {
    logError(error, 'AUTH_UPDATE_PROFILE');
    throw new Error('فشل في تحديث الملف الشخصي');
  }
};

// الحصول على المستخدم الحالي
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    logError(error, 'AUTH_GET_USER');
    return null;
  }
};

// الاستماع لتغييرات حالة المصادقة
export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });

  return () => subscription.unsubscribe();
};