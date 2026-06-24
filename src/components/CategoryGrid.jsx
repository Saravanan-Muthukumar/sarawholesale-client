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
    <section className="bg-[#f3f4f6]">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-extrabold text-blue-800">
              Shop by Category
            </h2>

            <p className="text-sm text-[#071b3a]/55 mt-1">
              Browse our most popular categories
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {parentCategories.map((cat) => (
            <Link
              key={cat.category_id}
              to={`/category/${cat.slug}`}
              className="
                bg-white
                border border-[#d9e2ef]
                shadow-sm
                hover:shadow-md
                hover:border-green-500
                transition
                min-h-35
                md:min-h-55
                p-3
                md:p-4
                flex
                flex-col
                items-center
                justify-center
                text-center
              "
            >
              <div className="h-16 md:h-28 w-full flex items-center justify-center mb-3">
                {getImage(cat.image_url) ? (
                  <img
                    src={getImage(cat.image_url)}
                    alt={cat.category_name}
                    className="h-full w-full object-contain scale-110"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#f3f4f6]" />
                )}
              </div>

              <h3 className="text-[11px] md:text-base font-extrabold text-blue-800 leading-tight line-clamp-2 uppercase">
                {cat.category_name}
              </h3>

              <p className="mt-2 text-[10px] md:text-xs font-semibold text-[#071b3a]/50">
                Shop Now →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}