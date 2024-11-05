import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../config/supabase';
import { logError } from '../services/errorService';
import { APP_CONFIG } from '../config/constants';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // تحميل الجلسة الحالية
  useEffect(() => {
    const loadSession = async () => {
      try {
        // التحقق من الجلسة الحالية
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        logError(error, 'AUTH_SESSION_LOAD');
        setError('فشل في تحميل بيانات المستخدم');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // الاستماع لتغييرات حالة المصادقة
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setSession(session);

        // تحديث آخر نشاط للمستخدم
        if (session?.user) {
          const { error } = await supabase
            .from('user_sessions')
            .upsert({
              user_id: session.user.id,
              last_activity: new Date().toISOString(),
              event
            });

          if (error) {
            logError(error, 'AUTH_ACTIVITY_UPDATE');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // تسجيل الدخول
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logError(error, 'AUTH_SIGN_IN');
      throw new Error('فشل في تسجيل الدخول');
    }
  };

  // إنشاء حساب جديد
  const signUp = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...metadata,
            created_at: new Date().toISOString()
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logError(error, 'AUTH_SIGN_UP');
      throw new Error('فشل في إنشاء الحساب');
    }
  };

  // تسجيل الخروج
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      logError(error, 'AUTH_SIGN_OUT');
      throw new Error('فشل في تسجيل الخروج');
    }
  };

  // تحديث بيانات المستخدم
  const updateUser = async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logError(error, 'AUTH_UPDATE_USER');
      throw new Error('فشل في تحديث بيانات المستخدم');
    }
  };

  // إعادة تعيين كلمة المرور
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
    } catch (error) {
      logError(error, 'AUTH_RESET_PASSWORD');
      throw new Error('فشل في إرسال رابط إعادة تعيين كلمة المرور');
    }
  };

  // التحقق من صلاحية الجلسة
  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (!session) return false;

      const sessionAge = Date.now() - new Date(session.created_at).getTime();
      return sessionAge < APP_CONFIG.AUTH.SESSION_TIMEOUT;
    } catch (error) {
      logError(error, 'AUTH_CHECK_SESSION');
      return false;
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateUser,
    resetPassword,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}; 