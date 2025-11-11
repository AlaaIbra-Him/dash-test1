// import { useState, useEffect } from 'react';
// import { LogOut, Calendar, User } from 'lucide-react';
// import { supabase } from '../supabaseClient';
// import { useNavigate } from 'react-router-dom';

// export default function DoctorDashboard() {
//     const [doctorName, setDoctorName] = useState('');
//     const [appointments, setAppointments] = useState([]);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchDoctorProfile = async () => {
//             const { data: { session } } = await supabase.auth.getSession();
//             if (!session) {
//                 navigate('/');
//                 return;
//             }

//             const userId = session.user.id;
//             const { data: profile, error: profileError } = await supabase.from('profiles').select('full_name, role').eq('id', userId).single();

//             if (profileError || profile.role !== 'doctor') {
//                 navigate('/');
//                 return;
//             }
//             setDoctorName(profile.full_name);

//             const { data: appts, error: apptsError } = await supabase.from('appointments').select('*').eq('doctor_id', userId).order('date', { ascending: true });
//             if (!apptsError) setAppointments(appts);
//         };

//         fetchDoctorProfile();
//     }, [navigate]);

//     const handleLogout = async () => {
//         await supabase.auth.signOut();
//         navigate('/');
//     };

//     return (
//         <div className="min-h-screen bg-gray-50">
//             <header className="bg-[#0B8FAC] text-white p-4 flex justify-between items-center">
//                 <h1 className="text-xl font-semibold">Doctor Dashboard</h1>
//                 <div className="flex items-center gap-4">
//                     <span>{doctorName}</span>
//                     <button onClick={handleLogout} className="flex items-center gap-1 hover:opacity-80">
//                         <LogOut className="w-5 h-5" />
//                         Logout
//                     </button>
//                 </div>
//             </header>

//             <main className="p-8">
//                 <section className="mb-8">
//                     <h2 className="text-[#0B8FAC] text-lg mb-4">Upcoming Appointments</h2>
//                     {appointments.length === 0 ? (
//                         <p className="text-gray-600">No appointments scheduled.</p>
//                     ) : (
//                         <div className="grid gap-4">
//                             {appointments.map((appt) => (
//                                 <div key={appt.id} className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center">
//                                     <div>
//                                         <p className="font-semibold">{appt.patient_name}</p>
//                                         <p className="text-gray-600 text-sm">{new Date(appt.date).toLocaleString()}</p>
//                                     </div>
//                                     <Calendar className="w-6 h-6 text-[#0B8FAC]" />
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </section>

