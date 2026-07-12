import { useEffect, useState } from "react";
import { X } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function SubscribePopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const popupSeen = localStorage.getItem("subscribePopupSeen");

    if (popupSeen) return;

    const timer = setTimeout(() => {
      setOpen(true);
      localStorage.setItem("subscribePopupSeen", "true");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => {
    setOpen(false);
    localStorage.setItem("subscribePopupSeen", "true");
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setSuccess(false);
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const data = await response.json();

      setSuccess(response.ok);
      setMessage(
        data.message ||
          (response.ok
            ? "Your voucher has been sent."
            : "Unable to subscribe.")
      );

      if (response.ok) {
        setEmail("");

        setTimeout(() => {
          setOpen(false);
        }, 2500);
      }
    } catch {
      setSuccess(false);
      setMessage("Unable to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
      onClick={closePopup}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscribe-popup-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white p-6 text-gray-900 shadow-2xl"
      >
        <button
          type="button"
          onClick={closePopup}
          aria-label="Close subscription offer"
          className="absolute right-3 top-3 text-gray-500 transition hover:text-black"
        >
          <X size={22} />
        </button>

        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-600">
  New subscriber offer
</p>

<h2
  id="subscribe-popup-title"
  className="pr-8 text-2xl font-bold"
>
  Get 10% Off Your First Order
</h2>

<p className="mt-3 text-sm leading-6 text-gray-600">
  Subscribe to receive exclusive offers and we’ll email your
  <span className="font-semibold text-gray-900">
    {" "}10% discount code
  </span>.
</p>

<div className="my-4 flex items-center justify-between border border-gray-200 bg-gray-50 px-3 py-2">
  <span className="text-sm font-semibold text-gray-900">
    10% off your first order
  </span>

  <span className="whitespace-nowrap text-xs font-semibold text-red-600">
    One use only
  </span>

        </div>

        <form onSubmit={handleSubscribe} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setMessage("");
            }}
            placeholder="Enter your email address"
            autoComplete="email"
            required
            className="w-full border border-gray-300 px-3 py-3 text-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending voucher..." : "Email My £10 Voucher"}
          </button>
        </form>

        {message && (
          <p
            role="status"
            className={`mt-3 text-sm ${
              success ? "text-green-700" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <p className="mt-4 text-center text-xs text-gray-500">
          One voucher redemption per subscriber.
        </p>
      </div>
    </div>
  );
}