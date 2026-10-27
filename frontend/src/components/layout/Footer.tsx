import React from 'react';
import { ShieldCheck, Truck, RefreshCw, HeartHandshake, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Props Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-stone-800 text-stone-300">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-stone-800 text-brand-400 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Delhi NCR Fast Ship</h4>
              <p className="text-xs text-stone-300">Same-day dispatch & 24h delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-stone-800 text-emerald-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Verified Nutrition</h4>
              <p className="text-xs text-stone-300">Real protein & clean ingredients</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-stone-800 text-sky-400 rounded-xl">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Desk & Keyboard Safe</h4>
              <p className="text-xs text-stone-300">Non-sticky, non-greasy portions</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-stone-800 text-amber-400 rounded-xl">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Easy Ordering</h4>
              <p className="text-xs text-stone-300">Razorpay UPI, cards & netbanking</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                OF
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">Office<span className="text-brand-500">Fuel</span></span>
            </div>
            <p className="text-sm text-stone-300 max-w-sm leading-relaxed">
              Smart Indian Snacking for Busy Days. High-protein, clean-label roasted snacks portioned specifically for office desks, students, and active lifestyles in Delhi NCR.
            </p>
            <p className="text-xs text-stone-300">
              A consumer food brand by <strong>Ghar Ka Market E-Commerce LLP</strong>.
            </p>
          </div>

          {/* Quick Shop */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Shop Smart</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">
                  All Products
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'protein-snacks' })} className="hover:text-white transition-colors">
                  Roasted Makhana & Chana
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: '7-day-packs' })} className="hover:text-white transition-colors">
                  7-Day Office Snack Packs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'breakfast-mixes' })} className="hover:text-white transition-colors">
                  High-Protein Sattu Mix
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('corporate')} className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
                  Corporate Pantry Boxes
                </button>
              </li>
            </ul>
          </div>

          {/* Customer & Company */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  Our Mission
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('corporate')} className="hover:text-white transition-colors">
                  Corporate Wellness Program
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Contact & Helpdesk
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal', { section: 'privacy' })} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal', { section: 'terms' })} className="hover:text-white transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal', { section: 'refund' })} className="hover:text-white transition-colors">
                  Refund & Cancellation
                </button>
              </li>
            </ul>
          </div>

          {/* Delhi NCR Support */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Delhi NCR Hub</h4>
            <ul className="space-y-3 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>DLF Cyber City, Phase 2, Gurugram, Delhi NCR - 122002</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+91 98765 43210 (WhatsApp Support)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@officefuel.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Rights */}
        <div className="pt-8 border-t border-stone-800 text-xs text-stone-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} OfficeFuel (Ghar Ka Market). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Prepaid Razorpay SSL Secured</span>
            <span>100% Vegetarian</span>
            <span>FSSAI Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
