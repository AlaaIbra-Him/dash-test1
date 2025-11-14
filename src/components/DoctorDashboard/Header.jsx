import { useContext } from 'react';
import { Menu } from 'lucide-react';
import { AppContext } from '../../App';

// eslint-disable-next-line no-unused-vars
export default function Header({ activePage, sidebarOpen, setSidebarOpen }) {
    // eslint-disable-next-line no-unused-vars
    const { darkMode, t } = useContext(AppContext);

    const getPageTitle = () => {
        switch(activePage) {
            case 'appointments': return 'Appointments';
            case 'patients': return 'Patients';
            case 'settings': return 'Settings';
            default: return 'Dashboard';
        }
    };

    return (
        <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 shadow-sm border-b sticky top-0 z-10 flex items-center justify-between`}>
            <h2 className="text-3xl font-bold text-[#0B8FAC]">{getPageTitle()}</h2>
        </header>
    );
}
