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

    if (quantity === 1) {
      return cleanUnit;
    }

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
    <div className="grid grid-cols-4 gap-2">
      {tiers.map((tier) => {
        const minimum = Number(tier.min_qty || 1);

        const tierKey = `${tier.min_qty}-${tier.max_qty || "plus"}`;

        const isActive = selectedTierKey === tierKey;

        return (
          <button
            key={tierKey}
            type="button"
            disabled={isOutOfStock}
            onClick={() => handleTierClick(tier, tierKey)}
            className={`min-w-0 overflow-hidden border text-center transition ${
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
              className={`truncate font-bold text-gray-900 ${
                isActive ? "bg-gray-200" : "bg-gray-100"
              } ${
                compact
                  ? "px-1 py-1.5 text-[10px]"
                  : "px-3 py-2 text-xs"
              }`}
            >
              {minimum}+ {getUnitLabel(minimum)}
            </div>

            <div
              className={`truncate font-bold text-gray-900 ${
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