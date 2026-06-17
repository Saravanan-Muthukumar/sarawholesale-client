import { useEffect, useMemo, useState } from "react";
import { Printer, Plus, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function AdminFlyerBuilderPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [parentId, setParentId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [paperSize, setPaperSize] = useState("a4");
  const [title, setTitle] = useState("DIY & PAINTING SUPPLIES");
  const [subtitle, setSubtitle] = useState("Product List for Painting Contractors");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [checkedProducts, setCheckedProducts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const parentCategories = categories.filter((cat) => !cat.parent_category_id);

  const subCategories = categories.filter(
    (cat) => String(cat.parent_category_id) === String(parentId)
  );

  const filteredProducts = products.filter((product) => {
    if (subCategoryId) {
      return String(product.category_id) === String(subCategoryId);
    }

    if (parentId) {
      const childIds = subCategories.map((cat) => cat.category_id);
      return childIds.includes(product.category_id);
    }

    return true;
  });

  const addProduct = (product) => {
    if (selectedProducts.some((item) => item.product_id === product.product_id)) {
      return;
    }

    setSelectedProducts((prev) => [...prev, product]);
  };

  const removeProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.filter((item) => item.product_id !== productId)
    );
  };

  const getImage = (imageUrl) => {
    if (!imageUrl) return "";
    return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  };

  const getFromPrice = (product) => {
    const prices = product.price_breaks || [];
    if (!prices.length) return "Call";

    const lowest = prices.reduce((min, item) => {
      const price = Number(item.price || 0);
      return price < min ? price : min;
    }, Number(prices[0].price || 0));

    return `£${lowest.toFixed(2)}`;
  };

  const getPriceSlabText = (product) => {
    if (!product.price_breaks?.length) return "Call for price";

    return product.price_breaks
      .map((tier) => {
        const qty = tier.max_qty
          ? `${tier.min_qty}-${tier.max_qty}`
          : `${tier.min_qty}+`;
        return `${qty}: £${Number(tier.price).toFixed(2)}`;
      })
      .join(" | ");
  };

  const printFlyer = () => {
    window.print();
  };

  const toggleCheckedProduct = (productId) => {
    setCheckedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };
  
  const addCheckedProducts = () => {
    const productsToAdd = filteredProducts.filter((product) =>
      checkedProducts.includes(product.product_id)
    );
  
    setSelectedProducts((prev) => {
      const existingIds = prev.map((item) => item.product_id);
  
      const newItems = productsToAdd.filter(
        (item) => !existingIds.includes(item.product_id)
      );
  
      return [...prev, ...newItems];
    });
  };
  
  const addAllFilteredProducts = () => {
    setSelectedProducts((prev) => {
      const existingIds = prev.map((item) => item.product_id);
  
      const newItems = filteredProducts.filter(
        (item) => !existingIds.includes(item.product_id)
      );
  
      return [...prev, ...newItems];
    });
  };
  
  const clearSelectedProducts = () => {
    setSelectedProducts([]);
    setCheckedProducts([]);
  };

  return (
    <main className="bg-[#f6f8fb] min-h-screen p-4">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #flyer-preview, #flyer-preview * {
            visibility: visible;
          }

          #flyer-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
          }

          .no-print {
            display: none !important;
          }

          @page {
            margin: 8mm;
          }
        }
      `}</style>

      <section className="max-w-7xl mx-auto grid lg:grid-cols-[380px_1fr] gap-5">
        <div className="no-print bg-white border border-gray-200 rounded-2xl p-4 h-fit">
          <h1 className="text-xl font-bold text-[#071b3a] mb-1">
            Flyer Builder
          </h1>
          <p className="text-xs text-gray-500 mb-4">
            Choose category, size, products and print a trade flyer.
          </p>

          <div className="space-y-3">
            <Input label="Flyer Title" value={title} onChange={setTitle} />
            <Input label="Subtitle" value={subtitle} onChange={setSubtitle} />

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Flyer Size
              </label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm"
              >
                <option value="a4">A4 Full Page</option>
                <option value="a5">A5 Small Flyer</option>
                <option value="small">Small Handout</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Main Category
              </label>
              <select
                value={parentId}
                onChange={(e) => {
                  setParentId(e.target.value);
                  setSubCategoryId("");
                }}
                className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm"
              >
                <option value="">All Categories</option>
                {parentCategories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Sub Category
              </label>
              <select
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm"
              >
                <option value="">All Sub Categories</option>
                {subCategories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={printFlyer}
              className="w-full h-10 bg-green-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-800"
            >
              <Printer size={16} />
              Print / Save PDF
            </button>
          </div>

          <div className="border-t border-gray-100 mt-5 pt-4">
  <div className="flex items-center justify-between mb-2">
    <h2 className="text-sm font-bold text-[#071b3a]">
      Select Products
    </h2>

    <span className="text-[11px] text-gray-400">
      {selectedProducts.length} selected
    </span>
  </div>

  <div className="grid grid-cols-2 gap-2 mb-3">
    <button
      type="button"
      onClick={addCheckedProducts}
      className="h-9 rounded-lg bg-green-700 text-white text-xs font-semibold hover:bg-green-800"
    >
      Add Checked
    </button>

    <button
      type="button"
      onClick={addAllFilteredProducts}
      className="h-9 rounded-lg border border-green-200 text-green-700 text-xs font-semibold hover:bg-green-50"
    >
      Add All
    </button>

    <button
      type="button"
      onClick={() =>
        setCheckedProducts(filteredProducts.map((p) => p.product_id))
      }
      className="h-9 rounded-lg border border-gray-200 text-[#071b3a] text-xs font-semibold hover:bg-gray-50"
    >
      Check All
    </button>

    <button
      type="button"
      onClick={clearSelectedProducts}
      className="h-9 rounded-lg border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50"
    >
      Clear
    </button>
  </div>

  <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
    {filteredProducts.map((product) => {
      const checked = checkedProducts.includes(product.product_id);
      const alreadyAdded = selectedProducts.some(
        (item) => item.product_id === product.product_id
      );

      return (
        <div
          key={product.product_id}
          className={`border rounded-xl p-2 flex items-center gap-3 ${
            alreadyAdded
              ? "border-green-200 bg-green-50"
              : "border-gray-200 bg-white hover:border-green-300"
          }`}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggleCheckedProduct(product.product_id)}
            className="h-4 w-4 accent-green-700"
          />

          <button
            type="button"
            onClick={() => addProduct(product)}
            className="flex-1 text-left flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
              {product.image_url ? (
                <img
                  src={getImage(product.image_url)}
                  alt={product.product_name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : null}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#071b3a] line-clamp-2">
                {product.product_name}
              </p>
              <p className="text-[11px] text-gray-400">
                From {getFromPrice(product)}
              </p>
            </div>
          </button>

          {alreadyAdded ? (
            <span className="text-[10px] font-semibold text-green-700">
              Added
            </span>
          ) : (
            <Plus size={15} className="text-green-700" />
          )}
        </div>
      );
    })}
  </div>
</div>         
        </div>

        <div>
          <FlyerPreview
            paperSize={paperSize}
            title={title}
            subtitle={subtitle}
            products={selectedProducts}
            removeProduct={removeProduct}
            getImage={getImage}
            getFromPrice={getFromPrice}
            getPriceSlabText={getPriceSlabText}
          />
        </div>
      </section>
    </main>
  );
}

function FlyerPreview({
  paperSize,
  title,
  subtitle,
  products,
  removeProduct,
  getImage,
  getFromPrice,
  getPriceSlabText,
}) {
  const sizeClass =
    paperSize === "a4"
      ? "max-w-[794px] min-h-[1123px]"
      : paperSize === "a5"
      ? "max-w-[560px] min-h-[794px]"
      : "max-w-[520px] min-h-[650px]";

  return (
    <div
      id="flyer-preview"
      className={`${sizeClass} mx-auto bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden`}
    >
      <div className="bg-white p-6 border-b-4 border-[#0b376d]">
        <div className="flex justify-between gap-4">
        <div>
                <img
                    src="/logo.png"
                    alt="SARA Wholesale"
                    className="w-40 h-auto object-contain"
                />
                <p className="text-[11px] font-semibold text-[#071b3a] mt-2">
                    Quality Supplies. Trade Prices.
                </p>
                </div>

          <div className="text-right">
            <h2 className="text-2xl font-black text-[#0b376d] uppercase">
              {title}
            </h2>
            <p className="text-sm font-bold text-green-700 uppercase mt-1">
              {subtitle}
            </p>

            <div className="text-xs text-[#071b3a] mt-3 space-y-1">
              <p>07424 715150</p>
              <p>sales@sarawholesale.co.uk</p>
              <p>www.sarawholesale.co.uk</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 bg-[#0b376d] text-white text-xs font-bold text-center">
        <div className="py-3">TRADE PRICES</div>
        <div className="py-3">BULK DISCOUNTS</div>
        <div className="py-3">SAME DAY SLOUGH</div>
        <div className="py-3">NEXT DAY UK</div>
      </div>

      <div className="p-5">
        <table className="w-full text-xs border border-gray-200">
          <thead>
            <tr className="bg-[#0b376d] text-white">
              <th className="p-2 text-left w-[70px]">Image</th>
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-left">Price Slabs</th>
              <th className="p-2 text-right w-[90px]">From</th>
              <th className="no-print p-2 w-[40px]"></th>
            </tr>
          </thead>

          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.product_id} className="border-t border-gray-200">
                  <td className="p-2">
                    <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center">
                      {product.image_url ? (
                        <img
                          src={getImage(product.image_url)}
                          alt={product.product_name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : null}
                    </div>
                  </td>

                  <td className="p-2">
                    <p className="font-bold text-[#071b3a]">
                      {product.product_name}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      SKU: {product.sku || "N/A"}
                    </p>
                  </td>

                  <td className="p-2 text-[#071b3a]/70">
                    {getPriceSlabText(product)}
                  </td>

                  <td className="p-2 text-right font-black text-green-700 text-base">
                    {getFromPrice(product)}
                  </td>

                  <td className="no-print p-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeProduct(product.product_id)}
                      className="h-7 w-7 rounded-full border border-red-200 text-red-500 inline-flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-400">
                  Select products from the left to preview flyer.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="border border-green-100 bg-green-50 rounded-xl p-4">
            <h3 className="text-sm font-black text-green-700 mb-2">
              WHY CONTRACTORS CHOOSE US
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#071b3a]">
              <p>✓ Trade Pricing</p>
              <p>✓ Bulk Discounts</p>
              <p>✓ Same Day Slough</p>
              <p>✓ Next Day UK</p>
              <p>✓ Credit Accounts</p>
              <p>✓ UK Stock</p>
            </div>
          </div>

          <div className="border border-[#dbe7f5] bg-[#f8fafc] rounded-xl p-4 text-center">
            <p className="text-sm font-black text-[#071b3a]">
              NEED A BETTER PRICE?
            </p>
            <p className="text-xs text-[#071b3a]/60 mt-1">
              Call us today for trade and bulk orders
            </p>
            <p className="text-2xl font-black text-green-700 mt-2">
              07424 715150
            </p>
          </div>
        </div>

        <p className="text-[10px] text-center text-gray-500 mt-5">
          All prices are trade prices and exclude VAT. Prices subject to change
          without notice.
        </p>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm"
      />
    </div>
  );
}