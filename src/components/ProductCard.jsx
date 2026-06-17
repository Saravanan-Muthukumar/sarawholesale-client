import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function ProductCard({
  product,
  qty = "",
  activeTier = null,
  onQtyChange,
  onSlabClick,
  onAddToCart,
}) {
  const getImage = (imageUrl) => {
    if (!imageUrl) return "";
    return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  };

  const getSlabLabel = (tier) =>
    tier.max_qty ? `${tier.min_qty}-${tier.max_qty}` : `${tier.min_qty}+`;

  const unitPrice = activeTier
    ? Number(activeTier.price)
    : Number(product.from_price || product.price || 0);

  return (
    <div className="bg-white border border-gray-300 shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="p-4">
        <div className="grid grid-cols-[130px_1fr] gap-4">
          <Link
            to={`/product/${product.slug}`}
            className="h-36 bg-gray-50 flex items-center justify-center overflow-hidden"
          >
            {product.image_url ? (
              <img
                src={getImage(product.image_url)}
                alt={product.product_name}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-gray-400 text-sm">No image</span>
            )}
          </Link>

          <div className="min-w-0">
            <Link to={`/product/${product.slug}`}>
              <h2 className="font-bold text-gray-900 text-lg leading-snug line-clamp-2 break-words">
                {product.product_name}
              </h2>
            </Link>

            <p className="text-sm text-gray-500 mt-1">
              SKU: {product.sku || "N/A"}
            </p>

            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {product.parent_category_name
                ? `${product.parent_category_name} / ${product.category_name}`
                : product.category_name}
            </p>

            <ul className="text-sm text-gray-700 mt-3 list-disc ml-5">
              <li>Trade price available</li>
              <li>Bulk discount available</li>
              <li>Fast UK delivery</li>
            </ul>
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
              const isActive = activeTier === tier;

              return (
                <button
                  type="button"
                  key={`${tier.min_qty}-${tier.max_qty}`}
                  onClick={() => onSlabClick(product.product_id, tier.min_qty)}
                  className={`border-r last:border-r-0 text-center min-w-0 ${
                    isActive ? "bg-green-50" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`text-xs border-b border-gray-300 py-1 ${
                      isActive ? "text-green-700" : "text-gray-600"
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

      <div className="border-t border-gray-300 p-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500">Unit price</p>
          <p className="text-2xl font-bold text-green-700">
            £{unitPrice.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">exc. VAT</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={qty}
            onChange={(e) => onQtyChange(product.product_id, e.target.value)}
            placeholder="Qty"
            className="w-20 h-10 border border-gray-300 text-center outline-none"
          />

          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="h-10 px-4 bg-green-700 text-white font-bold text-sm hover:bg-green-800 flex items-center gap-2"
          >
            <ShoppingCart size={15} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}