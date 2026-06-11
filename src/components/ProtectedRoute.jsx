import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isLoggedIn, user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const userRole = String(user?.role || "").toLowerCase();

  const allowed = allowedRoles.map((role) =>
    String(role).toLowerCase()
  );

  if (allowed.length && !allowed.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}