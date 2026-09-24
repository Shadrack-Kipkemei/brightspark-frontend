"use client";

import { useState } from "react";

const initialProducts = [
  {
    id: "P001",
    name: "LED Bulb 12W",
    category: "Lighting",
    price: 350,
    stock: 25,
    status: "Active",
  },
  {
    id: "P002",
    name: "Phone Charger",
    category: "Phone Accessories",
    price: 800,
    stock: 15,
    status: "Active",
  },
  {
    id: "P003",
    name: "Bluetooth Speaker",
    category: "Electronics",
    price: 3500,
    stock: 3,
    status: "Active",
  },
  {
    id: "P004",
    name: "Digital Multimeter",
    category: "Electrical",
    price: 2500,
    stock: 6,
    status: "Active",
  },
];

export default function AdminProductsPage() {
  const [products, setProducts] =
    useState(initialProducts);

  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter(
        (product) => product.id !== id
      )
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>

            <p className="text-sm font-semibold text-[#FE7401]">
              Inventory
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#02337D]">
              Products
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Add and manage BrightSpark products.
            </p>

          </div>

          <button
            type="button"
            className="rounded-xl bg-[#FE7401] px-5 py-3 font-semibold text-white hover:bg-[#D85F00]"
          >
            + Add Product
          </button>

        </div>

        {/* Search */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search products..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20"
          />

        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead>

                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">

                  <th className="px-5 py-4">
                    Product
                  </th>

                  <th className="px-5 py-4">
                    Category
                  </th>

                  <th className="px-5 py-4">
                    Price
                  </th>

                  <th className="px-5 py-4">
                    Stock
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 last:border-0"
                  >

                    <td className="px-5 py-4">

                      <p className="font-semibold text-gray-800">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {product.id}
                      </p>

                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {product.category}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                      KSh{" "}
                      {product.price.toLocaleString()}
                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={
                          product.stock <= 5
                            ? "font-bold text-red-600"
                            : "font-semibold text-gray-700"
                        }
                      >
                        {product.stock}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                        {product.status}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-[#02337D] hover:bg-gray-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(product.id)
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {filteredProducts.length === 0 && (
            <div className="p-10 text-center text-sm text-gray-500">
              No products found.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}