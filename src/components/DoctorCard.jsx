import { Star, Calendar } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

export default function DoctorCard({ doctor, onBookAppointment }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="aspect-square overflow-hidden">
        <ImageWithFallback src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-6">
        <h3 className="text-[#0B8FAC] mb-1">{doctor.name}</h3>
        <p className="text-gray-600 mb-2">{doctor.specialty}</p>
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-gray-700">{doctor.rating}</span>
          <span className="text-gray-500">• {doctor.experience} experience</span>
        </div>
        <button
          onClick={() => onBookAppointment(doctor)}
          className="w-full px-4 py-2 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#0a7a94] transition flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Book Appointment
        </button>
      </div>
    </div>
  );
}
