import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useCart } from "../context/CartContext";
import QtyAddControl from "../components/QtyAddControl";
import PriceTier from "../components/PriceTier";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

const text = (value) => String(value ?? "").trim();

const unique = (values) =>
  [...new Set(values.map(text).filter(Boolean))];

function normalizePriceBreaks(variant) {
  if (Array.isArray(variant?.price_breaks)) {
    return variant.price_breaks
      .map((tier) => ({
        min_qty: Number(tier.min_qty),
        max_qty:
          tier.max_qty === null || tier.max_qty === undefined
            ? null
            : Number(tier.max_qty),
        price: Number(tier.price),
      }))
      .filter(
        (tier) =>
          Number.isFinite(tier.min_qty) &&
          Number.isFinite(tier.price) &&
          tier.min_qty > 0
      )
      .sort((a, b) => a.min_qty - b.min_qty);
  }

  const tiers = [];

  for (let index = 1; index <= 4; index += 1) {
    const qty = Number(
      variant?.[`tier_${index}_qty`] ??
        variant?.[`tier${index}_qty`] ??
        variant?.[`price_${index}_qty`]
    );

    const price = Number(
      variant?.[`tier_${index}_price`] ??
        variant?.[`tier${index}_price`] ??
        variant?.[`price_${index}`]
    );

    if (Number.isFinite(qty) && qty > 0 && Number.isFinite(price)) {
      tiers.push({ min_qty: qty, max_qty: null, price });
    }
  }

  tiers.sort((a, b) => a.min_qty - b.min_qty);

  return tiers.map((tier, index) => ({
    ...tier,
    max_qty:
      index < tiers.length - 1 ? tiers[index + 1].min_qty - 1 : null,
  }));
}

