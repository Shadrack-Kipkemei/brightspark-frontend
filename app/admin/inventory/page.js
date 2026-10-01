"use client";

import { useMemo, useState } from "react";

const BRAND = {
  navy: "#02337D",
  orange: "#FE7401",
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
    roysambuStock: 12,
    rangauStock: 8,
  },
  {
    id: 2,
    name: "LED Bulb 12W",
    sku: "LED-12W-001",
    category: "Lighting",
    unit: "Piece",
    costPrice: 220,
    lowStockThreshold: 5,
    roysambuStock: 20,
    rangauStock: 3,
  },
  {
    id: 3,
    name: "Electrical Extension Cable",
    sku: "CAB-EXT-001",
    category: "Electrical",
    unit: "Metre",
    costPrice: 55,
    lowStockThreshold: 10,
    roysambuStock: 50,
    rangauStock: 18,
  },
  {
    id: 4,
    name: "Rechargeable Emergency Lamp",
    sku: "LMP-EMG-001",
    category: "Lighting",
    unit: "Piece",
    costPrice: 1200,
    lowStockThreshold: 5,
    roysambuStock: 4,
    rangauStock: 2,
  },
  {
    id: 5,
    name: "Phone Charger",
    sku: "CHR-001",
    category: "Phone Accessories",
    unit: "Piece",
    costPrice: 500,
    lowStockThreshold: 5,
    roysambuStock: 15,
    rangauStock: 6,
  },
  {
    id: 6,
    name: "Digital Multimeter",
    sku: "ELC-MUL-001",
    category: "Electrical",
    unit: "Piece",
    costPrice: 1800,
    lowStockThreshold: 3,
    roysambuStock: 6,
    rangauStock: 2,
  },
  {
    id: 7,
    name: "Electrical Socket",
    sku: "SOC-001",
    category: "Electrical",
    unit: "Piece",
    costPrice: 280,
    lowStockThreshold: 5,
    roysambuStock: 25,
    rangauStock: 10,
  },
  {
    id: 8,
    name: "Bluetooth Speaker",
    sku: "SPK-BT-001",
    category: "Electronics",
    unit: "Piece",
    costPrice: 2500,
    lowStockThreshold: 3,
    roysambuStock: 3,
    rangauStock: 1,
  },
];

