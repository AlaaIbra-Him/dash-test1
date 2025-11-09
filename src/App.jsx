import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import { supabase } from './supabaseClient';

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // ← الجديد: loading state
  const navigate = useNavigate();

  useEffect(() => {
    // الخطوة 1: التحقق من الـ session الموجودة
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setSession(session);
          // إذا كان في session، الـ user يبقى logged in
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setSession(null);
      } finally {
        setLoading(false); // ← نهاية التحميل
      }
    };

    checkSession();

    // الخطوة 2: الاستماع للتغييرات في الـ auth state
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
    // المسار بيتحدد بناء على الـ role
    if (role === 'admin') navigate('/admin');
    else if (role === 'doctor') navigate('/doctor');
  }

  // لو في loading، نعرض شيء بسيط
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