import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function TradeAccountBanner() {
  const points = [
    "Bulk pricing",
    "Business invoicing",
    "Repeat order support",
    "Local delivery options",
  ];

  return (
    <section className="bg-[#f8f9fb] py-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden border border-[#e5e7eb] bg-white shadow-sm p-6 md:p-8">
          {/* Decorative background */}
          <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-[#d32f2f]/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gray-100 blur-3xl" />

          <div className="relative grid md:grid-cols-[1.3fr_1fr] gap-6 items-center">
            <div>
              <p className="text-[#d32f2f] text-sm font-bold uppercase tracking-wider mb-2">
                For businesses and trade customers
              </p>

              <h2 className="text-2xl md:text-4xl font-extrabold leading-tight text-[#1f2937]">
                Need regular supplies for your business?
              </h2>

              <p className="text-[#4b5563] mt-4 text-sm md:text-base max-w-2xl leading-relaxed">
                SARA Wholesale supplies tapes, gloves, stationery,
                painting supplies and postal packaging for businesses,
                warehouses, offices and trade customers across the UK.
              </p>
            </div>

            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {points.map((point) => (
                  <p
                    key={point}
                    className="flex items-center gap-2 text-sm font-semibold text-[#374151]"
                  >
                    <CheckCircle
                      size={18}
                      className="text-[#d32f2f] shrink-0"
                    />
                    {point}
                  </p>
                ))}
              </div>

              <Link
                to="/contact"
                className="inline-flex items-center bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold px-6 py-3 transition-colors"
              >
                Contact Us →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}