import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  User,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { cartItems, requestOrder } = useCart();

  const bottomSubmitRef = useRef(null);

  const [details, setDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showStickySubmit, setShowStickySubmit] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) return;

    fetch(`${API_URL}/api/business/details`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load details");
        return res.json();
      })
      .then((data) => setDetails(data))
      .catch(() => setDetails(null));
  }, [isLoggedIn]);

  const customer = details || user;

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
    0
  );

  const deliveryFee = subtotal >= 20 ? 0 : 2;
  const estimatedTotal = subtotal + deliveryFee;

  const totalItems = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const hasContactDetails = customer?.email && customer?.phone;
  const hasDeliveryAddress =
    customer?.address_line1 && customer?.city && customer?.postcode;

  const canSubmit = isLoggedIn && hasContactDetails && hasDeliveryAddress;

  useEffect(() => {
    if (!bottomSubmitRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickySubmit(!entry.isIntersecting);
      },
      { threshold: 0.25 }
    );

    observer.observe(bottomSubmitRef.current);

    return () => observer.disconnect();
  }, [cartItems.length]);

  const goToDetails = () => {
    navigate("/account/details?redirect=/checkout");
  };

  const handleSubmitOrder = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      if (!isLoggedIn) {
        navigate("/login", { state: { from: "/checkout" } });
        return;
      }

      if (!canSubmit) {
        goToDetails();
        return;
      }

      if (!cartItems.length) {
        navigate("/cart");
        return;
      }

      const data = await requestOrder();
      navigate(`/order-success/${data.order_request_number}`);
    } catch (err) {
      alert(err.message || "Failed to submit order request");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="bg-white border-t border-[#edf1f7] px-4 py-8">
        <section className="max-w-xl mx-auto border border-[#edf1f7] rounded-xl p-6 text-center shadow-sm">
          <AlertCircle className="mx-auto text-red-600 mb-3" size={30} />

          <h1 className="text-xl font-bold text-[#071b3a] mb-2">
            Login Required
          </h1>

          <p className="text-sm text-[#071b3a]/70 mb-5">
            Please login to confirm your delivery details and submit your order.
          </p>

          <button
            onClick={() => navigate("/login", { state: { from: "/checkout" } })}
            className="h-10 px-6 bg-green-700 text-white rounded-lg font-bold text-sm"
            type="button"
          >
            Login to Continue
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-white border-t border-[#edf1f7] pb-28 md:pb-0">
      <section className="max-w-7xl mx-auto px-4 py-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#071b3a] hover:text-green-700"
        >
          <ArrowLeft size={18} />
          Previous page
        </button>

        <h1 className="text-lg md:text-xl font-bold text-[#071b3a] mb-1">
          Checkout
        </h1>

        <p className="text-xs text-[#071b3a]/70 mb-5">
          Please check your contact and delivery details before submitting your
          order request.
        </p>

        <div className="grid lg:grid-cols-[1fr_320px] gap-7">
          <div className="space-y-4">
            <DetailsCard
              title="Contact Details"
              icon={<User size={18} />}
              complete={hasContactDetails}
              onEdit={goToDetails}
            >
              <DetailRow
                icon={<User size={14} />}
                text={`${customer?.first_name || ""} ${
                  customer?.last_name || ""
                }`}
              />

              <DetailRow
                icon={<Building2 size={14} />}
                text={customer?.business_name || "Business name not added"}
              />

              <DetailRow
                icon={<Mail size={14} />}
                text={customer?.email || "Email not added"}
              />

              <DetailRow
                icon={<Phone size={14} />}
                text={customer?.phone || "Phone not added"}
              />
            </DetailsCard>

            <DetailsCard
              title="Delivery Address"
              icon={<MapPin size={18} />}
              complete={hasDeliveryAddress}
              onEdit={goToDetails}
            >
              <p>{customer?.address_line1 || "Address line 1 not added"}</p>
              {customer?.address_line2 && <p>{customer.address_line2}</p>}
              <p>{customer?.city || "City not added"}</p>
              <p>{customer?.postcode || "Postcode not added"}</p>
            </DetailsCard>

            {!canSubmit && (
              <div className="border border-red-100 bg-red-50 rounded-xl p-4 text-xs text-red-700">
                Please complete your contact and delivery details before
                submitting your order.
              </div>
            )}

            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#071b3a]"
            >
              <ArrowLeft size={15} />
              Back to Cart
            </Link>

            <div className="md:hidden border border-[#edf1f7] rounded-xl p-5 shadow-sm">
              <OrderSummary
                totalItems={totalItems}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                estimatedTotal={estimatedTotal}
                submitting={submitting}
                onSubmit={handleSubmitOrder}
                submitRef={bottomSubmitRef}
              />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="hidden md:block border border-[#edf1f7] rounded-xl p-5 shadow-sm">
              <OrderSummary
                totalItems={totalItems}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                estimatedTotal={estimatedTotal}
                submitting={submitting}
                onSubmit={handleSubmitOrder}
              />
            </div>

            <div className="border border-[#edf1f7] rounded-xl p-4 flex gap-3 text-[#071b3a]">
              <ShieldCheck size={22} />
              <div>
                <p className="font-bold text-sm">Secure & Trusted</p>
                <p className="text-xs">Your information is safe with us.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {cartItems.length > 0 && showStickySubmit && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#dfe5ee] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-[#071b3a]/60 font-semibold">
                Estimated Total
              </p>
              <p className="text-xl font-bold text-[#071b3a]">
                £{estimatedTotal.toFixed(2)}
              </p>
            </div>

            <p className="text-xs text-[#071b3a]/60 text-right">
              Delivery {deliveryFee === 0 ? "FREE" : "£2.00"}
            </p>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={submitting}
            className="w-full h-12 bg-green-700 text-white rounded-lg font-bold text-sm disabled:opacity-70"
            type="button"
          >
            {submitting ? "Submitting..." : "Submit Order Request"}
          </button>
        </div>
      )}
    </main>
  );
}

