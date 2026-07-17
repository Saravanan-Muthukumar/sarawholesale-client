import { useState } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";

import { apiConfirmPaymentOrder } from "../api/payments";
import { useCart } from "../context/CartContext";

export default function PaymentForm({
  amount,
  currency,
  pendingOrderId,
  orderNumber,
  onHardReset,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const cartContext = useCart();

  const clearCart =
    cartContext.clearCart ||
    cartContext.clear ||
    null;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const formattedAmount =
    amount == null
      ? ""
      : new Intl.NumberFormat("en-GB", {
          style: "currency",
          currency: String(
            currency || "gbp"
          ).toUpperCase(),
        }).format(amount / 100);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !stripe ||
      !elements ||
      submitting
    ) {
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      /*
       * Validate Payment Element fields before
       * attempting payment confirmation.
       */
      const submitResult = await elements.submit();

      if (submitResult.error) {
        setError(
          submitResult.error.message ||
            "Please check your payment details."
        );

        return;
      }

      const returnUrl = `${
        window.location.origin
      }/payment/return${
        pendingOrderId
          ? `?pendingOrderId=${encodeURIComponent(
              pendingOrderId
            )}`
          : ""
      }`;

      const {
        error: stripeError,
        paymentIntent,
      } = await stripe.confirmPayment({
        elements,

        confirmParams: {
          return_url: returnUrl,

          payment_method_data: {
            billing_details: {
              /*
               * Billing details can be collected by
               * Payment Element.
               *
               * Do not send or store card fields here.
               */
            },
          },
        },

        redirect: "if_required",
      });

      if (stripeError) {
        setError(
          stripeError.message ||
            "Your payment could not be completed."
        );

        return;
      }

      if (!paymentIntent) {
        setError(
          "Payment confirmation was not received."
        );

        return;
      }

      if (paymentIntent.status === "processing") {
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
        setError(
          `Payment status: ${paymentIntent.status}`
        );

        return;
      }

      /*
       * This endpoint verifies the PaymentIntent
       * from Stripe and returns the associated order.
       *
       * The webhook must still be the main method
       * that marks the order as paid.
       */
      const data =
        await apiConfirmPaymentOrder({
          paymentIntentId:
            paymentIntent.id,

          pendingOrderId,
        });

      if (typeof clearCart === "function") {
        await clearCart();
      }

      sessionStorage.removeItem(
        "saraWholesaleCheckout"
      );

      sessionStorage.removeItem(
        "guestCheckoutEmail"
      );

      sessionStorage.removeItem(
        "guestEmailVerified"
      );

      sessionStorage.removeItem(
        "guestCheckoutDetails"
      );

      const finalOrderNumber =
        data.orderNumber ||
        data.order_request_number ||
        orderNumber;

      if (!finalOrderNumber) {
        navigate("/my-orders", {
          replace: true,
        });

        return;
      }

      navigate(
        `/order-success/${encodeURIComponent(
          finalOrderNumber
        )}`,
        {
          replace: true,
        }
      );
    } catch (error) {
      setError(
        error?.message ||
          "The payment could not be completed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <h2 className="text-lg font-extrabold text-black">
          Card details
        </h2>

        <p className="mt-1 text-xs leading-5 text-gray-600">
          Your payment information is collected securely
          by Stripe.
        </p>
      </div>

      <PaymentElement
        options={{
          layout: "tabs",

          fields: {
            billingDetails: {
              name: "auto",
              email: "auto",
              phone: "never",
              address: "auto",
            },
          },

          wallets: {
            applePay: "auto",
            googlePay: "auto",
          },
        }}
      />

      {error && (
        <div
          role="alert"
          className="border border-red-200 bg-red-50 px-3 py-3 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <LockKeyhole
          size={14}
          className="shrink-0"
        />

        <span>
          Sara Wholesale does not store your card
          information.
        </span>
      </div>

      <div className="hidden lg:block">
        <button
          type="submit"
          disabled={
            !stripe ||
            !elements ||
            submitting
          }
          className="h-12 w-full cursor-pointer bg-[#C62828] px-4 text-sm font-bold text-white transition hover:bg-[#A61E1E] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          {submitting
            ? "Processing payment..."
            : formattedAmount
              ? `Pay ${formattedAmount}`
              : "Pay now"}
        </button>
      </div>

      {error && onHardReset && (
        <button
          type="button"
          onClick={onHardReset}
          disabled={submitting}
          className="hidden h-11 w-full cursor-pointer border border-gray-300 bg-white text-sm font-bold text-black hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 lg:block"
        >
          Restart payment
        </button>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-6px_20px_rgba(0,0,0,0.12)] lg:hidden">
        <button
          type="submit"
          disabled={
            !stripe ||
            !elements ||
            submitting
          }
          className="h-12 w-full cursor-pointer bg-[#C62828] px-4 text-sm font-bold text-white transition hover:bg-[#A61E1E] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          {submitting
            ? "Processing payment..."
            : formattedAmount
              ? `Pay ${formattedAmount}`
              : "Pay now"}
        </button>
      </div>
    </form>
  );
}