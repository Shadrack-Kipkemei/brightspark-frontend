"use client";

import { useMemo, useState } from "react";

const initialStock = [
  {
    id: "ST001",
    product: "LED Bulb 12W",
    sku: "BS-LB-001",
    category: "Lighting",
    branch: "Roysambu",
    stock: 25,
    minimumStock: 5,
  },
  {
    id: "ST002",
    product: "Phone Charger",
    sku: "BS-PC-001",
    category: "Phone Accessories",
    branch: "Roysambu",
    stock: 15,
    minimumStock: 5,
  },
  {
    id: "ST003",
    product: "Bluetooth Speaker",
    sku: "BS-BS-001",
    category: "Electronics",
    branch: "Roysambu",
    stock: 3,
    minimumStock: 5,
  },
  {
    id: "ST004",
    product: "Digital Multimeter",
    sku: "BS-DM-001",
    category: "Electrical",
    branch: "Roysambu",
    stock: 8,
    minimumStock: 5,
  },
  {
    id: "ST005",
    product: "LED Flood Light",
    sku: "BS-FL-001",
    category: "Lighting",
    branch: "Rangau",
    stock: 12,
    minimumStock: 5,
  },
  {
    id: "ST006",
    product: "Extension Cable",
    sku: "BS-EC-001",
    category: "Electrical",
    branch: "Rangau",
    stock: 20,
    minimumStock: 5,
  },
  {
    id: "ST007",
    product: "Rechargeable Emergency Lamp",
    sku: "BS-EL-001",
    category: "Electronics",
    branch: "Rangau",
    stock: 2,
    minimumStock: 5,
  },
  {
    id: "ST008",
    product: "USB Type-C Cable",
    sku: "BS-UC-001",
    category: "Phone Accessories",
    branch: "Rangau",
    stock: 30,
    minimumStock: 10,
  },
];

