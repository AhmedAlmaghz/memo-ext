import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { signUp, signIn } from '../services/authService';

const AuthForm = ({ showNotification }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { email, password } = formData;
      if (isSignUp) {
        await signUp(email, password);
        showNotification('تم إنشاء الحساب بنجاح', 'success');
      } else {
        await signIn(email, password);
        showNotification('تم تسجيل الدخول بنجاح', 'success');
      }
      navigate('/');
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
        </h2>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="البريد الإلكتروني"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="كلمة المرور"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 text-white rounded transition-colors
            ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {loading ? 'جاري التحميل...' : (isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول')}
        </button>
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full p-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
        >
          {isSignUp ? 'لديك حساب بالفعل؟ سجل دخولك' : 'ليس لديك حساب؟ سجل الآن'}
        </button>
      </form>
    </div>
  );
};

AuthForm.propTypes = {
  showNotification: PropTypes.func.isRequired
};

export default AuthForm;