//                 <section>
//                     <h2 className="text-[#0B8FAC] text-lg mb-4">Profile</h2>
//                     <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
//                         <User className="w-8 h-8 text-[#0B8FAC]" />
//                         <p className="text-gray-700 font-semibold">{doctorName}</p>
//                     </div>
//                 </section>
//             </main>
//         </div>
//     );
// }
import { useState, useEffect } from 'react';
import { LogOut, Calendar, User, Key, Sun, Moon, Trash2, Edit2, Settings, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
    const [doctor, setDoctor] = useState({
        full_name: '',
        phone: '',
        specialty: '',
        description: '',
        email: ''
    });
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [passwordMode, setPasswordMode] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [darkMode, setDarkMode] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctorProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return navigate('/');

            const userId = session.user.id;
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error || profile.role !== 'doctor') return navigate('/');
            setDoctor(profile);

            const { data: appts, error: apptsError } = await supabase
                .from('appointments')
                .select('*')
                .eq('doctor_id', userId)
                .order('date', { ascending: true });

            if (!apptsError) setAppointments(appts);
        };

        fetchDoctorProfile();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            await supabase
                .from('profiles')
                .update({
                    full_name: doctor.full_name,
                    phone: doctor.phone,
                    specialty: doctor.specialty,
                    description: doctor.description
                })
                .eq('id', doctor.id);

            alert('✅ Profile updated successfully!');
            setEditMode(false);
        } catch (err) {
            console.error(err);
            alert('❌ Error updating profile: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword) return alert('Enter a new password');
        setLoading(true);
        try {
            await supabase.auth.updateUser({ password: newPassword });
            alert('✅ Password changed successfully!');
            setNewPassword('');
            setPasswordMode(false);
        } catch (err) {
            console.error(err);
            alert('❌ Error changing password: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAppointment = async (apptId) => {
        if (!window.confirm('CONFIRM: Delete this appointment?')) return;
        try {
            await supabase.from('appointments').delete().eq('id', apptId);
            alert('✅ Appointment deleted.');
            setAppointments(prev => prev.filter(a => a.id !== apptId));
        } catch (err) {
            console.error(err);
            alert('❌ Error deleting appointment: ' + err.message);
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today);

    return (
        <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen transition-colors`}>
            {/* Header */}
            <header className={`${darkMode ? 'bg-gray-800' : 'bg-[#0B8FAC] text-white'} p-4 flex justify-between items-center`}>
                <h1 className="text-xl font-bold">Welcome, Dr. {doctor.full_name}</h1>
                <div className="flex items-center gap-4">
                    <button onClick={() => setDarkMode(!darkMode)} className="p-1 hover:opacity-80">
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button onClick={() => setDrawerOpen(true)} className="p-1 hover:opacity-80">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-1 hover:opacity-80">
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </header>

            <main className="p-8">
                {/* Summary */}
                <section className="mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="bg-gray-800 text-white rounded-xl shadow p-6 flex-1">
                        <h2 className="text-lg font-semibold mb-2">Appointments</h2>
                        <p className="text-2xl font-bold">{appointments.length}</p>
                    </div>
                    <div className="bg-gray-800 text-white rounded-xl shadow p-6 flex-1">
                        <h2 className="text-lg font-semibold mb-2">Today's Schedule</h2>
                        {todayAppointments.length === 0 ? (
                            <p>No appointments today.</p>
                        ) : (
                            todayAppointments.map(appt => (
                                <div key={appt.id} className="bg-gray-700 rounded-lg p-3 mb-2 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{appt.patient_name}</p>
                                        <p className="text-sm text-gray-300">{appt.time}</p>
                                    </div>
                                    <button className="text-red-400 hover:text-red-500" onClick={() => handleDeleteAppointment(appt.id)}>
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Appointments List */}
                <section>
                    <h2 className="text-[#0B8FAC] text-lg mb-4">All Appointments</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {appointments.map(appt => (
                            <div key={appt.id} className="bg-gray-800 text-white rounded-xl shadow p-4 flex flex-col justify-between">
                                <div>
                                    <p className="font-bold">{appt.patient_name} (Age: {appt.age})</p>
                                    <p className="text-gray-300 text-sm">{appt.date} at {appt.time}</p>
                                    <p className="text-gray-300 text-sm">Phone: {appt.phone}</p>
                                    <p className="text-gray-300 text-sm">Status: {appt.status}</p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button className="flex-1 px-2 py-1 bg-red-600 rounded hover:bg-red-700" onClick={() => handleDeleteAppointment(appt.id)}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-gray-900 text-white shadow-xl transform transition-transform ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="font-bold text-lg">Settings</h2>
                    <button onClick={() => setDrawerOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 flex flex-col gap-4">
                    {editMode ? (
                        <>
                            <input className="border p-2 rounded text-black w-full" value={doctor.full_name} onChange={(e) => setDoctor({ ...doctor, full_name: e.target.value })} placeholder="Full Name" />
                            <input className="border p-2 rounded text-black w-full" value={doctor.phone} onChange={(e) => setDoctor({ ...doctor, phone: e.target.value })} placeholder="Phone" />
                            <input className="border p-2 rounded text-black w-full" value={doctor.specialty} onChange={(e) => setDoctor({ ...doctor, specialty: e.target.value })} placeholder="Specialty" />
                            <textarea className="border p-2 rounded text-black w-full" value={doctor.description} onChange={(e) => setDoctor({ ...doctor, description: e.target.value })} placeholder="Description" />
                            <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleSaveProfile} disabled={loading}>
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </>
                    ) : (
                        <button className="px-4 py-2 bg-blue-500 rounded flex items-center gap-2" onClick={() => setEditMode(true)}>
                            <Edit2 className="w-4 h-4" /> Edit Profile
                        </button>
                    )}

                    {passwordMode ? (
                        <div className="flex gap-2">
                            <input type="password" className="border p-2 rounded text-black flex-1" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            <button className="px-4 py-2 bg-yellow-500 rounded" onClick={handleChangePassword} disabled={loading}>
                                {loading ? 'Saving...' : 'Change'}
                            </button>
                        </div>
                    ) : (
                        <button className="px-4 py-2 bg-yellow-500 rounded flex items-center gap-2" onClick={() => setPasswordMode(true)}>
                            <Key className="w-4 h-4" /> Change Password
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
