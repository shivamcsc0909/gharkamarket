import React, { useEffect, useState } from 'react';
import { Package, ArrowRight, Truck, Calendar, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order } from '../types';

interface OrdersProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Orders: React.FC<OrdersProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      onNavigate('login');
      return;
    }

    api.getMyOrders().then((res) => {
      if (res.success && res.data) {
        setOrders(res.data);
      }
      setIsLoading(false);
    });
  }, [user]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-4">
        <div className="h-8 bg-stone-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-32 bg-stone-200 rounded-2xl animate-pulse"></div>
        <div className="h-32 bg-stone-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">My Snack Orders</h1>
        <p className="text-sm text-stone-500 mt-1">Track your past deliveries and reorder your favorites.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
          <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto" />
          <h3 className="font-bold text-lg text-stone-900">No orders placed yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Order your first high-protein Indian snacks or 7-day office box today!
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="px-6 py-3 bg-brand-500 text-white font-bold text-xs rounded-xl hover:bg-brand-600"
          >
            Explore Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-2xs hover:border-brand-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2 font-mono text-sm font-bold text-stone-900">
                    <Package className="w-4 h-4 text-brand-600" />
                    <span>#{order.order_number}</span>
                  </div>
                  <span className="text-xs text-stone-600 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-500" /> {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.order_status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.order_status === 'cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.order_status.replace(/_/g, ' ')}
                  </span>
                  <span className="font-black text-lg text-stone-900">₹{order.total_amount}</span>
                </div>
              </div>

              {/* Items preview */}
              <div className="flex flex-wrap gap-2 text-xs text-stone-600">
                {order.items?.map((item, idx) => (
                  <span key={idx} className="bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
                    {item.product_name} (x{item.quantity})
                  </span>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onNavigate('order-details', { orderNumber: order.order_number })}
                  className="flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>Track & Order Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
