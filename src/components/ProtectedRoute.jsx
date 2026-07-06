import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isLoggedIn, user, authLoading } = useAuth();
  const location = useLocation(); // Tracks the exact URL path the user requested

  // Prevent silent white screens if the backend auth check hangs
  if (authLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-gray-500 tracking-wide uppercase">Securing Session...</p>
      </div>
    );
  }

  // Session Expired/Logged Out Intercept
  if (!isLoggedIn) {
    // Passes the exact requested URL inside the state object to the login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = String(user?.role || "").trim().toLowerCase();

  // Handle access validation without continuous map allocations
  if (allowedRoles.length > 0) {
    const isAuthorized = allowedRoles.some(
      (role) => String(role).trim().toLowerCase() === userRole
    );

    if (!isAuthorized) {
      // If a standard customer tries to load administrative roots, safely push to home
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
