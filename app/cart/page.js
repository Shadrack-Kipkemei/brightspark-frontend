"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

export default function CartPage() {
  const {
    cartItems,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">

          <div className="text-7xl">
            🛒
          </div>

          <h1 className="mt-6 text-3xl font-bold text-[#02337D]">
            Your Cart is Empty
          </h1>

          <p className="mt-3 text-gray-600">
            You haven't added any products to your cart yet.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-block rounded-xl bg-[#FE7401] px-7 py-3 font-semibold text-white hover:bg-[#D85F00]"
          >
            Browse Products
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">

          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-[#FE7401]">
              Shopping Cart
            </p>

            <h1 className="mt-2 text-4xl font-bold text-[#02337D]">
              Your Cart
            </h1>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="text-sm font-semibold text-red-600 hover:underline"
          >
            Clear Cart
          </button>

        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* Cart Items */}
          <div className="space-y-4">

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                  {/* Image */}
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-5xl">
                    {item.icon}
                  </div>

                  {/* Information */}
                  <div className="flex-1">

                    <p className="text-sm text-[#FE7401]">
                      {item.category}
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-[#172033]">
                      {item.name}
                    </h2>

                    <p className="mt-2 font-semibold text-[#02337D]">
                      KSh {item.price.toLocaleString()}
                    </p>

                  </div>

                  {/* Quantity */}
                  <div className="flex items-center rounded-lg border border-gray-300">

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity - 1
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center hover:bg-gray-100"
                    >
                      −
                    </button>

                    <span className="flex h-10 w-12 items-center justify-center border-x border-gray-300 font-semibold">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity + 1
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>

                  </div>

                  {/* Total */}
                  <div className="text-right">

                    <p className="text-sm text-gray-500">
                      Total
                    </p>

                    <p className="font-bold text-[#02337D]">
                      KSh{" "}
                      {(
                        item.price * item.quantity
                      ).toLocaleString()}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                      className="mt-2 text-xs font-semibold text-red-600 hover:underline"
                    >
                      Remove
                    </button>

                  </div>

                </div>

              </div>
            ))}

          </div>

          {/* Summary */}
          <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-[#02337D]">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4">

              <div className="flex justify-between text-gray-600">
                <span>
                  Subtotal
                </span>

                <span className="font-semibold text-gray-900">
                  KSh {cartSubtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>
                  Delivery
                </span>

                <span className="font-semibold text-gray-900">
                  To be calculated
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">

                <div className="flex justify-between">

                  <span className="text-lg font-bold text-[#172033]">
                    Total
                  </span>

                  <span className="text-xl font-bold text-[#02337D]">
                    KSh {cartSubtotal.toLocaleString()}
                  </span>

                </div>

              </div>

            </div>

            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-[#FE7401] py-4 font-semibold text-white transition hover:bg-[#D85F00]"
            >
              Proceed to Checkout
            </button>

            <Link
              href="/products"
              className="mt-4 block text-center text-sm font-semibold text-[#02337D] hover:underline"
            >
              Continue Shopping
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}