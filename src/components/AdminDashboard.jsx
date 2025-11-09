import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      const userId = session.user.id;
      const { data, error } = await supabase.from('profiles').select('full_name, role').eq('id', userId).single();

      if (error || data.role !== 'admin') {
        navigate('/');
      } else {
        setAdminName(data.full_name);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#0B8FAC] text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span>{adminName}</span>
          <button onClick={handleLogout} className="flex items-center gap-1 hover:opacity-80">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      <main className="p-8">
        <h2 className="text-[#0B8FAC] text-lg mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-gray-600">Total Doctors</h3>
            <p className="text-2xl font-bold mt-2">12</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-gray-600">Appointments Today</h3>
            <p className="text-2xl font-bold mt-2">8</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-gray-600">Active Users</h3>
            <p className="text-2xl font-bold mt-2">50k+</p>
          </div>
        </div>
      </main>
    </div>
  );
}
