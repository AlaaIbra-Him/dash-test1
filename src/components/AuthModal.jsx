import { useState } from 'react';
import { X, Mail, Lock, Briefcase, User } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AuthModal({ role, onClose, onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) throw authError;

            const userId = authData.user?.id;
            if (!userId) throw new Error("User ID missing");

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('name,specialty,role')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;

            if (profile.role === role) {
                onLoginSuccess(profile.role);
                onClose();
            } else {
                await supabase.auth.signOut();
                alert(`Login failed: Your credentials are for a ${profile.role}, not a ${role}.`);
            }

        } catch (err) {
            console.error(err.message);
            alert('Login Failed: Invalid credentials or database error.');
        } finally {
            setLoading(false);
            setPassword('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition">
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#0B8FAC] rounded-lg flex items-center justify-center mx-auto mb-4">
                        {role === 'admin' ? <Briefcase className="w-8 h-8 text-white" /> : <User className="w-8 h-8 text-white" />}
                    </div>
                    <h2 className="text-[#0B8FAC] mb-2">{role === 'admin' ? 'Admin Dashboard Sign In' : 'Doctor Sign In'}</h2>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2"><Mail className="w-4 h-4 inline mr-2" />Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={`Enter ${role} email`} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC]" />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2"><Lock className="w-4 h-4 inline mr-2" />Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter password" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC]" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full px-6 py-3 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#0a7a94] transition">
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
