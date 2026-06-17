import { useEffect, useState } from "react";
import { Loader2, Save, XCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function CustomerDetailsPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    business_name: "",
    company_number: "",
    vat_number: "",
    business_type: "",
    website: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postcode: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
const [searchParams] = useSearchParams();

const redirectTo = searchParams.get("redirect") || "/account/details";

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/api/business/details`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load details");
      }

      setForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        business_name: data.business_name || "",
        company_number: data.company_number || "",
        vat_number: data.vat_number || "",
        business_type: data.business_type || "",
        website: data.website || "",
        address_line1: data.address_line1 || "",
        address_line2: data.address_line2 || "",
        city: data.city || "",
        postcode: data.postcode || "",
      });
    } catch (err) {
      setError(err.message || "Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const res = await fetch(`${API_URL}/api/business/details`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save details");
      }

      setMessage("Customer details updated successfully.");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to save details");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#071b3a]/70">
        <Loader2 size={18} className="animate-spin" />
        Loading customer details...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#071b3a]">Customer Details</h1>

      <p className="text-sm text-[#071b3a]/70 mt-1">
        Update your contact, business and address details.
      </p>

      {message && (
        <div className="mt-5 border border-green-100 bg-green-50 text-green-700 rounded-xl p-4 text-sm font-semibold">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-5 border border-red-100 bg-red-50 text-red-700 rounded-xl p-4 text-sm font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <Section title="Contact Details">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
            />

            <Input
              label="Last Name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />

            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
        </Section>

        <Section title="Business Details">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Business Name"
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
            />

            <Input
              label="Company Number"
              name="company_number"
              value={form.company_number}
              onChange={handleChange}
            />

            <Input
              label="VAT Number"
              name="vat_number"
              value={form.vat_number}
              onChange={handleChange}
            />

            <Input
              label="Business Type"
              name="business_type"
              value={form.business_type}
              onChange={handleChange}
            />

            <Input
              label="Website"
              name="website"
              value={form.website}
              onChange={handleChange}
            />
          </div>
        </Section>

        <Section title="Address">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Address Line 1"
              name="address_line1"
              value={form.address_line1}
              onChange={handleChange}
            />

            <Input
              label="Address Line 2"
              name="address_line2"
              value={form.address_line2}
              onChange={handleChange}
            />

            <Input
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
            />

            <Input
              label="Postcode"
              name="postcode"
              value={form.postcode}
              onChange={handleChange}
            />
          </div>
        </Section>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-5 bg-green-700 text-white rounded-lg font-bold text-sm cursor-pointer hover:bg-green-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>

          <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={saving}
              className="h-10 px-5 border border-[#e5eaf2] rounded-lg font-bold text-sm text-[#071b3a] cursor-pointer hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <XCircle size={16} />
              Cancel
            </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border border-[#edf1f7] rounded-xl p-5">
      <h2 className="font-bold text-[#071b3a] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-[#071b3a]/70 mb-1">
        {label}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full h-10 border border-[#e5eaf2] rounded-lg px-3 text-sm text-[#071b3a] outline-none focus:border-green-700"
      />
    </label>
  );
}