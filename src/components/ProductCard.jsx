import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QtyAddControl from "./QtyAddControl";
import PriceTier from "./PriceTier";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function ProductCard({
  product,
  qty = 1,
  activeTier,
  qtyInCart = 0,
  onQtyChange,
  onSlabClick,
  onAddToCart,
}) {
  const navigate = useNavigate();

  const [qtyWarning, setQtyWarning] = useState("");
  const [hasQtyChanged, setHasQtyChanged] = useState(false);

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

  const productQty = qty ?? 1;
  const unit = getSpecValue("Unit") || "Unit";

  const stockQty = Number(product.stock_qty || 0);
  const cartQty = Number(qtyInCart || 0);

  const availableQty = Math.max(stockQty - cartQty, 0);

  const isOutOfStock =
    stockQty < 1 || availableQty < 1;

  const sortedTiers = Array.isArray(product.price_breaks)
    ? [...product.price_breaks].sort(
        (a, b) =>
          Number(a.min_qty || 0) -
          Number(b.min_qty || 0)
      )
    : [];

  const currentPrice = Number(
    activeTier?.price ||
      product.from_price ||
      product.price ||
      product.selling_price ||
      sortedTiers[0]?.price ||
      0
  );

  const goToProduct = () => {
    navigate(`/product/${product.slug}`);
  };

  const handleTierClick = (tier) => {
    const minimumQty = Number(tier.min_qty || 1);
  
    if (minimumQty > availableQty) {
      setQtyWarning(
        cartQty > 0
          ? `Only ${availableQty} available to add, ${cartQty} already in cart`
          : `Only ${availableQty} available to add`
      );
  
      return;
    }
  
    setHasQtyChanged(true);
  
    onSlabClick?.(
      product.product_id,
      minimumQty
    );
  
    setQtyWarning("");
  };

  const handleQtyChange = (value) => {
    setHasQtyChanged(true);
  
    onQtyChange?.(
      product.product_id,
      value,
      availableQty
    );
  
    setQtyWarning("");
  };

  const handleMaxQty = () => {
    setQtyWarning(
      cartQty > 0
        ? `Only ${availableQty} available to add, ${cartQty} already in cart`
        : `Only ${availableQty} available to add`
    );
  };

  const handleAdd = (quantity) => {
    const finalQty = Number(
      quantity || productQty || 1
    );

    if (isOutOfStock) {
      setQtyWarning(
        "This product is out of stock"
      );
      return;
    }

    if (
      !Number.isInteger(finalQty) ||
      finalQty < 1
    ) {
      setQtyWarning(
        "Please enter a valid quantity"
      );
      return;
    }

    if (finalQty > availableQty) {
      handleMaxQty();
      return;
    }

    setQtyWarning("");

    onAddToCart?.(
      product,
      finalQty
    );
  };

  return (
    <>
      {/* Mobile */}
      <article className="flex h-full min-w-0 flex-col overflow-hidden border border-gray-200 bg-white shadow-sm md:hidden">
        <div className="flex h-full min-w-0 flex-col p-3">
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              onClick={goToProduct}
              className="flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden bg-white"
              aria-label={`View ${product.product_name}`}
            >
              {product.image_url ? (
                <img
                  src={getImage(
                    product.image_url
                  )}
                  alt={product.product_name}
                  className="h-full w-full object-contain p-1"
                  loading="lazy"
                />
              ) : (
                <span className="text-[10px] text-gray-400">
                  No image
                </span>
              )}
            </button>

            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={goToProduct}
                className="block w-full cursor-pointer text-left"
              >
                <h2 className="line-clamp-3 text-[13px] font-extrabold leading-[17px] text-[#062653] hover:text-green-700">
                  {product.product_name}
                </h2>
              </button>

              <div className="mt-3 flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xl font-extrabold leading-none text-[#001d4c]">
                    £{currentPrice.toFixed(2)}
                  </p>

                  <p className="mt-1 text-[9px] font-medium text-gray-500">
                    Price per {unit} · exc. VAT
                  </p>
                </div>

                <p
                  className={`shrink-0 text-[9px] font-bold ${
                    isOutOfStock
                      ? "text-red-600"
                      : "text-green-700"
                  }`}
                >
                  {isOutOfStock
                    ? "Out of stock"
                    : "In stock"}
                </p>
              </div>
            </div>
          </div>

          {sortedTiers.length > 1 && (
            <div className="mt-3">
              <PriceTier
                tiers={sortedTiers}
                currentQty={productQty}
                isOutOfStock={isOutOfStock}
                compact
                hasQtyChanged={hasQtyChanged}
                onSelect={handleTierClick}
                unit={unit}
              />
            </div>
          )}

          {cartQty > 0 && (
            <p className="mt-2 text-right text-[10px] font-medium text-gray-500">
              <strong>{cartQty}</strong>{" "}
              {unit} already added to cart
            </p>
          )}

          <div className="mt-3 flex justify-end">
            {isOutOfStock ? (
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed bg-gray-200 px-4 py-2.5 text-sm font-bold text-gray-500"
              >
                Out of stock
              </button>
            ) : (
              <div className="ml-auto w-fit">
                <QtyAddControl
                  value={productQty}
                  maxQty={availableQty}
                  disabled={isOutOfStock}
                  onQtyChange={
                    handleQtyChange
                  }
                  onMaxQty={handleMaxQty}
                  onAdd={handleAdd}
                />
              </div>
            )}
          </div>

          {qtyWarning && (
            <div className="mt-2 border border-amber-200 bg-amber-50 px-2 py-1.5">
              <p className="text-center text-[10px] font-medium leading-4 text-amber-700">
                {qtyWarning}
              </p>
            </div>
          )}
        </div>
      </article>

      {/* Desktop */}
      <article className="hidden h-full min-w-0 flex-col overflow-hidden border border-gray-300 bg-white shadow-sm transition hover:shadow-md md:flex">
        <div className="flex h-full min-w-0 flex-col p-2 sm:p-3">
          <button
            type="button"
            onClick={goToProduct}
            className="block w-full"
          >
            <div className="flex h-28 items-center justify-center overflow-hidden bg-white sm:h-36 md:h-40">
              {product.image_url ? (
                <img
                  src={getImage(
                    product.image_url
                  )}
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

          <button
            type="button"
            onClick={goToProduct}
            className="mt-2 block w-full min-w-0 text-left sm:mt-3"
          >
            <h2 className="line-clamp-2 min-h-8.5 text-[11px] font-bold leading-tight text-gray-700 md:min-h-10.5 md:text-sm">
              {product.product_name}
            </h2>
          </button>

          <div className="mt-2 flex min-w-0 items-end justify-between gap-1.5 sm:mt-3 sm:gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-none text-[#001d4c] sm:text-2xl">
                £{currentPrice.toFixed(2)}
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
              {isOutOfStock
                ? "Out of stock"
                : "In stock"}
            </p>
          </div>

          {sortedTiers.length > 1 && (
            <div className="mt-4">
              <PriceTier
                tiers={sortedTiers}
                currentQty={productQty}
                isOutOfStock={isOutOfStock}
                compact
                hasQtyChanged={hasQtyChanged}
                onSelect={handleTierClick}
                unit={unit}
              />
            </div>
          )}

          <div className="mt-3 flex flex-col items-center sm:mt-4">
            {cartQty > 0 && (
              <p className="mb-1 text-center text-[8px] font-medium text-gray-500 sm:mb-1.5 sm:text-[10px]">
                <strong>{cartQty}</strong>{" "}
                already added to cart
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
                  value={productQty}
                  maxQty={availableQty}
                  disabled={isOutOfStock}
                  onQtyChange={
                    handleQtyChange
                  }
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
    </>
  );
}