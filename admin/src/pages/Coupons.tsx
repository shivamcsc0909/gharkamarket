import React, { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, X } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { AdminCoupon } from '../types';

export const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<number>(199);
  const [maxDiscount, setMaxDiscount] = useState<number>(50);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getCoupons();
      if (res.success && res.data) setCoupons(res.data);
    } catch (e) {
      console.error('Failed to load coupons:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createCoupon({
        code: code.toUpperCase().trim(),
        discount_type: discountType,
        discount_value: discountValue,
        min_order_amount: minOrder,
        max_discount_amount: discountType === 'percentage' ? maxDiscount : null,
        usage_limit: 1000,
        per_user_limit: 1
      });
      setIsModalOpen(false);
      fetchCoupons();
    } catch (e) {
      console.error('Failed to create coupon:', e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this coupon code?')) return;
    try {
      await adminApi.deleteCoupon(id);
      fetchCoupons();
    } catch (e) {
      console.error('Failed to delete coupon:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Coupons & Discount Codes</h1>
          <p className="text-xs text-stone-500">Create promotional vouchers and percentage discounts.</p>
        </div>

        <button
          onClick={() => {
            setCode('');
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500">
            <tr>
              <th className="p-4">Code</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Min Order</th>
              <th className="p-4">Cap</th>
              <th className="p-4">Times Used</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-medium">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                <td className="p-4 font-mono font-black text-stone-900 text-sm">
                  {c.code}
                </td>
                <td className="p-4 font-bold text-brand-600">
                  {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`}
                </td>
                <td className="p-4">₹{c.min_order_amount}</td>
                <td className="p-4">{c.max_discount_amount ? `₹${c.max_discount_amount}` : 'No cap'}</td>
                <td className="p-4">{c.used_count || 0} times</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 bg-stone-100 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-stone-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">Create New Coupon</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-stone-400" /></button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MONSOON20"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button type="submit" className="flex-1 py-2.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600">Create</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-stone-200 text-stone-700 font-bold rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
