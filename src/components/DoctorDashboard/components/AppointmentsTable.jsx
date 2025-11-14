import { Calendar, Trash2 } from 'lucide-react';
import { useContext } from 'react';
import { AppContext } from '../../../App';

export default function AppointmentsTable({ appointments, title, handleDeleteAppointment, isDaily }) {
    const { darkMode } = useContext(AppContext);

    // eslint-disable-next-line no-unused-vars
    const columns = isDaily 
        ? ['Patient', 'Time', 'Phone', 'Age', 'Status', 'Action']
        : ['Patient', 'Date', 'Time', 'Phone', 'Age', 'Status', 'Action'];

    return (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transition-colors`}>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-[#0B8FAC] to-blue-600'} text-white p-6`}>
                <h3 className="font-bold text-xl">{title}</h3>
            </div>

        {appointments.length === 0 ? (
            <div className={`text-center py-12 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <Calendar className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No appointments Today</p>
            </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                            <tr>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>👤 Patient</th>
                                {!isDaily && <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>📅 Date</th>}
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>🕐 Time</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>📞 Phone</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>👨 Age</th>
                                <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                                <th className={`px-6 py-3 text-center text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Action</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {appointments.map(appt => (
                                <tr key={appt.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition`}>
                                    <td className={`px-6 py-4 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{appt.patient_name}</td>
                                    {!isDaily && <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{appt.date}</td>}
                                    <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{appt.time}</td>
                                    <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{appt.phone}</td>
                                    <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{appt.age}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${appt.status === 'booked' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                            {appt.status === 'booked' ? 'Confirmed' : 'Cancelled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleDeleteAppointment(appt.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs font-semibold inline-flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3 h-3" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}