import { Minus, Plus, ShoppingCart } from "lucide-react";

export default function QtyAddControl({ value, onQtyChange, onAdd }) {
  const qty = value === undefined || value === null ? "1" : value === "" ? "" : String(value);

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

    onQtyChange(String(numberValue));
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 border border-gray-300 bg-white">
        <button
          type="button"
          onClick={() => updateQty(Number(qty || 1) - 1)}
          className="w-9 flex items-center justify-center hover:bg-gray-100"
        >
          <Minus size={14} />
        </button>

        <input
          value={qty}
          onChange={(e) => updateQty(e.target.value)}
          onBlur={() => {
            if (qty === "" || Number(qty) < 1) onQtyChange("1");
          }}
          className="w-12 text-center border-x border-gray-300 outline-none"
        />

        <button
          type="button"
          onClick={() => updateQty(Number(qty || 0) + 1)}
          className="w-9 flex items-center justify-center hover:bg-gray-100"
        >
          <Plus size={14} />
        </button>
      </div>

      <button
        type="button"
        disabled={qty === ""}
        onClick={() => onAdd(Number(qty || 1))}
        className="h-10 px-4 bg-green-700 text-white font-bold disabled:bg-gray-300 flex items-center gap-2"
      >
        <ShoppingCart size={16} />
        Add
      </button>
    </div>
  );
}