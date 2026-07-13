import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function VerifyEmailPage() {
  const { verifyEmail, resendCode } = useAuth();
  const email = localStorage.getItem("verifyEmail");

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("Email not found. Please register again.");
      return;
    }

    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);

      await verifyEmail({
        email,
        code,
      });

      localStorage.removeItem("verifyEmail");
      navigate("/business-details");
    } catch (err) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setMessage("");
    setError("");

    if (!email) {
      setError("Email not found. Please register again.");
      return;
    }

    try {
      setResending(true);

      await resendCode({
        email,
      });

      setMessage("Verification code sent again.");
    } catch (err) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="bg-white px-4 pt-4 pb-6 md:pt-6 md:pb-7">
      <section className="max-w-105 mx-auto">
        <div className="bg-white border border-gray-200 p-5 shadow-sm">
          <h1 className="text-[23px] md:text-[28px] font-bold text-[#071b3a] leading-tight mb-2">
            Verify Email
          </h1>

          <p className="text-[13px] text-[#071b3a]/80 mb-5">
            Enter the 6-digit verification code sent to your email.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-700">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit code"
              className="auth-input text-center text-xl tracking-[8px]"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-10 mt-4 font-bold text-white transition-colors ${
              loading
                ? "cursor-not-allowed bg-gray-400"
                : "cursor-pointer bg-black hover:bg-gray-800"
            }`}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={resending}
            className={`w-full h-10 mt-3 font-bold border transition-colors ${
              resending
                ? "cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400"
                : "cursor-pointer bg-white border-black text-black hover:bg-gray-100"
            }`}
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
        </div>
      </section>
    </main>
  );
}