import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CategoryMenu from "../components/CategoryMenu";
import ProductCard from "../components/ProductCard";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function ProductListPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const categoryScrollRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [qty, setQty] = useState({});
  const [addedProduct, setAddedProduct] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  const currentCategory = categories.find((cat) => cat.slug === slug);

  const parentCategory = currentCategory?.parent_category_id
    ? categories.find(
        (cat) => cat.category_id === currentCategory.parent_category_id
      )
    : null;

  const sideSubCategories = categories.filter(
    (cat) =>
      cat.parent_category_id ===
      (parentCategory?.category_id || currentCategory?.category_id)
  );

  const relatedCategories = sideSubCategories.filter(
    (cat) => cat.category_id !== currentCategory?.category_id
  );

  const getImage = (imageUrl) => {
    if (!imageUrl) return "";
    return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  };

  const scrollCategories = (direction) => {
    categoryScrollRef.current?.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

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

  const handleAddToCart = async (product) => {
    const enteredQty = Number(qty[product.product_id] || 1);
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
      setErrorMessage(err.message || "Failed to add to cart");
      setTimeout(() => setErrorMessage(""), 2500);
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
      {errorMessage && (
        <div className="fixed top-5 right-5 z-50 bg-red-50 border border-red-200 shadow-lg rounded-xl px-5 py-4">
          <p className="text-sm font-semibold text-red-700">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Category menu below header - not sticky */}
      <div className="hidden md:block bg-[#4a5358]">
      <CategoryMenu categories={categories} />
      </div>

      <section className="max-w-7xl mx-auto px-4 pt-6 pb-6">
        <div className="hidden md:block text-sm mb-2">
          <Link to="/" className="text-blue-700 underline">
            Home
          </Link>

          {parentCategory && (
            <>
              <span className="mx-2">›</span>
              <Link
                to={`/category/${parentCategory.slug}`}
                className="text-blue-700 underline"
              >
                {parentCategory.category_name}
              </Link>
            </>
          )}

          <span className="mx-2">›</span>
          <span>{currentCategory?.category_name || "Products"}</span>
        </div>

        <div className="md:hidden mb-4">
          <Link
            to={parentCategory ? `/category/${parentCategory.slug}` : "/"}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600"
          >
            <ArrowLeft size={16} />
            {parentCategory?.category_name || "Categories"}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-5">
        <aside className="hidden lg:block space-y-4 sticky top-[70px] h-fit">
            <div className="bg-white border border-gray-300 p-4">
              <h1 className="text-2xl font-bold text-blue-800 uppercase leading-tight">
                {currentCategory?.category_name || "Products"}
              </h1>

              <p className="text-sm text-blue-700 font-semibold mt-1">
                {products.length} products
              </p>
            </div>

            <div className="bg-white border border-gray-300 p-4">
              <h2 className="text-xl font-bold text-blue-800 mb-3">
                Sub Categories
              </h2>

              {sideSubCategories.map((cat) => (
                <Link
                  key={cat.category_id}
                  to={`/subcategory/${cat.slug}`}
                  className={`block w-full text-left py-2 border-b border-gray-300 ${
                    cat.slug === slug ? "font-bold text-green-700" : ""
                  }`}
                >
                  {cat.category_name}
                </Link>
              ))}
            </div>
          </aside>

          <section className="min-w-0">
            <div className="lg:hidden bg-white border border-gray-300 p-4 mb-4">
              <h1 className="text-sm font-bold text-blue-800 uppercase">
                {currentCategory?.category_name || "Products"}
              </h1>

              <p className="text-sm text-blue-700 font-semibold">
                {products.length} products
              </p>
            </div>

            {products.length === 0 && (
              <div className="bg-white border border-gray-300 p-6">
                No products found.
              </div>
            )}

            {products.length > 0 && (
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">
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

            {relatedCategories.length > 0 && (
              <div className="mt-8 bg-white border border-gray-300 p-4 overflow-hidden">
                <h2 className="text-xl font-bold text-blue-800 mb-4">
                  Related Categories
                </h2>

                <div className="relative">
                  {relatedCategories.length > 4 && (
                    <button
                      type="button"
                      onClick={() => scrollCategories("left")}
                      className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 h-12 w-12 rounded-full bg-white border border-gray-300 shadow items-center justify-center"
                    >
                      <ChevronLeft size={30} />
                    </button>
                  )}

                  <div
                    ref={categoryScrollRef}
                    className="flex gap-4 overflow-x-auto pb-2"
                  >
                    {relatedCategories.map((cat) => (
                      <Link
                        key={cat.category_id}
                        to={`/subcategory/${cat.slug}`}
                        className="shrink-0 w-[210px] bg-white border border-gray-300 p-3 hover:shadow-sm transition"
                      >
                        <div className="h-36 bg-gray-50 flex items-center justify-center mb-3">
                          {cat.image_url && (
                            <img
                              src={getImage(cat.image_url)}
                              alt={cat.category_name}
                              className="max-w-full max-h-full object-contain"
                            />
                          )}
                        </div>

                        <p className="text-sm font-semibold text-center">
                          {cat.category_name}
                        </p>
                      </Link>
                    ))}
                  </div>

                  {relatedCategories.length > 4 && (
                    <button
                      type="button"
                      onClick={() => scrollCategories("right")}
                      className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 h-12 w-12 rounded-full bg-white border border-gray-300 shadow items-center justify-center"
                    >
                      <ChevronRight size={30} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}