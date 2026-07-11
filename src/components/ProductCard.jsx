import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QtyAddControl from "./QtyAddControl";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function ProductCard({
  product,
  onAddToCart,
  qtyInCart = 0,
}) {
  const navigate = useNavigate();

  const [qty, setQty] = useState("1");
  const [qtyWarning, setQtyWarning] = useState("");

  const getImage = (imageUrl) => {
    if (!imageUrl) return "";

    return imageUrl.startsWith("http")
      ? imageUrl
      : `${API_URL}${imageUrl}`;
  };

  const getSpecValue = (name) => {
    const specification = product.specifications?.find(
      (item) =>
        String(item.spec_name || "")
          .trim()
          .toLowerCase() ===
        String(name || "")
          .trim()
          .toLowerCase()
    );

    return String(specification?.spec_value || "").trim();
  };

  const getSlabLabel = (tier) => {
    return tier.max_qty
      ? `${tier.min_qty}-${tier.max_qty}`
      : `${tier.min_qty}+`;
  };

  const unit = getSpecValue("Unit") || "Unit";

  const currentQty = Math.max(Number(qty || 1), 1);
  const stockQty = Number(product.stock_qty || 0);
  const cartQty = Number(qtyInCart || 0);

  const availableQty = Math.max(stockQty - cartQty, 0);
  const isOutOfStock = stockQty < 1 || availableQty < 1;

  const sortedTiers = Array.isArray(product.price_breaks)
    ? [...product.price_breaks].sort(
        (a, b) => Number(a.min_qty) - Number(b.min_qty)
      )
    : [];

  const activeTier =
    sortedTiers.find((tier) => {
      const minimum = Number(tier.min_qty || 1);

      const maximum =
        tier.max_qty === null ||
        tier.max_qty === undefined ||
        tier.max_qty === ""
          ? Infinity
          : Number(tier.max_qty);

      return currentQty >= minimum && currentQty <= maximum;
    }) ||
    sortedTiers[0] ||
    null;

  const unitPrice = activeTier
    ? Number(activeTier.price || 0)
    : Number(
        product.from_price ||
          product.price ||
          product.selling_price ||
          0
      );

  const handleTierClick = (tier) => {
    if (isOutOfStock) return;

    const minimumQty = Number(tier.min_qty || 1);

    if (minimumQty > availableQty) {
      setQtyWarning(
        cartQty > 0
          ? `Only ${availableQty} available to add, ${cartQty} already in cart`
          : `Only ${availableQty} available to add`
      );

      return;
    }

    setQty(String(minimumQty));
    setQtyWarning("");
  };

  const handleQtyChange = (value) => {
    setQtyWarning("");

    if (value === "") {
      setQty("");
      return;
    }

    const nextQty = Math.max(Number(value) || 1, 1);

    setQty(String(nextQty));
  };

  const handleMaxQty = () => {
    setQtyWarning(
      cartQty > 0
        ? `Only ${availableQty} available to add, ${cartQty} already in cart`
        : `Only ${availableQty} available to add`
    );
  };

  const handleAdd = (quantity) => {
    const finalQty = Number(quantity || qty || 1);

    if (isOutOfStock) {
      setQtyWarning("This product is out of stock");
      return;
    }

    if (!Number.isInteger(finalQty) || finalQty < 1) {
      setQtyWarning("Please enter a valid quantity");
      return;
    }

    if (finalQty > availableQty) {
      handleMaxQty();
      return;
    }

    setQtyWarning("");
    onAddToCart(product, finalQty);
  };

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden border border-gray-300 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex h-full min-w-0 flex-col p-2 sm:p-3">
        {/* Product image */}
        <button
          type="button"
          onClick={() => navigate(`/product/${product.slug}`)}
          className="block w-full"
        >
          <div className="flex h-28 items-center justify-center overflow-hidden bg-white sm:h-36 md:h-40">
            {product.image_url ? (
              <img
                src={getImage(product.image_url)}
                alt={product.product_name}
                className="h-full w-full object-contain p-1 sm:p-2"
                loading="lazy"
              />
            ) : (
              <span className="text-[10px] text-gray-400 sm:text-sm">
                No image
              </span>
            )}
          </div>
        </button>

        {/* Product name */}
        <button
          type="button"
          onClick={() => navigate(`/product/${product.slug}`)}
          className="mt-2 block w-full min-w-0 text-left sm:mt-3"
        >
          <h2 className="line-clamp-2 min-h-9 text-[11px] font-extrabold leading-4 text-[#062653] hover:text-green-700 sm:min-h-10 sm:text-[14px] sm:leading-5">
            {product.product_name}
          </h2>
        </button>

        {/* Main price and stock */}
        <div className="mt-2 flex min-w-0 items-end justify-between gap-1.5 sm:mt-3 sm:gap-2">
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold leading-none text-[#001d4c] sm:text-2xl">
              £{unitPrice.toFixed(2)}
            </p>

            <p className="mt-1 truncate text-[8px] font-semibold text-gray-400 sm:text-[10px]">
              Price per {unit} · exc. VAT
            </p>
          </div>

          <p
            className={`shrink-0 pb-0.5 text-[8px] font-bold sm:text-[10px] ${
              isOutOfStock
                ? "text-red-600"
                : "text-green-700"
            }`}
          >
            {isOutOfStock ? "Out of stock" : "In stock"}
          </p>
        </div>

        {/* Price tiers */}
        {sortedTiers.length > 0 && (
          <div
            className="mt-3 grid gap-0.5 sm:mt-4 sm:gap-1"
            style={{
              gridTemplateColumns: `repeat(${sortedTiers.length}, minmax(0, 1fr))`,
            }}
          >
            {sortedTiers.map((tier) => {
              const minimum = Number(tier.min_qty || 1);

              const maximum =
                tier.max_qty === null ||
                tier.max_qty === undefined ||
                tier.max_qty === ""
                  ? Infinity
                  : Number(tier.max_qty);

              const isActive =
                currentQty >= minimum &&
                currentQty <= maximum;

              return (
                <button
                  key={`${tier.min_qty}-${tier.max_qty || "plus"}`}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => handleTierClick(tier)}
                  className={`min-w-0 border px-0.5 py-1 text-center transition sm:px-1 sm:py-1.5 ${
                    isActive
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 bg-gray-50 hover:border-green-500"
                  } ${
                    isOutOfStock
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }`}
                >
                  <p
                    className={`truncate text-[7px] font-semibold sm:text-[9px] ${
                      isActive
                        ? "text-green-800"
                        : "text-gray-600"
                    }`}
                  >
                    {getSlabLabel(tier)}
                  </p>

                  <p
                    className={`mt-0.5 truncate text-[8px] font-extrabold sm:text-[11px] ${
                      isActive
                        ? "text-green-700"
                        : "text-gray-900"
                    }`}
                  >
                    £{Number(tier.price || 0).toFixed(2)}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Quantity control */}
        <div className="mt-3 flex flex-col items-center sm:mt-4">
          {cartQty > 0 && (
            <p className="mb-1 text-center text-[8px] font-medium text-gray-500 sm:mb-1.5 sm:text-[10px]">
              <strong>{cartQty}</strong> already added
            </p>
          )}

          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed bg-gray-200 px-2 py-2 text-[10px] font-bold text-gray-500 sm:max-w-[230px] sm:px-4 sm:py-2.5 sm:text-sm"
            >
              Out of stock
            </button>
          ) : (
            <div className="w-full sm:max-w-[230px]">
              <QtyAddControl
                value={qty}
                maxQty={availableQty}
                disabled={isOutOfStock}
                onQtyChange={handleQtyChange}
                onMaxQty={handleMaxQty}
                onAdd={handleAdd}
              />
            </div>
          )}

          {qtyWarning && (
            <div className="mt-2 w-full border border-amber-200 bg-amber-50 px-1.5 py-1 sm:max-w-[230px] sm:px-2 sm:py-1.5">
              <p className="text-center text-[8px] font-medium leading-3 text-amber-700 sm:text-[10px]">
                {qtyWarning}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}