// src/components/LandingPage.jsx
import { useState, useEffect, useContext } from 'react';
import { Menu, X, Heart, Phone, Mail, MapPin, Sun, Moon } from 'lucide-react';
import { AppContext } from '../App';
import DoctorCard from './DoctorCard';
import AppointmentForm from './AppointmentForm';
import AuthModal from './AuthModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function LandingPage() {
    const { darkMode, toggleDarkMode, language, toggleLanguage, t } = useContext(AppContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showAuthForm, setShowAuthForm] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDoctors();
        const subscription = supabase
            .channel('profiles')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'profiles', filter: 'role=eq.doctor' },
                () => fetchDoctors()
            )
            .subscribe();
        return () => subscription.unsubscribe();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'doctor');

            if (error) throw error;

            const formattedDoctors = data.map((doctor) => ({
                id: doctor.id,
                name: doctor.full_name,
                specialty: doctor.specialty,
                experience: doctor.experience,
                rating: doctor.rating || 4.8,
                image: doctor.image_url || 'https://images.unsplash.com/photo-1755189118414-14c8dacdb082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
                email: doctor.email,
            }));

            setDoctors(formattedDoctors);
        } catch (err) {
            console.error('Error fetching doctors:', err);
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
    };

    const handleBookAppointment = (doctor) => {
        setSelectedDoctor(doctor);
        setShowBookingForm(true);
    };

    const handleOpenAuth = (role) => {
        setShowAuthForm(role);
        setIsMenuOpen(false);
    };

    const handleLoginSuccess = (role) => {
        if (role === 'admin') navigate('/admin');
        else if (role === 'doctor') navigate('/doctor');
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} transition-colors duration-300 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm z-50 border-b transition-colors`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-[#0B8FAC]' : 'bg-[#0B8FAC]'}`}>
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[#0B8FAC] font-bold">Memora</span>
                    </div>

                    <nav className={`hidden md:flex items-center gap-8 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <button onClick={() => scrollToSection('home')} className="hover:text-[#0B8FAC] transition">{t.home}</button>
                        <button onClick={() => scrollToSection('about')} className="hover:text-[#0B8FAC] transition">{t.about}</button>
                        <button onClick={() => scrollToSection('doctors')} className="hover:text-[#0B8FAC] transition">{t.doctors}</button>
                        <button onClick={() => scrollToSection('contact')} className="hover:text-[#0B8FAC] transition">{t.contact}</button>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleLanguage}
                            className={`px-3 py-1 rounded-full text-sm font-semibold transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            {language === 'ar' ? 'EN' : 'AR'}
                        </button>

                        <button
                            onClick={toggleDarkMode}
                            className={`p-2 rounded-lg transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <div className="hidden md:flex items-center gap-4">
                            <button onClick={() => handleOpenAuth('doctor')} className={`px-4 py-2 rounded-lg transition ${darkMode ? 'text-[#0B8FAC] hover:bg-gray-700 font-bold' : 'text-[#0B8FAC] hover:bg-gray-100'}`}>{t.doctorSignIn}</button>
                            <button onClick={() => handleOpenAuth('admin')} className="px-6 py-2 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#0a7a94] transition font-bold">{t.adminSignIn}</button>
                        </div>

                        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className={`md:hidden py-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                        <nav className="flex flex-col gap-4 px-4">
                            <button onClick={() => scrollToSection('home')} className="text-left hover:text-[#0B8FAC]">{t.home}</button>
                            <button onClick={() => scrollToSection('about')} className="text-left hover:text-[#0B8FAC]">{t.about}</button>
                            <button onClick={() => scrollToSection('doctors')} className="text-left hover:text-[#0B8FAC]">{t.doctors}</button>
                            <button onClick={() => scrollToSection('contact')} className="text-left hover:text-[#0B8FAC]">{t.contact}</button>
                            <button onClick={() => handleOpenAuth('doctor')} className="px-4 py-2 text-[#0B8FAC] border border-[#0B8FAC] rounded-lg hover:bg-gray-100 text-left">{t.doctorSignIn}</button>
                            <button onClick={() => handleOpenAuth('admin')} className="px-4 py-2 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#0a7a94]">{t.adminSignIn}</button>
                        </nav>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section id="home" className={`pt-24 pb-16 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-[#E6F7FB] to-white'} transition-colors`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-[#0B8FAC] text-4xl md:text-5xl font-bold mb-4">{t.landingTitle}</h1>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8 text-lg`}>{t.landingDesc}</p>
                        <div className="flex flex-wrap gap-4">
                            <button onClick={() => scrollToSection('about')} className="px-8 py-3 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#0a7a94] transition">{t.learnMore}</button>
                            <button className={`px-8 py-3 border-2 border-[#0B8FAC] text-[#0B8FAC] rounded-lg transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-[#E6F7FB]'}`}>{t.getApp}</button>
                        </div>
                    </div>
                    <div className="rounded-2xl overflow-hidden shadow-2xl">
                        <img src="https://images.unsplash.com/photo-1603129473525-4cd6f36fe057?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Elderly couple" className="w-full h-full object-cover" />
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className={`py-16 ${darkMode ? 'bg-gray-900' : 'bg-white'} transition-colors`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-[#0B8FAC] text-4xl font-bold mb-4">{t.about}</h2>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Alzheimer's disease is a progressive neurological disorder that affects memory, thinking, and behavior.</p>
                    </div>
                </div>
            </section>

            {/* Doctors Section */}
            <section id="doctors" className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} transition-colors`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-[#0B8FAC] text-4xl font-bold mb-4">{t.expertDoctors}</h2>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                            {loading ? t.loading : `${doctors.length} ${t.specialists}`}
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center min-h-[400px]">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B8FAC]"></div>
                                <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.loading}</p>
                            </div>
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className={`text-center py-12 rounded-xl shadow-md ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.allAppointments}</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {doctors.map((doctor) => (
                                <DoctorCard key={doctor.id} doctor={doctor} onBookAppointment={handleBookAppointment} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className={`py-16 ${darkMode ? 'bg-gray-900' : 'bg-white'} transition-colors`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8 text-center">
                    <div>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-gray-700' : 'bg-[#E6F7FB]'}`}>
                            <Phone className="w-8 h-8 text-[#0B8FAC]" />
                        </div>
                        <h3 className="text-[#0B8FAC] mb-2 font-bold">{t.phone}</h3>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>01006372080</p>
                    </div>
                    <div>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-gray-700' : 'bg-[#E6F7FB]'}`}>
                            <Mail className="w-8 h-8 text-[#0B8FAC]" />
                        </div>
                        <h3 className="text-[#0B8FAC] mb-2 font-bold">{t.email}</h3>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>support@memora.com</p>
                    </div>
                    <div>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-gray-700' : 'bg-[#E6F7FB]'}`}>
                            <MapPin className="w-8 h-8 text-[#0B8FAC]" />
                        </div>
                        <h3 className="text-[#0B8FAC] mb-2 font-bold">{t.location}</h3>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Alabadya Damanhour </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={`${darkMode ? 'bg-gray-800' : 'bg-[#0B8FAC]'} text-white py-8 text-center transition-colors`}>
                <p>© 2025 Memora. {t.allRightsReserved}.</p>
            </footer>

            {/* Modals */}
            {showBookingForm && selectedDoctor && (
                <AppointmentForm doctor={selectedDoctor} onClose={() => { setShowBookingForm(false); setSelectedDoctor(null); }} />
            )}

            {showAuthForm && (
                <AuthModal role={showAuthForm} onClose={() => setShowAuthForm(null)} onLoginSuccess={handleLoginSuccess} />
            )}
        </div>
    );
}