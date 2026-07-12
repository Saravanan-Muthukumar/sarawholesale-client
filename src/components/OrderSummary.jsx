import { forwardRef, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:9000";

const OrderSummary = forwardRef(function OrderSummary(
  {
    totalItems = 0,
    subtotal = 0,
    deliveryCharge = 0,
    voucherCode = "",
    discountPercent = 0,
    refreshCart,
    actionLabel = "Continue",
    loadingLabel = "Processing...",
    loading = false,
    disabled = false,
    onAction,
    showDeliveryMessage = false,
    showMinimumOrderMessage = false,
    minimumOrder = 20,
    freeDeliveryThreshold = 40,

    deliveryLabel = "Delivery",
  },
  ref
) {
  const [enteredVoucher, setEnteredVoucher] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [voucherSuccess, setVoucherSuccess] = useState(false);

  const safeSubtotal = Number(subtotal || 0);
const safeDiscountPercent = Number(discountPercent || 0);

const discountAmount = Number(
  (safeSubtotal * (safeDiscountPercent / 100)).toFixed(2)
);

const taxableTotal = Number(
  (safeSubtotal - discountAmount).toFixed(2)
);

const safeDeliveryCharge =
  taxableTotal >= freeDeliveryThreshold ? 0 : 5.95;

const vatAmount = Number(
  (taxableTotal * 0.2).toFixed(2)
);

const totalAmount = Number(
  (
    taxableTotal +
    safeDeliveryCharge +
    vatAmount
  ).toFixed(2)
);

const amountForFreeDelivery = Math.max(
  freeDeliveryThreshold - taxableTotal,
  0
);

const amountForMinimumOrder = Math.max(
  minimumOrder - safeSubtotal,
  0
);

  const handleRedeem = async () => {
    const code = enteredVoucher.trim().toUpperCase();

    if (!code || voucherLoading) return;

    try {
      setVoucherLoading(true);
      setVoucherMessage("");
      setVoucherSuccess(false);

      const response = await fetch(
        `${API_URL}/api/cart/redeem-voucher`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            voucherCode: code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setVoucherSuccess(false);
        setVoucherMessage(
          data.message || "Voucher could not be redeemed."
        );
        return;
      }

      setVoucherSuccess(true);
      setVoucherMessage(
        data.message || "Voucher applied successfully."
      );

      await refreshCart?.();
    } catch (error) {
      console.error("Voucher redemption error:", error);

      setVoucherSuccess(false);
      setVoucherMessage(
        "Unable to redeem voucher. Please try again."
      );
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleAction = () => {
    if (loading || disabled) return;
    onAction?.();
  };

  return (
    <>
      <h2 className="mb-5 text-xl font-bold text-[#071b3a]">
        Order summary
      </h2>

      <SummaryRow label="Items" value={totalItems} />

      <SummaryRow
        label="Subtotal"
        value={`£${safeSubtotal.toFixed(2)}`}
      />

      <SummaryRow
        label={deliveryLabel}
        value={
          safeDeliveryCharge === 0
            ? "FREE"
            : `£${safeDeliveryCharge.toFixed(2)}`
        }
        green={safeDeliveryCharge === 0}
      />

      {showDeliveryMessage && safeDeliveryCharge > 0 && (
        <p className="mb-3 text-xs text-blue-700">
          Add another{" "}
          <strong>
            £{amountForFreeDelivery.toFixed(2)}
          </strong>{" "}
          to qualify for <strong>FREE delivery</strong>.
        </p>
      )}

      {showDeliveryMessage && safeDeliveryCharge === 0 && (
        <p className="mb-3 text-xs font-semibold text-green-700">
          ✓ Your order qualifies for FREE delivery.
        </p>
      )}

      <div className="my-5 border-t border-[#edf1f7] pt-5">
        <p className="mb-2 text-sm font-semibold text-[#071b3a]">
          Voucher code
        </p>

        {voucherCode ? (
          <div className="border border-green-200 bg-green-50 p-3">
            <div className="flex justify-between gap-3 text-sm">
              <span className="font-semibold text-green-700">
                {voucherCode} applied
              </span>

              <span className="font-bold text-green-700">
                {safeDiscountPercent}% off
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex">
              <input
                type="text"
                value={enteredVoucher}
                onChange={(event) => {
                  setEnteredVoucher(
                    event.target.value.toUpperCase()
                  );

                  if (voucherMessage) {
                    setVoucherMessage("");
                  }
                }}
                placeholder="Enter voucher code"
                disabled={voucherLoading}
                className="h-11 min-w-0 flex-1 border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-green-700 disabled:bg-gray-100"
              />

              <button
                type="button"
                onClick={handleRedeem}
                disabled={
                  voucherLoading ||
                  !enteredVoucher.trim()
                }
                className="h-11 bg-green-700 px-4 text-sm font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
              >
                {voucherLoading
                  ? "Checking..."
                  : "Redeem"}
              </button>
            </div>

            {voucherMessage && (
              <p
                className={`mt-2 text-xs font-semibold ${
                  voucherSuccess
                    ? "text-green-700"
                    : "text-red-600"
                }`}
              >
                {voucherMessage}
              </p>
            )}
          </>
        )}
      </div>

      <SummaryRow
            label={
                safeDiscountPercent > 0
                ? `Voucher Discount (${safeDiscountPercent}%)`
                : "Voucher Discount"
            }
            value={`-£${discountAmount.toFixed(2)}`}
            green={discountAmount > 0}
            />

            <SummaryRow
            label="Taxable Total"
            value={`£${taxableTotal.toFixed(2)}`}
            />


            <SummaryRow
            label="VAT (20%)"
            value={`£${vatAmount.toFixed(2)}`}
            />

      <div className="mt-4 flex justify-between border-t border-[#edf1f7] pt-4 text-xl font-bold text-[#071b3a]">
        <span>Total incl. VAT</span>
        <span>£{totalAmount.toFixed(2)}</span>
      </div>

      {showMinimumOrderMessage &&
        safeSubtotal < minimumOrder && (
          <p className="mt-3 text-xs font-semibold text-gray-600">
            Please note our minimum order value is £
            {minimumOrder.toFixed(2)}. Add another{" "}
            <strong>
              £{amountForMinimumOrder.toFixed(2)}
            </strong>{" "}
            to checkout.
          </p>
        )}

      <button
        ref={ref}
        onClick={handleAction}
        disabled={disabled || loading}
        className={`mt-5 h-12 w-full text-sm font-bold transition ${
          disabled || loading
            ? "cursor-not-allowed bg-gray-300 text-gray-500"
            : "bg-green-700 text-white hover:bg-green-800"
        }`}
        type="button"
      >
        {loading ? loadingLabel : actionLabel}
      </button>
    </>
  );
});

export default OrderSummary;

function SummaryRow({ label, value, green = false }) {
  return (
    <div className="mb-3 flex justify-between text-sm text-[#3f4043]">
      <span className="font-semibold">{label}</span>

      <span
        className={`font-bold ${
          green
            ? "text-green-700"
            : "text-[#071b3a]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}