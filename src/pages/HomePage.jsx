import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import CategoryGrid from "../components/CategoryGrid";
import FeaturedProducts from "../components/FeaturedProducts";
import CategoryMenu from "../components/CategoryMenu";
import WhyChooseUs from "../components/WhyChooseUs";
import ShopByCollection from "../components/ShopByCollection";
import ShopByIndustry from "../components/ShopByIndustry";
import TopSearches from "../components/TopSearches";
import TradeAccountBanner from "../components/TradeAccountBanner";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showStickyMenu, setShowStickyMenu] = useState(false);
  const [heroHidden, setHeroHidden] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.hideHero) {
      setHeroHidden(true);

      setTimeout(() => {
        document.getElementById("home-category-grid")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } else {
      setHeroHidden(false);
    }
  }, [location.key]);

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
    <main className="bg-[#f3f4f6] min-h-screen">
      <Helmet>
        <title>SARA Wholesale Supplies | Packaging & Business Supplies UK</title>

        <meta
          name="description"
          content="Wholesale packaging supplies, tapes, gloves, stationery, painting supplies and business essentials across the UK. Bulk pricing and fast delivery."
        />

        <link rel="canonical" href="https://www.sarawholesale.co.uk/" />
      </Helmet>

      {!heroHidden && (
        <div className="hidden md:block bg-white border-b border-[#d9e2ef]">
          <CategoryMenu categories={categories} />
        </div>
      )}

      {showStickyMenu && (
        <div className="hidden md:block fixed top-0 left-0 right-0 z-999 bg-white border-b border-[#d9e2ef] shadow-md">
          <CategoryMenu categories={categories} sticky />
        </div>
      )}

      {/* {!heroHidden && (
        <div id="home-hero-section">
          <Hero onShopNow={handleShopNow} categories={categories} />
        </div>
      )} */}

      

      <section id="home-category-grid">
        <CategoryGrid categories={categories} />
      </section>
      <TopSearches />

      {/* <ShopByIndustry /> */}
      <WhyChooseUs />
      <FeaturedProducts products={products} />

      <ShopByCollection />

      <TradeAccountBanner />

      
    </main>
  );
}