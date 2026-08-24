import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function NewProductListPage() {
  const { slug } = useParams();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [expandedFilters, setExpandedFilters] = useState({});
  const [sortBy, setSortBy] = useState("price-asc");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  


  
  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load categories");
        return res.json();
      })
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError("");
    setFilters({});
    setExpandedFilters({});
    setSortBy("price-asc");
    setMobileFilterOpen(false);

    fetch(`${API_URL}/api/product-main/category/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load products");
        return res.json();
      })
      .then((data) => {
        console.log("API data:", data);
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Unable to load products");
      })
      .finally(() => setLoading(false));
      // console.log("products ",products)
  }, [slug]);

  const normalise = (value) => String(value ?? "").trim();

  const getSpecs = (product) => {
    const specs = {};
    
    (product.specifications || []).forEach((spec) => {
      if (spec.spec_name && spec.spec_value) {
        specs[normalise(spec.spec_name)] = normalise(spec.spec_value);
      }
    });

    return specs;
  };

  const getLowestPrice = (product) => {
    const directPrice = Number(product.lowest_price);
    if (Number.isFinite(directPrice) && directPrice > 0) return directPrice;

    const prices = [
      ...(product.price_breaks || []).map((item) => Number(item.price)),
      ...(product.prices || []).map((item) => Number(item.price)),
      ...(product.combinations || []).flatMap((combination) => [
        Number(combination.lowest_price),
        Number(combination.selling_price),
        ...(combination.prices || []).map((item) => Number(item.price)),
      ]),
    ].filter((price) => Number.isFinite(price) && price > 0);

    if (prices.length) return Math.min(...prices);

    const fallback = Number(product.selling_price || product.price || 0);
    return Number.isFinite(fallback) ? fallback : 0;
  };

  const getImage = (product) => {
    const imageUrl =
      product.image_url ||
      product.images?.[0]?.image_url ||
      product.combinations?.[0]?.images?.[0]?.image_url ||
      "";

    if (!imageUrl) return "";
    return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  };

  const filterOptions = useMemo(() => {
    const names = new Set();

    products.forEach((product) => {
      Object.keys(getSpecs(product)).forEach((name) => names.add(name));
    });

    return [...names]
      .map((name) => {
        const values = [
          ...new Set(
            products
              .map((product) => getSpecs(product)[name])
              .filter(Boolean)
          ),
        ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        return values.length > 1 ? { name, options: values } : null;
      })
      .filter(Boolean);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const specs = getSpecs(product);

      return Object.entries(filters).every(([name, selectedValues]) => {
        if (!selectedValues?.length) return true;
        return selectedValues.includes(specs[name]);
      });
    });
  }, [products, filters]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];

    if (sortBy === "price-asc") {
      return list.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
    }

    if (sortBy === "price-desc") {
      return list.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
    }

    if (sortBy === "name-desc") {
      return list.sort((a, b) =>
        String(b.product_name || "").localeCompare(String(a.product_name || ""))
      );
    }

    return list.sort((a, b) =>
      String(a.product_name || "").localeCompare(String(b.product_name || ""))
    );
  }, [filteredProducts, sortBy]);

  const currentCategory = categories.find((category) => category.slug === slug);
  const parentCategory = currentCategory?.parent_category_id
    ? categories.find(
        (category) =>
          Number(category.category_id) === Number(currentCategory.parent_category_id)
      )
    : null;

  const subCategories = categories.filter(
    (category) =>
      Number(category.parent_category_id) ===
      Number(parentCategory?.category_id || currentCategory?.category_id)
  );

  const appliedFilterCount = Object.values(filters).reduce(
    (total, values) => total + (Array.isArray(values) ? values.length : 0),
    0
  );

  const toggleFilter = (name, value) => {
    setFilters((current) => {
      const selected = current[name] || [];
      const next = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];

      return { ...current, [name]: next };
    });
  };

  const FilterBox = () => (
    <div className="border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900">Filters</h2>
          <p className="mt-1 text-xs text-gray-500">{appliedFilterCount} applied</p>
        </div>

        {appliedFilterCount > 0 && (
          <button
            type="button"
            onClick={() => setFilters({})}
            className="text-sm font-semibold text-red-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">
        {filterOptions.map((spec) => {
          const open = expandedFilters[spec.name] ?? true;
          const selected = filters[spec.name] || [];

          return (
            <div key={spec.name} className="border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() =>
                  setExpandedFilters((current) => ({
                    ...current,
                    [spec.name]: !open,
                  }))
                }
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-sm font-bold text-gray-800">{spec.name}</span>
                {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
              </button>

              {open && (
                <div className="mt-3 space-y-2">
                  {spec.options.map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(option)}
                        onChange={() => toggleFilter(spec.name, option)}
                        className="h-4 w-4 accent-gray-900"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-100">
      <section className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="hidden items-center gap-2 text-sm font-semibold text-gray-600 md:flex">
          <Link to="/" className="hover:text-red-700">Home</Link>
          {parentCategory && (
            <>
              <span>›</span>
              <Link to={`/category/${parentCategory.slug}`} className="hover:text-red-700">
                {parentCategory.category_name}
              </Link>
            </>
          )}
          <span>›</span>
          <span className="text-gray-900">
            {currentCategory?.category_name || "Products"}
          </span>
        </div>

        <div className="mb-4 flex items-center justify-between md:hidden">
          <Link
            to={parentCategory ? `/category/${parentCategory.slug}` : "/"}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600"
          >
            <ArrowLeft size={16} />
            {parentCategory?.category_name || "Categories"}
          </Link>

          {filterOptions.length > 0 && (
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="inline-flex items-center gap-2 border border-gray-300 bg-white px-3 py-2 text-sm font-bold"
            >
              <SlidersHorizontal size={16} /> Filter
            </button>
          )}
        </div>

        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 lg:hidden">
            <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Filter products</h2>
                <button type="button" onClick={() => setMobileFilterOpen(false)}>
                  <X size={22} />
                </button>
              </div>
              <FilterBox />
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="mt-4 w-full bg-black py-3 font-bold text-white"
              >
                Show products
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="hidden space-y-4 lg:block">
            {filterOptions.length > 0 && <FilterBox />}

            {subCategories.length > 0 && (
              <div className="border border-gray-200 bg-white p-4">
                <h2 className="mb-3 font-bold text-gray-900">Subcategories</h2>
                {subCategories.map((category) => (
                  <Link
                    key={category.category_id}
                    to={`/subcategory/${category.slug}`}
                    className={`block border-t border-gray-200 py-2 text-sm ${
                      category.slug === slug
                        ? "font-bold text-red-700"
                        : "text-gray-700 hover:text-red-700"
                    }`}
                  >
                    {category.category_name}
                  </Link>
                ))}
              </div>
            )}
          </aside>

          <section className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {currentCategory?.category_name || "Products"}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {filteredProducts.length} products
                </p>
              </div>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="border border-gray-300 bg-white px-3 py-2 text-sm font-semibold outline-none"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>

            {loading && (
              <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
                Loading products...
              </div>
            )}

            {!loading && error && (
              <div className="border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && sortedProducts.length === 0 && (
              <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
                No products found.
              </div>
            )}

            {!loading && !error && sortedProducts.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedProducts.map((product) => {
                  const image = getImage(product);
                  const lowestPrice = getLowestPrice(product);

                  return (
                    <Link
                      key={product.product_id}
                      to={`/newproduct/${product.slug}`}
                      className="group border border-gray-200 bg-white p-3 transition hover:shadow-md md:p-4"
                    >
                      <div className="flex h-40 items-center justify-center bg-white md:h-52">
                        {image ? (
                          <img
                            src={image}
                            alt={product.product_name}
                            className="max-h-full max-w-full object-contain transition group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-100" />
                        )}
                      </div>

                      <h2 className="mt-3 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-gray-900">
                      <Link to={`/newproduct/${product.slug}`}>
                        {product.product_name}
                      </Link>
                      </h2>

                      {product.brand && (
                        <p className="mt-1 text-xs text-gray-500">{product.brand}</p>
                      )}

                      <div className="mt-3">
                        {lowestPrice > 0 ? (
                          <>
                            <p className="text-xs font-semibold text-gray-500">From</p>
                            <p className="text-xl font-extrabold text-gray-900">
                              £{lowestPrice.toFixed(2)}
                            </p>
                            <p className="text-[11px] text-gray-500">Exc. VAT</p>
                          </>
                        ) : (
                          <p className="text-sm font-semibold text-gray-500">
                            Price unavailable
                          </p>
                        )}
                      </div>

                      <span className="mt-4 block w-full bg-black px-3 py-2 text-center text-sm font-bold text-white group-hover:bg-gray-800">
                        View product
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}