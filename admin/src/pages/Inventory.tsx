import React, { useEffect, useState } from 'react';
import { Archive, AlertTriangle, Search, History, Edit3, X } from 'lucide-react';
import { adminApi } from '../services/adminApi';

interface InventoryProps {
  initialFilter?: string;
}

export const Inventory: React.FC<InventoryProps> = ({ initialFilter }) => {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>(initialFilter || '');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Stock Adjustment Modal
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>('Restock batch');

  // Logs Modal
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filter) params.filter = filter;
      if (search.trim()) params.search = search.trim();

      const res = await adminApi.getInventory(params);
      if (res.success && res.data) setItems(res.data);
    } catch (e) {
      console.error('Failed to load inventory:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filter, search]);

  const openAdjustModal = (item: any) => {
    setActiveItem(item);
    setNewQuantity(item.stock_quantity);
    setReason('Restock batch');
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    try {
      await adminApi.adjustStock(activeItem.product_id, newQuantity, reason);
      setActiveItem(null);
      fetchInventory();
    } catch (e) {
      console.error('Adjustment failed:', e);
    }
  };

  const openLogs = async (productId?: number) => {
    try {
      const res = await adminApi.getInventoryLogs(productId);
      if (res.success && res.data) setLogs(res.data);
      setIsLogsOpen(true);
    } catch (e) {
      console.error('Failed to load logs:', e);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Inventory & Stock Levels</h1>
          <p className="text-xs text-stone-500">Monitor product availability, low stock thresholds, and stock movements.</p>
        </div>

        <button
          onClick={() => openLogs()}
          className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center gap-1.5"
        >
          <History className="w-4 h-4" /> Stock Audit Logs
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
            filter === '' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600'
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setFilter('low_stock')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
            filter === 'low_stock' ? 'bg-rose-600 text-white' : 'bg-white border border-stone-200 text-rose-600'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Alerts
        </button>
        <button
          onClick={() => setFilter('out_of_stock')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
            filter === 'out_of_stock' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600'
          }`}
        >
          Out of Stock
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Current Stock</th>
              <th className="p-4">Threshold</th>
              <th className="p-4">Availability</th>
              <th className="p-4 text-right">Quick Adjust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-medium">
            {isLoading ? (
              <tr><td colSpan={7} className="p-8 text-center text-stone-400">Loading stock...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-stone-400">No inventory records found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-4 font-bold text-stone-900">{item.product_name}</td>
                  <td className="p-4 font-mono text-stone-500">{item.sku}</td>
                  <td className="p-4">{item.category_name}</td>
                  <td className="p-4 font-black text-base text-stone-900">
                    <span className={`${item.stock_quantity <= item.low_stock_threshold ? 'text-rose-600' : 'text-stone-900'}`}>
                      {item.stock_quantity}
                    </span>
                  </td>
                  <td className="p-4 text-stone-500">{item.low_stock_threshold} units</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.stock_quantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openAdjustModal(item)}
                      className="p-1.5 bg-stone-100 hover:bg-brand-50 hover:text-brand-600 rounded-lg"
                      title="Adjust Stock"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Adjustment Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">Adjust Product Stock</h3>
              <button onClick={() => setActiveItem(null)}><X className="w-5 h-5 text-stone-400" /></button>
            </div>

            <p className="text-xs font-semibold text-stone-700">{activeItem.product_name}</p>

            <form onSubmit={handleSaveAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">New Total Stock Units *</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Reason for Adjustment *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="Restock batch">Restock batch from manufacturing</option>
                  <option value="Physical count discrepancy">Physical count discrepancy</option>
                  <option value="Damaged units discarded">Damaged units discarded</option>
                  <option value="Sample / tasting units">Sample / Tasting units</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600">Save</button>
                <button type="button" onClick={() => setActiveItem(null)} className="px-4 py-2.5 bg-stone-200 text-stone-700 font-bold rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {isLogsOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">Stock Movement Audit Trail</h3>
              <button onClick={() => setIsLogsOpen(false)}><X className="w-5 h-5 text-stone-400" /></button>
            </div>

            <div className="divide-y divide-stone-100 text-xs">
              {logs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-stone-900">{log.product_name}</div>
                    <span className="text-[10px] text-stone-500">{log.reason} ({log.reference_id})</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold ${log.change_amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {log.change_amount > 0 ? `+${log.change_amount}` : log.change_amount}
                    </span>
                    <span className="text-[10px] text-stone-400 block">Balance: {log.new_stock_quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
