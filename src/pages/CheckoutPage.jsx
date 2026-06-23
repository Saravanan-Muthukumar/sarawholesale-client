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
import CategoryMenu from "../components/CategoryMenu";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { cartItems, requestOrder } = useCart();

  const bottomSubmitRef = useRef(null);

  const [details, setDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showStickySubmit, setShowStickySubmit] = useState(true);
  const [categories, setCategories] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

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
  }, [isLoggedIn, API_URL]);

  const customer = details || user;

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
    0
  );

  const vatAmount = subtotal * 0.2;
const totalAmount = subtotal + vatAmount;

  const totalItems = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const hasContactDetails = Boolean(customer?.email && customer?.phone);

  const hasDeliveryAddress = Boolean(
    customer?.address_line1 && customer?.city && customer?.postcode
  );

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

      if (!cartItems.length) {
        navigate("/cart");
        return;
      }

      if (!canSubmit) {
        goToDetails();
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
      <main className="bg-[#f4f6f9] min-h-screen border-t border-[#edf1f7] px-4 py-8">
        <section className="max-w-xl mx-auto bg-white border border-[#edf1f7] rounded-xl p-6 text-center shadow-sm">
          <AlertCircle className="mx-auto text-red-600 mb-3" size={30} />

          <h1 className="text-xl font-bold text-[#071b3a] mb-2">
            Login Required
          </h1>

          <p className="text-sm text-[#071b3a]/70 mb-5">
            Please login to confirm your delivery details and submit your order.
          </p>

          <button
            onClick={() => navigate("/login", { state: { from: "/checkout" } })}
            className="h-10 px-6 bg-green-700 text-white font-bold text-sm hover:bg-green-800"
            type="button"
          >
            Login to Continue
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[#f4f6f9] min-h-screen border-t border-[#edf1f7] pb-28 md:pb-0">
      <div className="hidden md:block mb-5">
        <CategoryMenu categories={categories} />
      </div>
      <section className="max-w-7xl mx-auto px-4 py-5">
        <div className="sticky top-0 z-30 bg-[#f4f6f9]/95 backdrop-blur py-3 -mx-4 px-4 mb-4 border-b border-[#e5eaf2] md:static md:bg-transparent md:border-0 md:p-0 md:mx-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-[#071b3a] hover:text-green-700"
          >
            <ArrowLeft size={18} />
            Previous page
          </button>
        </div>

        <div className="mb-5">
          <h1 className="text-xl md:text-2xl font-bold text-[#071b3a]">
            Checkout{" "}
            <span className="text-sm font-semibold">{totalItems} Items</span>
          </h1>

          <p className="text-xs text-[#071b3a]/70 mt-1">
            Please check your contact and delivery details before submitting your
            order request.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-[#edf1f7] rounded-xl p-6">
            <p className="font-semibold text-[#071b3a] mb-4">
              Your basket is empty.
            </p>

            <button
              onClick={() => navigate("/")}
              className="bg-green-700 text-white px-5 h-10 font-bold text-sm hover:bg-green-800"
              type="button"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_330px] gap-7">
            <div className="space-y-4">
              <div className="bg-white border border-[#edf1f7] rounded-xl overflow-hidden">
                <div className="bg-[#26343a] text-white px-4 py-3 flex justify-between text-sm font-bold">
                  <span>Your Details</span>
                  <span>{canSubmit ? "Ready" : "Incomplete"}</span>
                </div>

                <div className="p-4 md:p-5 space-y-4">
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
                    <p>
                      {customer?.address_line1 || "Address line 1 not added"}
                    </p>

                    {customer?.address_line2 && (
                      <p>{customer.address_line2}</p>
                    )}

                    <p>{customer?.city || "City not added"}</p>
                    <p>{customer?.postcode || "Postcode not added"}</p>
                  </DetailsCard>

                  {!canSubmit && (
                    <div className="border border-red-100 bg-red-50 p-4 text-xs text-red-700 font-semibold">
                      Please complete your contact and delivery details before
                      submitting your order.
                    </div>
                  )}

                  <Link
                    to="/cart"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#071b3a] hover:text-green-700"
                  >
                    <ArrowLeft size={15} />
                    Back to Cart
                  </Link>
                </div>
              </div>

              <div className="md:hidden bg-white border border-[#edf1f7] rounded-xl p-5">
                <OrderSummary
                  totalItems={totalItems}
                  subtotal={subtotal}
                  vatAmount={vatAmount}
                  totalAmount={totalAmount}
                  submitting={submitting}
                  onSubmit={handleSubmitOrder}
                  submitRef={bottomSubmitRef}
                />
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <div className="border border-[#edf1f7] rounded-xl p-5 shadow-sm bg-white">
                  <OrderSummary
                    totalItems={totalItems}
                    subtotal={subtotal}
                    vatAmount={vatAmount}
                    totalAmount={totalAmount}
                    submitting={submitting}
                    onSubmit={handleSubmitOrder}
                  />
                </div>

                <div className="border border-[#edf1f7] rounded-xl p-4 gap-3 text-[#071b3a] bg-white flex">
                  <ShieldCheck size={22} />

                  <div>
                    <p className="font-bold text-sm">Secure checkout</p>
                    <p className="text-xs">
                      Your order request is safely submitted.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>

      {cartItems.length > 0 && showStickySubmit && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#dfe5ee] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-[#071b3a]/60 font-semibold">
                Estimated Total
              </p>

              <p className="text-xl font-bold text-[#071b3a]">
                £{totalAmount.toFixed(2)}
              </p>
            </div>

            <p className="text-xs text-[#071b3a]/60 text-right">
              VAT £{vatAmount.toFixed(2)}
            </p>
          </div>

          <button
            onClick={() => {
              if (submitting) return;
              handleSubmitOrder();
            }}
            disabled={submitting}
            className="w-full h-12 bg-green-700 text-white font-bold text-sm hover:bg-green-800 disabled:opacity-70"
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
  vatAmount,
  totalAmount,
  submitting,
  onSubmit,
  submitRef,
}) {
  return (
    <>
      <h2 className="text-xl font-bold text-[#071b3a] mb-5">
        Order summary
      </h2>

      <SummaryRow label="Items" value={totalItems} />
      <SummaryRow label="Subtotal" value={`£${subtotal.toFixed(2)}`} />
      <SummaryRow label="VAT (20%)" value={`£${vatAmount.toFixed(2)}`} />
      <SummaryRow label="Estimated delivery charge" value="Free" green />

      <div className="border-t border-[#edf1f7] mt-4 pt-4 flex justify-between font-bold text-xl text-[#071b3a]">
        <span>Total incl. VAT</span>
        <span>£{totalAmount.toFixed(2)}</span>
      </div>

      <button
        ref={submitRef}
        onClick={() => {
          if (submitting) return;
          onSubmit();
        }}
        disabled={submitting}
        className="w-full h-12 bg-green-700 text-white font-bold text-sm mt-5 hover:bg-green-800 transition disabled:opacity-70"
        type="button"
      >
        {submitting ? "Submitting..." : "Submit Order Request"}
      </button>
    </>
  );
}

function DetailsCard({ title, icon, complete, onEdit, children }) {
  return (
    <div className="border border-[#edf1f7] bg-white p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-green-700">{icon}</span>
          <h2 className="text-sm font-bold text-[#071b3a]">{title}</h2>
        </div>

        <button
          onClick={onEdit}
          className="text-xs font-bold text-green-700 hover:text-green-800"
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
    <div className="flex justify-between mb-3 text-sm text-[#3f4043]">
      <span className="font-semibold">{label}</span>
      <span
        className={`font-bold ${
          green ? "text-green-700" : "text-[#071b3a]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}