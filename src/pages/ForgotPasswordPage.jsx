import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to send reset email");

      setMessage("Password reset email sent. Please check your inbox.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white px-4 py-12 flex items-start justify-center min-h-[65vh]">
      <section className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#071b3a] mb-2">
          Forgot Password
        </h1>

        <p className="text-sm text-gray-600 mb-5">
          Enter your email address and we will send a password reset link.
        </p>

        {message && (
          <div className="mb-3 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-3 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="auth-input"
            required
          />

          <button
            disabled={loading}
            className="w-full h-10 bg-green-700 text-white rounded-lg font-bold disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </section>
    </main>
  );
}