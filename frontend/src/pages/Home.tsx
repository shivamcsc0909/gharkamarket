import React, { useEffect, useState } from 'react';
import { 
  Sparkles, ArrowRight, ShieldCheck, Zap, Coffee, Dumbbell, 
  Briefcase, Calendar, CheckCircle2, ChevronRight, Star, Award, 
  Building2, Search, PackageCheck, Flame, HeartHandshake, Clock
} from 'lucide-react';
import { api } from '../services/api';
import { Category, Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import { useCart } from '../context/CartContext';

interface HomeProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { addItem } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedNeed, setSelectedNeed] = useState<string>('office_snack');
  const [needProducts, setNeedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNeedLoading, setIsNeedLoading] = useState<boolean>(false);
  const [heroSearch, setHeroSearch] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.getProducts({ featured: 1, limit: 8 }),
          api.getCategories(),
        ]);

        if (prodRes.success && prodRes.data) {
          setFeaturedProducts(prodRes.data);
        }
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
      } catch (e) {
        console.error('Home data load failed:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchNeedSnacks = async () => {
      setIsNeedLoading(true);
      try {
        const res = await api.getNeedDiscovery(selectedNeed);
        if (res.success && res.data) {
          setNeedProducts(res.data);
        }
      } catch (e) {
        console.error('Need discovery failed:', e);
      } finally {
        setIsNeedLoading(false);
      }
    };
    fetchNeedSnacks();
  }, [selectedNeed]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      onNavigate('shop', { search: heroSearch.trim() });
    }
  };

  const needsList = [
    { id: 'office_snack', label: 'Office Desk Snack', icon: Briefcase, desc: 'Clean, keyboard-friendly & non-greasy' },
    { id: 'weekly_pack', label: '7-Day Weekly Pack', icon: Calendar, desc: 'Monday to Sunday portion-sorted packs' },
    { id: 'quick_breakfast', label: 'Quick Breakfast', icon: Coffee, desc: 'Chilla mix, high-protein oats & Sattu' },
    { id: 'workout_snack', label: 'Gym & Fitness', icon: Dumbbell, desc: 'Up to 24g natural plant protein' },
    { id: 'corporate_order', label: 'Corporate & HR', icon: Building2, desc: 'Pantry crates & employee wellness boxes' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-stone-50 to-white pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/90 text-brand-900 text-xs font-black tracking-wide uppercase border border-brand-300 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Delhi NCR Express Snacking Network</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.1]">
                Protein-Packed Convenience for <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-amber-600 to-brand-500">Busy Indian Workdays</span>
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Curated high-protein Indian desk snacks, 7-day work packs, and instant breakfast mixes. Sourced from certified Indian producers and delivered fresh to Gurgaon, Noida, and Delhi offices. Zero cooking, zero hassle.
              </p>

              {/* Hero Search Bar */}
              <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto lg:mx-0 pt-1">
                <div className="relative flex items-center shadow-lg rounded-2xl bg-white border-2 border-stone-200 focus-within:border-brand-500 transition-all p-1.5">
                  <Search className="w-5 h-5 text-stone-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search roasted chana, peri makhana, 7-day pack..."
                    className="w-full px-3 py-2 text-sm text-stone-900 placeholder-stone-400 bg-transparent focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-extrabold rounded-xl transition-colors shrink-0 shadow-xs"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Hero Action CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => onNavigate('shop')}
                  className="px-7 py-4 bg-brand-500 hover:bg-brand-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-102 active:scale-98"
                >
                  <span>Explore Snack Menu</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  onClick={() => onNavigate('shop', { category: 'office-snack-boxes' })}
                  className="px-6 py-4 bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg transition-all hover:scale-102 active:scale-98 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>7-Day Desk Pack (₹699)</span>
                </button>

                <button
                  onClick={() => onNavigate('corporate')}
                  className="px-6 py-4 bg-white hover:bg-stone-100 text-stone-800 font-bold text-sm sm:text-base rounded-2xl border border-stone-300 shadow-2xs transition-colors flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-brand-600" />
                  <span>Corporate / HR Pantries</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-stone-200/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="font-black text-stone-900 text-lg sm:text-xl">Up to 24g</div>
                  <div className="text-xs text-stone-500 font-medium">Protein / 100g</div>
                </div>
                <div>
                  <div className="font-black text-stone-900 text-lg sm:text-xl">100% Roasted</div>
                  <div className="text-xs text-stone-500 font-medium">Zero Palm Oil</div>
                </div>
                <div>
                  <div className="font-black text-stone-900 text-lg sm:text-xl">Delhi NCR</div>
                  <div className="text-xs text-stone-500 font-medium">Same-Day Express</div>
                </div>
              </div>

            </div>

            {/* Hero Right Visual Banner */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-900 aspect-4/3 sm:aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=900&auto=format&fit=crop&q=80"
                  alt="OfficeFuel Protein Snacks"
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-stone-950 font-black text-xs rounded-full w-max mb-2">
                    <Flame className="w-3.5 h-3.5 text-orange-600" /> Delhi Bestseller Box
                  </div>
                  <h3 className="font-extrabold text-xl sm:text-2xl">High-Protein Office Snack Box</h3>
                  <p className="text-xs text-stone-300 mt-1">Roasted chana, makhana, soy nuts, seed mix & protein bar.</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-brand-400">₹399</span>
                      <span className="text-sm text-stone-400 line-through">₹499</span>
                    </div>
                    <button
                      onClick={() => onNavigate('shop', { category: 'office-snack-boxes' })}
                      className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                    >
                      Order Box Now →
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CORE BOX OFFERS (Quick Explorer) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-black text-brand-600 uppercase tracking-widest">Pre-Curated Formats</h2>
          <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">Choose Your Workday Fuel Format</h3>
          <p className="text-sm text-stone-500 mt-2">
            No cooking, no measuring. Delivered to your desk or home in Delhi NCR.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Box 1: Office Snack Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 hover:border-brand-500 transition-all shadow-xs hover:shadow-xl flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                🍱
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                Single Worker Desk Crate
              </span>
              <h4 className="text-xl font-black text-stone-900">High-Protein Office Snack Box</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Keep at your office desk for 4 PM cravings. Roasted chana, makhana, soy nuts, seed trail, and a protein bar.
              </p>
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-stone-900">₹399</span>
                <span className="text-xs text-stone-400 line-through">₹499</span>
                <span className="text-xs font-bold text-emerald-600">Save 20%</span>
              </div>
            </div>
            <div className="pt-6">
              <button
                onClick={() => onNavigate('shop', { category: 'office-snack-boxes' })}
                className="w-full py-3 bg-stone-900 hover:bg-brand-500 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>View & Buy Box</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Box 2: 7-Day Desk Pack (Highlighted) */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-400 transition-all shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-brand-500/20 rounded-full blur-xl pointer-events-none"></div>
            <div className="space-y-3 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-xl mb-4">
                ⚡
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2.5 py-1 rounded-full border border-amber-400/30">
                Most Popular Workweek Pack
              </span>
              <h4 className="text-xl font-black text-white">7-Day Desk Snack Pack</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                7 individually portioned desk snacks for Monday to Sunday. Never wonder what to order again.
              </p>
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-400">₹699</span>
                <span className="text-xs text-stone-400 line-through">₹849</span>
                <span className="text-xs font-bold text-emerald-400">Free Delhi Shipping</span>
              </div>
            </div>
            <div className="pt-6 relative z-10">
              <button
                onClick={() => onNavigate('shop', { category: 'office-snack-boxes' })}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Order 7-Day Pack</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Box 3: Monthly Auto-Fuel Crate */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 hover:border-brand-500 transition-all shadow-xs hover:shadow-xl flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                📦
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Monthly Supply
              </span>
              <h4 className="text-xl font-black text-stone-900">Monthly Protein Desk Box</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                30 curated desk-friendly protein snack portions. Recurring monthly peace of mind without reordering.
              </p>
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-stone-900">₹1,499</span>
                <span className="text-xs text-stone-400 line-through">₹1,899</span>
                <span className="text-xs font-bold text-emerald-600">Save ₹400</span>
              </div>
            </div>
            <div className="pt-6">
              <button
                onClick={() => onNavigate('shop', { category: 'office-snack-boxes' })}
                className="w-full py-3 bg-stone-900 hover:bg-brand-500 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>Explore Monthly Crate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3. WHAT DO YOU NEED TODAY? (Interactive Discovery) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xs font-black text-brand-600 uppercase tracking-widest">Personalized Discovery</h2>
          <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">What do you need today?</h3>
          <p className="text-sm text-stone-500 mt-2">
            Click your routine situation to discover curated Indian protein solutions.
          </p>
        </div>

        {/* Needs Tab Buttons */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 no-scrollbar justify-start md:justify-center">
          {needsList.map((need) => {
            const Icon = need.icon;
            const isSelected = selectedNeed === need.id;
            return (
              <button
                key={need.id}
                onClick={() => setSelectedNeed(need.id)}
                className={`shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all border ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-md scale-102'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-brand-300 hover:bg-stone-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-400' : 'text-brand-600'}`} />
                <span>{need.label}</span>
              </button>
            );
          })}
        </div>

        {/* Need Products Grid */}
        <div className="mt-8">
          {isNeedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {needProducts.slice(0, 3).map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. THE DELPHI WORKDAY PROBLEM VS OFFICEFUEL SOLUTION */}
      <section className="bg-stone-100 py-16 sm:py-20 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-black text-brand-600 uppercase tracking-widest">Why We Exist</h2>
            <h3 className="text-2xl sm:text-4xl font-black text-stone-900 mt-1">
              Ditch the 4 PM Junk Food Trap
            </h3>
            <p className="text-sm text-stone-600 mt-2">
              Delhi office professionals spend 9–12 hours at work with irregular meals and oily canteen snacks. Here is how OfficeFuel changes that.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* The Usual Junk */}
            <div className="bg-white p-8 rounded-3xl border border-rose-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-rose-600 font-black text-lg">
                <span>❌ The Usual 4 PM Routine</span>
              </div>
              <ul className="space-y-3.5 text-sm text-stone-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-black">•</span>
                  <span>Oily samosas, deep-fried namkeens and chips cooked in cheap palm oil</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-black">•</span>
                  <span>Sugary biscuits causing severe 5 PM post-snack brain fog and lethargy</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-black">•</span>
                  <span>Greasy fingers that stain office keyboards, mice, and paperwork</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-black">•</span>
                  <span>Zero verifiable protein, high refined sodium, trans fats, and zero satiety</span>
                </li>
              </ul>
            </div>

            {/* OfficeFuel Smart Snacking */}
            <div className="bg-gradient-to-br from-brand-50 to-emerald-50/60 p-8 rounded-3xl border border-brand-300 shadow-md space-y-4">
              <div className="flex items-center gap-2 text-brand-800 font-black text-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>The OfficeFuel Platform Way</span>
              </div>
              <ul className="space-y-3.5 text-sm text-stone-800 font-semibold">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>100% slow-roasted Indian pulses, popped fox nuts, and whole seed blends</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>Up to 24g natural protein per 100g providing sustained workday energy</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>Keyboard-friendly: Crisp, clean, dry-roasted authentic Indian seasonings</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>Curated from compliant FSSAI certified Indian makers — zero cooking needed</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 5. ALL FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-xs font-black text-brand-600 uppercase tracking-widest">Delhi NCR Catalog</h2>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">Featured High-Protein Snacks</h3>
          </div>

          <button
            onClick={() => onNavigate('shop')}
            className="px-5 py-2.5 bg-stone-100 hover:bg-brand-50 hover:text-brand-700 text-stone-800 rounded-xl text-xs sm:text-sm font-black transition-colors flex items-center gap-1.5"
          >
            <span>View All ({featuredProducts.length} Snacks)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </section>

      {/* 6. CORPORATE B2B SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-brand-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-stone-800">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2 text-brand-400 font-extrabold text-xs uppercase tracking-widest">
              <Building2 className="w-4 h-4" /> B2B Corporate & Co-Working Supplies
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">
              Fueling Teams Across Gurgaon, Noida & Delhi
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Upgrade your company pantry, client meeting bays, and employee wellness perks with smart Indian snack boxes. ₹399/employee snack crates, bulk monthly supplies, and GST invoices available.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => onNavigate('corporate')}
              className="px-8 py-4 bg-white hover:bg-stone-100 text-stone-900 font-black text-sm rounded-2xl shadow-xl transition-all hover:scale-102 flex items-center gap-2"
            >
              <span>Request Corporate Quote</span>
              <ArrowRight className="w-4 h-4 text-brand-600" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
