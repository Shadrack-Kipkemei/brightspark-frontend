
import Link from "next/link";
import { ImageOff, Package } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:5000/api";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function getImageUrl(product) {
  const image = product.image_url || product.image;

  if (!image) return null;

  // Internet image URL: use it directly.
  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  // Locally uploaded image served by Flask.
  return `${API_ORIGIN}/${image.replace(/^\/+/, "")}`;
}

export default function ProductCard({ product }) {
  const imageUrl = getImageUrl(product);

  const hasStockInformation =
    product.stock !== undefined &&
    product.stock !== null &&
    Number.isFinite(Number(product.stock));

  const stock = hasStockInformation
    ? Number(product.stock)
    : null;

  const isOutOfStock =
    hasStockInformation && stock <= 0;

  const isLowStock =
    hasStockInformation &&
    stock > 0 &&
    stock <= 5;

  const hasPrice =
    product.price !== undefined &&
    product.price !== null &&
    product.price !== "" &&
    Number.isFinite(Number(product.price));

  const price = hasPrice ? Number(product.price) : null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Product Image */}
      <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              event.currentTarget.nextElementSibling?.classList.remove(
                "hidden"
              );
            }}
            className="h-full w-full object-contain p-6 transition duration-300 group-hover:scale-105"
          />
        ) : null}

        {/* Fallback if no image exists or the image fails to load */}
        <div
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[#02337D] to-[#0b4da2] ${
            imageUrl ? "hidden" : ""
          }`}
        >
          <div className="text-center text-white">
            {imageUrl ? (
              <ImageOff className="mx-auto h-12 w-12" />
            ) : (
              <Package className="mx-auto h-12 w-12" />
            )}
            <p className="mt-2 text-sm font-medium">
              {imageUrl ? "Image unavailable" : "Product image coming soon"}
            </p>
          </div>
        </div>

        {/* Category */}
        <span className="absolute left-3 top-3 max-w-[65%] truncate rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#02337D] shadow-sm">
          {product.category || "General"}
        </span>

        {/* Stock badge only when stock is provided by the API */}
        {hasStockInformation && (
          <span
            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
              isOutOfStock
                ? "bg-red-100 text-red-700"
                : isLowStock
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
            }`}
          >
            {isOutOfStock
              ? "Out of Stock"
              : isLowStock
                ? `Only ${stock} left`
                : "In Stock"}
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          SKU: {product.sku || "Not available"}
        </p>

        <h3 className="mt-2 line-clamp-2 min-h-[48px] text-lg font-bold text-[#172033]">
          {product.name}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-[40px] text-sm text-gray-500">
          {product.description || "Contact us for more information about this product."}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {hasPrice ? (
              <>
                <p className="text-xs text-gray-500">Price</p>
                <p className="text-xl font-bold text-[#02337D]">
                  KSh{" "}
                  {price.toLocaleString("en-KE", {
                    maximumFractionDigits: 2,
                  })}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500">Pricing</p>
                <p className="text-sm font-semibold text-[#02337D]">
                  Contact us
                </p>
              </>
            )}
          </div>

          <Link
            href={`/products/${product.id}`}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              isOutOfStock
                ? "pointer-events-none bg-gray-200 text-gray-500"
                : "bg-[#02337D] text-white hover:bg-[#01265C]"
            }`}
            aria-disabled={isOutOfStock}
            tabIndex={isOutOfStock ? -1 : undefined}
          >
            View Product
          </Link>
        </div>
      </div>
    </article>
  );
}
