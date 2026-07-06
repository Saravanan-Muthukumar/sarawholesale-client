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
      <div className="p-5">
        <div
          className="grid grid-cols-[180px_1fr] gap-6 cursor-pointer"
          onClick={() => navigate(`/product/${product.slug}`)}
        >
          <div className="h-48 bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
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

          <div className="min-w-0">
          <h2 className="font-bold text-gray-900 text-lg leading-snug line-clamp-3 hover:text-green-700">
              {product.product_name}
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              SKU: {product.sku || "N/A"}
            </p>

            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {product.parent_category_name
                ? `${product.parent_category_name} / ${product.category_name}`
                : product.category_name}
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-green-50 text-green-800 border border-green-200 px-3 py-2 font-semibold">
                ✔ Available
              </div>

              <div className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-2 font-semibold">
                🚚 UK Delivery
              </div>

              <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 px-3 py-2 font-semibold">
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

                  <div className="text-[10px] text-gray-500">each</div>

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

      <div className="border-t border-gray-300 bg-gray-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  <div className="bg-white border border-gray-300 px-4 py-3 w-full sm:w-[240px]">
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs font-semibold text-gray-500">Unit Price</p>
      <p className="text-xl font-bold text-green-700">
        £{unitPrice.toFixed(2)}
      </p>
    </div>

    <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between gap-3">
      <p className="text-xs font-semibold text-gray-500">Subtotal</p>
      <p className="text-lg font-bold text-gray-900">
        £{subtotal.toFixed(2)}
      </p>
    </div>

    <p className="text-[10px] text-gray-400 mt-0.5 text-right">exc. VAT</p>
  </div>

  <div className="flex flex-col items-stretch sm:items-end gap-1.5">
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