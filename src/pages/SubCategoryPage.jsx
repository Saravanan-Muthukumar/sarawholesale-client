import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CategoryMenu from "../components/CategoryMenu";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function SubCategoryPage() {
  const { slug } = useParams();

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const parent = categories.find((c) => c.slug === slug);

  const subCategories = categories.filter(
    (c) => c.parent_category_id === parent?.category_id
  );

  const getImage = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  };

  return (
    <main className="bg-[#fbfcfe] min-h-screen">
        <div className="hidden md:block">
            <CategoryMenu categories={categories} />
        </div>
      <section className="max-w-7xl mx-auto px-4 py-5">
        {/* DESKTOP BREADCRUMB */}
        <div className="hidden md:block text-xs text-[#071b3a]/50 mb-3 mt-1">
          <Link to="/" className="hover:text-green-700">
            Home
          </Link>

          <span className="mx-2">›</span>

          <Link to="/" className="hover:text-green-700">
            Categories
          </Link>

          <span className="mx-2">›</span>

          <span>{parent?.category_name}</span>
        </div>

        {/* MOBILE BACK NAVIGATION */}
        <div className="md:hidden mb-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#071b3a]/60 hover:text-green-700"
          >
            <ArrowLeft size={16} />
            Categories
          </Link>
        </div>

        <h1 className="text-xl font-bold text-[#071b3a]">
          {parent?.category_name}
        </h1>

        <p className="text-sm text-[#071b3a]/60 mt-1">
          Select a subcategory
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {subCategories.map((sub) => (
            <Link
              key={sub.category_id}
              to={`/subcategory/${sub.slug}`}
              className="bg-white border border-[#edf1f7] rounded-2xl p-4 shadow-sm hover:shadow-md transition group"
            >
              <div className="aspect-square flex items-center justify-center">
                {getImage(sub.image_url) ? (
                  <img
                    src={getImage(sub.image_url)}
                    alt={sub.category_name}
                    className="w-full h-full object-contain group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-full h-full bg-[#f8fafc] rounded-xl" />
                )}
              </div>

              <div className="mt-3">
                <h3 className="text-xs font-semibold text-[#071b3a] leading-snug line-clamp-2 min-h-8">
                  {sub.category_name}
                </h3>

                <p className="text-[11px] text-[#071b3a]/50 mt-1">
                  View Products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}