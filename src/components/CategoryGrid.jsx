import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function CategoryGrid({ categories = [] }) {
  const parentCategories = categories.filter(
    (cat) => !cat.parent_category_id
  );

  const getImage = (imageUrl) => {
    if (!imageUrl) return null;

    const url = imageUrl.startsWith("http")
      ? imageUrl
      : `${API_URL}${imageUrl}`;

    return `${url}?v=${Date.now()}`;
  };

  return (
    <section className="bg-[#F5F5F5]">
      <div className="max-w-[1570px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937]">
            Shop by Category
          </h2>

          <p className="mt-2 text-[#6B7280] text-sm md:text-base">
            Everything you need for packaging, office and trade supplies.
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {parentCategories.map((cat) => (
            <Link
              key={cat.category_id}
              to={`/category/${cat.slug}`}
              className="
              group
            bg-white
            rounded-xl
            overflow-hidden
            shadow-sm
            transition-all
            duration-300
            hover:-translate-y-2
            hover:shadow-xl
              "
            >
              {/* Image */}
              <div className="bg-white h-36 md:h-44 flex items-center justify-center overflow-hidden p-4">
                {getImage(cat.image_url) ? (
                  <img
                    src={getImage(cat.image_url)}
                    alt={cat.category_name}
                    className="
                      w-full
                      h-full
                      object-contain
                      transition-transform
                      duration-300
                      group-hover:scale-110
                    "
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#F3F4F6]" />
                )}
              </div>

              {/* Content */}
              <div className="px-4 py-4 text-center">
                <h3
                  className="
                    text-sm
                    md:text-lg
                    font-semibold
                    text-[#1F2937]
                    leading-snug
                    line-clamp-2
                  "
                >
                  {cat.category_name}
                </h3>

                <span
                  className="
                    inline-flex
                    items-center
                    mt-4
                    text-sm
                    font-semibold
                    text-[#1F2937]
                  "
                >
                  Shop Now
                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}