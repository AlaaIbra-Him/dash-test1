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

  // Check if user is admin and load data
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

  // Fetch all doctors and statistics
  const fetchDoctorsAndStats = async () => {
    try {
      // Fetch doctors
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'doctor');

      if (!doctorsError) {
        setDoctors(doctorsData || []);
        setStats(prev => ({ ...prev, totalDoctors: doctorsData?.length || 0 }));
      }

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*');

      if (!appointmentsError && appointmentsData) {
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

  // Fetch appointments for selected doctor
  const fetchDoctorAppointments = async (doctorId) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('date', { ascending: false });

      if (!error) {
        setDoctorAppointments(data || []);
        setSelectedDoctor(doctorId);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  // Create new doctor account












  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Create user in Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if (signUpError) throw signUpError;

      if (!authData.user) throw new Error('User creation failed');

      // Step 2: Add profile to database
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          specialty: formData.specialty,
          role: 'doctor',
          password_changed: false,
          created_at: new Date().toISOString()
        }
      ]);

      if (profileError) throw profileError;

      alert(`✅ Doctor account created successfully!\n\nEmail: ${formData.email}\nPassword: ${formData.password}\n\nNote: Doctor may need to confirm email`);
      setFormData({ email: '', password: '', fullName: '', specialty: '' });
      setShowForm(false);
      fetchDoctorsAndStats();

    } catch (err) {
      console.error('Error:', err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete doctor and their appointments
  const handleDeleteDoctor = async (doctorId, doctorEmail) => {
    if (!window.confirm(`⚠️ Delete doctor: ${doctorEmail}?\nAll appointments will be deleted too!`)) return;

    try {
      // Delete appointments
      await supabase.from('appointments').delete().eq('doctor_id', doctorId);

      // Delete profile
      await supabase.from('profiles').delete().eq('id', doctorId);

      // Try to delete auth user
      try {
        await supabase.auth.admin.deleteUser(doctorId);
      } catch (authErr) {
        console.log('Note: Auth user deletion may require additional permissions');
      }

      alert('✅ Doctor deleted successfully');
      setSelectedDoctor(null);
      setDoctorAppointments([]);
      fetchDoctorsAndStats();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  // Delete appointment
  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Delete this appointment?')) return;

    try {
      await supabase.from('appointments').delete().eq('id', appointmentId);
      fetchDoctorAppointments(selectedDoctor);
      fetchDoctorsAndStats();
      alert('✅ Appointment deleted');
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Calculate appointment percentage
  const appointmentPercentage = stats.totalAppointments > 0
    ? Math.round((stats.bookedAppointments / stats.totalAppointments) * 100)
    : 0;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B8FAC]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#0B8FAC] text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">📊 Admin Dashboard</h1>
            <p className="text-blue-100 mt-1">Welcome, {adminName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#0B8FAC] rounded-lg hover:bg-gray-100 font-semibold transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Doctors</p>
                <p className="text-3xl font-bold text-[#0B8FAC] mt-2">{stats.totalDoctors}</p>
              </div>
              <User className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Appointments</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalAppointments}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Booked</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.bookedAppointments}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500 hover:shadow-lg transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Cancelled</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.cancelledAppointments}</p>
              </div>
              <Calendar className="w-8 h-8 text-red-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Appointment Percentage */}
        {stats.totalAppointments > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8 hover:shadow-lg transition">
            <h3 className="text-[#0B8FAC] font-bold mb-4 text-lg">Appointment Fill Rate</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-[#0B8FAC] h-full transition-all duration-500"
                  style={{ width: `${appointmentPercentage}%` }}
                ></div>
              </div>
              <span className="text-2xl font-bold text-[#0B8FAC]">{appointmentPercentage}%</span>
            </div>
          </div>
        )}

        {/* Doctors Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctors List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="bg-[#0B8FAC] text-white p-4 flex justify-between items-center">
                <h2 className="font-bold text-lg">Doctors</h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-1 px-3 py-1 bg-white text-[#0B8FAC] rounded-lg hover:bg-gray-100 text-sm font-semibold transition"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* Add Doctor Form */}
              {showForm && (
                <div className="p-4 border-b-2 border-gray-200 bg-gray-50">
                  <form onSubmit={handleCreateDoctor} className="space-y-3">
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#0B8FAC] focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#0B8FAC] focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#0B8FAC] focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Specialty (e.g., Neurologist)"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      required
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#0B8FAC] focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-3 py-2 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#0a7a94] text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {loading ? 'Creating...' : 'Create Account'}
                    </button>
                  </form>
                </div>
              )}

              {/* Doctors List */}
              <div className="divide-y max-h-96 overflow-y-auto">
                {doctors.length === 0 ? (
                  <p className="p-4 text-gray-600 text-center text-sm">No doctors yet</p>
                ) : (
                  doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => fetchDoctorAppointments(doctor.id)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition border-l-4 ${selectedDoctor === doctor.id ? 'border-[#0B8FAC] bg-blue-50' : 'border-gray-200'
                        }`}
                    >
                      <h3 className="font-semibold text-[#0B8FAC] truncate">{doctor.full_name}</h3>
                      <p className="text-gray-600 text-xs">{doctor.specialty}</p>
                      <p className="text-gray-500 text-xs mt-1 truncate">{doctor.email}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Doctor Details and Appointments */}
          <div className="lg:col-span-2">
            {selectedDoctor && doctors.find(d => d.id === selectedDoctor) ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                {/* Doctor Info */}
                {doctors.find(d => d.id === selectedDoctor) && (
                  <>
                    <div className="bg-gradient-to-r from-[#0B8FAC] to-blue-600 text-white p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold">{doctors.find(d => d.id === selectedDoctor)?.full_name}</h2>
                          <p className="text-blue-100 mt-1 text-lg">{doctors.find(d => d.id === selectedDoctor)?.specialty}</p>
                          <p className="text-blue-100 text-sm mt-2">📧 {doctors.find(d => d.id === selectedDoctor)?.email}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteDoctor(selectedDoctor, doctors.find(d => d.id === selectedDoctor)?.email)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 text-sm font-semibold transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Appointment Stats */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
                      <div className="text-center">
                        <p className="text-gray-600 text-xs font-semibold">Total Appointments</p>
                        <p className="text-2xl font-bold text-[#0B8FAC]">{doctorAppointments.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600 text-xs font-semibold">Booked</p>
                        <p className="text-2xl font-bold text-green-600">{doctorAppointments.filter(a => a.status === 'booked').length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600 text-xs font-semibold">Cancelled</p>
                        <p className="text-2xl font-bold text-red-600">{doctorAppointments.filter(a => a.status === 'cancelled').length}</p>
                      </div>
                    </div>

                    {/* Appointments List */}
                    <div className="p-4">
                      <h3 className="font-bold text-[#0B8FAC] mb-4 text-lg">Detailed Appointments</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {doctorAppointments.length === 0 ? (
                          <p className="text-gray-600 text-center text-sm">No appointments</p>
                        ) : (
                          doctorAppointments.map((appt) => (
                            <div
                              key={appt.id}
                              className={`p-3 rounded-lg border-l-4 transition ${appt.status === 'booked'
                                  ? 'border-green-500 bg-green-50 hover:bg-green-100'
                                  : 'border-red-500 bg-red-50 hover:bg-red-100'
                                }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-800">{appt.patient_name}</p>
                                  <p className="text-gray-600 text-sm">📅 Date: {appt.date}</p>
                                  <p className="text-gray-600 text-sm">🕐 Time: {appt.time}</p>
                                  <p className="text-gray-600 text-sm">📞 Phone: {appt.phone}</p>
                                  <p className="text-gray-600 text-sm">👤 Age: {appt.age}</p>
                                  <span className={`inline-block mt-2 px-2 py-1 text-xs rounded font-semibold ${appt.status === 'booked'
                                      ? 'bg-green-200 text-green-800'
                                      : 'bg-red-200 text-red-800'
                                    }`}>
                                    {appt.status === 'booked' ? '✅ Booked' : '❌ Cancelled'}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDeleteAppointment(appt.id)}
                                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 font-semibold transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center hover:shadow-lg transition">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-semibold">Select a doctor from the list to view appointments</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}