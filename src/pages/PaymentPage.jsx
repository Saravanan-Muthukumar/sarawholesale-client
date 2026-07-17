import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
  } from "react";
  
  import { loadStripe } from "@stripe/stripe-js";
  import { Elements } from "@stripe/react-stripe-js";
  import { ArrowLeft, LockKeyhole } from "lucide-react";
  import { useNavigate } from "react-router-dom";
  
  import PaymentForm from "../components/PaymentForm";
  import { apiCreatePaymentIntent } from "../api/payments";
  
  const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  );
  
  export default function PaymentPage() {
    const navigate = useNavigate();
  
    const [clientSecret, setClientSecret] = useState("");
    const [paymentIntentId, setPaymentIntentId] =
      useState("");
  
    const [pendingOrderId, setPendingOrderId] =
      useState(null);
  
    const [orderNumber, setOrderNumber] = useState("");
    const [amount, setAmount] = useState(null);
    const [currency, setCurrency] = useState("gbp");
  
    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState("");
  
    const startedRef = useRef(false);
  
    const checkoutDetails = useMemo(() => {
      try {
        return JSON.parse(
          sessionStorage.getItem(
            "saraWholesaleCheckout"
          ) || "{}"
        );
      } catch {
        return {};
      }
    }, []);
  
    const hasCheckoutDetails = Boolean(
      checkoutDetails?.shipping_details?.email &&
        checkoutDetails?.shipping_details
          ?.address_line1 &&
        checkoutDetails?.shipping_details?.postcode
    );
  
    const loadPaymentIntent = useCallback(async () => {
      setNotice("");
      setLoading(true);
  
      try {
        if (!hasCheckoutDetails) {
          navigate("/checkout", {
            replace: true,
          });
  
          return;
        }
  
        const data = await apiCreatePaymentIntent(
          checkoutDetails
        );
  
        if (!data?.clientSecret) {
          throw new Error(
            "Payment client secret was not returned"
          );
        }
  
        setClientSecret(data.clientSecret);
  
        setPaymentIntentId(
          data.paymentIntentId || ""
        );
  
        setPendingOrderId(
          data.pendingOrderId || null
        );
  
        setOrderNumber(data.orderNumber || "");
        setAmount(data.amount ?? null);
        setCurrency(data.currency || "gbp");
      } catch (error) {
        if (error.status === 401) {
          setNotice(
            "Your session has expired. Please return to checkout."
          );
        } else {
          setNotice(
            error.message ||
              "We could not prepare the payment."
          );
        }
      } finally {
        setLoading(false);
      }
    }, [
      checkoutDetails,
      hasCheckoutDetails,
      navigate,
    ]);
  
    useEffect(() => {
      if (startedRef.current) return;
  
      startedRef.current = true;
      loadPaymentIntent();
    }, [loadPaymentIntent]);
  
    const options = useMemo(() => {
      if (!clientSecret) return null;
  
      return {
        clientSecret,
  
        appearance: {
          theme: "stripe",
  
          variables: {
            colorPrimary: "#111111",
            colorText: "#111111",
            colorDanger: "#C62828",
            borderRadius: "0px",
            fontFamily:
              "Inter, system-ui, sans-serif",
          },
  
          rules: {
            ".Input": {
              border: "1px solid #d1d5db",
              boxShadow: "none",
            },
  
            ".Input:focus": {
              border: "1px solid #111111",
              boxShadow: "none",
            },
  
            ".Label": {
              fontWeight: "600",
            },
          },
        },
  
        loader: "auto",
      };
    }, [clientSecret]);
  
    const formattedAmount =
      amount == null
        ? "—"
        : new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: currency.toUpperCase(),
          }).format(amount / 100);
  
    return (
      <main className="min-h-screen bg-[#f5f6f8] pb-28 lg:pb-10">
        <section className="mx-auto max-w-6xl px-3 py-4 sm:px-4 lg:py-8">
          <button
            type="button"
            onClick={() => navigate("/checkout")}
            className="mb-5 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-black hover:text-gray-600"
          >
            <ArrowLeft size={18} />
            Back to checkout
          </button>
  
          <div className="mb-5">
            <h1 className="text-2xl font-extrabold text-black lg:text-3xl">
              Secure payment
            </h1>
  
            <p className="mt-1 text-sm text-gray-600">
              Enter your payment information to complete
              your order.
            </p>
          </div>
  
          {notice && (
            <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {notice}
            </div>
          )}
  
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="border border-gray-200 bg-white p-4 sm:p-5">
              {loading ? (
                <PaymentSkeleton />
              ) : !clientSecret || !options ? (
                <div>
                  <p className="text-sm text-gray-700">
                    The payment form is currently
                    unavailable.
                  </p>
  
                  <button
                    type="button"
                    onClick={loadPaymentIntent}
                    className="mt-4 h-11 w-full cursor-pointer bg-black text-sm font-bold text-white hover:bg-gray-800"
                  >
                    Restart payment
                  </button>
                </div>
              ) : (
                <Elements
                  key={clientSecret}
                  stripe={stripePromise}
                  options={options}
                >
                  <PaymentForm
                    amount={amount}
                    currency={currency}
                    paymentIntentId={paymentIntentId}
                    pendingOrderId={pendingOrderId}
                    orderNumber={orderNumber}
                    onHardReset={loadPaymentIntent}
                  />
                </Elements>
              )}
            </div>
  
            <aside className="hidden lg:block">
              <div className="sticky top-5 space-y-4">
                <div className="border border-gray-200 bg-white p-5">
                  <h2 className="text-lg font-extrabold text-black">
                    Payment summary
                  </h2>
  
                  {orderNumber && (
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Order
                      </span>
  
                      <span className="font-bold text-black">
                        {orderNumber}
                      </span>
                    </div>
                  )}
  
                  <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                    <span className="font-bold text-black">
                      Total
                    </span>
  
                    <span className="text-xl font-extrabold text-black">
                      {formattedAmount}
                    </span>
                  </div>
                </div>
  
                <div className="flex gap-3 border border-gray-200 bg-white p-4">
                  <LockKeyhole
                    size={21}
                    className="shrink-0 text-black"
                  />
  
                  <div>
                    <p className="text-sm font-bold text-black">
                      Payment secured by Stripe
                    </p>
  
                    <p className="mt-1 text-xs leading-5 text-gray-600">
                      Sara Wholesale does not receive or
                      store your full card information.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    );
  }
  
  function PaymentSkeleton() {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-5 w-40 bg-gray-200" />
        <div className="h-12 bg-gray-200" />
        <div className="h-12 bg-gray-200" />
        <div className="h-12 bg-gray-200" />
        <div className="h-12 bg-gray-200" />
      </div>
    );
  }