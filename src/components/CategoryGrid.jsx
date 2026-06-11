import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function CategoryGrid({ categories = [] }) {
  const getImage = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  };

  return (
    <section className="bg-[#fbfcfe] border-t border-[#edf1f7]">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-2xl font-bold text-[#071b3a]">
            Shop by Category
          </h2>
          <p className="text-xs sm:text-sm text-[#071b3a]/55 mt-1">
            Browse our most popular categories
          </p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
          {categories.map((category) => (
            <Link
              key={category.category_id}
              to={`/category/${category.slug}`}
              className="group bg-white border border-[#e8eef6] rounded-lg sm:rounded-xl p-2 sm:p-5 text-center hover:shadow-md hover:border-[#dce5f2] transition"
            >
              <div className="w-full h-14 sm:h-32 flex items-center justify-center mb-2 sm:mb-4">
                {getImage(category.image_url) ? (
                  <img
                    src={getImage(category.image_url)}
                    alt={category.category_name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#f4f7fb]" />
                )}
              </div>

              <h3 className="text-[10px] sm:text-base font-bold text-[#071b3a] leading-tight line-clamp-2 min-h-7 sm:min-h-0">
                {category.category_name}
              </h3>

              <p className="text-[10px] sm:text-sm font-medium text-[#071b3a]/70 mt-1 sm:mt-3">
                Shop Now →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}