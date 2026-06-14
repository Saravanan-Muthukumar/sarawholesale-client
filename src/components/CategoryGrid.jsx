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

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
          {parentCategories.map((cat) => (
            <Link
              key={cat.category_id}
              to={`/category/${cat.slug}`}
              className="bg-white border border-[#edf1f7] rounded-xl min-h-35 md:min-h-52.5 p-2 md:p-5 flex flex-col items-center justify-center text-center hover:shadow-md transition"
            >
              {/* <div className="h-14 md:h-24 w-full flex items-center justify-center mb-2 md:mb-5"> */}
              <div className="h-16 md:h-28 w-full flex items-center justify-center mb-2 md:mb-4">
                {getImage(cat.image_url) ? (
                  <img
                    src={getImage(cat.image_url)}
                    alt={cat.category_name}
                    // className="max-h-14 md:max-h-24 max-w-full object-contain"
                    className="h-full w-full object-contain scale-125"
                  />
                ) : (
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#f3f6fb]" />
                )}
              </div>

              <h3 className="text-[11px] md:text-base font-bold text-[#071b3a] leading-tight line-clamp-2">
                {cat.category_name}
              </h3>

              <p className="mt-1 md:mt-4 text-[10px] md:text-sm font-medium text-[#071b3a]/60">
                Shop Now →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}