import { useContext } from 'react';
import { AppContext } from '../../App';

export default function DateSelector({ availableDates, selectedDate, setSelectedDate }) {
    const { darkMode } = useContext(AppContext);

    return (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 transition-colors`}>
            <h3 className="text-[#0B8FAC] font-bold text-lg mb-4">📅 Select Date</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
                {availableDates.length === 0 ? (
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No appointments available</p>
                ) : (
                    availableDates.map(date => (
                        <button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold transition ${
                                selectedDate === date
                                    ? 'bg-[#0B8FAC] text-white'
                                    : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                            }`}
                        >
                            {new Date(date).toLocaleDateString()}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
