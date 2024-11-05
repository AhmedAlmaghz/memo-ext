import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from '../services/authService';

const MENU_ITEMS = [
  { path: '/', label: 'تدوين ملاحظات', icon: '📝' },
  { path: '/search', label: 'بحث', icon: '🔍' },
  { path: '/settings', label: 'الإعدادات', icon: '⚙️' }
];

const Layout = ({ children, toggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  }, [navigate]);

  const isActivePath = useCallback((path) => {
    return location.pathname === path;
  }, [location]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <nav className="w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="p-4 border-b dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            مدون الملاحظات
          </h1>
        </div>

        {/* Navigation Menu */}
        <ul className="mt-4">
          {MENU_ITEMS.map(({ path, label, icon }) => (
            <li key={path}>
              <Link
                to={path}
                className={`
                  flex items-center px-4 py-3 text-gray-700 dark:text-gray-300
                  hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
                  ${isActivePath(path) ? 'bg-blue-50 dark:bg-gray-700' : ''}
                `}
              >
                <span className="mr-3">{icon}</span>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Theme Toggle & Sign Out */}
        <div className="absolute bottom-0 w-64 p-4 border-t dark:border-gray-700">
          <button
            onClick={toggleTheme}
            className="w-full mb-2 p-2 text-gray-700 dark:text-gray-300 
                     hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="تبديل السمة"
          >
            <span className="flex items-center">
              <span className="mr-2">🌓</span>
              تبديل السمة
            </span>
          </button>
          <button
            onClick={handleSignOut}
            className="w-full p-2 bg-red-500 text-white rounded 
                     hover:bg-red-600 transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 
                     text-gray-900 dark:text-white p-8">
        {children}
      </main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  toggleTheme: PropTypes.func.isRequired
};

export default React.memo(Layout);