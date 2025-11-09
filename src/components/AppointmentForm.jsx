import { useState } from 'react';
import { X, User, Phone, Calendar, Clock } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AppointmentForm({ doctor, onClose }) {
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
      // ← احصل على User لو عامل لوجن
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id || null;

      // ← إرسال البيانات لجدول appointments
      const { error } = await supabase.from('appointments').insert([
        {
          doctor_id: doctor.id,
          user_id: userId,
          patient_name: formData.patientName,
          age: Number(formData.age),
          phone: formData.phone,
          date: formData.date,
          time: formData.time
        }
      ]);

      if (error) throw error;

      alert('Appointment booked successfully!');
      onClose();
    } catch (err) {
      console.error('Booking Error:', err.message);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[#0B8FAC]">Book Appointment</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Doctor Card */}
          <div className="bg-[#E6F7FB] p-4 rounded-xl mb-6">
            <h3 className="text-[#0B8FAC] mb-1">{doctor.name}</h3>
            <p className="text-gray-600">{doctor.specialty}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Patient Name
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC]"
                placeholder="Enter patient name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC]"
                  placeholder="Age"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC]"
                  placeholder="Phone"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Appointment Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC]"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Appointment Time
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC]"
              >
                <option value="">Select time</option>
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
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#0a7a94]"
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
