import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import QtyAddControl from "../components/QtyAddControl";
import { Helmet } from "react-helmet-async";
import PriceTier from "../components/PriceTier";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function ProductPage() {
  const { slug } = useParams();
  const { addToCart, cartItems = [] } = useCart();
  const relatedScrollRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [qty, setQty] = useState("1");
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("description");
  const [qtyWarning, setQtyWarning] = useState("");
  
  const qtyInCart =
    cartItems.find(
      (item) => Number(item.product_id) === Number(product?.product_id)
    )?.quantity || 0;

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
  const stockQty = Number(product?.stock_qty || 0);
  const qtyInCartNumber = Number(qtyInCart || 0);
  const availableQty = Math.max(stockQty - qtyInCartNumber, 0);
  const isOutOfStock = stockQty < 1 || availableQty < 1;

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

  const getSlabLabel = (tier) => {
    const slabUnit =
      String(unit).toLowerCase() === "box" && Number(tier.min_qty) > 1
        ? "Boxes"
        : Number(tier.min_qty) === 1
        ? unit
        : `${unit}s`;
  
    return tier.max_qty
      ? `${tier.min_qty}-${tier.max_qty} ${slabUnit}`
      : `${tier.min_qty}+ ${slabUnit}`;
  };

  const handleQtyChange = (value) => {
    const numberValue = Number(value) || 1;
    setQty(String(Math.max(1, numberValue)));
    setQtyWarning("");
  };

  const handleSlabClick = (tier) => {
    const availableQty = Number(product?.stock_qty || 0);
    setQty(Math.min(Number(tier.min_qty), availableQty));
  };

  const scrollRelated = (direction) => {
    relatedScrollRef.current?.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  const handleAddToCart = async (quantity) => {
    if (!product) return;
  
    const finalQty = Number(quantity || qty || 0);
  
    if (isOutOfStock) {
      setQtyWarning("This product is out of stock");
      return;
    }
  
    if (!finalQty || finalQty <= 0) {
      setQtyWarning("Please enter quantity");
      return;
    }
    try {
      await addToCart({
        product_id: product.product_id,
        product_name: product.product_name,
        sku: product.sku,
        image_url: selectedImage || product.image_url,
        quantity: finalQty,
        unit_price: unitPrice,
        price: unitPrice,
      });
  
      setQtyWarning("");
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (!product) {
    return (
      <main className="bg-[#fbfcfe] min-h-screen px-4 py-10">
        <p className="text-sm text-[#071b3a]/60">Loading product....</p>
      </main>
    );
  }

  const lowestPrice =
    product.price_breaks?.length
      ? Math.min(...product.price_breaks.map((p) => Number(p.price || 0)))
      : 0;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.product_name,
    sku: product.sku,
    description: product.description,
    image: mainImageSrc,
    brand: {
      "@type": "Brand",
      name: "Sara Wholesale",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      price: lowestPrice.toFixed(2),
      availability: "https://schema.org/InStock",
      url: `https://www.sarawholesale.co.uk/product/${product.slug}`,
    },
  };

  const breadcrumbSchema = product && {
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
    <main className="bg-[#f7f7f7] min-h-screen">
      <Helmet>
        <title>{product.meta_title || `${product.product_name} | SARA WHOLESALE`}</title>
        <meta name="description" content={product.meta_description || `${product.product_name}. Available from SARA WHOLESALE with competitive trade pricing and UK delivery.`} />
        <link rel="canonical" href={`https://www.sarawholesale.co.uk/product/${product.slug}`} />
        <meta property="og:title" content={product.meta_title || `${product.product_name} | SARA WHOLESALE`} />
        <meta property="og:description" content={product.meta_description || `${product.product_name}. Available from SARA WHOLESALE.`} />
        <meta property="og:url" content={`https://www.sarawholesale.co.uk/product/${product.slug}`} />
        <meta property="og:type" content="product" />
      </Helmet>
      {productSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      )}
      {added && (
        <div className="fixed top-5 right-5 z-50 bg-white border border-green-100 shadow-lg px-5 py-4">
          <p className="text-sm font-semibold text-green-700">Added to cart</p>
          <p className="text-xs text-[#071b3a]/55 mt-1">{product.product_name}</p>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="hidden md:flex items-center text-sm font-semibold text-[#071b3a]/70 mb-4 mt-4">
          <Link to="/" className="text-gray-700 hover:text-red-700 cursor-pointer">Home</Link>
          {parentCategory && (
            <>
              <span className="mx-2 text-[#071b3a]/50">›</span>
              <Link to={`/category/${parentCategory.slug}`} className="text-gray-700 hover:text-red-700 cursor-pointer">
                {parentCategory.category_name}
              </Link>
            </>
          )}
          {currentCategory && (
            <>
              <span className="mx-2 text-[#071b3a]/50">›</span>
              <Link to={`/subcategory/${currentCategory.slug}`} className="text-gray-700 hover:text-red-700 cursor-pointer">
                {currentCategory.category_name}
              </Link>
            </>
          )}
          <span className="mx-2 text-[#071b3a]/50">›</span>
          <span className="text-gray-900">{product.product_name}</span>
        </div>

        <div className="md:hidden mb-4 mt-3">
        <Link
          to={currentCategory ? `/subcategory/${currentCategory.slug}` : "/"}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
            <ArrowLeft size={16} />
            {currentCategory?.category_name || "Products"}
          </Link>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[390px_1fr_330px] gap-0">
            <div className="p-5 md:p-7 border-b lg:border-b-0 lg:border-r border-gray-200">
              <div className="h-80 md:h-105 flex items-center justify-center bg-white">
                {mainImageSrc ? (
                  <img src={mainImageSrc} alt={product.product_name} className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-[#f8fafc]" />
                )}
              </div>

              {productImages.length > 1 && (
                <div className="flex items-center justify-center gap-3 mt-5">
                  <button type="button" className="h-10 w-10 border border-[#d9e2ef] bg-[#f8fafc] flex items-center justify-center hover:bg-white">
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
                        className={`h-16 w-16 border bg-white p-1 flex items-center justify-center transition-colors ${
                        active
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-500"
                        }`}
                      >
                        <img src={src} alt={img.alt_text || product.product_name} className="max-w-full max-h-full object-contain" />
                      </button>
                    );
                  })}

                  <button type="button" className="h-10 w-10 border border-[#d9e2ef] bg-[#f8fafc] flex items-center justify-center hover:bg-white">
                    <ChevronRight size={22} />
                  </button>
                </div>
              )}
            </div>

            <div className="p-5 md:p-7 border-b lg:border-b-0 lg:border-r border-gray-200">
              <h1 className="text-xl md:text-xl font-bold text-[#071b3a] leading-tight">{product.product_name}</h1>
              <p className="text-sm text-[#071b3a]/55 mt-3">SKU: {product.sku || "N/A"}</p>
              <p className={`text-sm font-bold mt-4 ${Number(product.stock_qty) > 0 ? "text-green-700" : "text-red-600"}`}>
                {Number(product.stock_qty) > 0 ? "✓ In stock" : "Out of stock"}
              </p>

              {product.price_breaks?.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-sm font-bold text-gray-900 mb-3">
                    Buy more for more savings
                  </h2>

                  <div className="max-w-md">
                    <PriceTier
                      tiers={product.price_breaks}
                      currentQty={qty}
                      isOutOfStock={isOutOfStock}
                      hasQtyChanged={Number(qty) !== 1}
                      getSlabLabel={(tier) =>
                        tier.max_qty
                          ? `${Number(tier.min_qty)}-${Number(tier.max_qty)}`
                          : `${Number(tier.min_qty)}+`
                      }
                      onSelect={(tier) => {
                        handleSlabClick(tier);
                        setQtyWarning("");
                      }}
                      unit={unit}
                    />
                  </div>
                </div>
              )}

              <p className="text-sm text-[#071b3a] mt-5"><span className="font-bold">VAT:</span> {Number(product.vat_rate || 0).toFixed(0)}%</p>
              {currentCategory && (
                <p className="text-sm text-[#071b3a] mt-5">
                  View all:{" "}
                  <Link to={`/subcategory/${currentCategory.slug}`} className="text-gray-700 underline font-semibold">
                    {currentCategory.category_name}
                  </Link>
                </p>
              )}
            </div>

            <aside className="p-5 md:p-7">
              <div className="sticky top-24">
                <p className="text-lg md:text-3xl font-extrabold text-[#3f4043] leading-none">£{Number(unitPrice).toFixed(2)}</p>
                <p className="text-xs font-bold text-[#071b3a]/60 mt-1">Price per {unit} Exc. VAT</p>
                <div className="border-t border-gray-200 my-5" />

                <div className="mb-5">
                  {qtyInCart > 0 && (
                    <p className="mb-3 text-sm text-gray-700"><strong>{qtyInCart}</strong> already added to cart</p>
                  )}
                  {isOutOfStock ? (
                    <button type="button" disabled className="w-full bg-gray-300 text-gray-500 px-4 py-3 font-bold cursor-not-allowed">Out of stock</button>
                  ) : (
                    <QtyAddControl
                      value={qty}
                      maxQty={availableQty}
                      disabled={isOutOfStock}
                      onMaxQty={() => setQtyWarning(qtyInCart > 0 ? `Only ${availableQty} available to add, ${qtyInCart} already in cart` : `Only ${availableQty} available to add`)}
                      onQtyChange={(value) => {
                        if (value === "") {
                          setQty("");
                          setQtyWarning("");
                          return;
                        }
                        const nextQty = Number(value) || 1;
                        setQty(String(nextQty));
                        setQtyWarning("");
                      }}
                      onAdd={handleAddToCart}
                    />
                  )}
                </div>
                {qtyWarning && (
                  <div className="mt-2 rounded border border-amber-200 bg-amber-50 px-3 py-2">
                    <p className="text-xs font-medium text-amber-700">{qtyWarning}</p>
                  </div>
                )}

                {Number(qty) > 0 && (
                  <p className="text-xs text-[#071b3a]/60 mb-4">
                    Total for {qty} {unitLabel}:
                    <span className="font-bold text-[#071b3a] ml-1">£{(Number(qty) * Number(unitPrice)).toFixed(2)}</span>
                  </p>
                )}

                <div className="border-t border-gray-200 pt-5 space-y-3 text-sm text-[#071b3a]">
                  <p className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-700 inline-block" />
                    Order above 40 for next day free delivery
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-700 inline-block" />
                    Checkout before 1 PM for next day delivery
                  </p>
                </div>
                <div className="mt-5 border border-[#d9e2ef] bg-[#f8fafc] p-4 space-y-3 text-sm text-[#071b3a]">
                  <p className="font-semibold">✓ Trade price available</p>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <div className="mt-6 bg-white border border-[#d9e2ef] shadow-sm">
          <div className="flex border-b border-[#d9e2ef]">
            <button type="button" onClick={() => setActiveTab("description")} className={`px-6 py-4 font-bold text-sm transition ${activeTab === "description" ? "bg-white text-black border-b-2 border-red-600" : "bg-[#f5f7fb] text-[#071b3a]/60"}`}>
              Description
            </button>
            <button type="button" onClick={() => setActiveTab("specifications")} className={`px-6 py-4 font-bold text-sm transition ${activeTab === "specifications" ? "bg-white text-black border-b-2 border-red-600" : "bg-[#f5f7fb] text-[#071b3a]/60"}`}>
              Product Specifications
            </button>
          </div>

          {activeTab === "description" && (
            <div className="p-6">
              <p className="text-sm leading-7 text-[#3f4043] whitespace-pre-line">{product.description || "No description available."}</p>
            </div>
          )}

          {activeTab === "specifications" && (
            <div>
              {product.specifications?.length > 0 ? (
                <table className="w-full text-sm">
                  <tbody>
                    {product.specifications.map((spec) => (
                      <tr key={spec.spec_id || spec.spec_name} className="border-b border-gray-200 last:border-b-0">
                        <td className="w-[30%] px-4 py-3 font-bold bg-[#f5f7fb]">{spec.spec_name}</td>
                        <td className="px-4 py-3 text-[#071b3a]/80">{spec.spec_value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-sm text-[#071b3a]/60">No specifications available.</div>
              )}
            </div>
          )}
        </div>

        {product.seo_content && (
          <div className="mt-8 bg-white border border-[#d9e2ef] p-6 md:p-8">
            <div
              className="text-[#333] text-sm md:text-base leading-7 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-gray-800 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-blue-800 [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_li]:mb-1 [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-100"
              dangerouslySetInnerHTML={{ __html: product.seo_content }}
            />
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">You may also like:</h2>
              <div className="hidden md:flex gap-2">
                <button type="button" onClick={() => scrollRelated("left")} className="h-10 w-10 border border-[#d9e2ef] bg-white shadow-sm flex items-center justify-center">
                  <ChevronLeft size={24} />
                </button>
                <button type="button" onClick={() => scrollRelated("right")} className="h-10 w-10 border border-[#d9e2ef] bg-white shadow-sm flex items-center justify-center">
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            <div ref={relatedScrollRef} className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth pb-2 scrollbar-hide">
              {relatedProducts.map((item) => {
                const imageUrl = item.image_url?.startsWith("http") ? item.image_url : item.image_url ? `${API_URL}${item.image_url}` : "";
                const firstPrice = item.price_breaks?.[0]?.price;
                return (
                  <Link key={item.product_id} to={`/product/${item.slug}`} className="shrink-0 w-55 md:w-60 bg-white border border-[#d9e2ef] shadow-sm p-4 transition">
                    <div className="h-36 bg-white flex items-center justify-center mb-3">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.product_name} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">{item.product_name}</h3>
                    <p className="text-[11px] text-[#071b3a]/45 mt-1">SKU: {item.sku || "N/A"}</p>
                    {firstPrice && <p className="text-xl font-extrabold text-[#071b3a] mt-2">£{Number(firstPrice).toFixed(2)}</p>}
                    <p className="text-[11px] text-[#071b3a]/45 mt-1">{item.category_name}</p>
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