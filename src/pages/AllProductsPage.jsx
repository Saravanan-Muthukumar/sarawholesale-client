import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Filter,
  Grid2X2,
  List,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import ProductGridCard from "../components/ProductGridCard";
import ProductListCard from "../components/ProductListCard";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function AllProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState("relevance");

  const [viewMode, setViewMode] = useState("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsResponse, categoriesResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/products`),
            fetch(`${API_URL}/api/categories`),
          ]);

        if (!productsResponse.ok) {
          throw new Error("Unable to load products.");
        }

        if (!categoriesResponse.ok) {
          throw new Error("Unable to load categories.");
        }

        const productsData = await productsResponse.json();
        const categoriesData = await categoriesResponse.json();

        setProducts(
          Array.isArray(productsData)
            ? productsData
            : productsData.products || []
        );

        setCategories(
          Array.isArray(categoriesData)
            ? categoriesData
            : categoriesData.categories || []
        );
      } catch (err) {
        setError(err.message || "Unable to load products.");
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  const visibleCategories = useMemo(() => {
    return categories.filter((category) => {
      const categoryId = Number(category.category_id);

      return products.some(
        (product) => Number(product.category_id) === categoryId
      );
    });
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const cleanSearch = search.trim().toLowerCase();

    if (cleanSearch) {
      result = result.filter((product) => {
        const searchableText = [
          product.product_name,
          product.sku,
          product.brand,
          product.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(cleanSearch);
      });
    }

    if (selectedCategories.length > 0) {
      result = result.filter((product) =>
        selectedCategories.includes(Number(product.category_id))
      );
    }

    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price || a.lowest_price || 0) -
          Number(b.price || b.lowest_price || 0)
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price || b.lowest_price || 0) -
          Number(a.price || a.lowest_price || 0)
      );
    }

    if (sortBy === "name-asc") {
      result.sort((a, b) =>
        String(a.product_name || "").localeCompare(
          String(b.product_name || "")
        )
      );
    }

    if (sortBy === "name-desc") {
      result.sort((a, b) =>
        String(b.product_name || "").localeCompare(
          String(a.product_name || "")
        )
      );
    }

    return result;
  }, [products, search, selectedCategories, sortBy]);

  const toggleCategory = (categoryId) => {
    const numericId = Number(categoryId);

    setSelectedCategories((current) => {
      if (current.includes(numericId)) {
        return current.filter((id) => id !== numericId);
      }

      return [...current, numericId];
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSortBy("relevance");
  };

  const activeFilterCount = selectedCategories.length;

  const FilterContent = () => (
    <div>
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} />
          <h2 className="text-base font-bold text-black">
            Filter products
          </h2>
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-semibold text-gray-600 hover:text-black"
          >
            Clear
          </button>
        )}
      </div>

      <div className="py-5">
        <h3 className="mb-3 text-sm font-bold text-black">
          Categories
        </h3>

        <div className="space-y-3">
          {visibleCategories.map((category) => {
            const categoryId = Number(category.category_id);
            const checked =
              selectedCategories.includes(categoryId);

            const productCount = products.filter(
              (product) =>
                Number(product.category_id) === categoryId
            ).length;

            return (
              <label
                key={categoryId}
                className="flex cursor-pointer items-center justify-between gap-3"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(categoryId)}
                    className="h-4 w-4 accent-black"
                  />

                  <span className="truncate text-sm text-gray-800">
                    {category.category_name}
                  </span>
                </span>

                <span className="text-xs text-gray-500">
                  {productCount}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="mb-2 text-sm text-gray-500">
            Home / Products
          </p>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-extrabold text-black sm:text-3xl">
              All Products
            </h1>

            <p className="max-w-2xl text-sm leading-6 text-gray-600">
              Browse packing tape, aluminium tape, scrim tape and
              other trade supplies in one place.
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search all products"
              className="h-12 w-full border border-gray-300 bg-white pl-11 pr-4 text-sm text-black outline-none transition focus:border-black"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="relative flex h-11 flex-1 items-center justify-center gap-2 border border-gray-300 bg-white px-4 text-sm font-bold text-black lg:hidden"
            >
              <Filter size={18} />
              Filters

              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="relative flex-1 sm:min-w-[190px]">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="h-11 w-full appearance-none border border-gray-300 bg-white px-4 pr-10 text-sm font-semibold text-black outline-none focus:border-black"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="price-low">
                  Price: Low to high
                </option>
                <option value="price-high">
                  Price: High to low
                </option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>

            <div className="hidden items-center border border-gray-300 md:flex">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex h-11 w-11 items-center justify-center ${
                  viewMode === "grid"
                    ? "bg-black text-white"
                    : "bg-white text-gray-600 hover:text-black"
                }`}
                aria-label="Grid view"
              >
                <Grid2X2 size={18} />
              </button>

              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex h-11 w-11 items-center justify-center ${
                  viewMode === "list"
                    ? "bg-black text-white"
                    : "bg-white text-gray-600 hover:text-black"
                }`}
                aria-label="List view"
              >
                <List size={19} />
              </button>
            </div>
          </div>
        </div>

        {selectedCategories.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {selectedCategories.map((categoryId) => {
              const category = categories.find(
                (item) =>
                  Number(item.category_id) === categoryId
              );

              if (!category) return null;

              return (
                <button
                  key={categoryId}
                  type="button"
                  onClick={() => toggleCategory(categoryId)}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-2 text-xs font-semibold text-black hover:bg-gray-200"
                >
                  {category.category_name}
                  <X size={14} />
                </button>
              );
            })}

            <button
              type="button"
              onClick={clearFilters}
              className="px-2 py-2 text-xs font-bold text-gray-600 hover:text-black"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 border border-gray-200 bg-white p-5">
              <FilterContent />
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-bold text-black">
                  {filteredProducts.length}
                </span>{" "}
                products
              </p>
            </div>

            {loading && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[340px] animate-pulse bg-gray-100"
                  />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="border border-gray-300 p-6 text-sm text-black">
                {error}
              </div>
            )}

            {!loading &&
              !error &&
              filteredProducts.length === 0 && (
                <div className="border border-gray-200 px-5 py-16 text-center">
                  <h2 className="text-lg font-bold text-black">
                    No products found
                  </h2>

                  <p className="mt-2 text-sm text-gray-600">
                    Try changing the search or category filters.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 bg-black px-5 py-3 text-sm font-bold text-white hover:bg-gray-800"
                  >
                    Clear filters
                  </button>
                </div>
              )}

            {!loading &&
              !error &&
              filteredProducts.length > 0 &&
              viewMode === "grid" && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductGridCard
                      key={product.product_id}
                      product={product}
                    />
                  ))}
                </div>
              )}

            {!loading &&
              !error &&
              filteredProducts.length > 0 &&
              viewMode === "list" && (
                <div className="hidden space-y-4 md:block">
                  {filteredProducts.map((product) => (
                    <ProductListCard
                      key={product.product_id}
                      product={product}
                    />
                  ))}
                </div>
              )}

            {!loading &&
              !error &&
              filteredProducts.length > 0 &&
              viewMode === "list" && (
                <div className="grid grid-cols-2 gap-3 md:hidden">
                  {filteredProducts.map((product) => (
                    <ProductGridCard
                      key={product.product_id}
                      product={product}
                    />
                  ))}
                </div>
              )}
          </main>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-white">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4">
              <h2 className="text-lg font-bold text-black">
                Filters
              </h2>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-10 w-10 items-center justify-center bg-gray-100 text-black"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-4 py-5">
              <FilterContent />
            </div>

            <div className="sticky bottom-0 grid grid-cols-2 gap-3 border-t border-gray-200 bg-white p-4">
              <button
                type="button"
                onClick={clearFilters}
                className="h-12 border border-gray-300 bg-white text-sm font-bold text-black"
              >
                Clear all
              </button>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="h-12 bg-black text-sm font-bold text-white"
              >
                Show {filteredProducts.length} products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

