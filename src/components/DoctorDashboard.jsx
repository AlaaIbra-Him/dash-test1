import { useState, useEffect } from 'react';
import { LogOut, Calendar, User } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
    const [doctorName, setDoctorName] = useState('');
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctorProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/');
                return;
            }

            const userId = session.user.id;
            const { data: profile, error: profileError } = await supabase.from('profiles').select('full_name, role').eq('id', userId).single();

            if (profileError || profile.role !== 'doctor') {
                navigate('/');
                return;
            }
            setDoctorName(profile.full_name);

            const { data: appts, error: apptsError } = await supabase.from('appointments').select('*').eq('doctor_id', userId).order('date', { ascending: true });
            if (!apptsError) setAppointments(appts);
        };

        fetchDoctorProfile();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-[#0B8FAC] text-white p-4 flex justify-between items-center">
                <h1 className="text-xl font-semibold">Doctor Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span>{doctorName}</span>
                    <button onClick={handleLogout} className="flex items-center gap-1 hover:opacity-80">
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </header>

            <main className="p-8">
                <section className="mb-8">
                    <h2 className="text-[#0B8FAC] text-lg mb-4">Upcoming Appointments</h2>
                    {appointments.length === 0 ? (
                        <p className="text-gray-600">No appointments scheduled.</p>
                    ) : (
                        <div className="grid gap-4">
                            {appointments.map((appt) => (
                                <div key={appt.id} className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{appt.patient_name}</p>
                                        <p className="text-gray-600 text-sm">{new Date(appt.date).toLocaleString()}</p>
                                    </div>
                                    <Calendar className="w-6 h-6 text-[#0B8FAC]" />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-[#0B8FAC] text-lg mb-4">Profile</h2>
                    <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
                        <User className="w-8 h-8 text-[#0B8FAC]" />
                        <p className="text-gray-700 font-semibold">{doctorName}</p>
                    </div>
                </section>
            </main>
        </div>
    );
}
