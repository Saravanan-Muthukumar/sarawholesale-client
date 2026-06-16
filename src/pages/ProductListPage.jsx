import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CategoryMenu from "../components/CategoryMenu";
import { ArrowLeft, ShoppingCart } from "lucide-react";

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
    if (value === "") {
      setQty((prev) => ({ ...prev, [productId]: "" }));
      return;
    }

    setQty((prev) => ({
      ...prev,
      [productId]: Math.max(0, Number(value) || 0),
    }));
  };

  const setQtyFromSlab = (productId, minQty) => {
    setQty((prev) => ({
      ...prev,
      [productId]: Number(minQty),
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
    const enteredQty = Number(qty[product.product_id] || 0);

    if (!enteredQty || !product.price_breaks?.length) return null;

    const sortedTiers = [...product.price_breaks].sort(
      (a, b) => Number(a.min_qty) - Number(b.min_qty)
    );

    const matchingTier = sortedTiers.find((tier) => {
      const min = Number(tier.min_qty);
      const max =
        tier.max_qty === null || tier.max_qty === undefined || tier.max_qty === ""
          ? Infinity
          : Number(tier.max_qty);

      return enteredQty >= min && enteredQty <= max;
    });

    return matchingTier || sortedTiers[sortedTiers.length - 1];
  };

  const getLineTotal = (product) => {
    const enteredQty = Number(qty[product.product_id] || 0);
    const activeTier = getActiveTier(product);

    if (!enteredQty || !activeTier) return "£0.00";

    return `£${(enteredQty * Number(activeTier.price)).toFixed(2)}`;
  };

  const handleAddToCart = async (product) => {
    const enteredQty = Number(qty[product.product_id] || 0);

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

      <section className="max-w-5xl mx-auto px-4 pb-10">
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

        {/* DESKTOP LIST */}
        <div className="hidden md:block bg-white border border-[#edf1f7] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-xs text-[#071b3a]">
            <tbody>
              {products.map((product) => {
                const activeTier = getActiveTier(product);

                return (
                  <tr
                    key={product.product_id}
                    className="border-t first:border-t-0 border-[#edf1f7] odd:bg-white even:bg-[#f3f6fa] hover:bg-[#eaf7ee]"
                  >
                    <td className="py-5 pl-5 pr-2 w-[420px]">
                      <Link
                        to={`/product/${product.slug}`}
                        className="flex items-center gap-5"
                      >
                        {getImage(product.image_url) ? (
                          <img
                            src={getImage(product.image_url)}
                            alt={product.product_name}
                            className="w-20 h-20 object-contain shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 rounded shrink-0" />
                        )}

                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-[#071b3a] leading-snug">
                            {product.product_name}
                          </h3>
                          <p className="text-[11px] text-[#071b3a]/50 mt-2">
                            SKU: {product.sku}
                          </p>
                        </div>
                      </Link>
                    </td>

                    <td className="py-5 px-2 w-[390px]">
                      <div
                        className="grid border border-[#e3eaf3] rounded-lg overflow-hidden bg-white"
                        style={{
                          gridTemplateColumns: `repeat(${
                            product.price_breaks?.length || 1
                          }, minmax(75px, 1fr))`,
                        }}
                      >
                        {product.price_breaks?.map((tier) => {
                          const isActive = activeTier === tier;

                          return (
                            <button
                              type="button"
                              key={`${tier.min_qty}-${tier.max_qty}`}
                              onClick={() =>
                                setQtyFromSlab(product.product_id, tier.min_qty)
                              }
                              className={`text-center transition border-r last:border-r-0 border-[#e3eaf3] ${
                                isActive
                                  ? "bg-green-50"
                                  : "bg-white hover:bg-green-50"
                              }`}
                            >
                              <div
                                className={`text-[11px] font-medium px-2 py-2 border-b border-[#e3eaf3] ${
                                  isActive
                                    ? "text-green-700 bg-green-50"
                                    : "text-[#64748b] bg-[#f8fafc]"
                                }`}
                              >
                                {getSlabLabel(tier)}
                              </div>

                              <div
                                className={`font-bold text-xs px-2 py-2 ${
                                  isActive
                                    ? "text-green-700"
                                    : "text-[#071b3a]"
                                }`}
                              >
                                £{Number(tier.price).toFixed(2)}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-5 px-2 w-[145px]">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center border border-[#e5eaf2] rounded-lg bg-white overflow-hidden w-[100px] focus-within:border-green-300 focus-within:ring-2 focus-within:ring-green-50">
                          <span className="px-3 text-[11px] text-[#071b3a]/50 bg-[#f8fafc] h-9 flex items-center border-r border-[#e5eaf2]">
                            Qty
                          </span>

                          <input
                            type="number"
                            min="0"
                            value={qty[product.product_id] ?? ""}
                            onChange={(e) =>
                              updateQty(product.product_id, e.target.value)
                            }
                            className="w-full h-9 text-center text-sm outline-none bg-white"
                          />
                        </div>

                        <p className="text-[11px] text-[#071b3a]/60">
                          Total:{" "}
                          <span className="font-bold text-[#071b3a]">
                            {getLineTotal(product)}
                          </span>
                        </p>
                      </div>
                    </td>

                    <td className="py-5 pl-2 pr-4 w-[95px] text-right">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="inline-flex items-center justify-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 h-9 rounded-lg text-[11px] font-semibold hover:bg-green-100 transition w-[105px]"
                      >
                        <ShoppingCart size={13} />
                        Add Cart
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4">
          {products.map((product) => {
            const activeTier = getActiveTier(product);

            return (
              <div
                key={product.product_id}
                className={`border border-[#edf1f7] rounded-2xl p-4 shadow-sm ${
                    products.indexOf(product) % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"
                  }`}
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

                <div
                  className="grid border border-[#e3eaf3] rounded-lg overflow-hidden bg-white mt-4"
                  style={{
                    gridTemplateColumns: `repeat(${
                      product.price_breaks?.length || 1
                    }, minmax(70px, 1fr))`,
                  }}
                >
                  {product.price_breaks?.map((tier) => {
                    const isActive = activeTier === tier;

                    return (
                      <button
                        type="button"
                        key={`${tier.min_qty}-${tier.max_qty}`}
                        onClick={() =>
                          setQtyFromSlab(product.product_id, tier.min_qty)
                        }
                        className={`text-center transition border-r last:border-r-0 border-[#e3eaf3] ${
                          isActive ? "bg-green-50" : "bg-white"
                        }`}
                      >
                        <p
                          className={`text-[11px] font-medium px-2 py-2 border-b border-[#e3eaf3] ${
                            isActive
                              ? "text-green-700 bg-green-50"
                              : "text-[#64748b] bg-[#f8fafc]"
                          }`}
                        >
                          {getSlabLabel(tier)}
                        </p>

                        <p
                          className={`text-xs font-bold px-2 py-2 ${
                            isActive ? "text-green-700" : "text-[#071b3a]"
                          }`}
                        >
                          £{Number(tier.price).toFixed(2)}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center border border-[#e5eaf2] rounded-lg bg-white overflow-hidden w-28 focus-within:border-green-300 focus-within:ring-2 focus-within:ring-green-50">
                      <span className="px-3 text-[11px] text-[#071b3a]/50 bg-[#f8fafc] h-10 flex items-center border-r border-[#e5eaf2]">
                        Qty
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={qty[product.product_id] ?? ""}
                        onChange={(e) =>
                          updateQty(product.product_id, e.target.value)
                        }
                        className="w-full h-10 text-center text-base outline-none bg-white"
                      />
                    </div>

                    <p className="text-[11px] text-[#071b3a]/60">
                      Total:{" "}
                      <span className="font-bold text-[#071b3a]">
                        {getLineTotal(product)}
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-200 h-10 rounded-lg text-xs font-semibold hover:bg-green-100 transition"
                  >
                    <ShoppingCart size={15} />
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