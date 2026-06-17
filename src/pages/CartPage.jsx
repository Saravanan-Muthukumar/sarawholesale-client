import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShieldCheck } from "lucide-react";
import { useCart } from "../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function CartPage() {
  const { cartItemCount, cartItems, updateCartItem, removeCartItem } = useCart();

  const navigate = useNavigate();
  const bottomCheckoutRef = useRef(null);

  const [updating, setUpdating] = useState(false);
  const [showMobileStickyCheckout, setShowMobileStickyCheckout] = useState(true);
  const [deleteItem, setDeleteItem] = useState(null);

  const getImage = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  };

  const getProductLink = (item) => {
    const slug = item.slug || item.product_slug;
    return slug ? `/product/${slug}` : "#";
  };

  const getLineTotal = (item) =>
    Number(item.quantity || 0) * Number(item.unit_price || 0);

  const subtotal = cartItems.reduce((sum, item) => sum + getLineTotal(item), 0);
  const totalItems = cartItemCount;

  useEffect(() => {
    if (!bottomCheckoutRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowMobileStickyCheckout(!entry.isIntersecting);
      },
      { threshold: 0.25 }
    );

    observer.observe(bottomCheckoutRef.current);

    return () => observer.disconnect();
  }, [cartItems.length]);

  const handleIncrease = async (item) => {
    setUpdating(true);
    await updateCartItem(
      item.cart_item_id || item.product_id,
      Number(item.quantity) + 1
    );
    setUpdating(false);
  };

  const handleDecrease = async (item) => {
    setUpdating(true);
    const newQty = Number(item.quantity) - 1;

    if (newQty <= 0) {
      setDeleteItem(item);
      setUpdating(false);
      return;
    }

    await updateCartItem(item.cart_item_id || item.product_id, newQty);
    setUpdating(false);
  };


  const confirmRemove = async () => {
    if (!deleteItem) return;
  
    setUpdating(true);
  
    await removeCartItem(
      deleteItem.cart_item_id || deleteItem.product_id
    );
  
    setUpdating(false);
    setDeleteItem(null);
  };

  return (
    <main className="bg-[#f4f6f9] min-h-screen border-t border-[#edf1f7] pb-28 md:pb-0">
      <section className="max-w-7xl mx-auto px-4 py-5">
        <div className="mb-4 md:mb-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-[#071b3a] hover:text-green-700"
          >
            <ArrowLeft size={18} />
            Previous page
          </button>
        </div>

        <div className="mb-6 md:mb-5">
          <h1 className="text-md md:text-xl font-bold text-[#071b3a]">
            Cart ({totalItems} Items)
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <button
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate("/");
            }}
            className="text-green-700 font-bold hover:underline cursor-pointer"
          >
            Continue Shopping
          </button>
        ) : (
          <div className="grid lg:grid-cols-[1fr_290px] gap-7">
            <div>
              <div className="hidden md:block border border-[#edf1f7] rounded-xl overflow-hidden bg-white">
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
                        className="border-t border-[#edf1f7] hover:bg-[#fbfcfe]"
                      >
                        <td className="p-3">
                          <Link
                            to={getProductLink(item)}
                            className="flex items-center gap-3 hover:text-green-700 transition cursor-pointer"
                          >
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
                          </Link>
                        </td>

                        <td className="p-3">
                          <QtyBox
                            qty={item.quantity}
                            onMinus={() => handleDecrease(item)}
                            onPlus={() => handleIncrease(item)}
                            disabled={updating}
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
                            onClick={() => setDeleteItem(item)}
                            disabled={updating}
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
                    className="bg-white border border-[#edf1f7] rounded-xl p-3 shadow-sm"
                  >
                    <Link
                      to={getProductLink(item)}
                      className="flex gap-3 hover:text-green-700 transition cursor-pointer"
                    >
                      {getImage(item.image_url) ? (
                        <img
                          src={getImage(item.image_url)}
                          alt={item.product_name}
                          className="w-14 h-14 object-contain"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded" />
                      )}

                      <div className="flex-1">
                        <p className="font-semibold text-sm text-[#071b3a] leading-snug">
                          {item.product_name}
                        </p>
                        <p className="text-[10px] text-[#071b3a]/60 mt-1">
                          SKU: {item.sku}
                        </p>
                        <p className="text-xs mt-1">
                          £{Number(item.unit_price || 0).toFixed(2)} each
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center justify-between mt-3">
                      <QtyBox
                        qty={item.quantity}
                        onMinus={() => handleDecrease(item)}
                        onPlus={() => handleIncrease(item)}
                        disabled={updating}
                      />

                      <p className="font-bold text-sm text-[#071b3a]">
                        £{getLineTotal(item).toFixed(2)}
                      </p>

                      <button
                        onClick={() => setDeleteItem(item)}
                        disabled={updating}
                        className="text-[#071b3a] hover:text-red-600 cursor-pointer disabled:opacity-50"
                        type="button"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="md:hidden mt-5 bg-white border border-[#edf1f7] rounded-xl p-5 shadow-sm">
                <OrderSummary
                  totalItems={totalItems}
                  subtotal={subtotal}
                  onCheckout={() => navigate("/checkout")}
                  checkoutRef={bottomCheckoutRef}
                />
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
              <div className="hidden md:block border border-[#edf1f7] rounded-xl p-5 shadow-sm bg-white">
                <OrderSummary
                  totalItems={totalItems}
                  subtotal={subtotal}
                  onCheckout={() => navigate("/checkout")}
                />
              </div>

              <div className="hidden md:flex border border-[#edf1f7] rounded-xl p-4 gap-3 text-[#071b3a] bg-white">
                <ShieldCheck size={22} />
                <div>
                  <p className="font-bold text-sm">Secure & Trusted</p>
                  <p className="text-xs">Your information is safe with us.</p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>

      {cartItems.length > 0 && showMobileStickyCheckout && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#dfe5ee] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-[#071b3a]/60 font-semibold">
                Estimated Total
              </p>
              <p className="text-xl font-bold text-[#071b3a]">
                £{subtotal.toFixed(2)}
              </p>
            </div>

            <p className="text-xs text-[#071b3a]/60 text-right">
              VAT at invoice stage
            </p>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="w-full h-12 bg-green-700 text-white rounded-lg font-bold text-sm"
            type="button"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
      {deleteItem && (
  <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
      <h3 className="text-lg font-bold text-[#071b3a]">
        Remove Item?
      </h3>

      <p className="text-sm text-gray-600 mt-3">
        Are you sure you want to remove:
      </p>

      <p className="font-semibold text-[#071b3a] mt-2">
        {deleteItem.product_name}
      </p>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setDeleteItem(null)}
          className="flex-1 h-11 border border-gray-300 rounded-lg font-semibold text-[#071b3a]"
        >
          Cancel
        </button>

        <button
          onClick={confirmRemove}
          className="flex-1 h-11 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
        >
          Remove
        </button>
      </div>
    </div>
  </div>
)}
    </main>
  );
}

function OrderSummary({ totalItems, subtotal, onCheckout, checkoutRef }) {
  return (
    <>
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
        ref={checkoutRef}
        onClick={onCheckout}
        className="w-full h-11 bg-green-700 text-white rounded-lg font-bold text-sm mt-5 hover:bg-green-800 cursor-pointer transition"
        type="button"
      >
        Proceed to Checkout
      </button>
    </>
  );
}

function QtyBox({ qty, onMinus, onPlus, disabled }) {
  return (
    <div className="inline-flex h-9 border border-[#e5eaf2] rounded-lg overflow-hidden text-sm bg-white">
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
    <div className="flex justify-between mb-3 text-[13px] text-[#3f4043]">
      <span>{label}</span>
      <span className={`font-bold ${green ? "text-green-700" : ""}`}>
        {value}
      </span>
    </div>
  );
}