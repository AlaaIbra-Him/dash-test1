import { useState, useEffect } from 'react';
import { LogOut, Plus, Trash2, Calendar, User, TrendingUp } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
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

  // 1. Authentication and Authorization Check
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();

        // If no session, redirect to login page (/)
        if (!session) {
          navigate('/');
          return;
        }

        const userId = session.user.id;

        // Fetch user profile to check role
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', userId)
          .single();

        // If error or not an admin, redirect
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
    fetchDoctorsAndStats(); // Fetch data once authorized (or on initial load)
  }, [navigate]);

  // 2. Fetch Doctors and Global Stats
  const fetchDoctorsAndStats = async () => {
    try {
      // Fetch Doctors (role = 'doctor' from 'profiles' table)
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'doctor');

      if (doctorsError) throw doctorsError;

      if (doctorsData) {
        setDoctors(doctorsData);
        setStats(prev => ({ ...prev, totalDoctors: doctorsData.length }));
      }

      // Fetch All Appointments
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

  // 3. Fetch Specific Doctor Appointments
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
      window.alert('Error fetching appointments: ' + err.message);
    }
  };

  // 4. Create New Doctor (Supabase Auth and Profiles)
  // const handleCreateDoctor = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     // 1. Create User in Supabase Auth
  //     const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
  //       email: formData.email,
  //       password: formData.password
  //     });

  //     if (signUpError) throw signUpError;
  //     if (!authUser) throw new Error("User creation failed in Auth.");

  //     const userId = authUser.id;

  //     // 2. Create Profile entry (which links to the Auth user)
  //     // Note: Supabase's profile trigger might handle this automatically if set up.
  //     // We do it manually here for robustness if the trigger is missing/delayed.
  //     const { error: profileError } = await supabase
  //       .from('profiles')
  //       .insert([
  //         {
  //           id: userId,
  //           email: formData.email,
  //           full_name: formData.fullName,
  //           specialty: formData.specialty,
  //           role: 'doctor',
  //           created_at: new Date().toISOString()
  //         }
  //       ]);

  //     if (profileError) {
  //       // If profile insertion fails, attempt to delete the Auth user
  //       console.warn('Profile insertion failed. Attempting to delete Auth user.');
  //       // Note: The Admin role might not have permission to delete other users.
  //       // This is a common point of failure in Supabase RLS/Permissions.
  //       // You might need a PostgreSQL function or edge function for safe deletion.
  //       await supabase.rpc('delete_user_by_id', { user_id_to_delete: userId });

  //       throw profileError;
  //     }

  //     window.alert(`✅ Doctor added successfully!\n\nID: ${userId}\nEmail: ${formData.email}\nPassword: ${formData.password}`);

  //     setFormData({ email: '', password: '', fullName: '', specialty: '' });
  //     setShowForm(false);

  //     // Refresh data
  //     fetchDoctorsAndStats();

  //   } catch (err) {
  //     console.error('Error creating doctor:', err);
  //     window.alert(`❌ Error creating doctor: ${err.message}. Check Supabase RLS for Auth/Profiles.`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };




  // In AdminDashboard.jsx - Replace the handleCreateDoctor function





















  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ إرسال البيانات للسيرفر المحلي
      const res = await fetch("http://localhost:3000/createDoctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // 2️⃣ التحقق من نجاح الاستجابة
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error response:", errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      // 3️⃣ قراءة البيانات المرسلة من السيرفر
      const data = await res.json();
      alert(`✅ Doctor created! ID: ${data.userId}`);

      // 4️⃣ إعادة تعيين الفورم وإغلاقه
      setFormData({ email: "", password: "", fullName: "", specialty: "" });
      setShowForm(false);

      // 5️⃣ تحديث قائمة الأطباء والإحصائيات
      fetchDoctorsAndStats();

    } catch (err) {
      alert(`❌ Error: ${err.message}\n\nMake sure:\n1. Server is running on http://localhost:3000\n2. .env variables are set correctly\n3. Node server.js is active`);
      console.error("Full error details:", err);
    } finally {
      setLoading(false);
    }
  };










  // const res = await fetch(functionUrl, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${supabaseAnonKey}`, // Add authorization header
  //   },
  //   body: JSON.stringify(formData)
  // });









  // ============================================================================
  // const handleCreateDoctor = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/createDoctor`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(formData)
  //     });

  //     const data = await res.json();

  //     if (!res.ok) throw new Error(data.error || 'Error creating doctor');

  //     alert(`✅ Doctor created! ID: ${data.userId}`);
  //     setFormData({ email: '', password: '', fullName: '', specialty: '' });
  //     setShowForm(false);
  //     fetchDoctorsAndStats();

  //   } catch (err) {
  //     alert('❌ ' + err.message);
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };




  // 5. Delete Doctor (and associated data)
  const handleDeleteDoctor = async (doctorId, doctorEmail) => {
    if (!window.confirm(`CONFIRM: Delete doctor: ${doctorEmail} and all associated appointments?`)) return;

    try {
      setLoading(true);

      // 1. Delete associated appointments first (due to foreign key constraints)
      await supabase.from('appointments').delete().eq('doctor_id', doctorId);

      // 2. Delete the doctor profile
      await supabase.from('profiles').delete().eq('id', doctorId);

      // 3. Delete the Auth user (Requires correct RLS/Function setup, often done via RPC or Edge Function)
      // await supabase.rpc('delete_user_by_id', { user_id_to_delete: doctorId });

      window.alert('✅ Doctor and all associated data deleted successfully.');
      setSelectedDoctor(null);
      setDoctorAppointments([]);
      fetchDoctorsAndStats();

    } catch (err) {
      console.error('Error deleting doctor:', err);
      window.alert(`❌ Error: ${err.message}. Ensure Admin has delete permissions on 'profiles' and 'appointments'.`);
    } finally {
      setLoading(false);
    }
  };

  // 6. Delete Appointment
  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('CONFIRM: Delete this appointment?')) return;

    try {
      await supabase.from('appointments').delete().eq('id', appointmentId);
      window.alert('✅ Appointment deleted.');
      // Refresh views
      fetchDoctorAppointments(selectedDoctor);
      fetchDoctorsAndStats();
    } catch (err) {
      console.error('Error deleting appointment:', err);
      window.alert(`❌ Error: ${err.message}`);
    }
  };

  // 7. Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const appointmentPercentage = stats.totalAppointments > 0
    ? Math.round((stats.bookedAppointments / stats.totalAppointments) * 100)
    : 0;

  // --- Loading UI ---
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B8FAC]"></div>
          <p className="mt-4 text-gray-600">Loading Authorization...</p>
        </div>
      </div>
    );
  }

  // --- Main Dashboard UI ---
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-[#0B8FAC] text-white p-6 shadow-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              <TrendingUp className="w-7 h-7" /> Admin Insights
            </h1>
            <p className="text-blue-100 mt-1">Welcome, <span className="font-semibold">{adminName}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#0B8FAC] rounded-full hover:bg-gray-100 font-semibold transition shadow-md"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Doctors" value={stats.totalDoctors} color="border-blue-500" textColor="text-[#0B8FAC]" />
          <StatCard label="Total Appointments" value={stats.totalAppointments} color="border-green-500" textColor="text-green-600" />
          <StatCard label="Booked" value={stats.bookedAppointments} color="border-yellow-500" textColor="text-yellow-600" />
          <StatCard label="Cancelled" value={stats.cancelledAppointments} color="border-red-500" textColor="text-red-600" />
        </div>

        {/* Fill Rate Bar */}
        {stats.totalAppointments > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h3 className="text-[#0B8FAC] font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Appointment Fill Rate
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-[#0B8FAC] h-full rounded-full transition-all duration-700"
                  style={{ width: `${appointmentPercentage}%` }}
                />
              </div>
              <span className="text-2xl font-bold text-[#0B8FAC]">{appointmentPercentage}%</span>
            </div>
          </div>
        )}

        {/* Main Content: Doctors List and Appointment Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Doctors List Panel */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden lg:col-span-1">
            <div className="bg-[#0B8FAC] text-white p-4 flex justify-between items-center">
              <h2 className="font-bold text-lg">🩺 Registered Doctors ({doctors.length})</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-1 px-3 py-1 bg-white text-[#0B8FAC] rounded-full text-sm font-semibold hover:bg-gray-100 transition shadow-md"
              >
                <Plus className="w-4 h-4" />
                {showForm ? 'Close' : 'Add'}
              </button>
            </div>

            {/* Add Doctor Form */}
            {showForm && (
              <div className="p-4 border-b bg-blue-50">
                <form onSubmit={handleCreateDoctor} className="space-y-3">
                  <input type="email" placeholder="Email (Login ID)" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#0B8FAC]" />
                  <input type="password" placeholder="Password (Initial Login)" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#0B8FAC]" />
                  <input type="text" placeholder="Full Name (e.g., Dr. Smith)" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#0B8FAC]" />
                  <input type="text" placeholder="Specialty (e.g., Cardiology)" value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#0B8FAC]" />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Plus className="w-4 h-4" />}
                    {loading ? 'Adding...' : 'Add Doctor'}
                  </button>
                </form>
              </div>
            )}

            {/* Doctor List */}
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {doctors.length === 0 ? (
                <p className="p-4 text-gray-500 text-center text-sm">No doctors found. Add one above.</p>
              ) : (
                doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    onClick={() => fetchDoctorAppointments(doctor.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 transition ${selectedDoctor === doctor.id ? 'border-[#0B8FAC] bg-blue-50 shadow-inner' : 'border-gray-100'}`}
                  >
                    <h3 className="font-bold text-gray-800 truncate">{doctor.full_name}</h3>
                    <p className="text-[#0B8FAC] text-xs font-medium">{doctor.specialty}</p>
                    <p className="text-gray-500 text-xs truncate">📧 {doctor.email}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Doctor Details & Appointments Panel */}
          <div className="lg:col-span-2">
            {selectedDoctor && doctors.find(d => d.id === selectedDoctor) ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {doctors.find(d => d.id === selectedDoctor) && (
                  <>
                    {/* Doctor Header */}
                    <div className="bg-gradient-to-r from-[#0B8FAC] to-blue-600 text-white p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-3xl font-extrabold">{doctors.find(d => d.id === selectedDoctor)?.full_name}</h2>
                          <p className="text-blue-100 mt-1 text-lg">{doctors.find(d => d.id === selectedDoctor)?.specialty}</p>
                          <p className="text-blue-200 text-sm mt-2">📧 {doctors.find(d => d.id === selectedDoctor)?.email}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteDoctor(selectedDoctor, doctors.find(d => d.id === selectedDoctor)?.email)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-500 rounded-full text-sm font-semibold hover:bg-red-600 transition shadow-lg"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" /> {loading ? 'Deleting...' : 'Delete Doctor'}
                        </button>
                      </div>
                    </div>

                    {/* Doctor Stats Bar */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
                      <StatBlock label="Total Appts" value={doctorAppointments.length} color="text-[#0B8FAC]" icon={<Calendar className="w-5 h-5" />} />
                      <StatBlock label="Booked Appts" value={doctorAppointments.filter(a => a.status === 'booked').length} color="text-green-600" icon={<TrendingUp className="w-5 h-5" />} />
                      <StatBlock label="Cancelled" value={doctorAppointments.filter(a => a.status === 'cancelled').length} color="text-red-600" icon={<Trash2 className="w-5 h-5" />} />
                    </div>

                    {/* Appointments List */}
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-gray-800 mb-4">Appointments ({doctorAppointments.length})</h3>
                      <div className="space-y-4 max-h-[450px] overflow-y-auto">
                        {doctorAppointments.length === 0 ? (
                          <p className="text-gray-500 text-center p-8 text-md bg-gray-50 rounded-lg">No appointments booked for this doctor.</p>
                        ) : (
                          doctorAppointments.map((appt) => (
                            <div
                              key={appt.id}
                              className={`p-4 rounded-xl shadow-sm border-l-4 transition flex justify-between items-center ${appt.status === 'booked'
                                ? 'border-green-500 bg-green-50'
                                : 'border-red-500 bg-red-50'
                                }`}
                            >
                              <div className="flex-1">
                                <p className="font-bold text-gray-900 flex items-center gap-2">
                                  <User className="w-4 h-4 text-[#0B8FAC]" /> {appt.patient_name}
                                </p>
                                <p className="text-gray-600 text-sm mt-1">📅 {appt.date} at 🕐 {appt.time}</p>
                                <p className="text-gray-600 text-sm">📞 {appt.phone} &bull; Age: {appt.age}</p>
                                <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold ${appt.status === 'booked'
                                  ? 'bg-green-200 text-green-800'
                                  : 'bg-red-200 text-red-800'
                                  }`}>
                                  {appt.status === 'booked' ? 'Confirmed' : 'Cancelled'}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteAppointment(appt.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold hover:bg-red-600 transition shadow-md"
                              >
                                <Trash2 className="w-3 h-3 inline mr-1" /> Delete
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-16 text-center h-full flex flex-col justify-center items-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">Select a doctor from the list to view their appointment history and details.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Simple component for displaying stats
const StatCard = ({ label, value, color, textColor }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${color} hover:shadow-xl transition transform hover:-translate-y-0.5`}>
    <p className="text-gray-600 text-sm font-semibold">{label}</p>
    <p className={`text-4xl font-bold ${textColor} mt-2`}>{value}</p>
  </div>
);

// Simple component for displaying doctor stats
const StatBlock = ({ label, value, color, icon }) => (
  <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
    <div className={`p-2 rounded-full ${color} bg-opacity-10`} style={{ backgroundColor: `${color.replace('text-', '')}-100` }}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium uppercase">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
);