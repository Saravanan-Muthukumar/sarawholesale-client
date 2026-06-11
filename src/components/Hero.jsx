import heroImg from "../assets/hero-packaging-supplies.png";
import { ShieldCheck, Truck, Tag, Headphones } from "lucide-react";

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-4">
      <div className="bg-linear-to-r from-blue-50 to-green-50 rounded-xl overflow-hidden">
        <div className="grid md:grid-cols-2 items-center">
          {/* Text */}
          <div className="p-6 md:p-10">
            <h1 className="text-3xl md:text-5xl font-bold text-[#071b3a] leading-tight">
              Packaging Supplies
              <span className="block text-green-700">
                At Wholesale Prices
              </span>
            </h1>

            <p className="mt-4 text-gray-700 text-base md:text-lg max-w-md">
              Quality packaging supplies and business essentials for retail and
              wholesale customers. Fast delivery, competitive pricing and reliable
              service across the UK.
            </p>


          </div>

          {/* Image */}
          <div className="p-4 md:p-6">
            <img
              src={heroImg}
              alt="Packaging supplies"
              className="w-full h-55 md:h-90 object-contain"
            />
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white/70 grid grid-cols-2 md:grid-cols-4 gap-4 px-5 py-4">
          <Benefit
            icon={<ShieldCheck size={24} />}
            title="Quality Guaranteed"
            text="Premium products you can trust"
          />
          <Benefit
            icon={<Truck size={24} />}
            title="Fast Delivery"
            text="Quick dispatch, every time"
          />
          <Benefit
            icon={<Tag size={24} />}
            title="Competitive Prices"
            text="Better prices for your business"
          />
          <Benefit
            icon={<Headphones size={24} />}
            title="Customer Support"
            text="Here to help you"
          />
        </div>
      </div>
    </section>
  );
}

function Benefit({ icon, title, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-bold text-[#071b3a]">{title}</h3>
        <p className="text-xs text-gray-600">{text}</p>
      </div>
    </div>
  );
}