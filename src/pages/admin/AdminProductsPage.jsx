import { useEffect, useState } from "react";
import { Edit, Plus, Trash2, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

const emptyForm = {
  product_id: "",
  category_id: "",
  sku: "",
  product_name: "",
  slug: "",
  description: "",
  is_active: 1,
  images: [],
  price_breaks: [{ min_qty: "1", max_qty: "", price: "" }],
  specifications: [{ spec_name: "", spec_value: "" }],
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const loadData = async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${API_URL}/api/products`),
      fetch(`${API_URL}/api/categories`),
    ]);

    setProducts(await productsRes.json());
    setCategories(await categoriesRes.json());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      product.product_name?.toLowerCase().includes(search) ||
      product.sku?.toLowerCase().includes(search) ||
      product.category_name?.toLowerCase().includes(search);

    const matchesCategory =
      !categoryFilter || String(product.category_id) === String(categoryFilter);

    return matchesSearch && matchesCategory;
  });

  const createSlug = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images") {
      setForm((prev) => ({ ...prev, images: Array.from(files || []) }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "product_name" && !editing
        ? { slug: createSlug(value) }
        : {}),
    }));
  };

  const handlePriceChange = (index, field, value) => {
    setForm((prev) => {
      const updatedPrices = [...prev.price_breaks];
      updatedPrices[index] = { ...updatedPrices[index], [field]: value };
      return { ...prev, price_breaks: updatedPrices };
    });
  };

  const addPriceBreak = () => {
    setForm((prev) => ({
      ...prev,
      price_breaks: [
        ...prev.price_breaks,
        { min_qty: "", max_qty: "", price: "" },
      ],
    }));
  };

  const removePriceBreak = (index) => {
    setForm((prev) => {
      if (prev.price_breaks.length === 1) return prev;

      return {
        ...prev,
        price_breaks: prev.price_breaks.filter((_, i) => i !== index),
      };
    });
  };

  const handleSpecChange = (index, field, value) => {
    setForm((prev) => {
      const updatedSpecs = [...prev.specifications];
      updatedSpecs[index] = { ...updatedSpecs[index], [field]: value };
      return { ...prev, specifications: updatedSpecs };
    });
  };

  const addSpec = () => {
    setForm((prev) => ({
      ...prev,
      specifications: [
        ...prev.specifications,
        { spec_name: "", spec_value: "" },
      ],
    }));
  };

  const removeSpec = (index) => {
    setForm((prev) => {
      if (prev.specifications.length === 1) return prev;

      return {
        ...prev,
        specifications: prev.specifications.filter((_, i) => i !== index),
      };
    });
  };

  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return "";
    return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  };

  const formatPriceBreaks = (priceBreaks = []) => {
    if (!priceBreaks.length) {
      return <span className="text-xs text-gray-400">No price</span>;
    }

    return (
      <div className="w-full max-w-[540px]">
        <div
          className="grid text-center text-[12px] font-semibold text-[#071b3a] border-b border-green-600 pb-1"
          style={{
            gridTemplateColumns: `repeat(${priceBreaks.length}, minmax(0, 1fr))`,
          }}
        >
          {priceBreaks.map((item, index) => {
            const min = item.min_qty;
            const max = item.max_qty;

            return (
              <div
                key={`qty-${index}`}
                className="px-2 border-r border-gray-200 last:border-r-0"
              >
                {max ? `${min}-${max}` : `${min}+`}
              </div>
            );
          })}
        </div>

        <div
          className="grid text-center text-[13px] font-bold text-green-700 pt-1"
          style={{
            gridTemplateColumns: `repeat(${priceBreaks.length}, minmax(0, 1fr))`,
          }}
        >
          {priceBreaks.map((item, index) => {
            const price = Number(item.price || 0).toFixed(2);

            return (
              <div
                key={`price-${index}`}
                className="px-2 border-r border-gray-200 last:border-r-0"
              >
                £{price}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditing(false);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setForm({
      product_id: product.product_id,
      category_id: product.category_id || "",
      sku: product.sku || "",
      product_name: product.product_name || "",
      slug: product.slug || "",
      description: product.description || "",
      is_active: product.is_active ?? 1,
      images: [],
      price_breaks:
        product.price_breaks && product.price_breaks.length
          ? product.price_breaks.map((price) => ({
              min_qty: price.min_qty || "",
              max_qty: price.max_qty || "",
              price: price.price || "",
            }))
          : [{ min_qty: "1", max_qty: "", price: "" }],
      specifications:
        product.specifications && product.specifications.length
          ? product.specifications.map((spec) => ({
              spec_name: spec.spec_name || "",
              spec_value: spec.spec_value || "",
            }))
          : [{ spec_name: "", spec_value: "" }],
    });

    setEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validPriceBreaks = form.price_breaks.filter(
      (item) => item.min_qty && item.price
    );

    const validSpecs = form.specifications.filter(
      (item) => item.spec_name && item.spec_value
    );

    if (!validPriceBreaks.length) {
      alert("Please add at least one price slab");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("category_id", form.category_id);
    formData.append("sku", form.sku);
    formData.append("product_name", form.product_name);
    formData.append("slug", form.slug);
    formData.append("description", form.description);
    formData.append("is_active", form.is_active);
    formData.append("price_breaks", JSON.stringify(validPriceBreaks));
    formData.append("specifications", JSON.stringify(validSpecs));

    form.images.forEach((image) => {
      formData.append("images", image);
    });

    const url = editing
      ? `${API_URL}/api/products/${form.product_id}`
      : `${API_URL}/api/products`;

    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      credentials: "include",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      alert(data.message || "Something went wrong");
      return;
    }

    setModalOpen(false);
    setForm(emptyForm);
    loadData();
  };

  const handleDelete = async (product_id) => {
    if (!confirm("Delete this product?")) return;

    const res = await fetch(`${API_URL}/api/products/${product_id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      alert("Failed to delete product");
      return;
    }

    loadData();
  };

  return (
    <main className="bg-white px-4 py-8 text-[13px]">
      <section className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-[#071b3a]">
              Admin Products
            </h1>
            <p className="text-xs text-gray-500">
              Add, edit and delete products with images, price slabs and specs
            </p>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="bg-green-700 text-white px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-800"
          >
            <Plus size={15} />
            Add Product
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search product, SKU or category..."
            className="md:col-span-2 h-10 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-green-600"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-green-600 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3 text-xs text-gray-500">
          Showing {filteredProducts.length} of {products.length} products
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-[#071b3a]">
              <tr>
                <th className="p-3 text-left font-semibold w-24">Image</th>
                <th className="p-3 text-left font-semibold w-[230px]">
                  Product
                </th>
                <th className="p-3 text-left font-semibold w-[140px]">
                  Category
                </th>
                <th className="p-3 text-left font-semibold">
                  Qty Breaks / Price Per Unit
                </th>
                <th className="p-3 text-left font-semibold w-24">Specs</th>
                <th className="p-3 text-left font-semibold w-20">Stock</th>
                <th className="p-3 text-right font-semibold w-24">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const mainImage =
                    product.image_url ||
                    product.images?.find((img) => img.is_main)?.image_url ||
                    product.images?.[0]?.image_url;

                  const imageSrc = getImageSrc(mainImage);

                  return (
                    <tr
                      key={product.product_id}
                      className="border-t border-gray-100 hover:bg-[#fbfcfe]"
                    >
                      <td className="p-2">
                        {mainImage ? (
                          <div>
                            <img
                              src={imageSrc}
                              alt={product.product_name}
                              className="w-12 h-12 object-contain border border-gray-200 rounded-md bg-white"
                            />
                            {product.images?.length > 1 && (
                              <p className="text-[10px] text-gray-400 mt-1">
                                +{product.images.length - 1} more
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-[10px] text-gray-400">
                            No Img
                          </div>
                        )}
                      </td>

                      <td className="p-3 max-w-[230px]">
                        <p className="font-semibold text-[#071b3a] leading-snug line-clamp-2">
                          {product.product_name}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-1">
                          SKU: {product.sku || "N/A"}
                        </p>
                      </td>

                      <td className="p-3 text-gray-600">
                        {product.category_name}
                      </td>

                      <td className="p-3">
                        {formatPriceBreaks(product.price_breaks)}
                      </td>

                      <td className="p-3 text-gray-600">
                        {product.specifications?.length || 0} rows
                      </td>

                      <td className="p-3 text-gray-600">
                        {product.stock_qty || 0}
                      </td>

                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            className="h-8 w-8 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center"
                          >
                            <Edit size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(product.product_id)}
                            className="h-8 w-8 rounded-md border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="p-8 text-center text-sm text-gray-500"
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/35 z-50 flex items-center justify-center px-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl w-full max-w-4xl p-5 max-h-[88vh] overflow-y-auto shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#071b3a]">
                {editing ? "Edit Product" : "Add Product"}
              </h2>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <Input
                label="Product Name *"
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
              />

              <Input
                label="Slug *"
                name="slug"
                value={form.slug}
                onChange={handleChange}
              />

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                  className="w-full h-9 border border-gray-200 rounded-md px-3 text-sm outline-none focus:border-[#071b3a]"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="SKU"
                name="sku"
                value={form.sku}
                onChange={handleChange}
              />

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product Images
                </label>
                <input
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  You can select multiple images. First selected image will be
                  the main image.
                </p>

                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.images.map((image, index) => (
                      <div
                        key={`${image.name}-${index}`}
                        className="border border-gray-200 rounded-md px-2 py-1 text-[11px] text-gray-600 bg-gray-50"
                      >
                        {index === 0 ? "Main: " : ""}
                        {image.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#071b3a]"
                />
              </div>

              <div className="md:col-span-2 border border-gray-200 rounded-lg p-3 bg-gray-50/60">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#071b3a]">
                    Price Slabs
                  </h3>

                  <button
                    type="button"
                    onClick={addPriceBreak}
                    className="border border-gray-200 bg-white text-[#071b3a] px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 hover:bg-gray-50"
                  >
                    <Plus size={13} />
                    Add Slab
                  </button>
                </div>

                <div className="space-y-2">
                  {form.price_breaks.map((price, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-end bg-white border border-gray-200 rounded-md p-2"
                    >
                      <SmallNumberInput
                        label="Min Qty *"
                        value={price.min_qty}
                        onChange={(value) =>
                          handlePriceChange(index, "min_qty", value)
                        }
                        required
                      />

                      <SmallNumberInput
                        label="Max Qty"
                        value={price.max_qty}
                        onChange={(value) =>
                          handlePriceChange(index, "max_qty", value)
                        }
                        placeholder="Blank for 50+"
                      />

                      <SmallNumberInput
                        label="Price *"
                        value={price.price}
                        onChange={(value) =>
                          handlePriceChange(index, "price", value)
                        }
                        step="0.01"
                        required
                      />

                      <div className="col-span-2 md:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removePriceBreak(index)}
                          className="h-8 w-8 rounded-md border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center disabled:opacity-40"
                          disabled={form.price_breaks.length === 1}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-gray-400 mt-2">
                  Leave Max Qty blank for final slab, example: 50+
                </p>
              </div>

              <div className="md:col-span-2 border border-gray-200 rounded-lg p-3 bg-gray-50/60">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#071b3a]">
                    Product Specifications
                  </h3>

                  <button
                    type="button"
                    onClick={addSpec}
                    className="border border-gray-200 bg-white text-[#071b3a] px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 hover:bg-gray-50"
                  >
                    <Plus size={13} />
                    Add Spec
                  </button>
                </div>

                <div className="space-y-2">
                  {form.specifications.map((spec, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-end bg-white border border-gray-200 rounded-md p-2"
                    >
                      <div className="col-span-5">
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Spec Name
                        </label>
                        <input
                          value={spec.spec_name}
                          onChange={(e) =>
                            handleSpecChange(
                              index,
                              "spec_name",
                              e.target.value
                            )
                          }
                          placeholder="Example: Size"
                          className="w-full h-8 border border-gray-200 rounded-md px-2 text-sm outline-none focus:border-[#071b3a]"
                        />
                      </div>

                      <div className="col-span-6">
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Spec Value
                        </label>
                        <input
                          value={spec.spec_value}
                          onChange={(e) =>
                            handleSpecChange(
                              index,
                              "spec_value",
                              e.target.value
                            )
                          }
                          placeholder="Example: 48mm x 66m"
                          className="w-full h-8 border border-gray-200 rounded-md px-2 text-sm outline-none focus:border-[#071b3a]"
                        />
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeSpec(index)}
                          disabled={form.specifications.length === 1}
                          className="h-8 w-8 rounded-md border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center disabled:opacity-40"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-gray-400 mt-2">
                  Example: Size, Colour, Material, Pack Qty, Thickness,
                  Adhesive Type.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-9 px-4 rounded-md border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                disabled={loading}
                className="h-9 px-5 bg-green-700 text-white rounded-md text-sm font-semibold hover:bg-green-800 disabled:opacity-60"
              >
                {loading
                  ? "Saving..."
                  : editing
                  ? "Update Product"
                  : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={label.includes("*")}
        className="w-full h-9 border border-gray-200 rounded-md px-3 text-sm outline-none focus:border-[#071b3a]"
      />
    </div>
  );
}

function SmallNumberInput({
  label,
  value,
  onChange,
  placeholder = "",
  step = "1",
  required = false,
}) {
  return (
    <div className="col-span-5 md:col-span-3">
      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
        {label}
      </label>

      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full h-8 border border-gray-200 rounded-md px-2 text-sm outline-none focus:border-[#071b3a]"
      />
    </div>
  );
}