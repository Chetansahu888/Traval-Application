import React, { useState } from 'react';
import { User } from '../types';
import { googleSheetService } from '../services/googleSheetService';
import { Lock, User as UserIcon, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const users = await googleSheetService.fetchUsers();
      const typed = username.trim().toLowerCase();
      const user = users.find(u => String(u.username).trim().toLowerCase() === typed);
      
      if (user) {
        if (username === "Ahitesh" && password !== "Tandan") {
          setError('Invalid password. Please try again.');
          setLoading(false);
          return;
        }
        onLogin(user);
      } else {
        setError('Username not found. Please check your credentials.');
      }
    } catch (err) {
      setError('Server se connect nahi ho paya. Thodi der baad dobara try karein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F1] flex items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-40 translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Green Header Strip */}
          <div className="bg-emerald-600 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShieldCheck size={36} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Travel App Pasmin
            </h1>
            <p className="text-emerald-100 text-sm font-medium mt-1"></p>
          </div>

          {/* Form */}
          <div className="px-8 py-8 space-y-5">
            <div>
              <p className="text-center text-sm font-semibold text-slate-500 mb-6"></p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all font-medium text-slate-800 placeholder:text-slate-300 text-sm outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all font-medium text-slate-800 text-sm outline-none"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2.5 border border-red-100">
                  <AlertCircle size={16} className="shrink-0" /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-400 font-medium mt-5"></p>
      </div>
    </div>
  );
};

export default Login;