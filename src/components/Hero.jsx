import heroTape from "../assets/hero-packaging-supplies.png";
import heroPainting from "../assets/hero-painting.png";
import heroStationery from "../assets/hero-stationery.png";
import heroPostal from "../assets/hero-postal.png";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import NewProductsByCategory from "../components/NewProductsByCategory";

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
    subtitle: "Everything your postal needs.",
    image: heroPostal,
    button: "Shop Postal and Packing",
  },
];

export default function Hero({ onShopNow, categories = [] }) {
  const [activeSlide, setActiveSlide] = useState(0);

  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  useEffect(() => {
    if (!categories.length) return;
  
    const timer = setInterval(() => {
      setActiveCategoryIndex((prev) =>
        prev + 1 >= categories.length ? 0 : prev + 1
      );
    }, 2500);
  
    return () => clearInterval(timer);
  }, [categories]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const slide = slides[activeSlide];

  const visibleCategories =
  categories.length > 0
    ? [
        categories[activeCategoryIndex % categories.length],
        categories[(activeCategoryIndex + 1) % categories.length],
        categories[(activeCategoryIndex + 2) % categories.length],
      ]
    : [];;

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const closeSubscribeModal = () => {
    setSubscribeOpen(false);
    setEmail("");
    setMessage("");
    setIsSuccess(false);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/subscriptions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setIsSuccess(false);
          setMessage("This email is already subscribed.");
        } else {
          setIsSuccess(false);
          setMessage(data.message || "Subscription failed.");
        }
        return;
      }

      setIsSuccess(true);
      setMessage(
        `Your £5 voucher code is ${data.offerCode}. Use it on your next order.`
      );
      setEmail("");
    } catch (err) {
      console.error(err);
      setIsSuccess(false);
      setMessage("Unable to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#f3f4f6] px-4 py-5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-5">
        {/* LEFT SLIDER */}
        <div className="relative overflow-hidden bg-linear-to-r from-[#062b63] via-[#06499c] to-[#0877d8] text-white min-h-[430px]">
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white text-blue-900 shadow flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white text-blue-900 shadow flex items-center justify-center cursor-pointer"
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
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-md cursor-pointer"
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
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
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
                onClick={() => setSubscribeOpen(true)}
                className="mt-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-5 py-2 rounded cursor-pointer"
              >
                Subscribe Now
              </button>
            </div>
          </div>
          <div className="bg-white border border-[#d9e2ef] p-4 shadow-sm overflow-hidden">
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-lg font-extrabold text-blue-800">
      Shop Sub Categories
    </h2>

    <button
      type="button"
      onClick={onShopNow}
      className="text-sm font-bold text-blue-700 hover:underline cursor-pointer"
    >
      View all
    </button>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    {visibleCategories.map((category) => (
      <Link
        key={category.category_id}
        to={`/category/${category.slug}`}
        className="block border border-[#edf1f7] bg-white hover:shadow-md transition"
      >
        <div className="h-32 bg-[#f5f7fb] flex items-center justify-center overflow-hidden">
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.category_name}
              className="w-full h-full object-contain"
            />
          ) : (
            <Package size={36} className="text-blue-800" />
          )}
        </div>

        <div className="p-2 text-center">
          <p className="text-xs font-extrabold text-[#071b3a] line-clamp-2">
            {category.category_name}
          </p>
          <p className="text-[11px] text-blue-700 font-bold mt-1">
            View →
          </p>
        </div>
      </Link>
    ))}
  </div>
</div> 
        </div>
      </div>

      {/* SUBSCRIBE MODAL */}
      {subscribeOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md p-8 shadow-xl relative">
            <button
              type="button"
              onClick={closeSubscribeModal}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-900 text-2xl cursor-pointer"
            >
              ×
            </button>

            <h2 className="text-3xl font-extrabold text-green-700 mb-3">
              Get £5 Voucher
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Subscribe to offers and updates from SARA WHOLESALE.
            </p>

            {!message ? (
              <form onSubmit={handleSubscribe}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full border border-gray-300 px-3 py-2 mb-3 outline-none focus:border-green-600"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="text-5xl mb-3">
                  {isSuccess ? "🎉" : "ℹ️"}
                </div>

                <p
                  className={`text-lg font-bold ${
                    isSuccess ? "text-green-700" : "text-orange-600"
                  }`}
                >
                  {isSuccess
                    ? "Subscription Successful"
                    : "Already Subscribed"}
                </p>

                <p
                  className={`text-sm mt-3 ${
                    isSuccess ? "text-green-700" : "text-orange-600"
                  }`}
                >
                  {message}
                </p>

                <button
                  type="button"
                  onClick={closeSubscribeModal}
                  className="mt-5 bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}