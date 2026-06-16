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

  const parentCategories = categories.filter(
    (category) => !category.parent_category_id
  );

  return (
    <footer className="bg-[#062b63] text-white">
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
              {parentCategories.map((category) => (
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
              <li>
                <Link to="/cookie-policy" className="hover:text-white">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Get in Touch</h3>

            <div className="space-y-3 text-sm text-blue-100">
            <a
                href="tel:07424715150"
                className="flex items-center gap-2 hover:text-white transition"
              >
                <Phone size={16} />
                07424715150
              </a>

              <a
                href="mailto:sales@sarawholesale.co.uk"
                className="flex items-center gap-2 hover:text-white transition break-all"
              >
                <Mail size={16} />
                sales@sarawholesale.co.uk
              </a>

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
            © 2026 SARA Wholesale. All rights reserved.
          </p>

          <p className="text-center text-xs text-blue-200 mt-2">
            SAARAH ENTERPRISES LTD | Company No: 15920690
          </p>
        </div>
                
      </div>
    </footer>
  );
}