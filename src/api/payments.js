const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:9000";

async function readResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return {};
}

export async function apiCreatePaymentIntent(
  checkoutDetails
) {
  const response = await fetch(
    `${API_URL}/api/payments/create-intent`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutDetails),
    }
  );

  const data = await readResponse(response);

  if (!response.ok) {
    const error = new Error(
      data.message || "Failed to start payment"
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

export async function apiConfirmPaymentOrder({
  paymentIntentId,
  pendingOrderId,
}) {
  const response = await fetch(
    `${API_URL}/api/payments/confirm-order`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentIntentId,
        pendingOrderId,
      }),
    }
  );

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Payment succeeded, but the order could not be loaded"
    );
  }

  return data;
}

export async function apiGetPaymentOrderStatus(
  paymentIntentId
) {
  const response = await fetch(
    `${API_URL}/api/payments/status/${encodeURIComponent(
      paymentIntentId
    )}`,
    {
      credentials: "include",
    }
  );

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to check payment status"
    );
  }

  return data;
}