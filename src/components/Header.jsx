import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Menu,
  Search,
  ShoppingCart,
  User,
  Truck,
  Phone,
  X,
  Home,
  ClipboardList,
  Lock,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, isLoggedIn, logout } = useAuth();
  const cartContext = useCart();

  const cartItemCount = cartContext.cartItemCount || 0;
  const cartItems = cartContext.cartItems || cartContext.items || [];

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

    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const parentCategories = categories.filter((cat) => !cat.parent_category_id);

  const subCategories = selectedCategory
    ? categories.filter(
        (cat) => cat.parent_category_id === selectedCategory.category_id
      )
    : [];

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
    setSelectedCategory(null);
    setCartPreviewOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeMenus();
    navigate("/login");
  };

  const handleProductClick = (product) => {
    setSearchTerm("");
    closeMenus();

    if (product.slug) {
      navigate(`/product/${product.slug}`);
    } else if (product.category_slug) {
      navigate(`/subcategory/${product.category_slug}`);
    } else {
      navigate("/");
    }
  };

  const handleSubCategoryClick = (slug) => {
    closeMenus();
    navigate(`/subcategory/${slug}`);
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
            onClick={() => setMenuOpen(true)}
            className="md:hidden text-[#062b63] cursor-pointer"
            type="button"
            aria-label="Open categories"
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
                  <UserDropdown
                    user={user}
                    fullName={fullName}
                    onLogout={handleLogout}
                    onClose={() => setUserMenuOpen(false)}
                  />
                )}
              </div>
            ) : (
              <Link
                to="/login"
                state={{ from: location.pathname }}
                onClick={closeMenus}
                className="flex items-center gap-2 font-semibold text-[#062b63]"
              >
                <User size={20} />
                Login
              </Link>
            )}

            <div
              className="relative"
              onMouseEnter={() => setCartPreviewOpen(true)}
              onMouseLeave={() => setCartPreviewOpen(false)}
            >
              <Link
                to="/cart"
                onClick={closeMenus}
                className="relative flex items-center gap-2 text-[#071b3a] font-semibold hover:text-green-700 transition"
              >
                <div className="relative">
                  <ShoppingCart size={24} />

                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-3 min-w-4.5 h-4.5 px-1 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </Link>

              {cartPreviewOpen && (
                <div className="absolute right-0 top-9 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-[#071b3a] text-sm">
                      Order Summary
                    </h3>
                  </div>

                  {cartItemCount > 0 ? (
                    <>
                      <div className="max-h-72 overflow-y-auto">
                        {cartItems.length > 0 ? (
                          cartItems.slice(0, 5).map((item) => (
                            <div
                              key={item.cart_item_id || item.product_id}
                              className="p-3 border-b border-gray-100"
                            >
                              <p className="text-sm font-semibold text-[#071b3a] line-clamp-2">
                                {item.product_name}
                              </p>

                              <p className="text-xs text-gray-500 mt-1">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-gray-600">
                            You have {cartItemCount} item
                            {cartItemCount > 1 ? "s" : ""} in your cart.
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <Link
                          to="/cart"
                          onClick={closeMenus}
                          className="block text-center bg-green-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-800"
                        >
                          View Cart
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-sm text-gray-500">
                      Your cart is empty.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  isLoggedIn
                    ? setUserMenuOpen((prev) => !prev)
                    : navigate("/login", {
                        state: { from: location.pathname },
                      })
                }
                className={`w-10 h-10 rounded-full flex items-center justify-center text-[#062b63] ${
                  userMenuOpen ? "bg-green-50" : ""
                }`}
                aria-label="Account"
              >
                <User size={23} />
              </button>

              {isLoggedIn && userMenuOpen && (
                <MobileUserDropdown
                  onClose={() => setUserMenuOpen(false)}
                  onLogout={handleLogout}
                />
              )}
            </div>

            <Link
              to="/cart"
              onClick={closeMenus}
              className="relative flex items-center gap-1 text-green-700 font-semibold text-sm"
            >
              <div className="relative">
                <ShoppingCart size={23} />

                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-3 min-w-4.5 h-4.5 px-1 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {cartItemCount}
                  </span>
                )}
              </div>
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
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            onClick={closeMenus}
            className="absolute inset-0 bg-black/30"
            aria-label="Close menu"
          />

          <nav className="relative w-[86%] max-w-sm h-full bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#edf1f7] px-4 py-4 flex items-center gap-3">
              {selectedCategory ? (
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="text-[#062b63]"
                  aria-label="Back to categories"
                >
                  <ArrowLeft size={22} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={closeMenus}
                  className="text-[#062b63]"
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              )}

              <h2 className="font-bold text-[#071b3a]">
                {selectedCategory
                  ? selectedCategory.category_name
                  : "Categories"}
              </h2>
            </div>

            <div className="p-4">
              {!selectedCategory && (
                <div className="grid grid-cols-2 gap-3">
                  {parentCategories.map((cat) => (
                    <button
                      key={cat.category_id}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className="min-h-20 bg-white border border-[#edf1f7] rounded-xl p-3 text-left text-sm font-bold text-[#071b3a] hover:bg-[#f8fafc]"
                    >
                      {cat.category_name}
                    </button>
                  ))}
                </div>
              )}

              {selectedCategory && (
                <>
                  {subCategories.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {subCategories.map((sub) => (
                        <button
                          key={sub.category_id}
                          type="button"
                          onClick={() => handleSubCategoryClick(sub.slug)}
                          className="min-h-20 bg-white border border-[#edf1f7] rounded-xl p-3 text-left text-sm font-bold text-[#071b3a] hover:bg-[#f8fafc]"
                        >
                          {sub.category_name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleSubCategoryClick(selectedCategory.slug)
                      }
                      className="w-full bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 font-bold text-sm"
                    >
                      View Products
                    </button>
                  )}
                </>
              )}

              {isAdmin && !selectedCategory && (
                <div className="mt-5 pt-5 border-t border-[#edf1f7] space-y-3">
                  <Link
                    onClick={closeMenus}
                    to="/admin/categories"
                    className="block text-green-700 font-bold"
                  >
                    Admin Categories
                  </Link>

                  <Link
                    onClick={closeMenus}
                    to="/admin/products"
                    className="block text-green-700 font-bold"
                  >
                    Admin Products
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function UserDropdown({ user, fullName, onLogout, onClose }) {
  return (
    <div className="absolute right-0 top-9 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
      <div className="px-4 py-2 border-b">
        <p className="font-bold text-[#071b3a] text-sm">{fullName}</p>
        <p className="text-xs text-gray-500">{user?.email}</p>
      </div>

      <Link
        to="/account"
        onClick={onClose}
        className="block px-4 py-2 text-sm text-[#071b3a] hover:bg-gray-50"
      >
        My Account
      </Link>

      <Link
        to="/account/orders"
        onClick={onClose}
        className="block px-4 py-2 text-sm text-[#071b3a] hover:bg-gray-50"
      >
        My Orders
      </Link>

      <Link
        to="/account/details"
        onClick={onClose}
        className="block px-4 py-2 text-sm text-[#071b3a] hover:bg-gray-50"
      >
        Customer Details
      </Link>

      <Link
        to="/account/change-password"
        onClick={onClose}
        className="block px-4 py-2 text-sm text-[#071b3a] hover:bg-gray-50"
      >
        Change Password
      </Link>

      <button
        type="button"
        onClick={onLogout}
        className="w-full text-left px-4 py-2 text-sm text-red-600 font-semibold hover:bg-red-50 cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
}

function MobileUserDropdown({ onClose, onLogout }) {
  return (
    <div className="absolute right-0 top-12 w-79.5 max-w-[calc(100vw-24px)] bg-white border border-[#edf1f7] rounded-2xl shadow-2xl z-50">
      <div className="px-6 pt-6 pb-3">
        <h3 className="text-2xl font-bold text-[#071b3a]">My Account</h3>
      </div>

      <div className="px-3 pb-3">
        <Link
          to="/account"
          onClick={onClose}
          className="flex items-center gap-5 px-5 py-4 rounded-xl text-[#071b3a] text-base font-semibold"
        >
          <Home size={22} strokeWidth={2} />
          Dashboard
        </Link>

        <Link
          to="/account/orders"
          onClick={onClose}
          className="flex items-center gap-5 px-5 py-4 rounded-xl bg-green-50 text-green-700 text-base font-semibold"
        >
          <ClipboardList size={22} strokeWidth={2} />
          My Orders
        </Link>

        <Link
          to="/account/details"
          onClick={onClose}
          className="flex items-center gap-5 px-5 py-4 rounded-xl text-[#071b3a] text-base font-semibold"
        >
          <User size={22} strokeWidth={2} />
          Customer Details
        </Link>

        <Link
          to="/account/change-password"
          onClick={onClose}
          className="flex items-center gap-5 px-5 py-4 rounded-xl text-[#071b3a] text-base font-semibold"
        >
          <Lock size={22} strokeWidth={2} />
          Change Password
        </Link>

        <div className="border-t border-[#edf1f7] my-2" />

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-5 px-5 py-4 rounded-xl text-left text-[#071b3a] text-base font-semibold cursor-pointer"
        >
          <LogOut size={22} strokeWidth={2} />
          Logout
        </button>
      </div>
    </div>
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
        <div className="px-4 py-3 text-sm text-gray-500">
          No products found
        </div>
      )}
    </div>
  );
}