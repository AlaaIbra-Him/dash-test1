import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import { supabase } from './supabaseClient';

function AppWrapper() {
  // لازم نستخدم Wrapper عشان نقدر نستعمل useNavigate
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  function handleLoginSuccess(role) {
    if (role === 'admin') navigate('/admin');
    if (role === 'doctor') navigate('/doctor');
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/doctor" element={<DoctorDashboard />} />
    </Routes>
  );
}

export default AppWrapper;