export default function AdminStockPage() {
  const [stockItems, setStockItems] =
    useState(initialStock);

  const [branch, setBranch] = useState("all");

  const [search, setSearch] = useState("");

  const [stockFilter, setStockFilter] =
    useState("all");

  const [showAddStock, setShowAddStock] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [quantity, setQuantity] = useState("");

  const filteredStock = useMemo(() => {
    return stockItems.filter((item) => {
      const matchesBranch =
        branch === "all" ||
        item.branch === branch;

      const matchesSearch =
        item.product
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.sku
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStockFilter =
        stockFilter === "all" ||
        (stockFilter === "low" &&
          item.stock <= item.minimumStock) ||
        (stockFilter === "available" &&
          item.stock > item.minimumStock);

      return (
        matchesBranch &&
        matchesSearch &&
        matchesStockFilter
      );
    });
  }, [
    stockItems,
    branch,
    search,
    stockFilter,
  ]);

  const totalStock = filteredStock.reduce(
    (total, item) => total + item.stock,
    0
  );

  const lowStockCount = stockItems.filter(
    (item) => item.stock <= item.minimumStock
  ).length;

  const roysambuStock = stockItems
    .filter((item) => item.branch === "Roysambu")
    .reduce(
      (total, item) => total + item.stock,
      0
    );

  const rangauStock = stockItems
    .filter((item) => item.branch === "Rangau")
    .reduce(
      (total, item) => total + item.stock,
      0
    );

  const openAddStock = (product) => {
    setSelectedProduct(product);
    setQuantity("");
    setShowAddStock(true);
  };

  const closeAddStock = () => {
    setShowAddStock(false);
    setSelectedProduct(null);
    setQuantity("");
  };

  const handleAddStock = (event) => {
    event.preventDefault();

    const amount = Number(quantity);

    if (!amount || amount <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    setStockItems((currentStock) =>
      currentStock.map((item) =>
        item.id === selectedProduct.id
          ? {
              ...item,
              stock: item.stock + amount,
            }
          : item
      )
    );

    closeAddStock();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>

            <p className="text-sm font-semibold text-[#FE7401]">
              Inventory Management
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#02337D]">
              Stock Management
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Monitor and manage stock across both
              BrightSpark branches.
            </p>

          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedProduct(null);
              setShowAddStock(true);
            }}
            className="rounded-xl bg-[#FE7401] px-5 py-3 font-semibold text-white hover:bg-[#D85F00]"
          >
            + Add Stock
          </button>

        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            title="Total Stock"
            value={totalStock.toLocaleString()}
            description="Units in selected view"
            icon="📦"
          />

          <SummaryCard
            title="Roysambu"
            value={roysambuStock.toLocaleString()}
            description="Total units"
            icon="🏪"
          />

          <SummaryCard
            title="Rangau"
            value={rangauStock.toLocaleString()}
            description="Total units"
            icon="🏪"
          />

          <SummaryCard
            title="Low Stock"
            value={lowStockCount}
            description="Products need attention"
            icon="⚠️"
            warning
          />

        </div>

        {/* Branch Selection */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end">

            <div className="flex-1">

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Branch
              </label>

              <select
                value={branch}
                onChange={(event) =>
                  setBranch(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20"
              >

                <option value="all">
                  All Branches
                </option>

                <option value="Roysambu">
                  Roysambu - Lumumba Drive
                </option>

                <option value="Rangau">
                  Rangau
                </option>

              </select>

            </div>

            <div className="flex-1">

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Search
              </label>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search product or SKU..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20"
              />

            </div>

            <div className="flex-1">

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Stock Status
              </label>

              <select
                value={stockFilter}
                onChange={(event) =>
                  setStockFilter(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20"
              >

                <option value="all">
                  All Stock
                </option>

                <option value="low">
                  Low Stock
                </option>

                <option value="available">
                  Available
                </option>

              </select>

            </div>

          </div>

        </div>

        {/* Low Stock Alert */}
        {lowStockCount > 0 && (
          <div className="mt-6 flex items-start gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-5">

            <div className="text-2xl">
              ⚠️
            </div>

            <div>

              <h2 className="font-bold text-orange-800">
                Low Stock Alert
              </h2>

              <p className="mt-1 text-sm text-orange-700">
                {lowStockCount} product
                {lowStockCount !== 1 ? "s are" : " is"}{" "}
                at or below the minimum stock level.
                Please consider restocking.
              </p>

            </div>

          </div>
        )}

        {/* Stock Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-200 p-5">

            <div>

              <h2 className="font-bold text-[#02337D]">
                Stock Inventory
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {filteredStock.length} products shown
              </p>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px]">

              <thead>

                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">

                  <th className="px-5 py-4">
                    Product
                  </th>

                  <th className="px-5 py-4">
                    Category
                  </th>

                  <th className="px-5 py-4">
                    Branch
                  </th>

                  <th className="px-5 py-4">
                    Current Stock
                  </th>

                  <th className="px-5 py-4">
                    Minimum
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredStock.map((item) => {

                  const isLowStock =
                    item.stock <=
                    item.minimumStock;

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 last:border-0"
                    >

                      <td className="px-5 py-4">

                        <p className="font-semibold text-gray-800">
                          {item.product}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {item.sku}
                        </p>

                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {item.category}
                      </td>

                      <td className="px-5 py-4">

                        <BranchBadge
                          branch={item.branch}
                        />

                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`text-lg font-bold ${
                            isLowStock
                              ? "text-red-600"
                              : "text-gray-800"
                          }`}
                        >
                          {item.stock}
                        </span>

                        <span className="ml-1 text-xs text-gray-400">
                          units
                        </span>

                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {item.minimumStock}
                      </td>

                      <td className="px-5 py-4">

                        {isLowStock ? (
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                            Low Stock
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                            In Stock
                          </span>
                        )}

                      </td>

                      <td className="px-5 py-4 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            openAddStock(item)
                          }
                          className="rounded-lg border border-[#02337D] px-3 py-2 text-xs font-semibold text-[#02337D] hover:bg-blue-50"
                        >
                          Add Stock
                        </button>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

          {filteredStock.length === 0 && (
            <div className="p-10 text-center text-sm text-gray-500">
              No stock records found.
            </div>
          )}

        </div>

      </div>

      {/* Add Stock Modal */}
      {showAddStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

            <div className="border-b border-gray-200 p-6">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold text-[#02337D]">
                    Add Stock
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Add new units to inventory.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeAddStock}
                  className="text-2xl text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>

              </div>

            </div>

            <form
              onSubmit={handleAddStock}
              className="space-y-5 p-6"
            >

              {selectedProduct ? (
                <div className="rounded-xl bg-gray-50 p-4">

                  <p className="text-sm font-bold text-gray-800">
                    {selectedProduct.product}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {selectedProduct.branch}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    Current stock:{" "}
                    <strong>
                      {selectedProduct.stock}
                    </strong>
                  </p>

                </div>
              ) : (
                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Product
                  </label>

                  <select
                    required
                    value={selectedProduct?.id || ""}
                    onChange={(event) => {
                      const product =
                        stockItems.find(
                          (item) =>
                            item.id ===
                            event.target.value
                        );

                      setSelectedProduct(product);
                    }}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
                  >

                    <option value="">
                      Select product
                    </option>

                    {stockItems.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.product} -{" "}
                        {item.branch}
                      </option>
                    ))}

                  </select>

                </div>
              )}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Quantity to Add
                </label>

                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                  placeholder="Enter quantity"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20"
                />

              </div>

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeAddStock}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!selectedProduct}
                  className="flex-1 rounded-xl bg-[#02337D] px-4 py-3 font-semibold text-white hover:bg-[#01265C] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add Stock
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  warning = false,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              warning
                ? "text-red-600"
                : "text-[#02337D]"
            }`}
          >
            {value}
          </p>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
          {icon}
        </div>

      </div>

      <p className="mt-3 text-xs text-gray-500">
        {description}
      </p>

    </div>
  );
}

function BranchBadge({ branch }) {
  const isRoysambu = branch === "Roysambu";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        isRoysambu
          ? "bg-blue-50 text-[#02337D]"
          : "bg-orange-50 text-[#FE7401]"
      }`}
    >
      {branch}
    </span>
  );
}