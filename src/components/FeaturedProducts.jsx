import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function FeaturedProducts({ products = [] }) {
  const displayProducts = [...products]
    .sort((a, b) =>
      (a.product_name || "").localeCompare(b.product_name || "")
    )
    .slice(0, 20);

  const getLowestPrice = (product) => {
    if (!product.price_breaks?.length) return "0.00";

    return Math.min(
      ...product.price_breaks.map((p) => Number(p.price || 0))
    ).toFixed(2);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-[#071b3a]">
          Popular Products
        </h2>

        <Link
          to="/products"
          className="text-sm font-semibold text-green-700 hover:text-green-800"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
        {displayProducts.map((product) => {
          const imageSrc = product.image_url?.startsWith("http")
            ? product.image_url
            : `${API_URL}${product.image_url}`;

          return (
            <Link
              key={product.product_id}
              to={`/product/${product.slug}`}
              className="bg-white rounded-xl border border-gray-200 p-2 md:p-4 shadow-sm hover:shadow-md transition flex flex-col min-h-[190px] md:min-h-[320px]"
            >
              {product.image_url ? (
                <img
                  src={imageSrc}
                  alt={product.product_name}
                  className="h-20 md:h-36 w-full object-contain mb-2"
                />
              ) : (
                <div className="h-20 md:h-36 w-full bg-gray-100 rounded-lg mb-2 flex items-center justify-center text-xs text-gray-400">
                  No Image
                </div>
              )}

              <h3 className="text-[11px] md:text-sm font-semibold text-[#071b3a] leading-4 md:leading-5 line-clamp-2 min-h-8 md:min-h-10">
                {product.product_name}
              </h3>

              <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                SKU: {product.sku || "N/A"}
              </p>

              <div className="mt-auto pt-2">
                <p className="text-[11px] md:text-base font-semibold text-green-700">
                  From £{getLowestPrice(product)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}