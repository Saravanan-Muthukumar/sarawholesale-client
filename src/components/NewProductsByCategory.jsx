import { Link } from "react-router-dom";

export default function NewProductsByCategory({ products = [], categories = [] }) {
  const latestByCategory = categories
    .map((cat) => {
      const items = products
        .filter((p) => Number(p.category_id) === Number(cat.category_id))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 4);

      return {
        category: cat,
        products: items,
      };
    })
    .filter((group) => group.products.length > 0);

  if (latestByCategory.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-3 md:px-6 py-8">
      <h2 className="text-xl md:text-2xl font-bold mb-5">
        Newly Added Products
      </h2>

      <div className="space-y-8">
        {latestByCategory.map((group) => (
          <div key={group.category.category_id}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">
                {group.category.category_name}
              </h3>

              <Link
                to={`/category/${group.category.slug}`}
                className="text-sm font-semibold text-gray-700"
              >
                View all
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {group.products.map((product) => (
                <Link
                  key={product.product_id}
                  to={`/product/${product.slug}`}
                  className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition"
                >
                  <div className="aspect-square bg-gray-100 rounded-md mb-3 overflow-hidden">
                    <img
                      src={product.main_image || product.image_url}
                      alt={product.product_name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <p className="text-xs text-gray-500 mb-1">
                    SKU: {product.sku}
                  </p>

                  <h4 className="text-sm font-semibold line-clamp-2">
                    {product.product_name}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}