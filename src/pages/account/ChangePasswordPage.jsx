import { useState } from "react";
import { Lock, Loader2, Save } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      if (form.new_password !== form.confirm_password) {
        throw new Error("New password and confirm password do not match");
      }

      if (form.new_password.length < 8) {
        throw new Error("New password must be at least 8 characters");
      }

      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          current_password: form.current_password,
          new_password: form.new_password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setMessage("Password updated successfully.");
      setForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#071b3a]">Change Password</h1>

      <p className="text-sm text-[#071b3a]/70 mt-1">
        Update your account password securely.
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

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-xl border border-[#edf1f7] rounded-xl p-5 space-y-4"
      >
        <div className="flex items-center gap-2 font-bold text-[#071b3a] mb-2">
          <Lock size={18} />
          Password Details
        </div>

        <Input
          label="Current Password"
          name="current_password"
          type="password"
          value={form.current_password}
          onChange={handleChange}
        />

        <Input
          label="New Password"
          name="new_password"
          type="password"
          value={form.new_password}
          onChange={handleChange}
        />

        <Input
          label="Confirm New Password"
          name="confirm_password"
          type="password"
          value={form.confirm_password}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={saving}
          className="h-10 px-5 bg-green-700 text-white rounded-lg font-bold text-sm cursor-pointer hover:bg-green-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save size={16} />
              Update Password
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function Input({ label, name, value, onChange, type }) {
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
        required
        className="w-full h-10 border border-[#e5eaf2] rounded-lg px-3 text-sm text-[#071b3a] outline-none focus:border-green-700"
      />
    </label>
  );
}