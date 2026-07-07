import { useNavigate } from "react-router-dom";
import QtyAddControl from "./QtyAddControl";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();
  const [qty, setQty] = useState("1");
  const [selectedTierKey, setSelectedTierKey] = useState(null);

  const getImage = (imageUrl) => {
    if (!imageUrl) return "";
    return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  };

  const getSlabLabel = (tier) =>
    tier.max_qty ? `${tier.min_qty}-${tier.max_qty}` : `${tier.min_qty}+`;

  const getSpecValue = (name) => {
    const spec = product.specifications?.find(
      (item) =>
        String(item.spec_name || "").trim().toLowerCase() ===
        String(name || "").trim().toLowerCase()
    );
    return String(spec?.spec_value || "").trim();
  };

  const unit = getSpecValue("Unit") || "unit";
  const currentQty = Number(qty || 1);

  const unitLabel =
    currentQty === 1 ? unit.toLowerCase() : `${unit.toLowerCase()}s`;

  const activeTier =
    product.price_breaks?.find(
      (tier) =>
        currentQty >= Number(tier.min_qty) &&
        (!tier.max_qty || currentQty <= Number(tier.max_qty))
    ) || null;

  const unitPrice = activeTier
    ? Number(activeTier.price)
    : Number(product.from_price || product.price || 0);

  const subtotal = unitPrice * currentQty;
  const basePrice = Number(product.price_breaks?.[0]?.price || unitPrice || 0);

  return (
    <div className="bg-white border border-gray-300 shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="p-4 md:p-5">
      <h2
          onClick={() => navigate(`/product/${product.slug}`)}
          className="md:hidden font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-3 cursor-pointer"
        >
          {product.product_name}
        </h2>
        
        <div
            className="grid grid-cols-[135px_1fr] md:grid-cols-[180px_1fr] gap-3 md:gap-6 cursor-pointer"
          onClick={() => navigate(`/product/${product.slug}`)}
        >

      <div className="h-36 md:h-48 bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
            {product.image_url ? (
              <img
                src={getImage(product.image_url)}
                alt={product.product_name}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <span className="text-gray-400 text-sm">No image</span>
            )}
          </div>
          <div className="md:hidden ml-4 space-y-1 text-[9px] max-w-[125px]">
          <div className="md:hidden  items-start justify-between gap-3 mb-3">
    <p className="text-sm mt-2 font-semibold text-gray-500">Price per {unit}</p>
    <p className="text-2xl mt-3 font-bold text-green-700 leading-none">
        £{unitPrice.toFixed(2)} <span className="ml-1 text-[10px] font-semibold text-gray-400">exc. VAT</span>
      </p>
    </div>
  <div className="bg-green-50 mt-3 text-green-800 border border-green-200 px-1.5 py-1 font-semibold">
    ✔ Available
  </div>

  <div className="bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-1 font-semibold">
    🚚 UK Delivery
  </div>

  <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 px-1.5 py-1 font-semibold">
    📦 Bulk Discounts
  </div>
</div>

          <div className="hidden md:block min-w-0">
          <h2 className="hidden md:block font-bold text-gray-900 text-lg leading-snug line-clamp-3 hover:text-green-700">
              {product.product_name}
            </h2>

            <p className="hidden md:block text-sm text-gray-500 mt-2">
              SKU: {product.sku || "N/A"}
            </p>

            {/* <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {product.parent_category_name
                ? `${product.parent_category_name} / ${product.category_name}`
                : product.category_name}
            </p> */}
            <div className="hidden md:flex items-center mt-4 mb-4 gap-3">
    <p className="text-sm font-semibold text-gray-500">Price per {unit}</p>
    <p className="text-2xl font-bold text-green-700 leading-none">
        £{unitPrice.toFixed(2)} <span className="ml-1 text-[10px] font-semibold text-gray-400">exc. VAT</span>
      </p>
    </div>


    <div className="mt-2 md:mt-4 grid grid-cols-1 md:grid-cols-3 gap-1.5 md:gap-2 text-[9px] md:text-xs">
              <div className="bg-green-50 text-green-800 border border-green-200 px-2 py-3 md:px-3 md:py-3 font-semibold">
                ✔ Available
              </div>

              <div className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-1.5 md:px-3 md:py-2 font-semibold">
                🚚 UK Delivery
              </div>

              <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 px-2 py-1.5 md:px-3 md:py-2 font-semibold">
                📦 Bulk Discounts
              </div>
            </div>
          </div>
        </div>

        {product.price_breaks?.length > 0 && (
          <div
            className="grid gap-1.5 mt-3"
            style={{
              gridTemplateColumns: `repeat(${product.price_breaks.length}, minmax(0, 1fr))`,
            }}
          >
            {product.price_breaks.map((tier, index) => {
              const tierKey = `${tier.min_qty}-${tier.max_qty || "plus"}`;
              const isActive = selectedTierKey === tierKey;
              const isBestValue = index === product.price_breaks.length - 1;

              const savingPercent =
                basePrice > 0
                  ? Math.round(((basePrice - Number(tier.price)) / basePrice) * 100)
                  : 0;

              const tierUnitLabel =
                Number(tier.min_qty) === 1
                  ? unit.toLowerCase()
                  : `${unit.toLowerCase()}s`;

              return (
                <button
                  type="button"
                  key={tierKey}
                  onClick={(e) => {
                    e.stopPropagation();
                    setQty(String(tier.min_qty));
                    setSelectedTierKey(tierKey);
                  }}
                  className={`relative border px-2 py-2 text-center transition bg-white ${
                    isActive
                      ? "border-green-700 bg-green-50"
                      : "border-gray-300 hover:border-green-500 hover:bg-gray-50"
                  }`}
                >
                  {isBestValue && (
                    <span className="absolute top-1 right-1 bg-green-700 text-white text-[8px] px-1.5 py-0.5 font-bold">
                      BEST
                    </span>
                  )}

                  <div
                    className={`text-[12px] font-semibold ${
                      isActive ? "text-green-800" : "text-gray-700"
                    }`}
                  >
                    {getSlabLabel(tier)} {tierUnitLabel}
                  </div>

                  <div
                    className={`mt-1 text-base font-bold ${
                      isActive ? "text-green-700" : "text-gray-900"
                    }`}
                  >
                    £{Number(tier.price).toFixed(2)}
                  </div>

                  {/* <div className="text-[10px] text-gray-500">each</div> */}

                  <div
                    className={`mt-1 pt-1 border-t text-[10px] font-semibold ${
                      savingPercent > 0 ? "text-green-700" : "text-gray-400"
                    }`}
                  >
                    {savingPercent > 0 ? `${savingPercent}% off` : "Base"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-gray-50 px-4 py-3 flex flex-row items-end justify-between gap-2">
      <div className="bg-white border border-gray-300 px-3 py-2 w-[42%] md:w-[240px]">
    {/* <div className="flex items-center justify-between gap-1">
    <p className="text-xs font-semibold text-gray-500">Price per {unit}</p>
    <p className="text-lg font-bold text-green-700 leading-none">
        £{unitPrice.toFixed(2)} <span className="ml-1 text-[10px] font-semibold text-gray-400">exc. VAT</span>
      </p>
    </div> */}

    <div className="flex flex-col md:flex-row md:items-end sm:justify-between">
  {/* Left */}
  <p className="text-xs font-semibold text-gray-500">
    Subtotal
  </p>

  {/* Right */}
  <div className="flex flex-col md:flex-row md:items-end sm:gap-1 mt-0.5 sm:mt-0">
    <p className="text-sm font-bold text-gray-900 leading-none">
      £{subtotal.toFixed(2)}
    </p>

    <p className="text-[10px] font-semibold text-gray-400 leading-none">
      exc. VAT
    </p>
  </div>
</div>

    {/* <p className="text-[10px] text-gray-400 mt-0.5 text-right">exc. VAT</p> */}
  </div>

  <div className="flex-1 flex flex-col items-stretch md:items-end gap-1">
    <p className="text-xs text-gray-500">
      Add {currentQty} {unitLabel} to your cart
    </p>

    <QtyAddControl
      value={qty}
      onQtyChange={(value) => {
        setQty(value);
        setSelectedTierKey(null);
      }}
      onAdd={(quantity) => onAddToCart(product, quantity)}
    />
  </div>
</div> 
    </div>
  );
}