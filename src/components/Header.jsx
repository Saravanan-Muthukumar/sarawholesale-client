import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Menu,
  ShoppingCart,
  User,
  Truck,
  Phone,
  X,
  Home,
  ClipboardList,
  Lock,
  LogOut,
  Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import AdvancedSearchBar from "./AdvancedSearchBar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [itemAddedMessage, setItemAddedMessage] = useState(false);
  const [categories, setCategories] = useState([]);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [hideMobileLogo, setHideMobileLogo] = useState(false);

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
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setHideMobileLogo(window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleItemAdded() {
      setCartPreviewOpen(true);
      setItemAddedMessage(true);

      setTimeout(() => {
        setItemAddedMessage(false);
      }, 2500);
    }

    window.addEventListener("cart:item-added", handleItemAdded);
    window.addEventListener("cart-updated", handleItemAdded);

    return () => {
      window.removeEventListener("cart:item-added", handleItemAdded);
      window.removeEventListener("cart-updated", handleItemAdded);
    };
  }, []);

  const parentCategories = categories.filter((cat) => !cat.parent_category_id);

  const subCategories = selectedCategory
    ? categories.filter(
        (cat) => cat.parent_category_id === selectedCategory.category_id
      )
    : [];

  const closeMenus = () => {
    setUserMenuOpen(false);
    setMenuOpen(false);
    setSelectedCategory(null);
    setCartPreviewOpen(false);
    setMobileSearchOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeMenus();
    navigate("/login");
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
      {/* TOP DELIVERY BAR */}
      <div className="bg-[#062b63] text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Truck size={16} /> Next Day Delivery - Order by 1pm
          </span>

          <span className="hidden md:flex items-center gap-2">
            <Truck size={16} /> Free Delivery over £20
          </span>

          <Link to="/contact" className="flex items-center gap-2">
            <Phone size={15} /> Contact Us
          </Link>
        </div>
      </div>

      {/* DESKTOP HEADER */}
      <div className="hidden md:block max-w-7xl mx-auto px-4">
        <div className="h-24 flex items-center justify-between gap-6">
        <Link
          to="/"
          state={{ resetHero: true }}
          onClick={closeMenus}
          className="shrink-0"
        >
            <img
              src="/logo.png"
              alt="SARA Wholesale"
              className="h-16 w-auto"
            />
          </Link>

          {!isAuthPage && (
            <div className="flex-1 max-w-xl">
              <AdvancedSearchBar />
            </div>
          )}

          <div className="flex items-center gap-5">
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
                  className="flex items-center gap-2 font-semibold text-[#062b63]"
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

            <Link
              to="/cart"
              onClick={closeMenus}
              className="relative flex items-center gap-2 text-[#071b3a] font-semibold hover:text-green-700 transition"
            >
              <div className="relative">
                <ShoppingCart size={24} />

                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-1 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {cartItemCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE HEADER */}
      <div
        className="md:hidden sticky top-0 z-[9998] bg-white border-b border-gray-200 shadow-sm"
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setMobileSearchOpen(false);
          }
        }}
      >
        {!hideMobileLogo && (
          <div className="flex items-center justify-center py-3 border-b border-gray-100">
          <Link
              to="/"
              state={{ resetHero: true }}
              onClick={closeMenus}
            >
              <img
                src="/logo.png"
                alt="SARA Wholesale"
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>
        )}

        {!isAuthPage && (
          <>
            <div className="grid grid-cols-4 h-[62px] text-[#00539f]">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="flex flex-col items-center justify-center border-r border-gray-200"
              >
                <Menu size={24} />
                <span className="text-[10px] font-semibold mt-1">Browse</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileSearchOpen((prev) => !prev)}
                className="flex flex-col items-center justify-center border-r border-gray-200"
              >
                <Search size={24} />
                <span className="text-[10px] font-semibold mt-1">Search</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  isLoggedIn
                    ? setUserMenuOpen((prev) => !prev)
                    : navigate("/login", { state: { from: location.pathname } })
                }
                className="relative flex flex-col items-center justify-center border-r border-gray-200"
              >
                <User size={24} />
                <span className="text-[10px] font-semibold mt-1">Account</span>

                {isLoggedIn && userMenuOpen && (
                  <MobileUserDropdown
                    onClose={() => setUserMenuOpen(false)}
                    onLogout={handleLogout}
                  />
                )}
              </button>

              <Link
                to="/cart"
                onClick={closeMenus}
                className="flex flex-col items-center justify-center relative"
              >
                <div className="relative">
                  <ShoppingCart size={24} />

                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-1 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                      {cartItemCount}
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-semibold mt-1">Cart</span>
              </Link>
            </div>

            {mobileSearchOpen && (
              <div className="px-3 pb-3 border-t border-gray-200">
                <div className="pt-3">
                  <AdvancedSearchBar />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* STICKY MOBILE MENU AFTER SCROLL */}
{!isAuthPage && hideMobileLogo && (
  <div
    className="md:hidden fixed top-0 left-0 right-0 z-[9998] bg-white border-b border-gray-200 shadow-sm"
    onBlur={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setMobileSearchOpen(false);
      }
    }}
  >
    <div className="grid grid-cols-4 h-[62px] text-[#00539f]">
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="flex flex-col items-center justify-center border-r border-gray-200"
      >
        <Menu size={24} />
        <span className="text-[10px] font-semibold mt-1">Browse</span>
      </button>

      <button
        type="button"
        onClick={() => setMobileSearchOpen((prev) => !prev)}
        className="flex flex-col items-center justify-center border-r border-gray-200"
      >
        <Search size={24} />
        <span className="text-[10px] font-semibold mt-1">Search</span>
      </button>

      <button
        type="button"
        onClick={() =>
          isLoggedIn
            ? setUserMenuOpen((prev) => !prev)
            : navigate("/login", { state: { from: location.pathname } })
        }
        className="relative flex flex-col items-center justify-center border-r border-gray-200"
      >
        <User size={24} />
        <span className="text-[10px] font-semibold mt-1">Account</span>

        {isLoggedIn && userMenuOpen && (
          <MobileUserDropdown
            onClose={() => setUserMenuOpen(false)}
            onLogout={handleLogout}
          />
        )}
      </button>

      <Link
        to="/cart"
        onClick={closeMenus}
        className="flex flex-col items-center justify-center relative"
      >
        <div className="relative">
          <ShoppingCart size={24} />

          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-1 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {cartItemCount}
            </span>
          )}
        </div>

        <span className="text-[10px] font-semibold mt-1">Cart</span>
      </Link>
    </div>

    {mobileSearchOpen && (
      <div className="px-3 pb-3 border-t border-gray-200 bg-white">
        <div className="pt-3">
          <AdvancedSearchBar />
        </div>
      </div>
    )}
  </div>
)}

      {cartPreviewOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-4">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <button
              type="button"
              onClick={() => {
                setCartPreviewOpen(false);
                setItemAddedMessage(false);
              }}
              className="absolute top-4 right-4 text-[#071b3a] hover:text-red-600"
              aria-label="Close"
            >
              <X size={26} />
            </button>

            <div className="text-center pt-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
                <span className="text-green-700 text-5xl leading-none">✓</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-[#071b3a]">
                Item Added to Cart!
              </h3>

              <p className="text-sm md:text-base text-[#071b3a]/70 mt-2">
                The item has been added to your cart.
              </p>
            </div>

            <div className="border-t border-gray-200 my-6" />

            {cartItems.length > 0 && (
              <div className="flex gap-4 items-center">
                {cartItems[0]?.image_url ? (
                  <img
                    src={
                      cartItems[0].image_url.startsWith("http")
                        ? cartItems[0].image_url
                        : `${API_URL}${cartItems[0].image_url}`
                    }
                    alt={cartItems[0]?.product_name}
                    className="w-24 h-24 md:w-32 md:h-32 object-contain shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-xl shrink-0" />
                )}

                <div className="flex-1">
                  <h4 className="font-bold text-[#071b3a] text-sm md:text-lg leading-snug">
                    {cartItems[0]?.product_name}
                  </h4>

                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Quantity: {cartItems[0]?.quantity || 1}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link
                to="/cart"
                onClick={closeMenus}
                className="h-12 border border-green-700 text-green-700 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-50"
              >
                <ShoppingCart size={18} />
                View Cart
              </Link>

              <Link
                to="/checkout"
                onClick={closeMenus}
                className="h-12 bg-green-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-800"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">
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
    <div className="absolute right-0 top-14 w-[300px] max-w-[calc(100vw-24px)] bg-white border border-[#edf1f7] rounded-2xl shadow-2xl z-[9999]">
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