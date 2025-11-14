import { Users } from 'lucide-react';
import { useContext } from 'react';
import { AppContext } from '../../../App';
import PatientCard from '../components/PatientCard';

export default function PatientsPage({ patients, appointments }) {
    const { darkMode } = useContext(AppContext);

    return (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transition-colors`}>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-[#0B8FAC] to-blue-600'} text-white p-6 flex items-center gap-3`}>
                <Users className="w-6 h-6" />
                <h2 className="font-bold text-2xl">Patients ({patients.length})</h2>
            </div>

            <div className="p-6">
                {patients.length === 0 ? (
                    <div className={`text-center py-12 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <Users className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No patients yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {patients.map((patient) => {
                            const patientAppointments = appointments.filter(a => a.patient_id === patient.id);
                            return (
                                <PatientCard 
                                    key={patient.id} 
                                    patient={patient} 
                                    appointmentCount={patientAppointments.length}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}