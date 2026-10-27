import React from 'react';
import { ShieldCheck, HeartHandshake, Zap, Target } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-black text-brand-600 uppercase tracking-widest">Our Mission</span>
        <h1 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight">Smart Indian Snacking for Busy Days</h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          OfficeFuel was founded under the parent concept of <strong>Ghar Ka Market</strong> to permanently solve the 4 PM office hunger dilemma with authentic, protein-rich Indian nutrition.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-lg text-stone-900">The Problem We Solve</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Every workday across Delhi NCR, millions of professionals and students reach for oily samosas, sugary biscuits, or heavily processed chips. These lead to immediate glucose crashes, sluggish afternoons, and long-term health concerns.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-lg text-stone-900">Our Clean-Label Philosophy</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We slow-roast indigenous Indian crops like fox nuts (Makhana), black chickpeas (Kala Chana), super seeds, and roasted Bengal gram flour (Sattu) with cold-pressed oils and ground spices. Real food, verified protein, and zero junk.
          </p>
        </div>
      </div>

      {/* Geography Focus */}
      <div className="bg-stone-900 text-white p-8 sm:p-10 rounded-3xl space-y-3">
        <h3 className="text-xl font-bold text-brand-400">Delhi NCR Central Logistics Hub</h3>
        <p className="text-xs text-stone-300 leading-relaxed">
          Headquartered in Gurugram, we dispatch all orders within hours to Gurugram, Noida, South Delhi, Central Delhi, Faridabad, and Ghaziabad with reliable express delivery networks.
        </p>
      </div>
    </div>
  );
};
