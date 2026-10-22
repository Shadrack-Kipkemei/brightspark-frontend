"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "brightspark-cart";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  /*
   * This tells us whether the cart has already been
   * loaded from localStorage.
   *
   * We MUST NOT save the initial [] value before
   * localStorage has been checked.
   */
  const [cartLoaded, setCartLoaded] = useState(false);

  /*
   * Load the existing cart from localStorage.
   *
   * This runs once when the browser loads.
   */
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(
        CART_STORAGE_KEY
      );

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load cart from localStorage:",
        error
      );
    } finally {
      /*
       * Only after loading do we allow the cart
       * to start saving changes.
       */
      setCartLoaded(true);
    }
  }, []);

  /*
   * Save the cart whenever it changes.
   *
   * IMPORTANT:
   * We wait until cartLoaded === true.
   */
  useEffect(() => {
    if (!cartLoaded) {
      return;
    }

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error(
        "Failed to save cart to localStorage:",
        error
      );
    }
  }, [cartItems, cartLoaded]);

  /*
   * Add a product to the cart.
   *
   * A product + branch combination is treated as
   * one unique cart item.
   */
  const addToCart = (
    product,
    quantity = 1
  ) => {
    if (!product?.id) {
      console.error(
        "Cannot add product without an ID."
      );
      return;
    }

    const safeQuantity = Math.max(
      1,
      Number(quantity) || 1
    );

    const branchId =
      product.branch_id ||
      product.selected_branch_id ||
      null;

    setCartItems((currentItems) => {
      const existingIndex =
        currentItems.findIndex(
          (item) =>
            item.id === product.id &&
            (item.branch_id || null) === branchId
        );

      /*
       * Product does not yet exist in this branch.
       */
      if (existingIndex === -1) {
        return [
          ...currentItems,
          {
            ...product,

            quantity: safeQuantity,

            branch_id: branchId,

            branch_name:
              product.branch_name || null,

            branch_location:
              product.branch_location || null,
          },
        ];
      }

      /*
       * Product already exists for this branch.
       * Increase the existing quantity.
       */
      return currentItems.map(
        (item, index) => {
          if (index !== existingIndex) {
            return item;
          }

          return {
            ...item,
            quantity:
              (Number(item.quantity) || 0) +
              safeQuantity,
          };
        }
      );
    });
  };

  /*
   * Remove a product from the cart.
   *
   * Product + branch are used to identify the item.
   */
  const removeFromCart = (
    productId,
    branchId = null
  ) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(
            item.id === productId &&
            (item.branch_id || null) ===
              branchId
          )
      )
    );
  };

  /*
   * Update quantity for a specific product
   * at a specific branch.
   */
  const updateQuantity = (
    productId,
    quantity,
    branchId = null
  ) => {
    const safeQuantity = Math.max(
      1,
      Number(quantity) || 1
    );

    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (
          item.id === productId &&
          (item.branch_id || null) ===
            branchId
        ) {
          return {
            ...item,
            quantity: safeQuantity,
          };
        }

        return item;
      })
    );
  };

  /*
   * Remove everything from the cart.
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /*
   * Number of products in the cart.
   */
  const cartCount = cartItems.reduce(
    (total, item) =>
      total + (Number(item.quantity) || 0),
    0
  );

  /*
   * Total cart value.
   */
  const cartSubtotal = cartItems.reduce(
    (total, item) => {
      const price =
        Number(item.price) || 0;

      const quantity =
        Number(item.quantity) || 0;

      return total + price * quantity;
    },
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside a CartProvider"
    );
  }

  return context;
}