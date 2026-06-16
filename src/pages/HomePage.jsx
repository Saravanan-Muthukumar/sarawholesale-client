import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import CategoryGrid from "../components/CategoryGrid";
import FeaturedProducts from "../components/FeaturedProducts";
import CategoryMenu from "../components/CategoryMenu";
import WhyChooseUs from "../components/WhyChooseUs";
import ShopByCollection from "../components/ShopByCollection";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showStickyMenu, setShowStickyMenu] = useState(false);
  const [heroHidden, setHeroHidden] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Category error:", err));

    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Product error:", err));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const categoryGrid = document.getElementById("home-category-grid");
      if (!categoryGrid) return;

      const categoryTop = categoryGrid.getBoundingClientRect().top;

      setShowStickyMenu(categoryTop <= 0);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShopNow = () => {
    setHeroHidden(true);

    setTimeout(() => {
      document
        .getElementById("home-category-grid")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <main className="bg-white min-h-screen">
      {!heroHidden && (
        <div className="hidden md:block">
          <CategoryMenu categories={categories} />
        </div>
      )}

      {showStickyMenu && (
        <div className="hidden md:block fixed top-0 left-0 right-0 z-[999] shadow-lg">
          <CategoryMenu categories={categories} sticky />
        </div>
      )}

      {!heroHidden && (
        <div id="home-hero-section">
          <Hero onShopNow={handleShopNow} />
        </div>
      )}

      <section id="home-category-grid" className="bg-[#f4f9ff]">
        <CategoryGrid categories={categories} />
      </section>

      <FeaturedProducts products={products} />

      <WhyChooseUs />

      <ShopByCollection />
    </main>
  );
}