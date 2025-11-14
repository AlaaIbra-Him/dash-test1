import { useContext } from 'react';
import { AppContext } from '../../../App';
import ProfileSection from '../components/ProfileSection';
import PasswordSection from '../components/PasswordSection';

export default function SettingsPage({
    doctor,
    setDoctor,
    editMode,
    setEditMode,
    passwordMode,
    setPasswordMode,
    newPassword,
    setNewPassword,
    loading,
    handleSaveProfile,
    handleChangePassword
}) {
    // eslint-disable-next-line no-unused-vars
    const { darkMode } = useContext(AppContext);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ProfileSection
                doctor={doctor}
                setDoctor={setDoctor}
                editMode={editMode}
                setEditMode={setEditMode}
                loading={loading}
                handleSaveProfile={handleSaveProfile}
            />
            <PasswordSection
                passwordMode={passwordMode}
                setPasswordMode={setPasswordMode}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                loading={loading}
                handleChangePassword={handleChangePassword}
            />
        </div>
    );
}
