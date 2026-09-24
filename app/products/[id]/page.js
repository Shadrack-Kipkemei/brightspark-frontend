"use client";

import Link from "next/link";
import { use, useState } from "react";
import { products } from "@/lib/products";
import { useCart } from "@/components/cart/CartContext";

export default function ProductDetailsPage({ params }) {
  const { id } = use(params);

  const product = products.find(
    (item) => item.id === id
  );

  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-7xl text-center">

          <h1 className="text-3xl font-bold text-[#02337D]">
            Product Not Found
          </h1>

          <p className="mt-3 text-gray-600">
            The product you are looking for does not exist.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-block rounded-lg bg-[#02337D] px-6 py-3 font-semibold text-white"
          >
            Back to Products
          </Link>

        </div>
      </main>
    );
  }

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(current + 1, product.stock)
    );
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(current - 1, 1)
    );
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-gray-500">
          <Link
            href="/products"
            className="hover:text-[#02337D]"
          >
            Products
          </Link>

          <span className="mx-2">
            /
          </span>

          <span className="text-gray-700">
            {product.name}
          </span>
        </div>

        {/* Product */}
        <div className="grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-2">

          {/* Product Image */}
          <div className="flex min-h-[450px] items-center justify-center bg-gray-100 p-10">

            <div className="flex h-80 w-80 items-center justify-center rounded-2xl bg-gradient-to-br from-[#02337D] to-[#0b4da2] text-8xl">
              {product.icon}
            </div>

          </div>

          {/* Product Information */}
          <div className="p-8 lg:p-12">

            <span className="rounded-full bg-[#f4f7fc] px-4 py-2 text-sm font-semibold text-[#02337D]">
              {product.category}
            </span>

            <h1 className="mt-6 text-3xl font-bold text-[#172033] sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-5 leading-7 text-gray-600">
              {product.description}
            </p>

            {/* Price */}
            <div className="mt-8">
              <p className="text-sm text-gray-500">
                Price
              </p>

              <p className="text-3xl font-bold text-[#02337D]">
                KSh {product.price.toLocaleString()}
              </p>
            </div>

            {/* Stock */}
            <div className="mt-6">
              {product.stock > 0 ? (
                <p className="font-medium text-green-600">
                  ✓ {product.stock} available
                </p>
              ) : (
                <p className="font-medium text-red-600">
                  Out of stock
                </p>
              )}
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="mt-8">

                <p className="mb-3 font-semibold text-[#172033]">
                  Quantity
                </p>

                <div className="flex w-fit items-center overflow-hidden rounded-lg border border-gray-300">

                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    className="flex h-11 w-11 items-center justify-center text-xl hover:bg-gray-100"
                  >
                    −
                  </button>

                  <span className="flex h-11 w-14 items-center justify-center border-x border-gray-300 font-semibold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    className="flex h-11 w-11 items-center justify-center text-xl hover:bg-gray-100"
                  >
                    +
                  </button>

                </div>

              </div>
            )}

            {/* Add to Cart */}
            <div className="mt-8">

              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={handleAddToCart}
                className={`w-full rounded-xl py-4 font-semibold text-white transition ${
                  product.stock <= 0
                    ? "cursor-not-allowed bg-gray-400"
                    : added
                      ? "bg-green-600"
                      : "bg-[#FE7401] hover:bg-[#D85F00]"
                }`}
              >
                {product.stock <= 0
                  ? "Out of Stock"
                  : added
                    ? "✓ Added to Cart"
                    : "Add to Cart"}
              </button>

            </div>

            {/* Continue Shopping */}
            <Link
              href="/products"
              className="mt-4 block text-center font-medium text-[#02337D] hover:underline"
            >
              ← Continue Shopping
            </Link>

          </div>

        </div>

      </div>
    </main>
  );
}