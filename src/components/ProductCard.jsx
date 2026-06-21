import { useNavigate } from "react-router-dom";
import QtyAddControl from "./QtyAddControl";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();

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



  const [qty, setQty] = useState("1");

  const currentQty = Number(qty || 1);

  const unitLabel =
  Number(currentQty || 1) === 1
    ? unit.toLowerCase()
    : `${unit.toLowerCase()}s`;  

  const activeTier =
    product.price_breaks?.find(
      (tier) =>
        currentQty >= Number(tier.min_qty) &&
        (!tier.max_qty || currentQty <= Number(tier.max_qty))
    ) || null;

  const unitPrice = activeTier
    ? Number(activeTier.price)
    : Number(product.from_price || product.price || 0);

  return (
    <div className="bg-white border border-gray-300 shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="p-4">
        <div
          className="grid grid-cols-[130px_1fr] gap-4 cursor-pointer"
          onClick={() => navigate(`/product/${product.slug}`)}
        >
          <div className="h-36 bg-gray-50 flex items-center justify-center overflow-hidden">
            {product.image_url ? (
              <img
                src={getImage(product.image_url)}
                alt={product.product_name}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-gray-400 text-sm">No image</span>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 text-lg leading-snug line-clamp-2 wrap-break-word hover:text-green-700">
              {product.product_name}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              SKU: {product.sku || "N/A"}
            </p>

            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {product.parent_category_name
                ? `${product.parent_category_name} / ${product.category_name}`
                : product.category_name}
            </p>
          </div>
        </div>

        {product.price_breaks?.length > 0 && (
          <div
            className="grid border border-gray-300 mt-4 overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${product.price_breaks.length}, minmax(0, 1fr))`,
            }}
          >
            {product.price_breaks.map((tier) => {
              const isActive =
                activeTier &&
                Number(activeTier.min_qty) === Number(tier.min_qty) &&
                Number(activeTier.max_qty || 0) === Number(tier.max_qty || 0);

              return (
                <button
                  type="button"
                  key={`${tier.min_qty}-${tier.max_qty}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setQty(String(tier.min_qty));
                  }}
                  className={`border-r last:border-r-0 text-center min-w-0 ${
                    isActive ? "bg-green-100" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`text-xs border-b border-gray-300 py-1 ${
                      isActive ? "text-green-700 font-bold" : "text-gray-600"
                    }`}
                  >
                    {getSlabLabel(tier)}
                  </div>

                  <div
                    className={`text-sm font-bold py-2 ${
                      isActive ? "text-green-700" : "text-gray-900"
                    }`}
                  >
                    £{Number(tier.price).toFixed(2)}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-gray-300 p-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
  <div className="w-full sm:w-auto">
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold text-gray-500">
          Price per {unit.toLowerCase()}
        </p>

        <p className="text-lg sm:text-lg font-extrabold text-green-700">
          £{unitPrice.toFixed(2)}
        </p>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between gap-4">
        <p className="text-xs font-semibold text-gray-500">
          Price for {currentQty} {unitLabel}
        </p>

        <p className="text-sm sm:text-base font-bold text-gray-900">
          £{(unitPrice * currentQty).toFixed(2)}
        </p>
      </div>

      <p className="text-[11px] text-gray-400 mt-1 text-right">
        exc. VAT
      </p>
    </div>
  </div>

  <div className="shrink-0">
    <QtyAddControl
      value={qty}
      onQtyChange={setQty}
      onAdd={(quantity) => onAddToCart(product, quantity)}
    />
  </div>
</div>
    </div>
  );
}