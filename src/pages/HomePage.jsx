import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import CategoryGrid from "../components/CategoryGrid";
import FeaturedProducts from "../components/FeaturedProducts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Category error:", err));

    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Product error:", err));
  }, []);

  return (
    <main className="bg-gray-50 h-full">
      <CategoryGrid categories={categories} />
      <Hero />
      <FeaturedProducts products={products} />
    </main>
  );
}