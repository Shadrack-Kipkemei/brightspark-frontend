"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { useCart } from "@/components/cart/CartContext";

function formatPrice(value) {
  return `KSh ${Number(value || 0).toLocaleString(
    "en-KE",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-10 text-center shadow-sm">
          <ShoppingBag className="mx-auto mb-5 h-16 w-16 text-gray-400" />

          <h1 className="mb-3 text-2xl font-bold text-gray-900">
            Your Cart Is Empty
          </h1>

          <p className="mb-7 text-gray-600">
            Browse our products and add something
            to your cart.
          </p>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            <ArrowLeft className="h-5 w-5" />
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/products"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">
            Your Cart
          </h1>

          <p className="mt-1 text-gray-600">
            Review your selected products before
            checkout.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Cart Items */}
          <div className="space-y-4">
            {cartItems.map((item) => {
              const price =
                Number(item.price) || 0;

              const quantity =
                Number(item.quantity) || 1;

              const itemSubtotal =
                price * quantity;

              const image =
                item.image_url ||
                item.image ||
                null;

              const branchName =
                item.branch_name ||
                "Branch not selected";

              const branchLocation =
                item.branch_location || "";

              return (
                <div
                  key={`${item.id}-${item.branch_id || "no-branch"}`}
                  className="rounded-2xl bg-white p-4 shadow-sm md:p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row">
                    {/* Image */}
                    <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 sm:h-32 sm:w-32">
                      {image ? (
                        <img
                          src={image}
                          alt={item.name}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <ShoppingBag className="h-10 w-10 text-gray-400" />
                      )}
                    </div>

                    {/* Product information */}
                    <div className="flex-1">
                      <div className="flex flex-col justify-between gap-3 md:flex-row">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">
                            {item.name}
                          </h2>

                          {item.sku && (
                            <p className="mt-1 text-xs text-gray-500">
                              SKU: {item.sku}
                            </p>
                          )}

                          {/* Branch */}
                          <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                              Pickup / Sale Branch
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                              {branchName}
                            </p>

                            {branchLocation && (
                              <p className="text-sm text-gray-600">
                                {branchLocation}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              item.id,
                              item.branch_id ||
                                null
                            )
                          }
                          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>

                      <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        {/* Quantity */}
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Quantity
                          </p>

                          <div className="flex w-fit items-center overflow-hidden rounded-lg border border-gray-300">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  Math.max(
                                    1,
                                    quantity - 1
                                  ),
                                  item.branch_id ||
                                    null
                                )
                              }
                              disabled={quantity <= 1}
                              className="px-3 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <span className="min-w-[48px] border-x border-gray-300 px-3 py-2 text-center font-semibold">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  quantity + 1,
                                  item.branch_id ||
                                    null
                                )
                              }
                              className="px-3 py-2 hover:bg-gray-100"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-gray-500">
                            {formatPrice(price)} each
                          </p>

                          <p className="mt-1 text-xl font-bold text-gray-900">
                            {formatPrice(
                              itemSubtotal
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="my-6 border-t border-gray-200 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  Subtotal
                </span>

                <span className="font-semibold text-gray-900">
                  {formatPrice(cartSubtotal)}
                </span>
              </div>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                Final order details and payment
                options will be confirmed during
                checkout.
              </p>
            </div>

            <Link
              href="/checkout"
              className="block w-full rounded-xl bg-blue-700 px-6 py-4 text-center font-semibold text-white transition hover:bg-blue-800"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/products"
              className="mt-3 block w-full rounded-xl border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}