import { useEffect, useState } from "react";
import { Edit, Plus, Trash2, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

const emptyForm = {
  category_id: "",
  category_name: "",
  slug: "",
  parent_category_id: "",
  meta_title: "",
  meta_description: "",
  seo_content: "",
  is_active: 1,
  image: null,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadCategories = async () => {
    const res = await fetch(`${API_URL}/api/categories/admin/all`, {
      credentials: "include",
    });

    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadCategories();
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
      setForm((prev) => ({
        ...prev,
        image: files[0],
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category_name" && !editing
        ? { slug: createSlug(value) }
        : {}),
    }));
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditing(false);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setForm({
      category_id: category.category_id,
      category_name: category.category_name || "",
      slug: category.slug || "",
      parent_category_id: category.parent_category_id || "",
      meta_title: category.meta_title || "",
      meta_description: category.meta_description || "",
      seo_content: category.seo_content || "",
      is_active: category.is_active ?? 1,
      image: null,
    });

    setEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = editing
      ? `${API_URL}/api/categories/${form.category_id}`
      : `${API_URL}/api/categories`;

    const method = editing ? "PUT" : "POST";

    const formData = new FormData();

    formData.append("category_name", form.category_name);
    formData.append("slug", form.slug);
    formData.append("parent_category_id", form.parent_category_id || "");
    formData.append("meta_title", form.meta_title || "");
    formData.append("meta_description", form.meta_description || "");
    formData.append("seo_content", form.seo_content || "");
    formData.append("is_active", form.is_active);

    if (form.image) {
      formData.append("image", form.image);
    }

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
    loadCategories();
  };

  const handleDelete = async (category_id) => {
    if (!confirm("Delete this category?")) return;

    const res = await fetch(`${API_URL}/api/categories/${category_id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.message || "Failed to delete category");
      return;
    }

    loadCategories();
  };

  return (
    <main className="bg-white px-4 py-8 text-[13px]">
      <section className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-[#071b3a]">
              Admin Categories
            </h1>
            <p className="text-xs text-gray-500">
              Add, edit and manage product categories
            </p>
          </div>

          <button
            onClick={openAdd}
            className="bg-green-700 text-white px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-800"
          >
            <Plus size={15} />
            Add Category
          </button>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-[#071b3a]">
              <tr>
                <th className="p-3 text-left font-semibold">Image</th>
                <th className="p-3 text-left font-semibold">Category</th>
                <th className="p-3 text-left font-semibold">Slug</th>
                <th className="p-3 text-left font-semibold">Parent</th>
                <th className="p-3 text-left font-semibold">Status</th>
                <th className="p-3 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => {
                const imageSrc = category.image_url?.startsWith("http")
                  ? category.image_url
                  : `${API_URL}${category.image_url}`;

                return (
                  <tr
                    key={category.category_id}
                    className="border-t border-gray-100"
                  >
                    <td className="p-3">
                      {category.image_url ? (
                        <img
                          src={imageSrc}
                          alt={category.category_name}
                          className="w-12 h-12 object-contain border border-gray-200 rounded-md"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-[11px] text-gray-400">
                          No Img
                        </div>
                      )}
                    </td>

                    <td className="p-3 font-medium text-[#071b3a]">
                      {category.category_name}
                    </td>

                    <td className="p-3 text-gray-600">{category.slug}</td>

                    <td className="p-3 text-gray-600">
                      {category.parent_category_name || "-"}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                          category.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {category.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(category)}
                          className="h-8 w-8 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center"
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(category.category_id)}
                          className="h-8 w-8 rounded-md border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!categories.length && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-400">
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/35 z-[9999] flex items-start sm:items-center justify-center px-3 sm:px-4 py-4 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl w-full max-w-lg sm:max-w-xl p-4 sm:p-5 shadow-xl max-h-[calc(100vh-32px)] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#071b3a]">
                {editing ? "Edit Category" : "Add Category"}
              </h2>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <Input
                label="Category Name *"
                name="category_name"
                value={form.category_name}
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
                  Parent Category
                </label>
                <select
                  name="parent_category_id"
                  value={form.parent_category_id}
                  onChange={handleChange}
                  className="w-full h-9 border border-gray-200 rounded-md px-3 text-sm outline-none focus:border-[#071b3a]"
                >
                  <option value="">No Parent</option>
                  {categories
                    .filter(
                      (cat) =>
                        Number(cat.category_id) !== Number(form.category_id)
                    )
                    .map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category Image
                </label>

                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="is_active"
                  value={form.is_active}
                  onChange={handleChange}
                  className="w-full h-9 border border-gray-200 rounded-md px-3 text-sm outline-none focus:border-[#071b3a]"
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Meta Title
                </label>

                <textarea
                  name="meta_title"
                  value={form.meta_title}
                  onChange={handleChange}
                  rows="3"
                  maxLength="500"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#071b3a]"
                />
              </div>
            <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Meta Description
                </label>

                <textarea
                  name="meta_description"
                  value={form.meta_description}
                  onChange={handleChange}
                  rows="3"
                  maxLength="5000"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#071b3a]"
                />
              </div>
            <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  SEO Content
                </label>

                <textarea
                  name="seo_content"
                  value={form.seo_content}
                  onChange={handleChange}
                  rows="3"
                  maxLength="5000"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#071b3a]"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-5">
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
                  ? "Update Category"
                  : "Add Category"}
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