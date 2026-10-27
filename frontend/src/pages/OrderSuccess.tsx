import React, { useEffect, useState } from 'react';
import { CheckCircle2, Package, ArrowRight, Truck, Phone, Mail, FileText } from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';

interface OrderSuccessProps {
  orderNumber: string;
  onNavigate: (page: string, params?: any) => void;
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({ orderNumber, onNavigate }) => {
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8">
      
      {/* Success Badge */}
      <div className="space-y-3">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-black text-brand-600 uppercase tracking-widest">Order Confirmed</span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900">Your Smart Snacks are on their way!</h1>
        <p className="text-sm text-stone-600 max-w-md mx-auto">
          Thank you for choosing OfficeFuel. We have sent a confirmation email & SMS receipt to your registered contact.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl text-left space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <span className="text-xs text-stone-600 font-bold block">Order Number</span>
            <span className="text-xl font-black text-stone-900 font-mono">{orderNumber}</span>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-xs text-stone-600 font-bold block">Status</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
              Payment Verified (Paid)
            </span>
          </div>
        </div>

        {/* Tracking Preview */}
        {order?.tracking && (
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-800">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-600" />
                <span>Delhi NCR Express Timeline</span>
              </span>
              <span className="text-brand-700">ETA: {order.tracking.estimated_delivery}</span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2">
              {order.tracking.steps.map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-[10px] font-bold ${
                    step.completed ? 'bg-brand-500 text-white' : 'bg-stone-200 text-stone-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="text-[10px] font-semibold text-stone-600 block truncate">{step.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => onNavigate('orders')}
            className="flex-1 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" /> View My Orders
          </button>

          <button
            onClick={() => onNavigate('shop')}
            className="flex-1 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-brand-500/20"
          >
            <span>Continue Snacking</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
