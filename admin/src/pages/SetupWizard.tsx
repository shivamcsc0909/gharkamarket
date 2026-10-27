import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, User as UserIcon, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi } from '../services/adminApi';

interface SetupWizardProps {
  onComplete: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const { login } = useAdminAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInstall = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Super Admin password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await adminApi.installSetup({
        name: name.trim(),
        email: email.trim(),
        password: password,
      });

      if (res.success && res.data) {
        login(res.data.token, res.data.admin);
        onComplete();
      } else {
        setError(res.message || 'Installation failed.');
      }
    } catch (e: any) {
      setError(e.message || 'Setup error. Endpoint may already be locked.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-stone-950 border border-stone-800 rounded-3xl p-8 sm:p-10 text-white space-y-6 shadow-2xl">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-black text-xl shadow-lg mx-auto">
            OF
          </div>
          <span className="text-[10px] uppercase font-black tracking-widest text-brand-400 bg-brand-950/80 border border-brand-800/80 px-3 py-1 rounded-full">
            First Deployment Setup
          </span>
          <h1 className="text-2xl font-black">Provision Super Admin Account</h1>
          <p className="text-xs text-stone-400">
            Create the primary Super Admin account to initialize your store. This setup wizard will be permanently locked after completion.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleInstall} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">Super Admin Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Founder / Senior Operations Manager"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs focus:outline-hidden focus:border-brand-500"
              />
              <UserIcon className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">Super Admin Official Email *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@officefuel.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs focus:outline-hidden focus:border-brand-500"
              />
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Password (Min 8 chars) *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs focus:outline-hidden focus:border-brand-500"
                />
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Confirm Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs focus:outline-hidden focus:border-brand-500"
                />
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-brand-500/25 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Initializing Store & Schema...' : 'Initialize & Lock Setup Wizard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
