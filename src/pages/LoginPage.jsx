import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, UserPlus, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Safely extract the primitive pathname string from the passed location object
  const redirectTo = location.state?.from?.pathname || "/";

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
    <main className="bg-white px-4 pt-5 pb-7 md:pt-8 md:pb-8 selection:bg-blue-500 selection:text-white">
      <section className="max-w-[420px] mx-auto">
        
        {/* Branding Headings */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#071b3a] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-gray-500 mt-1.5 font-medium">
            Login to your SARA Wholesale Supplies account
          </p>
        </div>

        {/* Core Auth Panel Wrapper */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#071b3a] mb-5 border-b border-gray-100 pb-3">
            <Lock size={16} className="text-green-600" />
            Secure Portal Login
          </h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-xs font-semibold text-red-600 animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email Address">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="w-full h-10 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition-all"
                required
              />
            </Field>

            <Field label="Password">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full h-10 pl-10 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </Field>

            <div className="flex items-center justify-end text-xs pt-1">
              <Link to="/forgot-password" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-green-700 text-white rounded-lg text-sm font-bold hover:bg-green-800 active:scale-[0.98] disabled:opacity-60 transition-all cursor-pointer shadow-sm"
            >
              {loading ? "Verifying Account..." : "Login to Dashboard"}
            </button>
          </form>

          {/* Separation Divider Layout */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">New Client</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Link
            to="/register"
            className="w-full h-10 border border-[#071b3a] rounded-lg flex items-center justify-center gap-2 font-bold text-[#071b3a] text-sm hover:bg-[#071b3a]/5 transition-colors"
          >
            <UserPlus size={16} />
            Request Trade Account
          </Link>
        </div>

        {/* Corporate Legal Compliance Notice Banner */}
        <div className="mt-4 border border-green-100 bg-green-50/50 rounded-xl p-4 flex gap-3 shadow-sm">
          <ShieldCheck size={22} className="text-green-700 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-green-700 text-sm">
              Wholesale Access Restitution
            </h3>
            <p className="text-xs leading-relaxed text-gray-600 mt-1 font-medium">
              SARA Wholesale Supplies is a trade-only operator. All submitted registration manifests require corporate review and vetting before purchase features open.
            </p>
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
