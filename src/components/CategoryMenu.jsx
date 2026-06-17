import { Link } from "react-router-dom";

export default function CategoryMenu({
  categories = [],
  sticky = false,
  fixed = false,
  stickyTop = "top-0",
}) {
  const parentCategories = categories.filter((cat) => !cat.parent_category_id);

  const getSubCategories = (parentId) =>
    categories.filter((cat) => cat.parent_category_id === parentId);

  return (
    <section
  className={`hidden md:block border-t border-b transition-colors ${
    sticky
      ? "bg-[#062b63] border-[#062b63]"
      : "bg-white border-[#edf1f7]"
  }`}
>
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative flex items-center gap-0 overflow-visible">
          {parentCategories.map((parent) => {
            const subCategories = getSubCategories(parent.category_id);

            return (
              <div key={parent.category_id} className="group py-3 px-4">
                <Link
                  to={`/category/${parent.slug}`}
                  className={`text-sm font-semibold whitespace-nowrap transition ${
                    sticky
                      ? "text-white hover:text-green-300"
                      : "text-[#071b3a] hover:text-green-700"
                  }`}
                >
                  {parent.category_name}

                  {subCategories.length > 0 && (
                    <span className="ml-1 text-xs">▾</span>
                  )}
                </Link>

                {subCategories.length > 0 && (
                  <div className="absolute left-0 top-full hidden group-hover:block w-full bg-white border border-[#e8eef6] rounded-b-xl shadow-lg z-[1000] p-8 min-h-[145px]">
                    <div className="grid grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-4">
                      {subCategories.map((sub) => (
                        <Link
                          key={sub.category_id}
                          to={`/subcategory/${sub.slug}`}
                          className="text-base text-[#071b3a] hover:text-green-700 hover:bg-[#f5f8fc] rounded-lg px-4 py-3"
                        >
                          {sub.category_name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}