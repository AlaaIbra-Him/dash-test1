// src/components/DoctorCard.jsx
import { Star, Calendar } from 'lucide-react';
import { useContext } from 'react';
import { AppContext } from '../App';

export default function DoctorCard({ doctor, onBookAppointment }) {
  const { darkMode, t } = useContext(AppContext);

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow`}>
      <div className="aspect-square overflow-hidden">
        <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-6">
        <h3 className="text-[#0B8FAC] font-bold mb-1">{doctor.name}</h3>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{doctor.specialty}</p>
        <div className={`flex items-center gap-2 mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span>{doctor.rating}</span>
          {/* <span>• {doctor.experience} {t.specialty}</span> */}
        </div>
        <button
          onClick={() => onBookAppointment(doctor)}
          className="w-full px-4 py-2 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#0a7a94] transition flex items-center justify-center gap-2 font-semibold"
        >
          <Calendar className="w-4 h-4" />
          {t.bookAppointment}
        </button>
      </div>
    </div>
  );
}