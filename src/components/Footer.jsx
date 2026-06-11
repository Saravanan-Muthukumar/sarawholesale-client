import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function Footer() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="bg-[#062b63] text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <img
              src="/logo.png"
              alt="SARA Wholesale Supplies"
              className="h-14 mb-4"
            />

            <p className="text-sm text-blue-100 leading-6">
              Quality packaging supplies and business essentials for retail and
              wholesale customers across the UK.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">Shop</h3>

            <ul className="space-y-2 text-sm text-blue-100">
              <li>
                <Link to="/" className="hover:text-white">
                  All Products
                </Link>
              </li>

              {categories.slice(0, 6).map((category) => (
                <li key={category.category_id}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="hover:text-white"
                  >
                    {category.category_name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Customer Service</h3>

            <ul className="space-y-2 text-sm text-blue-100">
              <li>
                <Link to="/contact" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/delivery-information" className="hover:text-white">
                  Delivery Information
                </Link>
              </li>
              <li>
                <Link to="/returns-policy" className="hover:text-white">
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Get in Touch</h3>

            <div className="space-y-3 text-sm text-blue-100">
              <p className="flex items-center gap-2">
                <Phone size={16} />
                0121 123 4567
              </p>

              <p className="flex items-center gap-2">
                <Mail size={16} />
                info@sarawholesalesupplies.co.uk
              </p>

              <p>
                Monday - Friday
                <br />
                9:00am - 5:00pm
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-500/30 mt-8 pt-5">
          <p className="text-center text-sm text-blue-100">
            © 2026 SARA Wholesale Supplies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}