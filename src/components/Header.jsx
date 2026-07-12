import { useEffect, useRef, useState } from "react";
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
  Check,
} from "lucide-react";

import CategoryMenu from "./CategoryMenu";
import AdvancedSearchBar from "./AdvancedSearchBar";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:9000";

const BRAND = {
  red: "#D90416",
  redHover: "#B00012",
  black: "#171717",
  text: "#374151",
  muted: "#6B7280",
  page: "#F5F5F5",
  border: "#E5E7EB",
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [hideMobileLogo, setHideMobileLogo] = useState(false);
  const [cartHoverOpen, setCartHoverOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, isLoggedIn, logout } = useAuth();
  const cartContext = useCart();

  const userMenuRef = useRef(null);
  const userHoverTimer = useRef(null);
  const cartHoverTimer = useRef(null);

  const isCartPage = location.pathname === "/cart";
  const isCheckoutPage = location.pathname === "/checkout";
  const disableCartDropdown = isCartPage || isCheckoutPage;

  const cartItemCount = cartContext.cartItemCount || 0;
  const cartItems =
    cartContext.cartItems || cartContext.items || [];

  const isAdmin =
    String(user?.role || "").toLowerCase() === "admin";

  const parentCategories = categories.filter(
    (category) => !category.parent_category_id
  );

  const subCategories = selectedCategory
    ? categories.filter(
        (category) =>
          category.parent_category_id ===
          selectedCategory.category_id
      )
    : [];

  const displayName =
    user?.first_name ||
    user?.full_name?.split(" ")[0] ||
    "Account";

  const fullName =
    user?.first_name || user?.last_name
      ? `${user?.first_name || ""} ${
          user?.last_name || ""
        }`.trim()
      : user?.full_name || "";

  const openUserMenuSlowly = () => {
    clearTimeout(userHoverTimer.current);

    userHoverTimer.current = setTimeout(() => {
      setUserMenuOpen(true);
    }, 100);
  };

  const closeUserMenuSlowly = () => {
    clearTimeout(userHoverTimer.current);

    userHoverTimer.current = setTimeout(() => {
      setUserMenuOpen(false);
    }, 120);
  };

  const openCartSlowly = () => {
    if (disableCartDropdown) return;

    clearTimeout(cartHoverTimer.current);

    cartHoverTimer.current = setTimeout(() => {
      setCartHoverOpen(true);
    }, 100);
  };

  const closeCartSlowly = () => {
    clearTimeout(cartHoverTimer.current);

    cartHoverTimer.current = setTimeout(() => {
      setCartHoverOpen(false);
    }, 120);
  };

  const closeMenus = () => {
    setMenuOpen(false);
    setSelectedCategory(null);
    setUserMenuOpen(false);
    setCartHoverOpen(false);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 768) return;

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((response) => response.json())
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setHideMobileLogo(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  useEffect(() => {
    const handleItemAdded = () => {
      setCartPreviewOpen(true);
    };

    window.addEventListener(
      "cart:item-added",
      handleItemAdded
    );

    return () => {
      window.removeEventListener(
        "cart:item-added",
        handleItemAdded
      );
    };
  }, []);

  return (
    <>
      <header className="relative z-[999] bg-white">
        {/* TOP DELIVERY BAR */}
        <div className="bg-[#D90416] text-white">
          <div className="mx-auto max-w-7xl px-3 md:px-4">
            {/* Mobile */}
            <div className="flex h-8 items-center justify-between text-[11px] font-semibold md:hidden">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Truck size={13} />
                Nationwide delivery
              </span>

              <Link
                to="/contact"
                className="flex items-center gap-1.5 whitespace-nowrap transition-opacity hover:opacity-85"
              >
                <Phone size={13} />
                0724 715150
              </Link>
            </div>

            {/* Desktop */}
            <div className="hidden h-9 items-center justify-between text-sm font-medium md:flex">
              <span className="flex items-center gap-2">
                <Truck size={16} />
                Next working day delivery available
              </span>

              <span className="flex items-center gap-2">
                <Truck size={16} />
                Free delivery on orders over £40
              </span>

              <Link
                to="/contact"
                className="flex items-center gap-2 transition-opacity hover:opacity-85"
              >
                <Phone size={15} />
                Order online or call 0724 715150
              </Link>
            </div>
          </div>
        </div>

        {/* DESKTOP MAIN HEADER */}
        <div className="hidden border-b border-[#E5E7EB] bg-white md:block">
          <div className="mx-auto flex h-20 max-w-7xl items-center gap-7 px-4">
            <Link
              to="/"
              state={{ resetHero: true }}
              onClick={closeMenus}
              className="shrink-0"
              aria-label="SARA Wholesale homepage"
            >
              <img
                src="/logo.png"
                alt="SARA Wholesale"
                className="h-14 w-auto object-contain"
              />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="mx-auto max-w-2xl">
                <AdvancedSearchBar />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {isAdmin && (
                <div className="mr-2 flex items-center gap-1">
                  <AdminLink
                    to="/admin/categories"
                    onClick={closeMenus}
                  >
                    Categories
                  </AdminLink>

                  <AdminLink
                    to="/admin/products"
                    onClick={closeMenus}
                  >
                    Products
                  </AdminLink>

                  <AdminLink
                    to="/admin/flyer-builder"
                    onClick={closeMenus}
                  >
                    Flyer
                  </AdminLink>
                </div>
              )}

              {isLoggedIn ? (
                <div
                  ref={userMenuRef}
                  className="relative z-[10001]"
                  onMouseEnter={openUserMenuSlowly}
                  onMouseLeave={closeUserMenuSlowly}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setUserMenuOpen((previous) => !previous)
                    }
                    className={`flex h-14 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${
                      userMenuOpen
                        ? "bg-[#F5F5F5] text-[#D90416]"
                        : "text-[#171717] hover:bg-[#F5F5F5] hover:text-[#D90416]"
                    }`}
                  >
                    <User size={21} />
                    <span>{displayName}</span>
                  </button>

                  {userMenuOpen && (
                    <UserDropdown
                      user={user}
                      fullName={fullName}
                      onLogout={handleLogout}
                      onClose={() =>
                        setUserMenuOpen(false)
                      }
                    />
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  state={{ from: location.pathname }}
                  onClick={closeMenus}
                  className="flex h-14 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-[#171717] transition-colors hover:bg-[#F5F5F5] hover:text-[#D90416]"
                >
                  <User size={21} />
                  <span>Login</span>
                </Link>
              )}

              <div
                className="relative z-[10000]"
                onMouseEnter={openCartSlowly}
                onMouseLeave={closeCartSlowly}
              >
                <Link
                  to="/cart"
                  onClick={closeMenus}
                  className={`flex h-14 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${
                    cartHoverOpen
                      ? "bg-[#F5F5F5] text-[#D90416]"
                      : "text-[#171717] hover:bg-[#F5F5F5] hover:text-[#D90416]"
                  }`}
                >
                  <div className="relative">
                    <ShoppingCart size={23} />

                    {cartItemCount > 0 && (
                      <span className="absolute -right-3 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#D90416] px-1 text-[10px] font-bold leading-none text-white">
                        {cartItemCount}
                      </span>
                    )}
                  </div>

                  <span>Cart</span>
                </Link>

                {!disableCartDropdown &&
                  cartHoverOpen && (
                    <CartDropdown
                      cartItems={cartItems}
                      onClose={() =>
                        setCartHoverOpen(false)
                      }
                    />
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE HEADER */}
        <div
          className="sticky top-0 z-[9998] border-b border-[#E5E7EB] bg-white shadow-sm md:hidden"
          onBlur={(event) => {
            if (
              !event.currentTarget.contains(
                event.relatedTarget
              )
            ) {
              setMobileSearchOpen(false);
            }
          }}
        >
          {!hideMobileLogo && (
            <div className="flex items-center justify-center border-b border-[#E5E7EB] py-3">
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

          <MobileActionBar
            cartItemCount={cartItemCount}
            isLoggedIn={isLoggedIn}
            menuOpen={menuOpen}
            mobileSearchOpen={mobileSearchOpen}
            userMenuOpen={userMenuOpen}
            location={location}
            navigate={navigate}
            onMenuOpen={() => setMenuOpen(true)}
            onSearchToggle={() =>
              setMobileSearchOpen(
                (previous) => !previous
              )
            }
            onUserToggle={() => {
              if (isLoggedIn) {
                setUserMenuOpen(
                  (previous) => !previous
                );
              } else {
                navigate("/login", {
                  state: {
                    from: location.pathname,
                  },
                });
              }
            }}
            onClose={closeMenus}
          />

          {mobileSearchOpen && (
            <div className="border-t border-[#E5E7EB] bg-white px-3 pb-3">
              <div className="pt-3">
                <AdvancedSearchBar />
              </div>
            </div>
          )}
        </div>

        {/* FIXED MOBILE BAR AFTER SCROLL */}
        {hideMobileLogo && (
          <div className="fixed left-0 right-0 top-0 z-[9998] border-b border-[#E5E7EB] bg-white shadow-sm md:hidden">
            <MobileActionBar
              cartItemCount={cartItemCount}
              isLoggedIn={isLoggedIn}
              menuOpen={menuOpen}
              mobileSearchOpen={mobileSearchOpen}
              userMenuOpen={userMenuOpen}
              location={location}
              navigate={navigate}
              onMenuOpen={() => setMenuOpen(true)}
              onSearchToggle={() =>
                setMobileSearchOpen(
                  (previous) => !previous
                )
              }
              onUserToggle={() => {
                if (isLoggedIn) {
                  setUserMenuOpen(
                    (previous) => !previous
                  );
                } else {
                  navigate("/login", {
                    state: {
                      from: location.pathname,
                    },
                  });
                }
              }}
              onClose={closeMenus}
            />

            {mobileSearchOpen && (
              <div className="border-t border-[#E5E7EB] bg-white px-3 pb-3">
                <div className="pt-3">
                  <AdvancedSearchBar />
                </div>
              </div>
            )}
          </div>
        )}

        {/* MOBILE ACCOUNT DROPDOWN */}
        {isLoggedIn && userMenuOpen && (
          <div className="fixed inset-0 z-[100000] md:hidden">
            <button
              type="button"
              onClick={() =>
                setUserMenuOpen(false)
              }
              className="absolute inset-0 bg-black/25"
              aria-label="Close account menu"
            />

            <div
              className={`absolute right-0 w-[280px] overflow-hidden rounded-bl-xl border-b border-l border-[#E5E7EB] bg-white shadow-xl ${
                hideMobileLogo
                  ? "top-[62px]"
                  : "top-[147px]"
              }`}
            >
              <MobileUserDropdown
                onClose={() =>
                  setUserMenuOpen(false)
                }
                onLogout={handleLogout}
              />
            </div>
          </div>
        )}

        {/* MOBILE CATEGORY DRAWER */}
        {menuOpen && (
          <div className="fixed inset-0 z-[100000] md:hidden">
            <button
              type="button"
              onClick={closeMenus}
              className="absolute inset-0 bg-black/35"
              aria-label="Close menu"
            />

            <nav className="relative h-full w-[88%] max-w-sm overflow-y-auto bg-[#F5F5F5] shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#E5E7EB] bg-white px-4 py-4">
                {selectedCategory ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedCategory(null)
                    }
                    className="rounded-md p-1 text-[#171717] transition-colors hover:bg-[#F5F5F5] hover:text-[#D90416]"
                    aria-label="Back to categories"
                  >
                    <ArrowLeft size={22} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={closeMenus}
                    className="rounded-md p-1 text-[#171717] transition-colors hover:bg-[#F5F5F5] hover:text-[#D90416]"
                    aria-label="Close menu"
                  >
                    <X size={22} />
                  </button>
                )}

                <h2 className="text-base font-bold text-[#171717]">
                  {selectedCategory
                    ? selectedCategory.category_name
                    : "Shop by category"}
                </h2>
              </div>

              <div className="p-4">
                {!selectedCategory && (
                  <div className="grid grid-cols-2 gap-3">
                    {parentCategories.map(
                      (category) => (
                        <button
                          key={
                            category.category_id
                          }
                          type="button"
                          onClick={() =>
                            setSelectedCategory(
                              category
                            )
                          }
                          className="min-h-20 rounded-lg border border-[#E5E7EB] bg-white p-3 text-left text-sm font-semibold text-[#171717] shadow-sm transition-colors hover:border-[#D90416] hover:text-[#D90416]"
                        >
                          {category.category_name}
                        </button>
                      )
                    )}
                  </div>
                )}

                {selectedCategory && (
                  <>
                    {subCategories.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {subCategories.map(
                          (subcategory) => (
                            <button
                              key={
                                subcategory.category_id
                              }
                              type="button"
                              onClick={() =>
                                handleSubCategoryClick(
                                  subcategory.slug
                                )
                              }
                              className="min-h-20 rounded-lg border border-[#E5E7EB] bg-white p-3 text-left text-sm font-semibold text-[#171717] shadow-sm transition-colors hover:border-[#D90416] hover:text-[#D90416]"
                            >
                              {
                                subcategory.category_name
                              }
                            </button>
                          )
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleSubCategoryClick(
                            selectedCategory.slug
                          )
                        }
                        className="w-full rounded-lg bg-[#D90416] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#B00012]"
                      >
                        View products
                      </button>
                    )}
                  </>
                )}

                {isAdmin &&
                  !selectedCategory && (
                    <div className="mt-5 space-y-2 border-t border-[#E5E7EB] pt-5">
                      <Link
                        to="/admin/categories"
                        onClick={closeMenus}
                        className="block rounded-lg bg-white px-4 py-3 text-sm font-semibold text-[#171717] transition-colors hover:text-[#D90416]"
                      >
                        Admin Categories
                      </Link>

                      <Link
                        to="/admin/products"
                        onClick={closeMenus}
                        className="block rounded-lg bg-white px-4 py-3 text-sm font-semibold text-[#171717] transition-colors hover:text-[#D90416]"
                      >
                        Admin Products
                      </Link>
                    </div>
                  )}
              </div>
            </nav>
          </div>
        )}

        {/* ITEM ADDED MODAL */}
        {cartPreviewOpen && (
          <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/45 px-4">
            <div className="relative w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl">
              <button
                type="button"
                onClick={() =>
                  setCartPreviewOpen(false)
                }
                className="absolute right-4 top-4 z-10 rounded-full p-2 text-[#171717] transition-colors hover:bg-[#F5F5F5] hover:text-[#D90416]"
                aria-label="Close"
              >
                <X size={23} />
              </button>

              <div className="p-6 md:p-8">
                <div className="pt-3 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <Check size={34} strokeWidth={3} />
                  </div>

                  <h3 className="text-2xl font-bold text-[#171717]">
                    Item added to cart
                  </h3>

                  <p className="mt-2 text-sm text-[#6B7280]">
                    Your item has been added
                    successfully.
                  </p>
                </div>

                {cartItems.length > 0 && (
                  <div className="my-6 flex items-center gap-4 border-y border-[#E5E7EB] py-5">
                    {cartItems[0]?.image_url ? (
                      <img
                        src={
                          cartItems[0].image_url.startsWith(
                            "http"
                          )
                            ? cartItems[0].image_url
                            : `${API_URL}${cartItems[0].image_url}`
                        }
                        alt={
                          cartItems[0]?.product_name
                        }
                        className="h-24 w-24 shrink-0 object-contain md:h-28 md:w-28"
                      />
                    ) : (
                      <div className="h-24 w-24 shrink-0 rounded-lg bg-[#F5F5F5] md:h-28 md:w-28" />
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold leading-snug text-[#171717] md:text-base">
                        {
                          cartItems[0]
                            ?.product_name
                        }
                      </h4>

                      <p className="mt-2 text-sm text-[#6B7280]">
                        Quantity:{" "}
                        {cartItems[0]?.quantity ||
                          1}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Link
                    to="/cart"
                    onClick={closeMenus}
                    className="flex h-12 items-center justify-center gap-2 rounded-lg border border-[#171717] bg-white text-sm font-bold text-[#171717] transition-colors hover:bg-[#171717] hover:text-white"
                  >
                    <ShoppingCart size={18} />
                    View cart
                  </Link>

                  <Link
                    to="/checkout"
                    onClick={closeMenus}
                    className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#D90416] text-sm font-bold text-white transition-colors hover:bg-[#B00012]"
                  >
                    Proceed to checkout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* DESKTOP CATEGORY NAVIGATION */}
      <div className="sticky top-0 z-50 hidden border-b border-[#E5E7EB] bg-white md:block">
        <CategoryMenu
          categories={categories}
          sticky
        />
      </div>
    </>
  );
}

function AdminLink({
  to,
  onClick,
  children,
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="rounded-md px-3 py-2 text-sm font-semibold text-[#171717] transition-colors hover:bg-[#F5F5F5] hover:text-[#D90416]"
    >
      {children}
    </Link>
  );
}

function MobileActionBar({
  cartItemCount,
  isLoggedIn,
  menuOpen,
  mobileSearchOpen,
  userMenuOpen,
  onMenuOpen,
  onSearchToggle,
  onUserToggle,
  onClose,
}) {
  return (
    <div className="grid h-[62px] grid-cols-4 bg-white">
      <MobileActionButton
        label="Browse"
        active={menuOpen}
        onClick={onMenuOpen}
        border
      >
        <Menu size={23} />
      </MobileActionButton>

      <MobileActionButton
        label="Search"
        active={mobileSearchOpen}
        onClick={onSearchToggle}
        border
      >
        <Search size={23} />
      </MobileActionButton>

      <MobileActionButton
        label={isLoggedIn ? "Account" : "Login"}
        active={userMenuOpen}
        onClick={onUserToggle}
        border
      >
        <User size={23} />
      </MobileActionButton>

      <Link
        to="/cart"
        onClick={onClose}
        className="relative flex flex-col items-center justify-center gap-1 text-[#171717] transition-colors hover:bg-[#F5F5F5] hover:text-[#D90416]"
      >
        <div className="relative">
          <ShoppingCart size={23} />

          {cartItemCount > 0 && (
            <span className="absolute -right-3 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#D90416] px-1 text-[10px] font-bold leading-none text-white">
              {cartItemCount}
            </span>
          )}
        </div>

        <span className="text-[10px] font-semibold">
          Cart
        </span>
      </Link>
    </div>
  );
}

function MobileActionButton({
  label,
  active,
  onClick,
  border,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 transition-colors ${
        border
          ? "border-r border-[#E5E7EB]"
          : ""
      } ${
        active
          ? "bg-[#F5F5F5] text-[#D90416]"
          : "text-[#171717] hover:bg-[#F5F5F5] hover:text-[#D90416]"
      }`}
    >
      {children}

      <span className="text-[10px] font-semibold">
        {label}
      </span>
    </button>
  );
}

function CartDropdown({
  cartItems,
  onClose,
}) {
  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.quantity || 0) *
        Number(item.unit_price || 0),
    0
  );

  return (
    <div className="absolute right-0 top-full mt-1 w-80 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
        <h3 className="font-bold text-[#171717]">
          Your cart
        </h3>

        <span className="text-xs font-medium text-[#6B7280]">
          {cartItems.length}{" "}
          {cartItems.length === 1
            ? "item"
            : "items"}
        </span>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <ShoppingCart
              size={30}
              className="mx-auto text-[#9CA3AF]"
            />

            <p className="mt-3 text-sm text-[#6B7280]">
              Your cart is empty
            </p>
          </div>
        ) : (
          cartItems.slice(0, 5).map((item) => (
            <div
              key={
                item.cart_item_id ||
                item.product_id
              }
              className="flex gap-3 border-b border-[#E5E7EB] p-4 last:border-b-0"
            >
              {item.image_url ? (
                <img
                  src={
                    item.image_url.startsWith(
                      "http"
                    )
                      ? item.image_url
                      : `${API_URL}${item.image_url}`
                  }
                  alt={item.product_name}
                  className="h-14 w-14 shrink-0 rounded-md object-contain"
                />
              ) : (
                <div className="h-14 w-14 shrink-0 rounded-md bg-[#F5F5F5]" />
              )}

              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#171717]">
                  {item.product_name}
                </p>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xs text-[#6B7280]">
                    Qty: {item.quantity}
                  </p>

                  <p className="text-sm font-bold text-[#171717]">
                    £
                    {(
                      Number(
                        item.quantity || 0
                      ) *
                      Number(
                        item.unit_price || 0
                      )
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-[#E5E7EB] bg-[#FAFAFA] p-4">
        <div className="mb-4 flex items-center justify-between font-bold text-[#171717]">
          <span>Subtotal</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>

        <Link
          to="/cart"
          onClick={onClose}
          className="flex h-11 w-full items-center justify-center rounded-lg bg-[#D90416] text-sm font-bold text-white transition-colors hover:bg-[#B00012]"
        >
          View cart
        </Link>
      </div>
    </div>
  );
}

function UserDropdown({
  user,
  fullName,
  onLogout,
  onClose,
}) {
  return (
    <div className="absolute right-0 top-full mt-1 w-72 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-xl">
      <div className="border-b border-[#E5E7EB] px-4 py-4">
        <p className="text-sm font-bold text-[#171717]">
          {fullName || "My account"}
        </p>

        <p className="mt-1 truncate text-xs text-[#6B7280]">
          {user?.email}
        </p>
      </div>

      <div className="py-2">
        <DropdownLink
          to="/account"
          onClick={onClose}
        >
          My Account
        </DropdownLink>

        <DropdownLink
          to="/account/orders"
          onClick={onClose}
        >
          My Orders
        </DropdownLink>

        <DropdownLink
          to="/account/details"
          onClick={onClose}
        >
          Customer Details
        </DropdownLink>

        <DropdownLink
          to="/account/change-password"
          onClick={onClose}
        >
          Change Password
        </DropdownLink>
      </div>

      <div className="border-t border-[#E5E7EB] p-2">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-md px-3 py-2.5 text-left text-sm font-semibold text-[#D90416] transition-colors hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function DropdownLink({
  to,
  onClick,
  children,
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-4 py-2.5 text-sm text-[#374151] transition-colors hover:bg-[#F5F5F5] hover:text-[#D90416]"
    >
      {children}
    </Link>
  );
}

function MobileUserDropdown({
  onClose,
  onLogout,
}) {
  return (
    <div className="py-2">
      <MobileDropdownLink
        to="/account"
        onClick={onClose}
        icon={<Home size={18} />}
      >
        Dashboard
      </MobileDropdownLink>

      <MobileDropdownLink
        to="/account/orders"
        onClick={onClose}
        icon={<ClipboardList size={18} />}
      >
        My Orders
      </MobileDropdownLink>

      <MobileDropdownLink
        to="/account/details"
        onClick={onClose}
        icon={<User size={18} />}
      >
        Customer Details
      </MobileDropdownLink>

      <MobileDropdownLink
        to="/account/change-password"
        onClick={onClose}
        icon={<Lock size={18} />}
      >
        Change Password
      </MobileDropdownLink>

      <div className="my-2 border-t border-[#E5E7EB]" />

      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-[#D90416] transition-colors hover:bg-red-50"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}

function MobileDropdownLink({
  to,
  onClick,
  icon,
  children,
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 text-sm text-[#374151] transition-colors hover:bg-[#F5F5F5] hover:text-[#D90416]"
    >
      {icon}
      {children}
    </Link>
  );
}