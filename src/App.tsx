import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AdminProvider } from './context/AdminContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SplashScreen } from './components/common/SplashScreen';
import { FloatingCartToast } from './components/common/FloatingCartToast';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { assetUrl } from './utils/assets';

// Public Storefront Pages
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountOrdersPage } from './pages/AccountOrdersPage';
import { TrackingPage } from './pages/TrackingPage';
import { RecipesBlogPage } from './pages/RecipesBlogPage';
import { ReferralPartnerPage } from './pages/ReferralPartnerPage';
import { GuidePaymentPage } from './pages/GuidePaymentPage';
import { ContactPage } from './pages/ContactPage';

// Admin & POS Pages (Protected Behind Login)
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ProductManagementPage } from './pages/admin/ProductManagementPage';
import { POSKasirPage } from './pages/admin/POSKasirPage';
import { InventoryPage } from './pages/admin/InventoryPage';
import { PurchasingPage } from './pages/admin/PurchasingPage';
import { OrdersAdminPage } from './pages/admin/OrdersAdminPage';
import { AccountingPage } from './pages/admin/AccountingPage';
import { CompetitorPricingPage } from './pages/admin/CompetitorPricingPage';
import { CRMPage } from './pages/admin/CRMPage';

// Helper component to scroll to top on page change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Main Layout Router Content
const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Routes>
        {/* Unprotected Login Page */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin & POS Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <ProductManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pos"
          element={
            <ProtectedRoute>
              <POSKasirPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/purchasing"
          element={
            <ProtectedRoute>
              <PurchasingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <OrdersAdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/accounting"
          element={
            <ProtectedRoute>
              <AccountingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/competitors"
          element={
            <ProtectedRoute>
              <CompetitorPricingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/crm"
          element={
            <ProtectedRoute>
              <CRMPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F0] text-[#1A1A1A]">
      {/* Standardized Storefront Header */}
      <Header />

      {/* Floating Cart Notification with Red Checkmark */}
      <FloatingCartToast />

      {/* Main Storefront Application Routes */}
      <main className="flex-1 pt-[120px]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/katalog" element={<CatalogPage />} />
          <Route path="/products" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/favorit" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account" element={<AccountOrdersPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/kontak" element={<ContactPage />} />
          <Route path="/recipes" element={<RecipesBlogPage />} />
          <Route path="/referral" element={<ReferralPartnerPage />} />
          <Route path="/guide" element={<GuidePaymentPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Floating WhatsApp Live Chat Widget with Pulsing Green Radar Effect */}
      <div className="fixed bottom-6 right-6 z-50 group flex items-center gap-3">
        {/* Hover Tooltip/Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-emerald-100 text-xs font-bold text-stone-800 pointer-events-none transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Chat WhatsApp CS</span>
        </div>

        {/* Radar Pulsing Button Container */}
        <a
          href="https://wa.me/6285773875762?text=Halo%20Sembako%20Nusantara,%20saya%20ingin%20bertanya%20mengenai%20produk%20dan%20pemesanan"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat WhatsApp"
          className="relative flex items-center justify-center w-14 h-14 bg-white hover:bg-stone-50 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer border border-emerald-200"
        >
          {/* Radar Wave Rings (Green Radar Pulse Effect) */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-35 pointer-events-none"></span>
          <span className="absolute -inset-1.5 rounded-full bg-emerald-400 opacity-25 animate-pulse pointer-events-none"></span>

          {/* Official Icons8 WhatsApp Icon Image */}
          <img
            src={assetUrl('whatsapp-icon.png')}
            alt="WhatsApp CS"
            className="w-10 h-10 object-contain relative z-10 drop-shadow-sm"
          />

          {/* Active Online Green Dot */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full z-20 animate-pulse"></span>
        </a>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SplashScreen />
        <AdminProvider>
          <CartProvider>
            <WishlistProvider>
              <Router>
                <ScrollToTop />
                <AppContent />
              </Router>
            </WishlistProvider>
          </CartProvider>
        </AdminProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;

