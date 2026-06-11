import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function ProductPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [qty, setQty] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/products/${slug}`)
      .then((res) => res.json())
      .then(setProduct)
      .catch(console.error);
  }, [slug]);

  const imageSrc = useMemo(() => {
    if (!product?.image_url) return null;
    return product.image_url.startsWith("http")
      ? product.image_url
      : `${API_URL}${product.image_url}`;
  }, [product]);

  const activeTier = useMemo(() => {
    if (!product?.price_breaks?.length || qty <= 0) return null;

    return product.price_breaks.find((tier) => {
      const min = Number(tier.min_qty);
      const max = tier.max_qty ? Number(tier.max_qty) : Infinity;
      return qty >= min && qty <= max;
    });
  }, [product, qty]);

  const unitPrice =
    activeTier?.price || product?.price_breaks?.[0]?.price || 0;

  const getSlabLabel = (tier) =>
    tier.max_qty ? `${tier.min_qty} - ${tier.max_qty}` : `${tier.min_qty}+`;

  const handleAddToCart = async () => {
    if (!product) return;

    if (qty <= 0) {
      alert("Please enter quantity");
      return;
    }

    try {
      await addToCart({
        product_id: product.product_id,
        product_name: product.product_name,
        sku: product.sku,
        image_url: product.image_url,
        quantity: qty,
        unit_price: Number(unitPrice),
        price: Number(unitPrice),
      });

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(err.message || "Failed to add to cart");
    }
  };

  if (!product) {
    return (
      <main className="bg-[#fbfcfe] min-h-screen px-4 py-10">
        <p className="text-sm text-[#071b3a]/60">Loading product...</p>
      </main>
    );
  }

  return (
    <main className="bg-[#fbfcfe] min-h-screen">
      {added && (
        <div className="fixed top-5 right-5 z-50 bg-white border border-green-100 shadow-lg rounded-xl px-5 py-4">
          <p className="text-sm font-semibold text-green-700">Added to cart</p>
          <p className="text-xs text-[#071b3a]/55 mt-1">
            {product.product_name}
          </p>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-xs sm:text-sm text-[#071b3a]/55 mb-6">
          <Link to="/" className="hover:text-[#071b3a]">
            Home
          </Link>
          <span className="mx-2">›</span>
          <Link to={`/category/${product.category_slug}`} className="hover:text-[#071b3a]">
            Products
          </Link>
          <span className="mx-2">›</span>
          <span>{product.product_name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* DESKTOP CATEGORY SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="bg-white border border-[#edf1f7] rounded-xl overflow-hidden shadow-sm">
              <h3 className="px-4 py-4 font-bold text-[#071b3a] border-b border-[#edf1f7]">
                Categories
              </h3>

              {categories.map((cat) => {
                const active = cat.category_id === product.category_id;

                return (
                  <Link
                    key={cat.category_id}
                    to={`/category/${cat.slug}`}
                    className={`flex items-center justify-between px-4 py-3 text-sm border-b border-[#edf1f7] last:border-b-0 transition ${
                      active
                        ? "bg-[#f5f9ff] text-blue-700 font-semibold border-l-2 border-l-blue-600"
                        : "text-[#071b3a] hover:bg-[#f8fafc]"
                    }`}
                  >
                    <span>{cat.category_name}</span>
                    <span className="text-[#071b3a]/45">›</span>
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* PRODUCT CARD */}
          <div className="bg-white border border-[#edf1f7] rounded-xl shadow-sm p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-[420px_1fr] xl:grid-cols-[420px_1fr_280px] gap-6">
              {/* IMAGE */}
              <div className="border border-[#edf1f7] rounded-xl bg-white h-80 sm:h-96 flex items-center justify-center p-6">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={product.product_name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-[#f8fafc] rounded-xl" />
                )}
              </div>

              {/* DETAILS */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#071b3a] leading-snug">
                  {product.product_name}
                </h1>

                <p className="text-sm text-[#071b3a]/55 mt-3">
                  SKU: {product.sku}
                </p>

                <p
                  className={`text-sm font-semibold mt-4 ${
                    Number(product.stock_qty) > 0
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {Number(product.stock_qty) > 0 ? "✓ In stock" : "Out of stock"}
                </p>

                <div className="border-t border-[#edf1f7] my-5" />

                {product.description && (
                  <div>
                    <h2 className="font-bold text-[#071b3a] mb-2">
                      Description
                    </h2>
                    <p className="text-sm leading-7 text-[#071b3a]/80">
                      {product.description}
                    </p>
                  </div>
                )}

                <p className="text-sm text-[#071b3a] mt-5">
                  <span className="font-bold">VAT rate:</span>{" "}
                  {Number(product.vat_rate).toFixed(0)}%
                </p>

                <div className="mt-6">
                  <h2 className="font-bold text-[#071b3a] mb-3">
                    Price breaks{" "}
                    <span className="text-sm font-normal text-[#071b3a]/55">
                      (per unit)
                    </span>
                  </h2>

                  <div className="border border-[#edf1f7] rounded-xl overflow-hidden max-w-md">
                    {product.price_breaks?.map((tier) => {
                      const active = activeTier === tier;

                      return (
                        <div
                          key={`${tier.min_qty}-${tier.max_qty}`}
                          className={`flex justify-between px-4 py-3 text-sm border-b border-[#edf1f7] last:border-b-0 ${
                            active
                              ? "bg-green-50 text-green-700 font-bold"
                              : "text-[#071b3a]"
                          }`}
                        >
                          <span>{getSlabLabel(tier)}</span>
                          <span className="font-bold">
                            £{Number(tier.price).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* BUY BOX DESKTOP */}
              <div className="hidden xl:block">
                <BuyBox
                  qty={qty}
                  setQty={setQty}
                  unitPrice={unitPrice}
                  onAdd={handleAddToCart}
                />
              </div>
            </div>

            {/* BUY BOX MOBILE/TABLET */}
            <div className="xl:hidden mt-6">
              <BuyBox
                qty={qty}
                setQty={setQty}
                unitPrice={unitPrice}
                onAdd={handleAddToCart}
              />
            </div>

            {/* MOBILE CATEGORY LIST */}
            <div className="lg:hidden mt-6 bg-white border border-[#edf1f7] rounded-xl overflow-hidden">
              <h3 className="px-4 py-4 font-bold text-[#071b3a] border-b border-[#edf1f7]">
                Categories
              </h3>

              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.category_id}
                  to={`/category/${cat.slug}`}
                  className="flex items-center justify-between px-4 py-3 text-sm border-b border-[#edf1f7] last:border-b-0 text-[#071b3a]"
                >
                  <span>{cat.category_name}</span>
                  <span>›</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function BuyBox({ qty, setQty, unitPrice, onAdd }) {
  return (
    <div className="bg-white border border-[#edf1f7] rounded-xl p-5 shadow-sm">
      <p className="text-sm text-[#071b3a]/60">Unit Price (Ex. VAT)</p>
      <p className="text-3xl font-bold text-[#071b3a] mt-2">
        £{Number(unitPrice).toFixed(2)}
      </p>

      <div className="border-t border-[#edf1f7] my-5" />

      <label className="block text-sm font-bold text-[#071b3a] mb-3">
        Quantity
      </label>

      <div className="grid grid-cols-[48px_1fr_48px] h-12 border border-[#e5eaf2] rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(0, q - 1))}
          className="text-xl hover:bg-[#f8fafc]"
        >
          −
        </button>

        <input
          type="number"
          min="0"
          value={qty}
          onChange={(e) => setQty(Math.max(0, Number(e.target.value) || 0))}
          className="text-center border-x border-[#e5eaf2] outline-none"
        />

        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="text-xl hover:bg-[#f8fafc]"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="w-full h-12 bg-green-700 text-white rounded-lg font-bold mt-5 hover:bg-green-800 transition"
      >
        Add to Cart
      </button>
    </div>
  );
}