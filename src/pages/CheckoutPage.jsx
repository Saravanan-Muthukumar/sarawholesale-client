import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
} from "lucide-react";

import OrderSummary from
  "../components/OrderSummary";

import { useAuth } from
  "../context/AuthContext";

import { useCart } from
  "../context/CartContext";

import LoginPage from "./LoginPage";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:9000";

export default function CheckoutPage() {
  const navigate = useNavigate();

  const {
    user,
    isLoggedIn,
  } = useAuth();

  const {
    cartItems = [],
    voucherCode,
    discountPercent,
    refreshCart,
  } = useCart();

  const [details, setDetails] =
    useState(null);

  const [loadingDetails, setLoadingDetails] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  const [orderSuccess, setOrderSuccess] =
    useState(null);

  const isCustomerUser =
    isLoggedIn &&
    ["CUSTOMER", "ADMIN"].includes(
      user?.role
    );

  // =====================================
  // LOAD CUSTOMER DETAILS
  // =====================================

  useEffect(() => {
    const loadCheckoutDetails = async () => {
      if (!isLoggedIn) {
        setDetails(null);
        setLoadingDetails(false);
        return;
      }

      try {
        setLoadingDetails(true);

        const response = await fetch(
          `${API_URL}/api/business/details`,
          {
            credentials: "include",
          }
        );

        const data = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load account details"
          );
        }

        setDetails(data);
      } catch (error) {
        console.error(
          "Unable to load account details:",
          error
        );

        setDetails(null);
      } finally {
        setLoadingDetails(false);
      }
    };

    loadCheckoutDetails();
  }, [
    isLoggedIn,
    user?.user_id,
  ]);

  const customer =
    details || user;

  // =====================================
  // ORDER TOTALS
  // =====================================

  const subtotal = cartItems.reduce(
    (sum, item) => {
      const quantity = Number(
        item.quantity || 0
      );

      const unitPrice = Number(
        item.unit_price || 0
      );

      return (
        sum +
        quantity * unitPrice
      );
    },
    0
  );

  const totalItems = cartItems.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0),
    0
  );

  const discountAmount =
    subtotal *
    (
      Number(
        discountPercent || 0
      ) / 100
    );

  const taxableTotal = Math.max(
    subtotal - discountAmount,
    0
  );

  const deliveryCharge =
    taxableTotal >= 40
      ? 0
      : 5.95;

  const vatAmount =
    taxableTotal * 0.2;

  const totalAmount =
    taxableTotal +
    deliveryCharge +
    vatAmount;

  // =====================================
  // VALIDATION
  // =====================================

  const hasContactDetails = Boolean(
    customer?.email &&
      customer?.first_name &&
      customer?.last_name
  );

  const hasDeliveryAddress = Boolean(
    customer?.address_line1 &&
      customer?.city &&
      customer?.postcode
  );

  const canSubmit =
    cartItems.length > 0 &&
    isCustomerUser &&
    hasContactDetails &&
    hasDeliveryAddress &&
    !submitting;

  const goToDetails = () => {
    navigate(
      "/account/details?redirect=/checkout"
    );
  };

  const validateBeforeSubmit = () => {
    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          redirectTo: "/checkout",
        },
      });

      return false;
    }

    if (!isCustomerUser) {
      setSubmitError(
        "Please log in with a customer account."
      );

      return false;
    }

    if (!cartItems.length) {
      navigate("/cart");
      return false;
    }

    if (
      !hasContactDetails ||
      !hasDeliveryAddress
    ) {
      setSubmitError(
        "Please complete your contact details and delivery address."
      );

      goToDetails();

      return false;
    }

    const stockProblem =
      cartItems.find((item) => {
        const available = Number(
          item.stock_qty ??
            item.available_qty ??
            999999
        );

        return (
          Number(
            item.quantity || 0
          ) > available
        );
      });

    if (stockProblem) {
      const available = Number(
        stockProblem.stock_qty ??
          stockProblem.available_qty ??
          0
      );

      setSubmitError(
        `${stockProblem.product_name} has only ${available} available in stock. Please update your basket.`
      );

      return false;
    }

    return true;
  };

  // =====================================
  // SUBMIT ORDER
  // =====================================

  const submitOrder = async () => {
    setSubmitError("");

    const valid =
      validateBeforeSubmit();

    if (!valid) {
      return;
    }

    try {
      setSubmitting(true);

      const orderPayload = {
        voucher_code:
          voucherCode || "",

        checkout_type:
          "account",

        payment_method:
          "bank_transfer",

        payment_status:
          "pending",

        shipping_details: {
          email:
            customer?.email || "",

          phone:
            customer?.phone || "",

          first_name:
            customer?.first_name || "",

          last_name:
            customer?.last_name || "",

          business_name:
            customer?.business_name || "",

          address_line1:
            customer?.address_line1 || "",

          address_line2:
            customer?.address_line2 || "",

          city:
            customer?.city || "",

          postcode:
            customer?.postcode || "",
        },

        order_totals: {
          subtotal: Number(
            subtotal.toFixed(2)
          ),

          discount_amount: Number(
            discountAmount.toFixed(2)
          ),

          taxable_total: Number(
            taxableTotal.toFixed(2)
          ),

          delivery_charge: Number(
            deliveryCharge.toFixed(2)
          ),

          vat_amount: Number(
            vatAmount.toFixed(2)
          ),

          total_amount: Number(
            totalAmount.toFixed(2)
          ),
        },

        items: cartItems.map(
          (item) => ({
            product_id:
              item.product_id,

            product_name:
              item.product_name,

            sku:
              item.sku || "",

            quantity: Number(
              item.quantity || 0
            ),

            unit_price: Number(
              item.unit_price || 0
            ),

            line_total: Number(
              (
                Number(
                  item.quantity || 0
                ) *
                Number(
                  item.unit_price || 0
                )
              ).toFixed(2)
            ),
          })
        ),
      };

      const response = await fetch(
        `${API_URL}/api/orders/request`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            orderPayload
          ),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit your order."
        );
      }

      const orderNumber =
        data.order_number ||
        data.orderNumber ||
        data.order_request_no ||
        data.order?.order_number ||
        data.order?.orderNumber ||
        "";

      setOrderSuccess({
        orderNumber,
        message:
          data.message ||
          "Your order has been submitted successfully.",
      });

      if (
        typeof refreshCart ===
        "function"
      ) {
        await refreshCart();
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Order submission failed:",
        error
      );

      setSubmitError(
        error.message ||
          "Unable to submit your order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================
  // LOADING
  // =====================================

  if (loadingDetails) {
    return (
      <main className="min-h-screen bg-[#f4f6f9] px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold">
            Loading checkout...
          </p>
        </div>
      </main>
    );
  }

  // =====================================
  // LOGIN REQUIRED
  // =====================================

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#f4f6f9] pb-10">
        <section className="mx-auto max-w-7xl px-4 py-5">
          <button
            type="button"
            onClick={() =>
              navigate("/cart")
            }
            className="mb-5 inline-flex cursor-pointer items-center gap-2 text-sm font-bold hover:text-gray-600"
          >
            <ArrowLeft size={18} />
            Back to basket
          </button>

          <div className="mx-auto max-w-5xl">
            <div className="mb-5">
              <h1 className="text-2xl font-bold md:text-3xl">
                Login to checkout
              </h1>

              <p className="mt-1 text-sm text-gray-600">
                Please log in or create a
                business account to place an
                order.
              </p>
            </div>

            <LoginPage
              redirectTo="/checkout"
              compact
            />
          </div>
        </section>
      </main>
    );
  }

  // =====================================
  // INVALID ROLE
  // =====================================

  if (!isCustomerUser) {
    return (
      <main className="min-h-screen bg-[#f4f6f9] px-4 py-10">
        <div className="mx-auto max-w-3xl border border-red-100 bg-white p-6">
          <h1 className="text-xl font-extrabold">
            Customer account required
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Please use a customer account
            to complete checkout.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="mt-5 h-11 cursor-pointer bg-black px-5 text-sm font-bold text-white hover:bg-gray-800"
          >
            Return home
          </button>
        </div>
      </main>
    );
  }

  // =====================================
  // ORDER SUCCESS
  // =====================================

  if (orderSuccess) {
    return (
      <OrderSubmittedPage
        orderNumber={
          orderSuccess.orderNumber
        }
        navigate={navigate}
      />
    );
  }

  // =====================================
  // CHECKOUT
  // =====================================

  return (
    <main className="min-h-screen bg-[#f4f6f9] pb-28 lg:pb-10">
      <section className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:py-7">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex cursor-pointer items-center gap-2 text-sm font-bold hover:text-gray-600"
        >
          <ArrowLeft size={18} />
          Previous page
        </button>

        <div className="mb-5">
          <h1 className="text-2xl font-extrabold lg:text-3xl">
            Submit order{" "}
            <span className="text-sm font-semibold">
              {totalItems} Items
            </span>
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Check your delivery details
            and submit your order request.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <EmptyBasket
            navigate={navigate}
          />
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* LEFT COLUMN */}

            <div className="min-w-0 space-y-4">
              <CompactCustomerDetails
                customer={customer}
                hasContactDetails={
                  hasContactDetails
                }
                hasDeliveryAddress={
                  hasDeliveryAddress
                }
                onEdit={goToDetails}
              />

              {!canSubmit &&
                (
                  !hasContactDetails ||
                  !hasDeliveryAddress
                ) && (
                  <div className="border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                    Please complete your
                    name, email and delivery
                    address before submitting
                    your order.
                  </div>
                )}

              <CartItemsSection
                cartItems={cartItems}
              />

              <div className="border border-gray-200 bg-white p-4 lg:hidden">
                <MobileOrderBreakdown
                  totalItems={totalItems}
                  subtotal={subtotal}
                  discountAmount={
                    discountAmount
                  }
                  taxableTotal={
                    taxableTotal
                  }
                  deliveryCharge={
                    deliveryCharge
                  }
                  vatAmount={vatAmount}
                  totalAmount={
                    totalAmount
                  }
                  voucherCode={
                    voucherCode
                  }
                />
              </div>

              <SubmitOrderSection
                canSubmit={canSubmit}
                submitting={submitting}
                submitError={
                  submitError
                }
                onSubmit={submitOrder}
              />

              <Link
                to="/cart"
                className="flex h-12 items-center justify-center gap-2 border border-gray-200 bg-white text-sm font-bold hover:bg-gray-50"
              >
                <ArrowLeft size={17} />
                Back to basket
              </Link>
            </div>

            {/* RIGHT COLUMN */}

            <aside className="hidden lg:block">
              <div className="sticky top-5 space-y-4">
                <div className="border border-gray-200 bg-white p-5 shadow-sm">
                  <OrderSummary
                    totalItems={
                      totalItems
                    }
                    subtotal={subtotal}
                    deliveryCharge={
                      deliveryCharge
                    }
                    voucherCode={
                      voucherCode
                    }
                    discountPercent={
                      discountPercent
                    }
                    vatAmount={
                      vatAmount
                    }
                    totalAmount={
                      totalAmount
                    }
                    showAction={false}
                    deliveryLabel="Delivery charge"
                  />
                </div>

                <button
                  type="button"
                  onClick={submitOrder}
                  disabled={!canSubmit}
                  className="flex h-12 w-full cursor-pointer items-center justify-center bg-black px-5 text-sm font-extrabold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {submitting
                    ? "Submitting order..."
                    : "Submit Order"}
                </button>
              </div>
            </aside>
          </div>
        )}
      </section>

      {/* MOBILE FIXED BUTTON */}

      {cartItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">
                Order total
              </p>

              <p className="text-lg font-extrabold">
                £{totalAmount.toFixed(2)}
              </p>
            </div>

            <button
              type="button"
              onClick={submitOrder}
              disabled={!canSubmit}
              className="h-12 min-w-[165px] cursor-pointer bg-black px-5 text-sm font-extrabold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {submitting
                ? "Submitting..."
                : "Submit Order"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// =====================================
// CUSTOMER DETAILS
// =====================================

function CompactCustomerDetails({
  customer,
  hasContactDetails,
  hasDeliveryAddress,
  onEdit,
}) {
  const complete =
    hasContactDetails &&
    hasDeliveryAddress;

  return (
    <section className="border border-gray-200 bg-white">
      <div className="flex items-start gap-3 p-4">
        <MapPin
          size={20}
          className="mt-0.5 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold">
              Delivery details
            </h2>

            {complete ? (
              <CheckCircle
                size={15}
                className="text-green-700"
              />
            ) : (
              <AlertCircle
                size={15}
                className="text-gray-500"
              />
            )}
          </div>

          <p className="mt-2 text-sm font-bold">
            {customer?.first_name || ""}{" "}
            {customer?.last_name || ""}
          </p>

          {customer?.business_name && (
            <p className="mt-0.5 text-xs text-gray-600">
              {customer.business_name}
            </p>
          )}

          <p className="mt-1 text-sm leading-5 text-gray-600">
            {customer?.address_line1 ||
              "Delivery address not added"}

            {customer?.address_line2
              ? `, ${customer.address_line2}`
              : ""}

            {customer?.city
              ? `, ${customer.city}`
              : ""}

            {customer?.postcode
              ? `, ${customer.postcode}`
              : ""}
          </p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Mail size={13} />

              {customer?.email ||
                "Email not added"}
            </span>

            {customer?.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone size={13} />
                {customer.phone}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 cursor-pointer text-xs font-bold underline hover:text-gray-600"
        >
          Edit
        </button>
      </div>
    </section>
  );
}

// =====================================
// SUBMIT ORDER SECTION
// =====================================

function SubmitOrderSection({
  canSubmit,
  submitting,
  submitError,
  onSubmit,
}) {
  return (
    <section className="border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
        <FileText size={19} />

        <h2 className="text-base font-extrabold">
          What happens next?
        </h2>
      </div>

      <div className="p-4">
        <ol className="space-y-3 text-sm leading-6 text-gray-700">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
              1
            </span>

            <span>
              Submit your order for review
              and processing.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
              2
            </span>

            <span>
              Your invoice will be sent
              to your registered email
              address.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
              3
            </span>

            <span>
              If credit terms have been
              agreed, your order will be
              dispatched according to your
              agreed credit terms.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
              4
            </span>

            <span>
              If credit terms have not
              been agreed, your order will
              be dispatched after payment
              has been received.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
              5
            </span>

            <span>
              Our bank account details
              will be provided on your
              invoice.
            </span>
          </li>
        </ol>

        <div className="mt-4 border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-900">
          Please use your invoice number
          as the payment reference when
          making a bank transfer.
        </div>

        {submitError && (
          <div className="mt-4 border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {submitError}
          </div>
        )}

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="mt-5 hidden h-12 w-full cursor-pointer items-center justify-center bg-black px-5 text-sm font-extrabold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 lg:flex"
        >
          {submitting
            ? "Submitting order..."
            : "Submit Order"}
        </button>

        <p className="mt-3 text-center text-xs text-gray-500">
          No online payment is taken when
          you submit this order.
        </p>
      </div>
    </section>
  );
}

// =====================================
// CART ITEMS
// =====================================

function CartItemsSection({
  cartItems,
}) {
  return (
    <section className="border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
        <ShoppingBag size={19} />

        <h2 className="text-base font-extrabold">
          Cart items ({cartItems.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-200 px-4">
        {cartItems.map((item) => {
          const image =
            item.image_url ||
            item.main_image ||
            item.product_image ||
            "";

          const imageUrl =
            image &&
            !image.startsWith("http")
              ? `${API_URL}${image}`
              : image;

          const quantity = Number(
            item.quantity || 0
          );

          const unitPrice = Number(
            item.unit_price || 0
          );

          return (
            <div
              key={
                item.cart_item_id ||
                item.product_id ||
                item.sku
              }
              className="flex gap-3 py-4"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-gray-200 bg-white">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={
                      item.product_name ||
                      "Product"
                    }
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <ShoppingBag
                    size={22}
                    className="text-gray-400"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-bold">
                  {item.product_name}
                </p>

                {item.unit && (
                  <p className="mt-0.5 text-xs text-gray-500">
                    {item.unit}
                  </p>
                )}

                <p className="mt-1 text-xs text-gray-600">
                  Qty: {quantity} × £
                  {unitPrice.toFixed(2)}
                </p>
              </div>

              <p className="shrink-0 self-center text-sm font-extrabold">
                £
                {(
                  quantity *
                  unitPrice
                ).toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// =====================================
// MOBILE ORDER SUMMARY
// =====================================

function MobileOrderBreakdown({
  totalItems,
  subtotal,
  discountAmount,
  taxableTotal,
  deliveryCharge,
  vatAmount,
  totalAmount,
  voucherCode,
}) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-extrabold">
        Order summary
      </h2>

      <SummaryRow
        label="Items"
        value={totalItems}
      />

      <SummaryRow
        label="Subtotal"
        value={`£${subtotal.toFixed(2)}`}
      />

      <SummaryRow
        label="Delivery charge"
        value={
          deliveryCharge === 0
            ? "FREE"
            : `£${deliveryCharge.toFixed(
                2
              )}`
        }
        free={
          deliveryCharge === 0
        }
      />

      <div className="my-4 border-t border-gray-200" />

      <SummaryRow
        label="Voucher code"
        value={
          voucherCode ||
          "Not applied"
        }
      />

      <SummaryRow
        label="Voucher discount"
        value={`-£${discountAmount.toFixed(
          2
        )}`}
      />

      <SummaryRow
        label="Taxable total"
        value={`£${taxableTotal.toFixed(
          2
        )}`}
      />

      <SummaryRow
        label="VAT (20%)"
        value={`£${vatAmount.toFixed(2)}`}
      />

      <div className="my-4 border-t border-gray-200" />

      <SummaryRow
        label="Total"
        value={`£${totalAmount.toFixed(
          2
        )}`}
        strong
      />
    </div>
  );
}

function SummaryRow({
  label,
  value,
  free = false,
  strong = false,
}) {
  return (
    <div
      className={`mb-3 flex justify-between gap-4 ${
        strong
          ? "text-base"
          : "text-sm"
      }`}
    >
      <span
        className={
          strong
            ? "font-extrabold"
            : "text-gray-700"
        }
      >
        {label}
      </span>

      <span
        className={`font-bold ${
          free
            ? "text-green-700"
            : "text-black"
        } ${
          strong
            ? "text-lg font-extrabold"
            : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// =====================================
// SUCCESS PAGE
// =====================================

function OrderSubmittedPage({
  orderNumber,
  navigate,
}) {
  return (
    <main className="min-h-screen bg-[#f4f6f9] px-4 py-10">
      <div className="mx-auto max-w-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle
            size={30}
            className="text-green-700"
          />
        </div>

        <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">
          Order submitted successfully
        </h1>

        {orderNumber && (
          <p className="mt-3 text-sm text-gray-600">
            Order reference:{" "}
            <span className="font-extrabold text-black">
              {orderNumber}
            </span>
          </p>
        )}

        <div className="mt-6 border border-gray-200 bg-gray-50 p-4">
          <h2 className="font-extrabold">
            What happens next?
          </h2>

          <div className="mt-3 space-y-3 text-sm leading-6 text-gray-700">
            <p>
              We will review and process
              your order. Your invoice
              will be sent to your
              registered email address.
            </p>

            <p>
              If credit terms have been
              agreed, your order will be
              dispatched according to
              those terms.
            </p>

            <p>
              If credit terms have not
              been agreed, payment will
              be required before dispatch.
            </p>

            <p>
              Our bank account details
              will be included on your
              invoice.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              navigate("/my-orders")
            }
            className="h-12 cursor-pointer bg-black px-6 text-sm font-bold text-white hover:bg-gray-800"
          >
            View my orders
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="h-12 cursor-pointer border border-gray-300 bg-white px-6 text-sm font-bold hover:bg-gray-50"
          >
            Continue shopping
          </button>
        </div>
      </div>
    </main>
  );
}

// =====================================
// EMPTY BASKET
// =====================================

function EmptyBasket({
  navigate,
}) {
  return (
    <div className="border border-gray-200 bg-white p-6">
      <p className="mb-4 font-semibold">
        Your basket is empty.
      </p>

      <button
        type="button"
        onClick={() =>
          navigate("/")
        }
        className="h-11 cursor-pointer bg-black px-5 text-sm font-bold text-white hover:bg-gray-800"
      >
        Continue shopping
      </button>
    </div>
  );
}