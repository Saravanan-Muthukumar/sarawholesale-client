import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import CategoryMenu from "../components/CategoryMenu";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function CartPage() {
  const { cartItemCount, cartItems, updateCartItem, removeCartItem } = useCart();

  const navigate = useNavigate();
  const bottomCheckoutRef = useRef(null);
  const [categories, setCategories] = useState([]);

  const [updatingId, setUpdatingId] = useState(null);
  const [showMobileStickyCheckout, setShowMobileStickyCheckout] = useState(true);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [itemsDraft, setItemsDraft] = useState({});
  

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

    const subtotal = cartItems.reduce(
      (sum, item) => sum + getLineTotal(item),
      0
    );
    
    const vatAmount = subtotal * 0.2;
    const totalAmount = subtotal + vatAmount;
    const totalItems = cartItemCount; 


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
    setUpdatingId(id);
    await updateCartItem(id, Number(item.quantity) + 1);
    setUpdatingId(null);
  };

  const handleDecrease = async (item) => {
    const qty = Number(item.quantity || 1);
  
    if (qty <= 1) {
      setDeleteItemId(getItemId(item));
      return;
    }
  
    const id = getItemId(item);
  
    setUpdatingId(id);
    await updateCartItem(id, qty - 1);
    setUpdatingId(null);
  };



  const handleQtyChange = async (item, value) => {
    const id = getItemId(item);
  
    // allow empty while typing, do not update backend
    if (value === "") {
      setItemsDraft((prev) => ({
        ...prev,
        [id]: "",
      }));
      return;
    }
  
    const qty = Number(value);
  
    if (qty <= 0) return;
  
    setItemsDraft((prev) => ({
      ...prev,
      [id]: qty,
    }));
  
    setUpdatingId(id);
    await updateCartItem(id, qty);
    setUpdatingId(null);
  };

  return (
    <main className="bg-[#f4f6f9] min-h-screen border-t border-[#edf1f7] pb-28 md:pb-0">
      <div className="hidden md:block mb-5">
        <CategoryMenu categories={categories} />
      </div>
      <section className="max-w-7xl mx-auto px-4 py-5">
        <div className="sticky top-0 z-30 bg-[#f4f6f9]/95 backdrop-blur py-3 -mx-4 px-4 mb-4 border-b border-[#e5eaf2] md:static md:bg-transparent md:border-0 md:p-0 md:mx-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-[#071b3a] hover:text-green-700"
          >
            <ArrowLeft size={18} />
            Previous page
          </button>
        </div>

        <div className="mb-5">
          <h1 className="text-xl md:text-2xl font-bold text-[#071b3a]">
            My Basket{" "}
            <span className="text-sm font-semibold">{totalItems} Items</span>
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-[#edf1f7] rounded-xl p-6">
            <p className="font-semibold text-[#071b3a] mb-4">
              Your basket is empty.
            </p>

            <button
              onClick={() => navigate("/")}
              className="bg-green-700 text-white px-5 h-10 font-bold text-sm hover:bg-green-800"
              type="button"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_330px] gap-7">
            <div className="space-y-4">
              <div className="bg-white border border-[#edf1f7] rounded-xl overflow-hidden">
                <div className="bg-[#26343a] text-white px-4 py-3 flex justify-between text-sm font-bold">
                  <span>Your Items</span>
                  <span>{cartItems.length} products</span>
                </div>

                {cartItems.map((item) => {
                  const id = getItemId(item);
                  const isUpdating = updatingId === id;

                  return (
                    <div
                      key={id}
                      className="p-4 md:p-5 border-b border-[#edf1f7] last:border-b-0"
                    >
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
                            className="font-bold text-sm md:text-base text-[#071b3a] hover:text-green-700 leading-snug"
                          >
                            {item.product_name}
                          </Link>

                          <p className="text-xs text-[#071b3a]/60 mt-1">
                            SKU: {item.sku || "N/A"}
                          </p>

                          <p className="text-xs mt-3 text-green-700 font-bold">
                            Available for delivery
                          </p>

                          <div className="flex items-center gap-3 mt-4">
                          <QtyBox
                              qty={itemsDraft[id] ?? item.quantity}
                              onMinus={() => handleDecrease(item)}
                              onPlus={() => handleIncrease(item)}
                              onChangeQty={(value) => handleQtyChange(item, value)}
                              onBlurQty={() => {
                                if (itemsDraft[id] === "") {
                                  setItemsDraft((prev) => ({
                                    ...prev,
                                    [id]: item.quantity || 1,
                                  }));
                                }
                              }}
                              disabled={isUpdating}
                            />

                            <button
                              onClick={() => setDeleteItemId(getItemId(item))}
                              disabled={isUpdating}
                              className="text-[#071b3a] hover:text-red-600 disabled:opacity-50"
                              type="button"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="col-span-2 md:col-span-1 md:text-right">
                          <p className="text-xs text-[#071b3a]/60">
                            Unit price
                          </p>

                          <p className="font-bold text-[#071b3a]">
                            £{Number(item.unit_price || 0).toFixed(2)}
                          </p>

                          <p className="text-xs text-[#071b3a]/60 mt-3">
                            Line total
                          </p>

                          <p className="font-bold text-lg text-[#071b3a]">
                            £{getLineTotal(item).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {deleteItemId === id && (
                  <div className="mt-4 bg-[#f5f7fb] border border-[#d9e2ef] p-4">
                    <p className="font-semibold text-sm text-[#071b3a]">
                      Remove this item from your basket?
                    </p>

                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => setDeleteItemId(null)}
                        className="h-10 px-5 border border-gray-300 font-semibold text-sm bg-white"
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
                      >
                        Remove Item
                      </button>
                    </div>
                  </div>
                )}
                    </div>
                    
                  );

                })}

              </div>

              <div className="md:hidden bg-white border border-[#edf1f7] rounded-xl p-5">
                <OrderSummary
                  totalItems={totalItems}
                  subtotal={subtotal}
                  vatAmount={vatAmount}
                  totalAmount={totalAmount}
                  onCheckout={() => navigate("/checkout")}
                  checkoutRef={bottomCheckoutRef}
                />
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <div className="border border-[#edf1f7] rounded-xl p-5 shadow-sm bg-white">
                  <OrderSummary
                    totalItems={totalItems}
                    subtotal={subtotal}
                    vatAmount={vatAmount}
                    totalAmount={totalAmount}
                    onCheckout={() => navigate("/checkout")}
                  />
                </div>

                <div className="border border-[#edf1f7] rounded-xl p-4 gap-3 text-[#071b3a] bg-white flex">
                  <ShieldCheck size={22} />

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
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#dfe5ee] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-[#071b3a]/60 font-semibold">
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

          <button
            onClick={() => navigate("/checkout")}
            className="w-full h-12 bg-green-700 text-white font-bold text-sm hover:bg-green-800"
            type="button"
          >
            Go to checkout
          </button>
        </div>
      )}

    </main>
  );
}

