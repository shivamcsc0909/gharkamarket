import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, Sparkles, ArrowRight, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi } from '../services/adminApi';

interface AdminLoginProps {
  onNavigateToSetup?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onNavigateToSetup }) => {
  const { login } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickFill = () => {
    setEmail('admin@officefuel.in');
    setPassword('Admin@123');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await adminApi.login({ email: email.trim(), password });
      if (res.success && res.data) {
        login(res.data.token, res.data.admin);
      } else {
        setError(res.message || 'Invalid administrative credentials.');
      }
    } catch (e: any) {
      setError(e.message || 'Authentication error. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-stone-900/90 backdrop-blur-xl border border-stone-800 rounded-3xl p-8 sm:p-10 text-white space-y-7 shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand-500/20 mx-auto">
            OF
          </div>
          <h1 className="text-2xl font-black tracking-tight">OfficeFuel Operations</h1>
          <p className="text-xs text-stone-400 font-medium">Store Operations & Staff Portal</p>
        </div>

        {/* Quick Demo Credentials Card */}
        <div className="bg-stone-800/80 border border-stone-700/80 rounded-2xl p-4 space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-400">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Default Admin Credentials</span>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] font-extrabold px-2.5 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <Sparkles className="w-3 h-3" />
              <span>1-Click Auto-Fill</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-stone-900/90 p-2.5 rounded-xl border border-stone-800">
            <div>
              <span className="text-stone-500 block">Email</span>
              <span className="text-stone-200 font-bold select-all">admin@officefuel.in</span>
            </div>
            <div>
              <span className="text-stone-500 block">Password</span>
              <span className="text-stone-200 font-bold select-all">Admin@123</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1.5">Admin Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@officefuel.in"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs focus:outline-hidden focus:border-brand-500 transition-colors"
              />
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1.5">Admin Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs focus:outline-hidden focus:border-brand-500 transition-colors"
              />
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-stone-500 hover:text-stone-300"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs rounded-xl shadow-lg shadow-brand-500/25 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-stone-800 text-center text-[11px] text-stone-500 flex items-center justify-between relative z-10">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Secure RBAC
          </span>
          {onNavigateToSetup && (
            <button
              onClick={onNavigateToSetup}
              className="text-brand-400 hover:underline font-bold"
            >
              Setup Wizard →
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
