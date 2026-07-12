import { Link } from "react-router-dom";

export default function ShopByCollection() {
  const collections = [
    {
      title: "Cable Ties & Fixings",
      text: "Strong, reliable and built to last.",
      image: "/collections/cable-ties.png",
      link: "/subcategory/cable-ties",
      bg: "from-[#ffffff] via-[#fafafa] to-[#f2f4f7]",
    },
    {
      title: "Packing Tape & Dispensers",
      text: "High quality tape for every application.",
      image: "/collections/packing-tape.png",
      link: "/subcategory/packing-tape",
      bg: "from-[#fffdfd] via-[#fff8f8] to-[#fef2f2]",
    },
    {
      title: "Postal Bags & Envelopes",
      text: "Secure, durable and perfect for mailing.",
      image: "/collections/postal-bags.png",
      link: "/subcategory/grey-mailing-bags",
      bg: "from-[#ffffff] via-[#fafafa] to-[#f4f4f5]",
    },
  ];

  return (
    <section className="bg-white py-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-[#1f2937] mb-5">
          Shop by Collection
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {collections.map((item) => (
            <Link
              key={item.title}
              to={item.link}
              className={`relative overflow-hidden rounded-xl bg-linear-to-br ${item.bg} min-h-42.5 p-5 border border-[#e5e7eb] shadow-sm hover:shadow-md hover:border-[#d32f2f]/25 transition`}
            >
              <div className="absolute right-0 bottom-0 w-56 h-56 rounded-full bg-[#d32f2f]/5 blur-3xl" />

              <div className="absolute left-0 bottom-0 w-40 h-20 bg-linear-to-r from-[#d32f2f]/5 to-transparent" />

              <div className="relative z-10 max-w-[60%] h-full flex flex-col">
                <h3 className="text-lg font-bold leading-tight text-[#1f2937]">
                  {item.title}
                </h3>

                <div className="w-8 h-0.5 bg-[#d32f2f] mt-3" />

                <p className="text-sm mt-2 text-[#4b5563] leading-snug">
                  {item.text}
                </p>

                <span className="inline-flex mt-auto bg-[#d32f2f] hover:bg-[#b71c1c] text-white px-4 py-2 rounded-md text-xs font-bold w-fit transition-colors">
                  SHOP NOW →
                </span>
              </div>

              <img
                src={item.image}
                alt={item.title}
                className="absolute right-0 bottom-0 w-[46%] h-full object-contain z-10"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}