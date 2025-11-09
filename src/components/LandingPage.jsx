import { useState } from 'react';
import { Menu, X, Heart, Phone, Mail, MapPin } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import DoctorCard from './DoctorCard';
import AppointmentForm from './AppointmentForm';
import AuthModal from './AuthModal';
import { useNavigate } from 'react-router-dom';


const doctors = [
    { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Neurologist', experience: '15 years', image: 'https://images.unsplash.com/photo-1755189118414-14c8dacdb082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', rating: 4.9 },
    { id: 2, name: 'Dr. Michael Chen', specialty: 'Geriatric Psychiatrist', experience: '12 years', image: 'https://images.unsplash.com/photo-1755189118414-14c8dacdb082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', rating: 4.8 },
    { id: 3, name: 'Dr. Emily Williams', specialty: 'Memory Care Specialist', experience: '10 years', image: 'https://images.unsplash.com/photo-1755189118414-14c8dacdb082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', rating: 4.9 },
    { id: 4, name: 'Dr. James Anderson', specialty: 'Neurologist', experience: '18 years', image: 'https://images.unsplash.com/photo-1755189118414-14c8dacdb082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', rating: 5.0 }
];

export default function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showAuthForm, setShowAuthForm] = useState(null);

    const navigate = useNavigate();

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

    const handleCloseAuth = () => {
        setShowAuthForm(null);
    };

    const handleLoginSuccess = (role) => {
        if (role === 'admin') navigate('/admin');
        else if (role === 'doctor') navigate('/doctor');
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-[#0B8FAC] rounded-lg flex items-center justify-center">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[#0B8FAC]">Memora</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-[#0B8FAC]">Home</button>
                        <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-[#0B8FAC]">About</button>
                        <button onClick={() => scrollToSection('doctors')} className="text-gray-700 hover:text-[#0B8FAC]">Doctors</button>
                        <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-[#0B8FAC]">Contact</button>
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <button onClick={() => handleOpenAuth('doctor')} className="px-4 py-2 text-[#0B8FAC] hover:bg-gray-50 rounded-lg">Doctor Sign In</button>
                        <button onClick={() => handleOpenAuth('admin')} className="px-6 py-2 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#0a7a94]">Admin Dashboard</button>
                    </div>

                    <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <nav className="flex flex-col gap-4">
                            <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-[#0B8FAC] text-left">Home</button>
                            <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-[#0B8FAC] text-left">About</button>
                            <button onClick={() => scrollToSection('doctors')} className="text-gray-700 hover:text-[#0B8FAC] text-left">Doctors</button>
                            <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-[#0B8FAC] text-left">Contact</button>
                            <button onClick={() => handleOpenAuth('doctor')} className="px-4 py-2 text-[#0B8FAC] border border-[#0B8FAC] rounded-lg hover:bg-gray-50 text-left">Doctor Sign In</button>
                            <button onClick={() => handleOpenAuth('admin')} className="px-4 py-2 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#0a7a94]">Admin Dashboard</button>
                        </nav>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section id="home" className="pt-24 pb-16 bg-gradient-to-br from-[#E6F7FB] to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-[#0B8FAC] mb-4">Comprehensive Care for Alzheimer's Patients</h1>
                        <p className="text-gray-600 mb-8">
                            Memora provides specialized care and support for individuals living with Alzheimer's disease and their families.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button onClick={() => scrollToSection('about')} className="px-8 py-3 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#0a7a94]">Learn More</button>
                            <button className="px-8 py-3 border-2 border-[#0B8FAC] text-[#0B8FAC] rounded-lg hover:bg-[#E6F7FB]">Get the App</button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="rounded-2xl overflow-hidden shadow-2xl">
                            <ImageWithFallback
                                src="https://images.unsplash.com/photo-1603129473525-4cd6f36fe057?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                                alt="Elderly couple"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-[#0B8FAC] mb-4">About Alzheimer's Disease</h2>
                        <p className="text-gray-600 max-w-3xl mx-auto">
                            Alzheimer's disease is a progressive neurological disorder that affects memory, thinking, and behavior.
                        </p>
                    </div>
                </div>
            </section>

            {/* Doctors Section */}
            <section id="doctors" className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-[#0B8FAC] mb-4">Our Expert Doctors</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {doctors.map((doctor) => (
                            <DoctorCard key={doctor.id} doctor={doctor} onBookAppointment={handleBookAppointment} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8 text-center">
                    <div>
                        <div className="w-16 h-16 bg-[#E6F7FB] rounded-full flex items-center justify-center mx-auto mb-4"><Phone className="w-8 h-8 text-[#0B8FAC]" /></div>
                        <h3 className="text-[#0B8FAC] mb-2">Phone</h3><p className="text-gray-600">+1 (555) 123-4567</p>
                    </div>
                    <div>
                        <div className="w-16 h-16 bg-[#E6F7FB] rounded-full flex items-center justify-center mx-auto mb-4"><Mail className="w-8 h-8 text-[#0B8FAC]" /></div>
                        <h3 className="text-[#0B8FAC] mb-2">Email</h3><p className="text-gray-600">support@memora.com</p>
                    </div>
                    <div>
                        <div className="w-16 h-16 bg-[#E6F7FB] rounded-full flex items-center justify-center mx-auto mb-4"><MapPin className="w-8 h-8 text-[#0B8FAC]" /></div>
                        <h3 className="text-[#0B8FAC] mb-2">Location</h3><p className="text-gray-600">123 Medical Plaza, NY</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#0B8FAC] text-white py-8 text-center">
                <p>© 2025 Memora. All rights reserved.</p>
            </footer>


            {/* Booking Form */}
            {showBookingForm && selectedDoctor && (
                <AppointmentForm doctor={selectedDoctor} onClose={() => { setShowBookingForm(false); setSelectedDoctor(null); }} />
            )}

            {/* Auth Modal */}
            {showAuthForm && (
                <AuthModal
                    role={showAuthForm}
                    onClose={() => setShowAuthForm(null)}
                    onLoginSuccess={handleLoginSuccess} // <-- هنا
                />
            )}
        </div>
    );
}
