import React, { useEffect, useState } from 'react';
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, MapPin, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';

interface OrderDetailsProps {
  orderNumber: string;
  onNavigate: (page: string, params?: any) => void;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderNumber, onNavigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (orderNumber) {
      api.getOrderDetails(orderNumber).then((res) => {
        if (res.success && res.data) {
          setOrder(res.data);
        }
        setIsLoading(false);
      });
    }
  }, [orderNumber]);

  if (isLoading || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-xs text-stone-500 mt-3 font-semibold">Loading order details...</p>
      </div>
    );
  }

  const addr = order.shipping_address as any;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Navigation */}
      <button
        onClick={() => onNavigate('orders')}
        className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Orders
      </button>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-stone-900 font-mono">#{order.order_number}</h1>
            <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold uppercase ${
              order.order_status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {order.order_status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Placed on {new Date(order.created_at).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-stone-400 block font-semibold">Total Paid</span>
          <span className="text-2xl font-black text-brand-600">₹{order.total_amount}</span>
        </div>
      </div>

      {/* Delivery Tracking Milestones */}
      {order.tracking && (
        <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-400" />
              <h3 className="font-bold text-base">Shipment & Delivery Status</h3>
            </div>
            <span className="text-xs text-stone-400 font-mono">
              Provider: {order.delivery_provider} • Tracking: {order.tracking.tracking_number}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {order.tracking.steps.map((step, idx) => (
              <div key={idx} className="relative flex sm:flex-col items-center sm:text-center gap-3 sm:gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  step.completed ? 'bg-brand-500 text-white' : 'bg-stone-800 text-stone-500'
                }`}>
                  {step.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <div>
                  <h5 className="font-bold text-xs">{step.status}</h5>
                  {step.date && <p className="text-[10px] text-stone-400">{step.date}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Breakdown & Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Items List */}
        <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
          <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-600" /> Items in this Order
          </h3>

          <div className="divide-y divide-stone-100 text-xs">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-stone-900">{item.product_name}</h4>
                  <span className="text-stone-500 font-mono text-[11px]">SKU: {item.product_sku} • Qty: {item.quantity}</span>
                </div>
                <span className="font-bold text-stone-900 text-sm">₹{item.total_price}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-900">₹{order.subtotal}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount ({order.coupon_code})</span>
                <span>-₹{order.discount_amount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span>₹{order.shipping_charge}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (Included GST)</span>
              <span>₹{order.tax_amount}</span>
            </div>
            <div className="pt-2 border-t border-stone-100 flex justify-between text-base font-black text-stone-900">
              <span>Grand Total</span>
              <span className="text-brand-600">₹{order.total_amount}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
          <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" /> Delivery Address
          </h3>

          <div className="text-xs text-stone-700 space-y-1 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-100 font-medium">
            <p className="font-bold text-stone-900 text-sm">{order.customer_name}</p>
            <p>{addr?.address_line1}</p>
            {addr?.address_line2 && <p>{addr?.address_line2}</p>}
            <p>{addr?.city}, {addr?.state} - <strong className="font-mono">{addr?.pincode}</strong></p>
            <p className="pt-2 text-stone-500 font-mono">Phone: {order.customer_phone}</p>
            <p className="text-stone-500">Email: {order.customer_email}</p>
          </div>
        </div>

      </div>

    </div>
  );
};
