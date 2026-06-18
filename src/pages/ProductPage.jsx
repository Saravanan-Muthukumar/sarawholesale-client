import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import CategoryMenu from "../components/CategoryMenu";
import QtyAddControl from "../components/QtyAddControl";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function ProductPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const relatedScrollRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [qty, setQty] = useState("");
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setAllProducts(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setSelectedImage(data?.images?.[0]?.image_url || data?.image_url || "");
        setQty("");
      })
      .catch(console.error);
  }, [slug]);

  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  };

  const productImages = useMemo(() => {
    if (!product) return [];

    if (product.images?.length) return product.images;

    if (product.image_url) {
      return [
        {
          image_id: "main",
          image_url: product.image_url,
          alt_text: product.product_name,
        },
      ];
    }

    return [];
  }, [product]);

  const mainImageSrc = getImageSrc(selectedImage || productImages[0]?.image_url);
  const enteredQty = Number(qty || 0);

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
    if (!product?.price_breaks?.length || enteredQty <= 0) return null;

    return product.price_breaks.find((tier) => {
      const min = Number(tier.min_qty);
      const max = tier.max_qty ? Number(tier.max_qty) : Infinity;
      return enteredQty >= min && enteredQty <= max;
    });
  }, [product, enteredQty]);

  const unitPrice = activeTier
    ? Number(activeTier.price)
    : Number(product?.price_breaks?.[0]?.price || product?.selling_price || 0);

  const relatedProducts = useMemo(() => {
    if (!product || !allProducts.length) return [];

    const sameSubCategory = allProducts.filter(
      (item) =>
        item.product_id !== product.product_id &&
        String(item.category_id) === String(product.category_id)
    );

    const siblingCategoryIds = categories
      .filter(
        (cat) =>
          cat.parent_category_id &&
          cat.parent_category_id === currentCategory?.parent_category_id &&
          cat.category_id !== currentCategory?.category_id
      )
      .map((cat) => cat.category_id);

    const sameParentCategory = allProducts.filter(
      (item) =>
        item.product_id !== product.product_id &&
        siblingCategoryIds.includes(item.category_id)
    );

    return [...sameSubCategory, ...sameParentCategory].slice(0, 12);
  }, [product, allProducts, categories, currentCategory]);

  const getSlabLabel = (tier) =>
    tier.max_qty ? `${tier.min_qty}-${tier.max_qty}` : `${tier.min_qty}+`;

  const updateQty = (value) => {
    if (value === "") {
      setQty("");
      return;
    }

    setQty(Math.max(0, Number(value) || 0));
  };

  const handleSlabClick = (tier) => {
    setQty(Number(tier.min_qty));
  };

  const scrollRelated = (direction) => {
    relatedScrollRef.current?.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  const handleAddToCart = async (quantity) => {
    if (!product) return;

    if (!quantity || Number(quantity) <= 0) {
      alert("Please enter quantity");
      return;
    }

    try {
      await addToCart({
        product_id: product.product_id,
        product_name: product.product_name,
        sku: product.sku,
        image_url: selectedImage || product.image_url,
        quantity,
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
          <Link
            to={currentCategory ? `/subcategory/${currentCategory.slug}` : "/"}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#071b3a]/60 hover:text-green-700"
          >
            <ArrowLeft size={16} />
            {currentCategory?.category_name || "Products"}
          </Link>
        </div>

        <div className="bg-white border border-[#edf1f7] rounded-2xl shadow-sm p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-[420px_1fr] gap-6">
            <div>
              <div className="border border-[#edf1f7] rounded-2xl bg-white h-80 md:h-[430px] flex items-center justify-center p-5">
                {mainImageSrc ? (
                  <img
                    src={mainImageSrc}
                    alt={product.product_name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-[#f8fafc] rounded-xl" />
                )}
              </div>

              {productImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {productImages.map((img) => {
                    const src = getImageSrc(img.image_url);
                    const active = selectedImage === img.image_url;

                    return (
                      <button
                        key={img.image_id || img.image_url}
                        type="button"
                        onClick={() => setSelectedImage(img.image_url)}
                        className={`h-16 border rounded-xl bg-white p-1 flex items-center justify-center ${
                          active
                            ? "border-green-500 ring-2 ring-green-100"
                            : "border-[#edf1f7] hover:border-green-300"
                        }`}
                      >
                        <img
                          src={src}
                          alt={img.alt_text || product.product_name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </button>
                    );
                  })}
                </div>
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

              <div className="mt-6">
                <h2 className="font-bold text-[#071b3a] mb-3">
                  Price breaks{" "}
                  <span className="text-sm font-normal text-[#071b3a]/55">
                    (click slab to select qty)
                  </span>
                </h2>

                <div className="grid gap-2 md:max-w-xl">
                  {product.price_breaks?.map((tier) => {
                    const isActive = activeTier === tier;

                    return (
                      <button
                        type="button"
                        key={`${tier.min_qty}-${tier.max_qty}`}
                        onClick={() => handleSlabClick(tier)}
                        className={`border rounded-xl overflow-hidden text-center transition cursor-pointer ${
                          isActive
                            ? "border-green-300 bg-green-50 ring-1 ring-green-100"
                            : "border-[#e8eef6] bg-white hover:border-green-200 hover:bg-green-50"
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
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-green-100 bg-green-50/40 p-4 max-w-xl">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#071b3a]/55 mb-1">
                        Unit price
                      </p>

                      <p className="text-2xl font-bold text-green-700 leading-none">
                        £{Number(unitPrice).toFixed(2)}
                      </p>

                      <p className="text-[11px] text-[#071b3a]/50 mt-1">
                        per unit exc. VAT
                      </p>

                      {qty > 0 && (
                        <p className="text-xs text-[#071b3a]/60 mt-2">
                          Total for {qty} units:
                          <span className="font-semibold text-[#071b3a] ml-1">
                            £{(Number(qty) * Number(unitPrice)).toFixed(2)}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2">
                      <span className="text-xs font-semibold text-[#071b3a]/60">
                        Quantity
                      </span>

                      <QtyAddControl
                        onAdd={(quantity) => handleAddToCart(quantity)}
                      />
                    </div>
                  </div>
                </div>

              <div className="border-t border-[#edf1f7] my-6" />

              <h2 className="font-bold text-[#071b3a] mb-2">Description</h2>
              <p className="text-sm leading-7 text-[#071b3a]/80 max-w-2xl">
                {product.description || "No description available."}
              </p>

              {product.specifications?.length > 0 && (
                <div className="mt-6 border border-[#edf1f7] rounded-xl overflow-hidden max-w-lg">
                  <div className="bg-[#f8fafc] px-4 py-2 text-sm font-bold text-[#071b3a]">
                    Product Specifications
                  </div>

                  <table className="w-full text-sm">
                    <tbody>
                      {product.specifications.map((spec) => (
                        <tr
                          key={spec.spec_id || spec.spec_name}
                          className="border-t border-[#edf1f7]"
                        >
                          <td className="w-[36%] px-4 py-2.5 font-semibold text-[#071b3a]/70 bg-[#fbfcfe]">
                            {spec.spec_name}
                          </td>
                          <td className="px-4 py-2.5 text-[#071b3a]/80">
                            {spec.spec_value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-sm text-[#071b3a] mt-5">
                <span className="font-bold">VAT rate:</span>{" "}
                {Number(product.vat_rate || 0).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-8 bg-white border border-[#edf1f7] rounded-2xl shadow-sm p-4 md:p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#071b3a]">
                Related Products
              </h2>

              {currentCategory && (
                <Link
                  to={`/subcategory/${currentCategory.slug}`}
                  className="text-xs font-semibold text-green-700 hover:text-green-800"
                >
                  View more
                </Link>
              )}
            </div>

            <div className="relative">
              {relatedProducts.length > 4 && (
                <button
                  type="button"
                  onClick={() => scrollRelated("left")}
                  className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 h-14 w-14 rounded-full bg-white border border-[#edf1f7] shadow-xl items-center justify-center text-[#071b3a] hover:text-green-700 hover:border-green-300"
                >
                  <ChevronLeft size={36} />
                </button>
              )}

              <div
                ref={relatedScrollRef}
                className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth pb-2 scrollbar-hide"
              >
                {relatedProducts.map((item) => {
                  const imageUrl =
                    item.image_url?.startsWith("http")
                      ? item.image_url
                      : item.image_url
                      ? `${API_URL}${item.image_url}`
                      : "";

                  const firstPrice = item.price_breaks?.[0]?.price;

                  return (
                    <Link
                      key={item.product_id}
                      to={`/product/${item.slug}`}
                      className="shrink-0 w-[210px] sm:w-[240px] md:w-[calc((100%-48px)/4)] bg-white border border-[#edf1f7] rounded-2xl p-3 hover:border-green-300 hover:shadow-sm transition"
                    >
                      <div className="h-32 md:h-36 bg-[#f8fafc] rounded-xl flex items-center justify-center p-3 mb-3">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.product_name}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-lg" />
                        )}
                      </div>

                      <h3 className="text-xs md:text-sm font-semibold text-[#071b3a] leading-snug line-clamp-2">
                        {item.product_name}
                      </h3>

                      <p className="text-[11px] text-[#071b3a]/45 mt-1">
                        SKU: {item.sku || "N/A"}
                      </p>

                      {firstPrice && (
                        <p className="text-sm font-bold text-green-700 mt-2">
                          From £{Number(firstPrice).toFixed(2)}
                        </p>
                      )}

                      <p className="text-[11px] text-[#071b3a]/45 mt-1">
                        {item.category_name}
                      </p>
                    </Link>
                  );
                })}
              </div>

              {relatedProducts.length > 4 && (
                <button
                  type="button"
                  onClick={() => scrollRelated("right")}
                  className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 h-14 w-14 rounded-full bg-white border border-[#edf1f7] shadow-xl items-center justify-center text-[#071b3a] hover:text-green-700 hover:border-green-300"
                >
                  <ChevronRight size={36} />
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}