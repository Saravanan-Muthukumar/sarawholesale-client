import React, { lazy, Suspense } from "react";
import { Routes, Route,useLocation, } from "react-router-dom";

// Primary Structural Layouts (Kept static for initial fast render)
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import CookieBanner from "./components/CookieBanner";
import WhatsAppChatButton from "./components/WhatsAppButton";
import ProtectedRoute from "./components/ProtectedRoute";
import SubscribePopup from "./components/SubscribePopup";


// Core Public Pages (Kept static to ensure fast loading times)
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";

// Asynchronous Component Loading (Splits admin/user blocks into micro-chunks)
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const BusinessDetailsPage = lazy(() => import("./pages/BusinessDetailsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));
const OrderDetailsPage = lazy(() => import("./pages/OrderDetailsPage"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));
const SubCategoryPage = lazy(() => import("./pages/SubCategoryPage"));
const ProductListPage = lazy(() => import("./pages/ProductListPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
import ProceedCheckoutPage from "./pages/ProceedCheckoutPage";


// Protected Dashboard Layouts & Views
const AccountLayout = lazy(() => import("./pages/account/AccountLayout"));
const DashboardPage = lazy(() => import("./pages/account/DashboardPage"));
const MyOrdersPage = lazy(() => import("./pages/account/MyOrdersPage"));
const CustomerDetailsPage = lazy(() => import("./pages/account/CustomerDetailsPage"));
const ChangePasswordPage = lazy(() => import("./pages/account/ChangePasswordPage"));

// Administrative Suite
const AdminCategoriesPage = lazy(() => import("./pages/admin/AdminCategoriesPage"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage"));
const AdminFlyerBuilderPage = lazy(() => import("./pages/admin/AdminFlyerBuilderPage"));

// Footer Institutional Columns
const ContactPage = lazy(() => import("./pages/footer/ContactPage"));
const DeliveryInformationPage = lazy(() => import("./pages/footer/DeliveryInformationPage"));
const ReturnsPolicyPage = lazy(() => import("./pages/footer/ReturnsPolicyPage"));
const TermsPage = lazy(() => import("./pages/footer/TermsPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/footer/PrivacyPolicyPage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));
import CancellationPolicyPage from "./pages/footer/CancellationPolicyPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentReturnPage from "./pages/PaymentReturnPage";
import PaymentProcessingPage from "./pages/PaymentProcessingPage";
// import AllProductsPage from "./pages/AllProductsPage";

// Optimized Global Loading Skeleton Indicator
function RouteLoaderSkeleton() {
  return (
    <div className="w-full h-96 flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  const hideMobileCheckoutHeader =
   location.pathname === "/cart" ||
    location.pathname === "/checkout" ||
    // location.pathname === "/payment" ||
    // location.pathname === "/payment/return" ||
    // location.pathname === "/payment-processing" ||
    location.pathname.startsWith("/guest-checkout");
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans antialiased text-gray-900 selection:bg-blue-500 selection:text-white">
      <ScrollToTop />
      <div
          className={
            hideMobileCheckoutHeader
              ? "hidden md:contents"
              : "contents"
          }
        >
          <Header />
        </div>  
      
      <main className="flex-1">
        {/* Suspense intercepts lazy chunks loading across routing threads */}
        <Suspense fallback={<RouteLoaderSkeleton />}>
          <Routes>
            {/* Core Public Storefront */}
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/category/:slug" element={<SubCategoryPage />} />
            <Route path="/subcategory/:slug" element={<ProductListPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            {/* <Route path="/products" element={<AllProductsPage />} /> */}

            {/* Authentication Matrix */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/business-details" element={<BusinessDetailsPage />} />

            {/* Transaction Operational Flows */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
            <Route path="/proceed-checkout" element={<ProceedCheckoutPage />}/>
            <Route path="/checkout" element={<CheckoutPage />}/>
            {/* <Route path="/payment" element={<PaymentPage />}/>
            <Route path="/payment/return" element={<PaymentReturnPage />}/>
            <Route path="/payment-processing" element={<PaymentProcessingPage />}/> */}
            



            {/* Secure B2B User Customer Panel */}
            <Route
              path="/account"
              element={
                <ProtectedRoute allowedRoles={["user", "admin"]}>
                  <AccountLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="orders" element={<MyOrdersPage />} />
              <Route path="details" element={<CustomerDetailsPage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
            </Route>
            <Route 
              path="/orders/:orderNumber" 
              element={
                <ProtectedRoute allowedRoles={["user", "admin"]}>
                  <OrderDetailsPage />
                </ProtectedRoute>
              } 
            />

            {/* Secure Administrative Backoffice Suite */}
            <Route path="/admin">
              <Route
                path="categories"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminCategoriesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="products"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminProductsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="flyer-builder"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminFlyerBuilderPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Corporate Compliance & Legal Columns */}
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/delivery-information" element={<DeliveryInformationPage />} />
            <Route path="/returns-policy" element={<ReturnsPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />

          </Routes>
        </Suspense>
      </main>

      <WhatsAppChatButton />
      <Footer />
      <SubscribePopup />
      <CookieBanner />
    </div>
  );
}
