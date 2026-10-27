import React, { useEffect, useState } from 'react';
import { Users as UsersIcon, ShieldAlert, Plus, Search, X } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { AdminUser } from '../types';

export const Users: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customers' | 'staff'>('customers');
  const [customers, setCustomers] = useState<any[]>([]);
  const [staff, setStaff] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add Staff Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState<'admin' | 'manager' | 'support' | 'order_manager'>('admin');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'customers') {
        const res = await adminApi.getCustomers(search);
        if (res.success && res.data) setCustomers(res.data);
      } else {
        const res = await adminApi.getStaffAdmins();
        if (res.success && res.data) setStaff(res.data);
      }
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, search]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createStaffAdmin({
        name: staffName.trim(),
        email: staffEmail.trim(),
        password: staffPassword,
        role: staffRole,
      });
      setIsModalOpen(false);
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      fetchData();
    } catch (e) {
      console.error('Failed to create staff:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">User Management</h1>
          <p className="text-xs text-stone-500">View customer activity and manage staff permissions (RBAC).</p>
        </div>

        {activeTab === 'staff' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Staff Member
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'customers' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600'
          }`}
        >
          Customer Accounts
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'staff' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600'
          }`}
        >
          Admin Staff & Roles
        </button>
      </div>

      {activeTab === 'customers' ? (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer by name or email..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Orders Placed</th>
                  <th className="p-4">Total Spend</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-stone-900">{c.name}</div>
                      <span className="text-[10px] text-stone-400">{c.email}</span>
                    </td>
                    <td className="p-4 font-mono text-stone-700">{c.phone || '-'}</td>
                    <td className="p-4 font-bold text-stone-900">{c.order_count || 0} orders</td>
                    <td className="p-4 font-black text-emerald-700">₹{c.total_spend || 0}</td>
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-stone-500 text-[10px]">
                      {new Date(c.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500">
              <tr>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Email</th>
                <th className="p-4">RBAC Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-4 font-bold text-stone-900">{s.name}</td>
                  <td className="p-4 font-mono">{s.email}</td>
                  <td className="p-4">
                    <span className="bg-stone-100 text-stone-800 text-[10px] uppercase font-black px-2.5 py-1 rounded-md border border-stone-200">
                      {s.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-stone-500 text-[10px]">
                    {s.last_login_at ? new Date(s.last_login_at).toLocaleString('en-IN') : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">Add Staff Member</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-stone-400" /></button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Password (Min 8 chars) *</label>
                <input
                  type="password"
                  required
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Role & Permissions *</label>
                <select
                  value={staffRole}
                  onChange={(e: any) => setStaffRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold"
                >
                  <option value="admin">Admin (Full Access)</option>
                  <option value="manager">Operations Manager</option>
                  <option value="order_manager">Order Fulfilment Specialist</option>
                  <option value="support">Customer Support Agent</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button type="submit" className="flex-1 py-2.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600">Create Staff</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-stone-200 text-stone-700 font-bold rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
