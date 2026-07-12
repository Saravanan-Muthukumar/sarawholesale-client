import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isLoggedIn, authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
const [discountPercent, setDiscountPercent] = useState(0);

  const mergeGuestCartToUserCart = async () => {
    const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
  
    if (!guestCart.length) return;
  
    for (const item of guestCart) {
      await fetch(`${API_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          product_id: item.product_id,
          quantity: item.quantity || 1,
          unit_price: item.unit_price || item.price || 0,
        }),
      });
    }
  
    localStorage.removeItem("guestCart");
  };
  
  const loadCart = async () => {
    if (authLoading) return;
  
    try {
      setCartLoading(true);
  
      if (isLoggedIn) {
        await mergeGuestCartToUserCart();
  
        const res = await fetch(`${API_URL}/api/cart`, {
          credentials: "include",
        });
  
        const data = await res.json();
  
        if (res.ok) {
          setCartItems(data.items || []);
          setVoucherCode(data.voucher_code || "");
          setDiscountPercent(Number(data.discount_percent || 0));
        } else {
          setCartItems([]);
          setVoucherCode("");
          setDiscountPercent(0);
        }
  
        return;
      }
  
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      setCartItems(guestCart);
    } catch (error) {
      console.error("Load cart error:", error);
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [isLoggedIn, authLoading]);

  const addToCart = async (product) => {
    if (isLoggedIn) {
      const res = await fetch(`${API_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          product_id: product.product_id,
          quantity: product.quantity || 1,
          unit_price: product.unit_price || product.price,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.message || "Failed to add to cart");
      }
  
      await loadCart();
  
      window.dispatchEvent(new Event("cart:item-added"));
  
      return data;
    }
  
    const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
  
    const existingItem = guestCart.find(
      (item) => item.product_id === product.product_id
    );
  
    if (existingItem) {
      existingItem.quantity += product.quantity || 1;
      existingItem.unit_price = product.unit_price || product.price;
    } else {
      guestCart.push({
        ...product,
        cart_item_id: product.product_id,
        quantity: product.quantity || 1,
        unit_price: product.unit_price || product.price,
      });
    }
  
    localStorage.setItem("guestCart", JSON.stringify(guestCart));
    setCartItems(guestCart);
  
    window.dispatchEvent(new Event("cart:item-added"));
  
    return {
      message: "Item added to cart",
    };
  };

  const updateCartItem = async (cartItemId, quantity) => {
    const cleanQuantity = Number(quantity);

    if (isLoggedIn) {
      const res = await fetch(`${API_URL}/api/cart/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          cart_item_id: cartItemId,
          quantity: cleanQuantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update cart");
      }

      await loadCart();
      return data;
    }

    let guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];

    if (cleanQuantity <= 0) {
      guestCart = guestCart.filter(
        (item) => Number(item.cart_item_id || item.product_id) !== Number(cartItemId)
      );
    } else {
      guestCart = guestCart.map((item) =>
        Number(item.cart_item_id || item.product_id) === Number(cartItemId)
          ? { ...item, quantity: cleanQuantity }
          : item
      );
    }

    localStorage.setItem("guestCart", JSON.stringify(guestCart));
    setCartItems(guestCart);

    return {
      message: "Cart updated",
    };
  };

  const removeCartItem = async (cartItemId) => {
    if (isLoggedIn) {
      const res = await fetch(`${API_URL}/api/cart/item/${cartItemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to remove item");
      }

      await loadCart();
      return data;
    }

    const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];

    const updatedCart = guestCart.filter(
      (item) => Number(item.cart_item_id || item.product_id) !== Number(cartItemId)
    );

    localStorage.setItem("guestCart", JSON.stringify(updatedCart));
    setCartItems(updatedCart);

    return {
      message: "Item removed from cart",
    };
  };

  const requestOrder = async () => {
    if (!isLoggedIn) {
      throw new Error("Please login to request order");
    }
  
    const res = await fetch(`${API_URL}/api/cart/request-order`, {
      method: "POST",
      credentials: "include",
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.message || "Failed to submit order request");
    }
  
    setCartItems([]);
    localStorage.removeItem("guestCart");
  
  
    return data;
  };

  const cartItemCount = cartItems.length;

  const cartSubtotal = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartItemCount,
        cartSubtotal,
        cartLoading,
        voucherCode,
        discountPercent,
        addToCart,
        updateCartItem,
        removeCartItem,
        requestOrder,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}