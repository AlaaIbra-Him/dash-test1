import { useContext } from 'react';
import { AppContext } from '../../../App';

export default function PatientCard({ patient, appointmentCount }) {
    const { darkMode } = useContext(AppContext);

    return (
        <div className={`p-4 rounded-lg border-l-4 border-[#0B8FAC] ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-blue-50'} transition cursor-pointer shadow-md`}>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {patient.name || 'Unknown'}
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
                    📋 Appointments: <span className="text-[#0B8FAC]">{appointmentCount}</span>
                </p>
            </div>
        </div>
    );
}
