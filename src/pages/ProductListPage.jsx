import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CategoryMenu from "../components/CategoryMenu";
import { ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function ProductListPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [qty, setQty] = useState({});
  const [addedProduct, setAddedProduct] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/products/category/${slug}`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [slug]);

  const updateQty = (productId, value) => {
    setQty((prev) => ({
      ...prev,
      [productId]: Math.max(0, Number(value) || 0),
    }));
  };

  const getImage = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  };

  const currentCategory = categories.find((cat) => cat.slug === slug);

  const parentCategory = currentCategory?.parent_category_id
    ? categories.find(
        (cat) => cat.category_id === currentCategory.parent_category_id
      )
    : null;

  const getSlabLabel = (tier) => {
    return tier.max_qty ? `${tier.min_qty}-${tier.max_qty}` : `${tier.min_qty}+`;
  };

  const getActiveTier = (product) => {
    const enteredQty = qty[product.product_id] || 0;
    if (!enteredQty || !product.price_breaks?.length) return null;

    return product.price_breaks.find((tier) => {
      const min = Number(tier.min_qty);
      const max = tier.max_qty ? Number(tier.max_qty) : Infinity;
      return enteredQty >= min && enteredQty <= max;
    });
  };

  const handleAddToCart = async (product) => {
    const enteredQty = qty[product.product_id] || 0;

    if (enteredQty <= 0) {
      alert("Please enter quantity");
      return;
    }

    const activeTier = getActiveTier(product);

    try {
      await addToCart({
        product_id: product.product_id,
        product_name: product.product_name,
        sku: product.sku,
        image_url: product.image_url,
        quantity: enteredQty,
        unit_price: activeTier ? Number(activeTier.price) : 0,
        price: activeTier ? Number(activeTier.price) : 0,
      });

      setAddedProduct(product.product_name);
      setTimeout(() => setAddedProduct(""), 2000);
    } catch (err) {
      alert(err.message || "Failed to add to cart");
    }
  };

  return (
    <main className="bg-[#fbfcfe]">
      {addedProduct && (
        <div className="fixed top-5 right-5 z-50 bg-white border border-green-100 shadow-lg rounded-xl px-5 py-4">
          <p className="text-sm font-semibold text-green-700">Added to cart</p>
          <p className="text-xs text-[#071b3a]/55 mt-1">{addedProduct}</p>
        </div>
      )}

      <CategoryMenu categories={categories} />

      <section className="max-w-7xl mx-auto px-4 pb-10">
        {/* DESKTOP BREADCRUMB */}
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

          <span className="mx-2">›</span>
          <span>{currentCategory?.category_name || "Products"}</span>
        </div>

        {/* MOBILE BACK NAVIGATION */}
        <div className="md:hidden mb-4 mt-3">
          {parentCategory ? (
            <Link
              to={`/category/${parentCategory.slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#071b3a]/60 hover:text-green-700"
            >
              <ArrowLeft size={16} />
              {parentCategory.category_name}
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#071b3a]/60 hover:text-green-700"
            >
              <ArrowLeft size={16} />
              Categories
            </Link>
          )}
        </div>

        <h1 className="text-lg md:text-xl font-bold text-[#071b3a] mb-1">
          {currentCategory?.category_name ||
            products[0]?.category_name ||
            "Products"}
        </h1>

        <p className="text-xs text-[#071b3a]/60 mb-4">
          Showing all {products.length} products
        </p>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block bg-white border border-[#edf1f7] rounded-2xl overflow-hidden shadow-sm">
          <div className="max-h-162.5 overflow-y-auto">
            <table className="w-full text-xs text-[#071b3a]">
              <tbody>
                {products.map((product) => {
                  const activeTier = getActiveTier(product);

                  return (
                    <tr
                      key={product.product_id}
                      className="border-t border-[#edf1f7] hover:bg-[#fbfcfe]"
                    >
                      <td className="p-4">
                        <Link
                          to={`/product/${product.slug}`}
                          className="flex items-center gap-4"
                        >
                          {getImage(product.image_url) ? (
                            <img
                              src={getImage(product.image_url)}
                              alt={product.product_name}
                              className="w-14 h-14 object-contain"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gray-100 rounded" />
                          )}

                          <div>
                            <h3 className="font-semibold text-sm text-[#071b3a]">
                              {product.product_name}
                            </h3>
                            <p className="text-[11px] text-[#071b3a]/50 mt-1">
                              SKU: {product.sku}
                            </p>
                          </div>
                        </Link>
                      </td>

                      <td className="p-4">
                        <div
                          className="grid gap-2"
                          style={{
                            gridTemplateColumns: `repeat(${
                              product.price_breaks?.length || 1
                            }, minmax(80px, 1fr))`,
                          }}
                        >
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
                                <div
                                  className={`text-[11px] font-medium px-2 py-1.5 ${
                                    isActive
                                      ? "bg-green-50 text-green-700"
                                      : "bg-[#f8fafc] text-[#64748b]"
                                  }`}
                                >
                                  {getSlabLabel(tier)}
                                </div>

                                <div
                                  className={`font-semibold text-xs px-2 py-2 ${
                                    isActive
                                      ? "text-green-700"
                                      : "text-[#071b3a]"
                                  }`}
                                >
                                  £{Number(tier.price).toFixed(2)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      <td className="p-4">
                        <input
                          type="number"
                          min="0"
                          value={qty[product.product_id] || 0}
                          onChange={(e) =>
                            updateQty(product.product_id, e.target.value)
                          }
                          className="w-20 h-9 border border-[#e5eaf2] rounded-lg text-center text-sm outline-none focus:border-green-300 focus:ring-2 focus:ring-green-50"
                        />
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 h-9 rounded-lg text-xs font-semibold hover:bg-green-100 transition"
                        >
                          Add to Cart
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4">
          {products.map((product) => {
            const activeTier = getActiveTier(product);

            return (
              <div
                key={product.product_id}
                className="bg-white border border-[#edf1f7] rounded-2xl p-4 shadow-sm"
              >
                <Link to={`/product/${product.slug}`} className="flex gap-4">
                  {getImage(product.image_url) ? (
                    <img
                      src={getImage(product.image_url)}
                      alt={product.product_name}
                      className="w-20 h-20 object-contain"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded" />
                  )}

                  <div>
                    <h3 className="font-semibold text-sm text-[#071b3a] leading-snug">
                      {product.product_name}
                    </h3>
                    <p className="text-[11px] text-[#071b3a]/50 mt-1">
                      SKU: {product.sku}
                    </p>
                  </div>
                </Link>

                <div className="flex gap-2 overflow-x-auto py-4">
                  {product.price_breaks?.map((tier) => {
                    const isActive = activeTier === tier;

                    return (
                      <div
                        key={`${tier.min_qty}-${tier.max_qty}`}
                        className={`min-w-18.75 border rounded-xl p-2 text-center transition ${
                          isActive
                            ? "border-green-300 bg-green-50 ring-1 ring-green-100"
                            : "border-[#e8eef6] bg-white"
                        }`}
                      >
                        <p
                          className={`text-[11px] font-medium ${
                            isActive ? "text-green-700" : "text-[#64748b]"
                          }`}
                        >
                          {getSlabLabel(tier)}
                        </p>
                        <p
                          className={`text-xs font-semibold ${
                            isActive ? "text-green-700" : "text-[#071b3a]"
                          }`}
                        >
                          £{Number(tier.price).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#071b3a]">
                    Qty
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={qty[product.product_id] || 0}
                    onChange={(e) =>
                      updateQty(product.product_id, e.target.value)
                    }
                    className="w-20 h-9 border border-[#e5eaf2] rounded-lg text-center text-sm outline-none focus:border-green-300 focus:ring-2 focus:ring-green-50"
                  />

                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-green-50 text-green-700 border border-green-200 h-9 rounded-lg text-xs font-semibold hover:bg-green-100 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}