import heroTape from "../assets/hero-packaging-supplies.png";
import heroPainting from "../assets/hero-painting.png";
import heroStationery from "../assets/hero-stationery.png";
import heroPostal from "../assets/hero-postal.png"
import {
  Truck,
  Tag,
  Package,
  Gift,
  Mail,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    title: "Packing Tapes for Every Need",
    subtitle: "Strong hold. Every time.",
    image: heroTape,
    button: "Shop Packing Tapes",
  },
  {
    title: "Painting Tools & Accessories",
    subtitle: "Finish with professional quality.",
    image: heroPainting,
    button: "Shop Painting Tools",
  },
  {
    title: "Stationery & Office Supplies",
    subtitle: "Everything your office needs.",
    image: heroStationery,
    button: "Shop Stationery",
  },
  {
    title: "Postal and Packing",
    subtitle: "Everything your postall needs.",
    image: heroPostal,
    button: "Shop Postal and Packing",
  },
];

export default function Hero({ onShopNow }) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const slide = slides[activeSlide];

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <section className="bg-[#f3f4f6] px-4 py-5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-5">
        {/* LEFT SLIDER */}
        <div className="relative overflow-hidden bg-linear-to-r from-[#062b63] via-[#06499c] to-[#0877d8] text-white min-h-[430px]">
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white text-blue-900 shadow flex items-center justify-center"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white text-blue-900 shadow flex items-center justify-center"
          >
            <ChevronRight size={22} />
          </button>

          <div className="grid md:grid-cols-2 gap-5 items-center h-full px-7 py-8 md:px-10">
            <div>
              <p className="text-green-400 font-bold text-sm mb-3 uppercase">
                Wholesale prices
              </p>

              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
                {slide.title}
              </h1>

              <p className="text-lg md:text-xl mb-6 text-white/90">
                {slide.subtitle}
              </p>

              <div className="space-y-3 text-sm md:text-base mb-7">
                <p className="flex items-center gap-3">
                  <Truck className="text-green-400" size={21} />
                  Next day delivery across UK mainland
                </p>

                <p className="flex items-center gap-3">
                  <Tag className="text-green-400" size={21} />
                  Trade price even for minimum quantity
                </p>

                <p className="flex items-center gap-3">
                  <Package className="text-green-400" size={21} />
                  Wide range of business supplies
                </p>
              </div>

              <button
                type="button"
                onClick={onShopNow}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-md"
              >
                {slide.button} →
              </button>
            </div>

            <div className="flex justify-center">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full max-w-md object-contain"
              />
            </div>
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  activeSlide === index
                    ? "w-7 bg-green-400"
                    : "w-2.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="grid gap-4">
          <div className="bg-[#dff3ff] border border-blue-100 p-5 flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-blue-800">
              <Gift size={34} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-extrabold text-blue-800 uppercase">
                Welcome Offer
              </p>
              <h2 className="text-4xl font-extrabold text-blue-900">
                10% OFF
              </h2>
              <p className="text-sm font-semibold text-blue-900">
                On your first online order
              </p>
              <p className="text-xs text-blue-800 mt-1">
                Use code: <span className="font-extrabold">WELCOME10</span>
              </p>
            </div>
          </div>

          <div className="bg-[#e5fff0] border border-green-100 p-5 flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-green-700">
              <Mail size={34} />
            </div>

            <div className="flex-1">
              <h2 className="text-3xl font-extrabold text-green-700">
                £5 VOUCHER
              </h2>
              <p className="text-sm font-bold text-[#071b3a]">
                For subscribing to offers and updates
              </p>

              <button
                type="button"
                className="mt-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-5 py-2 rounded"
              >
                Subscribe Now
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#d9e2ef] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-extrabold text-blue-800">
                New Products
              </h2>
              <button className="text-sm font-bold text-blue-700">
                View all
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                "Brown Packing Tape",
                "Paint Brush 2 inch",
                "Postal Boxes",
                "Ballpoint Pens",
              ].map((name) => (
                <div
                  key={name}
                  className="border border-[#edf1f7] p-3 text-center"
                >
                  <div className="h-16 bg-[#f5f7fb] mb-2 flex items-center justify-center">
                    <Package size={28} className="text-blue-800" />
                  </div>

                  <p className="text-xs font-bold text-[#071b3a] leading-tight">
                    {name}
                  </p>

                  <p className="text-sm font-extrabold text-blue-800 mt-1">
                    From £0.85
                  </p>

                  <button
                    type="button"
                    className="mt-2 h-8 w-8 mx-auto border border-[#d9e2ef] flex items-center justify-center hover:bg-[#f5f7fb]"
                  >
                    <ShoppingCart size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}