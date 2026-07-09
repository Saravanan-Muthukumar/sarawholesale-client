import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  SlidersHorizontal,
  X,
  Grid2X2,
  List,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function ProductListPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const categoryScrollRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [qty, setQty] = useState({});
  const [addedProduct, setAddedProduct] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [expandedFilters, setExpandedFilters] = useState({});
  const [sortBy, setSortBy] = useState("price-asc");
  const [viewMode, setViewMode] = useState("list");

  const appliedFilterCount = Object.values(filters).reduce((total, values) => {
    if (!Array.isArray(values)) return total;
    return total + values.length;
  }, 0);

  const hasActiveFilters = appliedFilterCount > 0;

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setFilters({});
    setExpandedFilters({});
    setMobileFilterOpen(false);
    setSortBy("price-asc");

    fetch(`${API_URL}/api/products/category/${slug}`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [slug]);

  const normalise = (value) => String(value || "").trim();

  const uniqueSorted = (items) =>
    [...new Set(items.filter(Boolean))].sort((a, b) =>
      String(a).localeCompare(String(b), undefined, { numeric: true })
    );

  const getProductSpecsObject = (product) => {
    const specs = {};

    if (Array.isArray(product.specifications)) {
      product.specifications.forEach((spec) => {
        if (spec.spec_name && spec.spec_value) {
          specs[String(spec.spec_name).trim()] = String(spec.spec_value).trim();
        }
      });
    }

    return specs;
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const specs = getProductSpecsObject(product);
  
      return Object.entries(filters).every(([filterName, selectedValues]) => {
        if (!Array.isArray(selectedValues) || selectedValues.length === 0) {
          return true;
        }
  
        return selectedValues.includes(normalise(specs[filterName]));
      });
    });
  }, [products, filters]);

  const getLowestPrice = (product) => {
    if (!Array.isArray(product.price_breaks) || product.price_breaks.length === 0) {
      return 0;
    }

    return Math.min(...product.price_breaks.map((tier) => Number(tier.price || 0)));
  };

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];

    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));

      case "price-desc":
        return list.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));

      case "name-asc":
        return list.sort((a, b) =>
          String(a.product_name || "").localeCompare(String(b.product_name || ""))
        );

      case "name-desc":
        return list.sort((a, b) =>
          String(b.product_name || "").localeCompare(String(a.product_name || ""))
        );

      default:
        return list;
    }
  }, [filteredProducts, sortBy]);

const getOptionQty = (specName, option) => {
  return products.filter((product) => {
    const specs = getProductSpecsObject(product);

    if (normalise(specs[specName]) !== normalise(option)) {
      return false;
    }

    return Object.entries(filters).every(([filterName, selectedValues]) => {
      if (!Array.isArray(selectedValues) || selectedValues.length === 0) {
        return true;
      }

      if (filterName === specName) {
        return true;
      }

      return selectedValues.includes(normalise(specs[filterName]));
    });
  }).length;
};

  const filterOptions = useMemo(() => {
    const allSpecNames = new Set();

    products.forEach((product) => {
      if (!Array.isArray(product.specifications)) return;

      product.specifications.forEach((spec) => {
        const specName = normalise(spec.spec_name);
        if (specName) allSpecNames.add(specName);
      });
    });

    const specs = [...allSpecNames]
      .map((currentSpecName) => {
        const matchingProducts = products.filter((product) => {
          const productSpecs = getProductSpecsObject(product);

          return Object.entries(filters).every(([filterName, selectedValues]) => {
            if (!Array.isArray(selectedValues) || selectedValues.length === 0) {
              return true;
            }

            if (filterName === currentSpecName) return true;

            return selectedValues.includes(normalise(productSpecs[filterName]));
          });
        });

        const values = new Set();

        matchingProducts.forEach((product) => {
          const productSpecs = getProductSpecsObject(product);
          const value = normalise(productSpecs[currentSpecName]);

          if (value) values.add(value);
        });

        const uniqueValues = uniqueSorted([...values]);

        if (uniqueValues.length <= 1) return null;

        return {
          name: currentSpecName,
          options: uniqueValues,
        };
      })
      .filter(Boolean);

    return { specs };
  }, [products, filters]);

  const hasFilterOptions = filterOptions.specs.length > 0;

  const clearFilters = () => {
    setFilters({});
  };

  const toggleFilterOption = (specName, option) => {
    setFilters((prev) => {
      const currentValues = Array.isArray(prev[specName]) ? prev[specName] : [];

      const nextValues = currentValues.includes(option)
        ? currentValues.filter((value) => value !== option)
        : [...currentValues, option];

      return {
        ...prev,
        [specName]: nextValues,
      };
    });
  };

  const toggleFilterGroup = (specName) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [specName]: !prev[specName],
    }));
  };

  const currentCategory = categories.find((cat) => cat.slug === slug);

  const parentCategory = currentCategory?.parent_category_id
    ? categories.find(
        (cat) => cat.category_id === currentCategory.parent_category_id
      )
    : null;

  const sideSubCategories = categories.filter(
    (cat) =>
      cat.parent_category_id ===
      (parentCategory?.category_id || currentCategory?.category_id)
  );

  const relatedCategories = sideSubCategories.filter(
    (cat) => cat.category_id !== currentCategory?.category_id
  );

  const getImage = (imageUrl) => {
    if (!imageUrl) return "";
    return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  };

  const scrollCategories = (direction) => {
    categoryScrollRef.current?.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  const updateQty = (productId, value) => {
    if (value === "") {
      setQty((prev) => ({ ...prev, [productId]: "" }));
      return;
    }

    setQty((prev) => ({
      ...prev,
      [productId]: Math.max(0, Number(value) || 0),
    }));
  };

  const setQtyFromSlab = (productId, minQty) => {
    setQty((prev) => ({
      ...prev,
      [productId]: Number(minQty),
    }));
  };

  const getActiveTier = (product) => {
    const enteredQty = Number(qty[product.product_id] || 1);

    if (!enteredQty || !product.price_breaks?.length) return null;

    const sortedTiers = [...product.price_breaks].sort(
      (a, b) => Number(a.min_qty) - Number(b.min_qty)
    );

    return (
      sortedTiers.find((tier) => {
        const min = Number(tier.min_qty);
        const max =
          tier.max_qty === null ||
          tier.max_qty === undefined ||
          tier.max_qty === ""
            ? Infinity
            : Number(tier.max_qty);

        return enteredQty >= min && enteredQty <= max;
      }) || sortedTiers[sortedTiers.length - 1]
    );
  };

  const handleAddToCart = async (product, quantity) => {
    const enteredQty = Number(quantity || 1);
    const activeTier = getActiveTier(product);

    try {
      await addToCart({
        product_id: product.product_id,
        product_name: product.product_name,
        sku: product.sku,
        image_url: product.image_url,
        quantity: enteredQty,
        unit_price: activeTier ? Number(activeTier.price) : 0,
        price: activeTier ? Number(activeTier.price) : 0,
      });

      setAddedProduct(product.product_name);
      setTimeout(() => setAddedProduct(""), 2000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to add to cart");
      setTimeout(() => setErrorMessage(""), 2500);
    }
  };

  const getSpecValue = (product, name) => {
    const spec = product.specifications?.find(
      (item) =>
        String(item.spec_name || "").trim().toLowerCase() ===
        String(name || "").trim().toLowerCase()
    );

    return spec?.spec_value || "";
  };

  // const ProductTradeRow = ({ product }) => {
  //   const activeTier = getActiveTier(product);
  //   const productQty = qty[product.product_id] ?? 1;

  //   const brand = product.brand || "";
  //   const size = getSpecValue(product, "Size") || product.size || "";
  //   const colour =
  //     getSpecValue(product, "Colour") || getSpecValue(product, "Color") || "";
  //     const unitValue = getSpecValue(product, "Unit");

  //     const unit =
  // unitValue?.toLowerCase() === "roll"
  //   ? "rolls"
  //   : unitValue?.toLowerCase() === "box"
  //   ? "boxes"
  //   : unitValue?.toLowerCase() === "pack"
  //   ? "packs"
  //   : unitValue?.toLowerCase() === "sheet"
  //   ? "sheets"
  //   : unitValue?.toLowerCase() === "pair"
  //   ? "pairs"
  //   : unitValue?.toLowerCase() === "piece"
  //   ? "pieces"
  //   : unitValue?.toLowerCase() === "unit"
  //   ? "units"
  //   : unitValue?.toLowerCase() === "packet"
  //   ? "packets"
  //   : unitValue?.toLowerCase() || "";

  //   return (
  //     <div className="bg-white border border-gray-300 px-3 py-2 flex items-center gap-3">
  //       <Link
  //         to={`/product/${product.slug}`}
  //         className="w-16 h-16 bg-white-50 border border-gray-200 flex items-center justify-center shrink-0"
  //       >
  //         {product.image_url && (
  //           <img
  //             src={getImage(product.image_url)}
  //             alt={product.product_name}
  //             className="max-w-full max-h-full object-contain"
  //           />
  //         )}
  //       </Link>

  //       <div className="min-w-0 flex-1">
  //         <Link
  //           to={`/product/${product.slug}`}
  //           className="font-semibold text-sm leading-5 text-gray-900 hover:text-blue-700 line-clamp-2 min-h-[2.5rem]"
  //         >
  //           {product.product_name}
  //         </Link>

  //         <p className="text-xs text-gray-500 mt-1 line-clamp-1">
  //           {[brand, size, colour, unit, "In Stock"].filter(Boolean).join(" • ")}
  //         </p>
  //       </div>

  //       <div className="hidden lg:flex items-center gap-2">
  //         {product.price_breaks?.map((tier) => (
  //           <button
  //             key={`${tier.min_qty}-${tier.max_qty}`}
  //             type="button"
  //             onClick={() => setQtyFromSlab(product.product_id, tier.min_qty)}
  //             className={`text-xs border px-2 py-1 font-semibold whitespace-nowrap ${
  //               activeTier?.min_qty === tier.min_qty
  //                 ? "bg-gray-400 text-gray-900 border-gray-600"
  //                 : "bg-white text-gray-900 border-gray-300"
  //             }`}
  //           >
  //             <p>
  //               {tier.max_qty
  //                 ? `${tier.min_qty}-${tier.max_qty}`
  //                 : `${tier.min_qty}+`}
  //               {unit && ` ${unit}`}
  //             </p>
  //             <p>£{Number(tier.price).toFixed(2)}</p>
  //           </button>
  //         ))}
  //       </div>

  //       <div className="hidden md:block w-20 text-right">
  //         <p className="font-bold text-gray-900">
  //           £{Number(activeTier?.price || 0).toFixed(2)}
  //         </p>
  //         <p className="text-[11px] text-gray-500">ex VAT</p>
  //       </div>

  //       <input
  //         type="number"
  //         min="1"
  //         value={productQty}
  //         onChange={(e) => updateQty(product.product_id, e.target.value)}
  //         className="w-16 border border-gray-300 px-2 py-2 text-center font-semibold"
  //       />

  //       <button
  //         type="button"
  //         onClick={() => handleAddToCart(product, productQty)}
  //         className="bg-green-700 text-white px-4 py-2 font-bold text-sm hover:bg-green-800"
  //       >
  //         Add
  //       </button>
  //     </div>
  //   );
  // };

  const ProductTradeRow = ({ product }) => {
    const activeTier = getActiveTier(product);
    const productQty = qty[product.product_id] ?? 1;
  
    const unitValue = getSpecValue(product, "Unit");
    const unitLabel = unitValue ? `Price per ${unitValue.toLowerCase()}` : "Price";
  
    return (
      <div className="bg-white border border-gray-300 overflow-hidden md:px-3 md:py-2 md:flex md:items-center md:gap-3">
        <div className="md:hidden p-2">
  <div className="grid grid-cols-[70px_1fr] gap-2">
    <Link
      to={`/product/${product.slug}`}
      className="h-20 bg-gray-50 border border-gray-200 flex items-center justify-center"
    >
      {product.image_url && (
        <img
          src={getImage(product.image_url)}
          alt={product.product_name}
          className="max-w-full max-h-full object-contain"
        />
      )}
    </Link>

    <div>
      <Link
        to={`/product/${product.slug}`}
        className="block text-[12px] font-semibold leading-4 text-gray-900 line-clamp-1 mb-2"
      >
        {product.product_name}
      </Link>

      <div
        className="grid text-center text-[11px] border border-gray-300"
        style={{
          gridTemplateColumns: `repeat(${product.price_breaks?.length || 1}, minmax(0, 1fr))`,
        }}
      >
        {product.price_breaks?.map((tier) => (
          <div
            key={`qty-${tier.min_qty}-${tier.max_qty}`}
            className="border-b border-r last:border-r-0 border-gray-300 py-1"
          >
            {tier.max_qty
              ? `${Number(tier.min_qty)}-${Number(tier.max_qty)}`
              : `${Number(tier.min_qty)}+`}
          </div>
        ))}

        {product.price_breaks?.map((tier) => (
          <button
            key={`price-${tier.min_qty}-${tier.max_qty}`}
            type="button"
            onClick={() => setQtyFromSlab(product.product_id, tier.min_qty)}
            className="border-r last:border-r-0 border-gray-300 py-1 font-semibold"
          >
            £{Number(tier.price).toFixed(2)}
          </button>
        ))}
      </div>
    </div>
  </div>

  <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-2">
    <span className="text-xs font-semibold whitespace-nowrap">
      Price per {unitValue  ? `${unitValue} £${Number(activeTier?.price || 0).toFixed(2)}` : `Price £${Number(activeTier?.price || 0).toFixed(2)}`}
    </span>

    <div className="ml-auto flex items-center border border-gray-300 rounded overflow-hidden">
      <button
        type="button"
        onClick={() =>
          updateQty(product.product_id, Math.max(1, Number(productQty || 1) - 1))
        }
        className="w-10 h-10 flex items-center justify-center text-xl font-bold bg-gray-100"
      >
        -
      </button>

      <input
        type="number"
        min="1"
        value={productQty}
        onChange={(e) => updateQty(product.product_id, e.target.value)}
        className="w-14 h-10 border-x border-gray-300 text-center font-semibold text-base"
      />

      <button
        type="button"
        onClick={() =>
          updateQty(product.product_id, Number(productQty || 1) + 1)
        }
        className="w-10 h-10 flex items-center justify-center text-xl font-bold bg-gray-100"
      >
        +
      </button>
    </div>

    <button
      type="button"
      onClick={() => handleAddToCart(product, productQty)}
      className="bg-green-700 text-white px-5 h-10 font-bold text-sm hover:bg-green-800 rounded"
    >
      Add
    </button>
  </div>
</div>
  
        <Link
          to={`/product/${product.slug}`}
          className="hidden md:flex w-16 h-16 bg-gray-50 border border-gray-200 items-center justify-center shrink-0"
        >
          {product.image_url && (
            <img
              src={getImage(product.image_url)}
              alt={product.product_name}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </Link>
  
        <div className="hidden md:block min-w-0 flex-1">
          <Link
            to={`/product/${product.slug}`}
            className="font-semibold text-sm leading-5 text-gray-900 hover:text-blue-700 line-clamp-2 min-h-[2.5rem]"
          >
            {product.product_name}
          </Link>
        </div>
  
        <div className="hidden lg:flex items-center gap-2">
          {product.price_breaks?.map((tier) => (
            <button
              key={`${tier.min_qty}-${tier.max_qty}`}
              type="button"
              onClick={() => setQtyFromSlab(product.product_id, tier.min_qty)}
              className={`text-xs border px-2 py-1 font-semibold whitespace-nowrap ${
                activeTier?.min_qty === tier.min_qty
                  ? "bg-gray-400 text-gray-900 border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            >
              <p>{tier.max_qty ? `${Number(tier.min_qty)}-${Number(tier.max_qty)}` : `${Number(tier.min_qty)}+`}</p>
              <p>£{Number(tier.price).toFixed(2)}</p>
            </button>
          ))}
        </div>
  
        <div className="hidden md:block w-20 text-right">
          <p className="font-bold text-gray-900">£{Number(activeTier?.price || 0).toFixed(2)}</p>
          <p className="text-[11px] text-gray-500">ex VAT</p>
        </div>
  
        <input
          type="number"
          min="1"
          value={productQty}
          onChange={(e) => updateQty(product.product_id, e.target.value)}
          className="hidden md:block w-16 border border-gray-300 px-2 py-2 text-center font-semibold"
        />
  
        <button
          type="button"
          onClick={() => handleAddToCart(product, productQty)}
          className="hidden md:block bg-green-700 text-white px-4 py-2 font-bold text-sm hover:bg-green-800"
        >
          Add
        </button>
      </div>
    );
  };
  const FilterCheckboxGroup = ({ spec }) => {
    const selectedValues = Array.isArray(filters[spec.name])
      ? filters[spec.name]
      : [];

    const isExpanded = expandedFilters[spec.name] ?? selectedValues.length > 0;

    return (
      <div className="border-b border-gray-200 pb-3">
        <button
          type="button"
          onClick={() => toggleFilterGroup(spec.name)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-sm font-bold text-gray-800">
            {spec.name}
          </span>

          {isExpanded ? (
            <ChevronUp size={18} className="text-gray-600" />
          ) : (
            <ChevronDown size={18} className="text-gray-600" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-2">
            {spec.options.map((option) => {
              const checked = selectedValues.includes(option);
              const optionQty = getOptionQty(spec.name, option);

              return (
                <label
                  key={option}
                  className="flex items-center justify-between gap-2 text-sm text-gray-700 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFilterOption(spec.name, option)}
                      className="h-4 w-4 border-gray-400 accent-gray-800 cursor-pointer"
                    />

                    <span>{option}</span>
                  </span>

                  <span className="text-xs text-gray-500">({optionQty})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const FilterBox = () => (
    <div className="bg-white border border-gray-300 p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Filters</h2>
          <p className="text-xs text-gray-500 mt-1">
            ({appliedFilterCount} applied)
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-bold text-red-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {filterOptions.specs.map((spec) => (
        <FilterCheckboxGroup key={spec.name} spec={spec} />
      ))}
    </div>
  );

  useEffect(() => {
    if (!slug) return;

    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    canonical.setAttribute(
      "href",
      `https://www.sarawholesale.co.uk/subcategory/${slug}`
    );
  }, [slug]);

  useEffect(() => {
    if (!currentCategory) return;

    document.title =
      currentCategory.meta_title ||
      `${currentCategory.category_name} | Sara Wholesale`;

    let meta = document.querySelector('meta[name="description"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    meta.setAttribute(
      "content",
      currentCategory.meta_description ||
        `Browse ${currentCategory.category_name} from Sara Wholesale.`
    );
  }, [currentCategory]);

  return (
    <main className="bg-gray-100 min-h-screen">
      {addedProduct && (
        <div className="fixed top-5 right-5 z-50 bg-white border border-green-100 shadow-lg px-5 py-4">
          <p className="text-sm font-semibold text-green-700">Added to cart</p>
          <p className="text-xs text-[#071b3a]/55 mt-1">{addedProduct}</p>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-5 right-5 z-50 bg-red-50 border border-red-200 shadow-lg px-5 py-4">
          <p className="text-sm font-semibold text-red-700">{errorMessage}</p>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 pt-6 pb-6">
        <div className="hidden md:flex items-center text-sm font-semibold text-[#071b3a]/70 mb-4 mt-4">
          <Link
            to="/"
            className="text-blue-700 underline hover:text-green-700 cursor-pointer"
          >
            Home
          </Link>

          {parentCategory && (
            <>
              <span className="mx-2">›</span>
              <Link
                to={`/category/${parentCategory.slug}`}
                className="text-blue-700 underline hover:text-green-700 cursor-pointer"
              >
                {parentCategory.category_name}
              </Link>
            </>
          )}

          <span className="mx-2">›</span>
          <span>{currentCategory?.category_name || "Products"}</span>
        </div>

        <div className="md:hidden mb-4 flex items-center justify-between">
          <Link
            to={parentCategory ? `/category/${parentCategory.slug}` : "/"}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600"
          >
            <ArrowLeft size={16} />
            {parentCategory?.category_name || "Categories"}
          </Link>

          {hasFilterOptions && (
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="inline-flex items-center gap-1 border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-blue-800"
            >
              <SlidersHorizontal size={16} />
              Filter
            </button>
          )}
        </div>

        {hasFilterOptions && mobileFilterOpen && (
          <div className="fixed inset-0 z-[9999] bg-black/40 lg:hidden">
            <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-300 p-4">
                <h2 className="text-lg font-bold text-blue-800">
                  Filter Products
                </h2>

                <button type="button" onClick={() => setMobileFilterOpen(false)}>
                  <X size={22} />
                </button>
              </div>

              <div className="p-4">
                <FilterBox />

                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="mt-4 w-full bg-blue-800 text-white py-3 font-bold"
                >
                  Show Products
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block space-y-4 sticky top-17.5 h-fit">

            {hasFilterOptions && <FilterBox />}

            <div className="bg-white border border-gray-300 p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                Sub Categories
              </h2>

              {sideSubCategories.map((cat) => {
                return (
                  <Link
                    key={cat.category_id}
                    to={`/subcategory/${cat.slug}`}
                    className={`flex items-center justify-between w-full text-left py-2 border-b border-gray-300 ${
                      cat.slug === slug ? "font-bold text-green-700" : ""
                    }`}
                  >
                    <span>{cat.category_name}</span>
                  </Link>
                );
              })}
            </div>
          </aside>

          <section className="min-w-0">
            <div className="bg-white border border-gray-300 p-4 mb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-bold text-gray-800">
                    {currentCategory?.category_name || "Products"}
                  </h1>

                  <span className="text-sm text-gray-600 font-semibold whitespace-nowrap">
                    (
                    {hasActiveFilters
                      ? `${filteredProducts.length} of ${products.length}`
                      : products.length}
                    )
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    Sort by:
                  </label>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-blue-800"
                  >
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="relevance">Relevance</option>
                  </select>

                  <div className="flex border border-gray-300 bg-white">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-2 ${
                        viewMode === "grid"
                          ? "bg-blue-800 text-white"
                          : "text-gray-700"
                      }`}
                    >
                      <Grid2X2 size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-2 ${
                        viewMode === "list"
                          ? "bg-blue-800 text-white"
                          : "text-gray-700"
                      }`}
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 && (
              <div className="bg-white border border-gray-300 p-6">
                No products found.
              </div>
            )}

            {sortedProducts.length > 0 && viewMode === "grid" && (
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    qty={qty[product.product_id] ?? 1}
                    activeTier={getActiveTier(product)}
                    onQtyChange={updateQty}
                    onSlabClick={setQtyFromSlab}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}

            {sortedProducts.length > 0 && viewMode === "list" && (
              <div className="space-y-2">
                {sortedProducts.map((product) => (
                  <ProductTradeRow key={product.product_id} product={product} />
                ))}
              </div>
            )}

            {relatedCategories.length > 0 && (
              <div className="mt-8 bg-white border border-gray-300 p-4 overflow-hidden">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Related Categories
                </h2>

                <div className="relative">
                  {relatedCategories.length > 4 && (
                    <button
                      type="button"
                      onClick={() => scrollCategories("left")}
                      className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 h-12 w-12 rounded-full bg-white border border-gray-300 shadow items-center justify-center"
                    >
                      <ChevronLeft size={30} />
                    </button>
                  )}

                  <div
                    ref={categoryScrollRef}
                    className="flex gap-4 overflow-x-auto pb-2"
                  >
                    {relatedCategories.map((cat) => (
                      <Link
                        key={cat.category_id}
                        to={`/subcategory/${cat.slug}`}
                        className="shrink-0 w-52.5 bg-white border border-gray-300 p-3 hover:shadow-sm transition"
                      >
                        <div className="h-36 bg-gray-50 flex items-center justify-center mb-3">
                          {cat.image_url && (
                            <img
                              src={getImage(cat.image_url)}
                              alt={cat.category_name}
                              className="max-w-full max-h-full object-contain"
                            />
                          )}
                        </div>

                        <p className="text-sm font-semibold text-center">
                          {cat.category_name}
                        </p>
                      </Link>
                    ))}
                  </div>

                  {relatedCategories.length > 4 && (
                    <button
                      type="button"
                      onClick={() => scrollCategories("right")}
                      className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 h-12 w-12 rounded-full bg-white border border-gray-300 shadow items-center justify-center"
                    >
                      <ChevronRight size={30} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {currentCategory?.seo_content && (
              <div className="mt-8 bg-white border border-gray-300 p-6 md:p-8">
                <div
                  className="
                    text-[#333] text-sm md:text-base leading-7
                    [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-gray-800 [&_h2]:mb-4
                    [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-blue-gray [&_h3]:mt-6 [&_h3]:mb-3
                    [&_p]:mb-4
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                    [&_li]:mb-1
                  "
                  dangerouslySetInnerHTML={{
                    __html: currentCategory.seo_content,
                  }}
                />
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}