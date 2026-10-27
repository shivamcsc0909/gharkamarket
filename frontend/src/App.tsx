import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { ToastContainer } from './components/common/Toast';

// Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Orders } from './pages/Orders';
import { OrderDetails } from './pages/OrderDetails';
import { Account } from './pages/Account';
import { Corporate } from './pages/Corporate';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { Legal } from './pages/Legal';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>({});

  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'shop':
        return <Shop onNavigate={handleNavigate} initialParams={pageParams} />;
      case 'product':
        return <ProductDetail slug={pageParams.slug} onNavigate={handleNavigate} />;
      case 'checkout':
        return <Checkout onNavigate={handleNavigate} />;
      case 'order-success':
        return <OrderSuccess orderNumber={pageParams.orderNumber} onNavigate={handleNavigate} />;
      case 'orders':
        return <Orders onNavigate={handleNavigate} />;
      case 'order-details':
        return <OrderDetails orderNumber={pageParams.orderNumber} onNavigate={handleNavigate} />;
      case 'account':
        return <Account onNavigate={handleNavigate} />;
      case 'corporate':
        return <Corporate />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'faq':
        return <FAQ />;
      case 'legal':
        return <Legal initialSection={pageParams.section} />;
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'register':
        return <Register onNavigate={handleNavigate} />;
      case 'forgot-password':
        return <ForgotPassword onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-brand-500 selection:text-white">
            <AnnouncementBar />
            <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

            <main className="flex-1">
              {renderPage()}
            </main>

            <Footer onNavigate={handleNavigate} />
            <CartDrawer onNavigate={handleNavigate} />
            <ToastContainer />
          </div>
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
