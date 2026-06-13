import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import CategoryMenu from "../components/CategoryMenu";

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
      .then((data) => setCategories(Array.isArray(data) ? data : []))
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

  const currentCategory = categories.find(
    (cat) =>
      cat.category_id === product?.category_id ||
      cat.slug === product?.category_slug
  );

  const parentCategory = currentCategory?.parent_category_id
    ? categories.find(
        (cat) => cat.category_id === currentCategory.parent_category_id
      )
    : null;

  const activeTier = useMemo(() => {
    if (!product?.price_breaks?.length || qty <= 0) return null;

    return product.price_breaks.find((tier) => {
      const min = Number(tier.min_qty);
      const max = tier.max_qty ? Number(tier.max_qty) : Infinity;
      return qty >= min && qty <= max;
    });
  }, [product, qty]);

  const unitPrice = activeTier
    ? Number(activeTier.price)
    : Number(product?.price_breaks?.[0]?.price || product?.selling_price || 0);

  const getSlabLabel = (tier) =>
    tier.max_qty ? `${tier.min_qty}-${tier.max_qty}` : `${tier.min_qty}+`;

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
        unit_price: unitPrice,
        price: unitPrice,
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

      <CategoryMenu categories={categories} />

      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="hidden md:block text-xs text-[#071b3a]/50 mb-3 mt-4">
          <Link to="/" className="hover:text-green-700">
            Home
          </Link>

          {parentCategory && (
            <>
              <span className="mx-2">›</span>
              <Link
                to={`/category/${parentCategory.slug}`}
                className="hover:text-green-700"
              >
                {parentCategory.category_name}
              </Link>
            </>
          )}

          {currentCategory && (
            <>
              <span className="mx-2">›</span>
              <Link
                to={`/subcategory/${currentCategory.slug}`}
                className="hover:text-green-700"
              >
                {currentCategory.category_name}
              </Link>
            </>
          )}

          <span className="mx-2">›</span>
          <span>{product.product_name}</span>
        </div>

        <div className="md:hidden mb-4 mt-3">
          {currentCategory ? (
            <Link
              to={`/subcategory/${currentCategory.slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#071b3a]/60 hover:text-green-700"
            >
              <ArrowLeft size={16} />
              {currentCategory.category_name}
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#071b3a]/60 hover:text-green-700"
            >
              <ArrowLeft size={16} />
              Products
            </Link>
          )}
        </div>

        <div className="bg-white border border-[#edf1f7] rounded-2xl shadow-sm p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] lg:grid-cols-[420px_1fr] gap-6">
            <div className="border border-[#edf1f7] rounded-2xl bg-white h-72 md:h-96 flex items-center justify-center p-5">
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

            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#071b3a] leading-snug">
                {product.product_name}
              </h1>

              <p className="text-sm text-[#071b3a]/55 mt-3">
                SKU: {product.sku || "N/A"}
              </p>

              <p
                className={`text-sm font-semibold mt-4 ${
                  Number(product.stock_qty) < 1
                    ? "text-green-700"
                    : "text-red-600"
                }`}
              >
                {Number(product.stock_qty) < 1 ? "✓ In stock" : "Out of stock"}
              </p>

              <div className="border-t border-[#edf1f7] my-5" />

              <h2 className="font-bold text-[#071b3a] mb-2">Description</h2>
              <p className="text-sm leading-7 text-[#071b3a]/80">
                {product.description || "No description available."}
              </p>

              <p className="text-sm text-[#071b3a] mt-5">
                <span className="font-bold">VAT rate:</span>{" "}
                {Number(product.vat_rate || 0).toFixed(0)}%
              </p>

              <div className="mt-6">
                <h2 className="font-bold text-[#071b3a] mb-3">
                  Price breaks{" "}
                  <span className="text-sm font-normal text-[#071b3a]/55">
                    (per unit)
                  </span>
                </h2>

                <div className="grid gap-2 md:max-w-xl">
                  {product.price_breaks?.map((tier) => {
                    const isActive = activeTier === tier;

                    return (
                      <div
                        key={`${tier.min_qty}-${tier.max_qty}`}
                        className={`border rounded-xl overflow-hidden text-center transition ${
                          isActive
                            ? "border-green-300 bg-green-50 ring-1 ring-green-100"
                            : "border-[#e8eef6] bg-white"
                        }`}
                      >
                        <div className="grid grid-cols-2">
                          <div
                            className={`text-xs font-medium px-3 py-2 ${
                              isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-[#f8fafc] text-[#64748b]"
                            }`}
                          >
                            {getSlabLabel(tier)}
                          </div>

                          <div
                            className={`font-semibold text-xs px-3 py-2 ${
                              isActive ? "text-green-700" : "text-[#071b3a]"
                            }`}
                          >
                            £{Number(tier.price).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm font-semibold text-[#071b3a]">
                  Qty
                </span>

                <input
                  type="number"
                  min="0"
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-20 h-9 border border-[#e5eaf2] rounded-lg text-center text-sm outline-none focus:border-green-300 focus:ring-2 focus:ring-green-50"
                />

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 md:flex-none bg-green-50 text-green-700 border border-green-200 px-6 h-9 rounded-lg text-xs font-semibold hover:bg-green-100 transition"
                >
                  Add to Cart
                </button>
              </div>

              <p className="text-lg font-bold text-green-700 mt-5">
                £{Number(unitPrice).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}