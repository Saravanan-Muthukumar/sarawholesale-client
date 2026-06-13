import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function CategoryGrid({ categories = [] }) {
  const parentCategories = categories.filter((cat) => !cat.parent_category_id);

  const getImage = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  };

  return (
    <section className="bg-[#fbfcfe]">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#071b3a]">
            Shop by Category
          </h2>
          <p className="text-sm text-[#071b3a]/55 mt-2">
            Browse our most popular categories
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {parentCategories.map((cat) => (
            <Link
              key={cat.category_id}
              to={`/category/${cat.slug}`}
              className="bg-white border border-[#edf1f7] rounded-2xl min-h-[210px] p-5 flex flex-col items-center justify-center text-center hover:shadow-md transition"
            >
              <div className="h-24 w-full flex items-center justify-center mb-5">
                {getImage(cat.image_url) ? (
                  <img
                    src={getImage(cat.image_url)}
                    alt={cat.category_name}
                    className="max-h-24 max-w-full object-contain"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#f3f6fb]" />
                )}
              </div>

              <h3 className="text-base font-bold text-[#071b3a] leading-tight line-clamp-2">
                {cat.category_name}
              </h3>

              <p className="mt-4 text-sm font-medium text-[#071b3a]/60">
                Shop Now →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}