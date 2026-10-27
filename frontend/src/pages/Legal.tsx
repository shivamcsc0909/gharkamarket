import React, { useState } from 'react';

interface LegalProps {
  initialSection?: string;
}

export const Legal: React.FC<LegalProps> = ({ initialSection = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState<string>(initialSection);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Tab Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'privacy' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'terms' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Terms & Conditions
        </button>
        <button
          onClick={() => setActiveTab('refund')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'refund' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Refund & Cancellation
        </button>
        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'shipping' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Shipping & Delivery
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-xs prose prose-stone max-w-none text-xs sm:text-sm leading-relaxed space-y-6">
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-stone-900">Privacy Policy</h2>
            <p>
              At <strong>OfficeFuel</strong> (a brand of <strong>Ghar Ka Market E-Commerce LLP</strong>), we respect your privacy. This policy outlines how we collect, store, and protect your information when you use our website and services.
            </p>
            <h3 className="text-base font-bold text-stone-800">1. Information We Collect</h3>
            <p>
              We collect your name, email, phone number, and delivery address to fulfill snack orders and communicate shipment updates. We do NOT store payment card numbers or banking passwords; all transactions are processed securely by Razorpay.
            </p>
            <h3 className="text-base font-bold text-stone-800">2. Data Security</h3>
            <p>
              We implement industry-standard 256-bit SSL encryption and strict server-side access controls. We never sell your personal contact information to third-party advertisers.
            </p>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-stone-900">Terms & Conditions</h2>
            <p>
              By accessing or purchasing from OfficeFuel (Ghar Ka Market), you agree to our terms of service.
            </p>
            <h3 className="text-base font-bold text-stone-800">1. Product Information & Pricing</h3>
            <p>
              All prices are listed in Indian Rupees (INR) and are inclusive of applicable 5% Goods and Services Tax (GST). We reserve the right to revise product prices and promotional discounts at any time.
            </p>
            <h3 className="text-base font-bold text-stone-800">2. Responsible Nutrition Claims</h3>
            <p>
              Our snacks are portion-friendly and protein-focused everyday foods. They are not intended to diagnose, treat, or replace medical therapies or clinical diets.
            </p>
          </div>
        )}

        {activeTab === 'refund' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-stone-900">Refund & Cancellation Policy</h2>
            <p>
              We stand by the freshness and quality of our products.
            </p>
            <h3 className="text-base font-bold text-stone-800">1. Cancellations</h3>
            <p>
              You may cancel an order before it has been dispatched from our Gurugram facility. Once dispatched, cancellation is not possible.
            </p>
            <h3 className="text-base font-bold text-stone-800">2. Damaged or Incorrect Products</h3>
            <p>
              If you receive a package that is damaged or missing items, contact us at <strong>support@officefuel.in</strong> or WhatsApp <strong>+91 98765 43210</strong> within 48 hours of delivery with photos. We will immediately issue a replacement or full refund to your original payment method.
            </p>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-stone-900">Shipping & Delivery Policy</h2>
            <p>
              We specialize in rapid distribution across the National Capital Region (Delhi NCR).
            </p>
            <h3 className="text-base font-bold text-stone-800">1. Delivery Turnaround</h3>
            <p>
              Delhi NCR (Gurugram, Delhi, Noida, Greater Noida, Faridabad, Ghaziabad): Orders are typically delivered within 24 to 48 business hours. Orders placed before 2 PM IST are packed and dispatched the same day.
            </p>
            <h3 className="text-base font-bold text-stone-800">2. Delivery Charges</h3>
            <p>
              We provide FREE Express Delivery on all orders above ₹499. For orders below ₹499, a flat delivery fee of ₹49 applies.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
