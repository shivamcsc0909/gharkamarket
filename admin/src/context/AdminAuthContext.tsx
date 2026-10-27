import React, { createContext, useContext, useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import { AdminUser } from '../types';

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, adminUser: AdminUser) => void;
  logout: () => void;
  refreshAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('of_admin_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshAdmin = async () => {
    if (!token) {
      setAdmin(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await adminApi.getMe();
      if (res.success && res.data) {
        setAdmin(res.data);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAdmin();
  }, [token]);

  const login = (newToken: string, adminUser: AdminUser) => {
    localStorage.setItem('of_admin_token', newToken);
    setToken(newToken);
    setAdmin(adminUser);
  };

  const logout = () => {
    localStorage.removeItem('of_admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, isLoading, login, logout, refreshAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
