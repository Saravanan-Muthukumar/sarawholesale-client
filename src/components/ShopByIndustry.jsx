import { Link } from "react-router-dom";
import {
  Warehouse,
  Paintbrush,
  Building2,
  Utensils,
  PackageCheck,
  BriefcaseBusiness,
} from "lucide-react";

export default function ShopByIndustry() {
  const industries = [
    {
      title: "Warehouses & Packing",
      text: "Tape, stretch wrap, boxes and mailing bags.",
      icon: Warehouse,
      link: "/search?q=packing",
    },
    {
      title: "Painters & Decorators",
      text: "Masking tape, rollers, brushes and protection.",
      icon: Paintbrush,
      link: "/search?q=painting",
    },
    {
      title: "Offices & Stationery",
      text: "A4 paper, files, pens, folders and office supplies.",
      icon: BriefcaseBusiness,
      link: "/category/stationary-and-office-supplies",
    },
    {
      title: "Food & Catering",
      text: "Disposable gloves and food packaging essentials.",
      icon: Utensils,
      link: "/search?q=gloves",
    },
    {
      title: "Postal & Ecommerce",
      text: "Mailing bags, parcel tape and postal packaging.",
      icon: PackageCheck,
      link: "/search?q=postal",
    },
    {
      title: "Local Businesses",
      text: "Everyday supplies for shops, offices and trades.",
      icon: Building2,
      link: "/products",
    },
  ];

  return (
    <section className="bg-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold text-blue-800">
            Shop by Business Type
          </h2>
          <p className="text-sm text-[#071b3a]/55 mt-1">
            Quickly find the supplies your business needs
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {industries.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                to={item.link}
                className="bg-[#f3f4f6] border border-[#d9e2ef] p-4 md:p-5 hover:border-green-500 hover:shadow-md transition"
              >
                <div className="h-11 w-11 rounded-full bg-white flex items-center justify-center text-blue-800 mb-3">
                  <Icon size={24} />
                </div>

                <h3 className="text-sm md:text-lg font-extrabold text-blue-800 leading-tight">
                  {item.title}
                </h3>

                <p className="text-xs md:text-sm text-[#071b3a]/60 mt-2 leading-snug">
                  {item.text}
                </p>

                <p className="text-xs font-extrabold text-green-700 mt-3">
                  Shop Now →
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}