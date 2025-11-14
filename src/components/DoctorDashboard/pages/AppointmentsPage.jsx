// eslint-disable-next-line no-unused-vars
import { useState, useContext } from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import { AppContext } from '../../../App';
import StatCard from '../components/StatCard';
import DateSelector from '../components/DateSelector';
import AppointmentsTable from '../components/AppointmentsTable';

export default function AppointmentsPage({ appointments, stats, handleDeleteAppointment, selectedDate, setSelectedDate }) {
    // eslint-disable-next-line no-unused-vars
    const { darkMode, t } = useContext(AppContext);

    const appointmentPercentage = stats.totalAppointments > 0
        ? Math.round((stats.bookedAppointments / stats.totalAppointments) * 100)
        : 0;

    const getAvailableDates = () => {
        const dates = appointments.map(a => a.date);
        return [...new Set(dates)].sort();
    };

    const selectedDateAppointments = appointments.filter(a => a.date === selectedDate);
    const availableDates = getAvailableDates();

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard label="Total Appointments" value={stats.totalAppointments} color="border-blue-500" textColor="text-[#0B8FAC]" />
                <StatCard label="Booked" value={stats.bookedAppointments} color="border-green-500" textColor="text-green-600" />
                <StatCard label="Cancelled" value={stats.cancelledAppointments} color="border-red-500" textColor="text-red-600" />
            </div>

            {/* Fill Rate Bar */}
            {stats.totalAppointments > 0 && (
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg transition-colors`}>
                    <h3 className="text-[#0B8FAC] font-bold mb-4">Appointment Fill Rate</h3>
                    <div className="flex items-center gap-4">
                        <div className={`flex-1 rounded-full h-5 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div
                                className="bg-gradient-to-r from-blue-500 to-[#0B8FAC] h-full rounded-full transition-all duration-700"
                                style={{ width: `${appointmentPercentage}%` }}
                            />
                        </div>
                        <span className="text-2xl font-bold text-[#0B8FAC]">{appointmentPercentage}%</span>
                    </div>
                </div>
            )}

            {/* Date Selector */}
            <DateSelector 
                availableDates={availableDates}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
            />

            {/* Selected Day Appointments */}
            <AppointmentsTable 
                appointments={selectedDateAppointments}
                title={` Today Appointments ( ${new Date(selectedDate).toLocaleDateString()})`}
                handleDeleteAppointment={handleDeleteAppointment}
                isDaily={true}
            />

            {/* All Appointments */}
            <AppointmentsTable 
                appointments={appointments}
                title={`All Appointments (${appointments.length})`}
                handleDeleteAppointment={handleDeleteAppointment}
                isDaily={false}
            />
        </div>
    );
}