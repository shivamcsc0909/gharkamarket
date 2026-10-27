import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, Truck, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartDrawerProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const { isCartOpen, closeCart, calculation, updateQuantity, removeItem, couponCode, applyCoupon, removeCoupon, isLoading } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponSubmitting, setCouponSubmitting] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponSubmitting(true);
    await applyCoupon(couponInput.trim());
    setCouponSubmitting(false);
    setCouponInput('');
  };

  const handleProceedToCheckout = () => {
    closeCart();
    onNavigate('checkout');
  };

  const freeShippingNeeded = calculation?.amount_needed_for_free_shipping || 0;
  const freeShippingThreshold = calculation?.free_shipping_threshold || 499;
  const currentSubtotal = calculation?.subtotal || 0;
  const progressPercent = Math.min(100, Math.round((currentSubtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              <h2 className="font-bold text-lg text-stone-900">Your Smart Snack Box</h2>
              <span className="bg-brand-100 text-brand-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {calculation?.item_count || 0} items
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Alert */}
          <div className="px-6 py-3 bg-brand-50/70 border-b border-brand-100 text-xs">
            <div className="flex items-center justify-between font-semibold text-stone-800 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-600" />
                {freeShippingNeeded > 0
                  ? `Add ₹${freeShippingNeeded.toFixed(0)} more for FREE Delhi NCR Delivery`
                  : '🎉 You have unlocked FREE Express Delivery!'}
              </span>
              <span className="text-brand-700 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-brand-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!calculation || calculation.items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-stone-800 text-base">Your cart is empty</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Fuel your workday with protein-rich roasted makhana, chana, and weekly snack boxes.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    onNavigate('shop');
                  }}
                  className="mt-6 inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-sm transition-colors"
                >
                  <span>Explore Smart Snacks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              calculation.items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-200/80 items-center justify-between"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-white shrink-0"
                  />

                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-bold text-xs text-stone-900 truncate">{item.name}</h4>
                    <p className="text-[10px] text-stone-500">{item.weight} {item.protein ? `• ${item.protein}` : ''}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-bold text-sm text-stone-900">₹{item.unit_price}</span>
                      {item.mrp > item.unit_price && (
                        <span className="text-[10px] text-stone-400 line-through">₹{item.mrp}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center border border-stone-300 rounded-lg bg-white">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="p-1 text-stone-600 hover:text-stone-900"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-2 text-stone-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="p-1 text-stone-600 hover:text-stone-900"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer / Bill Summary */}
          {calculation && calculation.items.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50 space-y-4">
              
              {/* Coupon Input or Applied Banner */}
              {couponCode ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Coupon {couponCode} Applied</span>
                    <span className="text-emerald-700 font-normal">(-₹{calculation.discount_amount})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter coupon (e.g. FUELFIRST)"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-white font-mono uppercase"
                    />
                    <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  </div>
                  <button
                    type="submit"
                    disabled={couponSubmitting || !couponInput.trim()}
                    className="px-3 py-2 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800 disabled:opacity-50"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{calculation.subtotal.toFixed(2)}</span>
                </div>
                {calculation.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount</span>
                    <span>-₹{calculation.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>
                    {calculation.shipping_charge === 0 ? (
                      <strong className="text-emerald-600 uppercase font-bold">FREE</strong>
                    ) : (
                      `₹${calculation.shipping_charge.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST (Inclusive 5%)</span>
                  <span>₹{calculation.tax_amount.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-base font-extrabold text-stone-900">
                  <span>Grand Total</span>
                  <span className="text-brand-600 font-black">₹{calculation.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
