import React, { useEffect, useState } from 'react';
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';

interface LoginProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { showToast } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.login({ email: email.trim(), password });
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        showToast(`Welcome back, ${res.data.user.name}!`, 'success');
        onNavigate('home');
      } else {
        showToast(res.message || 'Invalid email or password', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Login failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleCallback = async (response: any) => {
    if (!response?.credential) return;
    try {
      const res = await api.googleLogin(response.credential);
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        showToast(`Signed in with Google as ${res.data.user.name}!`, 'success');
        onNavigate('home');
      }
    } catch (e: any) {
      showToast(e.message || 'Google sign-in failed', 'error');
    }
  };

  // Google Identity Services integration
  useEffect(() => {
    /* global google */
    if (typeof (window as any).google !== 'undefined') {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: '109283746501-sampleclientid.apps.googleusercontent.com',
          callback: handleGoogleCallback
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          { theme: 'outline', size: 'large', width: '100%', shape: 'pill' }
        );
      } catch (e) {
        console.warn('Google GSI init notice:', e);
      }
    }
  }, []);

  // Development fast simulation button
  const handleSimulatedGoogleLogin = async () => {
    try {
      const mockEmail = email.trim() || 'user@example.com';
      const res = await api.googleLogin('simulated_token', {
        email: mockEmail,
        name: mockEmail.split('@')[0],
      });
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        showToast(`Google Sign-In successful for ${res.data.user.name}`, 'success');
        onNavigate('home');
      }
    } catch (e: any) {
      showToast(e.message || 'Google login simulation failed', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-black text-xl shadow-md mx-auto">
          OF
        </div>
        <h1 className="text-3xl font-black text-stone-900">Welcome Back</h1>
        <p className="text-xs text-stone-500">Sign in to manage snack orders and fast checkout.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
        
        {/* Google One-Tap / Button Container */}
        <div className="space-y-3">
          <div id="googleSignInButton" className="w-full flex justify-center"></div>
          
          <button
            type="button"
            onClick={handleSimulatedGoogleLogin}
            className="w-full py-2.5 px-4 rounded-full border border-stone-300 bg-white text-stone-700 font-bold text-xs hover:bg-stone-50 flex items-center justify-center gap-2 shadow-2xs transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-stone-200"></div>
          <span className="flex-shrink mx-4 text-stone-400 text-[10px] uppercase font-bold tracking-wider">or sign in with email</span>
          <div className="flex-grow border-t border-stone-200"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700">Password</label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-[11px] text-brand-600 hover:underline font-semibold"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-brand-500/25 transition-all active:scale-98 disabled:opacity-50"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-stone-500">
          New to OfficeFuel?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-bold text-brand-600 hover:underline"
          >
            Create an Account
          </button>
        </div>

      </div>

    </div>
  );
};
