import React from 'react';
import { Zap, Truck, Tag } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-stone-200 text-xs py-2 px-4 border-b border-stone-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
        <div className="flex items-center gap-2 font-medium">
          <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-ping" />
          <span className="text-white font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-brand-400 fill-brand-400" /> Delhi NCR Fast Delivery:
          </span>
          <span>Orders placed before 2 PM dispatched same day!</span>
        </div>

        <div className="flex items-center gap-4 text-stone-300 hidden md:flex">
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-emerald-400" /> FREE Delivery on orders ₹499+
          </span>
          <span className="text-stone-600">•</span>
          <span className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-amber-400" /> Use code <strong className="text-brand-300 font-mono tracking-wider ml-0.5">FUELFIRST</strong> for 15% OFF
          </span>
        </div>
      </div>
    </div>
  );
};
