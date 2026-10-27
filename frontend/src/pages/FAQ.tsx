import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How fast is delivery in Delhi NCR?',
      a: 'We deliver within 24 to 48 business hours across Delhi, Gurugram, Noida, Greater Noida, Faridabad, and Ghaziabad. Orders placed before 2 PM are packed and dispatched the same day from our central Gurugram hub.'
    },
    {
      q: 'Are your snacks really oil-free or low oil?',
      a: 'Yes! Our Makhana, Kala Chana, Super Seeds, and Sattu mixes are 100% slow-roasted. We do not use deep-frying, palm oil, or trans fats. Only cold-pressed olive or groundnut oil is used in minimal micro-droplets to bind our authentic ground spices.'
    },
    {
      q: 'What is inside the 7-Day Office Fuel Starter Box?',
      a: 'The 7-Day Box contains 7 individually sealed portion packs: Monday (Pudina Makhana), Tuesday (Peri Peri Chana), Wednesday (Seed Trail), Thursday (Achari Soya Crisps), Friday (Roasted Jowar Puffs), Saturday (Nut & Seed Bar), and Sunday (Moong Jor Masala).'
    },
    {
      q: 'Do you offer Corporate & Office Pantry deliveries?',
      a: 'Yes, we supply monthly snack crates, employee onboarding gift boxes, and boardroom snack jars across Delhi NCR with customized GST billing and corporate volume pricing.'
    },
    {
      q: 'What payment methods do you support?',
      a: 'We accept all prepaid payment methods via Razorpay: UPI (Google Pay, PhonePe, Paytm, BHIM), Debit & Credit Cards (Visa, Mastercard, RuPay, Amex), Net Banking across 50+ Indian banks, and corporate corporate cards.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-black text-brand-600 uppercase tracking-widest">Help Center</span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900">Frequently Asked Questions</h1>
        <p className="text-xs sm:text-sm text-stone-500">Everything you need to know about our snacks, delivery, and ingredients.</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full text-left p-5 flex items-center justify-between font-bold text-sm text-stone-900 hover:text-brand-600 transition-colors"
            >
              <span>{faq.q}</span>
              {openIndex === idx ? <ChevronUp className="w-4 h-4 text-brand-600" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
            </button>
            {openIndex === idx && (
              <div className="px-5 pb-5 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
