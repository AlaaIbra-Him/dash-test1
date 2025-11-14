import { useState, useEffect, useContext } from 'react';
import { LogOut, Key, Sun, Moon, Trash2, Edit2, Settings, X, Users, Calendar, Home } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App'; 
import { translations } from '../i18n/translations';

export default function DoctorDashboard() {
    const { darkMode, toggleDarkMode, language, toggleLanguage, t } = useContext(AppContext);
    const [activePage, setActivePage] = useState('appointments'); // appointments, settings, patients
    const [doctor, setDoctor] = useState({
        name: '',
        phone: '',
        specialty: '',
        description: '',
        email: ''
    });
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [stats, setStats] = useState({
        totalAppointments: 0,
        bookedAppointments: 0,
        cancelledAppointments: 0
    });
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [passwordMode, setPasswordMode] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [doctorId, setDoctorId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctorProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return navigate('/');

            const userId = session.user.id;
            setDoctorId(userId);

            const { data: profile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error || profile.role !== 'doctor') return navigate('/');
            setDoctor(profile);

            // Fetch Appointments
            const { data: appts, error: apptsError } = await supabase
                .from('appointments')
                .select('*')
                .eq('doctor_id', userId)
                .order('date', { ascending: true });

            if (!apptsError && appts) {
                setAppointments(appts);
                const booked = appts.filter(a => a.status === 'booked').length;
                const cancelled = appts.filter(a => a.status === 'cancelled').length;
                setStats({
                    totalAppointments: appts.length,
                    bookedAppointments: booked,
                    cancelledAppointments: cancelled
                });

                // Fetch Patients
                const patientIds = [...new Set(appts.map(a => a.patient_id).filter(Boolean))];
                if (patientIds.length > 0) {
                    const { data: patientsData } = await supabase
                        .from('users')
                        .select('*')
                        .in('id', patientIds);
                    if (patientsData) setPatients(patientsData);
                }
            }
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
                .from('users')
                .update({
                    name: doctor.name,
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
            setAppointments(prev => prev.filter(a => a.id !== apptId));
            alert(t.appointmentDeleted);
        } catch (err) {
            console.error(err);
            alert(t.errorDeletingAppointment + ': ' + err.message);
        }
    };

    const appointmentPercentage = stats.totalAppointments > 0
        ? Math.round((stats.bookedAppointments / stats.totalAppointments) * 100)
        : 0;

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today);

    return (
        <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen flex transition-colors`}>
            {/* Sidebar Navigation */}
            <aside className={`w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-gray-200'} border-r shadow-lg`}>
                {/* Logo/Header */}
                <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                    <h1 className="text-[#0B8FAC] font-bold text-2xl">Memora</h1>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dr. {doctor.name}</p>
                </div>

                {/* Navigation Items */}
                <nav className="p-4 space-y-2">
                    <NavItem
                        icon={<Calendar className="w-5 h-5" />}
                        label={t.appointments}
                        active={activePage === 'appointments'}
                        onClick={() => setActivePage('appointments')}
                        darkMode={darkMode}
                    />
                    <NavItem
                        icon={<Users className="w-5 h-5" />}
                        label={t.patients}
                        active={activePage === 'patients'}
                        onClick={() => setActivePage('patients')}
                        darkMode={darkMode}
                    />
                    <NavItem
                        icon={<Settings className="w-5 h-5" />}
                        label={t.settings}
                        active={activePage === 'settings'}
                        onClick={() => setActivePage('settings')}
                        darkMode={darkMode}
                    />
                </nav>

                {/* Logout Button */}
                <div className={`absolute bottom-0 left-0 right-0 w-64 p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-blue-50'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={toggleLanguage}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100 border border-gray-300'}`}
                        >
                            {language === 'ar' ? 'EN' : 'AR'}
                        </button>
                        <button
                            onClick={toggleDarkMode}
                            className={`px-3 py-2 rounded-lg transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100 border border-gray-300'}`}
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                    >
                        <LogOut className="w-5 h-5" />
                        {t.logout}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 shadow-sm border-b sticky top-0 z-10`}>
                    <h2 className="text-3xl font-bold text-[#0B8FAC]">
                        {activePage === 'appointments' && t.appointments}
                        {activePage === 'patients' && t.patients}
                        {activePage === 'settings' && t.settings}
                    </h2>
                </header>

                <div className="p-8">
                    {/* Appointments Page */}
                    {activePage === 'appointments' && (
                        <AppointmentsPage
                            appointments={appointments}
                            todayAppointments={todayAppointments}
                            stats={stats}
                            appointmentPercentage={appointmentPercentage}
                            handleDeleteAppointment={handleDeleteAppointment}
                            darkMode={darkMode}
                            t={t}
                        />
                    )}

                    {/* Patients Page */}
                    {activePage === 'patients' && (
                        <PatientsPage
                            patients={patients}
                            appointments={appointments}
                            darkMode={darkMode}
                            t={t}
                        />
                    )}

                    {/* Settings Page */}
                    {activePage === 'settings' && (
                        <SettingsPage
                            doctor={doctor}
                            setDoctor={setDoctor}
                            editMode={editMode}
                            setEditMode={setEditMode}
                            passwordMode={passwordMode}
                            setPasswordMode={setPasswordMode}
                            newPassword={newPassword}
                            setNewPassword={setNewPassword}
                            loading={loading}
                            handleSaveProfile={handleSaveProfile}
                            handleChangePassword={handleChangePassword}
                            darkMode={darkMode}
                            t={t}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

// Navigation Item Component
const NavItem = ({ icon, label, active, onClick, darkMode }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-semibold ${
            active
                ? 'bg-[#0B8FAC] text-white'
                : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-white'}`
        }`}
    >
        {icon}
        {label}
    </button>
);

// Stat Card Component
const StatCard = ({ label, value, color, textColor, darkMode }) => (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg border-l-4 ${color} hover:shadow-xl transition transform hover:-translate-y-0.5`}>
        <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
        <p className={`text-4xl font-bold ${textColor} mt-2`}>{value}</p>
    </div>
);

