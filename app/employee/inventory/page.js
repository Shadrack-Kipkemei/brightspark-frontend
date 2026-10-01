"use client";

import { useMemo, useState } from "react";

const BRAND = {
  navy: "#02337D",
  orange: "#FE7401",
};

const CURRENT_EMPLOYEE = {
  id: "EMP-001",
  name: "John Employee",
  branch: "Roysambu",
};

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Fast Charging USB Cable",
    sku: "ACC-USB-001",
    category: "Phone Accessories",
    unit: "Piece",
    costPrice: 300,
    lowStockThreshold: 5,
    stock: 12,
  },
  {
    id: 2,
    name: "LED Bulb 12W",
    sku: "LED-12W-001",
    category: "Lighting",
    unit: "Piece",
    costPrice: 220,
    lowStockThreshold: 5,
    stock: 20,
  },
  {
    id: 3,
    name: "Electrical Extension Cable",
    sku: "CAB-EXT-001",
    category: "Electrical",
    unit: "Metre",
    costPrice: 55,
    lowStockThreshold: 10,
    stock: 50,
  },
  {
    id: 4,
    name: "Rechargeable Emergency Lamp",
    sku: "LMP-EMG-001",
    category: "Lighting",
    unit: "Piece",
    costPrice: 1200,
    lowStockThreshold: 5,
    stock: 4,
  },
  {
    id: 5,
    name: "Phone Charger",
    sku: "CHR-001",
    category: "Phone Accessories",
    unit: "Piece",
    costPrice: 500,
    lowStockThreshold: 5,
    stock: 15,
  },
  {
    id: 6,
    name: "Digital Multimeter",
    sku: "ELC-MUL-001",
    category: "Electrical",
    unit: "Piece",
    costPrice: 1800,
    lowStockThreshold: 3,
    stock: 6,
  },
];

