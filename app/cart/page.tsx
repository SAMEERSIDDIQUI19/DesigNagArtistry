"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPrimaryThumbnail } from "@/lib/thumbnail-utils";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    isOnSale: boolean;
    thumbnail: string | null;
    stock: number;
  };
  variant?: {
    id: string;
    size: string | null;
    color: string | null;
  };
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate or get session ID for guest users
  const getSessionId = () => {
    let sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      localStorage.setItem("session_id", sessionId);
    }
    return sessionId;
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const sessionId = getSessionId();
      const response = await fetch("/api/cart", {
        headers: {
          "x-session-id": sessionId,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
        sessionStorage.setItem('cart_items', JSON.stringify(data));
        const totalQty = data.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
        window.dispatchEvent(new CustomEvent('cartUpdate', { detail: { count: totalQty } }));
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQty: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;
    const clamped = Math.max(1, Math.min(newQty, item.product.stock));
    if (clamped === item.quantity) return;

    const previous = cartItems;
    const updated = cartItems.map((i) => (i.id === itemId ? { ...i, quantity: clamped } : i));
    setCartItems(updated);
    sessionStorage.setItem('cart_items', JSON.stringify(updated));

    try {
      const sessionId = getSessionId();
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({ quantity: clamped }),
      });

      if (response.ok) {
        const delta = clamped - item.quantity;
        window.dispatchEvent(new CustomEvent('cartUpdate', { detail: { delta } }));
      } else {
        setCartItems(previous);
        sessionStorage.setItem('cart_items', JSON.stringify(previous));
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      setCartItems(previous);
      sessionStorage.setItem('cart_items', JSON.stringify(previous));
    }
  };

  const removeItem = async (itemId: string, productName: string, productImage?: string) => {
    const removedItem = cartItems.find((i) => i.id === itemId);
    const removedQty = removedItem?.quantity ?? 1;
    const afterRemove = cartItems.filter((item) => item.id !== itemId);
    setCartItems(afterRemove);
    sessionStorage.setItem('cart_items', JSON.stringify(afterRemove));
    window.dispatchEvent(new CustomEvent("showToast", { detail: { message: `"${productName}" has been removed from your cart`, image: productImage, type: "error" } }));

    try {
      const sessionId = getSessionId();
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
        headers: {
          "x-session-id": sessionId,
        },
      });

      if (response.ok) {
        window.dispatchEvent(new CustomEvent('cartUpdate', { detail: { delta: -removedQty } }));
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const displayPrice = (item: CartItem) => {
    const product = item.product;
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const salePrice = product.salePrice ? (typeof product.salePrice === 'string' ? parseFloat(product.salePrice) : product.salePrice) : null;

    if (product.isOnSale && salePrice) {
      return salePrice;
    }
    return price;
  };

  const getProductImage = (product: CartItem['product']): string => {
    if (product.thumbnail) {
      return getPrimaryThumbnail(product.thumbnail) || '/images/placeholder.jpg';
    }
    return '/images/placeholder.jpg';
  };

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + displayPrice(item) * item.quantity;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link
              href="/shop"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md p-3 sm:p-6 flex items-start sm:items-center gap-3 sm:gap-4"
                >
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 rounded-lg flex-shrink-0">
                    {getProductImage(item.product) ? (
                      <img
                        src={getProductImage(item.product)}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 rounded-lg">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {item.product.name}
                    </Link>
                    {item.variant && (
                      <p className="text-sm text-gray-500">
                        {item.variant.size && `Size: ${item.variant.size}`}
                        {item.variant.size && item.variant.color && " | "}
                        {item.variant.color && `Color: ${item.variant.color}`}
                      </p>
                    )}
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      Rs. {displayPrice(item).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold text-gray-900">
                      Rs. {(displayPrice(item) * item.quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-medium"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-gray-900 border-x border-gray-300">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-medium"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    {item.quantity >= item.product.stock && (
                      <p className="text-xs text-amber-600">Max stock reached</p>
                    )}
                    <button
                      onClick={() => removeItem(item.id, item.product.name, getProductImage(item.product) || undefined)}
                      className="text-red-600 hover:text-red-800 text-xs mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">Calculated at checkout</span>
                  </div>
                  <hr />
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">
                      Rs. {subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/shop"
                  className="block w-full mt-4 text-center text-blue-600 hover:text-blue-800"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