// Appointments Page Component
const AppointmentsPage = ({ appointments, todayAppointments, stats, appointmentPercentage, handleDeleteAppointment, darkMode, t }) => (
    <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard label={t.totalAppts} value={stats.totalAppointments} color="border-blue-500" textColor="text-[#0B8FAC]" darkMode={darkMode} />
            <StatCard label={t.bookedAppts} value={stats.bookedAppointments} color="border-green-500" textColor="text-green-600" darkMode={darkMode} />
            <StatCard label={t.cancelledAppointments} value={stats.cancelledAppointments} color="border-red-500" textColor="text-red-600" darkMode={darkMode} />
        </div>

        {/* Fill Rate Bar */}
        {stats.totalAppointments > 0 && (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg transition-colors`}>
                <h3 className="text-[#0B8FAC] font-bold mb-4">{t.appointmentFillRate}</h3>
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

        {/* Today's Schedule Table */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transition-colors`}>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-[#0B8FAC] to-blue-600'} text-white p-6`}>
                <h3 className="font-bold text-xl">{t.todaySchedule}</h3>
            </div>
            
            {todayAppointments.length === 0 ? (
                <div className={`text-center py-12 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <Calendar className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.noAppointmentsToday}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                            <tr>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>👤 {t.patientName}</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>🕐 {t.time}</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>📞 {t.phone}</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>👨 {t.age}</th>
                                <th className={`px-6 py-3 text-center text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.action}</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {todayAppointments.map(appt => (
                                <tr key={appt.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition`}>
                                    <td className={`px-6 py-4 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {appt.patient_name}
                                    </td>
                                    <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {appt.time}
                                    </td>
                                    <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {appt.phone}
                                    </td>
                                    <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {appt.age}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleDeleteAppointment(appt.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs font-semibold inline-flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3 h-3" /> {t.delete}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {/* All Appointments Table */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transition-colors`}>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-[#0B8FAC] to-blue-600'} text-white p-6 flex items-center justify-between`}>
                <h3 className="font-bold text-xl">{t.allAppointments} ({appointments.length})</h3>
            </div>
            
            {appointments.length === 0 ? (
                <div className={`text-center py-12 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <Calendar className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.noAppointmentsToday}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                            <tr>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>👤 {t.patientName}</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>📅 {t.date}</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>🕐 {t.time}</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>📞 {t.phone}</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>👨 {t.age}</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.status}</th>
                                <th className={`px-6 py-3 text-center text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.action}</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {appointments.map(appt => (
                                <tr key={appt.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition`}>
                                    <td className={`px-6 py-4 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {appt.patient_name}
                                    </td>
                                    <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {appt.date}
                                    </td>
                                    <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {appt.time}
                                    </td>
                                    <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {appt.phone}
                                    </td>
                                    <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {appt.age}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${appt.status === 'booked'
                                            ? 'bg-green-200 text-green-800'
                                            : 'bg-red-200 text-red-800'
                                        }`}>
                                            {appt.status === 'booked' ? t.confirmed : t.cancelled}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleDeleteAppointment(appt.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs font-semibold inline-flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3 h-3" /> {t.delete}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
);

// Patients Page Component
const PatientsPage = ({ patients, appointments, darkMode, t }) => (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transition-colors`}>
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-[#0B8FAC] to-blue-600'} text-white p-6 flex items-center gap-3`}>
            <Users className="w-6 h-6" />
            <h2 className="font-bold text-2xl">{t.patients} ({patients.length})</h2>
        </div>

        <div className="p-6">
            {patients.length === 0 ? (
                <div className={`text-center py-12 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <Users className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.noPatientsYet}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patients.map((patient) => {
                        const patientAppointments = appointments.filter(a => a.patient_id === patient.id);
                        return (
                            <div
                                key={patient.id}
                                className={`p-4 rounded-lg border-l-4 border-[#0B8FAC] ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-blue-50'} transition cursor-pointer shadow-md`}
                            >
                                <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {patient.name || patient.name || 'Unknown'}
                                </h3>
                                <p className="text-[#0B8FAC] text-xs font-semibold mt-1">👤 {patient.role || 'Patient'}</p>
                                <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    📧 {patient.email}
                                </p>
                                <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    📞 {patient.phone || 'N/A'}
                                </p>
                                <div className={`mt-4 p-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                                    <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        📋 {t.appointments}: <span className="text-[#0B8FAC]">{patientAppointments.length}</span>
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
);

// Settings Page Component
const SettingsPage = ({ doctor, setDoctor, editMode, setEditMode, passwordMode, setPasswordMode, newPassword, setNewPassword, loading, handleSaveProfile, handleChangePassword, darkMode, t }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 transition-colors`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#0B8FAC] font-bold text-2xl">{t.editProfile}</h3>
                {!editMode && (
                    <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#0a7a94] transition"
                    >
                        <Edit2 className="w-4 h-4" /> {t.edit}
                    </button>
                )}
            </div>

            {editMode ? (
                <div className="space-y-4">
                    <div>
                        <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.fullName}</label>
                        <input
                            type="text"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            value={doctor.name}
                            onChange={(e) => setDoctor({ ...doctor, name: e.target.value })}
                            placeholder={t.fullName}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.phone}</label>
                            <input
                                type="tel"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                value={doctor.phone}
                                onChange={(e) => setDoctor({ ...doctor, phone: e.target.value })}
                                placeholder={t.phone}
                            />
                        </div>
                        <div>
                            <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.specialty}</label>
                            <input
                                type="text"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                value={doctor.specialty}
                                onChange={(e) => setDoctor({ ...doctor, specialty: e.target.value })}
                                placeholder={t.specialty}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.description}</label>
                        <textarea
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            value={doctor.description}
                            onChange={(e) => setDoctor({ ...doctor, description: e.target.value })}
                            placeholder={t.description}
                            rows="4"
                        />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 font-semibold"
                        >
                            {loading ? t.saving : t.save}
                        </button>
                        <button
                            onClick={() => setEditMode(false)}
                            className={`flex-1 px-4 py-3 rounded-lg transition font-semibold ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            {t.cancel}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.fullName}</p>
                        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{doctor.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.phone}</p>
                            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{doctor.phone || 'N/A'}</p>
                        </div>
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.specialty}</p>
                            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{doctor.specialty}</p>
                        </div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.description}</p>
                        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{doctor.description || 'N/A'}</p>
                    </div>
                </div>
            )}
        </div>

        {/* Password Section */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 transition-colors`}>
            <h3 className="text-[#0B8FAC] font-bold text-xl mb-6 flex items-center gap-2">
                <Key className="w-5 h-5" /> {t.changePassword}
            </h3>

            {passwordMode ? (
                <div className="space-y-4">
                    <div>
                        <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t.newPassword}
                        </label>
                        <input
                            type="password"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            placeholder={t.enterPassword}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleChangePassword}
                            disabled={loading}
                            className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 font-semibold"
                        >
                            {loading ? t.saving : t.change}
                        </button>
                        <button
                            onClick={() => {
                                setPasswordMode(false);
                                setNewPassword('');
                            }}
                            className={`w-full px-4 py-3 rounded-lg transition font-semibold ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            {t.cancel}
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setPasswordMode(true)}
                    className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center justify-center gap-2 font-semibold"
                >
                    <Key className="w-4 h-4" /> {t.changePassword}
                </button>
            )}
        </div>
    </div>
);