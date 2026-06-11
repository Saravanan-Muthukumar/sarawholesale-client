import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, ShoppingCart, User, Truck, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, isLoggedIn, logout } = useAuth();
  const { cartItemCount } = useCart();

  const isAdmin = String(user?.role).toLowerCase() === "admin";

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/verify-email";

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];

    return products
      .filter(
        (product) =>
          product.product_name?.toLowerCase().includes(q) ||
          product.sku?.toLowerCase().includes(q) ||
          product.category_name?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [searchTerm, products]);

  const closeMenus = () => {
    setUserMenuOpen(false);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeMenus();
    navigate("/login");
  };

  const handleProductClick = (product) => {
    setSearchTerm("");
    closeMenus();

    if (product.category_slug) {
      navigate(`/category/${product.category_slug}`);
    } else {
      navigate("/");
    }
  };

  const displayName =
    user?.first_name || user?.full_name?.split(" ")[0] || "Account";

  const fullName =
    user?.first_name || user?.last_name
      ? `${user?.first_name || ""} ${user?.last_name || ""}`.trim()
      : user?.full_name || "";

  return (
    <header className="bg-white">
      <div className="bg-[#062b63] text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Truck size={16} /> Next Day Delivery - Order by 1pm
          </span>

          <span className="hidden md:flex items-center gap-2">
            <Truck size={16} /> Free Delivery over £50
          </span>

          <Link to="/contact" className="flex items-center gap-2">
            <Phone size={15} /> Contact Us
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="h-24 flex items-center justify-between gap-6">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-[#062b63] cursor-pointer"
            type="button"
          >
            <Menu size={28} />
          </button>

          <Link
            to="/"
            onClick={closeMenus}
            className={`shrink-0 ${isAuthPage ? "hidden md:block" : ""}`}
          >
            <img
              src="/logo.png"
              alt="SARA Wholesale Supplies"
              className="h-16 w-auto"
            />
          </Link>

          {!isAuthPage && (
            <div className="hidden md:block flex-1 max-w-2xl relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products, categories, SKU..."
                className="w-full h-12 border border-gray-300 rounded-lg px-5 pr-12 outline-none focus:border-green-600"
              />

              <Search
                size={22}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#062b63]"
              />

              {searchTerm && (
                <SearchDropdown
                  results={searchResults}
                  onProductClick={handleProductClick}
                />
              )}
            </div>
          )}

          <div className="hidden md:flex items-center gap-5">
            {isAdmin && (
              <>
                <Link
                  to="/admin/categories"
                  onClick={closeMenus}
                  className="font-semibold text-[#062b63] hover:text-green-700"
                >
                  Categories
                </Link>

                <Link
                  to="/admin/products"
                  onClick={closeMenus}
                  className="font-semibold text-[#062b63] hover:text-green-700"
                >
                  Products
                </Link>
              </>
            )}

            {isLoggedIn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 font-semibold text-[#062b63] cursor-pointer"
                >
                  <User size={20} />
                  <span>{displayName}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-9 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="font-bold text-[#071b3a] text-sm">
                        {fullName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>

                    <Link
                      to="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#071b3a] hover:bg-gray-50"
                    >
                      My Account
                    </Link>

                    <Link
                      to="/account/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#071b3a] hover:bg-gray-50"
                    >
                      My Orders
                    </Link>

                    <Link
                      to="/account/details"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#071b3a] hover:bg-gray-50"
                    >
                      Customer Details
                    </Link>

                    <Link
                      to="/account/change-password"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#071b3a] hover:bg-gray-50"
                    >
                      Change Password
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 font-semibold hover:bg-red-50 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeMenus}
                className="flex items-center gap-2 font-semibold text-[#062b63]"
              >
                <User size={20} />
                Login
              </Link>
            )}

            <Link
              to="/cart"
              onClick={closeMenus}
              className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-800"
            >
              <ShoppingCart size={20} />
              Cart ({cartItemCount})
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-4">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="text-[#062b63] cursor-pointer"
              >
                <User size={23} />
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeMenus}
                className="text-[#062b63] font-semibold"
              >
                Login
              </Link>
            )}

            <Link
              to="/cart"
              onClick={closeMenus}
              className="flex items-center gap-2 text-green-700 font-semibold"
            >
              <ShoppingCart size={24} />
              Cart ({cartItemCount})
            </Link>
          </div>
        </div>

        {!isAuthPage && (
          <div className="md:hidden pb-4 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products, categories, SKU..."
              className="w-full h-11 border border-gray-300 rounded-lg px-4 pr-11 outline-none focus:border-green-600"
            />

            <Search
              size={20}
              className="absolute right-4 top-5.5 -translate-y-1/2 text-[#062b63]"
            />

            {searchTerm && (
              <SearchDropdown
                results={searchResults}
                onProductClick={handleProductClick}
              />
            )}
          </div>
        )}
      </div>

      {menuOpen && (
        <nav className="md:hidden bg-white border-t px-4 py-4 space-y-4 font-semibold text-[#062b63]">
          <Link onClick={closeMenus} to="/" className="block">
            Home
          </Link>

          {isAdmin && (
            <>
              <Link
                onClick={closeMenus}
                to="/admin/categories"
                className="block text-green-700"
              >
                Admin Categories
              </Link>

              <Link
                onClick={closeMenus}
                to="/admin/products"
                className="block text-green-700"
              >
                Admin Products
              </Link>
            </>
          )}

          {isLoggedIn && (
            <>
              <Link onClick={closeMenus} to="/account" className="block">
                My Account
              </Link>

              <Link onClick={closeMenus} to="/account/orders" className="block">
                My Orders
              </Link>
            </>
          )}

          <Link onClick={closeMenus} to="/contact" className="block">
            Contact Us
          </Link>

          {!isLoggedIn && (
            <Link onClick={closeMenus} to="/login" className="block">
              Login
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}

function SearchDropdown({ results, onProductClick }) {
  return (
    <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
      {results.length ? (
        results.map((product) => (
          <button
            key={product.product_id}
            type="button"
            onClick={() => onProductClick(product)}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
          >
            <p className="text-sm font-bold text-[#071b3a]">
              {product.product_name}
            </p>

            <p className="text-xs text-gray-500 mt-0.5">
              {product.category_name || "Category"} · SKU:{" "}
              {product.sku || "N/A"}
            </p>
          </button>
        ))
      ) : (
        <div className="px-4 py-3 text-sm text-gray-500">No products found</div>
      )}
    </div>
  );
}