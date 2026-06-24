export default function PriceMatchBanner() {
    return (
      <section className="relative overflow-hidden bg-linear-to-r from-green-700 via-green-600 to-green-700 text-white">
        {/* Animated Shine */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-40 h-full w-32 bg-white/10 rotate-12 animate-[shine_5s_linear_infinite]" />
        </div>
  
        <div className="relative max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Badge */}
            <div className="shrink-0">
              <div className="h-16 w-16 rounded-full bg-white text-green-700 flex items-center justify-center font-black text-3xl animate-pulse shadow-lg">
                £
              </div>
            </div>
  
            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-wide">
                Price Match Guarantee
              </h2>
  
              <p className="mt-1 text-sm md:text-base text-green-50">
                Found a lower price elsewhere? We'll do our best to beat it.
              </p>
  
              <div className="mt-3 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-sm md:text-base font-semibold">
                <span className="text-yellow-300">
                  ⭐ Contractor Pricing Available
                </span>
  
                <span className="text-yellow-300">
                  ⭐ Bulk Order Discounts
                </span>
  
                <span className="text-yellow-300">
                  ⭐ Trade Accounts Available
                </span>
              </div>
            </div>
  
            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="tel:07424715150"
                className="bg-white text-green-700 font-bold px-5 py-3 rounded-lg shadow-lg hover:scale-105 transition"
              >
                Call 07424 715150
              </a>
  
              <a
                href="/contact"
                className="bg-yellow-400 text-black font-bold px-5 py-3 rounded-lg shadow-lg hover:scale-105 transition"
              >
                Request Trade Pricing
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }