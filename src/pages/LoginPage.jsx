import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, UserPlus, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CategoryMenu from "../components/CategoryMenu";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const redirectTo = location.state?.from || "/";

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
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white px-4 pt-5 pb-7 md:pt-8 md:pb-8">

      <section className="max-w-105 mx-auto">
      
        <div className="text-center mb-4">
          <h1 className="text-[23px] md:text-[28px] font-bold text-[#071b3a]">
            Welcome Back
          </h1>
          <p className="text-[13px] text-[#071b3a]/80 mt-1">
            Login to your SARA Wholesale Supplies account
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#071b3a] mb-4">
            <Lock size={18} className="text-green-700" />
            Login
          </h2>

          {error && (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Email Address">
              <Mail size={17} className="input-icon" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="auth-input"
                required
              />
            </Field>

            <Field label="Password">
              <Lock size={17} className="input-icon" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
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

            <div className="flex items-center justify-between text-xs">
              {/* <label className="flex items-center gap-2 font-semibold text-[#071b3a]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5"
                />
                Remember me
              </label> */}

              <Link to="/forgot-password" className="font-semibold text-blue-700">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Link
            to="/register"
            className="h-10 border border-[#071b3a] rounded-lg flex items-center justify-center gap-2 font-bold text-[#071b3a] text-sm"
          >
            <UserPlus size={17} />
            Request an Account
          </Link>
        </div>

        <div className="mt-4 border border-green-100 bg-green-50 rounded-xl p-4 flex gap-3">
          <ShieldCheck size={26} className="text-green-700 shrink-0" />
          <div>
            <h3 className="font-bold text-green-700 text-base">
              Wholesale Access
            </h3>
            <p className="text-xs leading-5 mt-1">
              SARA Wholesale Supplies is a trade only website. New customers
              need to create an account for approval.
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
      <label className="block text-xs font-bold text-[#071b3a] mb-1.5">
        {label}
      </label>
      <div className="relative">{children}</div>
    </div>
  );
}