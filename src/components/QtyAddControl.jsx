import { useState } from "react";
import { ShoppingCart } from "lucide-react";

export default function QtyAddControl({
  onAdd,
  buttonText = "Add",
  defaultQty = 1,
  className = "",
}) {
  const [qty, setQty] = useState(String(defaultQty));

  const disabled = qty === "";

  const updateQty = (value) => {
    const clean = value.replace(/\D/g, "");

    if (clean === "") {
      setQty("");
      return;
    }

    if (Number(clean) <= 0) {
      setQty("1");
      return;
    }

    setQty(clean);
  };

  const decrease = () => {
    if (qty === "") {
      setQty("1");
      return;
    }

    setQty(String(Math.max(1, Number(qty) - 1)));
  };

  const increase = () => {
    setQty(String(Number(qty || 0) + 1));
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-10 border border-gray-300 overflow-hidden bg-white">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            decrease();
          }}
          className="w-10 bg-gray-100 text-2xl font-bold text-gray-900 hover:bg-gray-200"
        >
          −
        </button>

        <input
          type="text"
          inputMode="numeric"
          value={qty}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => updateQty(e.target.value)}
          className="w-14 text-center text-black font-bold outline-none"
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            increase();
          }}
          className="w-10 bg-gray-100 text-2xl font-bold text-gray-900 hover:bg-gray-200"
        >
          +
        </button>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onAdd(Number(qty));
        }}
        className={`h-10 px-4 font-bold text-sm flex items-center gap-2 ${
          disabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-green-700 text-white hover:bg-green-800"
        }`}
      >
        <ShoppingCart size={15} />
        {buttonText}
      </button>
    </div>
  );
}