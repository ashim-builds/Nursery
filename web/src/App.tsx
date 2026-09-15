import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { UIProvider } from './context/UIContext';
import { PWAProvider } from './context/PWAContext';
import { SocketProvider } from './context/SocketContext';
import { ToastContainer } from './components/common/Toast';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { StorefrontLayout } from './components/layout/StorefrontLayout';
import { ScrollToTop } from './components/common/ScrollToTop';
import { PageLoader } from './components/common/PageLoader';

// Lazy-Loaded Storefront Pages
const HomePage = React.lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const CatalogPage = React.lazy(() => import('./pages/CatalogPage').then((m) => ({ default: m.CatalogPage })));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const SearchPage = React.lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const CartPage = React.lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = React.lazy(() => import('./pages/OrderConfirmationPage').then((m) => ({ default: m.OrderConfirmationPage })));
const OrdersPage = React.lazy(() => import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const OrderDetailPage = React.lazy(() => import('./pages/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const AddressesPage = React.lazy(() => import('./pages/AddressesPage').then((m) => ({ default: m.AddressesPage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Lazy-Loaded Admin Components & Pages
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminLoginPage = React.lazy(() => import('./pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminSetupWizardPage = React.lazy(() => import('./pages/admin/AdminSetupWizardPage').then((m) => ({ default: m.AdminSetupWizardPage })));
const AdminOverviewPage = React.lazy(() => import('./pages/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage })));
const AdminOrdersPage = React.lazy(() => import('./pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })));
const AdminOrderDetailPage = React.lazy(() => import('./pages/admin/AdminOrderDetailPage').then((m) => ({ default: m.AdminOrderDetailPage })));
const AdminProductsPage = React.lazy(() => import('./pages/admin/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })));
const AdminProductFormPage = React.lazy(() => import('./pages/admin/AdminProductFormPage').then((m) => ({ default: m.AdminProductFormPage })));
const AdminInventoryPage = React.lazy(() => import('./pages/admin/AdminInventoryPage').then((m) => ({ default: m.AdminInventoryPage })));
const AdminCustomersPage = React.lazy(() => import('./pages/admin/AdminCustomersPage').then((m) => ({ default: m.AdminCustomersPage })));
const AdminDeliveryZonesPage = React.lazy(() => import('./pages/admin/AdminDeliveryZonesPage').then((m) => ({ default: m.AdminDeliveryZonesPage })));
const AdminNotificationsPage = React.lazy(() => import('./pages/admin/AdminNotificationsPage').then((m) => ({ default: m.AdminNotificationsPage })));
const AdminAuditLogsPage = React.lazy(() => import('./pages/admin/AdminAuditLogsPage').then((m) => ({ default: m.AdminAuditLogsPage })));

import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';
import { InstallInstructionsModal } from './components/common/InstallInstructionsModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Instantly refresh when returning to tab/window
      staleTime: 1000 * 5,        // 5 seconds (near real-time updates instead of 5-minute freeze)
      gcTime: 1000 * 60 * 15,     // 15 minutes garbage collection
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <AuthProvider>
          <CartProvider>
            <UIProvider>
              <PWAProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* 1. PUBLIC STOREFRONT & CUSTOMER ROUTES */}
                      <Route element={<StorefrontLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/catalog" element={<CatalogPage />} />
                        <Route path="/products/:slug" element={<ProductDetailPage />} />
                        <Route path="/product/:slug" element={<ProductDetailPage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/order-success/:id" element={<OrderConfirmationPage />} />
                        {/* Customer Account & Orders (Protected) */}
                        <Route
                          path="/orders"
                          element={
                            <ProtectedRoute>
                              <OrdersPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="/orders/:id" element={<OrderDetailPage />} />
                        <Route
                          path="/account"
                          element={
                            <ProtectedRoute>
                              <ProfilePage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/account/profile"
                          element={
                            <ProtectedRoute>
                              <ProfilePage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <ProfilePage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/account/addresses"
                          element={
                            <ProtectedRoute>
                              <AddressesPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* Auth & Support */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                      </Route>

                      {/* 2. DEDICATED ADMIN LOGIN & SETUP */}
                      <Route path="/admin/login" element={<AdminLoginPage />} />
                      <Route
                        path="/admin/setup"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminSetupWizardPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* 3. SECURE ADMIN OPERATIONS CONSOLE (PROTECTED) */}
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<AdminOverviewPage />} />
                        <Route path="orders" element={<AdminOrdersPage />} />
                        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                        <Route path="products" element={<AdminProductsPage />} />
                        <Route path="products/new" element={<AdminProductFormPage />} />
                        <Route path="products/:id" element={<AdminProductFormPage />} />
                        <Route path="inventory" element={<AdminInventoryPage />} />
                        <Route path="customers" element={<AdminCustomersPage />} />
                        <Route path="delivery-zones" element={<AdminDeliveryZonesPage />} />
                        <Route path="notifications" element={<AdminNotificationsPage />} />
                        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                      </Route>

                      {/* 4. 404 CATCH-ALL */}
                      <Route
                        path="*"
                        element={<StorefrontLayout />}
                      >
                        <Route path="*" element={<NotFoundPage />} />
                      </Route>
                    </Routes>
                  </Suspense>

                  <PWAInstallPrompt />
                  <InstallInstructionsModal />
                  <ToastContainer />
                </BrowserRouter>
              </PWAProvider>
            </UIProvider>
          </CartProvider>
        </AuthProvider>
      </SocketProvider>
    </QueryClientProvider>
  );
};

export default App;
