import React, { useState } from 'react';
import { Building2, Users, CheckCircle2, ShieldCheck, FileText, ArrowRight, Zap } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';

export const Corporate: React.FC = () => {
  const { showToast } = useNotification();

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeCount, setEmployeeCount] = useState('20-50');
  const [snackRequirement, setSnackRequirement] = useState('Monthly Pantry Crates');
  const [budget, setBudget] = useState('₹10,000 - ₹25,000 / month');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.submitCorporateInquiry({
        company_name: companyName.trim(),
        contact_person: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        employee_count: employeeCount,
        snack_requirement: snackRequirement,
        estimated_budget: budget,
        message: message.trim() || undefined,
      });

      if (res.success) {
        setIsSubmitted(true);
        showToast('Corporate inquiry submitted successfully!', 'success');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to submit inquiry', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 py-12">
      
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5 text-brand-600" /> B2B Corporate Wellness
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Fuel Your Company with <span className="text-brand-600">Smart Indian Snacking</span>
        </h1>

        <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Upgrade your company pantries and boardrooms in Delhi NCR from sugar and palm-oil junk to clean, high-protein roasted snacks.
        </p>
      </section>

      {/* Corporate Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-3">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-stone-900">Desk & Keyboard Friendly</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              No oily residue or messy powders. Clean-label dry roasted fox nuts and seeds designed for productive coding and meetings.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-stone-900">Custom Monthly Subscriptions</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Flexible scheduled deliveries directly to your office reception across Gurugram, Noida, and Delhi NCR.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-3">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-stone-900">GST Invoices & Bulk Pricing</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              100% compliant business GST invoices with volume corporate discounts and dedicated account managers.
            </p>
          </div>

        </div>
      </section>

      {/* Inquiry Form */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">Request Corporate Snack Catalog</h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Fill out the form below. Our corporate manager will prepare a custom proposal within 4 business hours.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-emerald-950">Thank You! Inquiry Received</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                We have registered your corporate requirement for <strong>{companyName}</strong>. Our Delhi NCR B2B representative will reach out at <strong>{email}</strong> shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Company / Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Zomato, Swiggy, DLF"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Sneha Roy (HR / Admin)"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Official Work Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sneha@company.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Contact Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Team / Office Size *</label>
                  <select
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50"
                  >
                    <option value="10-25">10 - 25 Employees</option>
                    <option value="25-50">25 - 50 Employees</option>
                    <option value="50-200">50 - 200 Employees</option>
                    <option value="200+">200+ Employees (Large Enterprise)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Snack Requirement *</label>
                  <select
                    value={snackRequirement}
                    onChange={(e) => setSnackRequirement(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50"
                  >
                    <option value="Monthly Pantry Crates">Monthly Pantry Crates (Assorted 24/48-packs)</option>
                    <option value="Employee Welcome Kits">Employee Welcome & Onboarding Gift Boxes</option>
                    <option value="Event Bulk Supply">Single-event / Conference Snack Boxes</option>
                    <option value="Weekly Office Desks">Weekly Employee Desk Deliveries</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Estimated Monthly Budget</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50"
                >
                  <option value="₹5,000 - ₹10,000">₹5,000 - ₹10,000</option>
                  <option value="₹10,000 - ₹25,000">₹10,000 - ₹25,000</option>
                  <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                  <option value="₹50,000+">₹50,000+ (Custom Bulk Contract)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Additional Notes / Dietary Requirements</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about specific snack preferences, delivery timing, or GST details..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Submitting Inquiry...' : 'Submit Corporate Inquiry'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
};
