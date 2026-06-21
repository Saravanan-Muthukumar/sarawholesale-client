import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function FeaturedProducts({ products = [] }) {
  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };
  
  const displayProducts = Object.values(
    products.reduce((acc, product) => {
      const categoryKey = product.category_id || product.category_name;
  
      if (!acc[categoryKey]) {
        acc[categoryKey] = [];
      }
  
      acc[categoryKey].push(product);
      return acc;
    }, {})
  )
    .map((categoryProducts) => shuffleArray(categoryProducts)[0])
    .filter(Boolean);
  
  const shuffledDisplayProducts = shuffleArray(displayProducts).slice(0, 15);

  const getLowestPrice = (product) => {
    if (!product.price_breaks?.length) return "0.00";

    return Math.min(
      ...product.price_breaks.map((p) => Number(p.price || 0))
    ).toFixed(2);
  };

  return (
    <section className="bg-[#f3f4f6] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-blue-800">
            Popular Products
          </h2>

          {/* <Link
            to="/products"
            className="text-sm font-bold text-green-700 hover:text-green-800"
          >
            View All →
          </Link> */}
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {shuffledDisplayProducts.map((product) => {
            const imageSrc = product.image_url?.startsWith("http")
              ? product.image_url
              : `${API_URL}${product.image_url}`;

            return (
              <Link
                key={product.product_id}
                to={`/product/${product.slug}`}
                className="bg-white border border-[#d9e2ef] shadow-sm hover:border-green-500 hover:shadow-md transition p-3 md:p-4 flex flex-col min-h-55 md:min-h-80"
              >
                {product.image_url ? (
                  <img
                    src={imageSrc}
                    alt={product.product_name}
                    className="h-24 md:h-40 w-full object-contain mb-3"
                  />
                ) : (
                  <div className="h-24 md:h-40 w-full bg-gray-100 mb-3 flex items-center justify-center text-xs text-gray-400">
                    No Image
                  </div>
                )}

                <h3 className="text-[11px] md:text-sm font-extrabold text-blue-800 leading-tight line-clamp-2 uppercase min-h-8.5 md:min-h-10.5">
                  {product.product_name}
                </h3>

                <p className="text-[10px] md:text-xs text-[#071b3a]/45 mt-2">
                  SKU: {product.sku || "N/A"}
                </p>

                <div className="mt-auto pt-3">
                  <p className="text-lg md:text-2xl font-extrabold text-[#071b3a]">
                    £{getLowestPrice(product)}
                  </p>

                  <p className="text-[10px] md:text-[11px] text-[#071b3a]/45 mt-1 line-clamp-1">
                    {product.category_name}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}