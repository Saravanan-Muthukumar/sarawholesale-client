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
    <section className="bg-[#f3f4f6] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-linear-to-r from-[#062b63] via-[#06499c] to-[#0877d8] text-white p-6 md:p-8 shadow-sm">
          <div className="grid md:grid-cols-[1.3fr_1fr] gap-6 items-center">
            <div>
              <p className="text-green-400 text-sm font-extrabold uppercase mb-2">
                For businesses and trade customers
              </p>

              <h2 className="text-2xl md:text-4xl font-extrabold leading-tight">
                Need regular supplies for your business?
              </h2>

              <p className="text-white/85 mt-3 text-sm md:text-base max-w-2xl">
                SARA Wholesale can supply tapes, gloves, stationery, painting
                supplies and postal packaging for local businesses, warehouses,
                offices and trade customers.
              </p>
            </div>

            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                {points.map((point) => (
                  <p
                    key={point}
                    className="flex items-center gap-2 text-sm font-semibold"
                  >
                    <CheckCircle size={18} className="text-green-400" />
                    {point}
                  </p>
                ))}
              </div>

              <Link
                to="/contact"
                className="inline-flex bg-green-600 hover:bg-green-700 text-white font-extrabold px-6 py-3 rounded-md"
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