import { Link } from "react-router-dom";

export default function TopSearches() {
  const searches = [
    { name: "Packing Tape", link: "/search?q=packing tape" },
    { name: "Masking Tape", link: "/search?q=masking tape" },
    { name: "Nitrile Gloves", link: "/search?q=nitrile gloves" },
    { name: "Vinyl Gloves", link: "/search?q=vinyl gloves" },
    { name: "Till Paper", link: "/search?q=till-paper" },
    { name: "A4 Paper", link: "/subcategory/a4-paper" },
    { name: "Mailing Bags", link: "/search?q=mailing bags" },
    { name: "Cable Tie", link: "/search?q=cable tie" },
  ];

  return (
    <section className="bg-white">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap justify-center items-center gap-3">
          <span className="text-base font-bold text-[#1F2937]">
            Popular Searches
          </span>

          {searches.map((item) => (
            <Link
              key={item.name}
              to={item.link}
              className="
                bg-[#F5F5F5]
                text-[#1F2937]
                text-sm
                font-medium
                px-4
                py-2
                rounded-full
                transition-all
                duration-300
                hover:bg-[#C1121F]
                hover:text-white
                hover:-translate-y-0.5
              "
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}