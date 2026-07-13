import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function BusinessDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveBusinessDetails } = useAuth();

  const redirectTo = location.state?.from || "/login";

  const [form, setForm] = useState({
    business_name: "",
    company_number: "",
    vat_number: "",
    business_type: "",
    address_line1: "",
    city: "",
    postcode: "",
    website: "",
  });

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

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await saveBusinessDetails({
        business_name: form.business_name.trim(),
        company_number: form.company_number.trim(),
        vat_number: form.vat_number.trim(),
        business_type: form.business_type.trim(),
        address_line1: form.address_line1.trim(),
        city: form.city.trim(),
        postcode: form.postcode.trim(),
        website: form.website.trim(),
      });

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to save business details");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (loading) return;

    navigate(redirectTo, { replace: true });
  };

  return (
    <main className="bg-white px-4 pt-4 pb-6 md:pt-6 md:pb-7">
      <section className="max-w-225 mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-[23px] md:text-[28px] font-bold text-[#071b3a]">
            Business Details
          </h1>

          <p className="text-[13px] text-[#071b3a]/70 mt-1">
            Add your business and delivery details now, or complete them later
            from your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#edf1f7] p-5 shadow-sm"
        >
          {error && (
            <div className="mb-4 border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Business Name"
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              placeholder="Optional"
            />

            <Input
              label="Company Number"
              name="company_number"
              value={form.company_number}
              onChange={handleChange}
              placeholder="Optional"
            />

            <Input
              label="VAT Number"
              name="vat_number"
              value={form.vat_number}
              onChange={handleChange}
              placeholder="Optional"
            />

            <Input
              label="Business Type"
              name="business_type"
              value={form.business_type}
              onChange={handleChange}
              placeholder="Optional"
            />

            <Input
              label="Address Line 1"
              name="address_line1"
              value={form.address_line1}
              onChange={handleChange}
              placeholder="Enter delivery address"
              required
            />

            <Input
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Enter city"
              required
            />

            <Input
              label="Postcode"
              name="postcode"
              value={form.postcode}
              onChange={handleChange}
              placeholder="Enter postcode"
              required
            />

            <Input
              label="Website"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="h-11 border border-gray-300 bg-white text-[#1F1F1F] text-sm font-bold hover:bg-gray-100 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              Skip for now
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-11 bg-[#1F1F1F] text-white text-sm font-bold hover:bg-[#333333] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs font-bold text-[#071b3a] mb-1.5"
      >
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>

      <input
        id={name}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="auth-input cursor-text"
        required={required}
      />
    </div>
  );
}