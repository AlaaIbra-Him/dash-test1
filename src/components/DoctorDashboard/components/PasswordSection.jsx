import { Key } from 'lucide-react';
import { useContext } from 'react';
import { AppContext } from '../../../App';

export default function PasswordSection({
    passwordMode,
    setPasswordMode,
    newPassword,
    setNewPassword,
    loading,
    handleChangePassword
}) {
    const { darkMode } = useContext(AppContext);

    return (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 transition-colors`}>
            <h3 className="text-[#0B8FAC] font-bold text-xl mb-6 flex items-center gap-2">
                <Key className="w-5 h-5" /> Change Password
            </h3>

            {passwordMode ? (
                <div className="space-y-4">
                    <div>
                        <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            New Password
                        </label>
                        <input
                            type="password"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            placeholder="Enter password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleChangePassword}
                            disabled={loading}
                            className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 font-semibold"
                        >
                            {loading ? 'Saving...' : 'Change'}
                        </button>
                        <button
                            onClick={() => {
                                setPasswordMode(false);
                                setNewPassword('');
                            }}
                            className={`w-full px-4 py-3 rounded-lg transition font-semibold ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setPasswordMode(true)}
                    className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center justify-center gap-2 font-semibold"
                >
                    <Key className="w-4 h-4" /> Change Password
                </button>
            )}
        </div>
    );
}