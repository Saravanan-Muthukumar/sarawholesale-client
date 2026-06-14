// src/pages/ResetPasswordPage.jsx

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, Eye } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setMessage("Password reset successful. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white px-4 pt-6 pb-8">
      <section className="max-w-md mx-auto">
        <div className="text-center mb-5">
          <h1 className="text-[24px] font-bold text-[#071b3a]">
            Reset Password
          </h1>
          <p className="text-sm text-[#071b3a]/70 mt-1">
            Enter your new password below.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          {message && (
            <div className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="New Password">
              <Lock size={17} className="input-icon" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter new password"
                className="auth-input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                <Eye size={17} />
              </button>
            </Field>

            <Field label="Confirm Password">
              <Lock size={17} className="input-icon" />
              <input
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="auth-input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                <Eye size={17} />
              </button>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link to="/login" className="text-sm font-semibold text-blue-700">
              Back to Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#071b3a] mb-1.5">
        {label}
      </label>
      <div className="relative">{children}</div>
    </div>
  );
}