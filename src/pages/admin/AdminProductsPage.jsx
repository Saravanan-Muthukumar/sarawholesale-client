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
  image: null,
  price_breaks: [{ min_qty: "1", max_qty: "", price: "" }],
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const createSlug = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setForm((prev) => ({ ...prev, image: files[0] }));
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

  const formatPriceBreaks = (priceBreaks = []) => {
    if (!priceBreaks.length) return "No price";

    return priceBreaks
      .map((item) => {
        const min = item.min_qty;
        const max = item.max_qty;
        const price = Number(item.price || 0).toFixed(2);
        return max ? `${min}-${max}: £${price}` : `${min}+: £${price}`;
      })
      .join(", ");
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
      image: null,
      price_breaks:
        product.price_breaks && product.price_breaks.length
          ? product.price_breaks.map((price) => ({
              min_qty: price.min_qty || "",
              max_qty: price.max_qty || "",
              price: price.price || "",
            }))
          : [{ min_qty: "1", max_qty: "", price: "" }],
    });

    setEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validPriceBreaks = form.price_breaks.filter(
      (item) => item.min_qty && item.price
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

    if (form.image) {
      formData.append("image", form.image);
    }

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
              Add, edit and delete products with price slabs
            </p>
          </div>

          <button
            onClick={openAdd}
            className="bg-green-700 text-white px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-800"
          >
            <Plus size={15} />
            Add Product
          </button>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-[#071b3a]">
              <tr>
                <th className="p-3 text-left font-semibold">Image</th>
                <th className="p-3 text-left font-semibold">Product</th>
                <th className="p-3 text-left font-semibold">Category</th>
                <th className="p-3 text-left font-semibold">SKU</th>
                <th className="p-3 text-left font-semibold">Price Slabs</th>
                <th className="p-3 text-left font-semibold">Stock</th>
                <th className="p-3 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const imageSrc = product.image_url?.startsWith("http")
                  ? product.image_url
                  : `${API_URL}${product.image_url}`;

                return (
                  <tr key={product.product_id} className="border-t border-gray-100">
                    <td className="p-3">
                      {product.image_url ? (
                        <img
                          src={imageSrc}
                          alt={product.product_name}
                          className="w-12 h-12 object-contain border border-gray-200 rounded-md"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-[11px] text-gray-400">
                          No Img
                        </div>
                      )}
                    </td>

                    <td className="p-3 font-medium text-[#071b3a]">
                      {product.product_name}
                    </td>
                    <td className="p-3 text-gray-600">{product.category_name}</td>
                    <td className="p-3 text-gray-600">{product.sku || "N/A"}</td>

                    <td className="p-3 text-gray-600 max-w-xs">
                      {formatPriceBreaks(product.price_breaks)}
                    </td>

                    <td className="p-3 text-gray-600">{product.stock_qty || 0}</td>

                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="h-8 w-8 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center"
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(product.product_id)}
                          className="h-8 w-8 rounded-md border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/35 z-50 flex items-center justify-center px-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl w-full max-w-3xl p-5 max-h-[88vh] overflow-y-auto shadow-xl"
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

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product Image
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm"
                />
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