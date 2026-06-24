import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("sara_cookie_consent");

    if (!consent) {
      setShow(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("sara_cookie_consent", "accepted");
    window.dispatchEvent(new Event("saraCookieAccepted"));
    setShow(false);
  };

  const necessaryOnly = () => {
    localStorage.setItem("sara_cookie_consent", "necessary");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-9999 bg-white border-t border-gray-200 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <h3 className="font-bold text-[#071b3a] text-sm mb-1">
            Cookies on SARA Wholesale
          </h3>

          <p className="text-sm text-gray-600 leading-6">
            We use necessary cookies to keep our website secure and to manage
            your account and shopping cart. We may also use optional cookies to
            improve our website. Read our{" "}
            <Link
              to="/cookie-policy"
              className="font-bold text-green-700 hover:text-green-800"
            >
              Cookie Policy
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={necessaryOnly}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-bold text-[#071b3a] hover:bg-gray-50"
          >
            Necessary Only
          </button>

          <button
            type="button"
            onClick={acceptCookies}
            className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-bold hover:bg-green-800"
          >
            Accept Optional Cookies
          </button>
        </div>
      </div>
    </div>
  );
}