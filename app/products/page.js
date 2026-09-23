"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/products/ProductCard";

const products = [
  {
    id: "p001",
    name: "Fast Charging USB Cable",
    category: "Phone Accessories",
    price: 500,
    stock: 12,
    icon: "🔌",
    description:
      "Durable USB charging cable suitable for everyday phone charging and data transfer.",
  },
  {
    id: "p002",
    name: "LED Bulb 12W",
    category: "Lighting",
    price: 350,
    stock: 20,
    icon: "💡",
    description:
      "Energy-efficient LED bulb suitable for homes, offices, and other spaces.",
  },
  {
    id: "p003",
    name: "Electrical Extension Cable",
    category: "Electrical",
    price: 1200,
    stock: 8,
    icon: "🔌",
    description:
      "Reliable extension cable for powering multiple electrical devices.",
  },
  {
    id: "p004",
    name: "Rechargeable Emergency Lamp",
    category: "Lighting",
    price: 1800,
    stock: 4,
    icon: "🔦",
    description:
      "Rechargeable emergency lamp designed for reliable lighting during power interruptions.",
  },
  {
    id: "p005",
    name: "Phone Charger",
    category: "Phone Accessories",
    price: 800,
    stock: 15,
    icon: "🔋",
    description:
      "Compact phone charger designed for convenient everyday charging.",
  },
  {
    id: "p006",
    name: "Digital Multimeter",
    category: "Electrical",
    price: 2500,
    stock: 6,
    icon: "📟",
    description:
      "Digital multimeter for measuring voltage, current, resistance, and other electrical values.",
  },
  {
    id: "p007",
    name: "Electrical Socket",
    category: "Electrical",
    price: 450,
    stock: 25,
    icon: "🔌",
    description:
      "Quality electrical wall socket suitable for residential and commercial installations.",
  },
  {
    id: "p008",
    name: "Bluetooth Speaker",
    category: "Electronics",
    price: 3500,
    stock: 3,
    icon: "🔊",
    description:
      "Portable Bluetooth speaker for music, entertainment, and everyday use.",
  },
];

const categories = [
  "All",
  "Phone Accessories",
  "Lighting",
  "Electrical",
  "Electronics",
];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

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
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search for bulbs, chargers, cables..."
                className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3.5 pr-12 outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20"
              />

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m1.35-5.4a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z"
                />
              </svg>
            </div>
          </div>

          {/* Categories */}
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

          {/* Result Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-[#02337D]">
                {filteredProducts.length}
              </span>{" "}
              products
            </p>
          </div>

          {/* Product Grid */}
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
              <div className="text-5xl">
                🔍
              </div>

              <h2 className="mt-4 text-xl font-bold text-[#02337D]">
                No products found
              </h2>

              <p className="mt-2 text-gray-500">
                Try another search term or select a different
                category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="mt-6 rounded-lg bg-[#02337D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#01265C]"
              >
                Clear Filters
              </button>
            </div>
          )}

        </div>
      </section>

    </main>
  );
}