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
      // ✅ تأكد من وجود doctor.id
      if (!doctor.id) {
        throw new Error("Doctor ID is missing");
      }

      console.log("📅 Booking appointment for doctor ID:", doctor.id);

      // التحقق من أن هذا الموعد غير محجوز
      const { data: existingAppt, error: checkError } = await supabase
        .from('appointments')
        .select('id')
        .eq('doctor_id', doctor.id) // ✅ استخدم doctor.id
        .eq('date', formData.date)
        .eq('time', formData.time)
        .eq('status', 'booked')
        .maybeSingle(); // لأنه قد لا توجد نتائج

      if (checkError) {
        console.error("Check error:", checkError);
        throw checkError;
      }

      if (existingAppt) {
        alert('❌ عذراً، هذا الموعد محجوز بالفعل! اختر موعد آخر');
        setLoading(false);
        return;
      }

      // حجز الموعد
      const { data, error: insertError } = await supabase
        .from('appointments')
        .insert([
          {
            doctor_id: doctor.id, // ✅ استخدم doctor.id من Supabase
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
      alert('✅ تم حجز الموعد بنجاح!');
      onClose();
    } catch (err) {
      console.error('❌ Error:', err);
      alert(`❌ فشل الحجز: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[#0B8FAC]">📅 حجز موعد</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* ✅ عرض بيانات الدكتور من Supabase */}
          <div className="bg-[#E6F7FB] p-4 rounded-xl mb-6">
            <h3 className="text-[#0B8FAC] mb-1 font-semibold">{doctor.name}</h3>
            <p className="text-gray-600 text-sm">{doctor.specialty}</p>
            <p className="text-gray-500 text-xs mt-2">ID: {doctor.id}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                اسم المريض
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC]"
                placeholder="أدخل اسم المريض"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">العمر</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC]"
                  placeholder="العمر"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  الهاتف
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC]"
                  placeholder="رقم الهاتف"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                التاريخ
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
                الوقت
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC]"
              >
                <option value="">اختر الوقت</option>
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
                إلغاء
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#0a7a94] disabled:opacity-50"
              >
                {loading ? 'جاري الحجز...' : 'حجز الموعد'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}