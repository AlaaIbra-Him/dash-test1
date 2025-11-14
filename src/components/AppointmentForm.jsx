// src/components/AppointmentForm.jsx
import { useState, useContext } from 'react';
import { X, User, Phone, Calendar, Clock } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { AppContext } from '../App';

export default function AppointmentForm({ doctor, onClose }) {
  const { darkMode, t } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    phone: '',
    date: '',
    time: ''
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!doctor.id) {
        throw new Error("Doctor ID is missing");
      }

      console.log("📅 Booking appointment for doctor ID:", doctor.id);

      const { data: existingAppt, error: checkError } = await supabase
        .from('appointments')
        .select('id')
        .eq('doctor_id', doctor.id)
        .eq('date', formData.date)
        .eq('time', formData.time)
        .eq('status', 'booked')
        .maybeSingle();

      if (checkError) {
        console.error("Check error:", checkError);
        throw checkError;
      }

      if (existingAppt) {
        alert(t.slotTaken);
        setLoading(false);
        return;
      }

      const { data, error: insertError } = await supabase
        .from('appointments')
        .insert([
          {
            doctor_id: doctor.id,
            patient_name: formData.patientName,
            age: Number(formData.age),
            phone: formData.phone,
            date: formData.date,
            time: formData.time,
            status: 'booked',
            is_available: true,
            created_at: new Date().toISOString()
          }
        ]);

      if (insertError) throw insertError;

      console.log("✅ Appointment created:", data);
      alert(t.appointmentBooked);
      onClose();
    } catch (err) {
      console.error('❌ Error:', err);
      alert(`${t.appointmentFailed} ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transition-colors`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[#0B8FAC] font-bold text-xl">📅 {t.bookAppointmentTitle}</h2>
            <button onClick={onClose} className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Doctor Info */}
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-[#E6F7FB]'} p-4 rounded-xl mb-6 transition-colors`}>
            <h3 className="text-[#0B8FAC] mb-1 font-semibold">{doctor.name}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{doctor.specialty}</p>
            {/* <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ID: {doctor.id}</p> */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <User className="w-4 h-4 inline mr-2" />
                {t.patientName}
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                placeholder={t.enterPatientName}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] focus:outline-none transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.age}</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  required
                  placeholder={t.enterAge}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] focus:outline-none transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Phone className="w-4 h-4 inline mr-2" />
                  {t.phone}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder={t.enterPhone}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] focus:outline-none transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
            </div>

            <div>
              <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Calendar className="w-4 h-4 inline mr-2" />
                {t.date}
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] focus:outline-none transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>

            <div>
              <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Clock className="w-4 h-4 inline mr-2" />
                {t.time}
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] focus:outline-none transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="">{t.selectTime}</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="14:00">02:00 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="17:00">05:00 PM</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                {t.cancel}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#0a7a94] transition disabled:opacity-50 font-semibold"
              >
                {loading ? t.loading : t.bookAppointment}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}