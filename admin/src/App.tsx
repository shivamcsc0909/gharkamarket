import React, { useState, useEffect } from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminLayout } from './components/AdminLayout';
import { adminApi } from './services/adminApi';

// Pages
import { AdminLogin } from './pages/AdminLogin';
import { SetupWizard } from './pages/SetupWizard';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { Inventory } from './pages/Inventory';
import { Coupons } from './pages/Coupons';
import { CorporateLeads } from './pages/CorporateLeads';
import { ContactRequests } from './pages/ContactRequests';
import { Reviews } from './pages/Reviews';
import { Users } from './pages/Users';
import { ContentSettings } from './pages/ContentSettings';
import { AuditLogs } from './pages/AuditLogs';

const AdminAppContent: React.FC = () => {
  const { admin, isLoading } = useAdminAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [pageParams, setPageParams] = useState<any>({});
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [forceSetup, setForceSetup] = useState<boolean>(false);

  useEffect(() => {
    adminApi.getSetupStatus().then((res) => {
      if (res.success && res.data) {
        setIsInstalled(res.data.is_installed);
      } else {
        setIsInstalled(true);
      }
    }).catch(() => {
      setIsInstalled(true);
    });
  }, []);

  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading || isInstalled === null) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // 1. First Deployment Setup Wizard
  if (!isInstalled || forceSetup) {
    return (
      <SetupWizard
        onComplete={() => {
          setIsInstalled(true);
          setForceSetup(false);
        }}
      />
    );
  }

  // 2. Admin Login
  if (!admin) {
    return <AdminLogin onNavigateToSetup={() => setForceSetup(true)} />;
  }

  // 3. Authenticated Admin Dashboard
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'orders':
        return <Orders initialStatus={pageParams.status} initialOrderId={pageParams.orderId} />;
      case 'products':
        return <Products />;
      case 'categories':
        return <Categories />;
      case 'inventory':
        return <Inventory initialFilter={pageParams.filter} />;
      case 'coupons':
        return <Coupons />;
      case 'corporate':
        return <CorporateLeads />;
      case 'contacts':
        return <ContactRequests />;
      case 'reviews':
        return <Reviews />;
      case 'customers':
      case 'staff':
        return <Users />;
      case 'content':
        return <ContentSettings />;
      case 'audit':
        return <AuditLogs />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </AdminLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminAppContent />
    </AdminAuthProvider>
  );
};

export default App;
