import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, UserPlus, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage({ redirectTo: redirectProp, compact = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Safely extract the primitive pathname string from the passed location object
  const redirectTo =
  redirectProp ||
  (typeof location.state?.from === "string"
    ? location.state.from
    : location.state?.from?.pathname) ||
  "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      // Pushes back to original screen destination or dashboard
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`${compact ? "bg-transparent p-0" : "bg-[#f4f6f9] px-4 py-6 md:py-10"}`}>
    <section className={`${compact ? "max-w-none" : "max-w-5xl mx-auto"}`}>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#071b3a]">
          Login
        </h1>
        <p className="text-sm text-[#071b3a]/70 mt-1">
          Login to continue with your order request.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {/* Login */}
        <div className="bg-white border border-[#edf1f7] p-5 md:p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#071b3a] mb-5">
          <Lock size={18} className="text-gray-600" />
            Existing Customer
          </h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-100 px-3 py-2.5 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email Address">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#071b3a]/40 pointer-events-none" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="w-full h-11 pl-10 pr-4 text-sm border border-[#dfe5ee] focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700"
                required
              />
            </Field>

            <Field label="Password">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#071b3a]/40 pointer-events-none" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-10 text-sm border border-[#dfe5ee]  focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1F1F1F] cursor-pointer transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </Field>

            <div className="flex items-center justify-end text-xs pt-1">
              <Link
                to="/forgot-password"
                className="font-bold text-[#1F1F1F] hover:text-gray-700 cursor-pointer transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-black text-white text-sm font-bold hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        {/* New account */}
        <div className="bg-white border border-[#edf1f7]  p-5 md:p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#071b3a] mb-5">
          <UserPlus size={18} className="text-gray-600" />
            New Customer
          </h2>

          <p className="text-sm text-[#071b3a]/70 leading-6 mb-5">
            Create a trade account to request orders, save your delivery details
            and manage your wholesale account.
          </p>

          <Link
            to="/register"
            className="w-full h-11 border border-[#071b3a]  flex items-center justify-center gap-2 font-bold text-[#071b3a] text-sm hover:bg-[#071b3a]/5 transition"
          >
            <UserPlus size={16} />
            Request Trade Account
          </Link>

          <div className="mt-5 border border-gray-200 bg-gray-50 p-4 flex gap-3">
          <ShieldCheck size={22} className="text-gray-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-800 text-sm">
            Trade Account Benefits
            </h3>
              <p className="text-xs leading-relaxed text-[#071b3a]/65 mt-1">
              Save your delivery details, view your order history, and enjoy faster checkout on future orders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
);
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#071b3a] mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">{children}</div>
    </div>
  );
}
