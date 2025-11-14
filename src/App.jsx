// src/App.jsx
import { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import { supabase } from './supabaseClient';
import { translations } from './i18n/translations';

// إنشاء Context للإعدادات العامة
// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export function AppContextProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('ar');

  // حفظ التفضيلات في localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedLang = localStorage.getItem('language') || 'ar';
    setDarkMode(savedTheme === 'dark');
    setLanguage(savedLang);
  }, []);

  // تحديث localStorage عند التغيير
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleLanguage = () => setLanguage(language === 'ar' ? 'en' : 'ar');
  const t = translations[language];

  return (
    <AppContext.Provider value={{ darkMode, toggleDarkMode, language, toggleLanguage, t }}>
      {children}
    </AppContext.Provider>
  );
}

function AppWrapper() {
  return (
    <Router>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </Router>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSession(session);
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state changed:', _event, session?.user?.email);
        setSession(session);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  function handleLoginSuccess(role) {
    if (role === 'admin') navigate('/admin');
    else if (role === 'doctor') navigate('/doctor');
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/admin" element={session ? <AdminDashboard /> : <LandingPage onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/doctor" element={session ? <DoctorDashboard /> : <LandingPage onLoginSuccess={handleLoginSuccess} />} />
    </Routes>
  );
}

export default AppWrapper;