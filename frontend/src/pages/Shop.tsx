import React, { useEffect, useState } from 'react';
import { Search, Filter, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { api } from '../services/api';
import { Category, Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';

interface ShopProps {
  onNavigate: (page: string, params?: any) => void;
  initialParams?: { category?: string; search?: string; tag?: string };
}

export const Shop: React.FC<ShopProps> = ({ onNavigate, initialParams = {} }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialParams.category || '');
  const [searchQuery, setSearchQuery] = useState<string>(initialParams.search || '');
  const [selectedSort, setSelectedSort] = useState<string>('default');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    if (initialParams.category) setSelectedCategory(initialParams.category);
    if (initialParams.search) setSearchQuery(initialParams.search);
  }, [initialParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (e) {
        console.error('Failed to fetch categories:', e);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, any> = {
          limit: 30,
          sort: selectedSort,
        };
        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery.trim()) params.q = searchQuery.trim();

        const res = await api.getProducts(params);
        if (res.success && res.data) {
          setProducts(res.data);
        }
      } catch (e) {
        console.error('Failed to fetch products:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, searchQuery, selectedSort]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSelectedSort('default');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-stone-200">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Smart Snack Menu</h1>
          <p className="text-sm text-stone-500 mt-1">
            High-protein, clean roasted Indian snacks portioned for workdays in Delhi NCR.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search snacks..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:border-brand-500"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>

          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-stone-300 bg-white font-medium text-stone-700 focus:outline-hidden focus:border-brand-500"
            >
              <option value="default">Featured</option>
              <option value="best_seller">Bestsellers</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>

          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden p-2 rounded-xl border border-stone-300 bg-white text-stone-700"
            aria-label="Open filter drawer"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-stone-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-600" /> Categories
              </h3>
              {(selectedCategory || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-brand-600 hover:underline font-bold"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                  selectedCategory === ''
                    ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span>All Categories</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedCategory === cat.slug
                      ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.products_count !== undefined && (
                    <span className="text-[10px] text-stone-400 font-normal">({cat.products_count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Value Prop Card */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-6 rounded-3xl space-y-3">
            <h4 className="font-bold text-sm text-brand-400">Delhi NCR Express</h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Dispatched directly from our central Gurugram hub. Free shipping on all orders above ₹499.
            </p>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
              <h3 className="font-bold text-lg text-stone-900">No snacks found</h3>
              <p className="text-sm text-stone-500 max-w-sm mx-auto">
                We could not find any products matching your selected filters or search query.
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-brand-500 text-white font-bold text-xs rounded-xl hover:bg-brand-600 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
          <div className="absolute inset-0 bg-stone-900/60" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white p-6 space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                  <h3 className="font-bold text-base text-stone-900">Filter By Category</h3>
                  <button onClick={() => setIsMobileFilterOpen(false)}>
                    <X className="w-5 h-5 text-stone-400" />
                  </button>
                </div>

                <div className="space-y-2 pt-4">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                      selectedCategory === '' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-stone-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setIsMobileFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                        selectedCategory === cat.slug ? 'bg-brand-50 text-brand-700 font-bold' : 'text-stone-700'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-stone-900 text-white font-bold text-xs rounded-xl"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
