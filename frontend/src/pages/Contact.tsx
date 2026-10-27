import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';

export const Contact: React.FC = () => {
  const { showToast } = useNotification();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.submitContact({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject.trim(),
        message: message.trim(),
      });

      if (res.success) {
        setIsSubmitted(true);
        showToast('Message sent! Our support team will get back to you shortly.', 'success');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to send message', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900">Contact & Support</h1>
        <p className="text-sm text-stone-500">We're here to assist with orders, corporate queries, or snack feedback.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Info Column */}
        <div className="md:col-span-5 bg-stone-900 text-white p-8 rounded-3xl space-y-6 shadow-xl">
          <h3 className="font-bold text-lg text-brand-400">Delhi NCR Support Center</h3>
          
          <div className="space-y-4 text-xs text-stone-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">HQ & Hub:</strong>
                <span>DLF Cyber City, Phase 2, Gurugram, Delhi NCR - 122002</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">WhatsApp & Call:</strong>
                <span>+91 98765 43210 (9 AM - 8 PM IST)</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Official Support:</strong>
                <span>support@officefuel.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="md:col-span-7 bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-stone-900">Send Us a Message</h3>

          {isSubmitted ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-sm text-emerald-950">Thank you! Message Received</h4>
              <p className="text-xs text-emerald-800">Our customer support team will reply to <strong>{email}</strong> shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Order Tracking or Bulk Inquiry"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