function OrderSummary({
  totalItems,
  subtotal,
  vatAmount,
  totalAmount,
  onCheckout,
  checkoutRef,
}) {
  return (
    <>
      <h2 className="text-xl font-bold text-[#071b3a] mb-5">Order summary</h2>

      <SummaryRow label="Items" value={totalItems} />
      <SummaryRow label="Subtotal" value={`£${subtotal.toFixed(2)}`} />
      <SummaryRow label="VAT (20%)" value={`£${vatAmount.toFixed(2)}`} />
      <SummaryRow label="Estimated delivery" value="Free" green />

      <div className="border-t border-[#edf1f7] mt-4 pt-4 flex justify-between font-bold text-xl text-[#071b3a]">
        <span>Total incl. VAT</span>
        <span>£{totalAmount.toFixed(2)}</span>
      </div>

      <button
        ref={checkoutRef}
        onClick={onCheckout}
        className="w-full h-12 bg-green-700 text-white font-bold text-sm mt-5 hover:bg-green-800 transition"
        type="button"
      >
        Go to checkout
      </button>
    </>
  );
}

function QtyBox({ qty, onMinus, onPlus, onChangeQty, onBlurQty, disabled }) {
  return (
    <div className="flex h-10 border border-gray-300 overflow-hidden bg-white">
      <button
        onClick={onMinus}
        disabled={disabled}
        className={`w-10 text-2xl font-bold transition-colors disabled:opacity-50 ${
          Number(qty) === 1
            ? "bg-red-50 text-red-600 hover:bg-red-100"
            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
        }`}
        type="button"
      >
        −
      </button>

      <input
        value={qty}
        disabled={disabled}
        onChange={(e) => {
          const value = e.target.value;

          if (value === "") {
            onChangeQty("");
            return;
          }

          onChangeQty(value.replace(/\D/g, ""));
        }}
        onBlur={onBlurQty}
        inputMode="numeric"
        className="w-14 text-center text-black font-bold outline-none border-x border-gray-300 bg-white"
      />

      <button
        onClick={onPlus}
        disabled={disabled}
        className="w-10 bg-gray-100 text-2xl font-bold text-gray-900 hover:bg-gray-200 disabled:opacity-50"
        type="button"
      >
        +
      </button>
    </div>
  );
}

function SummaryRow({ label, value, green }) {
  return (
    <div className="flex justify-between mb-3 text-sm text-[#3f4043]">
      <span className="font-semibold">{label}</span>
      <span
        className={`font-bold ${
          green ? "text-green-700" : "text-[#071b3a]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}