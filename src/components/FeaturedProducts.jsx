import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/product-main`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load products");
        }

        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Load featured products error:", err);
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const featuredProducts = useMemo(() => {
    return [...products]
      .filter(
        (product) =>
          Number(product.is_active) === 1 &&
          Number(product.lowest_price) > 0
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 18);
  }, [products]);
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";

    return imageUrl.startsWith("http")
      ? imageUrl
      : `${API_URL}${imageUrl}`;
  };

  if (loading) {
    return (
      <section className="bg-[#f3f4f6] py-8 sm:py-12">
        <div className="max-w-[1570px] mx-auto px-4 sm:px-6">
          <p className="text-sm text-gray-500">
            Loading popular products...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#f3f4f6] py-8 sm:py-12">
        <div className="max-w-[1570px] mx-auto px-4 sm:px-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  if (!featuredProducts.length) {
    return null;
  }

  return (
    <section className="bg-[#f3f4f6] py-8 sm:py-12">
      <div className="max-w-[1570px] mx-auto px-4 sm:px-6">
        <h2 className="mb-5 text-xl font-bold text-gray-700 sm:text-2xl">
          Popular Products
        </h2>

        <div className="grid grid-cols-3 gap-3 md:gap-4 lg:grid-cols-6">
          {featuredProducts.map((product) => {
            const imageSrc = getImageUrl(product.image_url);
            const lowestPrice = Number(product.lowest_price || 0);

            return (
              <Link
                key={product.product_id}
                to={`/newproduct/${product.slug}`}
                className="flex min-h-55 flex-col border border-[#d9e2ef] bg-white p-3 shadow-sm transition hover:shadow-md md:min-h-80 md:p-4"
              >
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={product.product_name}
                    className="mb-3 h-24 w-full object-contain md:h-40"
                  />
                ) : (
                  <div className="mb-3 flex h-24 w-full items-center justify-center bg-gray-100 text-xs text-gray-400 md:h-40">
                    No Image
                  </div>
                )}

                <h3 className="line-clamp-3 min-h-8.5 text-[11px] font-bold leading-tight text-gray-700 md:min-h-10.5 md:text-sm">
                  {product.product_name}
                </h3>

                {product.brand && (
                  <p className="mt-2 line-clamp-1 text-[10px] text-[#071b3a]/45 md:text-xs">
                    {product.brand}
                  </p>
                )}

                <div className="mt-auto pt-3">
                  <p className="text-[10px] text-[#071b3a]/45 md:text-xs">
                    From
                  </p>

                  <p className="text-lg font-bold text-[#071b3a] md:text-2xl">
                    £{lowestPrice.toFixed(2)}
                  </p>

                  <p className="mt-1 line-clamp-1 text-[10px] text-[#071b3a]/45 md:text-[11px]">
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