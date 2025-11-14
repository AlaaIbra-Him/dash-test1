import { useContext } from 'react';
import { AppContext } from '../../App';

export default function NavItem({ icon, label, active, onClick }) {
    const { darkMode } = useContext(AppContext);

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                active
                    ? 'bg-[#0B8FAC] text-white'
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-white'}`
            }`}
        >
            {icon}
            {label}
        </button>
    );
}