import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const q = searchParams.get("q") || "";
  const subcategory = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "relevant";

  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState({});
  const [addedProduct, setAddedProduct] = useState("");
  

  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [q, subcategory, sort]);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/search?q=${encodeURIComponent(
          q
        )}&category=${subcategory}&sort=${sort}`
      );

      const data = await res.json();
      

      setProducts(data.products || []);
      setSubCategories(data.categories || []);
    } catch {
      setProducts([]);
      setSubCategories([]);
    } finally {
      setLoading(false);
    }
  };

  

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    setSearchParams(params);
  };

  const updateQty = (productId, value) => {
    if (value === "") {
      setQty((prev) => ({ ...prev, [productId]: "" }));
      return;
    }

    setQty((prev) => ({
      ...prev,
      [productId]: Math.max(1, Number(value) || 1),
    }));
  };

  const setQtyFromSlab = (productId, minQty) => {
    setQty((prev) => ({
      ...prev,
      [productId]: Number(minQty),
    }));
  };

  const getActiveTier = (product) => {
    const enteredQty = Number(qty[product.product_id] || 1);

    if (!enteredQty || !product.price_breaks?.length) return null;

    const sortedTiers = [...product.price_breaks].sort(
      (a, b) => Number(a.min_qty) - Number(b.min_qty)
    );

    return (
      sortedTiers.find((tier) => {
        const min = Number(tier.min_qty);
        const max =
          tier.max_qty === null ||
          tier.max_qty === undefined ||
          tier.max_qty === ""
            ? Infinity
            : Number(tier.max_qty);

        return enteredQty >= min && enteredQty <= max;
      }) || sortedTiers[sortedTiers.length - 1]
    );
  };

  const handleAddToCart = async (product, quantity) => {
    const enteredQty = Number(quantity || 1);
  
    const activeTier =
      product.price_breaks?.find(
        (tier) =>
          enteredQty >= Number(tier.min_qty) &&
          (!tier.max_qty || enteredQty <= Number(tier.max_qty))
      ) || null;
  
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
    <main className="bg-gray-100 min-h-screen">
      {addedProduct && (
        <div className="fixed top-5 right-5 z-50 bg-white border border-green-100 shadow-lg rounded-xl px-5 py-4">
          <p className="text-sm font-semibold text-green-700">Added to cart</p>
          <p className="text-xs text-[#071b3a]/55 mt-1">{addedProduct}</p>
        </div>
      )}

      <div className="hidden md:block sticky top-0 z-800 bg-[#4f5961]">
      </div>

        <div className="max-w-7xl mx-auto pt-6 pb-6">
        <div className="text-sm px-3 mb-2">
        <Link to="/" className="text-gray-700 hover:text-black transition-colors">
            Home
          </Link>
        </div>

        <div className="md:hidden bg-white border border-gray-300 p-4 mb-0">
          <h1 className="text-sm font-bold text-blue-grayuppercase">
            Search results for <span className="font-bold">'{q}'</span>
          </h1>

          <p className="text-sm text-gray-700 font-semibold">
            {products.length} products
          </p>
        </div>

        <div className="md:hidden bg-white border border-gray-300 border-t-0 shadow-sm mb-2">
          <div className="grid grid-cols-2 divide-x divide-gray-300">
            <button
              type="button"
              onClick={() => setShowMobileSort(true)}
              className="py-3 font-semibold text-sm flex items-center justify-center gap-2"
            >
              <SlidersHorizontal size={15} />
              Sort By
            </button>

            <button
              type="button"
              onClick={() => setShowMobileFilter(true)}
              className="py-3 font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Filter size={15} />
              Filter ({subcategory ? 1 : 0})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5">
          <aside className="hidden md:block space-y-4 sticky top-6 h-fit">
            <div className=" bg-white border border-gray-300 p-4">
              <h1 className="text-2xl font-bold text-gray-800 uppercase">
                Search results
              </h1>

              <p className="mt-1 text-lg">
                for <span className="font-bold">"{q}"</span>
              </p>

              <p className="text-sm text-gray-700 font-semibold">
                {products.length} products
              </p>
            </div>

            <div className="bg-white border border-gray-300 p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                Sub Categories
              </h2>

              <button
                onClick={() => updateFilter("category", "")}
                className={`block w-full text-left py-2 border-b border-gray-300 ${
                  !subcategory ? "font-bold text-green-700" : ""
                }`}
              >
                All sub categories
              </button>

              {subCategories.map((cat) => (
                <button
                  key={cat.category_id}
                  onClick={() =>
                    updateFilter("category", String(cat.category_id))
                  }
                  className={`block w-full text-left py-2 border-b border-gray-300 ${
                    subcategory === String(cat.category_id)
                      ? "font-bold text-green-700"
                      : ""
                  }`}
                >
                  {cat.category_name} ({cat.total})
                </button>
              ))}
            </div>
          </aside>

          <section>
            <div className="hidden md:flex bg-white border border-gray-300 p-4 mb-5 items-center justify-end gap-3">
              <div className="font-bold text-gray-800 whitespace-nowrap">
                Sort by:
              </div>

              <select
                value={sort}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className="border border-gray-300 px-4 py-2 w-64"
              >
                <option value="relevant">Most Relevant</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>

            {loading && (
              <div className="bg-white border border-gray-300 p-6">
                Searching products...
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="bg-white border border-gray-300 p-6">
                No products found.
              </div>
            )}

            {!loading && products.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    qty={qty[product.product_id] ?? 1}
                    activeTier={getActiveTier(product)}
                    onQtyChange={updateQty}
                    onSlabClick={setQtyFromSlab}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {showMobileFilter && (
        <div className="fixed inset-0 z-9999 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilter(false)}
          />

          <div className="absolute left-0 top-0 h-full w-[86%] max-w-85 bg-white shadow-xl flex flex-col">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-300">
              <button
                type="button"
                onClick={() => setShowMobileFilter(false)}
              >
                <X size={24} />
              </button>

              <h2 className="text-lg font-bold text-blue-800">Filters</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-4">
              <button
                onClick={() => {
                  updateFilter("category", "");
                  setShowMobileFilter(false);
                }}
                className={`w-full py-4 border-b border-gray-300 text-left font-bold text-sm ${
                  !subcategory ? "text-green-700" : "text-blue-800"
                }`}
              >
                All sub categories
              </button>

              {subCategories.map((cat) => (
                <button
                  key={cat.category_id}
                  onClick={() => {
                    updateFilter("category", String(cat.category_id));
                    setShowMobileFilter(false);
                  }}
                  className={`w-full py-4 border-b border-gray-300 text-left text-sm font-bold flex justify-between ${
                    subcategory === String(cat.category_id)
                      ? "text-green-700"
                      : "text-blue-800"
                  }`}
                >
                  <span>{cat.category_name}</span>
                  <span className="text-gray-500">({cat.total})</span>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-gray-300">
              <button
                type="button"
                onClick={() => setShowMobileFilter(false)}
                className="w-full bg-green-700 text-white py-3 rounded font-bold"
              >
                View {products.length} products
              </button>
            </div>
          </div>
        </div>
      )}

      {showMobileSort && (
        <div className="fixed inset-0 z-9999 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileSort(false)}
          />

          <div className="fixed left-4 right-4 bottom-10 bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-300">
              <h2 className="text-base font-bold text-blue-800">Sort By</h2>

              <button type="button" onClick={() => setShowMobileSort(false)}>
                <X size={22} />
              </button>
            </div>

            {[
              ["relevant", "Most Relevant"],
              ["price_asc", "Price: Low to High"],
              ["price_desc", "Price: High to Low"],
              ["name_asc", "Name: A to Z"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => {
                  updateFilter("sort", value);
                  setShowMobileSort(false);
                }}
                className={`w-full text-left px-4 py-4 border-b border-gray-300 text-sm ${
                  sort === value ? "font-bold text-green-700" : "text-gray-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}