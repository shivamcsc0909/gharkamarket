import React, { useEffect, useState } from 'react';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, Lock, Tag, AlertCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { calculation, rawItems, clearCart, couponCode, pincode, setPincode } = useCart();
  const { showToast } = useNotification();

  // Form State
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Gurugram');
  const [state, setState] = useState('Haryana');
  const [zipcode, setZipcode] = useState(pincode || '122002');
  const [notes, setNotes] = useState('');

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setCustomerName(user.name);
      setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);

      // Fetch saved addresses
      api.getAddresses().then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setSavedAddresses(res.data);
          const defaultAddr = res.data.find((a: any) => a.is_default) || res.data[0];
          applyAddress(defaultAddr);
        }
      });
    }
  }, [user]);

  const applyAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setCustomerName(addr.name || customerName);
    setCustomerPhone(addr.phone || customerPhone);
    setAddressLine1(addr.address_line1);
    setAddressLine2(addr.address_line2 || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city);
    setState(addr.state);
    setZipcode(addr.pincode);
    setPincode(addr.pincode);
  };

  if (!calculation || calculation.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto" />
        <h2 className="text-2xl font-black text-stone-900">Your snack cart is empty</h2>
        <p className="text-stone-500 text-sm">Please add some smart snacks to your cart before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-3 bg-brand-500 text-white font-bold text-xs rounded-xl hover:bg-brand-600"
        >
          Explore Snacks
        </button>
      </div>
    );
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !addressLine1.trim() || !zipcode.trim()) {
      showToast('Please fill all required contact & address fields.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const shippingAddress = {
        name: customerName,
        phone: customerPhone,
        address_line1: addressLine1,
        address_line2: addressLine2,
        landmark: landmark,
        city: city,
        state: state,
        pincode: zipcode,
        address_type: 'home'
      };

      // 1. Create Order on Backend
      const orderRes = await api.createOrder({
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim(),
        shipping_address: shippingAddress,
        items: rawItems,
        coupon_code: couponCode || undefined,
        notes: notes || undefined
      });

      if (!orderRes.success || !orderRes.data) {
        showToast(orderRes.message || 'Failed to initiate order', 'error');
        setIsSubmitting(false);
        return;
      }

      const orderData = orderRes.data.order;
      const paymentData = orderRes.data.payment;

      // 2. Launch Razorpay Checkout Modal
      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        name: 'OfficeFuel (Ghar Ka Market)',
        description: `Order #${orderData.order_number}`,
        image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=128&auto=format&fit=crop&q=80',
        order_id: paymentData.is_simulated ? undefined : paymentData.id,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        theme: {
          color: '#ea580c'
        },
        handler: async function (response: any) {
          try {
            // Verify payment on backend with signature
            const verifyRes = await api.verifyPayment({
              order_id: orderData.id,
              razorpay_order_id: response.razorpay_order_id || paymentData.id,
              razorpay_payment_id: response.razorpay_payment_id || 'pay_client_sim_' + Math.random().toString(36).substring(2, 9),
              razorpay_signature: response.razorpay_signature || 'sig_valid'
            });

            if (verifyRes.success) {
              clearCart();
              showToast('Payment successful! Order confirmed.', 'success');
              onNavigate('order-success', { orderNumber: orderData.order_number });
            } else {
              showToast('Payment verification failed on server.', 'error');
            }
          } catch (e: any) {
            showToast(e.message || 'Payment verification failed', 'error');
          }
        },
        modal: {
          ondismiss: function () {
            showToast('Payment was not completed. You can retry anytime.', 'info');
            setIsSubmitting(false);
          }
        }
      };

      if (paymentData.is_simulated || typeof window.Razorpay === 'undefined') {
        // Simulated local fallback mode if offline/test
        setTimeout(async () => {
          await api.verifyPayment({
            order_id: orderData.id,
            razorpay_order_id: paymentData.id,
            razorpay_payment_id: 'pay_simulated_' + Math.random().toString(36).substring(2, 9),
            razorpay_signature: 'sig_valid'
          });
          clearCart();
          showToast('Payment simulated and order confirmed!', 'success');
          onNavigate('order-success', { orderNumber: orderData.order_number });
        }, 1000);
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
        setIsSubmitting(false);
      }
    } catch (e: any) {
      showToast(e.message || 'Checkout failed. Please check details and retry.', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Checkout Header */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => onNavigate('shop')}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-Bit SSL Encrypted Checkout</span>
        </div>
      </div>

      <form onSubmit={handlePay} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Form Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Contact Info */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Mobile Number (For Delivery SMS) *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">Email Address (For Invoice) *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. rahul@company.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Delhi NCR Delivery Address</span>
            </h3>

            {savedAddresses.length > 0 && (
              <div className="space-y-2 pb-3 border-b border-stone-100">
                <label className="text-xs font-bold text-stone-700">Choose from Saved Addresses:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => applyAddress(addr)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-brand-500 bg-brand-50/50 font-semibold'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="font-bold">{addr.name} ({addr.address_type})</div>
                      <div className="text-stone-500 truncate">{addr.address_line1}, {addr.city}</div>
                      <div className="text-stone-500 font-mono">PIN: {addr.pincode}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Office / House / Flat & Street Address *</label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="e.g. 4th Floor, Tower B, Cyber Greens, DLF Phase 3"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={zipcode}
                    onChange={(e) => {
                      setZipcode(e.target.value);
                      setPincode(e.target.value);
                    }}
                    placeholder="e.g. 122002"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Delivery Instructions / Gate Landmark</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Leave at reception or call on arrival"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>
            </div>
          </div>

          {/* 3. Secure Payment Note */}
          <div className="bg-stone-900 text-stone-200 p-6 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Lock className="w-4 h-4 text-brand-400" />
              <span>Secure Razorpay Gateway</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              When you click "Pay & Place Order", Razorpay's secure modal will open to complete payment via UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, or Corporate Wallets.
            </p>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6 sticky top-28">
          <h3 className="font-black text-lg text-stone-900 pb-3 border-b border-stone-100">
            Order Summary ({calculation.item_count} items)
          </h3>

          {/* Items List */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {calculation.items.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-stone-100" />
                  <div>
                    <h5 className="font-bold text-stone-900 truncate max-w-[180px]">{item.name}</h5>
                    <p className="text-stone-400 text-[10px]">Qty: {item.quantity} • {item.weight}</p>
                  </div>
                </div>
                <span className="font-bold text-stone-900">₹{item.total_price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="font-semibold text-stone-900">₹{calculation.subtotal.toFixed(2)}</span>
            </div>

            {calculation.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Coupon ({couponCode})</span>
                <span>-₹{calculation.discount_amount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delhi NCR Delivery Fee</span>
              <span>
                {calculation.shipping_charge === 0 ? (
                  <strong className="text-emerald-600 uppercase font-bold">FREE</strong>
                ) : (
                  `₹${calculation.shipping_charge.toFixed(2)}`
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span>GST (Included 5%)</span>
              <span>₹{calculation.tax_amount.toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-between text-lg font-black text-stone-900">
              <span>Total Payable</span>
              <span className="text-brand-600">₹{calculation.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>{isSubmitting ? 'Processing Order...' : `Pay ₹${calculation.total_amount.toFixed(2)} with Razorpay`}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
