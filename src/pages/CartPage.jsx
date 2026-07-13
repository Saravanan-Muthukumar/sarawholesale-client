import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import OrderSummary from "../components/OrderSummary";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function CartPage() {
  const { cartItemCount, cartItems, updateCartItem, removeCartItem,voucherCode, discountPercent, loadCart, } = useCart();

  const navigate = useNavigate();
  const bottomCheckoutRef = useRef(null);
  const [categories, setCategories] = useState([]);

  const [updatingId, setUpdatingId] = useState(null);
  const [showMobileStickyCheckout, setShowMobileStickyCheckout] = useState(true);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [qtyWarnings, setQtyWarnings] = useState({});
  // const [editingQty, setEditingQty] = useState({});
  

  const getImage = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  };

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const getProductLink = (item) => {
    const slug = item.slug || item.product_slug;
    return slug ? `/product/${slug}` : "#";
  };

  const getItemId = (item) => item.cart_item_id || item.product_id;

  const getLineTotal = (item) =>
    Number(item.quantity || 0) * Number(item.unit_price || 0);
  const getUnit = (item) => item.unit || "Unit";

  const subtotal = cartItems.reduce(
    (sum, item) => sum + getLineTotal(item),
    0
  );
  
  const deliveryCharge = subtotal >= 40 ? 0 : 5.95;
  
  const vatAmount = subtotal * 0.2;
  
  // VAT is only on products (keep your current behaviour)
  const totalAmount = subtotal + deliveryCharge + vatAmount;
  
  const totalItems = cartItemCount;
  
  const canCheckout = subtotal >= 20;

  useEffect(() => {
    if (!bottomCheckoutRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowMobileStickyCheckout(!entry.isIntersecting),
      { threshold: 0.25 }
    );

    observer.observe(bottomCheckoutRef.current);
    return () => observer.disconnect();
  }, [cartItems.length]);

  const handleIncrease = async (item) => {
    const id = getItemId(item);
  
    const maxQty = Number(
      item.stock_qty ||
      item.available_qty ||
      item.qty_available ||
      item.quantity_available ||
      0
    );
  
    const currentQty = Number(item.quantity || 1);
  
    if (maxQty && currentQty >= maxQty) {
      setQtyWarnings((prev) => ({
        ...prev,
        [id]: `Only ${maxQty} available to add.`,
      }));
      return;
    }
  
    try {
      setUpdatingId(id);
      await updateCartItem(id, currentQty + 1);
  
      setQtyWarnings((prev) => ({
        ...prev,
        [id]: "",
      }));
    } catch (err) {
      setQtyWarnings((prev) => ({
        ...prev,
        [id]: `Only ${currentQty} available to add.`,
      }));
    } finally {
      setUpdatingId(null);
    }
  };
  const handleDecrease = async (item) => {
    const id = getItemId(item);
    const qty = Number(item.quantity || 1);
  
    if (qty <= 1) {
      setDeleteItemId(id);
      return;
    }
    // Clear warning when user reduces quantity
    setQtyWarnings((prev) => ({
      ...prev,
      [id]: "",
    }));
  
    try {
      setUpdatingId(id);
      await updateCartItem(id, qty - 1);
    } finally {
      setUpdatingId(null);
    }
  };
  const handleQtyInputChange = async (item, value) => {
    const id = getItemId(item);
    const cleanValue = value.replace(/\D/g, "");
  
    if (cleanValue === "") return;
  
    const availableQty = Number(item.stock_qty || item.available_qty || 999999);
    const newQty = Number(cleanValue);
  
    if (newQty <= 0) return;
  
    if (newQty > availableQty) {
      setQtyWarnings((prev) => ({
        ...prev,
        [id]: `Only ${availableQty} available to add.`,
      }));
    
      await updateCartItem(id, availableQty);
      return;
    }
  
    setUpdatingId(id);
    await updateCartItem(id, newQty);
    setUpdatingId(null);
  };

  return (
    <main className="bg-[#f7f7f7] min-h-screen border-t border-gray-200 pb-28 md:pb-0">

      <section className="max-w-7xl mx-auto px-4 py-5">
        <div className="sticky top-0 z-30 bg-[#f7f7f7]/95 backdrop-blur py-3 -mx-4 px-4 mb-4 border-b border-[#e5eaf2] md:static md:bg-transparent md:border-0 md:p-0 md:mx-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-[#071b3a] hover:text-black"
          >
            <ArrowLeft size={18} />
            Previous page
          </button>
        </div>

        <div className="mb-5">
          <h1 className="text-xl md:text-2xl font-bold text-[#071b3a]">
            My Basket <span className="text-sm font-semibold">{totalItems} Items</span>
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-gray-200  p-6">
            <p className="font-semibold text-[#071b3a] mb-4">
              Your basket is empty.
            </p>

            <button
              onClick={() => navigate("/")}
              className="bg-black text-white px-5 h-10 font-bold text-sm hover:bg-gray-800"
              type="button"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_330px] gap-7">
            <div className="space-y-4">
              <div className="bg-white border border-[#edf1f7] overflow-hidden">

                {cartItems.map((item) => {
                  const id = getItemId(item);
                  const isUpdating = updatingId === id;

                  return (
                    <div
                      key={id}
                      className="border-b border-gray-200 last:border-b-0 bg-white"
                    >
                      {deleteItemId === id ? (
                        <div className="p-4 md:p-5 bg-gray-100 min-h-38.75 flex flex-col justify-center">
                          <p className="font-semibold text-sm text-[#071b3a]">
                            Remove this item from your basket?
                          </p>

                          <div className="flex gap-3 mt-3">
                            <button
                              onClick={() => setDeleteItemId(null)}
                              className="h-10 px-5 border border-gray-300 font-semibold text-sm bg-white"
                              type="button"
                            >
                              Keep Item
                            </button>

                            <button
                              onClick={async () => {
                                setUpdatingId(id);
                                await removeCartItem(id);
                                setUpdatingId(null);
                                setDeleteItemId(null);
                              }}
                              className="h-10 px-5 bg-red-600 text-white font-semibold text-sm hover:bg-red-700"
                              type="button"
                            >
                              Remove Item
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 md:p-5">
                          <div className="grid grid-cols-[80px_1fr] md:grid-cols-[110px_1fr_120px] gap-4">
                            <Link to={getProductLink(item)}>
                              {getImage(item.image_url) ? (
                                <img
                                  src={getImage(item.image_url)}
                                  alt={item.product_name}
                                  className="w-20 h-20 md:w-24 md:h-24 object-contain bg-white"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-gray-100" />
                              )}
                            </Link>

                            <div>
                              <Link
                                to={getProductLink(item)}
                                className="font-bold text-sm md:text-base text-[#071b3a] hover:text-black leading-snug"
                              >
                                {item.product_name}
                              </Link>

                              <p className="text-xs text-gray-500 mt-1">
                                SKU: {item.sku || "N/A"}
                              </p>

                              <p className="text-xs mt-3 text-gray-700 font-semibold">
                                Available for delivery
                              </p>

                              <div className="grid grid-cols-2 gap-4 mt-3 md:hidden">
                                <div>
                                <p className="text-xs text-[#071b3a]/60">
                                  Price per {getUnit(item)}
                                </p>
                                  <p className="font-bold text-[#071b3a]">
                                    £{Number(item.unit_price || 0).toFixed(2)}
                                  </p>
                                </div>

                                <div>
                                <p className="text-xs text-[#071b3a]/60">
                                  Total for {item.quantity} {Number(item.quantity) === 1 ? getUnit(item) : `${getUnit(item)}s`}
                                </p>
                                  <p className="font-bold text-[#071b3a]">
                                    £{getLineTotal(item).toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 mt-4">
                              <div className="flex flex-col">
                              <QtyBox
                                qty={item.quantity}
                                maxQty={Number(item.stock_qty || item.available_qty || 0)}
                                onMinus={() => handleDecrease(item)}
                                onPlus={() => handleIncrease(item)}
                                onChangeQty={(value) => handleQtyInputChange(item, value)}
                                disabled={isUpdating}
                              />
                                </div>
                               
                                <button
                                  onClick={() => setDeleteItemId(id)}
                                  disabled={isUpdating}
                                  className="text-[#071b3a] cursor-pointer hover:text-red-600 disabled:opacity-50"
                                  type="button"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                              {qtyWarnings[id] && (
                                  <span className="text-[11px] text-red-600 whitespace-nowrap">
                                    {qtyWarnings[id]}
                                  </span>
                                )}
                            </div>

                            <div className="hidden md:block text-right">
                              <p className="text-xs text-[#071b3a]/60">
                                Price per {getUnit(item)}
                              </p>

                              <p className="font-bold text-[#071b3a]">
                                £{Number(item.unit_price || 0).toFixed(2)}
                              </p>

                              <p className="text-xs text-[#071b3a]/60 mt-3">
                                Total for {item.quantity}{" "}
                                {Number(item.quantity) === 1
                                  ? getUnit(item)
                                  : `${getUnit(item)}s`}
                              </p>

                              <p className="font-bold text-lg text-[#071b3a]">
                                £{getLineTotal(item).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="md:hidden bg-white border border-[#edf1f7] p-5">
                <OrderSummary
                  ref={bottomCheckoutRef}
                  totalItems={totalItems}
                  subtotal={subtotal}
                  deliveryCharge={deliveryCharge}
                  voucherCode={voucherCode}
                  discountPercent={discountPercent}
                  refreshCart={loadCart}
                  vatAmount={vatAmount}
                  totalAmount={totalAmount}
                  disabled={!canCheckout}
                  actionLabel="Go to checkout"
                  onAction={() => navigate("/checkout")}
                  showDeliveryMessage
                  showMinimumOrderMessage
                />
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
              <div className="border border-[#edf1f7] p-5 shadow-sm bg-white">
                  <OrderSummary
                    totalItems={totalItems}
                    subtotal={subtotal}
                    deliveryCharge={deliveryCharge}
                    vatAmount={vatAmount}
                    voucherCode={voucherCode}
                    discountPercent={discountPercent}
                    refreshCart={loadCart}
                    totalAmount={totalAmount}
                    disabled={!canCheckout}
                    actionLabel="Go to checkout"
                    onAction={() => navigate("/checkout")}
                    showDeliveryMessage
                    showMinimumOrderMessage
                  />
                </div>

                <div className="border border-[#edf1f7] p-4 gap-3 text-gray-700 bg-white flex">
                <ShieldCheck size={22} className="text-black" />

                  <div>
                    <p className="font-bold text-sm">Secure checkout</p>
                    <p className="text-xs">
                      Your order request is safely submitted.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>

      {cartItems.length > 0 && showMobileStickyCheckout && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 font-semibold">
                Estimated Total
              </p>

              <p className="text-xl font-bold text-[#071b3a]">
                £{totalAmount.toFixed(2)}
              </p>
            </div>

            <p className="text-xs text-[#071b3a]/60 text-right">
              VAT £{vatAmount.toFixed(2)}
            </p>
          </div>

          {subtotal < 20 && (
            <p className="mb-2 text-xs text-red-600 font-semibold text-center">
              Minimum order value is £20.
            </p>
          )}

          <button
            onClick={() => navigate("/checkout")}
            disabled={!canCheckout}
            className={`w-full h-12 font-bold text-sm transition ${
              canCheckout
              ? "cursor-pointer bg-[#C62828] text-white hover:bg-[#A61E1E]"
              : "cursor-not-allowed bg-gray-300 text-gray-500"
            }`}
            type="button"
          >
            Go to checkout
        </button>
        </div>
      )}
    </main>
  );
}


function QtyBox({ qty, maxQty, onMinus, onPlus, onChangeQty, disabled }) {
  const [localQty, setLocalQty] = useState(String(qty || 1));

  useEffect(() => {
    setLocalQty(String(qty || 1));
  }, [qty]);

  const commitQty = () => {
    const cleanQty = Number(localQty);

    if (!cleanQty || cleanQty <= 0) {
      setLocalQty(String(qty || 1));
      return;
    }

    onChangeQty(String(cleanQty));
  };

  return (
    <div className="flex h-10 border border-gray-200 overflow-hidden bg-white">
      <button
        onClick={onMinus}
        disabled={disabled}
        className={`w-10 text-2xl font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          Number(qty) === 1
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
        }`}
        type="button"
      >
        −
      </button>

      <input
        value={localQty}
        disabled={disabled}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, "");
          setLocalQty(value);
        }}
        onBlur={commitQty}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        inputMode="numeric"
        className="w-14 text-center text-black font-bold outline-none border-x border-gray-200 bg-white"
      />

      <button
        onClick={onPlus}
        disabled={disabled}
        className="w-10 bg-gray-100 text-2xl font-bold text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
      >
        +
      </button>
    </div>
  );
}
