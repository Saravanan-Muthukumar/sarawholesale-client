import { Link } from "react-router-dom";
import { useState } from "react";
import QtyAddControl from "./QtyAddControl";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function ProductListCard({
  product,
  qty = 1,
  activeTier,
  qtyInCart = 0,
  onQtyChange,
  onSlabClick,
  onAddToCart,
}) {
  const [qtyWarning, setQtyWarning] = useState("");

  const getImage = (imageUrl) => {
    if (!imageUrl) return "";

    return imageUrl.startsWith("http")
      ? imageUrl
      : `${API_URL}${imageUrl}`;
  };

  const getSpecValue = (name) => {
    const spec = product.specifications?.find(
      (item) =>
        String(item.spec_name || "").trim().toLowerCase() ===
        String(name || "").trim().toLowerCase()
    );

    return String(spec?.spec_value || "").trim();
  };

  const productQty = qty ?? 1;
  const unitValue = getSpecValue("Unit");

  const isOutOfStock = Number(product.stock_qty || 0) < 1;

  const availableQty = Math.max(
    Number(product.stock_qty || 0) - Number(qtyInCart || 0),
    0
  );

  const currentPrice = Number(
    activeTier?.price ||
      product.from_price ||
      product.price ||
      product.price_breaks?.[0]?.price ||
      0
  );

  return (
    <div className="bg-white border border-gray-300 overflow-hidden">
      {/* Mobile */}
      {/* Mobile */}
<div className="md:hidden px-1.5 py-1.5">
  {/* Product image, name and price tiers */}
  <div className="grid grid-cols-[98px_minmax(0,1fr)] items-start gap-1.5">
    {/* Image */}
    <Link
      to={`/product/${product.slug}`}
      className="h-[68px] flex items-center justify-center overflow-hidden"
    >
      {product.image_url ? (
        <img
          src={getImage(product.image_url)}
          alt={product.product_name}
          className="max-w-full max-h-full object-contain"
        />
      ) : (
        <span className="text-[9px] text-gray-400">
          No image
        </span>
      )}
    </Link>

    <div className="min-w-0 mt-1 ">
      {/* Product name */}
      <Link
        to={`/product/${product.slug}`}
        className="block text-[13px]  font-semibold leading-[16px] text-gray-900 line-clamp-2"
      >
        {product.product_name}
      </Link>

      {/* Small space between name and tiers */}
      <div className="mt-3 mb-2">
        {product.price_breaks?.length > 0 && (
          <div
            className="grid w-full text-center border-t border-l border-gray-300"
            style={{
              gridTemplateColumns: `repeat(
                ${product.price_breaks.length},
                minmax(0, 1fr)
              )`,
            }}
          >
            {product.price_breaks.map((tier) => {
              const isActive =
                Number(activeTier?.min_qty) === Number(tier.min_qty);

              return (
                <button
                  key={`${tier.min_qty}-${tier.max_qty || "plus"}`}
                  type="button"
                  onClick={() => {
                    onSlabClick(product.product_id, tier.min_qty);
                    setQtyWarning("");
                  }}
                  className={`min-w-0 ${
                    isActive ? "bg-gray-300" : "bg-gray-200"
                  }`}
                >
                  <p className="m-0 px-1 py-[4px] text-[12px] leading-3 font-medium whitespace-nowrap bg-gray-200">
                    {tier.max_qty
                      ? `${Number(tier.min_qty)}-${Number(tier.max_qty)}`
                      : `${Number(tier.min_qty)}+`}
                  </p>

                  <p className="m-0 px-1 py-[4px] text-[12px] leading-3 font-bold whitespace-nowrap bg-white">
                    £{Number(tier.price).toFixed(2)}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Stock, price, quantity and add button */}
  <div className="mt-1 flex items-start gap-1">
    {/* Stock and current price */}
    <div className="w-[120px] shrink-0 pt-0.5">
      <p
        className={`text-[12px] leading-3 font-semibold ${
          isOutOfStock || availableQty < 1
            ? "text-red-600"
            : "text-green-700"
        }`}
      >
        {isOutOfStock || availableQty < 1
          ? "✖ Not available"
          : "✔ In stock"}
      </p>

      <p className="mt-0.5 text-[10px] leading-3 font-semibold whitespace-nowrap">
  {unitValue ? `Price per ${unitValue}` : "Price"}

  <span className="ml-2 text-[13px] font-bold">
    £{currentPrice.toFixed(2)}
  </span>
</p>
    </div>

    {/* Quantity control and cart quantity */}
    <div className="min-w-0 flex-1">
      {isOutOfStock || availableQty < 1 ? (
        <button
          type="button"
          disabled
          className="w-full h-9 bg-gray-300 text-gray-500 text-xs font-bold cursor-not-allowed"
        >
          Out of stock
        </button>
      ) : (
        <QtyAddControl
          value={productQty}
          maxQty={availableQty}
          disabled={isOutOfStock}
          onQtyChange={(value) => {
            onQtyChange(
              product.product_id,
              value,
              availableQty
            );

            setQtyWarning("");
          }}
          onMaxQty={() =>
            setQtyWarning(
              Number(qtyInCart || 0) > 0
                ? `Only ${availableQty} available to add, ${qtyInCart} already in cart`
                : `Only ${availableQty} available to add`
            )
          }
          onAdd={(quantity) =>
            onAddToCart(product, quantity)
          }
        />
      )}

      {/* Quantity already in cart */}
      {qtyInCart > 0 && (
        <p className="mt-0.5 text-center text-[9px] leading-3 font-medium text-orange-700">
          {qtyInCart} already in cart
        </p>
      )}
    </div>
  </div>

  {/* Quantity warning */}
  {qtyWarning && (
    <p className="mt-0.5 text-right text-[9px] leading-3 font-medium text-amber-700">
      {qtyWarning}
    </p>
  )}
</div>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-3 pl-3 pr-6 py-3">
        {/* Image */}
        <Link
          to={`/product/${product.slug}`}
          className="w-16 h-16 flex items-center justify-center shrink-0 overflow-hidden"
        >
          {product.image_url ? (
            <img
              src={getImage(product.image_url)}
              alt={product.product_name}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <span className="text-[9px] text-gray-400">
              No image
            </span>
          )}
        </Link>

        {/* Title and stock */}
        <div className="min-w-0 flex-1">
          <Link
            to={`/product/${product.slug}`}
            
            className="text-[11px] md:text-sm font-semibold text-gray-700 leading-tight line-clamp-2 min-h-8.5 md:min-h-10.5"
          >
            {product.product_name}
          </Link>

          <p
            className={`mt-1 text-xs font-semibold ${
              isOutOfStock ? "text-red-600" : "text-green-700"
            }`}
          >
            {isOutOfStock ? "✖ Out of stock" : "✔ In stock"}
          </p>

          {qtyInCart > 0 && (
            <p className="mt-1 text-[10px] text-orange-700">
              {qtyInCart} already in cart
            </p>
          )}
        </div>

        {/* Desktop price tiers */}
        <div className="inline-grid grid-flow-col auto-cols-max text-center text-[10px] border-t border-l border-gray-300">
          {product.price_breaks?.map((tier) => {
            const isActive =
              Number(activeTier?.min_qty) === Number(tier.min_qty);

            const tierUnit =
              Number(tier.min_qty) === 1
                ? unitValue.toLowerCase()
                : `${unitValue.toLowerCase()}s`;

            return (
              <button
                key={`${tier.min_qty}-${tier.max_qty || "plus"}`}
                type="button"
                onClick={() => {
                  onSlabClick(product.product_id, tier.min_qty);
                  setQtyWarning("");
                }}
                className={`min-w-[68px] border border-gray-300 py-1 text-xs font-semibold leading-none ${
                  isActive
                    ? "bg-gray-400 text-gray-900 border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                }`}
              >
                <p className="w-[50px] py-1 leading-3 whitespace-nowrap">
  {tier.max_qty
    ? `${Number(tier.min_qty)}-${Number(tier.max_qty)}`
    : `${Number(tier.min_qty)}+`}
</p>

<p className="w-[50px] border-t border-gray-200 py-1 font-semibold leading-3">
  £{Number(tier.price).toFixed(2)}
</p>
              </button>
            );
          })}
        </div>

        {/* Current price */}
        <div className="w-20 shrink-0 text-right">
          <p className="font-bold text-gray-900">
            £{currentPrice.toFixed(2)}
          </p>

          <p className="text-[11px] text-gray-500">
            ex VAT
          </p>
        </div>

        {/* Desktop quantity and add */}
        <div className="w-[205px] shrink-0">
          {isOutOfStock || availableQty < 1 ? (
            <button
              type="button"
              disabled
              className="w-full h-10 bg-gray-300 text-gray-500 font-bold text-sm cursor-not-allowed"
            >
              Out of stock
            </button>
          ) : (
            <QtyAddControl
              value={productQty}
              maxQty={availableQty}
              disabled={isOutOfStock}
              onQtyChange={(value) => {
                onQtyChange(
                  product.product_id,
                  value,
                  availableQty
                );

                setQtyWarning("");
              }}
              onMaxQty={() =>
                setQtyWarning(
                  Number(qtyInCart || 0) > 0
                    ? `Only ${availableQty} available to add, ${qtyInCart} already in cart`
                    : `Only ${availableQty} available to add`
                )
              }
              onAdd={(quantity) =>
                onAddToCart(product, quantity)
              }
            />
          )}

          {qtyWarning && (
            <p className="mt-1 text-[10px] leading-3 text-right text-amber-700">
              {qtyWarning}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}