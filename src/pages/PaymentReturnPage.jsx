import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { loadStripe } from "@stripe/stripe-js";
import {
  apiConfirmPaymentOrder,
} from "../api/payments";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

export default function PaymentReturnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [message, setMessage] = useState(
    "Checking your payment..."
  );

  useEffect(() => {
    let active = true;

    const checkPayment = async () => {
      try {
        const clientSecret =
          searchParams.get(
            "payment_intent_client_secret"
          );

        const pendingOrderId =
          searchParams.get("pendingOrderId");

        if (!clientSecret) {
          throw new Error(
            "Payment information is missing."
          );
        }

        const stripe = await stripePromise;

        if (!stripe) {
          throw new Error(
            "Stripe could not be loaded."
          );
        }

        const {
          paymentIntent,
          error,
        } = await stripe.retrievePaymentIntent(
          clientSecret
        );

        if (error) {
          throw new Error(error.message);
        }

        if (!paymentIntent) {
          throw new Error(
            "Payment could not be found."
          );
        }

        if (
          paymentIntent.status === "processing"
        ) {
          if (!active) return;

          navigate(
            `/payment-processing?paymentIntentId=${encodeURIComponent(
              paymentIntent.id
            )}`,
            {
              replace: true,
            }
          );

          return;
        }

        if (
          paymentIntent.status !== "succeeded"
        ) {
          throw new Error(
            "The payment was not completed."
          );
        }

        const data =
          await apiConfirmPaymentOrder({
            paymentIntentId:
              paymentIntent.id,

            pendingOrderId,
          });

        sessionStorage.removeItem(
          "saraWholesaleCheckout"
        );

        const orderNumber =
          data.orderNumber ||
          data.order_request_number;

        if (!active) return;

        navigate(
          orderNumber
            ? `/order-success/${encodeURIComponent(
                orderNumber
              )}`
            : "/my-orders",
          {
            replace: true,
          }
        );
      } catch (error) {
        if (!active) return;

        setMessage(
          error.message ||
            "The payment could not be verified."
        );
      }
    };

    checkPayment();

    return () => {
      active = false;
    };
  }, [navigate, searchParams]);

  return (
    <main className="min-h-screen bg-[#f5f6f8] px-4 py-12">
      <div className="mx-auto max-w-lg border border-gray-200 bg-white p-6 text-center">
        <h1 className="text-xl font-extrabold text-black">
          Payment status
        </h1>

        <p className="mt-3 text-sm text-gray-600">
          {message}
        </p>
      </div>
    </main>
  );
}