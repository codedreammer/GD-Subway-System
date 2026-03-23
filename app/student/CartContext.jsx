"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [vendorId, setVendorId] = useState(null);

  const addToCart = (item, newVendorId) => {
    if (vendorId && vendorId !== newVendorId && cartItems.length > 0) {
      if (confirm("Adding items from a different vendor will clear your current cart. Proceed?")) {
        setCartItems([{ ...item, quantity: 1 }]);
        setVendorId(newVendorId);
      }
      return;
    }

    setVendorId(newVendorId);
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
    if (cartItems.length === 1 && cartItems[0].id === itemId) setVendorId(null);
  };

  const updateQuantity = (itemId, delta) => {
    setCartItems(prev => {
      const updated = prev.map(i => {
        if (i.id === itemId) {
          const newQ = i.quantity + delta;
          return { ...i, quantity: Math.max(0, newQ) };
        }
        return i;
      }).filter(i => i.quantity > 0);
      
      if (updated.length === 0) setVendorId(null);
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setVendorId(null);
  };

  return (
    <CartContext.Provider value={{ cartItems, vendorId, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
