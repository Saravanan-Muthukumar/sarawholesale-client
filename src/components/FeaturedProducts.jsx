import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function FeaturedProducts({ products = [] }) {
  const displayProducts = [...products]
    .sort((a, b) =>
      (a.product_name || "").localeCompare(b.product_name || "")
    )
    .slice(0, 20);

  const getCategoryLink = (product) => {
    if (product.category_slug) {
      return `/category/${product.category_slug}`;
    }

    return "/products";
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-[#071b3a]">
          Popular Products
        </h2>

        <Link
          to="/products"
          className="text-sm sm:text-base font-semibold text-green-700 hover:text-green-800"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayProducts.map((product) => {
          const imageSrc = product.image_url?.startsWith("http")
            ? product.image_url
            : `${API_URL}${product.image_url}`;

          return (
            <Link
              key={product.product_id}
              to={`/product/${product.slug}`}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition flex flex-col min-h-82"
            >
              {product.image_url ? (
                <img
                  src={imageSrc}
                  alt={product.product_name}
                  className="h-32 sm:h-36 w-full object-contain mb-3"
                />
              ) : (
                <div className="h-32 sm:h-36 w-full bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-xs text-gray-400">
                  No Image
                </div>
              )}

              <h3 className="text-sm font-semibold text-[#071b3a] leading-5 line-clamp-2 min-h-10">
                {product.product_name}
              </h3>

              <p className="text-xs text-gray-500 mt-2">
                SKU: {product.sku || "N/A"}
              </p>

              <div className="mt-auto">
                <p className="text-base sm:text-lg font-bold text-green-700 mb-3">
                  £{Number(product.selling_price || 0).toFixed(2)}
                </p>

                <div className="w-full bg-green-700 text-white text-sm font-semibold py-2 rounded-lg text-center">
                  View Category
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}