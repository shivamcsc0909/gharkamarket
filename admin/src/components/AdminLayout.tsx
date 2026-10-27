import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Layers,
  Archive,
  Tag,
  Building2,
  Mail,
  Star,
  Users,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { admin, logout } = useAdminAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', name: 'Orders Management', icon: Package },
    { id: 'products', name: 'Products Catalog', icon: Boxes },
    { id: 'categories', name: 'Categories', icon: Layers },
    { id: 'inventory', name: 'Inventory & Stock', icon: Archive },
    { id: 'coupons', name: 'Coupons & Discounts', icon: Tag },
    { id: 'corporate', name: 'Corporate B2B Leads', icon: Building2 },
    { id: 'contacts', name: 'Customer Inquiries', icon: Mail },
    { id: 'reviews', name: 'Reviews Moderation', icon: Star },
    { id: 'customers', name: 'Customer Accounts', icon: Users },
    { id: 'staff', name: 'Admin Staff & Roles', icon: ShieldAlert, superOnly: true },
    { id: 'content', name: 'Content & Settings', icon: Settings },
    { id: 'audit', name: 'Audit Logs', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col lg:flex-row">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-72 bg-stone-900 text-stone-300 flex-col justify-between shrink-0 p-6 border-r border-stone-800">
        <div className="space-y-6">
          
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
              OF
            </div>
            <div>
              <div className="font-extrabold text-white text-base tracking-tight leading-none">OfficeFuel</div>
              <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider block mt-1">Admin Operations</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              if (item.superOnly && admin?.role !== 'super_admin') return null;
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400 group-hover:text-brand-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Staff User Box & Logout */}
        <div className="pt-6 border-t border-stone-800 space-y-3">
          <div className="px-2">
            <div className="text-xs font-bold text-white truncate">{admin?.name}</div>
            <div className="text-[10px] text-stone-400 truncate">{admin?.email}</div>
            <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-stone-800 text-brand-400 border border-stone-700">
              {admin?.role?.replace(/_/g, ' ')}
            </span>
          </div>

          <button
            onClick={logout}
            className="w-full py-2.5 px-3 rounded-xl bg-stone-800/80 hover:bg-rose-950/80 text-stone-300 hover:text-rose-200 text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <header className="lg:hidden bg-stone-900 text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black text-sm">
            OF
          </div>
          <span className="font-extrabold text-base">OfficeFuel Admin</span>
        </div>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-stone-400 hover:text-white rounded-lg"
          aria-label="Toggle Navigation Drawer"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-stone-900/80 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-xs bg-stone-900 text-stone-300 p-6 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <span className="font-bold text-white text-sm">Menu</span>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  if (item.superOnly && admin?.role !== 'super_admin') return null;
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 ${
                        isActive ? 'bg-brand-500 text-white' : 'text-stone-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={() => {
                logout();
                setMobileSidebarOpen(false);
              }}
              className="w-full py-3 bg-stone-800 text-rose-300 font-bold text-xs rounded-xl"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto overflow-y-auto">
        {children}
      </main>

    </div>
  );
};
