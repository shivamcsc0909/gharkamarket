import React, { useEffect, useState } from 'react';
import { User as UserIcon, MapPin, Plus, Trash2, Key, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { Address } from '../types';

interface AccountProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Account: React.FC<AccountProps> = ({ onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useNotification();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Add Address Form State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addrName, setAddrName] = useState(user?.name || '');
  const [addrPhone, setAddrPhone] = useState(user?.phone || '');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('Gurugram');
  const [addrState, setAddrState] = useState('Haryana');
  const [addrPin, setAddrPin] = useState('122002');
  const [addrType, setAddrType] = useState<'home' | 'work' | 'other'>('work');

  useEffect(() => {
    if (!user) {
      onNavigate('login');
      return;
    }
    setName(user.name);
    if (user.phone) setPhone(user.phone);
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    const res = await api.getAddresses();
    if (res.success && res.data) {
      setAddresses(res.data);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateProfile({
        name,
        phone,
        password: password ? password : undefined,
      });
      if (res.success) {
        showToast('Profile updated successfully!', 'success');
        setPassword('');
        refreshUser();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to update profile', 'error');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addAddress({
        name: addrName,
        phone: addrPhone,
        address_line1: addrLine1,
        address_line2: addrLine2,
        city: addrCity,
        state: addrState,
        pincode: addrPin,
        address_type: addrType,
        is_default: addresses.length === 0 ? 1 : 0,
      });

      if (res.success) {
        showToast('Address added!', 'success');
        setIsAddingAddress(false);
        fetchAddresses();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to add address', 'error');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await api.deleteAddress(id);
      showToast('Address removed', 'info');
      fetchAddresses();
    } catch (e: any) {
      showToast(e.message || 'Failed to remove address', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">My Account</h1>
        <p className="text-sm text-stone-500 mt-1">Manage your profile, delivery addresses and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Profile & Password */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
          <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-brand-600" /> Personal Details
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Email (Registered)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 bg-stone-100 text-stone-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
              />
            </div>

            <div className="pt-2 border-t border-stone-100">
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-stone-500" /> Change Password (Leave blank to keep current)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Right: Saved Addresses */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" /> Saved Delivery Addresses
            </h3>

            {!isAddingAddress && (
              <button
                onClick={() => setIsAddingAddress(true)}
                className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            )}
          </div>

          {/* Add Address Form */}
          {isAddingAddress ? (
            <form onSubmit={handleAddAddress} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <h4 className="font-bold text-xs text-stone-900">Add New Address</h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-600">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-600">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-600">Street / Office Address</label>
                <input
                  type="text"
                  required
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  placeholder="Floor, Building, Street"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-600">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={addrPin}
                    onChange={(e) => setAddrPin(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-600">City</label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-600">Type</label>
                  <select
                    value={addrType}
                    onChange={(e: any) => setAddrType(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="work">Work/Office</option>
                    <option value="home">Home</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-brand-500 text-white font-bold text-xs rounded-lg hover:bg-brand-600"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="px-3 py-2 bg-stone-200 text-stone-700 font-bold text-xs rounded-lg hover:bg-stone-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {addresses.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-6">No saved addresses yet.</p>
              ) : (
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-start justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{addr.name}</span>
                        <span className="bg-stone-200 text-stone-700 text-[10px] uppercase font-bold px-1.5 py-0.2 rounded">
                          {addr.address_type}
                        </span>
                        {addr.is_default === 1 && (
                          <span className="text-emerald-600 font-bold text-[10px]">Default</span>
                        )}
                      </div>
                      <p className="text-stone-600">{addr.address_line1}</p>
                      <p className="text-stone-500 font-mono">{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600"
                      aria-label="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
