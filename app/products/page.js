
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, PackageOpen, RefreshCw } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { getProducts } from "@/services/productService";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getProducts();

      // The API response contains { success, count, products }.
      if (!response || !Array.isArray(response.products)) {
        throw new Error(
          "The server returned an unexpected products response."
        );
      }

      // Only display active products in the public catalogue.
      const activeProducts = response.products.filter(
        (product) => product.is_active !== false
      );

      setProducts(activeProducts);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError(
        err.message ||
          "We couldn't load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Generate categories from actual database products.
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));

    return ["All", ...uniqueCategories];
  }, [products]);

  // Search by product name, description, SKU, and category.
  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !search ||
        [
          product.name,
          product.description,
          product.sku,
          product.category,
        ].some((value) =>
          String(value || "").toLowerCase().includes(search)
        );

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-[#02337D] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-widest text-[#FE7401]">
            BrightSpark Shop
          </p>

          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Our Products
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-gray-200">
            Browse electrical, electronic, lighting, and phone
            accessories available from BrightSpark.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Search */}
          <div className="mb-8">
            <label
              htmlFor="product-search"
              className="mb-2 block text-sm font-semibold text-[#172033]"
            >
              Search products
            </label>

            <div className="relative max-w-xl">
              <input
                id="product-search"
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search by product name, SKU, or category..."
                className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3.5 pr-12 outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20"
              />

              <Search
                aria-hidden="true"
                className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Dynamic Categories */}
          <div className="mb-10 flex flex-wrap gap-3">
            {categories.map((category) => {
              const active = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[#FE7401] text-white shadow-sm"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-[#02337D] hover:text-[#02337D]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Loading State */}
          {loading && (
            <div
              className="flex flex-col items-center justify-center py-20 text-center"
              role="status"
              aria-live="polite"
            >
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#02337D]" />

              <p className="mt-4 font-medium text-gray-700">
                Loading BrightSpark products...
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Please wait while we retrieve the latest catalogue.
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div
              className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center"
              role="alert"
            >
              <h2 className="text-xl font-bold text-red-700">
                Unable to load products
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
                {error}
              </p>

              <button
                type="button"
                onClick={loadProducts}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#02337D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#01265C]"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          )}

          {/* Product Results */}
          {!loading && !error && (
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-[#02337D]">
                    {filteredProducts.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">
                    {products.length}
                  </span>{" "}
                  products
                </p>

                {(searchTerm || selectedCategory !== "All") && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-semibold text-[#02337D] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
                  <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />

                  <h2 className="mt-4 text-xl font-bold text-[#02337D]">
                    {products.length === 0
                      ? "No products available"
                      : "No products found"}
                  </h2>

                  <p className="mt-2 text-gray-500">
                    {products.length === 0
                      ? "Please check back later for available products."
                      : "Try another search term or select a different category."}
                  </p>

                  {(searchTerm || selectedCategory !== "All") && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-6 rounded-lg bg-[#02337D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#01265C]"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
