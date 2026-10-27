import React, { useEffect, useState } from 'react';
import { IndianRupee, Package, Users, AlertTriangle, Building2, Mail, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { DashboardMetrics } from '../types';
import { StatCard } from '../components/StatCard';

interface DashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getStats();
        if (res.success && res.data) {
          setMetrics(res.data.metrics);
          setLowStock(res.data.low_stock_products || []);
          setRecentOrders(res.data.recent_orders || []);
        }
      } catch (e) {
        console.error('Failed to fetch dashboard stats:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-stone-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-stone-200 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Operations Dashboard</h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Real-time metrics, revenue statistics, and order fulfilment queue.
        </p>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${metrics.total_revenue.toLocaleString('en-IN')}`}
          subtitle={`₹${metrics.today_revenue.toLocaleString('en-IN')} earned today`}
          icon={IndianRupee}
          color="emerald"
        />

        <StatCard
          title="Total Orders"
          value={metrics.total_orders}
          subtitle={`${metrics.today_orders} orders received today`}
          icon={Package}
          color="brand"
        />

        <StatCard
          title="Active Customers"
          value={metrics.active_users}
          subtitle={`${metrics.total_users} total registered`}
          icon={Users}
          color="sky"
        />

        <StatCard
          title="Low Stock Alerts"
          value={metrics.low_stock_count}
          subtitle="Items requiring replenishment"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Order Status Breakdown Grid */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-sm text-stone-900 uppercase tracking-wider">
          Order Fulfilment Pipeline
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(metrics.status_breakdown).map(([status, count]) => (
            <button
              key={status}
              onClick={() => onNavigate('orders', { status })}
              className="p-3.5 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-200 text-left transition-colors"
            >
              <div className="text-[10px] font-bold text-stone-500 uppercase">{status.replace(/_/g, ' ')}</div>
              <div className="text-xl font-black text-stone-900 mt-0.5">{count}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Dual Column: Low Stock Items & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Recent Orders */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-stone-900 uppercase tracking-wider">
              Recent Orders
            </h3>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              View All Orders →
            </button>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {recentOrders.length === 0 ? (
              <p className="py-6 text-center text-stone-400">No orders received yet.</p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => onNavigate('orders', { orderId: order.id })}
                  className="py-3 flex items-center justify-between hover:bg-stone-50 px-2 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="font-mono font-bold text-stone-900">#{order.order_number}</div>
                    <div className="text-stone-500 text-[11px]">{order.customer_name} • {order.customer_email}</div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-stone-900">₹{order.total_amount}</div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                      {order.order_status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Low Stock Alerts & Quick Leads */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Low Stock Box */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" /> Low Stock Products
              </h3>
              <button
                onClick={() => onNavigate('inventory', { filter: 'low_stock' })}
                className="text-xs font-bold text-brand-600 hover:underline"
              >
                Manage Stock
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {lowStock.length === 0 ? (
                <p className="text-stone-400 text-center py-4">All inventory levels are healthy.</p>
              ) : (
                lowStock.map((prod) => (
                  <div key={prod.id} className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-stone-900 truncate max-w-[160px]">{prod.name}</h5>
                      <span className="text-[10px] text-stone-500 font-mono">SKU: {prod.sku}</span>
                    </div>
                    <span className="font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                      {prod.stock_quantity} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Leads Banner */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-6 rounded-3xl space-y-3">
            <h4 className="font-bold text-sm text-brand-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> B2B Leads & Inquiries
            </h4>
            <p className="text-xs text-stone-300">
              You have <strong>{metrics.new_corporate_leads}</strong> new corporate leads and <strong>{metrics.new_contact_requests}</strong> contact messages awaiting response.
            </p>
            <button
              onClick={() => onNavigate('corporate')}
              className="mt-2 text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <span>Review Corporate Leads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
