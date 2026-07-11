export default function PriceTier({
    tiers = [],
    currentQty = 1,
    isOutOfStock = false,
    onSelect,
    getSlabLabel,
    compact = false,
  }) {
    if (!Array.isArray(tiers) || tiers.length === 0) {
      return null;
    }
  
    return (
      <div className="grid grid-cols-4 gap-2">
        {tiers.map((tier) => {
          const minimum = Number(tier.min_qty || 1);
  
          const maximum =
            tier.max_qty === null ||
            tier.max_qty === undefined ||
            tier.max_qty === ""
              ? Infinity
              : Number(tier.max_qty);
  
          const isActive =
            Number(currentQty) >= minimum &&
            Number(currentQty) <= maximum;
  
          return (
            <button
              key={`${tier.min_qty}-${tier.max_qty || "plus"}`}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelect?.(tier)}
              className={`min-w-0 overflow-hidden border text-center transition ${
                isActive
                  ? "border-green-600 bg-green-50"
                  : "border-[#d9e2ef] bg-white hover:border-green-500"
              } ${
                isOutOfStock
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              }`}
            >
              <div
                className={`truncate bg-[#f5f7fb] font-bold text-[#071b3a] ${
                  compact
                    ? "px-1 py-1.5 text-[10px]"
                    : "px-3 py-2 text-xs"
                }`}
              >
                {getSlabLabel
                  ? getSlabLabel(tier)
                  : tier.max_qty
                  ? `${tier.min_qty}-${tier.max_qty}`
                  : `${tier.min_qty}+`}
              </div>
  
              <div
                className={`truncate font-bold text-green-700 ${
                  compact
                    ? "px-1 py-1.5 text-[12px]"
                    : "px-3 py-2 text-sm"
                }`}
              >
                £{Number(tier.price || 0).toFixed(2)}
              </div>
            </button>
          );
        })}
      </div>
    );
  }