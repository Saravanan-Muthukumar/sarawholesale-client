import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function CartPage() {
  const { cartItems, updateCartItem, removeCartItem, requestOrder } = useCart();

  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const getImage = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  };

  const getLineTotal = (item) =>
    Number(item.quantity || 0) * Number(item.unit_price || 0);

  const subtotal = cartItems.reduce((sum, item) => sum + getLineTotal(item), 0);

  const totalItems = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const showNotification = (type, title, message, orderNumber) => {
    setNotification({
      type,
      title,
      message,
      orderNumber,
    });

    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleIncrease = async (item) => {
    await updateCartItem(
      item.cart_item_id || item.product_id,
      Number(item.quantity) + 1
    );
  };

  const handleDecrease = async (item) => {
    const newQty = Number(item.quantity) - 1;

    if (newQty <= 0) {
      await removeCartItem(item.cart_item_id || item.product_id);
      return;
    }

    await updateCartItem(item.cart_item_id || item.product_id, newQty);
  };

  const handleRemove = async (item) => {
    await removeCartItem(item.cart_item_id || item.product_id);
  };

  const handleRequestOrder = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const data = await requestOrder();

      showNotification(
        "success",
        "Order request submitted",
        "We have received your request. Our sales team will contact you shortly.",
        data.order_request_number
      );

      setTimeout(() => {
        navigate(`/orders/${data.order_request_number}`);
      }, 1800);
    } catch (error) {
      showNotification(
        "error",
        "Order request failed",
        error.message || "Failed to submit order request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-white border-t border-[#edf1f7] relative">
      {notification && (
        <div className="fixed top-5 right-5 z-50 w-[calc(100%-40px)] max-w-sm">
          <div
            className={`rounded-xl border shadow-lg bg-white p-4 ${
              notification.type === "success"
                ? "border-green-200"
                : "border-red-200"
            }`}
          >
            <div className="flex gap-3">
              {notification.type === "success" ? (
                <CheckCircle className="text-green-700 mt-0.5" size={22} />
              ) : (
                <AlertCircle className="text-red-600 mt-0.5" size={22} />
              )}

              <div className="flex-1">
                <p className="font-bold text-sm text-[#071b3a]">
                  {notification.title}
                </p>

                {notification.orderNumber && (
                  <p className="text-xs font-bold text-green-700 mt-1">
                    Order No: {notification.orderNumber}
                  </p>
                )}

                <p className="text-xs text-[#071b3a]/70 mt-1">
                  {notification.message}
                </p>
              </div>

              <button
                onClick={() => setNotification(null)}
                className="text-[#071b3a]/50 hover:text-[#071b3a] cursor-pointer"
                type="button"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 py-5">
        <div className="text-xs text-[#071b3a]/70 mb-3">
          Home <span className="mx-2">›</span> Your Cart
        </div>

        <h1 className="text-lg md:text-xl font-bold text-[#071b3a] mb-5">
          Your Cart ({totalItems} Items)
        </h1>

        {cartItems.length === 0 ? (
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            className="text-green-700 font-bold hover:underline cursor-pointer"
          >
            Continue Shopping
          </button>
        ) : (
          <div className="grid lg:grid-cols-[1fr_290px] gap-7">
            <div>
              <div className="hidden md:block border border-[#edf1f7] rounded-xl overflow-hidden">
                <table className="w-full text-xs text-[#071b3a]">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-[#edf1f7]">
                      <th className="text-left p-3 text-[11px] font-semibold">
                        Product
                      </th>
                      <th className="text-left p-3 text-[11px] font-semibold">
                        Quantity
                      </th>
                      <th className="text-left p-3 text-[11px] font-semibold">
                        Unit Price
                      </th>
                      <th className="text-left p-3 text-[11px] font-semibold">
                        Total
                      </th>
                      <th className="text-left p-3 text-[11px] font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {cartItems.map((item) => (
                      <tr
                        key={item.cart_item_id || item.product_id}
                        className="border-t border-[#edf1f7]"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {getImage(item.image_url) ? (
                              <img
                                src={getImage(item.image_url)}
                                alt={item.product_name}
                                className="w-14 h-14 object-contain"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-gray-100 rounded" />
                            )}

                            <div>
                              <p className="font-semibold text-sm">
                                {item.product_name}
                              </p>
                              <p className="text-[11px] text-[#071b3a]/60">
                                SKU: {item.sku}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <QtyBox
                            qty={item.quantity}
                            onMinus={() => handleDecrease(item)}
                            onPlus={() => handleIncrease(item)}
                            disabled={submitting}
                          />
                        </td>

                        <td className="p-3 font-semibold text-sm">
                          £{Number(item.unit_price || 0).toFixed(2)}
                        </td>

                        <td className="p-3 font-semibold text-sm">
                          £{getLineTotal(item).toFixed(2)}
                        </td>

                        <td className="p-3">
                          <button
                            onClick={() => handleRemove(item)}
                            disabled={submitting}
                            className="text-[#071b3a] hover:text-red-600 cursor-pointer disabled:opacity-50"
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.cart_item_id || item.product_id}
                    className="border border-[#edf1f7] rounded-xl p-3 shadow-sm"
                  >
                    <div className="flex gap-3">
                      {getImage(item.image_url) ? (
                        <img
                          src={getImage(item.image_url)}
                          alt={item.product_name}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded" />
                      )}

                      <div className="flex-1">
                        <p className="font-semibold text-sm text-[#071b3a]">
                          {item.product_name}
                        </p>
                        <p className="text-[11px] text-[#071b3a]/70">
                          SKU: {item.sku}
                        </p>
                        <p className="text-xs mt-1">
                          £{Number(item.unit_price || 0).toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <QtyBox
                        qty={item.quantity}
                        onMinus={() => handleDecrease(item)}
                        onPlus={() => handleIncrease(item)}
                        disabled={submitting}
                      />

                      <p className="font-semibold text-sm text-[#071b3a]">
                        £{getLineTotal(item).toFixed(2)}
                      </p>

                      <button
                        onClick={() => handleRemove(item)}
                        disabled={submitting}
                        className="text-[#071b3a] hover:text-red-600 cursor-pointer disabled:opacity-50"
                        type="button"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:flex justify-start mt-5">
                <button
                  onClick={() => navigate(-1)}
                  className="h-9 px-5 border border-[#e5eaf2] rounded-lg font-bold flex items-center gap-2 text-xs text-[#071b3a] cursor-pointer hover:bg-gray-50"
                  type="button"
                >
                  <ArrowLeft size={16} />
                  Continue Shopping
                </button>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="border border-[#edf1f7] rounded-xl p-5 shadow-sm">
                <h2 className="text-base font-bold text-[#071b3a] mb-4">
                  Order Summary
                </h2>

                <SummaryRow label="Items" value={totalItems} />
                <SummaryRow label="Subtotal" value={`£${subtotal.toFixed(2)}`} />
                <SummaryRow label="Delivery" value="FREE" green />

                <p className="text-[11px] text-[#071b3a]/70 mb-4">
                  Within 30 miles of Slough
                </p>

                <div className="border-t border-[#edf1f7] pt-4">
                  <SummaryRow label="VAT" value="" />
                  <p className="text-[11px] text-[#071b3a]/70">
                    Calculated at invoice stage
                  </p>
                </div>

                <div className="border-t border-[#edf1f7] mt-4 pt-4 flex justify-between font-bold text-lg text-[#071b3a]">
                  <span>Estimated Total</span>
                  <span>£{subtotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleRequestOrder}
                  disabled={submitting}
                  className="w-full h-10 bg-green-700 text-white rounded-lg font-bold text-sm mt-5 hover:bg-green-800 cursor-pointer transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  type="button"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Request Order"
                  )}
                </button>
              </div>

              <div className="hidden md:flex border border-[#edf1f7] rounded-xl p-4 gap-3 text-[#071b3a]">
                <ShieldCheck size={22} />
                <div>
                  <p className="font-bold text-sm">Secure & Trusted</p>
                  <p className="text-xs">Your information is safe with us.</p>
                </div>
              </div>

              <button
                onClick={() => navigate(-1)}
                className="md:hidden block w-full text-center font-bold text-sm text-[#071b3a] cursor-pointer"
                type="button"
              >
                Continue Shopping
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

function QtyBox({ qty, onMinus, onPlus, disabled }) {
  return (
    <div className="inline-flex h-9 border border-[#e5eaf2] rounded-lg overflow-hidden text-sm">
      <button
        onClick={onMinus}
        disabled={disabled}
        className="w-9 flex items-center justify-center hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
      >
        <Minus size={14} />
      </button>

      <div className="w-12 flex items-center justify-center border-x border-[#e5eaf2]">
        {qty}
      </div>

      <button
        onClick={onPlus}
        disabled={disabled}
        className="w-9 flex items-center justify-center hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
      >
        <Plus size={14} />
      </button>
    </div>
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