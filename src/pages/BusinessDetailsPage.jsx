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

    setError("");
    setLoading(true);

    try {
      await saveBusinessDetails(form);

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to save business details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white px-4 pt-4 pb-6 md:pt-6 md:pb-7">
      <section className="max-w-225 mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-[23px] md:text-[28px] font-bold text-[#071b3a]">
            Business Details
          </h1>

          <p className="text-[13px] text-[#071b3a]/80 mt-1">
            Complete your trade account application
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Business Name *" name="business_name" value={form.business_name} onChange={handleChange} />
            <Input label="Company Number" name="company_number" value={form.company_number} onChange={handleChange} />
            <Input label="VAT Number" name="vat_number" value={form.vat_number} onChange={handleChange} />
            <Input label="Business Type" name="business_type" value={form.business_type} onChange={handleChange} />
            <Input label="Address Line 1 *" name="address_line1" value={form.address_line1} onChange={handleChange} />
            <Input label="City *" name="city" value={form.city} onChange={handleChange} />
            <Input label="Postcode *" name="postcode" value={form.postcode} onChange={handleChange} />
            <Input label="Website" name="website" value={form.website} onChange={handleChange} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full h-10 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Input({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#071b3a] mb-1.5">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="auth-input"
        required={label.includes("*")}
      />
    </div>
  );
}