
import { useState } from "react";

export default function PriceTier({
  tiers = [],
  currentQty = 1,
  isOutOfStock = false,
  onSelect,
  compact = false,
  unit = "Unit",
}) {
  const [selectedTierKey, setSelectedTierKey] = useState(null);

  if (!Array.isArray(tiers) || tiers.length === 0) {
    return null;
  }

  const getUnitLabel = (quantity) => {
    const cleanUnit = String(unit || "Unit").trim();

    if (quantity === 1) return cleanUnit;

    if (cleanUnit.toLowerCase().startsWith("box of")) {
      return cleanUnit;
    }

    if (cleanUnit.toLowerCase().endsWith("s")) {
      return cleanUnit;
    }

    return `${cleanUnit}s`;
  };

  const handleTierClick = (tier, tierKey) => {
    if (isOutOfStock) return;

    setSelectedTierKey(tierKey);
    onSelect?.(tier);
  };

  return (
    <div
      className="grid w-full gap-1"
      style={{
        gridTemplateColumns: `repeat(${tiers.length}, minmax(0, 1fr))`,
      }}
    >
      {tiers.map((tier) => {
        const minimum = Number(tier.min_qty || 1);
        const tierKey = `${tier.min_qty}-${tier.max_qty || "plus"}`;

        const isActive =
          selectedTierKey === tierKey &&
          Number(currentQty) >= minimum &&
          (tier.max_qty == null ||
            Number(currentQty) <= Number(tier.max_qty));

        return (
          <button
            key={tierKey}
            type="button"
            disabled={isOutOfStock}
            onClick={() => handleTierClick(tier, tierKey)}
            className={`min-w-0 border text-center transition ${
              isActive
                ? "border-2 border-black bg-white"
                : "border border-gray-300 bg-white hover:border-gray-500"
            } ${
              isOutOfStock
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
            }`}
          >
            <div
              className={`min-w-0 bg-gray-100 px-0.5 py-2 text-center font-bold leading-tight text-gray-900 ${
                compact
                  ? "text-[13px]"
                  : "text-[13px] sm:text-sm"
              } ${isActive ? "bg-gray-200" : ""}`}
            >
              {minimum}+ {getUnitLabel(minimum)}
            </div>

            <div
              className={`min-w-0 px-0.5 py-2 text-center font-bold text-gray-900 ${
                compact
                  ? "text-sm"
                  : "text-sm sm:text-sm"
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
