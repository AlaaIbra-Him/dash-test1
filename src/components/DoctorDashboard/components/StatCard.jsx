import { useContext } from 'react';
import { AppContext } from '../../../App';

export default function StatCard({ label, value, color, textColor }) {
    const { darkMode } = useContext(AppContext);

    return (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg border-l-4 ${color} hover:shadow-xl transition transform hover:-translate-y-0.5`}>
            <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
            <p className={`text-4xl font-bold ${textColor} mt-2`}>{value}</p>
        </div>
    );
}
