import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function CategoryMenu({ categories = [], sticky = false }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const hoverTimer = useRef(null);

  const parentCategories = useMemo(
    () => categories.filter((cat) => !cat.parent_category_id),
    [categories]
  );

  const subCategories = useMemo(() => {
    if (!activeCategory) return [];

    return categories.filter(
      (cat) => cat.parent_category_id === activeCategory.category_id
    );
  }, [categories, activeCategory]);

  const openCategorySlowly = (cat) => {
    clearTimeout(hoverTimer.current);

    hoverTimer.current = setTimeout(() => {
      setActiveCategory(cat);
    }, 100);
  };

  const closeCategoryMenu = () => {
    clearTimeout(hoverTimer.current);
    setActiveCategory(null);
  };

  return (
    <div
      className={`hidden md:block relative ${
        sticky ? "shadow-md" : ""
      }`}
      onMouseLeave={closeCategoryMenu}
    >
      <div className="bg-[black]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-stretch">
            {parentCategories.map((cat) => {
              const isActive =
                activeCategory?.category_id === cat.category_id;

              return (
                <div
                  key={cat.category_id}
                  onMouseEnter={() => openCategorySlowly(cat)}
                  className="relative flex-1"
                >
                  <Link
                    to={`/category/${cat.slug}`}
                    className={`h-16 w-full px-7 flex items-center justify-center text-center text-[15px] font-medium tracking-normal transition cursor-pointer ${
                      isActive
                        ? "bg-white text-black font-semibold relative z-10"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    {cat.category_name}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {activeCategory && subCategories.length > 0 && (
        <div className="absolute left-0 right-0 -mt-px top-full z-999" onClick={closeCategoryMenu}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white border border-gray-300 border-t-0 shadow-lg min-h-45 p-10">
              <div className="grid grid-cols-4 gap-x-12 gap-y-6">
                {subCategories.map((sub) => (
                  <Link
                    key={sub.category_id}
                    to={`/subcategory/${sub.slug}`}
                    className="cursor-pointer text-[15px] font-medium text-gray-900 hover:text-black"
                  >
                    {sub.category_name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}