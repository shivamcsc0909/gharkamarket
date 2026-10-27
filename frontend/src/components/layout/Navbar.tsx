import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, User as UserIcon, Search, Menu, X, Sparkles, Building2, ChevronDown, LogOut, Package, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface NavbarProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, logout } = useAuth();
  const { calculation, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('shop', { search: searchQuery.trim() });
      setIsSearchFocused(false);
    }
  };

  const handleQuickSuggestion = (term: string) => {
    setSearchQuery(term);
    onNavigate('shop', { search: term });
    setIsSearchFocused(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Shop All', page: 'shop' },
    { name: 'Snack Boxes', page: 'shop', params: { category: 'office-snack-boxes' } },
    { name: 'Desi Protein', page: 'shop', params: { category: 'desi-protein-snacks' } },
    { name: 'Breakfast Mixes', page: 'shop', params: { category: 'breakfast-mixes' } },
    { name: 'Corporate & HR', page: 'corporate', icon: Building2 },
    { name: 'About', page: 'about' },
  ];

  const quickSearchSuggestions = [
    'Office Snack Box',
    '7-Day Desk Pack',
    'Roasted Chana',
    'Makhana Pudina',
    'Moong Chilla Mix',
    'Protein Coffee',
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 sm:gap-6">
          
          {/* Left: Mobile Menu Trigger + Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-stone-700 hover:text-stone-900 rounded-lg hover:bg-stone-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-stone-800" />}
            </button>

            {/* Brand Logo */}
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group text-stone-900"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                OF
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-extrabold text-xl tracking-tight text-stone-900">Office<span className="text-brand-600">Fuel</span></span>
                  <span className="bg-brand-50 text-brand-700 font-bold text-[10px] uppercase px-1.5 py-0.5 rounded-full border border-brand-200/60 hidden sm:flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-brand-500" /> Delhi NCR
                  </span>
                </div>
                <span className="text-[10px] text-stone-600 font-semibold tracking-wider uppercase block mt-0.5">Ghar Ka Market</span>
              </div>
            </button>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.page && (!link.params || JSON.stringify(link.params) === JSON.stringify({}));
              return (
                <button
                  key={link.name}
                  onClick={() => onNavigate(link.page, link.params)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'text-brand-600 bg-brand-50/80 font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-brand-600" />}
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* Center-Right: Search Bar with Icon & Live Suggestions */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-xs md:max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search snacks, 7-day box, chana, makhana..."
                className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:bg-white focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-xs sm:text-sm transition-all"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-14 top-2.5 text-stone-400 hover:text-stone-600 text-xs px-1"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
              >
                <span>Find</span>
              </button>
            </form>

            {/* Quick Search Suggestions Dropdown */}
            {isSearchFocused && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200/80 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 px-1">Popular Quick Searches</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickSearchSuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleQuickSuggestion(item)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-brand-50 hover:text-brand-700 text-stone-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <Search className="w-3 h-3 text-stone-400" />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: User Auth & Cart */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Customer User Profile / Login */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors border border-transparent hover:border-stone-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-xs text-stone-400 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-stone-800 truncate">{user.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('account');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4 text-stone-500" /> My Profile & Addresses
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('orders');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <Package className="w-4 h-4 text-stone-500" /> My Orders
                      </button>

                      <div className="border-t border-stone-100 my-1"></div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-stone-500" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 bg-stone-900 text-white hover:bg-brand-600 px-3.5 py-2.5 rounded-xl transition-all shadow-sm group"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-4 h-4 text-brand-400 group-hover:text-white transition-colors" />
              <span className="text-xs font-bold hidden sm:inline">Cart</span>
              {(calculation?.item_count || 0) > 0 && (
                <span className="bg-brand-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center -ml-0.5 animate-pulse">
                  {calculation?.item_count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Always visible below header on small screens) */}
        <div className="md:hidden py-2.5 border-t border-stone-100">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search protein snacks, makhana, 7-day pack..."
              className="w-full pl-9 pr-18 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:bg-white focus:outline-hidden focus:border-brand-500 text-xs"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-2.5 bg-brand-500 text-white text-xs font-bold rounded-lg"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate(link.page, link.params);
              }}
              className="w-full text-left px-4 py-3 rounded-xl text-base font-semibold text-stone-800 hover:bg-stone-50 hover:text-brand-600 flex items-center justify-between"
            >
              <span>{link.name}</span>
              <span className="text-stone-400">→</span>
            </button>
          ))}
          {!user && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('login');
              }}
              className="w-full text-center mt-2 py-3 rounded-xl bg-brand-50 text-brand-700 font-bold text-sm border border-brand-200"
            >
              Customer Sign In / Register
            </button>
          )}
        </div>
      )}
    </header>
  );
};
