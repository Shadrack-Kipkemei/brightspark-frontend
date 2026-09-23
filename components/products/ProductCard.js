import Link from "next/link";

export default function ProductCard({ product }) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* Product Image */}
      <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gray-100">

        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain p-6 transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#02337D] to-[#0b4da2]">
            <span className="text-6xl">
              {product.icon}
            </span>
          </div>
        )}

        {/* Category */}
        <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#02337D] shadow-sm">
          {product.category}
        </span>

        {/* Stock */}
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
              ? `Only ${product.stock} left`
              : "In Stock"}
        </span>
      </div>

      {/* Product Information */}
      <div className="p-5">

        <h3 className="line-clamp-2 min-h-[48px] text-lg font-bold text-[#172033]">
          {product.name}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-[40px] text-sm text-gray-500">
          {product.description}
        </p>

        <div className="mt-5 flex items-center justify-between">

          <div>
            <p className="text-xs text-gray-500">
              Price
            </p>

            <p className="text-xl font-bold text-[#02337D]">
              KSh {product.price.toLocaleString()}
            </p>
          </div>

          <Link
            href={`/products/${product.id}`}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              isOutOfStock
                ? "pointer-events-none bg-gray-200 text-gray-500"
                : "bg-[#02337D] text-white hover:bg-[#01265C]"
            }`}
          >
            View Product
          </Link>

        </div>
      </div>
    </div>
  );
}