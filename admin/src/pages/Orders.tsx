import React, { useEffect, useState } from 'react';
import { Package, Search, Filter, Eye, Truck, CheckCircle2, Clock, Printer, X } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { AdminOrder } from '../types';

interface OrdersProps {
  initialStatus?: string;
  initialOrderId?: number;
}

export const Orders: React.FC<OrdersProps> = ({ initialStatus, initialOrderId }) => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus || '');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selected Order Modal
  const [activeOrder, setActiveOrder] = useState<AdminOrder | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [deliveryProvider, setDeliveryProvider] = useState<string>('Shiprocket');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (selectedStatus) params.status = selectedStatus;
      if (search.trim()) params.search = search.trim();

      const res = await adminApi.getOrders(params);
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, search]);

  useEffect(() => {
    if (initialOrderId) {
      openOrderDetail(initialOrderId);
    }
  }, [initialOrderId]);

  const openOrderDetail = async (id: number) => {
    setModalLoading(true);
    try {
      const res = await adminApi.getOrder(id);
      if (res.success && res.data) {
        setActiveOrder(res.data);
        setNewStatus(res.data.order_status);
        setTrackingNumber(res.data.tracking_number || '');
        setDeliveryProvider(res.data.delivery_provider || 'Shiprocket');
      }
    } catch (e) {
      console.error('Failed to load order details:', e);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!activeOrder || !newStatus) return;
    try {
      await adminApi.updateOrderStatus(activeOrder.id, newStatus, `Status updated to ${newStatus} from Admin`);
      openOrderDetail(activeOrder.id);
      fetchOrders();
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleUpdateTracking = async () => {
    if (!activeOrder || !trackingNumber.trim()) return;
    try {
      await adminApi.updateOrderTracking(activeOrder.id, trackingNumber.trim(), deliveryProvider);
      openOrderDetail(activeOrder.id);
      fetchOrders();
    } catch (e) {
      console.error('Failed to update tracking:', e);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Orders Management</h1>
          <p className="text-xs text-stone-500">Track and manage customer snack orders across Delhi NCR.</p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search #OF-2026, name, email..."
              className="pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white font-medium"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Payment</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="out_for_delivery">Out For Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500">
              <tr>
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items / Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-stone-900">
                      #{order.order_number}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-stone-900">{order.customer_name}</div>
                      <div className="text-[10px] text-stone-500">{order.customer_phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-stone-900">₹{order.total_amount}</div>
                      <div className="text-[10px] text-stone-500">
                        {order.items ? `${order.items.length} items` : ''}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.order_status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.order_status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-brand-50 text-brand-700 border border-brand-200'
                      }`}>
                        {order.order_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-[10px] text-stone-500">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openOrderDetail(order.id)}
                        className="p-1.5 bg-stone-100 hover:bg-brand-50 hover:text-brand-600 rounded-lg text-stone-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400">Order Inspection</span>
                <h3 className="font-black text-xl text-stone-900 font-mono">#{activeOrder.order_number}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={printInvoice}
                  className="p-2 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-xl"
                  title="Print Invoice"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveOrder(null)}
                  className="p-2 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Status Update & Tracking Actions */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="w-full sm:w-auto">
                  <label className="font-bold text-stone-700 block mb-1">Update Order Status:</label>
                  <div className="flex gap-2">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-semibold"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready for Dispatch</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={handleUpdateStatus}
                      className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl"
                    >
                      Update
                    </button>
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  <label className="font-bold text-stone-700 block mb-1">Shipment Tracking ID:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. SR-123456"
                      className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-mono text-xs w-36"
                    />
                    <button
                      onClick={handleUpdateTracking}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Summary */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider">Ordered Items</h4>
              <div className="divide-y divide-stone-100 text-xs border border-stone-100 rounded-2xl p-3 bg-stone-50">
                {activeOrder.items?.map((item) => (
                  <div key={item.id} className="py-2 flex justify-between">
                    <div>
                      <span className="font-bold text-stone-900">{item.product_name}</span>
                      <span className="text-[10px] text-stone-500 block">SKU: {item.product_sku} • Qty: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-stone-900">₹{item.total_price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financials & Address */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-stone-50 rounded-2xl space-y-1">
                <span className="font-bold text-stone-700 block">Customer & Address</span>
                <p className="font-semibold text-stone-900">{activeOrder.customer_name}</p>
                <p className="text-stone-500">{activeOrder.customer_phone}</p>
                <p className="text-stone-500">{activeOrder.shipping_address?.address_line1}, {activeOrder.shipping_address?.city} ({activeOrder.shipping_address?.pincode})</p>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl space-y-1 text-right">
                <span className="font-bold text-stone-700 block">Total Breakdown</span>
                <p className="text-stone-500">Subtotal: ₹{activeOrder.subtotal}</p>
                <p className="text-emerald-600">Discount: -₹{activeOrder.discount_amount}</p>
                <p className="text-stone-500">Shipping: ₹{activeOrder.shipping_charge}</p>
                <p className="font-black text-stone-900 text-sm">Grand Total: ₹{activeOrder.total_amount}</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
