import { Minus, Plus, ShoppingCart } from "lucide-react";

export default function QtyAddControl({
  value,
  onQtyChange,
  onMaxQty,
  onAdd,
  maxQty = Infinity,
  disabled = false,
}) {
  const qty =
    value === undefined || value === null ? "1" : value === "" ? "" : String(value);

  const stockLimit = Number(maxQty || 0) > 0 ? Number(maxQty) : Infinity;

  const updateQty = (newValue) => {
    if (newValue === "") {
      onQtyChange("");
      return;
    }

    const numberValue = Number(newValue);

    if (Number.isNaN(numberValue)) return;

    if (numberValue < 1) {
      onQtyChange("1");
      return;
    }

    if (numberValue > stockLimit) {
      onQtyChange(String(stockLimit));
      onMaxQty?.();
      return;
    }

    onQtyChange(String(numberValue));
  };

  const handleIncrease = () => {
    const currentQty = Number(qty || 0);

    if (currentQty >= stockLimit) {
      onMaxQty?.();
      return;
    }

    updateQty(currentQty + 1);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 border border-gray-300 bg-white">
        <button
          type="button"
          disabled={disabled || Number(qty || 1) <= 1}
          onClick={() => updateQty(Number(qty || 1) - 1)}
          className="w-9 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
        >
          <Minus size={14} />
        </button>

        <input
          value={qty}
          disabled={disabled}
          onChange={(e) => updateQty(e.target.value)}
          onBlur={() => {
            if (qty === "" || Number(qty) < 1) onQtyChange("1");
          }}
          className="w-12 text-center border-x border-gray-300 outline-none disabled:bg-gray-100"
        />

        <button
          type="button"
          disabled={disabled}
          onClick={handleIncrease}
          className="w-9 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
        >
          <Plus size={14} />
        </button>
      </div>

      <button
        type="button"
        disabled={disabled || qty === ""}
        onClick={() => onAdd(Number(qty || 1))}
        className="h-10 px-4 bg-black text-white font-bold hover:bg-gray-900 transition-colors disabled:bg-gray-300 disabled:text-gray-500 flex items-center gap-2"
      >
        <ShoppingCart size={16} />
        Add
      </button>
    </div>
  );
}