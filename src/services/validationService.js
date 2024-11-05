import * as yup from 'yup';
import { logError, ErrorTypes } from './errorService';

// مخططات التحقق
const schemas = {
  note: yup.object().shape({
    siteName: yup.string().required('اسم الموقع مطلوب'),
    siteUrl: yup.string().url('الرابط غير صالح').required('الرابط مطلوب'),
    description: yup.string().min(10, 'الوصف قصير جداً'),
    tags: yup.array().of(yup.string()),
    category: yup.string().required('التصنيف مطلوب')
  }),

  user: yup.object().shape({
    email: yup.string().email('البريد الإلكتروني غير صالح').required('البريد الإلكتروني مطلوب'),
    password: yup.string()
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      .matches(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
      .matches(/[a-z]/, 'يجب أن تحتوي على حرف صغير')
      .matches(/[0-9]/, 'يجب أن تحتوي على رقم')
      .matches(/[^A-Za-z0-9]/, 'يجب أن تحتوي على رمز خاص')
      .required('كلمة المرور مطلوبة'),
    displayName: yup.string().min(2, 'الاسم قصير جداً')
  }),

  category: yup.object().shape({
    name: yup.string().required('اسم التصنيف مطلوب'),
    icon: yup.string(),
    color: yup.string().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'لون غير صالح')
  })
};

// التحقق من صحة البيانات
export const validateData = async (data, schemaName) => {
  try {
    const schema = schemas[schemaName];
    if (!schema) {
      throw new Error(`مخطط غير موجود: ${schemaName}`);
    }

    return await schema.validate(data, { abortEarly: false });
  } catch (error) {
    logError(error, ErrorTypes.VALIDATION);
    throw error;
  }
};

// التحقق من صحة حقل واحد
export const validateField = async (value, fieldName, schemaName) => {
  try {
    const schema = schemas[schemaName];
    if (!schema) {
      throw new Error(`مخطط غير موجود: ${schemaName}`);
    }

    const fieldSchema = schema.fields[fieldName];
    if (!fieldSchema) {
      throw new Error(`حقل غير موجود: ${fieldName}`);
    }

    return await fieldSchema.validate(value);
  } catch (error) {
    logError(error, ErrorTypes.VALIDATION);
    throw error;
  }
};

// تنسيق رسائل الخطأ
export const formatValidationErrors = (error) => {
  if (!error.inner) {
    return { [error.path]: error.message };
  }

  return error.inner.reduce((acc, err) => {
    acc[err.path] = err.message;
    return acc;
  }, {});
}; 