const INITIAL_MOVEMENTS = [
  {
    id: "MOV-001",
    product: "Electrical Extension Cable",
    sku: "CAB-EXT-001",
    branch: "Roysambu",
    type: "SALE",
    quantity: -20,
    unit: "Metre",
    reference: "BS-2026-0001",
    performedBy: "John Employee",
    date: "2026-09-30 10:15",
  },
  {
    id: "MOV-002",
    product: "LED Bulb 12W",
    sku: "LED-12W-001",
    branch: "Roysambu",
    type: "STOCK_IN",
    quantity: 30,
    unit: "Piece",
    reference: "STK-0001",
    performedBy: "Administrator",
    date: "2026-09-29 09:20",
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
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <h2
            className="text-xl font-bold"
            style={{ color: BRAND.navy }}
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

export default function AdminInventoryPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [movements, setMovements] = useState(INITIAL_MOVEMENTS);

  const [activeTab, setActiveTab] = useState("stock");

  const [branch, setBranch] = useState("Roysambu");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showStockModal, setShowStockModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] =
    useState(false);
  const [showTransferModal, setShowTransferModal] =
    useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [stockForm, setStockForm] = useState({
    quantity: "",
    reason: "",
  });

  const [adjustmentForm, setAdjustmentForm] = useState({
    quantity: "",
    reason: "",
    type: "ADD",
  });

  const [transferForm, setTransferForm] = useState({
    sourceBranch: "Roysambu",
    destinationBranch: "Rangau",
    quantity: "",
    reason: "",
  });

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const stock =
        branch === "Roysambu"
          ? product.roysambuStock
          : product.rangauStock;

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
        matchesCategory &&
        stock >= 0
      );
    });
  }, [products, branch, search, category]);

  const lowStockProducts = products.filter((product) => {
    const stock =
      branch === "Roysambu"
        ? product.roysambuStock
        : product.rangauStock;

    return stock <= product.lowStockThreshold;
  });

  const totalStockValue = products.reduce((sum, product) => {
    const stock =
      branch === "Roysambu"
        ? product.roysambuStock
        : product.rangauStock;

    return sum + stock * product.costPrice;
  }, 0);

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

    const quantity = Number(stockForm.quantity);

    if (quantity <= 0) {
      alert("Enter a valid quantity.");
      return;
    }

    if (!stockForm.reason.trim()) {
      alert("Enter the reason for adding stock.");
      return;
    }

    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== selectedProduct.id) {
          return product;
        }

        return {
          ...product,
          ...(branch === "Roysambu"
            ? {
                roysambuStock:
                  product.roysambuStock + quantity,
              }
            : {
                rangauStock:
                  product.rangauStock + quantity,
              }),
        };
      })
    );

    setMovements((prev) => [
      {
        id: `MOV-${Date.now()}`,
        product: selectedProduct.name,
        sku: selectedProduct.sku,
        branch,
        type: "STOCK_IN",
        quantity,
        unit: selectedProduct.unit,
        reference: "MANUAL",
        performedBy: "Administrator",
        date: new Date().toLocaleString(),
      },
      ...prev,
    ]);

    setShowStockModal(false);
  }

  function openAdjustment(product) {
    setSelectedProduct(product);

    setAdjustmentForm({
      quantity: "",
      reason: "",
      type: "ADD",
    });

    setShowAdjustmentModal(true);
  }

  function adjustStock() {
    if (!selectedProduct) return;

    const quantity = Number(
      adjustmentForm.quantity
    );

    if (quantity <= 0) {
      alert("Enter a valid quantity.");
      return;
    }

    if (!adjustmentForm.reason.trim()) {
      alert("Enter the reason for the adjustment.");
      return;
    }

    const change =
      adjustmentForm.type === "ADD"
        ? quantity
        : -quantity;

    const currentStock =
      branch === "Roysambu"
        ? selectedProduct.roysambuStock
        : selectedProduct.rangauStock;

    if (currentStock + change < 0) {
      alert("Stock cannot become negative.");
      return;
    }

    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== selectedProduct.id) {
          return product;
        }

        return {
          ...product,
          ...(branch === "Roysambu"
            ? {
                roysambuStock:
                  product.roysambuStock + change,
              }
            : {
                rangauStock:
                  product.rangauStock + change,
              }),
        };
      })
    );

    setMovements((prev) => [
      {
        id: `MOV-${Date.now()}`,
        product: selectedProduct.name,
        sku: selectedProduct.sku,
        branch,
        type:
          adjustmentForm.type === "ADD"
            ? "ADJUSTMENT_IN"
            : "ADJUSTMENT_OUT",
        quantity: change,
        unit: selectedProduct.unit,
        reference: "ADJUSTMENT",
        performedBy: "Administrator",
        date: new Date().toLocaleString(),
      },
      ...prev,
    ]);

    setShowAdjustmentModal(false);
  }

  function transferStock() {
    const product = selectedProduct;

    if (!product) {
      alert("Select a product.");
      return;
    }

    const quantity = Number(
      transferForm.quantity
    );

    if (transferForm.sourceBranch === transferForm.destinationBranch) {
      alert("Source and destination branches must be different.");
      return;
    }

    if (quantity <= 0) {
      alert("Enter a valid quantity.");
      return;
    }

    if (!transferForm.reason.trim()) {
      alert("Enter the transfer reason.");
      return;
    }

    const sourceStock =
      transferForm.sourceBranch === "Roysambu"
        ? product.roysambuStock
        : product.rangauStock;

    if (quantity > sourceStock) {
      alert("Transfer quantity exceeds available stock.");
      return;
    }

    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== product.id) {
          return item;
        }

        let updated = { ...item };

        if (transferForm.sourceBranch === "Roysambu") {
          updated.roysambuStock -= quantity;
        } else {
          updated.rangauStock -= quantity;
        }

        if (
          transferForm.destinationBranch ===
          "Roysambu"
        ) {
          updated.roysambuStock += quantity;
        } else {
          updated.rangauStock += quantity;
        }

        return updated;
      })
    );

    setMovements((prev) => [
      {
        id: `MOV-${Date.now()}-OUT`,
        product: product.name,
        sku: product.sku,
        branch: transferForm.sourceBranch,
        type: "TRANSFER_OUT",
        quantity: -quantity,
        unit: product.unit,
        reference: "TRANSFER",
        performedBy: "Administrator",
        date: new Date().toLocaleString(),
      },
      {
        id: `MOV-${Date.now()}-IN`,
        product: product.name,
        sku: product.sku,
        branch: transferForm.destinationBranch,
        type: "TRANSFER_IN",
        quantity,
        unit: product.unit,
        reference: "TRANSFER",
        performedBy: "Administrator",
        date: new Date().toLocaleString(),
      },
      ...prev,
    ]);

    setShowTransferModal(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: BRAND.orange }}
              >
                ADMINISTRATION
              </p>

              <h1
                className="text-3xl font-bold"
                style={{ color: BRAND.navy }}
              >
                Inventory & Stock
              </h1>

              <p className="mt-1 text-gray-500">
                Manage stock across BrightSpark branches.
              </p>
            </div>

            <button
              onClick={() => setShowTransferModal(true)}
              className="rounded-xl px-5 py-3 font-semibold text-white"
              style={{
                backgroundColor: BRAND.orange,
              }}
            >
              Transfer Stock
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* SUMMARY */}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            title="Products"
            value={products.length}
          />

          <SummaryCard
            title="Low Stock Items"
            value={lowStockProducts.length}
          />

          <SummaryCard
            title="Stock Value"
            value={money(totalStockValue)}
          />
        </div>

        {/* TABS */}

        <div className="mb-6 flex overflow-x-auto rounded-xl bg-white shadow-sm">
          {[
            ["stock", "Stock"],
            ["movements", "Stock Movements"],
            ["alerts", "Low Stock Alerts"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`whitespace-nowrap px-6 py-4 text-sm font-semibold ${
                activeTab === key
                  ? "border-b-2"
                  : "text-gray-500"
              }`}
              style={
                activeTab === key
                  ? {
                      color: BRAND.navy,
                      borderColor: BRAND.orange,
                    }
                  : {}
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* STOCK */}

        {activeTab === "stock" && (
          <section className="rounded-2xl bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b p-5 lg:flex-row">
              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search product or SKU..."
                className="flex-1 rounded-xl border px-4 py-3"
              />

              <select
                value={branch}
                onChange={(e) =>
                  setBranch(e.target.value)
                }
                className="rounded-xl border px-4 py-3"
              >
                <option>Roysambu</option>
                <option>Rangau</option>
              </select>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="rounded-xl border px-4 py-3"
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
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
                      Cost Price
                    </th>

                    <th className="px-5 py-4 text-left">
                      Stock
                    </th>

                    <th className="px-5 py-4 text-left">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => {
                    const stock =
                      branch === "Roysambu"
                        ? product.roysambuStock
                        : product.rangauStock;

                    const lowStock =
                      stock <=
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

                        <td className="px-5 py-4">
                          {money(product.costPrice)}
                        </td>

                        <td className="px-5 py-4 font-bold">
                          {stock}
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
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                openStockModal(
                                  product
                                )
                              }
                              className="rounded-lg border px-3 py-2 text-sm"
                            >
                              Add Stock
                            </button>

                            <button
                              onClick={() =>
                                openAdjustment(
                                  product
                                )
                              }
                              className="rounded-lg border px-3 py-2 text-sm"
                            >
                              Adjust
                            </button>

                            <button
                              onClick={() => {
                                setSelectedProduct(
                                  product
                                );
                                setShowTransferModal(
                                  true
                                );
                              }}
                              className="rounded-lg px-3 py-2 text-sm font-semibold text-white"
                              style={{
                                backgroundColor:
                                  BRAND.navy,
                              }}
                            >
                              Transfer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* MOVEMENTS */}

        {activeTab === "movements" && (
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="border-b p-5">
              <h2
                className="font-bold"
                style={{
                  color: BRAND.navy,
                }}
              >
                Stock Movement History
              </h2>

              <p className="text-sm text-gray-500">
                Every stock change is recorded for audit purposes.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-left">
                      Date
                    </th>

                    <th className="px-5 py-4 text-left">
                      Product
                    </th>

                    <th className="px-5 py-4 text-left">
                      Branch
                    </th>

                    <th className="px-5 py-4 text-left">
                      Type
                    </th>

                    <th className="px-5 py-4 text-left">
                      Quantity
                    </th>

                    <th className="px-5 py-4 text-left">
                      Reference
                    </th>

                    <th className="px-5 py-4 text-left">
                      Performed By
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {movements.map((movement) => (
                    <tr
                      key={movement.id}
                      className="border-t"
                    >
                      <td className="px-5 py-4 text-sm">
                        {movement.date}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {movement.product}
                      </td>

                      <td className="px-5 py-4">
                        {movement.branch}
                      </td>

                      <td className="px-5 py-4">
                        <MovementBadge
                          type={movement.type}
                        />
                      </td>

                      <td
                        className={`px-5 py-4 font-bold ${
                          movement.quantity < 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {movement.quantity > 0
                          ? "+"
                          : ""}
                        {movement.quantity}{" "}
                        {movement.unit}
                      </td>

                      <td className="px-5 py-4">
                        {movement.reference}
                      </td>

                      <td className="px-5 py-4">
                        {movement.performedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* LOW STOCK */}

        {activeTab === "alerts" && (
          <section className="rounded-2xl bg-white shadow-sm">
            <div className="border-b p-5">
              <h2
                className="font-bold"
                style={{
                  color: BRAND.navy,
                }}
              >
                Low Stock Alerts
              </h2>

              <p className="text-sm text-gray-500">
                Products at or below their configured stock threshold.
              </p>
            </div>

            <div className="divide-y">
              {lowStockProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No low-stock products.
                </div>
              ) : (
                lowStockProducts.map((product) => {
                  const stock =
                    branch === "Roysambu"
                      ? product.roysambuStock
                      : product.rangauStock;

                  return (
                    <div
                      key={product.id}
                      className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"
                    >
                      <div>
                        <h3 className="font-bold">
                          {product.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {product.sku} ·{" "}
                          {product.category}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-red-600">
                          {stock} {product.unit}
                        </p>

                        <p className="text-xs text-gray-500">
                          Threshold:{" "}
                          {product.lowStockThreshold}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}
      </main>

      {/* ADD STOCK MODAL */}

      {showStockModal && selectedProduct && (
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
                  backgroundColor: BRAND.orange,
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
                Branch
              </p>

              <p className="font-bold">
                {branch}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Current Stock
              </p>

              <p className="font-bold">
                {branch === "Roysambu"
                  ? selectedProduct.roysambuStock
                  : selectedProduct.rangauStock}{" "}
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
              placeholder="e.g. New supplier delivery"
            />
          </div>
        </Modal>
      )}

      {/* ADJUSTMENT MODAL */}

      {showAdjustmentModal && selectedProduct && (
        <Modal
          title={`Stock Adjustment — ${selectedProduct.name}`}
          onClose={() =>
            setShowAdjustmentModal(false)
          }
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setShowAdjustmentModal(false)
                }
                className="rounded-xl border px-5 py-3"
              >
                Cancel
              </button>

              <button
                onClick={adjustStock}
                className="rounded-xl px-5 py-3 font-semibold text-white"
                style={{
                  backgroundColor: BRAND.orange,
                }}
              >
                Save Adjustment
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Adjustment Type
              </label>

              <select
                value={adjustmentForm.type}
                onChange={(e) =>
                  setAdjustmentForm((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
                className="w-full rounded-xl border px-4 py-3"
              >
                <option value="ADD">
                  Add Stock
                </option>

                <option value="REMOVE">
                  Remove Stock
                </option>
              </select>
            </div>

            <Input
              label={`Quantity (${selectedProduct.unit})`}
              type="number"
              step="0.001"
              value={adjustmentForm.quantity}
              onChange={(value) =>
                setAdjustmentForm((prev) => ({
                  ...prev,
                  quantity: value,
                }))
              }
            />

            <Input
              label="Reason"
              value={adjustmentForm.reason}
              onChange={(value) =>
                setAdjustmentForm((prev) => ({
                  ...prev,
                  reason: value,
                }))
              }
              placeholder="Explain why stock is being adjusted"
            />
          </div>
        </Modal>
      )}

      {/* TRANSFER MODAL */}

      {showTransferModal && (
        <Modal
          title="Transfer Stock Between Branches"
          onClose={() =>
            setShowTransferModal(false)
          }
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setShowTransferModal(false)
                }
                className="rounded-xl border px-5 py-3"
              >
                Cancel
              </button>

              <button
                onClick={transferStock}
                className="rounded-xl px-5 py-3 font-semibold text-white"
                style={{
                  backgroundColor: BRAND.orange,
                }}
              >
                Transfer Stock
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            {!selectedProduct && (
              <div className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700">
                Select a product from the inventory table before
                transferring stock.
              </div>
            )}

            {selectedProduct && (
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Product
                </p>

                <p className="font-bold">
                  {selectedProduct.name}
                </p>

                <p className="text-sm text-gray-500">
                  {selectedProduct.sku}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Source Branch
                </label>

                <select
                  value={
                    transferForm.sourceBranch
                  }
                  onChange={(e) =>
                    setTransferForm((prev) => ({
                      ...prev,
                      sourceBranch:
                        e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border px-4 py-3"
                >
                  <option>Roysambu</option>
                  <option>Rangau</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Destination Branch
                </label>

                <select
                  value={
                    transferForm.destinationBranch
                  }
                  onChange={(e) =>
                    setTransferForm((prev) => ({
                      ...prev,
                      destinationBranch:
                        e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border px-4 py-3"
                >
                  <option>Roysambu</option>
                  <option>Rangau</option>
                </select>
              </div>
            </div>

            {selectedProduct && (
              <div className="grid grid-cols-2 gap-4">
                <Info
                  label="Roysambu Stock"
                  value={`${selectedProduct.roysambuStock} ${selectedProduct.unit}`}
                />

                <Info
                  label="Rangau Stock"
                  value={`${selectedProduct.rangauStock} ${selectedProduct.unit}`}
                />
              </div>
            )}

            <Input
              label={`Transfer Quantity${
                selectedProduct
                  ? ` (${selectedProduct.unit})`
                  : ""
              }`}
              type="number"
              step="0.001"
              value={transferForm.quantity}
              onChange={(value) =>
                setTransferForm((prev) => ({
                  ...prev,
                  quantity: value,
                }))
              }
            />

            <Input
              label="Transfer Reason"
              value={transferForm.reason}
              onChange={(value) =>
                setTransferForm((prev) => ({
                  ...prev,
                  reason: value,
                }))
              }
              placeholder="e.g. Rangau branch stock replenishment"
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

      <p className="mt-2 text-2xl font-bold text-gray-900">
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

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>
    </div>
  );
}

function MovementBadge({ type }) {
  const labels = {
    SALE: "SALE",
    STOCK_IN: "STOCK IN",
    TRANSFER_IN: "TRANSFER IN",
    TRANSFER_OUT: "TRANSFER OUT",
    ADJUSTMENT_IN: "ADJUSTMENT IN",
    ADJUSTMENT_OUT: "ADJUSTMENT OUT",
  };

  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
      {labels[type] || type}
    </span>
  );
}