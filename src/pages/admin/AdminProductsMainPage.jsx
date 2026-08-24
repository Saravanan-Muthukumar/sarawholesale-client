import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  ImagePlus,
  Loader2,
  PackagePlus,
  Plus,
  Save,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

const emptySpec = () => ({ spec_name: "", spec_value: "", is_visible: 1 });
const emptyVariant = () => ({
  variant_id: null,
  sku: "",
  variant_1: "Size",
  variant_1_value: "",
  variant_2: "",
  variant_2_value: "",
  stock_qty: 0,
  tier_1_qty: 1,
  tier_1_price: "",
  tier_2_qty: "",
  tier_2_price: "",
  tier_3_qty: "",
  tier_3_price: "",
  tier_4_qty: "",
  tier_4_price: "",
  is_active: 1,
  images: [],
  new_images: [],
});

const emptyProduct = () => ({
  product_id: null,
  category_id: "",
  product_name: "",
  slug: "",
  brand: "",
  model: "",
  size: "",
  description: "",
  vat_rate: 20,
  is_active: 1,
  meta_title: "",
  meta_description: "",
  seo_content: "",
  specifications: [emptySpec()],
  images: [],
  new_images: [],
  variants: [emptyVariant()],
});

export default function AdminProductsMainPage() {
  const cleanText = (value) => String(value ?? "").trim();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyProduct());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [openSections, setOpenSections] = useState({
    details: true,
    images: true,
    variants: true,
    specs: false,
    seo: false,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search.trim()) query.set("search", search.trim());
      if (categoryFilter) query.set("category_id", categoryFilter);
      if (statusFilter !== "") query.set("is_active", statusFilter);

      const [productRes, categoryRes] = await Promise.all([
        fetch(`${API_URL}/api/product-main?${query.toString()}`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/categories`, { credentials: "include" }),
      ]);

      if (!productRes.ok) throw new Error("Failed to load products");
      if (!categoryRes.ok) throw new Error("Failed to load categories");

      setProducts(await productRes.json());
      setCategories(await categoryRes.json());
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadData, 250);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, statusFilter]);

  const createSlug = (value) =>
    String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const getImageSrc = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${API_URL}${url}`;
  };

  const openAdd = () => {
    setEditing(true);
    setMessage("");
    setForm(emptyProduct());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = async (productId) => {
    try {
      setSaving(true);
      setMessage("");
  
      const res = await fetch(
        `${API_URL}/api/product-main/id/${productId}`,
        {
          credentials: "include",
        }
      );
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.message || "Failed to load product");
      }
  
      setForm({
        ...emptyProduct(),
        ...data,
        category_id: String(data.category_id || ""),
        specifications: data.specifications?.length
          ? data.specifications
          : [emptySpec()],
        images: data.images || data.main_images || [],
        new_images: [],
        variants: data.variants?.length
          ? data.variants.map((variant) => ({
              ...emptyVariant(),
              ...variant,
              new_images: [],
              images: variant.images || [],
            }))
          : [emptyVariant()],
      });
  
      setEditing(true);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const closeEditor = () => {
    setEditing(false);
    setForm(emptyProduct());
    setMessage("");
  };

  const updateProduct = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "product_name" && !prev.product_id
        ? { slug: createSlug(value) }
        : {}),
    }));
  };

  const updateSpec = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      specifications: prev.specifications.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updateVariant = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addVariant = () => {
    setForm((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }));
  };

  const removeVariant = async (index) => {
    const variant = form.variants[index];
    if (!confirm("Delete this variant?")) return;

    if (variant.variant_id) {
      const res = await fetch(
        `${API_URL}/api/product-main/variant/${variant.variant_id}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setMessage(data.message || "Failed to delete variant");
    }

    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const removeExistingImage = async (imageId, type, variantIndex = null) => {
    if (!confirm("Delete this image?")) return;
    const endpoint =
      type === "product"
        ? `${API_URL}/api/product-main/image/${imageId}`
        : `${API_URL}/api/product-main/variant-image/${imageId}`;

    const res = await fetch(endpoint, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMessage(data.message || "Failed to delete image");

    if (type === "product") {
      setForm((prev) => ({
        ...prev,
        images: prev.images.filter((image) => image.image_id !== imageId),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        variants: prev.variants.map((variant, i) =>
          i === variantIndex
            ? {
                ...variant,
                images: variant.images.filter((image) => image.image_id !== imageId),
              }
            : variant
        ),
      }));
    }
  };

  const makePrimaryImage = async (imageId, type, variantIndex = null) => {
    const endpoint =
      type === "product"
        ? `${API_URL}/api/product-main/image/${imageId}/primary`
        : `${API_URL}/api/product-main/variant-image/${imageId}/primary`;

    const res = await fetch(endpoint, {
      method: "PUT",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMessage(data.message || "Failed to set primary image");

    if (type === "product") {
      setForm((prev) => ({
        ...prev,
        images: prev.images.map((image) => ({
          ...image,
          is_primary: image.image_id === imageId ? 1 : 0,
        })),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        variants: prev.variants.map((variant, i) =>
          i === variantIndex
            ? {
                ...variant,
                images: variant.images.map((image) => ({
                  ...image,
                  is_primary: image.image_id === imageId ? 1 : 0,
                })),
              }
            : variant
        ),
      }));
    }
  };

  const validateForm = () => {
    if (
      !form.category_id ||
      !cleanText(form.product_name) ||
      !cleanText(form.slug)
    ) {
      return "Category, product name and slug are required.";
    }
  
    if (!form.variants?.length) {
      return "Add at least one variant.";
    }
  
    for (let i = 0; i < form.variants.length; i += 1) {
      const variant = form.variants[i];
  
      if (!cleanText(variant.sku)) {
        return `SKU is required for variant ${i + 1}.`;
      }
  
      if (
        !variant.tier_1_qty ||
        variant.tier_1_price === "" ||
        variant.tier_1_price == null
      ) {
        return `Tier 1 quantity and price are required for variant ${i + 1}.`;
      }
    }
  
    return "";
  };

  const saveProduct = async () => {
    const validationError = validateForm();
    if (validationError) return setMessage(validationError);

    try {
      setSaving(true);
      setMessage("");

      const formData = new FormData();
      const productPayload = {
        category_id: Number(form.category_id),
        product_name: cleanText(form.product_name),
        slug: cleanText(form.slug),
        brand: cleanText(form.brand),
        model: cleanText(form.model),
        size: cleanText(form.size),
        description: cleanText(form.description),
        vat_rate: Number(form.vat_rate || 20),
        is_active: Number(form.is_active),
        meta_title: cleanText(form.meta_title),
        meta_description: cleanText(form.meta_description),
        seo_content: cleanText(form.seo_content),
      
        specifications: (form.specifications || [])
          .filter(
            (item) =>
              cleanText(item.spec_name) &&
              cleanText(item.spec_value)
          )
          .map((item, index) => ({
            spec_id: item.spec_id || null,
            spec_name: cleanText(item.spec_name),
            spec_value: cleanText(item.spec_value),
            sort_order: index,
            is_visible: Number(item.is_visible ?? 1),
          })),
      
        variants: (form.variants || []).map((variant) => ({
          variant_id: variant.variant_id || null,
          sku: cleanText(variant.sku),
      
          variant_1: cleanText(variant.variant_1) || null,
          variant_1_value:
            cleanText(variant.variant_1_value) || null,
      
          variant_2: cleanText(variant.variant_2) || null,
          variant_2_value:
            cleanText(variant.variant_2_value) || null,
      
          stock_qty: Number(variant.stock_qty || 0),
      
          tier_1_qty: Number(variant.tier_1_qty || 1),
          tier_1_price: Number(variant.tier_1_price || 0),
      
          tier_2_qty:
            variant.tier_2_qty !== "" &&
            variant.tier_2_qty != null
              ? Number(variant.tier_2_qty)
              : null,
      
          tier_2_price:
            variant.tier_2_price !== "" &&
            variant.tier_2_price != null
              ? Number(variant.tier_2_price)
              : null,
      
          tier_3_qty:
            variant.tier_3_qty !== "" &&
            variant.tier_3_qty != null
              ? Number(variant.tier_3_qty)
              : null,
      
          tier_3_price:
            variant.tier_3_price !== "" &&
            variant.tier_3_price != null
              ? Number(variant.tier_3_price)
              : null,
      
          tier_4_qty:
            variant.tier_4_qty !== "" &&
            variant.tier_4_qty != null
              ? Number(variant.tier_4_qty)
              : null,
      
          tier_4_price:
            variant.tier_4_price !== "" &&
            variant.tier_4_price != null
              ? Number(variant.tier_4_price)
              : null,
      
          is_active: Number(variant.is_active ?? 1),
        })),
      };

      Object.entries(productPayload).forEach(([key, value]) => {
        if (key === "specifications" || key === "variants") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value ?? "");
        }
      });
      form.new_images.forEach((file) => formData.append("product_images", file));
      form.variants.forEach((variant, index) => {
        variant.new_images.forEach((file) =>
          formData.append(`variant_images_${index}`, file)
        );
      });

      const url = form.product_id
          ? `${API_URL}/api/product-main/${form.product_id}`
          : `${API_URL}/api/product-main`;
      const method = form.product_id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save product");

      setMessage("Product saved successfully.");
      await loadData();
      if (data.product_id || form.product_id) {
        await openEdit(data.product_id || form.product_id);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm("Deactivate this product and all its variants?")) return;
    const res = await fetch(`${API_URL}/api/product-main/${productId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMessage(data.message || "Failed to delete product");
    loadData();
  };

  const productCountText = useMemo(
    () => `${products.length} product${products.length === 1 ? "" : "s"}`,
    [products.length]
  );

  return (
    <>
    <main className="min-h-screen bg-[#f7f7f7] px-3 py-6 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-[#191919]">Products</h1>
            <p className="text-sm text-gray-600">Manage main products, variants, stock, prices and images.</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 rounded-full bg-[#3665f3] px-5 py-2.5 font-semibold text-white hover:bg-[#2b4fc4]">
            <PackagePlus size={18} /> Create listing
          </button>
        </div>

        {message && <div className="mb-4 rounded border border-amber-300 bg-amber-50 px-4 py-3">{message}</div>}

        <div className="mb-4 rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product, brand or model" className="w-full rounded-full border border-gray-400 py-2 pl-10 pr-4 outline-none focus:border-blue-600" />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-full border border-gray-400 px-4 py-2">
              <option value="">All categories</option>
              {categories.map((category) => <option key={category.category_id} value={category.category_id}>{category.category_name}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-full border border-gray-400 px-4 py-2">
              <option value="">All statuses</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mb-2 text-sm text-gray-600">{productCountText}</div>
        <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12"><Loader2 className="animate-spin" /> Loading products...</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No products found.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {products.map((product) => (
                <div key={product.product_id} className="grid items-center gap-3 p-4 hover:bg-gray-50 md:grid-cols-[76px_1fr_150px_120px_150px]">
                  <div className="flex h-16 w-16 items-center justify-center rounded border border-gray-200 bg-gray-50">
                    {product.image_url ? <img src={getImageSrc(product.image_url)} alt="" className="h-full w-full object-contain" /> : <ImagePlus className="text-gray-300" />}
                  </div>
                  <div>
                    <div className="font-semibold text-[#191919]">{product.product_name}</div>
                    <div className="mt-1 text-xs text-gray-500">{product.brand || "No brand"} · {product.variant_count || 0} variants</div>
                  </div>
                  <div className="text-sm text-gray-600">{product.category_name}</div>
                  <div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${Number(product.is_active) === 1 ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>{Number(product.is_active) === 1 ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(product.product_id)} className="flex items-center gap-1 rounded-full border border-gray-400 px-3 py-1.5 font-semibold hover:bg-gray-100"><Edit3 size={15} /> Edit</button>
                    <button onClick={() => deleteProduct(product.product_id)} className="rounded-full border border-red-300 p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>

      {editing && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-2 md:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) closeEditor();
          }}
        >
          <div className="relative max-h-[96vh] w-full max-w-7xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={closeEditor}
              disabled={saving}
              className="absolute right-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow hover:bg-gray-100 disabled:opacity-50"
              aria-label="Close product editor"
            >
              <X size={20} />
            </button>
      <div className="bg-[#f7f7f7] px-3 py-4 text-sm text-[#191919] md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="sticky top-0 z-30 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-300 bg-white px-4 py-3 shadow-sm">
            <div>
              <h1 className="mt-1 text-xl font-semibold">
                {form.product_id ? "Revise your listing" : "Create a product listing"}
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-full border border-gray-400 bg-white px-5 py-2 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveProduct}
                disabled={saving}
                className="flex items-center gap-2 rounded-full bg-[#3665f3] px-6 py-2 font-semibold text-white hover:bg-[#2b4fc4] disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save listing
              </button>
            </div>
          </div>

          {message && (
            <div className="mb-4 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
              {message}
            </div>
          )}

          <SectionCard
            title="Product details"
            subtitle="Information shared by every variant"
            open={openSections.details}
            onToggle={() => setOpenSections((p) => ({ ...p, details: !p.details }))}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Product name *" value={form.product_name} onChange={(v) => updateProduct("product_name", v)} />
              <Field label="Custom URL slug *" value={form.slug} onChange={(v) => updateProduct("slug", v)} />
              <SelectField label="Category *" value={form.category_id} onChange={(v) => updateProduct("category_id", v)} options={categories.map((c) => ({ value: c.category_id, label: c.category_name }))} />
              <Field label="Brand" value={form.brand} onChange={(v) => updateProduct("brand", v)} />
              <Field label="Model" value={form.model} onChange={(v) => updateProduct("model", v)} />
              <Field label="General size description" value={form.size} onChange={(v) => updateProduct("size", v)} placeholder="Example: Available in multiple sizes" />
              <Field label="VAT rate %" type="number" value={form.vat_rate} onChange={(v) => updateProduct("vat_rate", v)} />
              <SelectField label="Listing status" value={form.is_active} onChange={(v) => updateProduct("is_active", v)} options={[{ value: 1, label: "Active" }, { value: 0, label: "Inactive" }]} />
              <div className="md:col-span-2">
                <TextArea label="Description" value={form.description} onChange={(v) => updateProduct("description", v)} rows={6} />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Main product photos"
            subtitle="Used on category pages and when a variant has no image"
            open={openSections.images}
            onToggle={() => setOpenSections((p) => ({ ...p, images: !p.images }))}
          >
            <ImageManager
              images={form.images}
              newImages={form.new_images}
              getImageSrc={getImageSrc}
              onFiles={(files) => updateProduct("new_images", files)}
              onDelete={(id) => removeExistingImage(id, "product")}
              onPrimary={(id) => makePrimaryImage(id, "product")}
            />
          </SectionCard>

          <SectionCard
            title="Variants, stock and pricing"
            subtitle="Each row is a sellable SKU, similar to eBay variation listings"
            open={openSections.variants}
            onToggle={() => setOpenSections((p) => ({ ...p, variants: !p.variants }))}
            action={
              <button type="button" onClick={addVariant} className="flex items-center gap-1 rounded-full border border-blue-600 px-4 py-1.5 font-semibold text-blue-700 hover:bg-blue-50">
                <Plus size={15} /> Add variant
              </button>
            }
          >
            <div className="space-y-4">
              {form.variants.map((variant, index) => (
                <VariantCard
                  key={variant.variant_id || `new-${index}`}
                  variant={variant}
                  index={index}
                  getImageSrc={getImageSrc}
                  onChange={(field, value) => updateVariant(index, field, value)}
                  onRemove={() => removeVariant(index)}
                  onDeleteImage={(id) => removeExistingImage(id, "variant", index)}
                  onPrimaryImage={(id) => makePrimaryImage(id, "variant", index)}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Item specifics"
            subtitle="Common specifications shown on the product page"
            open={openSections.specs}
            onToggle={() => setOpenSections((p) => ({ ...p, specs: !p.specs }))}
            action={<button type="button" onClick={() => setForm((p) => ({ ...p, specifications: [...p.specifications, emptySpec()] }))} className="flex items-center gap-1 rounded-full border border-gray-400 px-4 py-1.5 font-semibold hover:bg-gray-50"><Plus size={15} /> Add specific</button>}
          >
            <div className="space-y-2">
              {form.specifications.map((spec, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 rounded border border-gray-200 bg-gray-50 p-3">
                  <input className="col-span-5 rounded border border-gray-300 px-3 py-2" placeholder="Name, e.g. Material" value={spec.spec_name} onChange={(e) => updateSpec(index, "spec_name", e.target.value)} />
                  <input className="col-span-6 rounded border border-gray-300 px-3 py-2" placeholder="Value" value={spec.spec_value} onChange={(e) => updateSpec(index, "spec_value", e.target.value)} />
                  <button type="button" onClick={() => setForm((p) => ({ ...p, specifications: p.specifications.filter((_, i) => i !== index) }))} className="col-span-1 flex items-center justify-center text-red-600"><Trash2 size={17} /></button>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Search engine optimisation"
            subtitle="Optional search result title, description and page content"
            open={openSections.seo}
            onToggle={() => setOpenSections((p) => ({ ...p, seo: !p.seo }))}
          >
            <div className="space-y-4">
              <Field label="Meta title" value={form.meta_title} onChange={(v) => updateProduct("meta_title", v)} />
              <TextArea label="Meta description" value={form.meta_description} onChange={(v) => updateProduct("meta_description", v)} rows={3} />
              <TextArea label="SEO content" value={form.seo_content} onChange={(v) => updateProduct("seo_content", v)} rows={7} />
            </div>
          </SectionCard>
        </div>
      </div>

          </div>
        </div>
      )}
    </>
  );
}

function SectionCard({ title, subtitle, open, onToggle, action, children }) {
  return (
    <section className="mb-4 overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <button type="button" onClick={onToggle} className="flex flex-1 items-center gap-3 text-left">
          {open ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <div><h2 className="text-lg font-semibold">{title}</h2><p className="text-xs text-gray-500">{subtitle}</p></div>
        </button>
        {action}
      </div>
      {open && <div className="border-t border-gray-200 p-5">{children}</div>}
    </section>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "" }) {
  return <label className="block"><span className="mb-1 block font-semibold">{label}</span><input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded border border-gray-400 px-3 py-2.5 outline-none focus:border-blue-600" /></label>;
}
function TextArea({ label, value, onChange, rows }) {
  return <label className="block"><span className="mb-1 block font-semibold">{label}</span><textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={rows} className="w-full rounded border border-gray-400 px-3 py-2.5 outline-none focus:border-blue-600" /></label>;
}
function SelectField({ label, value, onChange, options }) {
  return <label className="block"><span className="mb-1 block font-semibold">{label}</span><select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="w-full rounded border border-gray-400 bg-white px-3 py-2.5"><option value="">Select</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function ImageManager({ images, newImages, getImageSrc, onFiles, onDelete, onPrimary }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {images.map((image) => (
          <div key={image.image_id} className={`relative rounded border p-2 ${image.is_primary ? "border-blue-600 ring-1 ring-blue-600" : "border-gray-300"}`}>
            <img src={getImageSrc(image.image_url)} alt="" className="h-24 w-full object-contain" />
            {image.is_primary ? <span className="absolute left-1 top-1 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">Primary</span> : null}
            <div className="mt-2 flex justify-center gap-1">
              <button type="button" onClick={() => onPrimary(image.image_id)} className="rounded border p-1 text-amber-600"><Star size={14} /></button>
              <button type="button" onClick={() => onDelete(image.image_id)} className="rounded border p-1 text-red-600"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-gray-400 bg-gray-50 p-3 text-center hover:border-blue-600">
          <ImagePlus size={26} /><span className="mt-1 font-semibold">Add photos</span><span className="text-[11px] text-gray-500">Multiple files allowed</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(Array.from(e.target.files || []))} />
        </label>
      </div>
      {newImages.length > 0 && <p className="mt-3 text-xs text-blue-700">{newImages.length} new image(s) selected. They upload when you save.</p>}
    </div>
  );
}

function VariantCard({ variant, index, getImageSrc, onChange, onRemove, onDeleteImage, onPrimaryImage }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border border-gray-300">
      <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
        <button type="button" onClick={() => setOpen((p) => !p)} className="flex items-center gap-2 font-semibold">
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          Variant {index + 1}: {variant.variant_1_value || variant.sku || "New variant"}
        </button>
        <button type="button" onClick={onRemove} className="rounded-full p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
      </div>
      {open && (
        <div className="space-y-5 p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Field label="SKU *" value={variant.sku} onChange={(v) => onChange("sku", v)} />
            <Field label="Option 1 name" value={variant.variant_1} onChange={(v) => onChange("variant_1", v)} placeholder="Size" />
            <Field label="Option 1 value" value={variant.variant_1_value} onChange={(v) => onChange("variant_1_value", v)} placeholder="48mm x 50m" />
            <Field label="Stock quantity" type="number" value={variant.stock_qty} onChange={(v) => onChange("stock_qty", v)} />
            <Field label="Option 2 name" value={variant.variant_2} onChange={(v) => onChange("variant_2", v)} placeholder="Colour" />
            <Field label="Option 2 value" value={variant.variant_2_value} onChange={(v) => onChange("variant_2_value", v)} placeholder="Brown" />
            <SelectField label="Status" value={variant.is_active} onChange={(v) => onChange("is_active", v)} options={[{ value: 1, label: "Active" }, { value: 0, label: "Inactive" }]} />
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Volume pricing</h4>
            <div className="grid gap-2 md:grid-cols-4">
              {[1, 2, 3, 4].map((tier) => (
                <div key={tier} className="rounded border border-gray-300 bg-gray-50 p-3">
                  <div className="mb-2 font-semibold">Tier {tier}{tier === 1 ? " *" : ""}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" min="1" placeholder="Qty" value={variant[`tier_${tier}_qty`] ?? ""} onChange={(e) => onChange(`tier_${tier}_qty`, e.target.value)} className="w-full rounded border border-gray-300 px-2 py-2" />
                    <input type="number" min="0" step="0.01" placeholder="£ Price" value={variant[`tier_${tier}_price`] ?? ""} onChange={(e) => onChange(`tier_${tier}_price`, e.target.value)} className="w-full rounded border border-gray-300 px-2 py-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Variant photos</h4>
            <ImageManager images={variant.images} newImages={variant.new_images} getImageSrc={getImageSrc} onFiles={(files) => onChange("new_images", files)} onDelete={onDeleteImage} onPrimary={onPrimaryImage} />
          </div>
        </div>
      )}
    </div>
  );
}