export default function NewProductPage() {
    console.log("New Product Page")
  const { slug } = useParams();
  const { addToCart, cartItems = [] } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVariant1, setSelectedVariant1] = useState("");
  const [selectedVariant2, setSelectedVariant2] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [qty, setQty] = useState("1");
  const [qtyWarning, setQtyWarning] = useState("");
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/product-main/${encodeURIComponent(slug)}`,
          { signal: controller.signal }
        );
        
        const data = await response.json().catch(() => ({}));
        console.log(data)

        if (!response.ok) {
          throw new Error(data.message || "Unable to load product");
        }

        const variants = Array.isArray(data.variants) ? data.variants : [];
        const firstActiveVariant =
          variants.find((variant) => Number(variant.is_active) === 1) ||
          variants[0] ||
          null;

        setProduct(data);
        setSelectedVariant1(text(firstActiveVariant?.variant_1_value));
        setSelectedVariant2(text(firstActiveVariant?.variant_2_value));
        setSelectedImage(
          firstActiveVariant?.image_url ||
            data.images?.[0]?.image_url ||
            data.image_url ||
            ""
        );
        setQty("1");
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load product");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProduct();
    return () => controller.abort();
  }, [slug]);

  const activeVariants = useMemo(
    () =>
      (product?.variants || []).filter(
        (variant) => Number(variant.is_active ?? 1) === 1
      ),
    [product]
  );

  const variant1Name =
    activeVariants.find((variant) => text(variant.variant_1))?.variant_1 || "";

  const variant2Name =
    activeVariants.find((variant) => text(variant.variant_2))?.variant_2 || "";

  const variant1Values = useMemo(
    () => unique(activeVariants.map((variant) => variant.variant_1_value)),
    [activeVariants]
  );

  const variant2Values = useMemo(() => {
    const variantsForFirstChoice = selectedVariant1
      ? activeVariants.filter(
          (variant) => text(variant.variant_1_value) === selectedVariant1
        )
      : activeVariants;

    return unique(
      variantsForFirstChoice.map((variant) => variant.variant_2_value)
    );
  }, [activeVariants, selectedVariant1]);

  const selectedVariant = useMemo(() => {
    if (!activeVariants.length) return null;

    return (
      activeVariants.find((variant) => {
        const firstMatches = variant1Name
          ? text(variant.variant_1_value) === selectedVariant1
          : true;

        const secondMatches = variant2Name
          ? text(variant.variant_2_value) === selectedVariant2
          : true;

        return firstMatches && secondMatches;
      }) || null
    );
  }, [
    activeVariants,
    selectedVariant1,
    selectedVariant2,
    variant1Name,
    variant2Name,
  ]);

  useEffect(() => {
    if (!variant2Name) return;

    const validSecondValues = variant2Values;

    if (!validSecondValues.includes(selectedVariant2)) {
      setSelectedVariant2(validSecondValues[0] || "");
    }
  }, [variant2Name, variant2Values, selectedVariant2]);

  useEffect(() => {
    if (!selectedVariant) return;

    setQty("1");
    setQtyWarning("");

    if (selectedVariant.image_url) {
      setSelectedImage(selectedVariant.image_url);
    }
  }, [selectedVariant?.variant_id]);

  const priceBreaks = useMemo(
    () => normalizePriceBreaks(selectedVariant),
    [selectedVariant]
  );

  const enteredQty = Number(qty || 0);

  const activeTier = useMemo(() => {
    if (!priceBreaks.length || enteredQty <= 0) return null;

    return (
      priceBreaks.find((tier) => {
        const maximum = tier.max_qty ? Number(tier.max_qty) : Infinity;
        return enteredQty >= Number(tier.min_qty) && enteredQty <= maximum;
      }) || priceBreaks[0]
    );
  }, [priceBreaks, enteredQty]);

  const unitPrice = Number(
    activeTier?.price ?? selectedVariant?.selling_price ?? 0
  );

  const qtyInCart = useMemo(() => {
    if (!selectedVariant) return 0;

    return cartItems
      .filter(
        (item) =>
          Number(item.variant_id) === Number(selectedVariant.variant_id)
      )
      .reduce((total, item) => total + Number(item.quantity || 0), 0);
  }, [cartItems, selectedVariant]);

  const stockQty = Number(selectedVariant?.stock_qty || 0);
  const availableQty = Math.max(stockQty - qtyInCart, 0);
  const isOutOfStock = !selectedVariant || availableQty < 1;

  const specifications = Array.isArray(product?.specifications)
    ? product.specifications
    : Array.isArray(product?.specs)
    ? product.specs
    : [];

  const unit =
    specifications.find(
      (spec) => text(spec.spec_name).toLowerCase() === "unit"
    )?.spec_value || "Unit";

  const productImages = useMemo(() => {
    const images = [];

    if (Array.isArray(product?.images)) {
      images.push(...product.images);
    }

    activeVariants.forEach((variant) => {
      if (variant.image_url) {
        images.push({
          image_id: `variant-${variant.variant_id}`,
          image_url: variant.image_url,
          alt_text: `${product?.product_name || "Product"} ${
            variant.variant_1_value || ""
          } ${variant.variant_2_value || ""}`.trim(),
        });
      }
    });

    const seen = new Set();
    return images.filter((image) => {
      const url = text(image.image_url);
      if (!url || seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  }, [product, activeVariants]);

  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return "";
    return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  };

  const mainImageSrc = getImageSrc(
    selectedImage ||
      selectedVariant?.image_url ||
      productImages[0]?.image_url ||
      product?.image_url
  );

  const isVariant1Available = (value) =>
    activeVariants.some(
      (variant) =>
        text(variant.variant_1_value) === value &&
        Number(variant.stock_qty || 0) > 0
    );

  const isVariant2Available = (value) =>
    activeVariants.some(
      (variant) =>
        (!variant1Name ||
          text(variant.variant_1_value) === selectedVariant1) &&
        text(variant.variant_2_value) === value &&
        Number(variant.stock_qty || 0) > 0
    );

  const handleVariant1Select = (value) => {
    setSelectedVariant1(value);
    setQtyWarning("");

    if (variant2Name) {
      const matchingVariants = activeVariants.filter(
        (variant) => text(variant.variant_1_value) === value
      );

      const currentCombinationExists = matchingVariants.some(
        (variant) => text(variant.variant_2_value) === selectedVariant2
      );

      if (!currentCombinationExists) {
        setSelectedVariant2(
          text(matchingVariants[0]?.variant_2_value)
        );
      }
    }
  };

  const handleAddToCart = async (quantity) => {
    const finalQty = Number(quantity || qty || 0);

    if (!selectedVariant) {
      setQtyWarning("Please select an available variant");
      return;
    }

    if (isOutOfStock) {
      setQtyWarning("This variant is out of stock");
      return;
    }

    if (!Number.isFinite(finalQty) || finalQty < 1) {
      setQtyWarning("Please enter a valid quantity");
      return;
    }

    if (finalQty > availableQty) {
      setQtyWarning(
        qtyInCart > 0
          ? `Only ${availableQty} available to add; ${qtyInCart} already in cart`
          : `Only ${availableQty} available`
      );
      return;
    }

    await addToCart({
      product_id: product.product_id,
      variant_id: selectedVariant.variant_id,
      product_name: product.product_name,
      variant_label: [
        selectedVariant.variant_1_value,
        selectedVariant.variant_2_value,
      ]
        .filter(Boolean)
        .join(" / "),
      sku: selectedVariant.sku,
      image_url:
        selectedVariant.image_url || selectedImage || product.image_url,
      quantity: finalQty,
      unit_price: unitPrice,
      price: unitPrice,
    });

    setQtyWarning("");
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f7] px-4 py-10">
        <p className="text-sm text-gray-500">Loading product...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#f7f7f7] px-4 py-10">
        <p className="font-semibold text-blue-600">
          {error || "Product not found"}
        </p>
      </main>
    );
  }

  const title = product.meta_title || `${product.product_name} | SARA WHOLESALE`;
  const description =
    product.meta_description ||
    `${product.product_name}. Available from SARA WHOLESALE.`;

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link
          rel="canonical"
          href={`https://www.sarawholesale.co.uk/newproduct/${product.slug}`}
        />
      </Helmet>

      {added && (
        <div className="fixed right-5 top-5 z-50 border border-green-100 bg-white px-5 py-4 shadow-lg">
          <p className="text-sm font-semibold text-green-700">Added to cart</p>
          <p className="mt-1 text-xs text-gray-500">
            {product.product_name}
          </p>
        </div>
      )}

      <section className="mx-auto max-w-7xl px-0 pb-10 sm:px-4">
        <div className="py-4">
          <Link
            to={`/newsubcategory/${product.category_slug || ""}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            {product.category_name || "Products"}
          </Link>
        </div>

        <div className="border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[390px_1fr_330px]">
            <div className="border-b border-gray-200 p-5 md:p-7 lg:border-b-0 lg:border-r">
              <div className="flex h-80 items-center justify-center bg-white md:h-105">
                {mainImageSrc ? (
                  <img
                    src={mainImageSrc}
                    alt={product.product_name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100" />
                )}
              </div>

              {productImages.length > 1 && (
                <div className="mt-5 flex flex-nowrap gap-3 overflow-x-auto overflow-y-hidden pb-2">
                  {productImages.map((image) => {
                    const active = selectedImage === image.image_url;

                    return (
                      <button
                        key={image.image_id || image.image_url}
                        type="button"
                        onClick={() => setSelectedImage(image.image_url)}
                        className={`flex h-16 w-16 shrink-0 items-center justify-center border bg-white p-1 ${
                          active
                            ? "border-2 border-gray-900"
                            : "border-gray-200 hover:border-gray-500"
                        }`}
                      >
                        <img
                          src={getImageSrc(image.image_url)}
                          alt={image.alt_text || product.product_name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-b border-gray-200 px-3 py-5 sm:p-5 md:p-7 lg:border-b-0 lg:border-r">
              <h1 className="text-xl font-bold leading-tight text-[#071b3a] md:text-2xl">
                {product.product_name}
              </h1>

              <p className="mt-3 text-sm text-gray-500">
                SKU: {selectedVariant?.sku || "Select a variant"}
              </p>

              <p
                className={`mt-4 text-sm font-bold ${
                  isOutOfStock ? "text-red-600" : "text-green-700"
                }`}
              >
                {isOutOfStock
                  ? "Out of stock"
                  : `✓ In stock (${stockQty} available)`}
              </p>

              {variant1Name && variant1Values.length > 0 && (
                <div className="mt-7">
                  <p className="mb-3 text-sm font-bold text-gray-900">
                    {variant1Name}: {selectedVariant1}
                  </p>

                  <div className="flex flex-wrap justify-start gap-2">
                    {variant1Values.map((value) => {
                      const selected = selectedVariant1 === value;
                      const available = isVariant1Available(value);

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleVariant1Select(value)}
                          className={`min-h-10 w-auto shrink-0 whitespace-nowrap border px-1 py-2 text-sm font-semibold transition ${
                            selected
                              ? "border-2 border-gray-900 bg-gray-50 text-gray-900"
                              : "border-gray-300 bg-white hover:border-gray-700"
                          } ${!available ? "text-gray-400 line-through" : ""}`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {variant2Name && variant2Values.length > 0 && (
                <div className="mt-7">
                  <p className="mb-3 text-sm font-bold text-gray-900">
                    {variant2Name}: {selectedVariant2}
                  </p>

                  <div className="flex flex-wrap justify-start gap-2">
                    {variant2Values.map((value) => {
                      const selected = selectedVariant2 === value;
                      const available = isVariant2Available(value);

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setSelectedVariant2(value);
                            setQtyWarning("");
                          }}
                          className={`min-h-11 min-w-11 border px-4 py-2 text-sm font-semibold transition ${
                            selected
                              ? "border-2 border-gray-900 bg-gray-50 text-gray-900"
                              : "border-gray-300 bg-white hover:border-gray-700"
                          } ${!available ? "text-gray-400 line-through" : ""}`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {priceBreaks.length > 1 && (
                <div className="mt-7 max-w-md">
                  <h2 className="mb-3 text-sm font-bold text-gray-900">
                    Buy more for more savings
                  </h2>

                  <PriceTier
                    tiers={priceBreaks}
                    currentQty={qty}
                    isOutOfStock={isOutOfStock}
                    hasQtyChanged={Number(qty) !== 1}
                    getSlabLabel={(tier) =>
                      tier.max_qty
                        ? `${tier.min_qty}-${tier.max_qty}`
                        : `${tier.min_qty}+`
                    }
                    onSelect={(tier) => {
                      setQty(
                        String(Math.min(Number(tier.min_qty), availableQty))
                      );
                      setQtyWarning("");
                    }}
                    unit={unit}
                  />
                </div>
              )}

              <p className="mt-6 text-sm text-gray-700">
                <strong>VAT:</strong> {Number(product.vat_rate || 0).toFixed(0)}%
              </p>
            </div>

            <aside className="p-5 md:p-7">
              <div className="sticky top-24">
                <p className="text-3xl font-extrabold leading-none text-[#3f4043]">
                  £{unitPrice.toFixed(2)}
                </p>
                <p className="mt-1 text-xs font-bold text-gray-500">
                  Price per {unit} Exc. VAT
                </p>

                <div className="my-5 border-t border-gray-200" />

                {qtyInCart > 0 && (
                  <p className="mb-3 text-sm text-gray-700">
                    <strong>{qtyInCart}</strong> already in cart
                  </p>
                )}

                {isOutOfStock ? (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed bg-gray-300 px-4 py-3 font-bold text-gray-500"
                  >
                    Out of stock
                  </button>
                ) : (
                  <QtyAddControl
                    value={qty}
                    maxQty={availableQty}
                    disabled={isOutOfStock}
                    onMaxQty={() =>
                      setQtyWarning(
                        qtyInCart > 0
                          ? `Only ${availableQty} available to add; ${qtyInCart} already in cart`
                          : `Only ${availableQty} available`
                      )
                    }
                    onQtyChange={(value) => {
                      setQty(value);
                      setQtyWarning("");
                    }}
                    onAdd={handleAddToCart}
                  />
                )}

                {qtyWarning && (
                  <div className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2">
                    <p className="text-xs font-medium text-amber-700">
                      {qtyWarning}
                    </p>
                  </div>
                )}

                {Number(qty) > 0 && (
                  <p className="mt-4 text-xs text-gray-600">
                    Total for {qty} {unit}:
                    <strong className="ml-1 text-[#071b3a]">
                      £{(Number(qty) * unitPrice).toFixed(2)}
                    </strong>
                  </p>
                )}

                <div className="mt-5 space-y-3 border-t border-gray-200 pt-5 text-sm text-[#071b3a]">
                  <p>✓ Free delivery on qualifying orders</p>
                  <p>✓ Trade pricing available</p>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <div className="mt-6 border border-gray-200 bg-white shadow-sm">
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab("description")}
              className={`px-6 py-4 text-sm font-bold ${
                activeTab === "description"
                  ? "border-b-2 border-red-600 bg-white text-black"
                  : "bg-gray-50 text-gray-500"
              }`}
            >
              Description
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("specifications")}
              className={`px-6 py-4 text-sm font-bold ${
                activeTab === "specifications"
                  ? "border-b-2 border-red-600 bg-white text-black"
                  : "bg-gray-50 text-gray-500"
              }`}
            >
              Product Specifications
            </button>
          </div>

          {activeTab === "description" && (
            <div className="p-6">
              <p className="whitespace-pre-line text-sm leading-7 text-gray-700">
                {product.description || "No description available."}
              </p>
            </div>
          )}

          {activeTab === "specifications" && (
            <div>
              {specifications.length > 0 ? (
                <table className="w-full text-sm">
                  <tbody>
                    {specifications.map((spec) => (
                      <tr
                        key={spec.spec_id || spec.spec_name}
                        className="border-b border-gray-200 last:border-b-0"
                      >
                        <td className="w-[30%] bg-gray-50 px-4 py-3 font-bold">
                          {spec.spec_name}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {spec.spec_value}
                        </td>
                      </tr>
                    ))}

                    {variant1Name && (
                      <tr className="border-b border-gray-200">
                        <td className="w-[30%] bg-gray-50 px-4 py-3 font-bold">
                          {variant1Name}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {selectedVariant1}
                        </td>
                      </tr>
                    )}

                    {variant2Name && (
                      <tr>
                        <td className="w-[30%] bg-gray-50 px-4 py-3 font-bold">
                          {variant2Name}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {selectedVariant2}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-sm text-gray-500">
                  No specifications available.
                </div>
              )}
            </div>
          )}
        </div>

        {product.seo_content && (
          <div
            className="mt-8 border border-gray-200 bg-white p-6 text-sm leading-7 text-gray-700 md:p-8"
            dangerouslySetInnerHTML={{ __html: product.seo_content }}
          />
        )}
      </section>
    </main>
  );
}