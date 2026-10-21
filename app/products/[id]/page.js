
"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { ImageOff, Package, RefreshCw } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { getProductById } from "@/services/productService";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:5000/api";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function getImageUrl(product) {
  const image = product?.image_url || product?.image;

  if (!image) return null;

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `${API_ORIGIN}/${image.replace(/^\/+/, "")}`;
}

function formatPrice(price) {
  return Number(price).toLocaleString("en-KE", {
    maximumFractionDigits: 2,
  });
}

export default function ProductDetailsPage({ params }) {
  const { id } = use(params);

  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    setError("");
    setProduct(null);
    setQuantity(1);

    try {
      const response = await getProductById(id);

      if (!response?.success || !response?.product) {
        throw new Error(
          response?.message || "Product details could not be loaded."
        );
      }

      if (response.product.is_active === false) {
        setError("This product is currently unavailable.");
        return;
      }

      setProduct(response.product);
    } catch (err) {
      console.error("Failed to load product:", err);

      setError(
        err.message || "Unable to load this product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  if (loading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-gray-50 px-4"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#02337D]" />
          <p className="mt-4 font-medium text-gray-700">
            Loading product details...
          </p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />

          <h1 className="mt-4 text-3xl font-bold text-[#02337D]">
            {error.includes("unavailable")
              ? "Product Unavailable"
              : "Unable to Load Product"}
          </h1>

          <p className="mt-3 text-gray-600">
            {error || "The product you are looking for could not be found."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={loadProduct}
              className="inline-flex items-center gap-2 rounded-lg bg-[#02337D] px-5 py-3 font-semibold text-white hover:bg-[#01265C]"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>

            <Link
              href="/products"
              className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const imageUrl = getImageUrl(product);

  // Price and stock are optional because the current public
  // product API does not yet return these values.
  const hasPrice =
    product.price !== undefined &&
    product.price !== null &&
    product.price !== "" &&
    Number.isFinite(Number(product.price));

  const hasStock =
    product.stock !== undefined &&
    product.stock !== null &&
    product.stock !== "" &&
    Number.isFinite(Number(product.stock));

  const price = hasPrice ? Number(product.price) : null;
  const stock = hasStock ? Number(product.stock) : null;

  const canOrder =
    hasPrice &&
    hasStock &&
    price >= 0 &&
    stock > 0;

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(current + 1, stock ?? current)
    );
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(current - 1, 1));
  };

  const handleAddToCart = () => {
    if (!canOrder || quantity > stock) return;

    addToCart(
      {
        ...product,
        price,
        stock,
      },
      quantity
    );

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 text-sm text-gray-500"
        >
          <Link href="/products" className="hover:text-[#02337D]">
            Products
          </Link>

          <span className="mx-2">/</span>

          <span className="text-gray-700">{product.name}</span>
        </nav>

        {/* Product details */}
        <div className="grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-2">
          {/* Product image */}
          <div className="relative flex min-h-[350px] items-center justify-center overflow-hidden bg-gray-100 p-8 sm:min-h-[450px] sm:p-10">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                  event.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
                className="max-h-[420px] w-full object-contain"
              />
            ) : null}

            <div
              className={`flex min-h-[300px] w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#02337D] to-[#0b4da2] text-white ${
                imageUrl ? "hidden" : ""
              }`}
            >
              {imageUrl ? (
                <ImageOff className="h-14 w-14" />
              ) : (
                <Package className="h-14 w-14" />
              )}

              <p className="mt-3 text-sm font-medium">
                {imageUrl
                  ? "Product image unavailable"
                  : "Product image coming soon"}
              </p>
            </div>
          </div>

          {/* Product information */}
          <div className="p-6 sm:p-8 lg:p-12">
            <span className="inline-block rounded-full bg-[#f4f7fc] px-4 py-2 text-sm font-semibold text-[#02337D]">
              {product.category || "General"}
            </span>

            <h1 className="mt-6 text-3xl font-bold text-[#172033] sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              SKU: {product.sku || "Not available"}
            </p>

            <p className="mt-5 whitespace-pre-line leading-7 text-gray-600">
              {product.description ||
                "Contact BrightSpark for more information about this product."}
            </p>

            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Unit of measurement</p>
              <p className="mt-1 font-semibold text-[#172033]">
                {product.unit || "Piece"}
              </p>
            </div>

            {/* Pricing */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-500">Price</p>

              {hasPrice ? (
                <p className="mt-1 text-3xl font-bold text-[#02337D]">
                  KSh {formatPrice(price)}
                </p>
              ) : (
                <p className="mt-1 text-xl font-bold text-[#02337D]">
                  Contact us for pricing
                </p>
              )}
            </div>

            {/* Stock information */}
            <div className="mt-5">
              {hasStock ? (
                stock > 0 ? (
                  <p className="font-medium text-green-600">
                    ✓ Available
                  </p>
                ) : (
                  <p className="font-medium text-red-600">
                    Currently out of stock
                  </p>
                )
              ) : (
                <p className="text-sm text-gray-500">
                  Contact us to confirm availability.
                </p>
              )}
            </div>

            {/* Quantity controls appear when stock is known */}
            {canOrder && (
              <div className="mt-8">
                <p className="mb-3 font-semibold text-[#172033]">
                  Quantity ({product.unit || "Piece"})
                </p>

                <div className="flex w-fit items-center overflow-hidden rounded-lg border border-gray-300">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="flex h-11 w-11 items-center justify-center text-xl hover:bg-gray-100 disabled:opacity-40"
                  >
                    −
                  </button>

                  <span
                    aria-live="polite"
                    className="flex h-11 min-w-14 items-center justify-center border-x border-gray-300 px-3 font-semibold"
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={quantity >= stock}
                    aria-label="Increase quantity"
                    className="flex h-11 w-11 items-center justify-center text-xl hover:bg-gray-100 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Cart */}
            <div className="mt-8">
              <button
                type="button"
                disabled={!canOrder}
                onClick={handleAddToCart}
                className={`w-full rounded-xl py-4 font-semibold text-white transition ${
                  !canOrder
                    ? "cursor-not-allowed bg-gray-400"
                    : added
                      ? "bg-green-600"
                      : "bg-[#FE7401] hover:bg-[#D85F00]"
                }`}
              >
                {!hasPrice
                  ? "Contact Us to Order"
                  : !hasStock
                    ? "Availability to Be Confirmed"
                    : stock <= 0
                      ? "Out of Stock"
                      : added
                        ? "✓ Added to Cart"
                        : "Add to Cart"}
              </button>

              {!canOrder && (
                <p className="mt-3 text-center text-sm text-gray-500">
                  Please contact BrightSpark to confirm the price and
                  availability before ordering.
                </p>
              )}
            </div>

            {/* Continue shopping */}
            <Link
              href="/products"
              className="mt-5 block text-center font-medium text-[#02337D] hover:underline"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
