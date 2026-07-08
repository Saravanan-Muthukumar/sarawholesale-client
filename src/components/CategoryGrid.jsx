import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function CategoryGrid({ categories = [] }) {
  const parentCategories = categories.filter((cat) => !cat.parent_category_id);

  const getImage = (imageUrl) => {
    if (!imageUrl) return null;

    const url = imageUrl.startsWith("http")
      ? imageUrl
      : `${API_URL}${imageUrl}`;

    return `${url}?v=${Date.now()}`;
  };

  return (
    <section className="bg-[#f3f4f6]">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#071b3a]">
            Top Categories
          </h2>

          <p className="text-sm md:text-base text-[#071b3a]/55 mt-1">
            Browse our most popular categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {parentCategories.map((cat) => (
            <Link
              key={cat.category_id}
              to={`/category/${cat.slug}`}
              className="
                group
                bg-white
                border border-[#d9e2ef]
                shadow-sm
                hover:shadow-xl
                hover:-translate-y-1
                transition-all
                duration-300
                overflow-hidden
                text-center
              "
            >
              <div className="h-32 md:h-40 w-full flex items-center justify-center bg-white overflow-hidden p-1">
                {getImage(cat.image_url) ? (
                  <img
                    src={getImage(cat.image_url)}
                    alt={cat.category_name}
                    className="
                      w-full
                      h-full
                      object-contain
                      scale-110
                      transition-transform
                      duration-300
                      group-hover:scale-115
                    "
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#f3f4f6]" />
                )}
              </div>

              <div className="px-3 py-3 md:px-4 md:py-3">
              <h3 className="text-xs md:text-[19px] font-small text-[#071b3a] leading-snug line-clamp-2">
                  {cat.category_name}
                </h3>

                <p className="mt-3 text-xs md:text-sm font-semibold text-[#071b3a]/55 group-hover:text-green-700">
                  Shop Now →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}