function OrderSummary({
  totalItems,
  subtotal,
  deliveryFee,
  estimatedTotal,
  submitting,
  onSubmit,
  submitRef,
}) {
  return (
    <>
      <h2 className="text-base font-bold text-[#071b3a] mb-4">
        Order Summary
      </h2>

      <SummaryRow label="Items" value={totalItems} />
      <SummaryRow label="Subtotal" value={`£${subtotal.toFixed(2)}`} />
      <SummaryRow
        label="Delivery"
        value={deliveryFee === 0 ? "FREE" : "£2.00"}
        green={deliveryFee === 0}
      />

      <p className="text-[11px] text-[#071b3a]/70 mb-4">
        Free delivery above £20. Below £20 delivery fee is £2.
      </p>

      <div className="border-t border-[#edf1f7] pt-4">
        <SummaryRow label="VAT" value="" />
        <p className="text-[11px] text-[#071b3a]/70">
          Calculated at invoice stage
        </p>
      </div>

      <div className="border-t border-[#edf1f7] mt-4 pt-4 flex justify-between font-bold text-lg text-[#071b3a]">
        <span>Estimated Total</span>
        <span>£{estimatedTotal.toFixed(2)}</span>
      </div>

      <button
        ref={submitRef}
        onClick={onSubmit}
        disabled={submitting}
        className="w-full h-11 bg-green-700 text-white rounded-lg font-bold text-sm mt-5 hover:bg-green-800 cursor-pointer transition disabled:opacity-70"
        type="button"
      >
        {submitting ? "Submitting..." : "Submit Order Request"}
      </button>
    </>
  );
}

function DetailsCard({ title, icon, complete, onEdit, children }) {
  return (
    <div className="border border-[#edf1f7] rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-green-700">{icon}</span>
          <h2 className="text-sm font-bold text-[#071b3a]">{title}</h2>
        </div>

        <button
          onClick={onEdit}
          className="text-xs font-bold text-green-700"
          type="button"
        >
          Edit
        </button>
      </div>

      <div className="text-xs text-[#071b3a]/75 leading-5">{children}</div>

      <div className="mt-3 text-[11px] flex items-center gap-1">
        {complete ? (
          <>
            <CheckCircle size={13} className="text-green-700" />
            <span className="text-green-700 font-semibold">
              Details complete
            </span>
          </>
        ) : (
          <>
            <AlertCircle size={13} className="text-red-600" />
            <span className="text-red-600 font-semibold">
              Details incomplete
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon, text }) {
  return (
    <p className="flex items-center gap-2">
      <span className="text-[#071b3a]/50">{icon}</span>
      {text}
    </p>
  );
}

function SummaryRow({ label, value, green }) {
  return (
    <div className="flex justify-between mb-3 text-[13px] text-[#071b3a]">
      <span>{label}</span>
      <span className={`font-bold ${green ? "text-green-700" : ""}`}>
        {value}
      </span>
    </div>
  );
}