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
  const [qty, setQty] = useState("1");
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("description");

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
        setQty("1");
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

  const getSpecValue = (name) => {
    const spec = product?.specifications?.find(
      (item) =>
        String(item.spec_name || "").trim().toLowerCase() ===
        String(name || "").trim().toLowerCase()
    );
  
    return String(spec?.spec_value || "").trim();
  };
  
  const unit = getSpecValue("Unit") || "Unit";
  
  const unitLabel =
    Number(qty || 1) === 1
      ? unit
      : unit.toLowerCase() === "box"
      ? "Boxes"
      : `${unit}s`;

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

  useEffect(() => {
    if (!product) return;
  
    document.title =
      product.meta_title || `${product.product_name} | Sara Wholesale`;
  
    let meta = document.querySelector('meta[name="description"]');
  
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
  
    meta.setAttribute(
      "content",
      product.meta_description ||
        `${product.product_name}. Buy online from Sara Wholesale.`
    );
  }, [product]);

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

  const lowestPrice =
  product.price_breaks?.length
    ? Math.min(
        ...product.price_breaks.map((p) => Number(p.price || 0))
      )
    : 0;

    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
    
      name: product.product_name,
      sku: product.sku,
      description: product.description,
      image: mainImage,
    
      brand: {
        "@type": "Brand",
        name: "Sara Wholesale",
      },
    
      offers: {
        "@type": "Offer",
        priceCurrency: "GBP",
        price: lowestPrice.toFixed(2),
        availability: "https://schema.org/InStock",
        url: window.location.href,
      },
    };
  const breadcrumbSchema =
  product && {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.sarawholesale.co.uk",
      },
      ...(parentCategory
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: parentCategory.category_name,
              item: `https://www.sarawholesale.co.uk/category/${parentCategory.slug}`,
            },
          ]
        : []),
      ...(currentCategory
        ? [
            {
              "@type": "ListItem",
              position: parentCategory ? 3 : 2,
              name: currentCategory.category_name,
              item: `https://www.sarawholesale.co.uk/subcategory/${currentCategory.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: parentCategory ? 4 : 3,
        name: product.product_name,
        item: `https://www.sarawholesale.co.uk/product/${product.slug}`,
      },
    ],
  };

  return (
    <main className="bg-[#f3f4f6] min-h-screen">
    {productSchema && (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(productSchema),
    }}
  />
)}
{breadcrumbSchema && (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(breadcrumbSchema),
    }}
  />
)}
      {added && (
        <div className="fixed top-5 right-5 z-50 bg-white border border-green-100 shadow-lg rounded-xl px-5 py-4">
          <p className="text-sm font-semibold text-green-700">Added to cart</p>
          <p className="text-xs text-[#071b3a]/55 mt-1">
            {product.product_name}
          </p>
        </div>
      )}
  
      <div className="hidden md:block sticky top-0 z-800">
        <CategoryMenu categories={categories} />
      </div>
  
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="hidden md:block text-xs font-semibold text-blue-800 mb-4 mt-4">
          <Link to="/" className="underline hover:text-green-700">
            Home
          </Link>
  
          {parentCategory && (
            <>
              <span className="mx-2 text-[#071b3a]/50">›</span>
              <Link
                to={`/category/${parentCategory.slug}`}
                className="underline hover:text-green-700"
              >
                {parentCategory.category_name}
              </Link>
            </>
          )}
  
          {currentCategory && (
            <>
              <span className="mx-2 text-[#071b3a]/50">›</span>
              <Link
                to={`/subcategory/${currentCategory.slug}`}
                className="underline hover:text-green-700"
              >
                {currentCategory.category_name}
              </Link>
            </>
          )}
  
          <span className="mx-2 text-[#071b3a]/50">›</span>
          <span className="text-[#071b3a]/70">{product.product_name}</span>
        </div>
  
        <div className="md:hidden mb-4 mt-3">
          <Link
            to={currentCategory ? `/subcategory/${currentCategory.slug}` : "/"}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#071b3a] hover:text-green-700"
          >
            <ArrowLeft size={16} />
            {currentCategory?.category_name || "Products"}
          </Link>
        </div>
  
        <div className="bg-white border border-[#dfe5ee] shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-[390px_1fr_330px] gap-0">
            <div className="p-5 md:p-7 border-b lg:border-b-0 lg:border-r border-[#edf1f7]">
              <div className="h-80 md:h-105 flex items-center justify-center bg-white">
                {mainImageSrc ? (
                  <img
                    src={mainImageSrc}
                    alt={product.product_name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-[#f8fafc]" />
                )}
              </div>
  
              {productImages.length > 1 && (
                <div className="flex items-center justify-center gap-3 mt-5">
                  <button
                    type="button"
                    className="h-10 w-10 border border-[#d9e2ef] bg-[#f8fafc] flex items-center justify-center hover:bg-white"
                  >
                    <ChevronLeft size={22} />
                  </button>
  
                  {productImages.slice(0, 3).map((img) => {
                    const src = getImageSrc(img.image_url);
                    const active = selectedImage === img.image_url;
  
                    return (
                      <button
                        key={img.image_id || img.image_url}
                        type="button"
                        onClick={() => setSelectedImage(img.image_url)}
                        className={`h-16 w-16 border bg-white p-1 flex items-center justify-center ${
                          active
                            ? "border-green-600 ring-1 ring-green-200"
                            : "border-[#d9e2ef] hover:border-green-400"
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
  
                  <button
                    type="button"
                    className="h-10 w-10 border border-[#d9e2ef] bg-[#f8fafc] flex items-center justify-center hover:bg-white"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>
              )}
            </div>
  
            <div className="p-5 md:p-7 border-b lg:border-b-0 lg:border-r border-[#edf1f7]">
              <h1 className="text-2xl md:text-3xl font-extrabold text-blue-800 leading-tight uppercase">
                {product.product_name}
              </h1>
  
              <p className="text-sm text-[#071b3a]/55 mt-3">
                SKU: {product.sku || "N/A"}
              </p>
  
              <p
                className={`text-sm font-bold mt-4 ${
                  Number(product.stock_qty) < 1
                    ? "text-green-700"
                    : "text-red-600"
                }`}
              >
                {Number(product.stock_qty) < 1 ? "✓ In stock" : "Out of stock"}
              </p>
  
              {product.price_breaks?.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-sm font-bold text-blue-800 mb-3 uppercase">
                    Price breaks
                  </h2>
  
                  <div className="grid grid-cols-2 gap-2 max-w-md">
                    {product.price_breaks.map((tier) => {
                      const isActive = activeTier === tier;
  
                      return (
                        <button
                          type="button"
                          key={`${tier.min_qty}-${tier.max_qty}`}
                          onClick={() => handleSlabClick(tier)}
                          className={`border text-center transition ${
                            isActive
                              ? "border-green-600 bg-green-50"
                              : "border-[#d9e2ef] bg-white hover:border-green-500"
                          }`}
                        >
                          <div className="text-xs font-bold bg-[#f5f7fb] px-3 py-2 text-[#071b3a]">
                            {getSlabLabel(tier)}
                          </div>
  
                          <div className="font-extrabold text-sm px-3 py-2 text-green-700">
                            £{Number(tier.price).toFixed(2)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
  
              
  
              <p className="text-sm text-[#071b3a] mt-5">
                <span className="font-bold">VAT:</span>{" "}
                {Number(product.vat_rate || 0).toFixed(0)}%
              </p>
  
              {currentCategory && (
                <p className="text-sm text-[#071b3a] mt-5">
                  View all:{" "}
                  <Link
                    to={`/subcategory/${currentCategory.slug}`}
                    className="text-blue-700 underline font-semibold"
                  >
                    {currentCategory.category_name}
                  </Link>
                </p>
              )}
            </div>
  
            <aside className="p-5 md:p-7">
              <div className="sticky top-24">
                <p className="text-4xl md:text-5xl font-extrabold text-[#3f4043] leading-none">
                  £{Number(unitPrice).toFixed(2)}
                </p>
  
                <p className="text-xs font-bold text-[#071b3a]/60 mt-1">
                  Price per {unit}  Exc. VAT
                </p>
  
                <div className="border-t border-[#edf1f7] my-5" />
  
                <div className="mb-5">
                  <p className="text-sm font-extrabold text-blue-800 mb-2">
                    QTY
                  </p>
  
                  <QtyAddControl
                    value={qty}
                    onQtyChange={setQty}
                    onAdd={(quantity) => handleAddToCart(quantity)}
                  />
                </div>
  
                {qty > 0 && (
                  <p className="text-xs text-[#071b3a]/60 mb-4">
                  Total for {qty} {unitLabel}:
                    <span className="font-bold text-[#071b3a] ml-1">
                      £{(Number(qty) * Number(unitPrice)).toFixed(2)}
                    </span>
                  </p>
                )}
  
                <div className="border-t border-[#edf1f7] pt-5 space-y-3 text-sm text-[#071b3a]">
                  <p className="flex items-center gap-2 font-bold">
                    <span className="h-4 w-4 rounded-full bg-green-700 inline-block" />
                    Available for delivery
                  </p>
                </div>
  
                <div className="mt-5 border border-[#d9e2ef] bg-[#f8fafc] p-4 space-y-3 text-sm text-[#071b3a]">
                  <p className="font-semibold">✓ Trade price available</p>
                  {/* <p className="font-semibold">✓ VAT calculated at invoice stage</p>
                  <p className="font-semibold">✓ Order request safely submitted</p> */}
                </div>
              </div>
            </aside>
          </div>
        </div>


              <div className="mt-6 bg-white border border-[#d9e2ef] shadow-sm">

                  {/* Tabs */}
                  <div className="flex border-b border-[#d9e2ef]">
                    <button
                      type="button"
                      onClick={() => setActiveTab("description")}
                      className={`px-6 py-4 font-bold text-sm transition ${
                        activeTab === "description"
                          ? "bg-white text-blue-800 border-b-2 border-green-600"
                          : "bg-[#f5f7fb] text-[#071b3a]/60"
                      }`}
                    >
                      Description
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("specifications")}
                      className={`px-6 py-4 font-bold text-sm transition ${
                        activeTab === "specifications"
                          ? "bg-white text-blue-800 border-b-2 border-green-600"
                          : "bg-[#f5f7fb] text-[#071b3a]/60"
                      }`}
                    >
                      Product Specifications
                    </button>
                  </div>

                  {/* Description Tab */}
                  {activeTab === "description" && (
                    <div className="p-6">
                      <p className="text-sm leading-7 text-[#3f4043] whitespace-pre-line">
                        {product.description || "No description available."}
                      </p>
                    </div>
                  )}

                  {/* Specification Tab */}
                  {activeTab === "specifications" && (
                    <div>
                      {product.specifications?.length > 0 ? (
                        <table className="w-full text-sm">
                          <tbody>
                            {product.specifications.map((spec) => (
                              <tr
                                key={spec.spec_id || spec.spec_name}
                                className="border-b border-[#edf1f7] last:border-b-0"
                              >
                                <td className="w-[30%] px-4 py-3 font-bold bg-[#f5f7fb]">
                                  {spec.spec_name}
                                </td>

                                <td className="px-4 py-3 text-[#071b3a]/80">
                                  {spec.spec_value}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-6 text-sm text-[#071b3a]/60">
                          No specifications available.
                        </div>
                      )}
                    </div>
                  )}
              </div>

              {product.seo_content && (
  <div className="mt-8 border-t pt-6">
    <h2 className="text-xl font-semibold mb-3">
      Product Information
    </h2>

    <p className="text-gray-700 leading-relaxed">
      {product.seo_content}
    </p>
  </div>
)}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-extrabold text-blue-800">
                You may also like:
              </h2>
  
              <div className="hidden md:flex gap-2">
                <button
                  type="button"
                  onClick={() => scrollRelated("left")}
                  className="h-10 w-10 border border-[#d9e2ef] bg-white shadow-sm flex items-center justify-center"
                >
                  <ChevronLeft size={24} />
                </button>
  
                <button
                  type="button"
                  onClick={() => scrollRelated("right")}
                  className="h-10 w-10 border border-[#d9e2ef] bg-white shadow-sm flex items-center justify-center"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
  
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
                    className="shrink-0 w-55 md:w-60 bg-white border border-[#d9e2ef] shadow-sm p-4 hover:border-green-500 transition"
                  >
                    <div className="h-36 bg-white flex items-center justify-center mb-3">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.product_name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </div>
  
                    <h3 className="text-sm font-extrabold text-blue-800 leading-snug line-clamp-2 uppercase">
                      {item.product_name}
                    </h3>
  
                    <p className="text-[11px] text-[#071b3a]/45 mt-1">
                      SKU: {item.sku || "N/A"}
                    </p>
  
                    {firstPrice && (
                      <p className="text-xl font-extrabold text-[#071b3a] mt-2">
                        £{Number(firstPrice).toFixed(2)}
                      </p>
                    )}
  
                    <p className="text-[11px] text-[#071b3a]/45 mt-1">
                      {item.category_name}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
      
    </main>
  );
}