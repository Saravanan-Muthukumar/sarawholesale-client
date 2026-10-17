import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";
const CartContext = createContext(null);
const GUEST_KEY = "guestCart";

function readGuestCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    const byVariant = new Map();
    for (const item of stored) {
      const id = Number(item?.variant_id);
      const qty = Number(item?.quantity);
      if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(qty) || qty <= 0) continue;
      byVariant.set(id, (byVariant.get(id) || 0) + qty);
    }
    return [...byVariant].map(([variant_id, quantity]) => ({ variant_id, quantity }));
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
}

async function readResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Cart request failed (${res.status})`);
  return data;
}

export function CartProvider({ children }) {
  const { isLoggedIn, authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  const mergeGuestCartToUserCart = async () => {
    const guestCart = readGuestCart();
    if (!guestCart.length) return;

    // Remove each successfully merged item individually, so failures don't lose data.
    for (const item of guestCart) {
      const res = await fetch(`${API_URL}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ variant_id: item.variant_id, quantity: item.quantity }),
      });
      await readResponse(res);
      saveGuestCart(readGuestCart().filter((entry) => entry.variant_id !== item.variant_id));
    }
  };

  const loadCart = async () => {
    if (authLoading) return;
    setCartLoading(true);
    try {
      if (isLoggedIn) {
        try {
          await mergeGuestCartToUserCart();
        } catch (error) {
          // Keep unmerged items in localStorage so they can be retried.
          console.error("Guest cart merge error:", error);
        }
        const res = await fetch(`${API_URL}/api/cart`, { credentials: "include" });
        const data = await readResponse(res);
        setCartItems(Array.isArray(data.items) ? data.items : []);
        setVoucherCode(data.voucher_code || "");
        setDiscountPercent(Number(data.discount_percent || 0));
      } else {
        const guestCart = readGuestCart();
        setVoucherCode("");
        setDiscountPercent(0);
        if (!guestCart.length) {
          setCartItems([]);
        } else {
          const res = await fetch(`${API_URL}/api/cart/guest-details`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: guestCart }),
          });
          const data = await readResponse(res);
          setCartItems(Array.isArray(data.items) ? data.items : []);
        }
      }
    } catch (error) {
      console.error("Load cart error:", error);
      // Do not display unverified prices or discard saved guest selections.
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [isLoggedIn, authLoading]);

  const addToCart = async (product) => {
    const variant_id = Number(product?.variant_id);
    const quantity = Number(product?.quantity ?? 1);
    if (!Number.isSafeInteger(variant_id) || variant_id <= 0 ||
        !Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new Error("A valid variant and quantity are required");
    }

    if (isLoggedIn) {
      const res = await fetch(`${API_URL}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ variant_id, quantity }),
      });
      const data = await readResponse(res);
      await loadCart();
      window.dispatchEvent(new Event("cart:item-added"));
      return data;
    }

    const guestCart = readGuestCart();
    const existing = guestCart.find((item) => item.variant_id === variant_id);
    const nextQuantity = (existing?.quantity || 0) + quantity;
    // Validate price/stock with the backend before saving.
    const res = await fetch(`${API_URL}/api/cart/guest-details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ variant_id, quantity: nextQuantity }] }),
    });
    const data = await readResponse(res);
    const verified = data.items?.find((item) => Number(item.variant_id) === variant_id);
    if (!verified) throw new Error("This product variant is unavailable");
    if (!verified.available) throw new Error(`Only ${verified.stock_qty} available or no valid price for this quantity`);

    if (existing) existing.quantity = nextQuantity;
    else guestCart.push({ variant_id, quantity });
    saveGuestCart(guestCart);
    await loadCart();
    window.dispatchEvent(new Event("cart:item-added"));
    return { message: "Item added to cart" };
  };

  const updateCartItem = async (cartItemId, quantity) => {
    const cleanQuantity = Number(quantity);
    if (!Number.isSafeInteger(cleanQuantity)) throw new Error("Invalid quantity");
    if (isLoggedIn) {
      const res = await fetch(`${API_URL}/api/cart/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cart_item_id: cartItemId, quantity: cleanQuantity }),
      });
      const data = await readResponse(res);
      await loadCart();
      return data;
    }

    const id = Number(cartItemId);
    const guestCart = readGuestCart();
    const existing = guestCart.find((item) => item.variant_id === id);
    if (!existing) throw new Error("Cart item not found");
    if (cleanQuantity > 0) {
      const res = await fetch(`${API_URL}/api/cart/guest-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ variant_id: id, quantity: cleanQuantity }] }),
      });
      const data = await readResponse(res);
      const verified = data.items?.find((item) => Number(item.variant_id) === id);
      if (!verified?.available) throw new Error(`Only ${verified?.stock_qty ?? 0} available or no valid price`);
      existing.quantity = cleanQuantity;
      saveGuestCart(guestCart);
    } else {
      saveGuestCart(guestCart.filter((item) => item.variant_id !== id));
    }
    await loadCart();
    return { message: "Cart updated" };
  };

  const removeCartItem = async (cartItemId) => {
    if (isLoggedIn) {
      const res = await fetch(`${API_URL}/api/cart/item/${cartItemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await readResponse(res);
      await loadCart();
      return data;
    }
    saveGuestCart(readGuestCart().filter((item) => item.variant_id !== Number(cartItemId)));
    await loadCart();
    return { message: "Item removed from cart" };
  };

  const requestOrder = async (checkoutData = {}) => {
    if (!isLoggedIn) throw new Error("Please log in to submit an order");
    const response = await fetch(`${API_URL}/api/orders/request`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkoutData),
    });
    const data = await readResponse(response);
    await loadCart();
    return data;
  };

  const cartItemCount = cartItems.length;
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
    0
  );

  return (
    <CartContext.Provider value={{
      cartItems, cartItemCount, cartSubtotal, cartLoading,
      voucherCode, discountPercent, addToCart, updateCartItem,
      removeCartItem, requestOrder, loadCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
