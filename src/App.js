// import React, { useState, useEffect, Suspense, lazy } from 'react';
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import NoteTaking from './pages/NoteTaking';
// import Search from './pages/Search';
// import Settings from './pages/Settings';
// import NoteDetail from './pages/NoteDetail';
// import AuthForm from './components/AuthForm';
// import Layout from './components/Layout';
// import Notification from './components/Notification';
// import ErrorBoundary from './components/ErrorBoundary';
// import { getCurrentUser } from './services/authService';
// import { useCloudSync } from './hooks/useCloudSync';
// import { useShortcuts } from './utils/shortcuts';
// import { useNotification } from './hooks/useNotification';
// import { useTheme } from './hooks/useTheme';
// import { AuthProvider } from './contexts/AuthContext';
// import { AppProvider } from './contexts/AppContext'; 


// const App = () => {
//   const [user, setUser] = useState(null);
//   const [notification, setNotification] = useState(null);
//   const { theme, toggleTheme } = useTheme();
//   const { showNotification } = useNotification();
//   // const { syncData } = useCloudSync(); // تفعيل useCloudSync
//   useShortcuts(); // تفعيل useShortcuts

  
//   useEffect(() => {
//     const fetchUser = async () => {
//       const currentUser = await getCurrentUser();
//       setUser(currentUser);
//     };
//     fetchUser();
    
//   }, []);
//   // syncData(); // استدعاء دالة مزامنة البيانات
//   // }, [syncData]); // إضافة syncData كاعتماد

//   return (
//     <ErrorBoundary>
//       <AuthProvider>
//         <AppProvider>
//         <Router>
//           <div className={`${theme} min-h-screen`}>
//             <Suspense fallback={<div>Loading...</div>}>
//               {user ? (
//                 <Layout toggleTheme={toggleTheme}>
//                   <Routes>
//                     <Route path="/" element={<NoteTaking showNotification={showNotification} />} />
//                     <Route path="/search" element={<Search />} />
//                     <Route path="/settings" element={<Settings showNotification={showNotification} toggleTheme={toggleTheme} />} />
//                     <Route path="/note/:id" element={<NoteDetail showNotification={showNotification} />} />
//                     <Route path="*" element={<Navigate to="/" replace />} />
//                   </Routes>
//                 </Layout>
//               ) : (
//                 <Routes>
//                   <Route path="/auth" element={<AuthForm showNotification={showNotification} />} />
//                   <Route path="*" element={<Navigate to="/auth" replace />} />
//                 </Routes>
//               )}
//             </Suspense>
//             {notification && <Notification {...notification} />}
//           </div>
//         </Router>
//           </AppProvider>
//       </AuthProvider>
//     </ErrorBoundary>
//   );
// };

// export default App;

import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NoteTaking from './pages/NoteTaking';
import Search from './pages/Search';
import Settings from './pages/Settings';
import NoteDetail from './pages/NoteDetail';
import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import Notification from './components/Notification';
import ErrorBoundary from './components/ErrorBoundary';
import { getCurrentUser } from './services/authService';
import { useNotification } from './hooks/useNotification';
import { useTheme } from './hooks/useTheme';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext'; // تأكد من استيراد AppProvider

const App = () => {
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider> {/* تأكد من تغليف التطبيق بـ AppProvider */}
          <Router>
            <div className={`${theme} min-h-screen`}>
              <Suspense fallback={<div>Loading...</div>}>
                {user ? (
                  <Layout toggleTheme={toggleTheme}>
                    <Routes>
                      <Route path="/" element={<NoteTaking showNotification={showNotification} />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/settings" element={<Settings showNotification={showNotification} toggleTheme={toggleTheme} />} />
                      <Route path="/note/:id" element={<NoteDetail showNotification={showNotification} />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                ) : (
                  <Routes>
                    <Route path="/auth" element={<AuthForm showNotification={showNotification} />} />
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                  </Routes>
                )}
              </Suspense>
              {notification && <Notification {...notification} />}
            </div>
          </Router>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;