// src/components/AdminDashboard.jsx - Part 1 (Header & State)
import { useState, useEffect, useContext } from 'react';
import { LogOut, Plus, Trash2, Calendar, User, TrendingUp, Sun, Moon } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';

export default function AdminDashboard() {
  const { darkMode, toggleDarkMode, language, toggleLanguage, t } = useContext(AppContext);
  const [adminName, setAdminName] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalAppointments: 0,
    bookedAppointments: 0,
    cancelledAppointments: 0
  });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    specialty: ''
  });
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  // Authentication Check
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/');
          return;
        }

        const userId = session.user.id;
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', userId)
          .single();

        if (error || data?.role !== 'admin') {
          console.error('Access Denied or Profile Error:', error);
          navigate('/');
        } else {
          setAdminName(data.full_name || 'Admin');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        navigate('/');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAdmin();
    fetchDoctorsAndStats();
  }, [navigate]);

  // Fetch Doctors and Stats
  const fetchDoctorsAndStats = async () => {
    try {
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'doctor');

      if (doctorsError) throw doctorsError;

      if (doctorsData) {
        setDoctors(doctorsData);
        setStats(prev => ({ ...prev, totalDoctors: doctorsData.length }));
      }

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*');

      if (appointmentsError) throw appointmentsError;

      if (appointmentsData) {
        const booked = appointmentsData.filter(a => a.status === 'booked').length;
        const cancelled = appointmentsData.filter(a => a.status === 'cancelled').length;

        setStats(prev => ({
          ...prev,
          totalAppointments: appointmentsData.length,
          bookedAppointments: booked,
          cancelledAppointments: cancelled
        }));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Fetch Doctor Appointments
  const fetchDoctorAppointments = async (doctorId) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('date', { ascending: false });

      if (error) throw error;
      if (data) {
        setDoctorAppointments(data);
        setSelectedDoctor(doctorId);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      window.alert(`${t.error}: ${err.message}`);
    }
  };

  // Create Doctor
  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/createDoctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      if (!data.success || !data.userId) {
        throw new Error("Invalid response from server");
      }

      alert(`${t.doctorCreatedDetails} ${data.userId}\n${t.name} ${data.fullName}\n${t.email}: ${data.email}`);

      setFormData({ email: "", password: "", fullName: "", specialty: "" });
      setShowForm(false);
      fetchDoctorsAndStats();

    } catch (err) {
      console.error("Error:", err);
      alert(`${t.error}: ${err.message}\n\n${t.makesSure}:\n1. ${t.serverRunning}\n2. ${t.envVariablesSet}\n3. ${t.npmStart}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete Doctor
  const handleDeleteDoctor = async (doctorId, doctorEmail) => {
    if (!window.confirm(`${t.confirmDeleteDoctor} ${doctorEmail} ${t.andAllAppointments}`))
      return;

    try {
      setLoading(true);

      const res = await fetch(`http://localhost:3000/deleteDoctor/${doctorId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Delete failed");
      }

      alert(t.doctorDeleted);
      setSelectedDoctor(null);
      setDoctorAppointments([]);
      fetchDoctorsAndStats();

    } catch (err) {
      console.error('Error deleting doctor:', err);
      alert(`${t.error}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete Appointment
  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm(t.confirmDeleteAppointment)) return;

    try {
      await supabase.from('appointments').delete().eq('id', appointmentId);
      alert(t.successDelete);
      fetchDoctorAppointments(selectedDoctor);
      fetchDoctorsAndStats();
    } catch (err) {
      console.error('Error deleting appointment:', err);
      alert(`${t.error}: ${err.message}`);
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const appointmentPercentage = stats.totalAppointments > 0
    ? Math.round((stats.bookedAppointments / stats.totalAppointments) * 100)
    : 0;

  // Loading UI
  if (authLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B8FAC]"></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.loading}</p>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#0B8FAC] text-white'} p-6 shadow-xl sticky top-0 z-10 border-b transition-colors`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-extrabold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-white'}`}>
              <TrendingUp className="w-7 h-7" /> {t.adminInsights}
            </h1>
            <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-blue-100'}`}>{t.welcome}, <span className="font-semibold">{adminName}</span></p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white text-[#0B8FAC] hover:bg-gray-100'}`}
            >
              {language === 'ar' ? 'EN' : 'AR'}
            </button>

            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white text-[#0B8FAC] hover:bg-gray-100'}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition ${darkMode ? 'bg-red-900 hover:bg-red-800 text-white' : 'bg-white text-[#0B8FAC] hover:bg-gray-100'}`}
            >
              <LogOut className="w-5 h-5" />
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label={t.totalDoctors} value={stats.totalDoctors} color="border-blue-500" textColor="text-[#0B8FAC]" darkMode={darkMode} />
          <StatCard label={t.totalAppointments} value={stats.totalAppointments} color="border-green-500" textColor="text-green-600" darkMode={darkMode} />
          <StatCard label={t.bookedAppointments} value={stats.bookedAppointments} color="border-yellow-500" textColor="text-yellow-600" darkMode={darkMode} />
          <StatCard label={t.cancelledAppointments} value={stats.cancelledAppointments} color="border-red-500" textColor="text-red-600" darkMode={darkMode} />
        </div>

        {/* Fill Rate Bar */}
        {stats.totalAppointments > 0 && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-8 transition-colors`}>
            <h3 className="text-[#0B8FAC] font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> {t.appointmentFillRate}
            </h3>
            <div className="flex items-center gap-4">
              <div className={`flex-1 rounded-full h-5 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="bg-gradient-to-r from-blue-500 to-[#0B8FAC] h-full rounded-full transition-all duration-700"
                  style={{ width: `${appointmentPercentage}%` }}
                />
              </div>
              <span className="text-2xl font-bold text-[#0B8FAC]">{appointmentPercentage}%</span>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctors List */}
          <DoctorsPanel 
            doctors={doctors}
            selectedDoctor={selectedDoctor}
            showForm={showForm}
            setShowForm={setShowForm}
            formData={formData}
            setFormData={setFormData}
            loading={loading}
            handleCreateDoctor={handleCreateDoctor}
            fetchDoctorAppointments={fetchDoctorAppointments}
            darkMode={darkMode}
            t={t}
          />

          {/* Doctor Details */}
          <DoctorDetailsPanel
            selectedDoctor={selectedDoctor}
            doctors={doctors}
            doctorAppointments={doctorAppointments}
            handleDeleteDoctor={handleDeleteDoctor}
            handleDeleteAppointment={handleDeleteAppointment}
            loading={loading}
            darkMode={darkMode}
            t={t}
          />
        </div>
      </main>
    </div>
  );
}

