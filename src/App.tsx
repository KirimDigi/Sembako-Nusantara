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
import { CustomerLiveOrderStatusBanner } from './components/common/CustomerLiveOrderStatusBanner';
import { DraggableWhatsAppButton } from './components/common/DraggableWhatsAppButton';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { assetUrl } from './utils/assets';

// Public Storefront Pages
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProfilePage } from './pages/ProfilePage';
import { AccountOrdersPage } from './pages/AccountOrdersPage';
import { TrackingPage } from './pages/TrackingPage';
import { RecipesBlogPage } from './pages/RecipesBlogPage';
import { ReferralPartnerPage } from './pages/ReferralPartnerPage';
import { GuidePaymentPage } from './pages/GuidePaymentPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';

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
import { MasterPromotionsPage } from './pages/admin/MasterPromotionsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { ReportsAdminPage } from './pages/admin/ReportsAdminPage';
import { POSCustomerDisplayPage } from './pages/admin/POSCustomerDisplayPage';

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

  // Standalone Customer-Facing Display (No Header/Footer, No Sidebar)
  if (location.pathname === '/pos-display' || location.pathname === '/admin/pos/display') {
    return <POSCustomerDisplayPage />;
  }

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Routes>
        {/* Unprotected Login Page */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/pos/display" element={<POSCustomerDisplayPage />} />

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
          path="/admin/promotions"
          element={
            <ProtectedRoute>
              <MasterPromotionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/diskon"
          element={
            <ProtectedRoute>
              <MasterPromotionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/promo"
          element={
            <ProtectedRoute>
              <MasterPromotionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/voucher"
          element={
            <ProtectedRoute>
              <MasterPromotionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/harga-grosir"
          element={
            <ProtectedRoute>
              <MasterPromotionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <ReportsAdminPage />
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
    <div className="min-h-screen flex flex-col bg-[#FDF8F0] text-[#1A1A1A] w-full max-w-full overflow-x-hidden">
      {/* Standardized Storefront Header */}
      <Header />

      {/* Floating Cart Notification with Red Checkmark */}
      <FloatingCartToast />

      {/* Live Customer Order Status Banner (Bottom) */}
      <CustomerLiveOrderStatusBanner />

      {/* Main Storefront Application Routes */}
      <main className="flex-1 pt-[120px] w-full max-w-full overflow-x-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/tentang-kami" element={<AboutPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/katalog" element={<CatalogPage />} />
          <Route path="/products" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/favorit" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/account" element={<ProfilePage />} />
          <Route path="/orders" element={<AccountOrdersPage />} />
          <Route path="/pesanan-saya" element={<AccountOrdersPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/contact" element={<AboutPage />} />
          <Route path="/kontak" element={<AboutPage />} />
          <Route path="/recipes" element={<RecipesBlogPage />} />
          <Route path="/referral" element={<ReferralPartnerPage />} />
          <Route path="/guide" element={<AboutPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Draggable WhatsApp Live Chat Widget with Scheduled Drag Hints */}
      <DraggableWhatsAppButton />
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

