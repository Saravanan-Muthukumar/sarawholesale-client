import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ImageOff,
  Loader2,
  Plus,
  Printer,
  X,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:9000";

/*
Existing endpoints used:
GET /api/product-main              -> product selection list
GET /api/product-main/id/:id       -> full product with variants
*/

export default function AdminFlyerBuilderPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [paperSize, setPaperSize] = useState("a4");

  const [title, setTitle] = useState(
    "PACKAGING, STATIONERY & TRADE SUPPLIES"
  );

  const [subtitle, setSubtitle] = useState(
    "Trade Pricing for Businesses and Contractors"
  );

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [checkedProducts, setCheckedProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingProductIds, setAddingProductIds] = useState([]);
  const [bulkAdding, setBulkAdding] = useState(false);

  useEffect(() => {
    loadFlyerData();
  }, []);

  const loadFlyerData = async () => {
    try {
      setLoading(true);
      setError("");

      const [categoryResponse, productResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/categories`, {
            credentials: "include",
          }),

          fetch(`${API_URL}/api/product-main`, {
            credentials: "include",
          }),
        ]);

      if (!categoryResponse.ok) {
        throw new Error("Unable to load categories.");
      }

      if (!productResponse.ok) {
        throw new Error(
          "Unable to load products from product-main route."
        );
      }

      const categoryData = await categoryResponse.json();
      const productData = await productResponse.json();

      const safeCategories = Array.isArray(categoryData)
        ? categoryData
        : categoryData.categories || [];

      const rawProducts = Array.isArray(productData)
        ? productData
        : productData.products || [];

      const normalizedProducts = rawProducts.map(
        normalizeProduct
      );

      setCategories(safeCategories);
      setProducts(normalizedProducts);
    } catch (loadError) {
      console.error("Flyer data loading error:", loadError);

      setError(
        loadError.message ||
          "Unable to load flyer products."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!categoryId) {
      return products;
    }

    return products.filter(
      (product) =>
        String(product.category_id) === String(categoryId)
    );
  }, [products, categoryId]);

  const loadFullProduct = async (productId) => {
    const response = await fetch(
      `${API_URL}/api/product-main/id/${productId}`,
      {
        credentials: "include",
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to load product details."
      );
    }

    return normalizeProduct(data);
  };

  const addProduct = async (product) => {
    const productId = Number(product.product_id);

    const alreadyAdded = selectedProducts.some(
      (item) => Number(item.product_id) === productId
    );

    if (
      alreadyAdded ||
      addingProductIds.includes(productId)
    ) {
      return;
    }

    try {
      setError("");
      setAddingProductIds((current) => [
        ...current,
        productId,
      ]);

      const fullProduct = await loadFullProduct(productId);

      setSelectedProducts((currentProducts) => {
        const exists = currentProducts.some(
          (item) =>
            Number(item.product_id) === productId
        );

        return exists
          ? currentProducts
          : [...currentProducts, fullProduct];
      });
    } catch (addError) {
      console.error("Add flyer product error:", addError);
      setError(
        addError.message ||
          "Unable to add product to the flyer."
      );
    } finally {
      setAddingProductIds((current) =>
        current.filter((id) => id !== productId)
      );
    }
  };

  const addProducts = async (productsToAdd) => {
    const existingIds = new Set(
      selectedProducts.map((product) =>
        Number(product.product_id)
      )
    );

    const uniqueProducts = productsToAdd.filter(
      (product) =>
        !existingIds.has(Number(product.product_id))
    );

    if (!uniqueProducts.length) return;

    const productIds = uniqueProducts.map((product) =>
      Number(product.product_id)
    );

    try {
      setBulkAdding(true);
      setError("");
      setAddingProductIds((current) => [
        ...new Set([...current, ...productIds]),
      ]);

      const results = await Promise.allSettled(
        productIds.map(loadFullProduct)
      );

      const loadedProducts = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      const failedCount =
        results.length - loadedProducts.length;

      setSelectedProducts((currentProducts) => {
        const currentIds = new Set(
          currentProducts.map((product) =>
            Number(product.product_id)
          )
        );

        return [
          ...currentProducts,
          ...loadedProducts.filter(
            (product) =>
              !currentIds.has(Number(product.product_id))
          ),
        ];
      });

      if (failedCount > 0) {
        setError(
          `${failedCount} product${
            failedCount === 1 ? "" : "s"
          } could not be added.`
        );
      }
    } catch (addError) {
      console.error("Add flyer products error:", addError);
      setError("Unable to add the selected products.");
    } finally {
      setAddingProductIds((current) =>
        current.filter((id) => !productIds.includes(id))
      );
      setBulkAdding(false);
    }
  };

  const addCheckedProducts = async () => {
    const productsToAdd = filteredProducts.filter(
      (product) =>
        checkedProducts.includes(product.product_id)
    );

    await addProducts(productsToAdd);
  };

  const addAllFilteredProducts = async () => {
    await addProducts(filteredProducts);
  };

  const removeProduct = (productId) => {
    setSelectedProducts((currentProducts) =>
      currentProducts.filter(
        (product) =>
          Number(product.product_id) !==
          Number(productId)
      )
    );
  };

  const toggleCheckedProduct = (productId) => {
    setCheckedProducts((currentIds) =>
      currentIds.includes(productId)
        ? currentIds.filter((id) => id !== productId)
        : [...currentIds, productId]
    );
  };

  const checkAllProducts = () => {
    setCheckedProducts(
      filteredProducts.map(
        (product) => product.product_id
      )
    );
  };

  const clearAllProducts = () => {
    setCheckedProducts([]);
    setSelectedProducts([]);
  };

  return (
    <main className="min-h-screen bg-[#f4f6f8] p-4">
      <FlyerPrintStyles />

      <section className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[370px_1fr]">
        <aside className="no-print h-fit rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-5">
            <h1 className="text-xl font-black text-[#071b3a]">
              Product Flyer Builder
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              Select products and print or save the flyer as a
              PDF.
            </p>
          </div>

          <div className="space-y-3">
            <FlyerInput
              label="Flyer title"
              value={title}
              onChange={setTitle}
            />

            <FlyerInput
              label="Subtitle"
              value={subtitle}
              onChange={setSubtitle}
            />

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700">
                Flyer size
              </label>

              <select
                value={paperSize}
                onChange={(event) =>
                  setPaperSize(event.target.value)
                }
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-red-500"
              >
                <option value="a4">A4 full page</option>
                <option value="a5">A5 flyer</option>
                <option value="small">
                  Small handout
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700">
                Category
              </label>

              <select
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setCheckedProducts([]);
                }}
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-red-500"
              >
                <option value="">All categories</option>

                {categories.map((category) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              disabled={selectedProducts.length === 0}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-green-700 text-sm font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Printer size={17} />
              Print / Save PDF
            </button>
          </div>

          <div className="mt-5 border-t border-gray-100 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-[#071b3a]">
                Select products
              </h2>

              <span className="text-[11px] text-gray-500">
                {selectedProducts.length} selected
              </span>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
              <SmallActionButton
                onClick={addCheckedProducts}
                disabled={bulkAdding || checkedProducts.length === 0}
                primary
              >
                Add Checked
              </SmallActionButton>

              <SmallActionButton
                onClick={addAllFilteredProducts}
                disabled={bulkAdding || filteredProducts.length === 0}
              >
                Add All
              </SmallActionButton>

              <SmallActionButton
                onClick={checkAllProducts}
                disabled={bulkAdding || filteredProducts.length === 0}
              >
                Check All
              </SmallActionButton>

              <SmallActionButton
                onClick={clearAllProducts}
                disabled={bulkAdding}
                danger
              >
                Clear
              </SmallActionButton>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Loading products...
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-xs text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadFlyerData}
                  className="mt-2 text-xs font-bold text-red-700 underline"
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className="max-h-155 space-y-2 overflow-y-auto pr-1">
                {filteredProducts.map((product) => {
                  const checked =
                    checkedProducts.includes(
                      product.product_id
                    );

                  const alreadyAdded =
                    selectedProducts.some(
                      (item) =>
                        Number(item.product_id) ===
                        Number(product.product_id)
                    );

                  return (
                    <ProductSelectorCard
                      key={product.product_id}
                      product={product}
                      checked={checked}
                      alreadyAdded={alreadyAdded}
                      adding={addingProductIds.includes(
                        Number(product.product_id)
                      )}
                      onToggle={() =>
                        toggleCheckedProduct(
                          product.product_id
                        )
                      }
                      onAdd={() => addProduct(product)}
                    />
                  );
                })}

                {filteredProducts.length === 0 && (
                  <p className="py-8 text-center text-xs text-gray-400">
                    No products found.
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>

        <FlyerPreview
          paperSize={paperSize}
          title={title}
          subtitle={subtitle}
          products={selectedProducts}
          onRemove={removeProduct}
        />
      </section>
    </main>
  );
}

function FlyerPreview({
  paperSize,
  title,
  subtitle,
  products,
  onRemove,
}) {
  const paperClass =
    paperSize === "a4"
      ? "max-w-[794px] min-h-[1123px]"
      : paperSize === "a5"
        ? "max-w-[560px] min-h-[794px]"
        : "max-w-[520px] min-h-[650px]";

  return (
    <section
      id="flyer-preview"
      className={`${paperClass} mx-auto overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm`}
    >
      <FlyerHeader title={title} subtitle={subtitle} />

      <div className="grid grid-cols-4 bg-black text-center text-[10px] font-black uppercase tracking-wide text-white">
        <div className="py-2.5">Trade Prices</div>
        <div className="py-2.5">Bulk Discounts</div>
        <div className="py-2.5">Same Day Slough</div>
        <div className="py-2.5">Next Day UK</div>
      </div>

      <div
  className={
    paperSize === "a4"
      ? "grid grid-cols-2 gap-3 p-4"
      : "space-y-3 p-4"
  }
>
  {products.length > 0 ? (
    products.map((product) => (
      <FlyerProductCard
        key={product.product_id}
        product={product}
        onRemove={onRemove}
      />
    ))
  ) : (
    <div
      className={`flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 ${
        paperSize === "a4"
          ? "col-span-2 min-h-125"
          : "min-h-125"
      }`}
    >
      <p className="text-sm text-gray-400">
        Select products to preview the flyer.
      </p>
    </div>
  )}
</div>

      <FlyerFooter />
    </section>
  );
}

function FlyerProductCard({ product, onRemove }) {
  const variants = product.variants || [];

  const samePrices =
    variants.length > 0 &&
    variantsHaveSamePriceTiers(variants);

  const commonTiers =
    variants.length > 0
      ? getVariantPriceTiers(variants[0])
      : [];

  return (
    <article className="relative min-w-0 break-inside-avoid overflow-hidden rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => onRemove(product.product_id)}
        className="no-print absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-red-200 bg-white text-red-500 shadow-sm hover:bg-red-50"
        aria-label={`Remove ${product.product_name}`}
      >
        <X size={14} />
      </button>

      <div className="p-2.5">
        {/* Product heading */}
        <div className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] items-center gap-2 pr-8">
          <MainProductImage product={product} />

          <div className="min-w-0">
            <h3 className="wrap-break-word text-[12px] font-black leading-[1.15] text-[#071b3a]">
              {product.product_name}
            </h3>

            {product.brand && (
              <p className="mt-1 text-[8px] font-semibold text-gray-400">
                {product.brand}
              </p>
            )}
          </div>
        </div>

        {/* Full-width pricing section */}
        <div className="mt-2 min-w-0">
          {variants.length === 0 ? (
            <p className="py-2 text-[10px] font-semibold text-red-600">
              Contact us for price
            </p>
          ) : samePrices ? (
            <SamePriceVariantLayout
              variants={variants}
              tiers={commonTiers}
            />
          ) : (
            <DifferentPriceVariantLayout
              variants={variants}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 border-t border-gray-100 bg-gray-50 px-2 py-1.5 text-center text-[7px] font-bold text-gray-600">
        <span>UK Stock</span>
        <span>Trade Price</span>
        <span>Bulk Orders</span>
        <span>Excluding VAT</span>
      </div>
    </article>
  );
}

function SamePriceVariantLayout({ variants, tiers }) {
  return (
    <div className="mt-2">
      <p className="mb-1 text-[9px] font-black uppercase tracking-wide text-gray-500">
        Available variants
      </p>

      <div className="flex flex-wrap gap-1">
        {variants.map((variant) => (
          <span
            key={variant.variant_id}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-[9px] font-bold text-[#071b3a]"
          >
            {getVariantLabel(variant)}
          </span>
        ))}
      </div>

      <HorizontalPriceTiers tiers={tiers} />
    </div>
  );
}

function DifferentPriceVariantLayout({ variants }) {
  const allTierQuantities = getAllTierQuantities(variants);

  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
      <div
        className="grid bg-black text-[8px] font-black uppercase text-white"
        style={{
          gridTemplateColumns: `minmax(100px, 1.4fr) repeat(${allTierQuantities.length}, minmax(50px, 0.75fr))`,
        }}
      >
        <div className="px-2 py-1.5">Variant</div>

        {allTierQuantities.map((quantity) => (
          <div
            key={quantity}
            className="border-l border-white/20 px-1 py-1.5 text-center"
          >
            {formatUnits(quantity)}
          </div>
        ))}
      </div>

      {variants.map((variant, index) => {
        const tierMap = new Map(
          getVariantPriceTiers(variant).map((tier) => [
            Number(tier.qty),
            tier.price,
          ])
        );

        return (
          <div
            key={variant.variant_id}
            className={`grid text-[9px] ${
              index > 0
                ? "border-t border-gray-200"
                : ""
            }`}
            style={{
              gridTemplateColumns: `minmax(100px, 1.4fr) repeat(${allTierQuantities.length}, minmax(50px, 0.75fr))`,
            }}
          >
            <div className="px-2 py-1.5 font-bold text-[#071b3a]">
              {getVariantLabel(variant)}
            </div>

            {allTierQuantities.map((quantity) => {
              const price = tierMap.get(Number(quantity));

              return (
                <div
                  key={quantity}
                  className="border-l border-gray-200 px-1 py-1.5 text-center font-black text-gray-800"
                >
                  {price !== undefined
                    ? formatPrice(price)
                    : "—"}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function HorizontalPriceTiers({ tiers }) {
  if (!tiers.length) {
    return (
      <p className="mt-2 text-[10px] font-bold text-red-600">
        Contact us for price
      </p>
    );
  }

  return (
    <div
      className="mt-2 grid overflow-hidden rounded-lg border border-gray-200"
      style={{
        gridTemplateColumns: `repeat(${tiers.length}, minmax(0, 1fr))`,
      }}
    >
      {tiers.map((tier, index) => {
        const isBestPrice = index === tiers.length - 1;

        return (
          <div
            key={`${tier.qty}-${tier.price}`}
            className={`px-1.5 py-1.5 text-center ${
              index > 0
                ? "border-l border-gray-200"
                : ""
            } ${
              isBestPrice
                ? "bg-green-50"
                : "bg-gray-50"
            }`}
          >
            <p className="text-[8px] font-bold uppercase text-gray-500">
              {formatUnits(tier.qty)}
            </p>

            <p
              className={`text-[12px] font-black ${
                isBestPrice
                  ? "text-green-700"
                  : "text-[#071b3a]"
              }`}
            >
              {formatPrice(tier.price)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function ProductSelectorCard({
  product,
  checked,
  alreadyAdded,
  adding,
  onToggle,
  onAdd,
}) {
  const lowestPrice = getProductLowestPrice(product);

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border p-2 ${
        alreadyAdded
          ? "border-green-200 bg-green-50"
          : "border-gray-200 bg-white hover:border-green-300"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-4 w-4 shrink-0 accent-green-700"
      />

      <button
        type="button"
        onClick={onAdd}
        disabled={alreadyAdded || adding}
        className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-70"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
          {product.image_url ? (
            <img
              src={getImageUrl(product.image_url)}
              alt={product.product_name}
              className="h-full w-full object-contain"
            />
          ) : (
            <ImageOff
              size={17}
              className="text-gray-300"
            />
          )}
        </div>

        <div className="min-w-0">
          <p className="line-clamp-2 text-xs font-bold text-[#071b3a]">
            {product.product_name}
          </p>

          <p className="mt-0.5 text-[10px] text-gray-500">
            {Number(product.variant_count || product.variants.length || 0)} variant
            {Number(product.variant_count || product.variants.length || 0) === 1 ? "" : "s"}
            {lowestPrice !== null
              ? ` · From ${formatPrice(lowestPrice)}`
              : ""}
          </p>
        </div>
      </button>

      {adding ? (
        <Loader2
          size={16}
          className="shrink-0 animate-spin text-green-700"
        />
      ) : alreadyAdded ? (
        <Check
          size={16}
          className="shrink-0 text-green-700"
        />
      ) : (
        <Plus
          size={16}
          className="shrink-0 text-green-700"
        />
      )}
    </div>
  );
}

function MainProductImage({ product }) {
  return (
    <div className="flex h-17 w-18 items-center justify-center overflow-hidden rounded-lg bg-gray-50 p-1.5">
      {product.image_url ? (
        <img
          src={getImageUrl(product.image_url)}
          alt={product.product_name}
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <div className="text-center text-gray-300">
          <ImageOff size={19} className="mx-auto" />

          <p className="mt-1 text-[6px] font-bold">
            No image
          </p>
        </div>
      )}
    </div>
  );
}

function FlyerHeader({ title, subtitle }) {
  return (
    <header className="border-b-4 border-red-600 bg-white p-5">
      <div className="flex items-start justify-between gap-5">
        <div>
          <img
            src="/logo.png"
            alt="SARA Wholesale"
            className="h-auto w-36 object-contain"
          />

          <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-[#071b3a]">
            Quality Supplies. Trade Prices.
          </p>
        </div>

        <div className="max-w-125 text-right">
          <h2 className="text-xl font-black uppercase leading-tight text-red-600">
            {title}
          </h2>

          <p className="mt-1 text-[11px] font-bold uppercase text-gray-700">
            {subtitle}
          </p>

          <div className="mt-2 text-[9px] font-semibold leading-relaxed text-[#071b3a]">
            <p>07424 715150</p>
            <p>sales@sarawholesale.co.uk</p>
            <p>www.sarawholesale.co.uk</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function FlyerFooter() {
  return (
    <footer className="px-4 pb-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-red-100 bg-red-50 p-3">
          <h3 className="text-[11px] font-black uppercase text-red-700">
            Why businesses choose us
          </h3>

          <div className="mt-2 grid grid-cols-2 gap-1 text-[9px] font-semibold text-[#071b3a]">
            <p>✓ Trade pricing</p>
            <p>✓ Bulk discounts</p>
            <p>✓ Same-day Slough</p>
            <p>✓ Next-day UK</p>
            <p>✓ Credit accounts</p>
            <p>✓ UK-held stock</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center">
          <p className="text-[11px] font-black uppercase text-[#071b3a]">
            Need a better bulk price?
          </p>

          <p className="mt-1 text-[9px] text-gray-500">
            Call our sales team for large quantities.
          </p>

          <p className="mt-1 text-xl font-black text-red-600">
            07424 715150
          </p>
        </div>
      </div>

      <p className="mt-3 text-center text-[8px] text-gray-500">
        Prices exclude VAT and are subject to availability and
        change without notice.
      </p>
    </footer>
  );
}

function FlyerInput({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-gray-700">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-red-500"
      />
    </div>
  );
}

function SmallActionButton({
  children,
  onClick,
  primary = false,
  danger = false,
  disabled = false,
}) {
  let className =
    "h-9 rounded-lg border text-xs font-bold transition";

  if (primary) {
    className +=
      " border-green-700 bg-green-700 text-white hover:bg-green-800";
  } else if (danger) {
    className +=
      " border-red-200 text-red-600 hover:bg-red-50";
  } else {
    className +=
      " border-gray-200 text-[#071b3a] hover:bg-gray-50";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

function FlyerPrintStyles() {
  return (
    <style>{`
      @media print {
        body * {
          visibility: hidden;
        }

        #flyer-preview,
        #flyer-preview * {
          visibility: visible;
        }

        #flyer-preview {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          max-width: none !important;
          min-height: auto !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }

        .no-print {
          display: none !important;
        }

        .break-inside-avoid {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        @page {
          size: A4;
          margin: 7mm;
        }
      }
    `}</style>
  );
}

/* --------------------------------------------------
   Product and pricing helper functions
-------------------------------------------------- */

function normalizeProduct(product) {
  const variants = Array.isArray(product.variants)
    ? product.variants
    : Array.isArray(product.product_variants)
      ? product.product_variants
      : [];

  return {
    ...product,

    product_id:
      product.product_id ?? product.id,

    category_id:
      product.category_id ?? "",

    product_name:
      product.product_name ??
      product.name ??
      "Unnamed Product",

    image_url:
      product.image_url ||
      product.main_image_url ||
      product.primary_image ||
      product.main_image ||
      product.images?.find(
        (image) =>
          Number(image.is_main) === 1 ||
          Number(image.is_primary) === 1
      )?.image_url ||
      product.images?.[0]?.image_url ||
      "",

    variants: variants
      .filter(
        (variant) =>
          variant.is_active === undefined ||
          Number(variant.is_active) === 1
      )
      .map(normalizeVariant),
  };
}

function normalizeVariant(variant) {
  return {
    ...variant,

    variant_id:
      variant.variant_id ?? variant.id,

    variant_1:
      variant.variant_1 ||
      variant.option_1_name ||
      "",

    variant_1_value:
      variant.variant_1_value ||
      variant.option_1_value ||
      "",

    variant_2:
      variant.variant_2 ||
      variant.option_2_name ||
      "",

    variant_2_value:
      variant.variant_2_value ||
      variant.option_2_value ||
      "",

    tier_1_qty:
      variant.tier_1_qty ?? 1,

    tier_1_price:
      variant.tier_1_price ??
      variant.price ??
      null,

    tier_2_qty:
      variant.tier_2_qty ?? null,

    tier_2_price:
      variant.tier_2_price ?? null,

    tier_3_qty:
      variant.tier_3_qty ?? null,

    tier_3_price:
      variant.tier_3_price ?? null,

    tier_4_qty:
      variant.tier_4_qty ?? null,

    tier_4_price:
      variant.tier_4_price ?? null,
  };
}

function getVariantLabel(variant) {
  const values = [
    variant.variant_1_value,
    variant.variant_2_value,
  ].filter(Boolean);

  if (values.length > 0) {
    return values.join(" / ");
  }

  return variant.sku || "Standard";
}

function getVariantPriceTiers(variant) {
  const tiers = [
    {
      qty: variant.tier_1_qty,
      price: variant.tier_1_price,
    },
    {
      qty: variant.tier_2_qty,
      price: variant.tier_2_price,
    },
    {
      qty: variant.tier_3_qty,
      price: variant.tier_3_price,
    },
    {
      qty: variant.tier_4_qty,
      price: variant.tier_4_price,
    },
  ];

  return tiers
    .filter(
      (tier) =>
        Number(tier.qty) > 0 &&
        tier.price !== null &&
        tier.price !== undefined &&
        tier.price !== ""
    )
    .map((tier) => ({
      qty: Number(tier.qty),
      price: Number(tier.price),
    }));
}

function variantsHaveSamePriceTiers(variants) {
  if (!variants.length) {
    return false;
  }

  const firstSignature = createTierSignature(
    variants[0]
  );

  return variants.every(
    (variant) =>
      createTierSignature(variant) === firstSignature
  );
}

function createTierSignature(variant) {
  return getVariantPriceTiers(variant)
    .map(
      (tier) =>
        `${tier.qty}:${Number(tier.price).toFixed(4)}`
    )
    .join("|");
}

function getAllTierQuantities(variants) {
  const quantities = new Set();

  variants.forEach((variant) => {
    getVariantPriceTiers(variant).forEach((tier) => {
      quantities.add(Number(tier.qty));
    });
  });

  return [...quantities].sort(
    (first, second) => first - second
  );
}

function getProductLowestPrice(product) {
  const prices = [];
  const variants = Array.isArray(product.variants)
    ? product.variants
    : [];

  variants.forEach((variant) => {
    getVariantPriceTiers(variant).forEach((tier) => {
      prices.push(Number(tier.price));
    });
  });

  if (prices.length > 0) {
    return Math.min(...prices);
  }

  const listPrice = Number(product.lowest_price);
  return Number.isFinite(listPrice) ? listPrice : null;
}

function formatUnits(quantity) {
  const numericQuantity = Number(quantity);

  return `${numericQuantity} ${
    numericQuantity === 1 ? "Unit" : "Units"
  }`;
}

function formatPrice(price) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "Call";
  }

  return `£${numericPrice.toFixed(2)}`;
}

function getImageUrl(imageUrl) {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:")
  ) {
    return imageUrl;
  }

  return `${API_URL}${
    imageUrl.startsWith("/") ? "" : "/"
  }${imageUrl}`;
}