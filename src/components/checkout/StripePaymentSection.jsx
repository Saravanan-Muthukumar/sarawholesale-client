import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  CreditCard,
  LockKeyhole,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../context/CartContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:9000";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

export default function StripePaymentSection({
  paymentData,
  totalAmount,
  disabled = false,
  onBeforePayment,
}) {
  const [clientSecret, setClientSecret] =
    useState("");

  const [paymentIntentId, setPaymentIntentId] =
    useState("");

  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setClientSecret("");
    setPaymentIntentId("");
    setOrderId(null);
    setError("");

    if (
      disabled ||
      !paymentData ||
      !totalAmount ||
      totalAmount <= 0
    ) {
      return;
    }

    let cancelled = false;

    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/payments/create-payment-intent`,
          {
            method: "POST",
            credentials: "include",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              ...paymentData,

              // Your backend should recalculate
              // the real amount from the basket.
              amount: Number(
                totalAmount.toFixed(2)
              ),

              currency: "gbp",
            }),
          }
        );

        const data = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to initialise payment."
          );
        }

        if (!data.clientSecret) {
          throw new Error(
            "Stripe client secret was not returned."
          );
        }

        if (!cancelled) {
          setClientSecret(data.clientSecret);

          setPaymentIntentId(
            data.paymentIntentId ||
              data.payment_intent_id ||
              data.id ||
              ""
          );

          setOrderId(
            data.orderId ||
              data.order_id ||
              null
          );
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.message ||
              "Unable to load payment form."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    createPaymentIntent();

    return () => {
      cancelled = true;
    };
  }, [
    disabled,
    paymentData,
    totalAmount,
  ]);

  const appearance = useMemo(
    () => ({
      theme: "stripe",

      variables: {
        borderRadius: "0px",
        fontFamily:
          "Inter, Arial, sans-serif",
      },

      rules: {
        ".Input": {
          border: "1px solid #d1d5db",
          boxShadow: "none",
        },

        ".Input:focus": {
          border: "1px solid #000000",
          boxShadow: "none",
        },

        ".Label": {
          fontWeight: "600",
          color: "#111827",
        },
      },
    }),
    []
  );

  return (
    <section className="border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
        <CreditCard size={19} />

        <div>
          <h2 className="text-base font-extrabold">
            Card payment
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            Secure payment powered by Stripe
          </p>
        </div>
      </div>

      <div className="p-4">
        {disabled && (
          <div className="border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
            Complete your delivery details to
            enable payment.
          </div>
        )}

        {!disabled && loading && (
          <div className="border border-gray-200 bg-gray-50 px-4 py-5 text-sm font-semibold">
            Loading secure payment form...
          </div>
        )}

        {error && (
          <div className="border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {!disabled &&
          !loading &&
          clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance,
              }}
            >
              <StripePaymentForm
                paymentData={paymentData}
                paymentIntentId={
                  paymentIntentId
                }
                orderId={orderId}
                totalAmount={totalAmount}
                onBeforePayment={
                  onBeforePayment
                }
              />
            </Elements>
          )}

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <LockKeyhole
            size={14}
            className="shrink-0"
          />

          <span>
            Your card details are securely
            processed by Stripe and are not stored
            on our server.
          </span>
        </div>
      </div>
    </section>
  );
}

function StripePaymentForm({
  paymentData,
  paymentIntentId,
  orderId,
  totalAmount,
  onBeforePayment,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const { clearCart } = useCart();

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] = useState("");

  const formId = "stripe-checkout-payment-form";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      if (onBeforePayment) {
        const valid =
          await onBeforePayment();

        if (!valid) {
          return;
        }
      }

      // Validates the Stripe Payment Element.
      const submitResult =
        await elements.submit();

      if (submitResult.error) {
        throw new Error(
          submitResult.error.message ||
            "Please check your payment details."
        );
      }

      const returnUrl =
        `${window.location.origin}` +
        `/payment-return${
          orderId
            ? `?orderId=${encodeURIComponent(
                orderId
              )}`
            : ""
        }`;

      const result =
        await stripe.confirmPayment({
          elements,

          confirmParams: {
            return_url: returnUrl,

            payment_method_data: {
              billing_details: {
                name: [
                  paymentData
                    ?.shipping_details
                    ?.first_name,
                  paymentData
                    ?.shipping_details
                    ?.last_name,
                ]
                  .filter(Boolean)
                  .join(" "),

                email:
                  paymentData
                    ?.shipping_details
                    ?.email || undefined,

                phone:
                  paymentData
                    ?.shipping_details
                    ?.phone || undefined,

                address: {
                  line1:
                    paymentData
                      ?.shipping_details
                      ?.address_line1 ||
                    undefined,

                  line2:
                    paymentData
                      ?.shipping_details
                      ?.address_line2 ||
                    undefined,

                  city:
                    paymentData
                      ?.shipping_details
                      ?.city || undefined,

                  postal_code:
                    paymentData
                      ?.shipping_details
                      ?.postcode ||
                    undefined,

                  country: "GB",
                },
              },
            },
          },

          redirect: "if_required",
        });

      if (result.error) {
        throw new Error(
          result.error.message ||
            "Payment could not be completed."
        );
      }

      const paymentIntent =
        result.paymentIntent;

      if (
        paymentIntent?.status ===
          "succeeded" ||
        paymentIntent?.status ===
          "processing"
      ) {
        const confirmResponse = await fetch(
          `${API_URL}/api/payments/confirm-order`,
          {
            method: "POST",
            credentials: "include",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              ...paymentData,

              order_id: orderId,

              payment_intent_id:
                paymentIntent.id ||
                paymentIntentId,

              payment_status:
                paymentIntent.status,
            }),
          }
        );

        const confirmData =
          await confirmResponse
            .json()
            .catch(() => ({}));

        if (!confirmResponse.ok) {
          throw new Error(
            confirmData.message ||
              "Payment succeeded, but the order could not be confirmed."
          );
        }

        if (clearCart) {
          await clearCart();
        }

        const orderNumber =
          confirmData.orderNumber ||
          confirmData.order_number ||
          confirmData.orderId ||
          orderId ||
          "";

        navigate(
          orderNumber
            ? `/order-success/${encodeURIComponent(
                orderNumber
              )}`
            : "/order-success",
          {
            replace: true,
          }
        );
      }
    } catch (paymentError) {
      setMessage(
        paymentError.message ||
          "Payment could not be completed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const buttonDisabled =
    !stripe ||
    !elements ||
    submitting;

  return (
    <>
      <form
        id={formId}
        onSubmit={handleSubmit}
      >
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />

        {message && (
          <div
            role="alert"
            className="mt-4 border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            {message}
          </div>
        )}

        {/* DESKTOP PAY BUTTON */}
        <button
          type="submit"
          disabled={buttonDisabled}
          className="mt-5 hidden h-12 w-full cursor-pointer items-center justify-center bg-black px-5 text-sm font-extrabold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 lg:flex"
        >
          {submitting
            ? "Processing payment..."
            : `Pay Now £${Number(
                totalAmount
              ).toFixed(2)}`}
        </button>
      </form>

      {/* MOBILE STICKY PAY BUTTON */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white p-3 shadow-[0_-4px_15px_rgba(0,0,0,0.10)] lg:hidden">
        <div className="mx-auto max-w-7xl">
          <button
            type="submit"
            form={formId}
            disabled={buttonDisabled}
            className="flex h-12 w-full cursor-pointer items-center justify-center bg-black px-5 text-sm font-extrabold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {submitting
              ? "Processing payment..."
              : `Pay Now £${Number(
                  totalAmount
                ).toFixed(2)}`}
          </button>
        </div>
      </div>
    </>
  );
}