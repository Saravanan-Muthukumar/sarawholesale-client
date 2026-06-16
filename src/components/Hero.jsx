import heroImg from "../assets/hero-packaging-supplies.png";
import { Truck, Tag, Package } from "lucide-react";

export default function Hero({ onShopNow }) {
  return (
    <section className="bg-gradient-to-r from-[#062b63] via-[#06499c] to-[#0877d8] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-14 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="text-green-400 font-bold text-sm mb-3">
            WHOLESALE SUPPLIES OF PACKAGING AND STATIONARY
          </p>

          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
            Everything your business needs, delivered fast.
          </h1>

          <div className="space-y-3 text-sm md:text-base mb-7">
          <p className="flex items-center gap-3">
              <Truck className="text-green-400" size={22} />
              Next day delivery across UK mainland
            </p>

            <p className="flex items-center gap-3">
              <Tag className="text-green-400" size={22} />
              Trade price even for minimum quantity
            </p>

            <p className="flex items-center gap-3">
              <Package className="text-green-400" size={22} />
              Same day delivery within 50 miles of Slough
            </p>
          </div>

          <button
            type="button"
            onClick={onShopNow}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-7 py-3 rounded-md cursor-pointer"
          >
            SHOP NOW →
          </button>
        </div>

        <div className="flex justify-center">
          <img
            src={heroImg}
            alt="Wholesale packaging supplies"
            className="w-full max-w-xl object-contain"
          />
        </div>
      </div>
    </section>
  );
}