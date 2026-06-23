import { Link } from "react-router-dom";

export default function ShopByCollection() {
  const collections = [
    {
      title: "Cable Ties & Fixings",
      text: "Strong, reliable and built to last.",
      image: "/collections/cable-ties.png",
      link: "/subcategory/cable-ties",
      bg: "from-[#062b63] to-[#074ba3]",
    },
    {
      title: "Packing Tape & Dispensers",
      text: "High quality tape for every application.",
      image: "/collections/packing-tape.png",
      link: "/subcategory/packing-tape",
      bg: "from-green-700 to-green-500",
    },
    {
      title: "Postal Bags & Envelopes",
      text: "Secure, durable and perfect for mailing.",
      image: "/collections/postal-bags.png",
      link: "/subcategory/grey-mailing-bags",
      bg: "from-[#062b63] to-[#0756b8]",
    },
  ];

  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#062b63] mb-5">
          Shop by Collection
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {collections.map((item) => (
            <Link
                key={item.title}
                to={item.link}
                className={`relative overflow-hidden rounded-xl bg-linear-to-r ${item.bg} min-h-42.5 p-5 text-white shadow-sm hover:shadow-md transition`}
                >
                <div className="relative z-10 max-w-[52%] h-full flex flex-col">
                    <h3 className="text-lg font-bold leading-tight">
                        {item.title}
                    </h3>

                    <p className="text-sm mt-2 text-white/90 leading-snug">
                        {item.text}
                    </p>

                    <span className="inline-flex mt-auto bg-white text-[#062b63] px-4 py-2 rounded-md text-xs font-bold w-fit">
                        SHOP NOW →
                    </span>
                    </div>

                <img
                    src={item.image}
                    alt={item.title}
                    className="absolute right-2 bottom-0 w-[45%] h-full object-contain"
                />
                </Link>
          ))}
        </div>
      </div>
    </section>
  );
}