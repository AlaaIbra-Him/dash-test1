import { useState, useEffect, useContext } from 'react';
import { LogOut, Key, Sun, Moon, Trash2, Edit2, Settings, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App'; 
import { translations } from '../i18n/translations'; // استدعاء ملف الترجمة

export default function DoctorDashboard() {
    const { darkMode, toggleDarkMode, language, toggleLanguage } = useContext(AppContext); // darkMode و language من الأب
    const t = translations[language]; // ترجمة حسب اللغة

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

            alert(t.profileUpdated);
            setEditMode(false);
        } catch (err) {
            console.error(err);
            alert(t.profileUpdateError + ': ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword) return alert(t.enterNewPassword);
        setLoading(true);
        try {
            await supabase.auth.updateUser({ password: newPassword });
            alert(t.passwordChanged);
            setNewPassword('');
            setPasswordMode(false);
        } catch (err) {
            console.error(err);
            alert(t.passwordChangeError + ': ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAppointment = async (apptId) => {
        if (!window.confirm(t.confirmDeleteAppointment)) return;
        try {
            await supabase.from('appointments').delete().eq('id', apptId);
            alert(t.appointmentDeleted);
            setAppointments(prev => prev.filter(a => a.id !== apptId));
        } catch (err) {
            console.error(err);
            alert(t.errorDeletingAppointment + ': ' + err.message);
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
                    <button onClick={toggleDarkMode} className="p-1 hover:opacity-80">
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button onClick={toggleLanguage} className="p-1 hover:opacity-80">
                        {language === 'ar' ? 'EN' : 'AR'}
                    </button>
                    <button onClick={() => setDrawerOpen(true)} className="p-1 hover:opacity-80">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-1 hover:opacity-80">
                        <LogOut className="w-5 h-5" />
                        {t.logout}
                    </button>
                </div>
            </header>

            <main className="p-8">
                {/* Summary */}
                <section className="mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className={`rounded-xl shadow p-6 flex-1 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}>
                        <h2 className="text-lg font-semibold mb-2">{t.appointments}</h2>
                        <p className="text-2xl font-bold">{appointments.length}</p>
                    </div>
                    <div className={`rounded-xl shadow p-6 flex-1 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}>
                       <h1 className="text-lg font-bold mb-2 ">{t.todaySchedule}</h1>
                        <h2 className="text-lg font-semibold mb-2 ">{t.todaysSchedule}</h2>
                        {todayAppointments.length === 0 ? (
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.noAppointmentsToday}</p>
                        ) : (
                            todayAppointments.map(appt => (
                                <div key={appt.id} className={`rounded-lg p-3 mb-2 flex justify-between items-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <div>
                                        <p className="font-semibold">{appt.patient_name}</p>
                                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>{appt.time}</p>
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
                    <h2 className="text-[#0B8FAC] text-lg mb-4">{t.allAppointments}</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {appointments.map(appt => (
                            <div key={appt.id} className={`rounded-xl shadow p-4 flex flex-col justify-between
                                ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}>
                                <div>
                                    <p className="font-bold">{appt.patient_name} (Age: {appt.age})</p>
                                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>{appt.date} {t.at} {appt.time}</p>
                                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>{t.phone}: {appt.phone}</p>
                                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>{t.status}: {appt.status}</p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button className="flex-1 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => handleDeleteAppointment(appt.id)}>{t.cancel}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-80 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} shadow-xl transform transition-transform ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className={`flex justify-between items-center p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                    <h2 className="font-bold text-lg">{t.settings}</h2>
                    <button onClick={() => setDrawerOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 flex flex-col gap-4">
                    {editMode ? (
                        <>
                            <input className={`border p-2 rounded w-full ${darkMode ? 'text-white bg-gray-700' : 'text-black bg-white'}`} value={doctor.full_name} onChange={(e) => setDoctor({ ...doctor, full_name: e.target.value })} placeholder={t.fullName} />
                            <input className={`border p-2 rounded w-full ${darkMode ? 'text-white bg-gray-700' : 'text-black bg-white'}`} value={doctor.phone} onChange={(e) => setDoctor({ ...doctor, phone: e.target.value })} placeholder={t.phone} />
                            <input className={`border p-2 rounded w-full ${darkMode ? 'text-white bg-gray-700' : 'text-black bg-white'}`} value={doctor.specialty} onChange={(e) => setDoctor({ ...doctor, specialty: e.target.value })} placeholder={t.specialty} />
                            <textarea className={`border p-2 rounded w-full ${darkMode ? 'text-white bg-gray-700' : 'text-black bg-white'}`} value={doctor.description} onChange={(e) => setDoctor({ ...doctor, description: e.target.value })} placeholder={t.description} />
                            <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleSaveProfile} disabled={loading}>
                                {loading ? t.saving : t.save}
                            </button>
                        </>
                    ) : (
                        <button className="px-4 py-2 bg-blue-500 rounded flex items-center gap-2" onClick={() => setEditMode(true)}>
                            <Edit2 className="w-4 h-4" /> {t.editProfile}
                        </button>
                    )}

                    {passwordMode ? (
                        <div className="flex gap-2">
                            <input type="password" className={`border p-2 rounded flex-1 ${darkMode ? 'text-white bg-gray-700' : 'text-black bg-white'}`} placeholder={t.newPassword} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            <button className="px-4 py-2 bg-yellow-500 rounded" onClick={handleChangePassword} disabled={loading}>
                                {loading ? t.saving : t.change}
                            </button>
                        </div>
                    ) : (
                        <button className="px-4 py-2 bg-yellow-500 rounded flex items-center gap-2" onClick={() => setPasswordMode(true)}>
                            <Key className="w-4 h-4" /> {t.changePassword}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