function money(value) {
  return `KSh ${Number(value || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Modal({ title, children, onClose, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <h2
            className="text-xl font-bold"
            style={{
              color: BRAND.navy,
            }}
          >
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xl text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(90vh-145px)] overflow-y-auto px-6 py-5">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t bg-white px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployeeInventoryPage() {
  const [products, setProducts] =
    useState(INITIAL_PRODUCTS);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showStockModal, setShowStockModal] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [stockForm, setStockForm] = useState({
    quantity: "",
    reason: "",
  });

  const categories = [
    "All",
    ...new Set(
      products.map(
        (product) => product.category
      )
    ),
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.sku
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        product.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [products, search, category]);

  const lowStockProducts = products.filter(
    (product) =>
      product.stock <=
      product.lowStockThreshold
  );

  function openStockModal(product) {
    setSelectedProduct(product);

    setStockForm({
      quantity: "",
      reason: "",
    });

    setShowStockModal(true);
  }

  function addStock() {
    if (!selectedProduct) return;

    const quantity = Number(
      stockForm.quantity
    );

    if (quantity <= 0) {
      alert("Enter a valid quantity.");
      return;
    }

    if (!stockForm.reason.trim()) {
      alert("Enter the reason for adding stock.");
      return;
    }

    setProducts((prev) =>
      prev.map((product) =>
        product.id === selectedProduct.id
          ? {
              ...product,
              stock:
                product.stock + quantity,
            }
          : product
      )
    );

    setShowStockModal(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p
                className="text-sm font-semibold"
                style={{
                  color: BRAND.orange,
                }}
              >
                EMPLOYEE INVENTORY
              </p>

              <h1
                className="text-3xl font-bold"
                style={{
                  color: BRAND.navy,
                }}
              >
                Stock
              </h1>

              <p className="mt-1 text-gray-500">
                View and add stock for your branch.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 px-5 py-3">
              <p className="text-xs text-gray-500">
                Your Branch
              </p>

              <p className="font-bold">
                {CURRENT_EMPLOYEE.branch}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            title="Products"
            value={products.length}
          />

          <SummaryCard
            title="Low Stock"
            value={lowStockProducts.length}
          />

          <SummaryCard
            title="Stock Value"
            value={money(
              products.reduce(
                (sum, product) =>
                  sum +
                  product.stock *
                    product.costPrice,
                0
              )
            )}
          />
        </div>

        {lowStockProducts.length > 0 && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <h2 className="font-bold text-red-700">
              Low Stock Alert
            </h2>

            <p className="mt-1 text-sm text-red-600">
              The following products need attention:
            </p>

            <div className="mt-3 space-y-2">
              {lowStockProducts.map(
                (product) => (
                  <div
                    key={product.id}
                    className="flex justify-between rounded-lg bg-white p-3"
                  >
                    <span className="font-semibold">
                      {product.name}
                    </span>

                    <span className="font-bold text-red-600">
                      {product.stock}{" "}
                      {product.unit}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b p-5 md:flex-row">
            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search product or SKU..."
              className="flex-1 rounded-xl border px-4 py-3"
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="rounded-xl border px-4 py-3"
            >
              {categories.map((item) => (
                <option key={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left">
                    Product
                  </th>

                  <th className="px-5 py-4 text-left">
                    SKU
                  </th>

                  <th className="px-5 py-4 text-left">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left">
                    Unit
                  </th>

                  <th className="px-5 py-4 text-left">
                    Stock
                  </th>

                  <th className="px-5 py-4 text-left">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map(
                  (product) => {
                    const lowStock =
                      product.stock <=
                      product.lowStockThreshold;

                    return (
                      <tr
                        key={product.id}
                        className="border-t"
                      >
                        <td className="px-5 py-4 font-semibold">
                          {product.name}
                        </td>

                        <td className="px-5 py-4">
                          {product.sku}
                        </td>

                        <td className="px-5 py-4">
                          {product.category}
                        </td>

                        <td className="px-5 py-4">
                          {product.unit}
                        </td>

                        <td className="px-5 py-4 font-bold">
                          {product.stock}
                        </td>

                        <td className="px-5 py-4">
                          {lowStock ? (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              LOW STOCK
                            </span>
                          ) : (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              IN STOCK
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() =>
                              openStockModal(
                                product
                              )
                            }
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                            style={{
                              backgroundColor:
                                BRAND.orange,
                            }}
                          >
                            Add Stock
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showStockModal &&
        selectedProduct && (
          <Modal
            title={`Add Stock — ${selectedProduct.name}`}
            onClose={() =>
              setShowStockModal(false)
            }
            footer={
              <div className="flex justify-end gap-3">
                <button
                  onClick={() =>
                    setShowStockModal(false)
                  }
                  className="rounded-xl border px-5 py-3"
                >
                  Cancel
                </button>

                <button
                  onClick={addStock}
                  className="rounded-xl px-5 py-3 font-semibold text-white"
                  style={{
                    backgroundColor:
                      BRAND.orange,
                  }}
                >
                  Add Stock
                </button>
              </div>
            }
          >
            <div className="space-y-5">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Product
                </p>

                <p className="font-bold">
                  {selectedProduct.name}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Current Stock
                </p>

                <p className="font-bold">
                  {selectedProduct.stock}{" "}
                  {selectedProduct.unit}
                </p>
              </div>

              <Input
                label={`Quantity (${selectedProduct.unit})`}
                type="number"
                step="0.001"
                value={stockForm.quantity}
                onChange={(value) =>
                  setStockForm((prev) => ({
                    ...prev,
                    quantity: value,
                  }))
                }
              />

              <Input
                label="Reason"
                value={stockForm.reason}
                onChange={(value) =>
                  setStockForm((prev) => ({
                    ...prev,
                    reason: value,
                  }))
                }
                placeholder="e.g. Supplier delivery"
              />
            </div>
          </Modal>
        )}
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  step,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <input
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border px-4 py-3"
      />
    </div>
  );
}