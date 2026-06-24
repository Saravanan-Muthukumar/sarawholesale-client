import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CategoryMenu from "../components/CategoryMenu";
import { Helmet } from "react-helmet-async";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function SubCategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

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

  const goToCategories = () => {
    navigate("/", { state: { hideHero: true } });
  };

  const pageTitle =
  parent?.meta_title ||
  `${parent?.category_name || "Categories"} | SARA WHOLESALE`;

const pageDescription =
  parent?.meta_description ||
  `Browse ${parent?.category_name || "business supplies"} at SARA WHOLESALE. Quality wholesale packaging, office and business supplies across the UK.`;

const canonicalUrl = `https://www.sarawholesale.co.uk/category/${slug}`;

  return (
    <main className="bg-[#f7f8fb] min-h-screen">
      <Helmet>
        <title>{pageTitle}</title>

        <meta name="description" content={pageDescription} />

        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>
      <div className="hidden md:block">
        <CategoryMenu categories={categories} />
      </div>

      <section className="max-w-7xl mx-auto px-4 py-5">
        <div className="hidden md:flex items-center text-xs text-[#071b3a]/50 mb-4">
          <Link to="/" className="hover:text-green-700">
            Home
          </Link>

          <span className="mx-2">›</span>

          <button
            type="button"
            onClick={goToCategories}
            className="hover:text-green-700"
          >
            Categories
          </button>

          <span className="mx-2">›</span>

          <span className="text-[#071b3a]/70">
            {parent?.category_name || "Subcategories"}
          </span>
        </div>

        <div className="md:hidden mb-4">
          <button
            type="button"
            onClick={goToCategories}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#071b3a]/70"
          >
            <ArrowLeft size={17} />
            Previous Page
          </button>
        </div>

        <div className="bg-white border border-[#e6edf5] px-5 py-5 shadow-sm">
          <h1 className="text-xl md:text-2xl font-bold text-[#071b3a]">
            {parent?.category_name || "Subcategories"}
          </h1>

          <p className="text-sm text-[#071b3a]/60 mt-1">
            Select a subcategory to view products
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-10">
        {subCategories.length === 0 ? (
          <div className="bg-white border border-[#e6edf5] p-6 text-sm text-[#071b3a]/60">
            No subcategories found.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
            {subCategories.map((sub) => (
              <Link
                key={sub.category_id}
                to={`/subcategory/${sub.slug}`}
                className="bg-white border border-[#e6edf5] p-3 md:p-4 shadow-sm hover:shadow-md hover:border-[#cbd8e8] transition group"
              >
                <div className="aspect-square bg-[#f8fafc] flex items-center justify-center p-2">
                  {getImage(sub.image_url) ? (
                    <img
                      src={getImage(sub.image_url)}
                      alt={sub.category_name}
                      className="w-full h-full object-contain group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#eef3f8]" />
                  )}
                </div>

                <div className="pt-3">
                  <h3 className="text-xs md:text-sm font-semibold text-[#071b3a] leading-snug line-clamp-2 min-h-9">
                    {sub.category_name}
                  </h3>

                  <p className="text-[11px] text-green-700 font-medium mt-1">
                    View products
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}