// Stat Card Component
const StatCard = ({ label, value, color, textColor, darkMode }) => (
  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg border-l-4 ${color} hover:shadow-xl transition transform hover:-translate-y-0.5`}>
    <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
    <p className={`text-4xl font-bold ${textColor} mt-2`}>{value}</p>
  </div>
);

// Doctors Panel Component
const DoctorsPanel = ({ doctors, selectedDoctor, showForm, setShowForm, formData, setFormData, loading, handleCreateDoctor, fetchDoctorAppointments, darkMode, t }) => (
  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden lg:col-span-1`}>
    <div className={`${darkMode ? 'bg-gray-700' : 'bg-[#0B8FAC]'} text-white p-4 flex justify-between items-center transition-colors`}>
      <h2 className="font-bold text-lg">🩺 {t.registeredDoctors} ({doctors.length})</h2>
      <button
        onClick={() => setShowForm(!showForm)}
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold transition ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-white text-[#0B8FAC] hover:bg-gray-100'}`}
      >
        <Plus className="w-4 h-4" />
        {showForm ? t.close : t.add}
      </button>
    </div>

    {showForm && (
      <div className={`p-4 border-b ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-gray-200'}`}>
        <form onSubmit={handleCreateDoctor} className="space-y-3">
          <input type="email" placeholder={t.emailLoginId} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className={`w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-[#0B8FAC] transition ${darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} />
          <input type="password" placeholder={t.passwordInitialLogin} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className={`w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-[#0B8FAC] transition ${darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} />
          <input type="text" placeholder={t.drName} value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required className={`w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-[#0B8FAC] transition ${darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} />
          <input type="text" placeholder={t.specialtyExample} value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} required className={`w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-[#0B8FAC] transition ${darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} />
          <button type="submit" disabled={loading} className="w-full px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Plus className="w-4 h-4" />}
            {loading ? t.adding : t.addDoctor}
          </button>
        </form>
      </div>
    )}

    <div className={`divide-y max-h-[600px] overflow-y-auto ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
      {doctors.length === 0 ? (
        <p className={`p-4 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.addDoctor}</p>
      ) : (
        doctors.map((doctor) => (
          <div
            key={doctor.id}
            onClick={() => fetchDoctorAppointments(doctor.id)}
            className={`p-4 cursor-pointer border-l-4 transition ${selectedDoctor === doctor.id ? `${darkMode ? 'border-[#0B8FAC] bg-gray-700' : 'border-[#0B8FAC] bg-blue-50'}` : `${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}`}
          >
            <h3 className={`font-bold truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>{doctor.full_name}</h3>
            <p className="text-[#0B8FAC] text-xs font-medium">{doctor.specialty}</p>
            <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>📧 {doctor.email}</p>
          </div>
        ))
      )}
    </div>
  </div>
);

// Doctor Details Panel Component
const DoctorDetailsPanel = ({ selectedDoctor, doctors, doctorAppointments, handleDeleteDoctor, handleDeleteAppointment, loading, darkMode, t }) => {
  const doctor = doctors.find(d => d.id === selectedDoctor);

  if (!selectedDoctor || !doctor) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-16 text-center h-full flex flex-col justify-center items-center lg:col-span-2 transition-colors`}>
        <Calendar className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
        <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.doctorAppointments}</p>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden lg:col-span-2 transition-colors`}>
      {/* Doctor Header */}
      <div className={`bg-gradient-to-r from-[#0B8FAC] to-blue-600 text-white p-6`}>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-extrabold">{doctor.full_name}</h2>
            <p className="text-blue-100 mt-1 text-lg">{doctor.specialty}</p>
            <p className="text-blue-200 text-sm mt-2">📧 {doctor.email}</p>
          </div>
          <button
            onClick={() => handleDeleteDoctor(selectedDoctor, doctor.email)}
            className="flex items-center gap-1 px-3 py-1 bg-red-500 rounded-full text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
            disabled={loading}
          >
            <Trash2 className="w-4 h-4" /> {loading ? t.deleting : t.deleteDoctor}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className={`grid grid-cols-3 gap-4 p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <StatBlock label={t.totalAppts} value={doctorAppointments.length} color="text-[#0B8FAC]" icon={<Calendar className="w-5 h-5" />} darkMode={darkMode} />
        <StatBlock label={t.bookedAppts} value={doctorAppointments.filter(a => a.status === 'booked').length} color="text-green-600" icon={<TrendingUp className="w-5 h-5" />} darkMode={darkMode} />
        <StatBlock label={t.cancelledAppointments} value={doctorAppointments.filter(a => a.status === 'cancelled').length} color="text-red-600" icon={<Trash2 className="w-5 h-5" />} darkMode={darkMode} />
      </div>

      {/* Appointments */}
      <div className="p-6">
        <h3 className="font-bold text-xl mb-4">{t.allAppointments} ({doctorAppointments.length})</h3>
        <div className={`space-y-4 max-h-[450px] overflow-y-auto`}>
          {doctorAppointments.length === 0 ? (
            <p className={`text-center p-8 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>{t.noAppointmentsToday}</p>
          ) : (
            doctorAppointments.map((appt) => (
              <div
                key={appt.id}
                className={`p-4 rounded-xl shadow-sm border-l-4 flex justify-between items-center transition ${appt.status === 'booked'
                  ? `${darkMode ? 'border-green-600 bg-gray-700' : 'border-green-500 bg-green-50'}`
                  : `${darkMode ? 'border-red-600 bg-gray-700' : 'border-red-500 bg-red-50'}`
                }`}
              >
                <div className="flex-1">
                  <p className={`font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <User className="w-4 h-4 text-[#0B8FAC]" /> {appt.patient_name}
                  </p>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>📅 {appt.date} at 🕐 {appt.time}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>📞 {appt.phone} • {t.age}: {appt.age}</p>
                  <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold ${appt.status === 'booked'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-red-200 text-red-800'
                  }`}>
                    {appt.status === 'booked' ? t.confirmed : t.cancelled}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteAppointment(appt.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold hover:bg-red-600 transition shadow-md"
                >
                  <Trash2 className="w-3 h-3 inline mr-1" /> {t.delete}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Block Component
const StatBlock = ({ label, value, color, icon, darkMode }) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg shadow-sm border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-100'}`}>
    <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : color.replace('text-', 'bg-') + '-100'}`}>
      <div className={color}>{icon}</div>
    </div>
    <div>
      <p className={`text-xs font-medium uppercase ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
);