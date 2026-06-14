import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import BusinessDetailsPage from "./pages/BusinessDetailsPage";
import CartPage from "./pages/CartPage";
import ProductListPage from "./pages/ProductListPage";
import SubCategoryPage from "./pages/SubCategoryPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AccountLayout from "./pages/account/AccountLayout";
import DashboardPage from "./pages/account/DashboardPage";
import MyOrdersPage from "./pages/account/MyOrdersPage";
import CustomerDetailsPage from "./pages/account/CustomerDetailsPage";
import ChangePasswordPage from "./pages/account/ChangePasswordPage";
import Footer from "./components/Footer";
import ContactPage from "./pages/footer/ContactPage";
import DeliveryInformationPage from "./pages/footer/DeliveryInformationPage";
import ReturnsPolicyPage from "./pages/footer/ReturnsPolicyPage";
import TermsPage from "./pages/footer/TermsPage";
import PrivacyPolicyPage from "./pages/footer/PrivacyPolicyPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import ProductPage from "./pages/ProductPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CheckoutPage from "./pages/CheckoutPage";


export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
    
      <Header />
      <main className="flex-1">

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:slug" element={<SubCategoryPage />} />
        <Route path="/subcategory/:slug" element={<ProductListPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/business-details" element={<BusinessDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />

        <Route path="/account" element={<AccountLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<MyOrdersPage />} />
          <Route path="details" element={<CustomerDetailsPage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>

        <Route path="/contact" element={<ContactPage />} />
        <Route path="/delivery-information" element={<DeliveryInformationPage />} />
        <Route path="/returns-policy" element={<ReturnsPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminCategoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProductsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      </main>

      <Footer/>
    </div>
  );
}