import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';

interface ForgotPasswordProps {
  onNavigate: (page: string, params?: any) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const { showToast } = useNotification();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.forgotPassword(email.trim());
      setIsSent(true);
      showToast('If an account exists, a reset link has been dispatched.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Error requesting reset', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <button
        onClick={() => onNavigate('login')}
        className="flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Login
      </button>

      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-stone-900">Forgot Password</h1>
          <p className="text-xs text-stone-500">
            Enter your registered email address to receive a secure password reset link.
          </p>
        </div>

        {isSent ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-sm text-emerald-950">Reset Link Sent</h3>
            <p className="text-xs text-emerald-800">
              Check your inbox at <strong>{email}</strong> for instructions to reset your password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending Link...' : 'Send Password Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
