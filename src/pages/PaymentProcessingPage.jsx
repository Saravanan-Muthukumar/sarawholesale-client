import { useEffect, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import { apiGetPaymentOrderStatus } from "../api/payments";

export default function PaymentProcessingPage() {
  const [searchParams] = useSearchParams();

  const paymentIntentId =
    searchParams.get("paymentIntentId");

  const [message, setMessage] = useState(
    "Your payment is being processed."
  );

  const [orderNumber, setOrderNumber] =
    useState("");

  useEffect(() => {
    if (!paymentIntentId) {
      setMessage(
        "Payment reference was not found."
      );

      return;
    }

    let active = true;
    let attempts = 0;

    const checkStatus = async () => {
      try {
        attempts += 1;

        const data =
          await apiGetPaymentOrderStatus(
            paymentIntentId
          );

        if (!active) return;

        if (data.paymentStatus === "paid") {
          setOrderNumber(
            data.orderNumber ||
              data.order_request_number ||
              ""
          );

          setMessage(
            "Your payment has been confirmed."
          );

          return;
        }

        if (
          data.paymentStatus === "failed"
        ) {
          setMessage(
            "The payment failed. Please return to checkout and try again."
          );

          return;
        }

        if (attempts < 10) {
          window.setTimeout(
            checkStatus,
            3000
          );
        } else {
          setMessage(
            "Your payment is still processing. You can check your orders shortly."
          );
        }
      } catch {
        if (!active) return;

        setMessage(
          "We could not check the payment status. Please check your orders shortly."
        );
      }
    };

    checkStatus();

    return () => {
      active = false;
    };
  }, [paymentIntentId]);

  return (
    <main className="min-h-screen bg-[#f5f6f8] px-4 py-12">
      <div className="mx-auto max-w-lg border border-gray-200 bg-white p-6 text-center">
        <h1 className="text-xl font-extrabold text-black">
          Payment processing
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          {message}
        </p>

        <div className="mt-6">
          {orderNumber ? (
            <Link
              to={`/order-success/${encodeURIComponent(
                orderNumber
              )}`}
              className="inline-flex h-11 items-center justify-center bg-black px-5 text-sm font-bold text-white hover:bg-gray-800"
            >
              View order
            </Link>
          ) : (
            <Link
              to="/my-orders"
              className="inline-flex h-11 items-center justify-center bg-black px-5 text-sm font-bold text-white hover:bg-gray-800"
            >
              View my orders
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}