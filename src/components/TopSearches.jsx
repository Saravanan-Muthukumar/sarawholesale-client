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
    <section className="bg-white border-y border-[#d9e2ef]">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-extrabold text-blue-800 mr-2">
            Top Searches:
          </span>

          {searches.map((item) => (
            <Link
              key={item.name}
              to={item.link}
              className="bg-[#f3f4f6] hover:bg-green-600 hover:text-white border border-[#d9e2ef] text-[#071b3a] text-xs md:text-sm font-bold px-3 py-2 rounded-full transition"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}