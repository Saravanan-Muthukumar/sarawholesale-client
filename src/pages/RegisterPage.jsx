import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Truck,
  Headphones,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await register({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        business_name: null,
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      localStorage.setItem("verifyEmail", form.email.trim());
      navigate("/verify-email");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white px-4 pt-4 pb-6 md:pt-6 md:pb-7">
      <section className="max-w-245 mx-auto">
        <div className="text-center mb-3 md:mb-4">
          <h1 className="text-[23px] md:text-[28px] font-bold text-[#071b3a] leading-tight">
            Create an Account
          </h1>
          <p className="text-[13px] text-[#071b3a]/80 mt-1">
            Apply for a trade account with SARA Wholesale Supplies
          </p>
        </div>

        <div className="flex items-start justify-center mb-4">
          {["Account Details", "Business Details", "Review & Submit"].map(
            (label, index) => (
              <div key={label} className="flex items-start">
                <div className="text-center w-17 md:w-25">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto text-sm ${
                      index === 0
                        ? "bg-green-700 text-white"
                        : "bg-gray-100 text-[#071b3a]"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p
                    className={`text-[10px] md:text-xs mt-1.5 leading-tight ${
                      index === 0 ? "text-green-700" : "text-[#071b3a]"
                    }`}
                  >
                    {label}
                  </p>
                </div>

                {index < 2 && (
                  <div className="w-9 md:w-32 h-px bg-gray-300 mt-4" />
                )}
              </div>
            )
          )}
        </div>

        <div className="grid md:grid-cols-[1fr_260px] gap-4 items-start max-w-225 mx-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 shadow-sm"
          >
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#071b3a] mb-4">
              <User size={18} className="text-green-700" />
              Account Details
            </h2>

            {error && (
              <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-x-4 gap-y-3">
              <InputBox
                label="First Name *"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
                icon={<User size={17} />}
              />

              <InputBox
                label="Last Name *"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
                icon={<User size={17} />}
              />

              <InputBox
                label="Email Address *"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
                icon={<Mail size={17} />}
                full
              />

              <InputBox
                label="Phone Number *"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                icon={<Phone size={17} />}
                full
              />

              <PasswordBox
                label="Password *"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                show={showPassword}
                setShow={setShowPassword}
              />

              <PasswordBox
                label="Confirm Password *"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                placeholder="Confirm your password"
                show={showConfirm}
                setShow={setShowConfirm}
              />
            </div>

            <p className="text-xs text-gray-600 mt-2 leading-5">
              Password must be at least 8 characters with a mix of letters and
              numbers.
            </p>

            <div className="border-t mt-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? "Creating account..." : "Continue"}
                <ArrowRight size={17} />
              </button>
            </div>

            <p className="text-center text-sm mt-3 text-[#071b3a]/70">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-blue-700">
                Login
              </Link>
            </p>
          </form>

          <aside className="hidden md:block bg-green-50 border border-green-100 rounded-xl p-4">
            <h3 className="font-bold text-green-700 mb-4 text-base">
              Why Create an Account?
            </h3>

            <Benefit
              icon={<ShieldCheck size={16} />}
              text="Access wholesale prices"
            />
            <Benefit
              icon={<PackageCheck size={16} />}
              text="Place orders quickly"
            />
            <Benefit icon={<Truck size={16} />} text="Track your orders" />
            <Benefit icon={<User size={16} />} text="Manage your account" />
            <Benefit
              icon={<Headphones size={16} />}
              text="Dedicated customer support"
            />
          </aside>
        </div>
      </section>
    </main>
  );
}

function InputBox({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  full = false,
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-xs font-bold text-[#071b3a] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="input-icon">{icon}</span>
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="auth-input"
          required
        />
      </div>
    </div>
  );
}

function PasswordBox({
  label,
  name,
  value,
  onChange,
  placeholder,
  show,
  setShow,
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#071b3a] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Lock size={17} className="input-icon" />
        <input
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="auth-input pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          <Eye size={17} />
        </button>
      </div>
    </div>
  );
}

function Benefit({ icon, text }) {
  return (
    <div className="flex items-center gap-3 mb-4 text-sm text-[#071b3a]">
      <span className="text-green-700">{icon}</span>
      {text}
    </div>
  );
}