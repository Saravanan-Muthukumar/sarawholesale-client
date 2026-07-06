import heroTape from "../assets/hero-packaging-supplies.png";
import heroPainting from "../assets/hero-painting.png";
import heroStationery from "../assets/hero-stationery.png";
import heroPostal from "../assets/hero-postal.png";
import heroGloves from "../assets/hero-gloves.png";

import { useEffect, useState } from "react";

import {
  Truck,
  Tag,
  Package,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const slides = [
  {
    eyebrow: "Wholesale Business Supplies",
    title: "Packaging Tapes",
    subtitle: "Strong parcel tapes for warehouses, offices and everyday packing.",
    image: heroTape,
    button: "Shop Packing Tapes",
  },
  {
    eyebrow: "Workplace Essentials",
    title: "Disposable Gloves",
    subtitle: "Nitrile, vinyl and latex gloves for food, cleaning and industrial use.",
    image: heroGloves,
    button: "Shop Gloves",
  },
  {
    eyebrow: "Painting & Decorating",
    title: "Painting Supplies",
    subtitle: "Masking tapes, rollers, brushes and decorating essentials.",
    image: heroPainting,
    button: "Shop Painting Supplies",
  },
  {
    eyebrow: "Office Essentials",
    title: "Stationery Supplies",
    subtitle: "Everyday stationery and office products for businesses.",
    image: heroStationery,
    button: "Shop Stationery",
  },
  {
    eyebrow: "Postal & Packaging",
    title: "Postal Supplies",
    subtitle: "Mailing bags, packaging items and parcel supplies for dispatch.",
    image: heroPostal,
    button: "Shop Postal Supplies",
  },
];

export default function Hero({ onShopNow }) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);

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
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#042454] via-[#0755b5] to-[#0a7adf] text-white min-h-[560px] shadow-sm">
          <div className="absolute right-[-120px] top-[-100px] h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-[-100px] bottom-[-140px] h-[340px] w-[340px] rounded-full bg-green-400/15 blur-3xl" />

          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-white text-blue-900 shadow flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-white text-blue-900 shadow flex items-center justify-center cursor-pointer"
          >
            <ChevronRight size={22} />
          </button>

          <div className="relative z-10 grid lg:grid-cols-[40%_60%] items-center min-h-[560px] px-7 py-10 md:px-12 lg:px-16">
            <div className="max-w-xl">
              <p className="text-green-400 font-extrabold text-xs md:text-sm mb-3 uppercase tracking-wide">
                {slide.eyebrow}
              </p>

              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
                {slide.title}
              </h1>

              <p className="text-base md:text-xl mb-6 text-white/90 leading-relaxed">
                {slide.subtitle}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm md:text-base mb-8">
                <p className="flex items-center gap-3">
                  <Truck className="text-green-400 shrink-0" size={21} />
                  Fast UK delivery
                </p>

                <p className="flex items-center gap-3">
                  <Tag className="text-green-400 shrink-0" size={21} />
                  Bulk discounts
                </p>

                <p className="flex items-center gap-3">
                  <Package className="text-green-400 shrink-0" size={21} />
                  Trade pricing
                </p>

                <p className="flex items-center gap-3">
                  <ShieldCheck className="text-green-400 shrink-0" size={21} />
                  Trusted suppliers
                </p>
              </div>

              <button
                type="button"
                onClick={onShopNow}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-extrabold px-7 py-3 rounded-md cursor-pointer shadow"
              >
                {slide.button} →
              </button>
            </div>

            <div className="relative hidden lg:flex justify-end items-center h-full overflow-visible">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-[118%] max-w-none object-contain drop-shadow-2xl -mr-12 transition-all duration-500"
              />
            </div>

            <div className="relative flex lg:hidden justify-center items-center mt-8 overflow-visible">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full max-w-[420px] object-contain drop-shadow-2xl transition-all duration-500"
              />
            </div>
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  activeSlide === index
                    ? "w-8 bg-green-400"
                    : "w-2.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}