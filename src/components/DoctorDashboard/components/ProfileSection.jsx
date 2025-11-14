import { Edit2 } from 'lucide-react';
import { useContext } from 'react';
import { AppContext } from '../../../App';

export default function ProfileSection({
    doctor,
    setDoctor,
    editMode,
    setEditMode,
    loading,
    handleSaveProfile
}) {
    const { darkMode } = useContext(AppContext);

    return (
        <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 transition-colors`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#0B8FAC] font-bold text-2xl">Edit Profile</h3>
                {!editMode && (
                    <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#0a7a94] transition"
                    >
                        <Edit2 className="w-4 h-4" /> Edit
                    </button>
                )}
            </div>

            {editMode ? (
                <div className="space-y-4">
                    <div>
                        <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                        <input
                            type="text"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            value={doctor.name}
                            onChange={(e) => setDoctor({ ...doctor, name: e.target.value })}
                            placeholder="Full Name"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
                            <input
                                type="tel"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                value={doctor.phone}
                                onChange={(e) => setDoctor({ ...doctor, phone: e.target.value })}
                                placeholder="Phone"
                            />
                        </div>
                        <div>
                            <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Specialty</label>
                            <input
                                type="text"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                value={doctor.specialty}
                                onChange={(e) => setDoctor({ ...doctor, specialty: e.target.value })}
                                placeholder="Specialty"
                            />
                        </div>
                    </div>
                    <div>
                        <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                        <textarea
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            value={doctor.description}
                            onChange={(e) => setDoctor({ ...doctor, description: e.target.value })}
                            placeholder="Description"
                            rows="4"
                        />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 font-semibold"
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={() => setEditMode(false)}
                            className={`flex-1 px-4 py-3 rounded-lg transition font-semibold ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Full Name</p>
                        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{doctor.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</p>
                            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{doctor.phone || 'N/A'}</p>
                        </div>
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Specialty</p>
                            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{doctor.specialty}</p>
                        </div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Description</p>
                        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{doctor.description || 'N/A'}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
